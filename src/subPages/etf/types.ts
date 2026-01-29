/**
 * ETF 相关类型定义
 */

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
  value: any
  data?: any
  axisValue?: string
  [key: string]: any
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
export interface ApiResponse<T = any> {
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
