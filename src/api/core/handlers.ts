/*
 * @Author: weisheng
 * @Date: 2025-04-17 15:58:11
 * @LastEditTime: 2025-06-15 21:47:22
 * @LastEditors: weisheng
 * @Description: Alova response and error handlers
 * @FilePath: /wot-starter/src/api/core/handlers.ts
 */
import type { Method } from 'alova'
import { useEtfUserStore } from '@/store/etfUserStore'
import { useTampStore } from '@/store/tampStore'
import { handleExternalRedirect } from '@/subPages/auth/utils/externalRedirect'
import { shouldShowErrorToast } from './token-auth'
import { resolveUnauthorizedFollowUp } from './unauthorized-flow'

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
  method?: Method,
) {
  // Extract status code and data from UniApp response
  const { statusCode, data } = response as UniNamespace.RequestSuccessCallbackResult

  // 401/403 统一交由 onError 链路处理（可在上层执行 refresh token 后重试）
  if ((statusCode === 401 || statusCode === 403)) {
    throw new ApiError('登录已过期，请重新登录！', statusCode, data)
  }

  // Handle HTTP error status codes
  if (statusCode >= 400) {
    if (shouldShowErrorToast(method)) {
      const globalToast = useGlobalToast()
      globalToast.error(`Request failed with status: ${statusCode}`)
    }
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
export async function handleAlovaError(error: any, method: Method) {
  const globalToast = useGlobalToast()
  // Log error in development
  if (import.meta.env.MODE === 'development') {
    console.error('[Alova Error]', error, method)
  }

  // 处理401/403错误（如果不是在handleAlovaResponse中处理的）
  if (error instanceof ApiError && (error.code === 401 || error.code === 403)) {
    const userStore = useEtfUserStore()
    const tampStore = useTampStore()
    const followUp = resolveUnauthorizedFollowUp({
      methodUrl: method.url || '',
      errorMessage: error.message || '登录已过期，请重新登录！',
      isExternal: tampStore.isExternal,
      source: tampStore.source,
      loginUrl: tampStore.loginUrl,
    })
    await userStore.logout()
    if (followUp.shouldToast) {
      globalToast.error({ msg: error.message || '登录已过期，请重新登录！', duration: 500 })
    }
    if (followUp.externalRedirect) {
      await handleExternalRedirect(followUp.externalRedirect.source, followUp.externalRedirect.loginUrl)
    }
    throw error
  }

  // Handle different types of errors
  if (error.name === 'NetworkError') {
    if (shouldShowErrorToast(method)) {
      globalToast.error('网络错误，请检查您的网络连接')
    }
  }
  else if (error.name === 'TimeoutError') {
    if (shouldShowErrorToast(method)) {
      globalToast.error('请求超时，请重试')
    }
  }
  else if (error instanceof ApiError) {
    if (shouldShowErrorToast(method)) {
      globalToast.error(error.message || '请求失败')
    }
  }
  else {
    if (shouldShowErrorToast(method)) {
      globalToast.error('发生意外错误')
    }
  }

  throw error
}
