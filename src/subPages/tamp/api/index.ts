/**
 * TAMP 子包独立 API 接口
 * API 前缀: /tamp-api
 */
import { alovaInstance } from '@/api/core/instance'

// ==================== 外部认证相关 API ====================
/**
 * 通过code换取token（小程序跳转H5场景）
 * @param params 认证参数
 */
export function tokenByCode(params: {
  code: string
  appId?: string
}) {
  return alovaInstance.Post('/api/v1/auth/token-by-code', params)
}

/**
 * 验证session获取token（H5跳转小程序场景）
 * @param params 认证参数
 */
export function tokenBySession(params: {
  sessionId: string
}) {
  return alovaInstance.Post('/api/v1/auth/token-by-session', params)
}

/**
 * 刷新token
 * @param params 刷新参数
 */
export function refreshToken(params: {
  refreshToken: string
}) {
  return alovaInstance.Post('/api/v1/auth/refresh', params)
}

/**
 * 获取 TAMP 数据
 * @param params 查询参数
 */
export function getTampData(params?: Record<string, any>) {
  return alovaInstance.Get('/tamp-api/data', {
    params,
  })
}
