import type {
  ApiEnvelope,
  DiscoveryFundValuation,
  FundDetailServiceResponse,
  FundMetricsServiceResponse,
  FundRealtimeDataServiceResponse,
  FundRealtimeServiceResponse,
  FundSearchServiceItem,
  HotFundServiceItem,
  MarketSentimentServiceResponse,
  PortfolioRecognitionDraft,
  PortfolioRecognitionResult,
} from '../types'
import { alovaInstance } from '@/api/core/instance'
import { realtime } from '@/subPages/etf/api'
import { getFallbackPortfolioRecognitionResult } from '../mock'

export function getMarketSentiment() {
  return alovaInstance.Get<ApiEnvelope<MarketSentimentServiceResponse>>('/valuation-api/market-pulse/sentiment')
}

export function getHotSearchFunds() {
  return alovaInstance.Get<ApiEnvelope<{ dataDate: string, items: HotFundServiceItem[] }>>('/valuation-api/market-pulse/hot-funds')
}

export function searchFunds(params: { keyword: string }) {
  return alovaInstance.Post<ApiEnvelope<FundSearchServiceItem[]>>('/valuation-api/funds/search', params)
}

export function getFundResult(code: string) {
  return alovaInstance.Get(`/valuation-api/v1/funds/${code}/result`)
}

export function getFundDetail(code: string) {
  return alovaInstance.Get<ApiEnvelope<FundDetailServiceResponse>>(`/valuation-api/funds/${code}`)
}

export function getFundMetrics(code: string) {
  return alovaInstance.Get<ApiEnvelope<FundMetricsServiceResponse>>(`/valuation-api/funds/${code}/metrics`)
}

export function getFundRealtime(code: string) {
  return alovaInstance.Get<ApiEnvelope<FundRealtimeServiceResponse>>(`/valuation-api/funds/${code}/realtime`)
}

export function getFundRealtimeData(code: string) {
  return alovaInstance.Get<ApiEnvelope<FundRealtimeDataServiceResponse>>(`/valuation-api/funds/${code}/realtime-data`)
}

export function getFundValuation(code: string) {
  return alovaInstance.Get<DiscoveryFundValuation>(`/valuation-api/fund/valuation/${code}`)
}

export function getExchangeFundQuote(code: string) {
  return realtime({
    securityCodes: [code],
    assetType: 'ETF',
  })
}

export function getValuationWatchlist() {
  return alovaInstance.Get('/valuation-api/v1/valuation-tool/watchlist')
}

export function addValuationWatchlist(params: {
  code: string
  name?: string
  dailyChange?: number | null
  updateTime?: string
}) {
  return alovaInstance.Post('/valuation-api/v1/valuation-tool/watchlist', params)
}

export function removeValuationWatchlist(code: string) {
  return alovaInstance.Delete(`/valuation-api/v1/valuation-tool/watchlist/${code}`)
}

export async function recognizePortfolioScreenshots(params: {
  fileNames: string[]
}) {
  const data = getFallbackPortfolioRecognitionResult(params.fileNames)
  return {
    code: 200,
    msg: 'success',
    data,
  } satisfies {
    code: number
    msg: string
    data: PortfolioRecognitionResult
  }
}

export async function confirmRecognizedPortfolioPositions(params: {
  items: PortfolioRecognitionDraft[]
}) {
  return {
    code: 200,
    msg: 'success',
    data: {
      importedCount: params.items.length,
    },
  }
}
