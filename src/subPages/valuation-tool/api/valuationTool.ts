import type { PortfolioRecognitionDraft, PortfolioRecognitionResult } from '../types'
import { alovaInstance } from '@/api/core/instance'
import { realtime } from '@/subPages/etf/api'
import { getFallbackPortfolioRecognitionResult } from '../mock'

export function getMarketSentiment() {
  return alovaInstance.Get('/api/v1/market/sentiment')
}

export function getHotSearchFunds() {
  return alovaInstance.Get('/api/v1/funds/hot-searches')
}

export function searchFunds(params: { q: string }) {
  return alovaInstance.Get('/api/v1/funds/search', {
    params,
  })
}

export function getFundResult(code: string) {
  return alovaInstance.Get(`/api/v1/funds/${code}/result`)
}

export function getExchangeFundQuote(code: string) {
  return realtime({
    securityCodes: [code],
    assetType: 'ETF',
  })
}

export function getValuationWatchlist() {
  return alovaInstance.Get('/api/v1/valuation-tool/watchlist')
}

export function addValuationWatchlist(params: {
  code: string
  name?: string
  dailyChange?: number | null
  updateTime?: string
}) {
  return alovaInstance.Post('/api/v1/valuation-tool/watchlist', params)
}

export function removeValuationWatchlist(code: string) {
  return alovaInstance.Delete(`/api/v1/valuation-tool/watchlist/${code}`)
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
