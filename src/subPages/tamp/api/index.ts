/**
 * TAMP 子包业务 API 接口
 */
import { alovaInstance } from '@/api/core/instance'

export * from './marketing'

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
