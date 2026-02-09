/**
 * 判断是否在 iframe 中
 */
export function isInIframe(): boolean {
  // #ifdef H5
  try {
    return window.self !== window.top
  }
  catch {
    return true
  }
  // #endif
  return false
}
