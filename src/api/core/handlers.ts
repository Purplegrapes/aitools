/*
 * @Author: weisheng
 * @Date: 2025-04-17 15:58:11
 * @LastEditTime: 2025-06-15 21:47:22
 * @LastEditors: weisheng
 * @Description: Alova response and error handlers
 * @FilePath: /wot-starter/src/api/core/handlers.ts
 */
import type { Method } from 'alova'
import { isRefreshing, onTokenRefreshed, setRefreshing, subscribeTokenRefresh } from '@/api/core/instance'
import { refreshToken } from '@/api/modules/auth'
import router from '@/router'
import { useExternalSourceStore } from '@/store/externalSourceStore'
import { useUserStore } from '@/store/userStore'
import { handleExternalRedirect } from '@/utils/externalRedirect'

// Custom error class for API errors
export class ApiError extends Error {
  code: number
  data?: any

  constructor(message: string, code: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

// Define a type for the expected API response structure
interface ApiResponse {
  code: number
  msg?: string
  data?: any
  success?: boolean
  total?: number
  more?: boolean
}

// Handle successful responses
export async function handleAlovaResponse(
  response: UniApp.RequestSuccessCallbackResult | UniApp.UploadFileSuccessCallbackResult | UniApp.DownloadSuccessData,
) {
  const globalToast = useGlobalToast()
  // Extract status code and data from UniApp response
  const { statusCode, data } = response as UniNamespace.RequestSuccessCallbackResult

  // 处理401/403错误
  if ((statusCode === 401 || statusCode === 403)) {
    const userStore = useUserStore()
    const externalSource = useExternalSourceStore()

    // 有refreshToken，尝试刷新
    if (userStore.refreshToken) {
      // 如果正在刷新，将请求加入队列
      if (isRefreshing()) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((_token) => {
            // 重新设置请求头
            resolve(response as any)
          })
        })
      }

      // 开始刷新
      setRefreshing(true)
      try {
        const refreshResult = await refreshToken({ refreshToken: userStore.refreshToken })
        const data = refreshResult as any

        if (data.success || data.data?.accessToken) {
          // 刷新成功，更新token
          userStore.accessToken = data.data.accessToken
          if (data.data.refreshToken) {
            userStore.refreshToken = data.data.refreshToken
          }

          // 通知队列中的请求
          onTokenRefreshed(data.data.accessToken)

          // 注意：由于 Alova 响应处理器的限制，刷新成功后无法自动重试当前请求
          // 队列中的请求会收到通知，下一次请求会使用新 token
          // 调用方需要捕获 'TOKEN_REFRESHED' 错误并决定是否重试
          throw new Error('TOKEN_REFRESHED') // 特殊标记，由调用方重试
        }
        else {
          throw new Error('刷新token失败')
        }
      }
      catch (err: any) {
        // 刷新失败，清除用户信息并跳转
        if (err.message !== 'TOKEN_REFRESHED') {
          await userStore.logout()

          // 根据来源决定跳转
          if (externalSource.isExternal && !externalSource.isExpired) {
            await handleExternalRedirect()
          }
          else {
            globalToast.error({ msg: '登录已过期，请重新登录！', duration: 500 })
            const timer = setTimeout(() => {
              clearTimeout(timer)
              router.replaceAll({ name: 'login' })
            }, 500)
          }
        }
        throw new ApiError('登录已过期，请重新登录！', statusCode, data)
      }
      finally {
        setRefreshing(false)
      }
    }
    // 无refreshToken，直接跳转登录
    else {
      globalToast.error({ msg: '登录已过期，请重新登录！', duration: 500 })
      const timer = setTimeout(() => {
        clearTimeout(timer)
        // 根据来源决定跳转
        if (externalSource.isExternal && !externalSource.isExpired) {
          handleExternalRedirect()
        }
        else {
          router.replaceAll({ name: 'login' })
        }
      }, 500)

      throw new ApiError('登录已过期，请重新登录！', statusCode, data)
    }
  }

  // Handle HTTP error status codes
  if (statusCode >= 400) {
    globalToast.error(`Request failed with status: ${statusCode}`)
    throw new ApiError(`Request failed with status: ${statusCode}`, statusCode, data)
  }

  // The data is already parsed by UniApp adapter
  const json = data as ApiResponse
  console.log('json', json)
  // Log response in development
  if (import.meta.env.MODE === 'development') {
    console.log('[Alova Response]', json)
  }

  // Return data for successful responses
  return json
}

// Handle request errors
export function handleAlovaError(error: any, method: Method) {
  const globalToast = useGlobalToast()
  // Log error in development
  if (import.meta.env.MODE === 'development') {
    console.error('[Alova Error]', error, method)
  }

  // 处理401/403错误（如果不是在handleAlovaResponse中处理的）
  if (error instanceof ApiError && (error.code === 401 || error.code === 403)) {
    // 如果是未授权错误，清除用户信息并跳转到登录页
    globalToast.error({ msg: '登录已过期，请重新登录！', duration: 500 })
    const timer = setTimeout(() => {
      clearTimeout(timer)
      router.replaceAll({ name: 'login' })
    }, 500)
    throw new ApiError('登录已过期，请重新登录！', error.code, error.data)
  }

  // Handle different types of errors
  if (error.name === 'NetworkError') {
    globalToast.error('网络错误，请检查您的网络连接')
  }
  else if (error.name === 'TimeoutError') {
    globalToast.error('请求超时，请重试')
  }
  else if (error instanceof ApiError) {
    globalToast.error(error.message || '请求失败')
  }
  else {
    globalToast.error('发生意外错误')
  }

  throw error
}
