/**
 * TAMP 子包 - 外部跳转处理工具
 */
import type { ExternalSourceType } from './sourceDetector'

/**
 * 处理外部跳转（token失效或认证失败时调用）
 */
export async function handleExternalRedirect(source: ExternalSourceType, loginUrl?: string) {
  const { confirm: showConfirm } = useGlobalMessage()

  // 小程序来源 - 跳转回小程序
  if (source === 'miniprogram') {
    // #ifdef H5
    if (typeof wx !== 'undefined' && wx.miniProgram) {
      wx.miniProgram.redirectTo({
        url: '/pages/index/index', // 跳转回小程序首页或登录页
        fail: () => {
          console.warn('跳转小程序失败')
        },
      })
    }
    // #endif
    return
  }

  // H5来源 - 跳转回H5登录页
  if (source === 'h5' && loginUrl) {
    // #ifdef H5
    window.location.href = loginUrl
    // #endif
    return
  }

  // 无有效来源，提示用户
  showConfirm({
    title: '提示',
    msg: '登录已失效，请重新进入',
    showCancelButton: false,
    confirmButtonText: '确定',
  })
}
