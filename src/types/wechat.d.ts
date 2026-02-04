/**
 * 微信JSSDK类型声明
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html
 */
declare global {
  interface Window {
    wx?: {
      miniProgram: {
        navigateTo: (options: { url: string }) => void
        redirectTo: (options: { url: string }) => void
        switchTab: (options: { url: string }) => void
        reLaunch: (options: { url: string }) => void
        postMessage: (data: unknown) => void
        getEnv: (callback: (res: { miniprogram: boolean }) => void) => void
      }
    }
  }
}

export {}
