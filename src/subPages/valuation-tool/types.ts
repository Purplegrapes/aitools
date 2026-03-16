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
  feeRate: string
  feeExplanation: string
  maxDrawdown: string
  drawdownExplanation: string
  oneYearReturn: string
  returnExplanation: string
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
