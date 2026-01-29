/**
 * ETF 详情页配置
 */

/**
 * Tab 配置
 */
export const tabs = [
  { label: '行情', name: 'quotation' },
  { label: '估值', name: 'valuation' },
] as const

export type TabValue = typeof tabs[number]['name']

/**
 * 分段选择器配置
 */
export const segmentedList = {
  quotation: [
    { label: '日内', value: '日内', key: 'day' },
    { label: '1年', value: '1年', key: 'year1' },
    { label: '3年', value: '3年', key: 'year3' },
    { label: '全部', value: '全部', key: 'all' },
  ],
  valuation: [
    { label: '1年', value: '1年', key: 'year1' },
    { label: '3年', value: '3年', key: 'year3' },
    { label: '全部', value: '全部', key: 'all' },
  ],
} as const

/**
 * 表格列配置
 */
export interface Column {
  props: string
  label?: string
  width?: number
  fixed?: boolean
  align?: string
  show?: boolean
  format?: (value: any) => string
}

export const columns: Record<TabValue, Column[]> = {
  quotation: [
    { props: 'premiumRate', label: '折溢价率', width: 70, format: v => formatPercentage(v) },
    { props: 'fundNetAssets', label: '净资产(亿)', width: 80, format: v => v?.toFixed(2) || '--' },
    { props: 'tradeAmountIntraDay', label: '成交额', width: 70, format: v => formatAssets(v) },
    { props: 'riseFall', label: '涨跌幅', width: 60, format: v => formatPercentage(v) },
  ],
  valuation: [
    { props: 'roe', label: 'ROE(%)', width: 60, format: v => v?.toFixed(2) || '--' },
    { props: 'dividend_yield', label: '股息率(%)', width: 80, format: v => v?.toFixed(2) || '--' },
  ],
}

// 引入格式化函数
function formatPercentage(value: number | string | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const num = Number(value)
  if (Number.isNaN(num))
    return '--'
  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

function formatAssets(value: number | string | undefined): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const num = Number(value)
  if (Number.isNaN(num))
    return '--'
  if (num >= 10000 && num < 100000000)
    return `${(num / 10000).toFixed(2)}万`
  if (num >= 100000000)
    return `${(num / 100000000).toFixed(2)}亿`
  return num.toFixed(2)
}
