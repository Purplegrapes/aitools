import { createAuthLoginRoute } from './loginGuard.js'
import type { ExternalSourceType } from './sourceDetector.js'

export type GatewayFailureAction
  = | { type: 'external-h5', url: string }
    | { type: 'external-miniprogram', loginUrl: string }
    | { type: 'auth-login', route: ReturnType<typeof createAuthLoginRoute>, toastMessage: string }

export type GatewaySuccessTarget
  = | { type: 'browser', url: string }
    | { type: 'route', path: string }

export function resolveGatewayFailureAction(params: {
  source: ExternalSourceType
  loginUrl: string
  referer: string
}): GatewayFailureAction {
  const { source, loginUrl, referer } = params

  if (source === 'h5' && loginUrl) {
    return {
      type: 'external-h5',
      url: loginUrl,
    }
  }

  if (source === 'miniprogram') {
    return {
      type: 'external-miniprogram',
      loginUrl,
    }
  }

  return {
    type: 'auth-login',
    route: createAuthLoginRoute(referer || '/pages/index/index'),
    toastMessage: '登录状态校验失败，请重新登录',
  }
}

export function resolveGatewaySuccessTarget(referer: string): GatewaySuccessTarget {
  const nextReferer = referer || '/pages/index/index'

  if (/^https?:\/\//.test(nextReferer)) {
    return {
      type: 'browser',
      url: nextReferer,
    }
  }

  return {
    type: 'route',
    path: nextReferer,
  }
}
