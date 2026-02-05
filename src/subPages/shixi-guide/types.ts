/**
 * 资产详情页类型定义
 */

/**
 * 资产基本信息
 */
export interface AssetDetail {
  code: string
  name: string
  asset_type: string
  risk_level: string
  dividend_rate: number
  fund_nav_unit: number
  management_company: string
  establishment_date: string
  fund_manager: string
  monthly_dividend_investment: number
  description: string
  updated_at: string
}

/**
 * 食息率历史数据点
 */
export interface DividendRatePoint {
  date: string
  dividend_rate: number | null
}

/**
 * 因子历史响应项
 */
export interface FactorHistoryItem {
  code: string
  date: string
  factors: DividendRatePoint[]
}

/**
 * API 因子历史响应
 */
export interface ApiFactorHistoryResponse {
  data: FactorHistoryItem[]
  total: number
}

/**
 * 因子历史响应
 */
export interface FactorHistoryResponse {
  data: FactorHistoryItem[]
  total: number
}

/**
 * 时间范围选项
 */
export type TimeRange = '1w' | '1m' | '1q'

/**
 * 时间范围配置
 */
export interface TimeRangeConfig {
  value: TimeRange
  label: string
  days: number
}

/**
 * 图表数据点
 */
export interface ChartDataPoint {
  name: string
  value: [string, number | null]
  dividend_rate: number | null
}

/**
 * 余额宝 Mock 数据点（用于对比）
 */
export interface YuEBaoPoint {
  date: string
  rate: number
}
