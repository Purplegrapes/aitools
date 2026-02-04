/**
 * TAMP 子包 - 来源检测工具
 */

/**
 * 外部来源类型
 */
export type ExternalSourceType = 'miniprogram' | 'h5' | 'internal'

/**
 * 访问模式检测结果
 */
export interface AccessModeDetection {
  mode: 'external' | 'internal'
  source: ExternalSourceType
}

/**
 * 获取页面URL查询参数
 */
export function getPageQuery(): Record<string, any> {
  // #ifdef H5
  const url = new URL(window.location.href)
  const params: Record<string, any> = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
  // #endif

  // #ifndef H5
  const pages = getCurrentPages()
  if (pages.length === 0)
    return {}
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}
  return options as Record<string, any>
  // #endif
}

/**
 * 检测访问模式
 */
export function detectAccessMode(query: Record<string, any>): AccessModeDetection {
  // 小程序跳入
  if (query.code && query.from === 'miniapp')
    return { mode: 'external', source: 'miniprogram' }

  // H5跳入
  if (query.sessionId && query.from === 'h5')
    return { mode: 'external', source: 'h5' }

  // 内部访问
  return { mode: 'internal', source: 'internal' }
}
