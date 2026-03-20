<script setup lang="ts">
import { useTampStore } from '@/store/tampStore'
import { applyAuthSession, extractAuthSessionPayload } from '../auth/utils/authSession'
import { tokenByCode } from './api'
import { handleExternalRedirect } from './utils/externalRedirect'
import { detectAccessMode } from './utils/sourceDetector'

definePage({
  name: 'tamp',
  layout: 'default',
  style: {
    navigationBarTitleText: 'TAMP',
  },
})

const router = useRouter()
const route = useRoute()
const tampStore = useTampStore()
const toast = useGlobalToast()

const { send: sendCodeExchange } = useRequest(
  payload => tokenByCode(payload),
  { immediate: false },
)

const TOOLS_ENTRY_PATH = '/subPages/tools/entry'
let handled = false

// 检测并处理外部跳入，完成后根据referer参数跳转
onMounted(async () => {
  if (handled)
    return
  handled = true

  console.log('TAMP 页面加载 - 处理公共逻辑')

  const query = route.query
  const { mode, source } = detectAccessMode(query)
  const referer = normalizeReferer(query.referer)
  const loginUrl = decodeQueryValue(query.loginUrl)
  const code = decodeQueryValue(query.code)
  const tokenFromQuery = decodeQueryValue(query.token)
  const shopId = decodeQueryValue(query.shopId)

  console.log('访问模式:', { mode, source, referer, query })

  // 外部跳入模式
  if (mode === 'external') {
    // 存储外部来源信息到 tampStore
    tampStore.setExternalInfo({
      source,
      token: tokenFromQuery,
      loginUrl,
      shopId,
      appId: decodeQueryValue(query.appId),
    })

    if (code) {
      try {
        const response = await sendCodeExchange({ code })
        const authSession = extractAuthSessionPayload(response)
        if (authSession) {
          applyAuthSession(authSession)
        }
        else {
          throw new Error('code 换 token 未返回有效凭证')
        }
      }
      catch (error) {
        console.error('TAMP code 换 token 失败:', error)
        await handleAuthFailure(source, loginUrl, referer)
        return
      }
    }
    else if (tokenFromQuery) {
      applyAuthSession({ token: tokenFromQuery })
      cleanupSensitiveQuery()
    }
  }

  if (shouldForwardToToolsEntry(referer)) {
    await forwardToToolsEntry(referer, query)
    return
  }

  // 内部访问模式或外部认证完成后 - 直接跳转
  await redirectToTarget(referer || '/subPages/tamp/demo')
})

/**
 * 跳转到目标页面
 * @param referer 目标页面路径，如果为空则跳转到首页
 */
async function redirectToTarget(referer: string) {
  // 使用 replace 避免返回到 TAMP 中转页
  router.replace(referer)
}

function normalizeReferer(input: unknown) {
  const decoded = decodeQueryValue(input)
  if (!decoded)
    return ''

  if (!decoded.startsWith('/subPages/'))
    return ''

  if (decoded.startsWith('/subPages/tamp/'))
    return '/subPages/tamp/demo'

  return decoded
}

function decodeQueryValue(input: unknown) {
  if (Array.isArray(input))
    input = input[0]
  if (typeof input !== 'string')
    return ''

  try {
    return decodeURIComponent(input).trim()
  }
  catch {
    return input.trim()
  }
}

function shouldForwardToToolsEntry(path: string) {
  return path.startsWith('/subPages/tools/') && path !== TOOLS_ENTRY_PATH
}

async function forwardToToolsEntry(targetUrl: string, query: Record<string, unknown>) {
  const nextQuery: Record<string, string> = {
    targetUrl,
  }

  const passthroughKeys = ['ticket', 'timestamp', 'nonce', 'sign', 'traceId', 'bizId']
  passthroughKeys.forEach((key) => {
    const value = decodeQueryValue(query[key])
    if (value)
      nextQuery[key] = value
  })

  router.replace({
    path: TOOLS_ENTRY_PATH,
    query: nextQuery,
  })
}

async function handleAuthFailure(
  source: 'miniprogram' | 'h5' | 'internal',
  loginUrl: string,
  referer: string,
) {
  if (source === 'h5' && loginUrl) {
    // #ifdef H5
    window.location.href = loginUrl
    // #endif
    return
  }

  if (source === 'miniprogram') {
    await handleExternalRedirect(source, loginUrl)
    return
  }

  const loginQuery = referer
    ? { referer: encodeURIComponent(referer) }
    : {}
  router.replace({
    path: '/subPages/auth/login',
    query: loginQuery,
  })
  toast.error('登录状态校验失败，请重新登录')
}

function cleanupSensitiveQuery() {
  // #ifdef H5
  if (typeof window === 'undefined')
    return

  const url = new URL(window.location.href)
  ;['token', 'code'].forEach((key) => {
    url.searchParams.delete(key)
  })
  window.history.replaceState({}, '', url.toString())
  // #endif
}
</script>

<template>
  <view class="min-h-screen flex items-center justify-center bg-page px-[24rpx]">
    <view class="rounded-card bg-surface px-[28rpx] py-[24rpx] text-secondary shadow-sm">
      正在校验登录并跳转...
    </view>
  </view>
</template>
