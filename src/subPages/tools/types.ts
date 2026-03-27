export interface FlashNewsServiceItem {
  id: number
  title: string
  pubDate: string
  description: string
  score: number
  summary: string
  tags: string[]
}

export interface FlashNewsItem {
  id: number
  title: string
  pubDate: string
  description: string
  score: number
  summary: string
  tags: string[]
}

export interface ApiEnvelope<T> {
  code: number
  msg?: string
  message?: string
  data: T
}
