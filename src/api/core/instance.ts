import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import cookie from 'js-cookie'
import { useEtfUserStore } from '@/store/etfUserStore'
import mockAdapter from '../mock/mockAdapter'
import { handleAlovaError, handleAlovaResponse } from './handlers'

// ========== Token刷新锁机制 ==========
// 刷新请求锁，防止并发刷新
const _refreshLock = { isRefreshing: false }

export function isRefreshing() {
  return _refreshLock.isRefreshing
}

export function setRefreshing(value: boolean) {
  _refreshLock.isRefreshing = value
}

// 等待刷新的请求队列
let refreshSubscribers: Array<(token: string) => void> = []

/**
 * 将请求加入刷新等待队列
 */
export function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

/**
 * 通知队列中的请求token已刷新
 */
export function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}
// ========== Token刷新锁机制结束 ==========

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

function isAuthOAuthPath(url: string) {
  return url.includes('/shixi-api/oauth/') || url.includes('/api/oauth/')
}

function isRefreshRetryableError(error: any) {
  return Boolean(
    (error && typeof error.code === 'number' && (error.code === 401 || error.code === 403))
    || (error && typeof error.statusCode === 'number' && (error.statusCode === 401 || error.statusCode === 403)),
  )
}

function requestRefreshToken(refreshToken: string): Promise<string> {
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
        const nextRefreshToken = payload?.refresh_token || refreshToken

        if (!nextAccessToken || typeof nextAccessToken !== 'string') {
          reject(new Error('refresh token response missing access_token'))
          return
        }

        const userStore = useEtfUserStore()
        userStore.setAuthTokens(nextAccessToken, nextRefreshToken)
        resolve(nextAccessToken)
      },
      fail: (error) => {
        reject(error)
      },
    })
  })
}

async function ensureTokenRefreshed() {
  const refreshToken = getRefreshToken()
  if (!refreshToken)
    throw new Error('missing refresh token')

  if (isRefreshing()) {
    return new Promise<string>((resolve, reject) => {
      subscribeTokenRefresh((token) => {
        if (token)
          resolve(token)
        else
          reject(new Error('refresh token failed'))
      })
    })
  }

  setRefreshing(true)
  try {
    const newToken = await requestRefreshToken(refreshToken)
    onTokenRefreshed(newToken)
    return newToken
  }
  catch (error) {
    onTokenRefreshed('')
    throw error
  }
  finally {
    setRefreshing(false)
  }
}

export const alovaInstance = createAlova({
  baseURL: getMainBaseURL(),
  ...AdapterUniapp({
    mockRequest: mockAdapter,
  }),
  statesHook: vueHook,
  beforeRequest: (method) => {
    let token = ''

    const isAuthOAuthRequest = method.url.startsWith('/shixi-api/oauth/')

    // ETF/API 鉴权请求走本地 token（auth oauth 公共接口除外）
    if ((method.url.startsWith('/api') || method.url.startsWith('/djapi') || method.url.startsWith('/shixi-api'))
      && !isAuthOAuthRequest) {
      token = getToken()
    }

    // TAMP API 走 tampStore token， 从同一个域名下的cookie中获取
    if (method.url.startsWith('/app-api')) {
      token = cookie.get('ticket')
    }
    if (method.url.startsWith('/shixi-api')) {
      const assetBaseURL = getCommonBaseURL()
      if (assetBaseURL) {
        // 在非 H5 环境，需要设置完整 URL 来覆盖 Alova 的 baseURL
        // #ifndef H5
        const path = method.url.replace('/shixi-api', '/api')
        method.url = `${assetBaseURL}${path}`
        // #endif
        // #ifdef H5
        // H5 环境由代理处理，保持 URL 不变
        // #endif
      }
    }

    // TAMP API 使用不同的 baseURL
    if (method.url.startsWith('/app-api')) {
      const tampBaseURL = getTampBaseURL()
      if (tampBaseURL) {
        // #ifndef H5
        method.url = `${tampBaseURL}${method.url}`
        // #endif
        // #ifdef H5
        // H5 环境由代理处理，保持 URL 不变
        // #endif
      }
    }

    if (method.url.startsWith('/tools-api')) {
      const toolsBaseURL = getToolsBaseURL()
      if (toolsBaseURL) {
        // #ifndef H5
        method.url = `${toolsBaseURL}${method.url}`
        // #endif
        // #ifdef H5
        // H5 环境由代理处理，保持 URL 不变
        // #endif
      }
    }

    if (method.url.startsWith('/valuation-api')) {
      const valuationBaseURL = getValuationBaseURL()
      if (valuationBaseURL) {
        // #ifndef H5
        method.url = `${valuationBaseURL}${method.url.replace(/^\/valuation-api/, '')}`
        // #endif
        // #ifdef H5
        // H5 环境由代理处理，保持 URL 不变
        // #endif
      }
    }

    // Auth API 固定走独立服务
    if (method.url.startsWith('/shixi-api')) {
      const authBaseURL = getCommonBaseURL()
      if (authBaseURL) {
        // #ifndef H5
        method.url = `${authBaseURL}${method.url.replace(/^\/shixi-api/, '/api')}`
        // #endif
        // #ifdef H5
        // H5 环境由代理处理，保持 URL 不变
        // #endif
      }
    }

    // 添加 token 到请求头（Bearer 认证）
    if (token) {
      const trimmedToken = token.trim()
      method.config.headers.Authorization = trimmedToken.startsWith('Bearer ')
        ? trimmedToken
        : `Bearer ${trimmedToken}`
    }

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
  },

  // Response handlers
  responded: {
    // Success handler
    onSuccess: handleAlovaResponse,

    // Error handler
    onError: async (error, method) => {
      const methodRef = method as any
      const requestUrl = `${method?.url || ''}`
      const alreadyRetried = Boolean(methodRef.__refreshRetried)
      const shouldTryRefresh = isRefreshRetryableError(error)
        && !alreadyRetried
        && !isAuthOAuthPath(requestUrl)

      if (shouldTryRefresh) {
        try {
          await ensureTokenRefreshed()
          methodRef.__refreshRetried = true
          if (typeof methodRef.send === 'function') {
            return await methodRef.send()
          }
        }
        catch {
          // refresh 失败后走统一错误处理（登出/提示/外跳）
        }
      }

      return handleAlovaError(error, method)
    },

    // Complete handler - runs after success or error
    onComplete: async () => {
      // Any cleanup or logging can be done here
    },
  },

  // Default request timeout (60 seconds)
  timeout: 60000,
  // 设置为null即可全局关闭全部请求缓存
  cacheFor: null,
})

export default alovaInstance
