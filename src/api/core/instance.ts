import type { TokenResponseDto } from '@/subPages/auth/api/types'
import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
import { createServerTokenAuthentication } from 'alova/client'
import vueHook from 'alova/vue'
import cookie from 'js-cookie'
import { useEtfUserStore } from '@/store/etfUserStore'
import mockAdapter from '../mock/mockAdapter'
import { handleAlovaError, handleAlovaResponse } from './handlers'
import {
  applyBearerToken,
  AUTH_REFRESH_META,
  AUTH_VISITOR_META,
  shouldRefreshTokenOnError,
  shouldRefreshTokenOnSuccess,
} from './token-auth'

/**
 * 获取主 API 基础 URL
 */
function getMainBaseURL(): string {
  // #ifdef H5
  return '' // H5 环境使用 Vite 代理
  // #endif
  // #ifndef H5
  return import.meta.env.VITE_API_BASE_URL || ''
  // #endif
}

/**
 * 获取资产 API 基础 URL
 */
function getCommonBaseURL(): string {
  // #ifdef H5
  return '' // H5 环境使用 Vite 代理
  // #endif
  // #ifndef H5
  return import.meta.env.VITE_COMMON_API_BASE_URL
  // #endif
}

/**
 * 获取 TAMP API 基础 URL
 */
function getTampBaseURL(): string {
  // #ifdef H5
  return '' // H5 环境使用 Vite 代理
  // #endif
  // #ifndef H5
  return import.meta.env.VITE_TAMP_API_BASE_URL || ''
  // #endif
}

/**
 * 获取 Tools API 基础 URL
 */
function getToolsBaseURL(): string {
  // #ifdef H5
  return ''
  // #endif
  // #ifndef H5
  return import.meta.env.VITE_TOOLS_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || ''
  // #endif
}

function getValuationBaseURL(): string {
  // #ifdef H5
  return ''
  // #endif
  // #ifndef H5
  return import.meta.env.VITE_TOOLS_API_BASE_URL
  // #endif
}

/**
 * 获取存储的 token
 */
function getToken(): string {
  try {
    const etfUserStore = uni.getStorageSync('etfUser')
    if (etfUserStore) {
      return etfUserStore.token || ''
    }
  }
  catch {
    return ''
  }
  return ''
}

/**
 * 获取存储的 refresh token
 */
function getRefreshToken(): string {
  try {
    const etfUserStore = uni.getStorageSync('etfUser')
    if (etfUserStore) {
      return etfUserStore.refreshToken || ''
    }
  }
  catch {
    return ''
  }
  return ''
}

function ensureMethodHeaders(method: {
  config: {
    headers?: Record<string, unknown>
    params?: Record<string, unknown> | string
  }
}) {
  if (!method.config.headers) {
    method.config.headers = {}
  }

  return method.config.headers
}

function requestRefreshToken(refreshToken: string): Promise<TokenResponseDto> {
  return new Promise((resolve, reject) => {
    if (!refreshToken) {
      reject(new Error('missing refresh token'))
      return
    }

    const header: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    let refreshUrl = '/shixi-api/oauth/token/refresh'
    // #ifndef H5
    refreshUrl = `${getCommonBaseURL()}/api/oauth/token/refresh`
    // #endif

    uni.request({
      url: refreshUrl,
      method: 'POST',
      data: {
        refresh_token: refreshToken,
      },
      header,
      success: (response) => {
        const { statusCode, data } = response as UniNamespace.RequestSuccessCallbackResult
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`refresh request failed: ${statusCode}`))
          return
        }
        const payload = (data as any)?.data || data || {}
        const nextAccessToken = payload?.access_token || payload?.token || ''

        if (!nextAccessToken || typeof nextAccessToken !== 'string') {
          reject(new Error('refresh token response missing access_token'))
          return
        }
        resolve({
          access_token: nextAccessToken,
          refresh_token: payload?.refresh_token || refreshToken,
          token_type: payload?.token_type || 'Bearer',
          expires_in: payload?.expires_in || 0,
        })
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

function resolveRequestToken(url: string) {
  if (url.startsWith('/app-api')) {
    return cookie.get('ticket') || ''
  }

  if ((url.startsWith('/api') || url.startsWith('/djapi') || url.startsWith('/shixi-api'))) {
    return getToken()
  }

  return ''
}

function rewriteRequestUrl(method: {
  url: string
}) {
  if (method.url.startsWith('/app-api')) {
    const tampBaseURL = getTampBaseURL()
    if (tampBaseURL) {
      // #ifndef H5
      method.url = `${tampBaseURL}${method.url}`
      // #endif
    }
    return
  }

  if (method.url.startsWith('/tools-api')) {
    const toolsBaseURL = getToolsBaseURL()
    if (toolsBaseURL) {
      // #ifndef H5
      method.url = `${toolsBaseURL}${method.url}`
      // #endif
    }
    return
  }

  if (method.url.startsWith('/valuation-api')) {
    const valuationBaseURL = getValuationBaseURL()
    if (valuationBaseURL) {
      // #ifndef H5
      method.url = `${valuationBaseURL}${method.url.replace(/^\/valuation-api/, '')}`
      // #endif
    }
    return
  }

  if (method.url.startsWith('/shixi-api')) {
    const authBaseURL = getCommonBaseURL()
    if (authBaseURL) {
      // #ifndef H5
      method.url = `${authBaseURL}${method.url.replace(/^\/shixi-api/, '/api')}`
      // #endif
    }
  }
}

const { onAuthRequired, onResponseRefreshToken } = createServerTokenAuthentication({
  visitorMeta: AUTH_VISITOR_META,
  assignToken(method) {
    const token = resolveRequestToken(method.url)
    if (!token)
      return

    applyBearerToken(ensureMethodHeaders(method), token)
  },
  refreshTokenOnError: {
    metaMatches: AUTH_REFRESH_META,
    isExpired(error, method) {
      return shouldRefreshTokenOnError(error, `${method?.url || ''}`)
    },
    async handler(error, method) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        return handleAlovaError(error, method)
      }

      try {
        const refreshedToken = await requestRefreshToken(refreshToken)
        const userStore = useEtfUserStore()
        userStore.setAuthTokens(refreshedToken.access_token, refreshedToken.refresh_token)
      }
      catch {
        return handleAlovaError(error, method)
      }
    },
  },
  refreshTokenOnSuccess: {
    metaMatches: AUTH_REFRESH_META,
    isExpired(response, method) {
      return shouldRefreshTokenOnSuccess(response as { statusCode?: number }, `${method?.url || ''}`)
    },
    async handler(_response) {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new Error('missing refresh token')
      }

      const refreshedToken = await requestRefreshToken(refreshToken)
      const userStore = useEtfUserStore()
      userStore.setAuthTokens(refreshedToken.access_token, refreshedToken.refresh_token)
    },
  },
})

export const alovaInstance = createAlova({
  baseURL: getMainBaseURL(),
  ...AdapterUniapp({
    mockRequest: mockAdapter,
  }),
  statesHook: vueHook,
  beforeRequest: onAuthRequired((method) => {
    ensureMethodHeaders(method)
    rewriteRequestUrl(method)

    // Add content type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method.type)) {
      method.config.headers['Content-Type'] = 'application/json'
    }

    // Add timestamp to prevent caching for GET requests
    if (method.type === 'GET' && CommonUtil.isObj(method.config.params)) {
      method.config.params._t = Date.now()
    }

    // Log request in development
    if (import.meta.env.MODE === 'development') {
      let apiType = '[Main API]'
      if (method.url.includes('/api/assets') || method.url.startsWith('/shixi-api'))
        apiType = '[Asset API]'
      else if (method.url.startsWith('/tamp-api') || method.url.startsWith('/app-api'))
        apiType = '[TAMP API]'
      else if (method.url.startsWith('/shixi-api'))
        apiType = '[Auth API]'
      else if (method.url.startsWith('/tools-api'))
        apiType = '[Tools API]'
      else if (method.url.startsWith('/valuation-api'))
        apiType = '[Valuation API]'

      console.log(`${apiType} Request] ${method.type} ${method.url}`, method.data || method.config.params)
      console.log(`[Environment] ${import.meta.env.VITE_ENV_NAME}`)
    }
  }),

  // Response handlers
  responded: onResponseRefreshToken({
    // Success handler
    onSuccess: handleAlovaResponse,

    // Error handler
    onError: handleAlovaError,

    // Complete handler - runs after success or error
    onComplete: async () => {
      // Any cleanup or logging can be done here
    },
  }),

  // Default request timeout (60 seconds)
  timeout: 60000,
  // 设置为null即可全局关闭全部请求缓存
  cacheFor: null,
})

export default alovaInstance
