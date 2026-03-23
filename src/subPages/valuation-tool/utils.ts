import type {
  ApiEnvelope,
  DiscoveryFundValuation,
  ExchangeFundQuotePayload,
  FundDetailServiceResponse,
  FundExchangeQuote,
  FundIntraday,
  FundMarketType,
  FundMetricsServiceResponse,
  FundRealtimeDataServiceResponse,
  FundResult,
  FundResultStatus,
  PortfolioFundOption,
  PortfolioPosition,
  PortfolioPositionMetrics,
  PortfolioPreviewState,
  PortfolioRecognitionDraft,
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

export function createValuationHomePath() {
  return '/subPages/valuation-tool/index'
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

export function createHoldingsSyncPath() {
  return '/subPages/valuation-tool/holdings-sync'
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

export function buildPortfolioPositionFromSnapshot(
  fund: Pick<PortfolioFundOption, 'code' | 'name' | 'estimatedNav'>,
  holdingAmount: string | number,
  holdingProfit: string | number,
) {
  const currentNav = Number(fund.estimatedNav)
  const holdingAmountValue = Number(holdingAmount)
  const holdingProfitValue = Number(holdingProfit)

  if (!currentNav || Number.isNaN(currentNav))
    return { error: '当前估值暂不可用，暂时无法保存持仓' as const }

  if (!holdingAmountValue || Number.isNaN(holdingAmountValue))
    return { error: '请填写当前持有金额' as const }

  if (Number.isNaN(holdingProfitValue))
    return { error: '请填写当前持有收益' as const }

  const sharesValue = holdingAmountValue / currentNav
  const costAmountValue = holdingAmountValue - holdingProfitValue
  const costNavValue = costAmountValue / sharesValue

  if (!sharesValue || !costNavValue || costAmountValue <= 0) {
    return { error: '输入的持有金额和持有收益不合理，请检查后再试' as const }
  }

  return {
    position: {
      code: fund.code,
      name: fund.name,
      shares: sharesValue,
      costNav: costNavValue,
    } satisfies Omit<PortfolioPosition, 'id'>,
  }
}

export function getRecognitionDraftStatusMeta(draft: Pick<PortfolioRecognitionDraft, 'code' | 'holdingAmount' | 'holdingProfit' | 'status' | 'issue'>) {
  if (draft.status === 'failed') {
    return {
      status: 'failed' as const,
      issue: draft.issue || '识别失败，请重新上传或改为手动录入。',
    }
  }

  const holdingAmountValue = Number(draft.holdingAmount)
  const holdingProfitValue = Number(draft.holdingProfit)

  if (!draft.code) {
    return {
      status: 'needs_fund_match' as const,
      issue: draft.issue || '未能唯一匹配基金，请重新确认基金。',
    }
  }

  if (!draft.holdingAmount || Number.isNaN(holdingAmountValue) || Number.isNaN(holdingProfitValue)) {
    return {
      status: 'needs_review' as const,
      issue: draft.issue || '金额或收益识别不完整，请补充后再导入。',
    }
  }

  return {
    status: 'ready' as const,
    issue: '',
  }
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

export function mapExchangeQuote(quote?: ExchangeFundQuotePayload | null): FundExchangeQuote | undefined {
  if (!quote)
    return undefined

  const currentPrice = toFiniteNumber(quote.currentPrice)
  const priceChangeRatio = toFiniteNumber(quote.priceChangeRatio)
  const premiumRate = toFiniteNumber(quote.premiumRate)

  if (currentPrice === null && priceChangeRatio === null && premiumRate === null)
    return undefined

  return {
    currentPrice,
    priceChangeRatio,
    premiumRate,
    updateTime: formatCurrentTime(),
    source: 'realtime',
    explanation: `当前场内价格 ${formatMetricNumber(currentPrice, 3)}，场内涨幅 ${formatPercent(priceChangeRatio)}，折溢价率 ${formatPercent(premiumRate)}。场内基金波动更贴近盘中成交，适合结合溢价率一起看。`,
  }
}

export function isApiSuccess<T>(response?: ApiEnvelope<T> | null) {
  return response?.code === 0
}

export function isApiNotFound<T>(response?: ApiEnvelope<T> | null) {
  return response?.code === 404
}

export function mapFundDetailToResult(
  detail?: FundDetailServiceResponse | null,
  metrics?: FundMetricsServiceResponse | null,
  realtimeData?: FundRealtimeDataServiceResponse | null,
): FundResult | undefined {
  if (!detail?.code || !detail.name)
    return undefined

  return {
    status: 'ok',
    code: detail.code,
    name: detail.name,
    tags: buildFundTags(detail),
    foundDate: detail.foundDate || undefined,
    channelLabel: detail.channel === 'EXCHANGE' ? '场内基金' : '场外基金',
    subCategoryLabel: normalizeSubCategoryLabel(detail.subCategoryId),
    intraday: mapFundRealtimeDataToIntraday(realtimeData),
    quickFacts: metrics
      ? {
          oneMonthReturn: formatRatioToPercent(metrics.return1m),
          maxDrawdown: formatDrawdownPercent(metrics.maxDrawdown),
          feeRate: formatUnsignedRatioToPercent(metrics.feeRate),
        }
      : undefined,
    definition: buildFundDefinition(detail),
    targetIndex: detail.benchmark || '暂无基准信息',
    marketCoverage: detail.channel === 'EXCHANGE' ? '场内交易' : '场外申赎',
    disclaimer: '以上内容仅供理解参考，不构成投资建议，买入前仍请结合自身风险承受能力判断。',
  }
}

export function mapFundRealtimeDataToIntraday(realtimeData?: FundRealtimeDataServiceResponse | null): FundIntraday | undefined {
  if (!realtimeData || realtimeData.channel !== 'OTC')
    return undefined

  const ratio = readRealtimeDataYieldChange(realtimeData)
  const nav = toFiniteNumber(realtimeData.nav)
  const navChange = readRealtimeDataNavChange(realtimeData)

  if (ratio === null && nav === null && navChange === null)
    return undefined

  return {
    value: ratio === null ? 0 : ratio * 100,
    unit: '%',
    updateTime: formatCurrentTime(),
    source: 'estimate',
    explanation: `当前参考净值约为 ${formatMetricNumber(nav, 4)}，较上一交易日净值变动 ${formatSignedNumber(navChange || 0, 4)}，对应盘中参考涨跌 ${formatSignedNumber((ratio || 0) * 100, 2)}%。`,
  }
}

export function mapFundRealtimeToValuation(
  detail?: Pick<FundDetailServiceResponse, 'code' | 'name'> | null,
  realtimeData?: FundRealtimeDataServiceResponse | null,
): DiscoveryFundValuation | undefined {
  if (!detail?.code || !detail.name || !realtimeData || realtimeData.channel !== 'OTC')
    return undefined

  const nav = toFiniteNumber(realtimeData.nav)
  const navChange = readRealtimeDataNavChange(realtimeData)
  const ratio = readRealtimeDataYieldChange(realtimeData)

  if (nav === null || navChange === null || ratio === null)
    return undefined

  return {
    code: detail.code,
    name: detail.name,
    offChangeNetValue: navChange,
    valuation: nav,
    ratio,
  }
}

export function mapFundRealtimeDataToExchangeQuote(
  realtimeData?: FundRealtimeDataServiceResponse | null,
): FundExchangeQuote | undefined {
  if (!realtimeData || realtimeData.channel !== 'EXCHANGE')
    return undefined

  const currentPrice = toFiniteNumber(realtimeData.nav)
  const premiumRate = toFiniteNumber(realtimeData.premium_rate)
  const priceChangeRatio = readRealtimeDataYieldChange(realtimeData)

  if (currentPrice === null && premiumRate === null && priceChangeRatio === null)
    return undefined

  return {
    currentPrice,
    priceChangeRatio: priceChangeRatio === null ? null : priceChangeRatio * 100,
    premiumRate: premiumRate === null ? null : premiumRate * 100,
    updateTime: formatCurrentTime(),
    source: 'realtime',
    explanation: `当前参考净值 ${formatMetricNumber(currentPrice, 4)}，盘中参考涨跌 ${formatPercent(priceChangeRatio === null ? null : priceChangeRatio * 100)}，折溢价率 ${formatPercent(premiumRate === null ? null : premiumRate * 100)}。`,
  }
}

function readRealtimeDataYieldChange(realtimeData?: FundRealtimeDataServiceResponse | null) {
  if (!realtimeData)
    return null

  const payload = realtimeData as FundRealtimeDataServiceResponse & {
    yield_change?: number | null
    yieldChange?: number | null
  }

  const numericValue = toFiniteNumber(payload.yield_change ?? payload.yieldChange)
  if (numericValue === null)
    return null

  return Math.abs(numericValue) > 1 ? numericValue / 100 : numericValue
}

function readRealtimeDataNavChange(realtimeData?: FundRealtimeDataServiceResponse | null) {
  if (!realtimeData || realtimeData.channel !== 'OTC')
    return null

  const payload = realtimeData as FundRealtimeDataServiceResponse & {
    nav_change?: number | null
    navChange?: number | null
  }
  const directValue = toFiniteNumber(payload.nav_change ?? payload.navChange)
  if (directValue !== null)
    return directValue

  const nav = toFiniteNumber(realtimeData.nav)
  const ratio = readRealtimeDataYieldChange(realtimeData)
  if (nav === null || ratio === null)
    return null

  if (ratio <= -1)
    return null

  const previousNav = nav / (1 + ratio)
  return nav - previousNav
}

function formatCurrentTime() {
  const currentDate = new Date()
  const hours = `${currentDate.getHours()}`.padStart(2, '0')
  const minutes = `${currentDate.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

export function formatCurrentTimeLabel() {
  return formatCurrentTime()
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

export function formatMetricNumber(value?: number | null, fractionDigits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  return Number(value).toFixed(fractionDigits)
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

export function formatCurrencyNoSign(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  return Number(value).toFixed(2)
}

export function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  const numericValue = Number(value)
  const sign = numericValue > 0 ? '+' : ''
  return `${sign}${numericValue.toFixed(2)}%`
}

export function inferFundMarketType(result?: Pick<FundResult, 'name' | 'tags' | 'code'> | null): FundMarketType {
  const tagText = `${result?.name || ''} ${(result?.tags || []).join(' ')} ${(result?.code || '')}`

  if (/联接|场外/.test(tagText))
    return 'otc'

  if (/ETF|LOF|场内/.test(tagText))
    return 'exchange'

  return 'otc'
}

export function inferMarketTypeFromChannel(channel?: string | null): FundMarketType {
  return channel === 'EXCHANGE' ? 'exchange' : 'otc'
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
  const previousAmount = totalAmount - (hasTodayProfit ? totalTodayProfit : 0)
  const updateTime = metrics.find(item => item.updateTime)?.updateTime || ''

  return {
    totalProfit,
    totalProfitRate: totalCost > 0 ? (totalProfit / totalCost) * 100 : null,
    todayProfit: hasTodayProfit ? totalTodayProfit : null,
    todayChangeRate: hasTodayProfit && previousAmount > 0 ? (totalTodayProfit / previousAmount) * 100 : null,
    totalAmount,
    holdingCount: metrics.length,
    updateTime,
  }
}

export function getPortfolioUnavailableState(): PortfolioUnavailableState {
  return {
    title: '当前暂无实时估值数据',
    description: '今日盈亏和实时估值暂时不可用，但你仍可以查看持仓和累计收益信息。',
    hint: '可稍后再查看盘中参考，最终以基金净值披露为准。',
  }
}

function toFiniteNumber(value: unknown) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

function formatRatioToPercent(value?: number | null) {
  const numericValue = toFiniteNumber(value)
  if (numericValue === null)
    return undefined
  const sign = numericValue > 0 ? '+' : ''
  return `${sign}${(numericValue * 100).toFixed(2)}%`
}

function formatDrawdownPercent(value?: number | null) {
  const numericValue = toFiniteNumber(value)
  if (numericValue === null)
    return undefined
  return `${Math.abs(numericValue * 100).toFixed(2)}%`
}

function formatUnsignedRatioToPercent(value?: number | null) {
  const numericValue = toFiniteNumber(value)
  if (numericValue === null)
    return undefined
  return `${Math.abs(numericValue * 100).toFixed(2)}%`
}

function buildFundTags(detail: FundDetailServiceResponse) {
  const tags = new Set<string>()

  tags.add(detail.channel === 'EXCHANGE' ? '场内基金' : '场外基金')

  const subCategoryLabel = normalizeSubCategoryLabel(detail.subCategoryId)
  if (subCategoryLabel)
    tags.add(subCategoryLabel)

  return Array.from(tags)
}

function buildFundDefinition(detail: FundDetailServiceResponse) {
  const segments = []
  if (detail.foundDate)
    segments.push(`成立于 ${detail.foundDate}`)
  if (detail.benchmark)
    segments.push(`业绩比较基准为 ${detail.benchmark}`)

  return segments.length
    ? `${segments.join('，')}。`
    : '当前可用信息包含基金名称、代码、交易渠道以及实时参考数据。'
}

function normalizeSubCategoryLabel(value?: string | null) {
  if (!value)
    return ''

  if (value === 'index_enhanced')
    return '指数增强'

  return value
}
