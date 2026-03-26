import test from 'node:test'
import assert from 'node:assert/strict'
import { createAlova } from 'alova'
import {
  applyBearerToken,
  AUTH_REFRESH_META,
  AUTH_VISITOR_META,
  shouldRefreshTokenOnSuccess,
  shouldRefreshTokenOnError,
} from '../../src/api/core/token-auth.js'

test('token auth meta keeps visitor and refresh roles explicit', () => {
  assert.deepEqual(AUTH_VISITOR_META, { authRole: 'visitor' })
  assert.deepEqual(AUTH_REFRESH_META, { authRole: 'refreshToken' })
})

test('refreshes protected request errors on 401 or 403', () => {
  assert.equal(
    shouldRefreshTokenOnError({ code: 401 }, '/valuation-api/positions'),
    true,
  )
  assert.equal(
    shouldRefreshTokenOnError({ statusCode: 403 }, '/tools-api/report'),
    true,
  )
})

test('does not refresh oauth visitor endpoints or non-auth errors', () => {
  assert.equal(
    shouldRefreshTokenOnError({ code: 401 }, '/shixi-api/oauth/token'),
    false,
  )
  assert.equal(
    shouldRefreshTokenOnError({ code: 500 }, '/valuation-api/positions'),
    false,
  )
})

test('refreshes protected success-path responses when adapter returns 401 payload', () => {
  assert.equal(
    shouldRefreshTokenOnSuccess({ statusCode: 401 }, '/valuation-api/positions'),
    true,
  )
  assert.equal(
    shouldRefreshTokenOnSuccess({ statusCode: 403 }, '/tools-api/report'),
    true,
  )
  assert.equal(
    shouldRefreshTokenOnSuccess({ statusCode: 401 }, '/shixi-api/oauth/token'),
    false,
  )
})

test('protected request retries automatically after refresh succeeds', async () => {
  // 当前 node 测试 tsconfig 对 alova/client 的类型出口识别不稳定，这里改成运行时导入来验证真实行为。
  const { createServerTokenAuthentication } = await import('alova/client') as any

  let accessToken = 'expired-token'
  let protectedAttempts = 0
  let refreshAttempts = 0

  const { onAuthRequired, onResponseRefreshToken } = createServerTokenAuthentication({
    visitorMeta: AUTH_VISITOR_META,
    assignToken(method: any) {
      method.config.headers ||= {}
      if (accessToken) {
        applyBearerToken(method.config.headers, accessToken)
      }
    },
    refreshTokenOnError: {
      metaMatches: AUTH_REFRESH_META,
      isExpired(error: unknown, method: { url?: string }) {
        return shouldRefreshTokenOnError(error, `${method?.url || ''}`)
      },
      async handler() {
        throw new Error('refreshTokenOnError should not run for adapter success responses')
      },
    },
    refreshTokenOnSuccess: {
      metaMatches: AUTH_REFRESH_META,
      isExpired(response: { statusCode?: number }, method: { url?: string }) {
        return shouldRefreshTokenOnSuccess(response, `${method?.url || ''}`)
      },
      async handler(_error: unknown, method: any) {
        const refreshed = await method.context.Post('/oauth/token/refresh', {
          refresh_token: 'refresh-token',
        }, {
          meta: AUTH_REFRESH_META,
        }).send()
        accessToken = refreshed.access_token
      },
    },
  })

  const alova = createAlova({
    requestAdapter(elements) {
      return {
        response: async () => {
          if (elements.url === '/oauth/token/refresh') {
            refreshAttempts += 1
            return {
              statusCode: 200,
              data: {
                access_token: 'fresh-token',
                refresh_token: 'fresh-refresh-token',
                token_type: 'Bearer',
                expires_in: 604800,
              },
            }
          }

          if (elements.url === '/valuation-api/positions') {
            protectedAttempts += 1
            if (elements.headers.Authorization === 'Bearer fresh-token') {
              return {
                statusCode: 200,
                data: {
                  code: 0,
                  data: { recovered: true },
                },
              }
            }
            return {
              statusCode: 401,
              data: {
                msg: 'expired',
              },
            }
          }

          throw new Error(`unexpected url: ${elements.url}`)
        },
        headers: async () => ({}),
        abort: () => {},
      }
    },
    beforeRequest: onAuthRequired((method: any) => {
      method.config.headers ||= {}
    }),
    responded: onResponseRefreshToken({
      onSuccess(response: any) {
        if (response.statusCode >= 400) {
          throw { code: response.statusCode }
        }
        return response.data
      },
      onError(error: unknown) {
        throw error
      },
    }),
  })

  const result = await alova.Get('/valuation-api/positions')

  assert.deepEqual(result, {
    code: 0,
    data: { recovered: true },
  })
  assert.equal(protectedAttempts, 2)
  assert.equal(refreshAttempts, 1)
})
