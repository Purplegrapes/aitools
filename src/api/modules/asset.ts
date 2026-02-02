/**
 * 资产相关 API 接口
 * 连接到 https://shixi.betalpha.com
 */
import { assetAlovaInstance } from '../core/instance'

/**
 * 获取资产详情
 * @param code 资产代码
 */
export function getAssetDetail(code: string) {
  return assetAlovaInstance.Get(`/api/assets/${code}/detail`)
}

/**
 * 获取因子历史数据（股息率走势）
 * @param params 查询参数
 */
export function getFactorHistory(params: {
  start_date: string
  end_date: string
  codes: string
  factors: string
}) {
  return assetAlovaInstance.Get('/api/assets/factors', {
    params,
  })
}
