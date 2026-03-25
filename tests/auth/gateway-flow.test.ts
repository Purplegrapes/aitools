import assert from 'node:assert/strict'
import test from 'node:test'

import {
  resolveGatewayFailureAction,
  resolveGatewaySuccessTarget,
} from '../../src/subPages/auth/utils/gateway-flow.js'
import { buildRefererPath, createAuthLoginRoute } from '../../src/subPages/auth/utils/loginGuard.js'
import { detectAccessMode } from '../../src/subPages/auth/utils/sourceDetector.js'

test('h5 external access is detected and failed auth redirects to loginUrl', () => {
  const detection = detectAccessMode({ from: 'h5' })
  assert.deepEqual(detection, { mode: 'external', source: 'h5' })

  const result = resolveGatewayFailureAction({
    source: detection.source,
    loginUrl: 'https://example.com/login',
    referrer: 'https://example.com/tools/demo',
  })

  assert.deepEqual(result, {
    type: 'external-h5',
    url: 'https://example.com/login',
  })
})

test('internal unauthenticated flow redirects to auth login with encoded referrer', () => {
  const referrer = buildRefererPath('/subPages/valuation-tool/watchlist', {
    foo: 'bar',
  })

  assert.deepEqual(createAuthLoginRoute(referrer), {
    navType: 'replace',
    path: '/subPages/auth/login',
    query: {
      referrer: encodeURIComponent('/subPages/valuation-tool/watchlist?foo=bar'),
    },
  })

  const result = resolveGatewayFailureAction({
    source: 'internal',
    loginUrl: '',
    referrer,
  })

  assert.deepEqual(result, {
    type: 'auth-login',
    route: {
      navType: 'replace',
      path: '/subPages/auth/login',
      query: {
        referrer: encodeURIComponent('/subPages/valuation-tool/watchlist?foo=bar'),
      },
    },
    toastMessage: '登录状态校验失败，请重新登录',
  })
})

test('gateway success target prefers external url when referrer is a full website url', () => {
  const result = resolveGatewaySuccessTarget('https://example.com/tools/demo?foo=1')

  assert.deepEqual(result, {
    type: 'browser',
    url: 'https://example.com/tools/demo?foo=1',
  })
})

test('gateway success target falls back to index page when referrer is empty', () => {
  const result = resolveGatewaySuccessTarget('')

  assert.deepEqual(result, {
    type: 'route',
    path: '/pages/index/index',
  })
})
