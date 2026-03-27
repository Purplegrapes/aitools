import type { FlashNewsServiceItem } from '../types'
import { alovaInstance } from '@/api/core/instance'

export function getLatestNews(params: { minScore: number, recentDay: number }) {
  return alovaInstance.Get<ApiEnvelope<FlashNewsServiceItem[]>>('/valuation-api/news/latest', {
    params: {
      minScore: params.minScore,
      recentDay: params.recentDay,
    },
  })
}
export interface ApiEnvelope<T> {
  code: number
  msg?: string
  message?: string
  data: T
}
