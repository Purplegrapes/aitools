import type { ApiEnvelope, FlashNewsItem, FlashNewsServiceItem } from '../types'
import { getLatestNews } from '../api'

export function useLatestNews(limit = 20) {
  const {
    data,
    loading,
    error,
    send: fetchLatestNews,
  } = useRequest(() => getLatestNews(limit), {
    immediate: true,
    onError: () => undefined,
  })

  const newsItems = computed<FlashNewsItem[]>(() => {
    const items = (data.value as ApiEnvelope<FlashNewsServiceItem[]> | undefined)?.data
    if (!Array.isArray(items))
      return []

    return items.map(item => ({
      id: item.id,
      title: item.title || '未命名快讯',
      pubDate: item.pubDate || '',
      description: item.description || '',
      score: Number(item.score) || 0,
      summary: item.summary || '暂无摘要',
      tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
    }))
  })

  return {
    newsItems,
    newsLoading: loading,
    newsError: error,
    refreshNews: fetchLatestNews,
  }
}
