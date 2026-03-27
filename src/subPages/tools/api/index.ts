import type { FlashNewsServiceItem } from '../types'
import { alovaInstance } from '@/api/core/instance'

export function getLatestNews(limit: number) {
  return alovaInstance.Get<ApiEnvelope<FlashNewsServiceItem[]>>('/valuation-api/news/latest', {
    params: {
      limit,
    },
  })
}
export interface ApiEnvelope<T> {
  code: number
  msg?: string
  message?: string
  data: T
}
