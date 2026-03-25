<script setup lang="ts">
import { getCurrentAuthUser, transferH5TicketForToken } from './api'
import {
  applyAuthSession,
  applyAuthUserProfile,
  extractAuthSessionPayload,
  extractAuthUserProfile,
} from './utils/authSession'
import { handleExternalRedirect } from './utils/externalRedirect'
import {
  decodeQueryValue,
  hasRequiredGatewayParams,
  normalizeGatewayReferer,
  shouldExchangeTransferTicket,
} from './utils/gateway'
import { getStoredAuthToken } from './utils/loginGuard'
import { resolveGatewayFailureAction, resolveGatewaySuccessTarget } from './utils/gateway-flow'
import { detectAccessMode } from './utils/sourceDetector'

definePage({
  name: 'auth-gateway',
  layout: 'default',
  style: {
    navigationBarTitleText: '认证跳转',
  },
})

const router = useRouter()
const route = useRoute()
const tampStore = useTampStore()
const toast = useGlobalToast()

const { send: sendTransferH5TicketExchange } = useRequest(
  payload => transferH5TicketForToken(payload),
  { immediate: false },
)

let handled = false
let authAbortController: AbortController | null = null

onMounted(async () => {
  if (handled)
    return
  handled = true

  if (authAbortController)
    authAbortController.abort()
  authAbortController = new AbortController()

  const query = route.query as Record<string, unknown>
  const { mode, source } = detectAccessMode(query)
  console.log(route.query)
  const referrer = normalizeGatewayReferer(query.referrer)
  const transferH5Ticket = decodeQueryValue(query.transferH5Ticket)
  const loginUrl = decodeQueryValue(query.loginUrl)
  const shopId = decodeQueryValue(query.shopId)
  const storedAuthToken = getStoredAuthToken()

  if (mode === 'external') {
    if (source === 'miniprogram' && !hasRequiredGatewayParams(query)) {
      console.warn('AuthGateway: 缺少必传参数 referrer 或 transferH5Ticket')
      await handleAuthFailure(source, loginUrl, referrer)
      return
    }

    tampStore.setExternalInfo({
      source,
      loginUrl,
      shopId,
    })

    if (shouldExchangeTransferTicket(source, storedAuthToken)) {
      try {
        const response = await sendTransferH5TicketExchange({ transferH5Ticket })
        const authSession = extractAuthSessionPayload(response)
        if (authSession) {
          applyAuthSession(authSession)
          try {
            const profile = await getCurrentAuthUser()
            if (profile?.id)
              applyAuthUserProfile(profile)
          }
          catch {
            // user/me 失败不阻断 transferH5Ticket 校验成功后的主流程
          }
        }
        else {
          const profile = extractAuthUserProfile(response)
          if (!profile)
            throw new Error('transferH5Ticket 校验未返回有效登录信息')

          applyAuthUserProfile(profile)
        }
      }
      catch (error) {
        console.error('AuthGateway transferH5Ticket 换 token 失败:', error)
        await handleAuthFailure(source, loginUrl, referrer)
        return
      }
    }

    if (source === 'miniprogram')
      cleanupSensitiveQuery()
  }

  await redirectToTarget(referrer || '/pages/index/index')
})

function cleanupSensitiveQuery() {
  // #ifdef H5
  if (typeof window === 'undefined')
    return

  const url = new URL(window.location.href)
  url.searchParams.delete('transferH5Ticket')
  window.history.replaceState({}, '', url.toString())
  // #endif
}

function replaceBrowserLocation(url: string) {
  // #ifdef H5
  if (typeof window === 'undefined')
    return

  window.location.replace(url)
  // #endif
}

async function handleAuthFailure(
  source: 'miniprogram' | 'h5' | 'internal',
  loginUrl: string,
  referrer: string,
) {
  const action = resolveGatewayFailureAction({
    source,
    loginUrl,
    referrer,
  })

  if (action.type === 'external-h5') {
    replaceBrowserLocation(action.url)
    return
  }

  if (action.type === 'external-miniprogram') {
    await handleExternalRedirect(source, action.loginUrl)
    return
  }
  router.replace(action.route)
  toast.error(action.toastMessage)
}

async function redirectToTarget(referrer: string) {
  tampStore.clearExternalInfo()
  const target = resolveGatewaySuccessTarget(referrer)

  // #ifdef H5
  if (target.type === 'browser') {
    replaceBrowserLocation(target.url)
    return
  }
  // #endif

  router.replace(target.path)
}

onUnmounted(() => {
  if (authAbortController) {
    authAbortController.abort()
    authAbortController = null
  }
})
</script>

<template>
  <view class="min-h-screen flex items-center justify-center bg-page px-[24rpx]">
    <view class="rounded-card bg-surface px-[28rpx] py-[24rpx] text-secondary shadow-sm">
      正在校验登录并跳转...
    </view>
  </view>
</template>
