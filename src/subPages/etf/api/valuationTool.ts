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
