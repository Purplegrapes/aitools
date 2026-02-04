import type { ExternalSourceType } from '@/store/externalSourceStore'

/**
 * 访问模式检测结果
 */
export interface AccessModeDetection {
  mode: 'internal' | 'external'
  source: ExternalSourceType | null
}

/**
 * 检测访问模式
 * 通过URL参数判断是内部访问还是外部跳入
 */
export function detectAccessMode(query: Record<string, any>): AccessModeDetection {
  // 小程序跳入检测
  if (query.code && query.from === 'miniapp') {
    return { mode: 'external', source: 'miniprogram' }
  }

  // H5跳入检测
  if (query.sessionId && query.from === 'h5') {
    return { mode: 'external', source: 'h5' }
  }

  // 内部访问
  return { mode: 'internal', source: null }
}

/**
 * 从当前页面获取URL查询参数
 */
export function getPageQuery(): Record<string, any> {
  // #ifdef H5
  const url = new URL(window.location.href)
  const query: Record<string, any> = {}
  url.searchParams.forEach((value, key) => {
    query[key] = value
  })
  return query
  // #endif

  // #ifndef H5
  // 小程序环境通过getCurrentPages获取页面参数
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    return currentPage.options || {}
  }
  return {}
  // #endif
}
