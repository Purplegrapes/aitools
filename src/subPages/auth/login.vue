<script setup lang="ts">
import { exchangeToken, getCurrentAuthUser, sendPhoneCode, verifyPhoneCode } from '../tamp/api'
import { applyAuthSession, applyAuthUserProfile, extractAuthSessionPayload } from './utils/authSession'

definePage({
  name: 'auth-login',
  layout: 'default',
  style: {
    navigationBarTitleText: '手机号登录',
  },
})

const router = useRouter()
const route = useRoute()
const toast = useGlobalToast()

const mobile = ref('')
const smsCode = ref('')
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

/**
 * 登录页允许的 referer 路径前缀白名单
 * 注意：登录页的白名单比 TAMP 更宽松，因为用户可能从任何内部页面进入登录
 */
const LOGIN_REFERER_PREFIXES = [
  '/pages/',
  '/subPages/',
] as const

const referer = computed(() => {
  const value = route.query.referer
  if (typeof value !== 'string' || !value.trim())
    return '/pages/index/index'

  const decoded = decodeURIComponent(value).trim()

  // 阻止外部 URL 重定向攻击 - 只允许内部路径
  if (!decoded.startsWith('/')) {
    console.warn('Login: 阻止外部 URL referer:', decoded)
    return '/pages/index/index'
  }

  // 阻止协议式 URL（如 //evil.com）
  if (decoded.startsWith('//')) {
    console.warn('Login: 阻止协议式 URL referer:', decoded)
    return '/pages/index/index'
  }

  // 阻止路径遍历攻击 (..)
  if (decoded.includes('..')) {
    console.warn('Login: 阻止包含路径遍历的 referer:', decoded)
    return '/pages/index/index'
  }

  // 验证是否在允许的路径前缀内
  const cleanPath = decoded.split('?')[0]
  const isValidReferer = LOGIN_REFERER_PREFIXES.some(prefix =>
    cleanPath.startsWith(prefix),
  )

  if (!isValidReferer) {
    console.warn('Login: 阻止不在白名单内的 referer:', decoded)
    return '/pages/index/index'
  }

  return decoded
})

const { send: sendCodeRequest, loading: sendingCode } = useRequest(
  payload => sendPhoneCode(payload),
  { immediate: false },
)

const { send: sendVerifyRequest, loading: verifyingCode } = useRequest(
  (payload: Parameters<typeof verifyPhoneCode>[0]) => verifyPhoneCode(payload),
  { immediate: false },
)

const { send: sendExchangeRequest, loading: exchangingToken } = useRequest(
  payload => exchangeToken(payload),
  { immediate: false },
)

const isMobileValid = computed(() => isValidMainlandMobile(normalizeMobile(mobile.value)))
const canSendCode = computed(() => isMobileValid.value && !sendingCode.value && countdown.value === 0)
const submittingLogin = computed(() => verifyingCode.value || exchangingToken.value)
const canSubmit = computed(() => !!normalizeMobile(mobile.value) && !!smsCode.value.trim() && !submittingLogin.value)
const codeButtonText = computed(() => {
  if (sendingCode.value)
    return '发送中...'
  if (countdown.value > 0)
    return `${countdown.value}s后重发`
  return '发送验证码'
})

function normalizeMobile(value: string) {
  return value.replace(/\s+/g, '').trim()
}

function isValidMainlandMobile(value: string) {
  return /^1\d{10}$/.test(value)
}

function startCountdown() {
  if (timer)
    clearInterval(timer)

  countdown.value = 60
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
      countdown.value = 0
    }
  }, 1000)
}

async function handleSendCode() {
  const normalizedMobile = normalizeMobile(mobile.value)
  if (!isValidMainlandMobile(normalizedMobile)) {
    toast.error('请输入正确的手机号')
    return
  }
  if (!canSendCode.value)
    return

  try {
    await sendCodeRequest({ phone: normalizedMobile })
    startCountdown()
    toast.success('验证码已发送')
  }
  catch {
    // 全局错误处理中已提示，这里不重复抛错
  }
}

async function handleSubmit() {
  const normalizedMobile = normalizeMobile(mobile.value)
  const normalizedCode = smsCode.value.trim()

  if (!isValidMainlandMobile(normalizedMobile)) {
    toast.error('请输入正确的手机号')
    return
  }
  if (!normalizedCode) {
    toast.error('请输入验证码')
    return
  }

  try {
    const authorize = await sendVerifyRequest({
      phone: normalizedMobile,
      code: normalizedCode,
    })
    // Alova 将响应包装在 data 中
    const authCode = authorize?.data?.code || authorize?.code
    if (!authCode || typeof authCode !== 'string') {
      toast.error('验证码校验成功，但未返回授权码')
      return
    }

    const response = await sendExchangeRequest({
      code: authCode,
      grant_type: 'authorization_code',
    })
    const authPayload = extractAuthSessionPayload(response)
    if (!authPayload) {
      toast.error('登录失败，请稍后重试')
      return
    }

    applyAuthSession(authPayload)
    try {
      const profile = await getCurrentAuthUser()
      if (profile?.id)
        applyAuthUserProfile(profile)
    }
    catch {
      // user/me 失败不阻断登录成功与回跳
    }
    toast.success('登录成功')
    router.replace(referer.value)
  }
  catch {
    // 全局错误处理中已提示，这里不重复抛错
  }
}

onUnmounted(() => {
  if (timer)
    clearInterval(timer)
})
</script>

<template>
  <view class="auth-login-page min-h-screen px-[32rpx] pb-[48rpx] pt-[40rpx]">
    <view class="mx-auto max-w-[686rpx]">
      <view class="mb-[28rpx]">
        <text class="block text-lg text-primary font-600">
          手机号登录
        </text>
        <text class="mt-[8rpx] block text-sm text-secondary">
          使用手机号快速登录，完成账号身份验证。
        </text>
      </view>

      <view class="rounded-card bg-surface p-[32rpx] shadow-[0_18rpx_54rpx_rgba(23,43,77,0.09)]">
        <view class="flex flex-col gap-[24rpx]">
          <wd-input
            v-model="mobile"
            label="手机号"
            label-width="140rpx"
            placeholder="请输入手机号"
            clearable
            type="number"
          />

          <view class="flex items-end gap-[16rpx]">
            <view class="min-w-0 flex-1">
              <wd-input
                v-model="smsCode"
                label="验证码"
                label-width="140rpx"
                placeholder="请输入验证码"
                clearable
                type="number"
              />
            </view>
            <wd-button size="small" :disabled="!canSendCode" :loading="sendingCode" @click="handleSendCode">
              {{ codeButtonText }}
            </wd-button>
          </view>

          <text v-if="countdown > 0" class="text-xs text-secondary">
            验证码已发送，请留意短信（{{ countdown }}s 后可重新发送）
          </text>
        </view>

        <view class="mt-[36rpx]">
          <wd-button block type="primary" :loading="submittingLogin" :disabled="!canSubmit" @click="handleSubmit">
            登录并继续
          </wd-button>
          <text class="mt-[16rpx] block text-center text-xs text-secondary">
            登录即表示你同意平台的用户协议与隐私政策
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.auth-login-page {
  background:
    radial-gradient(120% 90% at 5% 0%, rgba(54, 118, 255, 0.13) 0%, rgba(54, 118, 255, 0) 62%),
    radial-gradient(100% 85% at 100% 14%, rgba(36, 195, 171, 0.12) 0%, rgba(36, 195, 171, 0) 58%),
    linear-gradient(180deg, #f6f9ff 0%, #f3f6fb 100%);
}
</style>
