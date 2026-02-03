import AdapterUniapp from '@alova/adapter-uniapp'
import { createAlova } from 'alova'
import vueHook from 'alova/vue'
import mockAdapter from '../mock/mockAdapter'
import { handleAlovaError, handleAlovaResponse } from './handlers'

/**
 * 获取主 API 基础 URL
 */
function getMainBaseURL(): string {
  // #ifdef H5
  return '' // H5 环境使用 Vite 代理
  // #endif
  // #ifndef H5
  // @ts-expect-error - 条件编译，非 H5 环境
  const env = import.meta.env as any
  return env.VITE_API_BASE_URL || ''
  // #endif
}

/**
 * 获取资产 API 基础 URL
 */
function getAssetBaseURL(): string {
  // #ifdef H5
  return '' // H5 环境使用 Vite 代理
  // #endif
  // #ifndef H5
  // @ts-expect-error - 条件编译，非 H5 环境
  const env = import.meta.env as any
  return env.VITE_ASSET_API_BASE_URL
  // #endif
}

/**
 * 获取存储的 token
 */
function getToken(): string {
  try {
    const userStore = uni.getStorageSync('user')
    if (userStore && userStore.token) {
      return userStore.token
    }
  }
  catch {
    return ''
  }
  return ''
}

export const alovaInstance = createAlova({
  baseURL: getMainBaseURL(),
  ...AdapterUniapp({
    mockRequest: mockAdapter,
  }),
  statesHook: vueHook,
  beforeRequest: (method) => {
    // 资产 API 使用不同的 baseURL
    // 判断是否需要使用资产 API 服务器
    if (method.url.startsWith('/shixi-guide')) {
      const assetBaseURL = getAssetBaseURL()
      if (assetBaseURL) {
        // 在非 H5 环境，需要设置完整 URL 来覆盖 Alova 的 baseURL
        // #ifndef H5
        const path = method.url.replace('/shixi-guide', '/api')
        method.url = `${assetBaseURL}${path}`
        // #endif
        // #ifdef H5
        // H5 环境由代理处理，保持 URL 不变
        // #endif
      }
    }

    // 从本地存储获取 token
    const token = getToken()

    // 添加 token 到请求头
    if (token) {
      method.config.headers.Authorization = `${token}`
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
    // @ts-expect-error - 条件编译，开发环境
    if (import.meta.env.MODE === 'development') {
      const apiType = method.url.includes('/api/assets') ? '[Asset API]' : '[Main API]'
      console.log(`${apiType} Request] ${method.type} ${method.url}`, method.data || method.config.params)
      // @ts-expect-error - 条件编译，环境变量
      console.log(`[Environment] ${import.meta.env.VITE_ENV_NAME}`)
    }
  },

  // Response handlers
  responded: {
    // Success handler
    onSuccess: handleAlovaResponse,

    // Error handler
    onError: handleAlovaError,

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
