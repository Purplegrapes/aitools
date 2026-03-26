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
import { parsePortfolioImportImageResponse } from '../image-import.js'

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

export function removePortfolioPosition(fundCode: string) {
  return alovaInstance.Delete<ApiEnvelope<string>>(
    `/valuation-api/positions/${encodeURIComponent(fundCode)}`,
    undefined,
    {
      headers: {
        uid: getStoredUserId(),
      },
    },
  )
}

export function importPortfolioPositionsFromImage(filePath: string) {
  const uid = getStoredUserId()
  if (!uid)
    throw new Error('当前缺少用户信息，请重新登录后再试。')

  return new Promise<ApiEnvelope<string>>((resolve, reject) => {
    uni.uploadFile({
      url: getPortfolioImportImageUrl(),
      filePath,
      name: 'image',
      header: {
        uid,
      },
      success: (response) => {
        const parsed = parsePortfolioImportImageResponse(response.data)
        if (!parsed) {
          reject(new Error('截图上传结果解析失败，请稍后再试。'))
          return
        }

        resolve(parsed)
      },
      fail: reject,
    })
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

function getPortfolioImportImageUrl() {
  // #ifdef H5
  return '/valuation-api/positions/import-image'
  // #endif
  // #ifndef H5
  const baseURL = import.meta.env.VITE_TOOLS_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://etf-insight.betalpha.com'
  return `${baseURL}/api/positions/import-image`
  // #endif
}
