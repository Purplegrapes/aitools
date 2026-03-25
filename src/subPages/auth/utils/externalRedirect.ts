import type { ExternalSourceType } from './sourceDetector.js'

/**
 * 处理外部跳转（token失效或认证失败时调用）
 */
export async function handleExternalRedirect(source: ExternalSourceType, loginUrl?: string) {
  const { confirm: showConfirm } = useGlobalMessage()

  if (source === 'miniprogram') {
    // #ifdef H5
    const miniProgram = (wx as typeof wx & { miniProgram?: { redirectTo: (options: { url: string, fail?: () => void }) => void } })?.miniProgram
    if (typeof wx !== 'undefined' && miniProgram) {
      miniProgram.redirectTo({
        url: loginUrl || '/pages/index/index',
        fail: () => {
          console.warn('跳转小程序失败')
        },
      })
    }
    // #endif
    return
  }

  if (source === 'h5' && loginUrl) {
    // #ifdef H5
    window.location.href = loginUrl
    // #endif
    return
  }

  showConfirm({
    title: '提示',
    msg: '登录已失效，请重新进入',
    showCancelButton: false,
    confirmButtonText: '确定',
  })
}
