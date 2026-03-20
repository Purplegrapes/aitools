import type {
  ApiEnvelope,
  DiscoveryFundValuation,
  FavouriteItemServiceResponse,
  FavouriteRealtimeItemServiceResponse,
  FundDetailServiceResponse,
  FundMetricsServiceResponse,
  FundRealtimeDataServiceResponse,
  FundSearchServiceItem,
  HotFundServiceItem,
  MarketSentimentServiceResponse,
  PortfolioRecognitionDraft,
  PortfolioRecognitionResult,
  PositionItemServiceResponse,
  PositionRealtimeItemServiceResponse,
} from '../types'
import { alovaInstance } from '@/api/core/instance'
import { getStoredUserId } from '@/subPages/auth/utils/loginGuard'
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

export function getValuationWatchlist(uid: string) {
  return alovaInstance.Get<ApiEnvelope<FavouriteItemServiceResponse[]>>('/valuation-api/favourites', {
    headers: {
      uid,
    },
  })
}

export function getValuationWatchlistRealtime(uid: string) {
  return alovaInstance.Get<ApiEnvelope<FavouriteRealtimeItemServiceResponse[]>>('/valuation-api/favourites/realtime', {
    headers: {
      uid,
    },
  })
}

export function getPortfolioPositions() {
  return alovaInstance.Get<ApiEnvelope<PositionItemServiceResponse[]>>('/valuation-api/positions', {
    headers: {
      uid: getStoredUserId(),
    },
  })
}

export function getPortfolioPositionsRealtime() {
  return alovaInstance.Get<ApiEnvelope<PositionRealtimeItemServiceResponse[]>>('/valuation-api/positions/realtime', {
    headers: {
      uid: getStoredUserId(),
    },
  })
}

export function addPortfolioPosition(params: {
  fundCode: string
  holdingAmount: number
  holdingProfit: number
}) {
  return alovaInstance.Post<ApiEnvelope<string>>('/valuation-api/positions', params, {
    headers: {
      uid: getStoredUserId(),
    },
  })
}

export function addValuationWatchlist(params: {
  uid: string
  code: string
  name?: string
  dailyChange?: number | null
  updateTime?: string
}) {
  return alovaInstance.Post<ApiEnvelope<string>>('/valuation-api/favourites', {
    code: params.code,
  }, {
    headers: {
      uid: params.uid,
    },
  })
}

export function removeValuationWatchlist(code: string, uid: string) {
  return alovaInstance.Delete<ApiEnvelope<string>>(
    `/valuation-api/favourites/${code}`,
    undefined,
    {
      headers: {
        uid,
      },
    },
  )
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
