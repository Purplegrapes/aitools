import type {
  DiscoveryFundValuation,
  FundIntraday,
  FundResultStatus,
  PortfolioPosition,
  PortfolioPositionMetrics,
  PortfolioPreviewState,
  PortfolioSummary,
  PortfolioUnavailableState,
} from './types'

export function normalizeKeyword(value: unknown) {
  if (typeof value !== 'string')
    return ''

  try {
    return decodeURIComponent(value).trim()
  }
  catch {
    return value.trim()
  }
}

export function createSearchPath(keyword: string) {
  return `/subPages/valuation-tool/search?q=${encodeURIComponent(keyword.trim())}`
}

export function createResultPath(code: string) {
  return `/subPages/valuation-tool/result?code=${encodeURIComponent(code)}`
}

export function createWatchlistPath() {
  return '/subPages/valuation-tool/watchlist'
}

export function createHoldingsPath() {
  return '/subPages/valuation-tool/holdings'
}

export function createHoldingsAddPath() {
  return '/subPages/valuation-tool/holdings-add'
}

export function createHoldingsEditPath(id: string) {
  return `/subPages/valuation-tool/holdings-edit?id=${encodeURIComponent(id)}`
}

export function createHoldingsUploadPath() {
  return '/subPages/valuation-tool/holdings-upload'
}

export function createMineScanPath(code: string) {
  return `/subPages/valuation-tool/mine-scan?code=${encodeURIComponent(code)}`
}

export function isFundResultStatus(value: unknown): value is FundResultStatus {
  return value === 'ok' || value === 'not_found' || value === 'missing_value' || value === 'loading'
}

export function formatIntradayValue(intraday?: FundIntraday) {
  if (!intraday)
    return '--'

  const sign = intraday.value > 0 ? '+' : ''
  return `${sign}${intraday.value.toFixed(2)}${intraday.unit}`
}

export function getIntradayTone(intraday?: FundIntraday) {
  if (!intraday || intraday.value === 0)
    return 'text-primary'
  return intraday.value > 0 ? 'text-danger' : 'text-success'
}

export function mapValuationToIntraday(valuation?: DiscoveryFundValuation | null): FundIntraday | undefined {
  if (!valuation)
    return undefined

  const intradayRatio = Number(valuation.ratio)
  const estimatedValue = Number(valuation.valuation)
  const netValueChange = Number(valuation.offChangeNetValue)

  if ([intradayRatio, estimatedValue, netValueChange].some(Number.isNaN))
    return undefined

  return {
    value: intradayRatio * 100,
    unit: '%',
    updateTime: formatCurrentTime(),
    source: 'estimate',
    explanation: `当前估算净值约为 ${estimatedValue.toFixed(4)}，较上一交易日净值变动 ${formatSignedNumber(netValueChange, 4)}，对应今日估算涨跌 ${formatSignedNumber(intradayRatio * 100, 2)}%。`,
  }
}

function formatCurrentTime() {
  const currentDate = new Date()
  const hours = `${currentDate.getHours()}`.padStart(2, '0')
  const minutes = `${currentDate.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatSignedNumber(value: number, fractionDigits: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(fractionDigits)}`
}

export function formatDailyChange(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  const numericValue = Number(value)
  const sign = numericValue > 0 ? '+' : ''
  return `${sign}${numericValue.toFixed(2)}%`
}

export function getDailyChangeTone(value?: number | null) {
  if (value === null || value === undefined || Number(value) === 0)
    return 'text-primary'
  return Number(value) > 0 ? 'text-danger' : 'text-success'
}

export function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  const numericValue = Number(value)
  const sign = numericValue > 0 ? '+' : ''
  return `${sign}${numericValue.toFixed(2)}`
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  const numericValue = Number(value)
  const sign = numericValue > 0 ? '+' : ''
  return `${sign}${numericValue.toFixed(2)}%`
}

export function getPortfolioValueTone(value?: number | null) {
  if (value === null || value === undefined || Number(value) === 0)
    return 'text-primary'
  return Number(value) > 0 ? 'text-danger' : 'text-success'
}

export function isPortfolioPreviewState(value: unknown): value is PortfolioPreviewState {
  return value === 'default' || value === 'loading' || value === 'data-unavailable'
}

export function createPositionId(position: Pick<PortfolioPosition, 'code' | 'shares' | 'costNav'>) {
  return `${position.code}-${position.shares}-${position.costNav}-${Date.now()}`
}

export function buildPortfolioSummary(metrics: PortfolioPositionMetrics[]): PortfolioSummary {
  const totalProfit = metrics.reduce((sum, item) => sum + item.cumulativeProfit, 0)
  const totalAmount = metrics.reduce((sum, item) => sum + item.currentAmount, 0)
  const totalCost = metrics.reduce((sum, item) => sum + item.costAmount, 0)
  const totalTodayProfit = metrics.reduce((sum, item) => sum + (item.todayProfit ?? 0), 0)
  const hasTodayProfit = metrics.some(item => item.todayProfit !== null)

  return {
    totalProfit,
    totalProfitRate: totalCost > 0 ? (totalProfit / totalCost) * 100 : null,
    todayProfit: hasTodayProfit ? totalTodayProfit : null,
    totalAmount,
    holdingCount: metrics.length,
  }
}

export function getPortfolioUnavailableState(): PortfolioUnavailableState {
  return {
    title: '当前暂无实时估值数据',
    description: '今日盈亏和实时估值暂时不可用，但你仍可以查看持仓和累计收益信息。',
    hint: '可稍后再查看盘中参考，最终以基金净值披露为准。',
  }
}
