export type FundResultStatus = 'ok' | 'not_found' | 'missing_value' | 'loading'
export type RequestDisplayState = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface MarketSentiment {
  updateTime: string
  temperature: number
  label: string
  level: 'freezing' | 'cool' | 'neutral' | 'hot'
  description: string
}

export interface MarketSentimentServiceResponse {
  score: number
  updatedAt: string
}

export interface HotSearchFund {
  rank: number
  code: string
  name: string
  changeText: string
  changeValue?: number | null
}

export interface HotFundServiceItem {
  rank: number
  code: string
  name?: string | null
  yield: number
}

export interface FundSearchItem {
  code: string
  name: string
  tags: string[]
  summary: string
  todayTag?: string
}

export interface FundSearchServiceItem {
  code: string
  name: string
  channel?: string | null
  subCategoryName?: string | null
}

export interface FavouriteItemServiceResponse {
  code: string
  name: string
}

export interface FavouriteRealtimeItemServiceResponse {
  code: string
  nav: number
  navChange: number
  yieldChange: number
  updateAt?: string | null
  updatedAt?: string | null
  updateTime?: string | null
}

export interface PositionItemServiceResponse {
  code: string
  name: string
  totalAmount: number
  totalProfit: number
  totalProfitRate: number
}

export interface PositionRealtimeItemServiceResponse {
  code: string
  nav: number
  yieldChange: number
}

export interface FundIntraday {
  value: number
  unit: string
  updateTime: string
  source: 'estimate' | 'realtime' | 'mock'
  explanation: string
}

export type FundMarketType = 'exchange' | 'otc'

export interface DiscoveryFundValuation {
  code: string
  name: string
  offChangeNetValue: number
  valuation: number
  ratio: number
}

export interface FundDetailServiceResponse {
  benchmark?: string | null
  channel?: string | null
  code: string
  foundDate?: string | null
  name: string
  subCategoryName?: string | null
}

export interface FundMetricsServiceResponse {
  feeRate?: number | null
  maxDrawdown?: number | null
  return1m?: number | null
}

export interface FundRealtimeDataExchangeResponse {
  channel: 'EXCHANGE'
  nav: number
  premiumRate: number
  yield_change?: number | null
  yieldChange?: number | null
}

export interface FundRealtimeDataOtcResponse {
  channel: 'OTC'
  nav: number
  yield_change: number
  yieldChange?: number | null
  nav_change?: number | null
  navChange?: number | null
}

export type FundRealtimeDataServiceResponse = FundRealtimeDataExchangeResponse | FundRealtimeDataOtcResponse

export interface ExchangeFundQuotePayload {
  currentPrice?: number
  priceChangeRatio?: number
  premiumRate?: number
}

export interface FundExchangeQuote {
  currentPrice: number | null
  priceChangeRatio: number | null
  premiumRate: number | null
  updateTime: string
  source: 'realtime' | 'mock'
  explanation: string
}

export interface FundQuickFacts {
  oneMonthReturn?: string
  maxDrawdown?: string
  feeRate?: string
}

export interface FundResult {
  status: FundResultStatus
  code?: string
  name?: string
  tags?: string[]
  foundDate?: string
  channelLabel?: string
  subCategoryLabel?: string
  intraday?: FundIntraday
  quickFacts?: FundQuickFacts
  definition?: string
  targetIndex?: string
  marketCoverage?: string
  riskDescription?: string
  targetAudience?: string
  disclaimer?: string
  reasonList?: string[]
}

export interface ApiEnvelope<T> {
  code: number
  msg?: string
  message?: string
  data: T
}

export interface SearchResultViewModel extends FundSearchItem {
  todayTag: string
}

export interface DetailStateMeta {
  title: string
  description: string
  primaryAction: string
}

export interface ValuationWatchlistFund {
  code: string
  name: string
  realtimeNav: number | null
  dailyChange: number | null
  updateAt?: string
  updateTime?: string
  watchlisted: boolean
}

export interface ValuationWatchlistMutationInput {
  code: string
  name?: string
  dailyChange?: number | null
  updateAt?: string
  updateTime?: string
}

export type PortfolioPreviewState = 'default' | 'loading' | 'data-unavailable'

export interface PortfolioFundOption {
  code: string
  name: string
  category: string
  tag: string
  estimatedNav: number
  dailyChangeRate: number | null
  statusLabel: '偏强' | '震荡' | '偏弱'
}

export interface PortfolioPosition {
  id: string
  code: string
  name: string
  shares: number
  costNav: number
}

export type PortfolioRecognitionState = 'idle' | 'recognizing' | 'ready' | 'empty' | 'error'
export type PortfolioRecognitionDraftStatus = 'ready' | 'needs_review' | 'needs_fund_match' | 'failed'

export interface PortfolioRecognitionDraft {
  id: string
  sourceImage: string
  name: string
  code?: string
  holdingAmount: string
  holdingProfit: string
  status: PortfolioRecognitionDraftStatus
  issue?: string
}

export interface PortfolioRecognitionResult {
  items: PortfolioRecognitionDraft[]
}

export interface PortfolioPositionMetrics {
  id: string
  code: string
  name: string
  shares: number
  costNav: number
  currentNav: number | null
  currentAmount: number
  costAmount: number
  cumulativeProfit: number
  cumulativeProfitRate: number | null
  todayProfit: number | null
  dailyChangeRate: number | null
  statusLabel: '偏强' | '震荡' | '偏弱'
  note: string
  updateTime: string
}

export interface PortfolioSummary {
  totalProfit: number
  totalProfitRate: number | null
  todayProfit: number | null
  todayChangeRate: number | null
  totalAmount: number
  holdingCount: number
  updateTime: string
}

export interface PortfolioInsight {
  title: string
  description: string
  focusFundName?: string
}

export interface PortfolioUnavailableState {
  title: string
  description: string
  hint: string
}
