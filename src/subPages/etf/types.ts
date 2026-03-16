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
  fundType?: string
  establishDate?: string
  custodian?: string
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
  indexCode?: string
  code?: string
  pe?: number
  pb?: number
  dividend_yield?: number
  roe?: number
  profit_yield?: number
  pe_percent_r5y?: number
  pe_percent_r10y?: number
  pb_percent_r5y?: number
  pb_percent_r10y?: number
  valuation_status?: number
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
    pe_trends?: Array<{ time: string, pe: number }>
    pb_trends?: Array<{ time: string, pb: number }>
  }
}

/**
 * 估值趋势点
 */
export interface ValuationTrendPoint {
  time: string
  name: string
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

// ==================== 基金简况相关类型 ====================

/**
 * 基金经理信息
 */
export interface FundManager {
  name: string // 姓名
  avatar?: string // 头像URL
  education?: string // 学历
  experience?: number // 从业年限（年）
  manageAssets?: number // 管理规模（元）
  manageFunds?: number // 在管基金数量
  startDate?: string // 管理该基金起始日期
  intro?: string // 简介
}

/**
 * 核心指标数据
 */
export interface CoreIndicators {
  // 规模指标
  netAssets?: number // 净资产
  dailyTurnover?: number // 日成交额

  // 业绩指标
  return1w?: number // 近1周收益率
  return1m?: number // 近1月收益率
  return3m?: number // 近3月收益率
  return6m?: number // 近6月收益率
  return1y?: number // 近1年收益率
  return3y?: number // 近3年收益率
  returnYtd?: number // 年初至今收益率

  // 估值指标
  pe?: number // 市盈率
  pb?: number // 市净率
  dividendYield?: number // 股息率
  profitYield?: number // 盈利收益率

  // 风险指标
  volatility?: number // 波动率
  maxDrawdown?: number // 最大回撤
  sharpeRatio?: number // 夏普比率
}

/**
 * 资产配置项
 */
export interface AssetAllocation {
  name: string // 资产类别/行业/股票名称
  value: number // 金额/占比
  percentage?: number // 百分比
  color?: string // 图表颜色
}

/**
 * 资产结构数据
 */
export interface AssetStructure {
  assetAllocation: AssetAllocation[] // 资产大类配置
  industryAllocation?: AssetAllocation[] // 行业配置
  topHoldings?: AssetAllocation[] // 前十大持仓
}

/**
 * 基金基础信息（简况页扩展）
 */
export interface FundBasicInfo {
  code: string // 基金代码
  name: string // 基金全称
  fundType?: string // 基金类型
  establishDate?: string // 成立日期
  company?: string // 基金公司
  custodian?: string // 托管人
  manageFeeRatio?: number // 管理费率
  custodianFeeRatio?: number // 托管费率
  trackIndexName?: string // 跟踪指数
}
