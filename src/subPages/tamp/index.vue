<script setup lang="ts">
import cookie from 'js-cookie'
import { useTampStore } from '@/store/tampStore'
import { applyAuthSession, applyAuthUserProfile, extractAuthSessionPayload } from '../auth/utils/authSession'
import { getCurrentAuthUser, tokenByCode } from './api'
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
let authAbortController: AbortController | null = null

// 检测并处理外部跳入，完成后根据referer参数跳转
onMounted(async () => {
  if (handled)
    return
  handled = true

  // 取消之前可能存在的进行中的认证流程
  if (authAbortController) {
    authAbortController.abort()
  }
  authAbortController = new AbortController()

  console.log('TAMP 页面加载 - 处理公共逻辑')

  const query = route.query
  const { mode, source } = detectAccessMode(query)
  const referer = normalizeReferer(query.referer)
  const loginUrl = decodeQueryValue(query.loginUrl)
  const code = decodeQueryValue(query.code)
  const shopId = decodeQueryValue(query.shopId)

  console.log('访问模式:', { mode, source, referer, query })

  // 外部跳入模式
  if (mode === 'external') {
    // 存储外部来源信息到 tampStore（不存储 token，URL 传 token 不安全）
    tampStore.setExternalInfo({
      source,
      loginUrl,
      shopId,
      appId: decodeQueryValue(query.appId),
    })

    // 小程序来源：需要用 code 换取 token
    if (source === 'miniprogram') {
      if (!code) {
        // 小程序来源但没有 code，认证失败
        console.warn('TAMP: 小程序来源缺少 code 参数')
        await handleAuthFailure(source, loginUrl, referer)
        return
      }
      try {
        const response = await sendCodeExchange({ code })
        const authSession = extractAuthSessionPayload(response)
        if (authSession) {
          applyAuthSession(authSession)
          try {
            const profile = await getCurrentAuthUser()
            if (profile?.id)
              applyAuthUserProfile(profile)
          }
          catch {
            // user/me 失败不阻断 code 换 token 成功后的主流程
          }
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

    // H5 来源：验证 token 有效性，使用已存储的 cookie
    if (source === 'h5') {
      // #ifdef H5
      const hasValidToken = cookie.get('ticket')
      if (!hasValidToken) {
        console.warn('TAMP: H5 来源缺少有效 token')
        await handleAuthFailure(source, loginUrl, referer)
        return
      }
      // 清理 URL 中的 code 参数（安全考虑）
      cleanupSensitiveQuery()
      // #endif
    }
  }

  if (shouldForwardToToolsEntry(referer)) {
    await forwardToToolsEntry(referer, query)
    return
  }

  // 内部访问模式或外部认证完成后 - 直接跳转
  // referer 为空时跳转到首页（而不是可能不存在的 tamp/demo）
  await redirectToTarget(referer || '/pages/index/index')
})

/**
 * 允许的 referer 路径前缀白名单
 */
const ALLOWED_REFERER_PREFIXES = [
  '/subPages/valuation-tool/',
  '/subPages/etf/',
  '/subPages/tamp/demo',
  '/subPages/tools/entry',
] as const

/**
 * 规范化并验证 referer 参数，防止开放重定向攻击
 * - 只允许白名单内的路径前缀
 * - 阻止路径遍历攻击 (..)
 * - 移除查询参数进行验证
 */
function normalizeReferer(input: unknown) {
  const decoded = decodeQueryValue(input)
  if (!decoded)
    return ''

  // 移除查询参数进行路径验证
  const cleanPath = decoded.split('?')[0]

  // 阻止路径遍历攻击
  if (cleanPath.includes('..')) {
    console.warn('TAMP: 阻止包含路径遍历的 referer:', decoded)
    return '/subPages/valuation-tool/index'
  }

  // 验证是否在白名单前缀内
  const isValidReferer = ALLOWED_REFERER_PREFIXES.some(prefix =>
    cleanPath === prefix || cleanPath.startsWith(`${prefix}/`),
  )

  if (!isValidReferer) {
    console.warn('TAMP: 阻止不在白名单内的 referer:', decoded)
    return '/subPages/valuation-tool/index'
  }

  // TAMP 自身路径重定向到 demo
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

  // 构建登录页跳转参数
  const loginQuery: Record<string, string> = {}
  if (referer) {
    loginQuery.referer = encodeURIComponent(referer)
  }
  router.replace({
    path: '/subPages/auth/login',
    query: loginQuery,
  })
  toast.error('登录状态校验失败，请重新登录')
}

/**
 * 清理 URL 中的敏感参数（仅 code）
 * 注意：不再通过 URL 传递 token，因此只清理 code
 */
function cleanupSensitiveQuery() {
  // #ifdef H5
  if (typeof window === 'undefined')
    return

  const url = new URL(window.location.href)
  url.searchParams.delete('code')
  window.history.replaceState({}, '', url.toString())
  // #endif
}

// 组件卸载时取消进行中的认证流程
onUnmounted(() => {
  if (authAbortController) {
    authAbortController.abort()
    authAbortController = null
  }
})

/**
 * 跳转到目标页面
 * 跳转完成后清理外部来源信息，避免状态残留
 */
async function redirectToTarget(referer: string) {
  // 使用 replace 避免返回到 TAMP 中转页
  router.replace(referer)
  // 跳转后清理外部来源信息（延迟执行确保路由已完成）
  nextTick(() => {
    tampStore.clearExternalInfo()
  })
}
</script>

<template>
  <view class="min-h-screen flex items-center justify-center bg-page px-[24rpx]">
    <view class="rounded-card bg-surface px-[28rpx] py-[24rpx] text-secondary shadow-sm">
      正在校验登录并跳转...
    </view>
  </view>
</template>
