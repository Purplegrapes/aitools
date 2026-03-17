export type FundResultStatus = 'ok' | 'not_found' | 'missing_value' | 'loading'
export type RequestDisplayState = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface MarketSentiment {
  updateTime: string
  temperature: number
  label: string
  level: 'freezing' | 'cool' | 'neutral' | 'hot'
  description: string
}

export interface HotSearchFund {
  rank: number
  code: string
  name: string
  tag: string
}

export interface FundSearchItem {
  code: string
  name: string
  tags: string[]
  summary: string
  todayTag?: string
}

export interface FundIntraday {
  value: number
  unit: string
  updateTime: string
  source: 'estimate' | 'realtime' | 'mock'
  explanation: string
}

export interface DiscoveryFundValuation {
  code: string
  name: string
  offChangeNetValue: number
  valuation: number
  ratio: number
}

export interface FundQuickFacts {
  maxDrawdown: string
  drawdownExplanation: string
  sharpeRatio?: string
  sharpeEvaluation?: string
  calmarRatio?: string
  calmarEvaluation?: string
}

export interface FundResult {
  status: FundResultStatus
  code?: string
  name?: string
  tags?: string[]
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
  msg: string
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
  dailyChange: number | null
  updateTime?: string
  watchlisted: boolean
}

export interface ValuationWatchlistMutationInput {
  code: string
  name?: string
  dailyChange?: number | null
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
  totalAmount: number
  holdingCount: number
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
