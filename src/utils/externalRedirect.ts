import type { ExternalSourceType } from '@/store/externalSourceStore'
import router from '@/router'
import { useExternalSourceStore } from '@/store/externalSourceStore'
import { useUserStore } from '@/store/userStore'

/**
 * 构造登录后返回的目标URL
 */
function constructReturnUrl(targetPath?: string): string {
  // #ifdef H5
  const baseUrl = window.location.origin
  return `${baseUrl}${targetPath || '/'}`
  // #endif

  // #ifndef H5
  return targetPath || '/pages/index/index'
  // #endif
}

/**
 * 跳转回外部小程序登录页（H5环境）
 */
function redirectToMiniProgram(appId: string, targetPath: string) {
  // #ifdef H5
  // 引入微信JSSDK并跳转回小程序
  // 需要在index.html中引入JSSDK: <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
  if (typeof wx !== 'undefined' && wx.miniProgram) {
    const redirectUrl = encodeURIComponent(constructReturnUrl(targetPath))
    wx.miniProgram.redirectTo({
      url: `/pages/login?appId=${appId}&redirectUrl=${redirectUrl}`,
    })
  }
  else {
    console.warn('微信JSSDK未加载，无法跳转回小程序')
    // 降级处理：跳转内部登录页
    router.replaceAll({ name: 'login' })
  }
  // #endif
}

/**
 * 跳转回外部H5登录页（小程序环境）
 */
function redirectToH5(loginUrl: string, targetPath: string) {
  // #ifndef H5
  const redirectUrl = encodeURIComponent(constructReturnUrl(targetPath))
  const fullUrl = loginUrl.includes('?')
    ? `${loginUrl}&redirectUrl=${redirectUrl}`
    : `${loginUrl}?redirectUrl=${redirectUrl}`

  // 使用web-view组件打开外部H5
  uni.navigateTo({
    url: `/pages/public/webview?url=${encodeURIComponent(fullUrl)}`,
  })
  // #endif
}

/**
 * 处理登录失效，跳转回外部登录页
 * 根据存储的来源信息，智能跳转到对应的登录页
 */
export async function handleExternalRedirect() {
  const externalSource = useExternalSourceStore()
  const userStore = useUserStore()

  // 清除本地认证信息
  await userStore.logout()

  const { source, appId, loginUrl, targetPath } = externalSource

  // 根据来源跳转
  switch (source) {
    case 'miniprogram':
      // H5环境，跳回小程序登录页
      if (appId) {
        redirectToMiniProgram(appId, targetPath || '')
      }
      else {
        console.warn('缺少appId，无法跳转回小程序')
        router.replaceAll({ name: 'login' })
      }
      break

    case 'h5':
      // 小程序环境，跳转回H5登录页
      if (loginUrl) {
        redirectToH5(loginUrl, targetPath || '')
      }
      else {
        console.warn('缺少loginUrl，无法跳转回H5')
        router.replaceAll({ name: 'login' })
      }
      break

    default:
      // 内部访问，跳转到项目内登录页
      router.replaceAll({ name: 'login' })
  }

  // 清除来源信息（已处理完成）
  externalSource.clear()
}

/**
 * 检查是否需要处理外部跳转
 */
export function shouldHandleExternalRedirect(source: ExternalSourceType): boolean {
  return source === 'miniprogram' || source === 'h5'
}
