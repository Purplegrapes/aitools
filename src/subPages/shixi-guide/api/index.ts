/**
 * 食息指南子包独立 API 接口
 * 使用主 alova 实例，根据 URL 前缀自动匹配资产 API 服务器
 */
import { alovaInstance } from '@/api/core/instance'
import { MonthlyDividendPoolCode } from '../types'

/**
 * 获取资产详情
 * @param code 资产代码
 */
export function getAssetDetail(code: string) {
  return alovaInstance.Get(`/shixi-api/assets/${code}/detail`)
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
  return alovaInstance.Get('/shixi-api/assets/factors', {
    params,
  })
}

/**
 * 获取指数列表（资产池）
 * @param poolCode 资产池代码，默认月月分红ETF
 * @param adjustDate 调整日期
 */
export function getAssetPoolData(
  poolCode: MonthlyDividendPoolCode = MonthlyDividendPoolCode.ETF,
  adjustDate?: string,
) {
  const params = adjustDate ? { adjust_date: adjustDate } : undefined

  return alovaInstance.Get(`/shixi-api/asset-pools/${poolCode}/assets`, {
    params,
  })
}

// 导出类型供页面使用
export type * from '../types'
