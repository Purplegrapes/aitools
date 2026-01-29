/**
 * 格式化百分比（用于表格显示，不乘以100）
 */
function formatPercentage(value: unknown, decimals = 2): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const num = Number(value)
  if (Number.isNaN(num))
    return '--'
  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

/**
 * 格式化资产规模（亿）
 */
export function formatAssets(value: number | null | undefined): string {
  if (value === null || value === undefined)
    return '-'
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)}亿`
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`
  }
  return value.toFixed(2)
}

/**
 * 导航栏配置
 */
export const navbar = [
  { name: 'quotation', label: '行情' },
  { name: 'valuation', label: '估值' },
  { name: 'performance', label: '业绩' },
  { name: 'rate', label: '费率' },
]

/**
 * 固定列定义（公共列）
 */
export function fixedColumns() {
  return [
    {
      props: 'optional',
      label: '',
      width: 30,
      fixed: true,
      align: 'center',
      show: true,
    },
    {
      props: 'name',
      label: 'ETF名称',
      width: 80,
      fixed: true,
      show: true,
    },
    {
      props: 'code',
      label: 'ETF代码',
      width: 80,
      fixed: true,
      show: true,
    },
  ]
}

/**
 * 行情表格列定义（不含固定列）
 */
export function quotationColumnsOnly(show: boolean) {
  return [
    {
      props: 'trackIndexName',
      label: '跟随指数',
      width: 100,
      show: true,
    },
    {
      props: 'currentPrice',
      label: '最新价',
      width: 80,
      align: 'flex-end',
      show,
    },
    {
      props: 'priceChangeRatio',
      label: '日涨跌幅',
      width: 100,
      align: 'flex-end',
      format: formatPercentage,
      show,
    },
    {
      props: 'fundNetAssets',
      label: '规模',
      width: 80,
      align: 'flex-end',
      format: formatAssets,
      show: true,
    },
    {
      props: 'tradeAmount',
      label: '成交额',
      width: 80,
      align: 'flex-end',
      format: formatAssets,
      show: true,
    },
    {
      props: 'premiumRate',
      label: '折溢价率',
      width: 100,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
  ]
}

/**
 * 估值表格列定义（不含固定列）
 */
export function valuationColumnsOnly() {
  return [
    {
      props: 'profit_yield',
      label: '盈利收益率',
      width: 110,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'pe',
      label: '市盈率',
      width: 80,
      align: 'flex-end',
      show: true,
    },
    {
      props: 'pb',
      label: '市净率',
      width: 80,
      align: 'flex-end',
      show: true,
    },
    {
      props: 'dividend_yield',
      label: '股息率',
      width: 80,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'roe',
      label: 'ROE',
      width: 80,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'pe_percent_r5y',
      label: '近五年市盈率分位数',
      width: 140,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'pe_percent_r10y',
      label: '近十年市盈率分位数',
      width: 140,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'pb_percent_r5y',
      label: '近五年市净率分位数',
      width: 140,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'pb_percent_r10y',
      label: '近十年市净率分位数',
      width: 140,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
  ]
}

/**
 * 业绩表格列定义（不含固定列）
 */
export function performanceColumnsOnly() {
  return [
    {
      props: 'f_mkt_return_1w',
      label: '近1周收益率',
      width: 110,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'f_mkt_return_1m',
      label: '近1个月收益率',
      width: 120,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'f_mkt_return_3m',
      label: '近3个月收益率',
      width: 120,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'f_mkt_return_6m',
      label: '近6个月收益率',
      width: 120,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'f_mkt_return_1y',
      label: '近1年收益率',
      width: 110,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'f_mkt_return_3y',
      label: '近3年收益率',
      width: 110,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
  ]
}

/**
 * 费率表格列定义（不含固定列）
 */
export function rateColumnsOnly() {
  return [
    {
      props: 'manageFeeRatio',
      label: '管理费',
      width: 100,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'custodianFeeRatio',
      label: '托管费',
      width: 100,
      align: 'flex-end',
      format: formatPercentage,
      show: true,
    },
    {
      props: 'company',
      label: '基金公司',
      width: 150,
      show: true,
    },
  ]
}

/**
 * 行情表格列定义（完整）
 */
export function quotationColumns(show: boolean) {
  return [...quotationColumnsOnly(show)]
}

/**
 * 估值表格列定义（完整）
 */
export function valuationColumns() {
  return [...valuationColumnsOnly()]
}

/**
 * 业绩表格列定义（完整）
 */
export function performanceColumns() {
  return [...performanceColumnsOnly()]
}

/**
 * 费率表格列定义（完整）
 */
export function rateColumns() {
  return [...rateColumnsOnly()]
}

/**
 * 合并所有表格列（用于完整展示）
 * @param show 是否显示行情列
 */
export function mergeAllColumns(show: boolean) {
  return [
    ...fixedColumns(),
    ...quotationColumnsOnly(show),
    ...valuationColumnsOnly(),
    ...performanceColumnsOnly(),
    ...rateColumnsOnly(),
  ]
}

/**
 * 计算每个 tab 的滚动位置（px）
 */
export function calculateTabScrollPositions(show: boolean) {
  // 固定列总宽度: optional(50) + name(120) + code(100) = 270
  const fixedWidth = 190

  // 行情列宽度总和
  const quotationWidth = quotationColumnsOnly(show)
    .filter(col => col.show !== false)
    .reduce((sum, col) => sum + (col.width || 100), 0)

  // 估值列宽度总和
  const valuationWidth = valuationColumnsOnly()
    .filter(col => col.show !== false)
    .reduce((sum, col) => sum + (col.width || 100), 0)

  // 业绩列宽度总和
  const performanceWidth = performanceColumnsOnly()
    .filter(col => col.show !== false)
    .reduce((sum, col) => sum + (col.width || 100), 0)

  return {
    quotation: 0,
    valuation: fixedWidth + quotationWidth,
    performance: fixedWidth + quotationWidth + valuationWidth,
    rate: fixedWidth + quotationWidth + valuationWidth + performanceWidth,
  }
}

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
  format?: (value: unknown) => string
}

/**
 * 格式化数字
 */
function formatNumber(value: unknown, decimals = 2): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const num = Number(value)
  if (Number.isNaN(num))
    return '--'
  return num.toFixed(decimals)
}

export const columns: Record<TabValue, Column[]> = {
  quotation: [
    { props: 'premiumRate', label: '折溢价率', width: 70, format: v => formatPercentage(v) },
    { props: 'fundNetAssets', label: '净资产(亿)', width: 80, format: v => formatNumber(v) },
    { props: 'tradeAmountIntraDay', label: '成交额', width: 70, format: v => formatAssets(v as number | null | undefined) },
    { props: 'riseFall', label: '涨跌幅', width: 60, format: v => formatPercentage(v) },
  ],
  valuation: [
    { props: 'roe', label: 'ROE(%)', width: 60, format: v => formatNumber(v) },
    { props: 'dividend_yield', label: '股息率(%)', width: 80, format: v => formatNumber(v) },
  ],
}
