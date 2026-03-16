import { alovaInstance } from '@/api/core/instance'

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
