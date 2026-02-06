/**
 * TAMP 子包独立 API 接口
 * API 前缀: /tamp-api
 */
import { alovaInstance } from '@/api/core/instance'

export * from './marketing'

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
 * 获取 TAMP 数据
 * @param params 查询参数
 */
export function getTampData(params?: Record<string, any>) {
  return alovaInstance.Get('/tamp-api/data', {
    params,
  })
}

// ==================== 商铺相关 API ====================
/**
 * 获取商铺信息
 * @param params 商铺参数
 * @param options 额外选项
 */
export function getShopInfo({
  params,
  options,
}: {
  // 店铺ID
  params: { shopId: string }
  options?: { [key: string]: unknown }
} = { params: { shopId: '' } }) {
  const { shopId } = params

  return alovaInstance.Get(`/app-api/shop/info/${shopId}`, {
    ...(options || {}),
  })
}
