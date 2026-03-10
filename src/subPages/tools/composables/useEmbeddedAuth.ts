import type { ExchangeEmbedTicketParams } from '../api'
import type { AuthRefreshPayload } from '../types/bridge'
import type { LaunchValidationErrorCode } from '../utils/launch'
import { useEmbeddedToolStore } from '@/store/embeddedToolStore'
import { getCurrentPath } from '@/utils'
import { exchangeEmbedTicket, queryBridgeTaskResult, refreshEmbedTicket } from '../api'
import { isToolsPagePath, validateEmbeddedLaunchParams } from '../utils/launch'
import { useMiniEmbedBridge } from './useMiniEmbedBridge'

export type EmbeddedAuthStatus = 'idle' | 'loading' | 'success' | 'invalid' | 'unsupported' | 'auth-failed'

export interface EmbeddedAuthBootstrapResult {
  status: EmbeddedAuthStatus
  targetUrl?: string
  message?: string
  errorCode?: LaunchValidationErrorCode | 'not_in_miniprogram' | 'refresh_unavailable' | 'refresh_failed'
}

function formatLaunchErrorMessage(errorCode?: EmbeddedAuthBootstrapResult['errorCode']) {
  switch (errorCode) {
    case 'missing_target_url':
      return '缺少目标页面参数'
    case 'invalid_target_url':
      return '目标页面地址不合法'
    case 'missing_ticket':
      return '缺少换票凭证'
    case 'missing_timestamp':
      return '缺少时间戳参数'
    case 'missing_nonce':
      return '缺少随机串参数'
    case 'missing_sign':
      return '缺少签名参数'
    case 'missing_trace_id':
      return '缺少链路追踪参数'
    case 'not_in_miniprogram':
      return '当前页面未运行在小程序 web-view 中'
    case 'refresh_unavailable':
      return '宿主未提供刷新凭证能力'
    case 'refresh_failed':
      return '刷新凭证失败，请返回小程序重试'
    default:
      return '嵌入式鉴权失败，请返回小程序重试'
  }
}

async function establishEmbeddedSession(params: ExchangeEmbedTicketParams) {
  await exchangeEmbedTicket(params)
}

function extractRefreshPayload(result: any): AuthRefreshPayload | null {
  const payload = result?.data?.payload || result?.data?.result || result?.data
  if (!payload?.ticket || !payload?.timestamp || !payload?.nonce || !payload?.sign)
    return null

  return {
    ticket: payload.ticket,
    timestamp: payload.timestamp,
    nonce: payload.nonce,
    sign: payload.sign,
  }
}

export function useEmbeddedAuth() {
  const embeddedToolStore = useEmbeddedToolStore()
  const bridge = useMiniEmbedBridge()

  async function waitForRefreshPayload(traceId: string) {
    const maxAttempts = 6
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (attempt > 0)
        await new Promise(resolve => setTimeout(resolve, 800))

      try {
        const result = await queryBridgeTaskResult({ traceId })
        const payload = extractRefreshPayload(result)
        if (payload)
          return payload

        const status = result?.data?.status
        if (status === 'failed' || status === 'denied')
          return null
      }
      catch {
        // ignore polling error and keep retrying within the short recovery window
      }
    }

    return null
  }

  async function bootstrap(query: Record<string, unknown>): Promise<EmbeddedAuthBootstrapResult> {
    const launchResult = validateEmbeddedLaunchParams(query)
    if (!launchResult.valid || !launchResult.params) {
      embeddedToolStore.clearContext()
      const message = formatLaunchErrorMessage(launchResult.errorCode)
      embeddedToolStore.setAuthError(message)
      return {
        status: 'invalid',
        errorCode: launchResult.errorCode,
        message,
      }
    }

    const envResponse = await bridge.getEnv()
    const isEmbedded = !!envResponse.payload?.miniprogram
    if (!isEmbedded) {
      embeddedToolStore.clearContext()
      const message = formatLaunchErrorMessage('not_in_miniprogram')
      embeddedToolStore.setAuthError(message)
      return {
        status: 'unsupported',
        errorCode: 'not_in_miniprogram',
        message,
      }
    }

    embeddedToolStore.setLaunchContext({
      targetUrl: launchResult.params.targetUrl,
      traceId: launchResult.params.traceId,
      isEmbedded,
    })
    embeddedToolStore.setBridgeReady(true)

    try {
      await establishEmbeddedSession(launchResult.params)
      embeddedToolStore.setSessionReady(true)
      cleanupLaunchQuery()

      return {
        status: 'success',
        targetUrl: launchResult.params.targetUrl,
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : formatLaunchErrorMessage()
      embeddedToolStore.setAuthError(message)
      return {
        status: 'auth-failed',
        message,
      }
    }
  }

  async function recover(): Promise<EmbeddedAuthBootstrapResult> {
    if (!embeddedToolStore.traceId || !embeddedToolStore.targetUrl) {
      const message = formatLaunchErrorMessage('refresh_failed')
      embeddedToolStore.setAuthError(message)
      return {
        status: 'auth-failed',
        errorCode: 'refresh_failed',
        message,
      }
    }

    const refreshResponse = await bridge.requestAuthRefresh(embeddedToolStore.traceId)
    if (refreshResponse.status !== 'success') {
      const errorCode = refreshResponse.status === 'unsupported' ? 'refresh_unavailable' : 'refresh_failed'
      const message = formatLaunchErrorMessage(errorCode)
      embeddedToolStore.setAuthError(message)
      return {
        status: 'auth-failed',
        errorCode,
        message,
      }
    }

    const refreshPayload = refreshResponse.payload || await waitForRefreshPayload(embeddedToolStore.traceId)
    if (!refreshPayload) {
      const message = formatLaunchErrorMessage('refresh_failed')
      embeddedToolStore.setAuthError(message)
      return {
        status: 'auth-failed',
        errorCode: 'refresh_failed',
        message,
      }
    }

    try {
      await refreshEmbedTicket({
        targetUrl: embeddedToolStore.targetUrl,
        traceId: embeddedToolStore.traceId,
        ticket: refreshPayload.ticket,
        timestamp: refreshPayload.timestamp,
        nonce: refreshPayload.nonce,
        sign: refreshPayload.sign,
      })
      embeddedToolStore.setSessionReady(true)
      embeddedToolStore.setAuthError('')

      return {
        status: 'success',
        targetUrl: embeddedToolStore.targetUrl,
      }
    }
    catch (error) {
      const message = error instanceof Error ? error.message : formatLaunchErrorMessage('refresh_failed')
      embeddedToolStore.setAuthError(message)
      return {
        status: 'auth-failed',
        errorCode: 'refresh_failed',
        message,
      }
    }
  }

  function cleanupLaunchQuery() {
    // #ifdef H5
    if (typeof window === 'undefined')
      return

    const url = new URL(window.location.href)
    url.searchParams.delete('ticket')
    url.searchParams.delete('sign')
    url.searchParams.delete('nonce')
    url.searchParams.delete('timestamp')
    window.history.replaceState({}, '', url.toString())
    // #endif
  }

  function resolveTargetUrl(targetUrl: string) {
    return validateEmbeddedLaunchParams({ targetUrl, ticket: '1', timestamp: '1', nonce: '1', sign: '1', traceId: '1' }).params?.targetUrl || ''
  }

  function isEmbeddedToolPage() {
    return isToolsPagePath(getCurrentPath())
  }

  return {
    bootstrap,
    recover,
    cleanupLaunchQuery,
    resolveTargetUrl,
    isEmbeddedToolPage,
  }
}
