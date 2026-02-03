/**
 * 食息指南子包独立 API 接口
 * 使用主 alova 实例，根据 URL 前缀自动匹配资产 API 服务器
 */
import { alovaInstance } from '@/api/core/instance'

/**
 * 获取资产详情
 * @param code 资产代码
 */
export function getAssetDetail(code: string) {
  return alovaInstance.Get(`/shixi-guide/assets/${code}/detail`)
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
  return alovaInstance.Get('/shixi-guide/assets/factors', {
    params,
  })
}

// 导出类型供页面使用
export type * from '../types'
