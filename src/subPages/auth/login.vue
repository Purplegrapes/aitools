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

const canSendCode = computed(() => !sendingCode.value && countdown.value === 0)
const submittingLogin = computed(() => verifyingCode.value || exchangingToken.value)
const canSubmit = computed(() => !!normalizeMobile(mobile.value) && !!smsCode.value.trim() && !submittingLogin.value)

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
  <view class="min-h-screen bg-page px-[32rpx] pb-[48rpx] pt-[40rpx]">
    <view class="mx-auto max-w-[686rpx] rounded-card bg-surface p-[32rpx] shadow-sm">
      <text class="block text-lg text-primary font-600">
        手机号登录
      </text>
      <text class="mt-[12rpx] block text-sm text-secondary">
        请输入手机号与短信验证码完成登录。
      </text>

      <view class="mt-[32rpx] flex flex-col gap-[24rpx]">
        <wd-input
          v-model="mobile"
          label="手机号"
          placeholder="请输入手机号"
          clearable
          type="number"
        />

        <view class="flex items-end gap-[16rpx]">
          <view class="min-w-0 flex-1">
            <wd-input
              v-model="smsCode"
              label="验证码"
              placeholder="请输入验证码"
              clearable
              type="number"
            />
          </view>
          <wd-button size="small" :disabled="!canSendCode" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
          </wd-button>
        </view>
      </view>

      <view class="mt-[36rpx]">
        <wd-button block type="primary" :loading="submittingLogin" :disabled="!canSubmit" @click="handleSubmit">
          登录
        </wd-button>
      </view>
    </view>
  </view>
</template>
