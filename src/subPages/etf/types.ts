/**
 * ETF 相关类型定义
 */

/**
 * 类型守卫：检查是否为 ApiResponse
 */
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null && 'data' in value
}

/**
 * 类型守卫：检查是否为 ValuationDetailData
 */
export function isValuationDetailData(value: unknown): value is ValuationDetailData {
  return typeof value === 'object' && value !== null && 'result_code' in value
}

/**
 * 类型守卫：检查是否为数组
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * ETF 基本信息
 */
export interface EtfInfo {
  code: string
  name: string
  danjuanId: string
  trackIndexCode: string
  trackIndexName: string
  categoryCode: string
  watchList?: boolean
  fundNetAssets?: number
  manageFeeRatio?: number
  custodianFeeRatio?: number
  company?: string
  investIdea?: string
}

/**
 * 实时行情数据
 */
export interface RealtimeData {
  code: string
  currentPrice?: number
  priceChangeRatio?: number
  premiumRate?: number
  tradeAmount?: number
  tradeAmountIntraDay?: number
  tradeInfo?: {
    status: boolean
  }
}

/**
 * 估值数据
 */
export interface ValuationData {
  index_code: string
  pe?: number
  pb?: number
  dividend_yield?: number
  roe?: number
  profit_yield?: number
  pe_percent_r5y?: number
  pe_percent_r10y?: number
  pb_percent_r5y?: number
  pb_percent_r10y?: number
}

/**
 * 业绩数据响应
 */
export interface PerformanceData {
  f_mkt_return_1w?: Record<string, number>
  f_mkt_return_1m?: Record<string, number>
  f_mkt_return_3m?: Record<string, number>
  f_mkt_return_6m?: Record<string, number>
  f_mkt_return_1y?: Record<string, number>
  f_mkt_return_3y?: Record<string, number>
}

/**
 * 分类数据
 */
export interface CategoryData {
  code: string
  name: string
}

/**
 * 因子暴露数据
 */
export interface FactorExposureData {
  dates: string[]
  factorExposures: Array<{
    factorCode: string
    values: number[]
  }>
}

/**
 * 实时分钟行情数据
 */
export interface RealtimeLineItem {
  timestamp: string
  currentPrice: number
  tradeAmountIntraDay?: number
}

/**
 * 历史行情数据点
 */
export interface QuotationDataPoint {
  name: string
  value: [string, number]
  f_mkt_close_price?: number
  f_mkt_close_price_adj?: number
  f_mkt_amount?: number
  f_mkt_day_yield?: number
}

/**
 * ETF 详情数据
 */
export interface EtfDetailData {
  code: string
  name: string
  currentPrice?: number
  premiumRate?: number
  fundNetAssets?: number
  tradeAmountIntraDay?: number
  riseFall?: number
  yearRiseFall?: number
  investIdea?: string
}

/**
 * 估值详情数据
 */
export interface ValuationDetailData {
  result_code?: number
  data?: {
    pe?: number
    pb?: number
    dividend_yield?: number
    roe?: number
    pe_trends?: Array<{ time: string; pe: number }>
    pb_trends?: Array<{ time: string; pb: number }>
  }
}

/**
 * 估值趋势点
 */
export interface ValuationTrendPoint {
  time: string
  value: [string, number]
}

/**
 * Wot Tabs 组件事件参数
 */
export interface WotTabEvent {
  name: string
}

/**
 * Wot Segmented 组件选项
 */
export interface SegmentedOption {
  label: string
  value: string
  key: string
}

/**
 * ECharts Tooltip 参数
 */
export interface EChartsTooltipParam {
  name: string
  value: number | string | unknown
  data?: Record<string, unknown>
  axisValue?: string
  [key: string]: unknown
}

/**
 * ECharts Tooltip 参数数组（用于估值图表）
 */
export interface EChartsTooltipParams {
  [key: number]: EChartsTooltipParam
  name?: string
  axisValue?: string
}

/**
 * API 响应基础类型
 */
export interface ApiResponse<T = unknown> {
  success?: boolean
  data?: T
  msg?: string
  error?: {
    message?: string
    code?: number
  }
}

/**
 * Factor value API 响应
 */
export interface FactorValueResponse {
  f_mkt_return_1w?: Record<string, number>
  f_mkt_return_1m?: Record<string, number>
  f_mkt_return_3m?: Record<string, number>
  f_mkt_return_6m?: Record<string, number>
  f_mkt_return_1y?: Record<string, number>
  f_mkt_return_3y?: Record<string, number>
}

/**
 * Valuation detail API 响应
 */
export interface ValuationDetailResponse {
  data?: {
    valuations?: ValuationData[]
  }
}

/**
 * 类型守卫：检查是否为 ValuationDetailResponse
 */
export function isValuationDetailResponse(value: unknown): value is ValuationDetailResponse {
  if (!isApiResponse(value))
    return false
  return typeof value.data === 'undefined' || (
    typeof value.data === 'object'
    && value.data !== null
    && ('valuations' in value.data || !('data' in value.data))
  )
}

/**
 * 类型守卫：检查是否为包含 data.data 结构的估值详情响应
 */
export function isNestedValuationDetailResponse(value: unknown): value is ApiResponse & {
  data?: {
    data?: {
      valuations?: ValuationData[]
    }
  }
} {
  if (!isApiResponse(value))
    return false
  if (typeof value.data !== 'object' || value.data === null)
    return false
  const nested = value.data as { data?: unknown }
  if (typeof nested.data !== 'object' || nested.data === null)
    return false
  return true
}
