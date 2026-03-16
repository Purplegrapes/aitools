<script setup lang="ts">
import { useEmbeddedToolStore } from '@/store/embeddedToolStore'
import { useEmbeddedAuth } from './composables/useEmbeddedAuth'

definePage({
  name: 'tools-entry',
  layout: 'default',
  style: {
    navigationBarTitleText: '工具页跳转中',
  },
})

const router = useRouter()
const route = useRoute()
const embeddedToolStore = useEmbeddedToolStore()
const { bootstrap } = useEmbeddedAuth()

const status = shallowRef<'loading' | 'invalid' | 'unsupported' | 'auth-failed'>('loading')
const message = shallowRef('正在建立工具页会话...')

const statusTitle = computed(() => {
  if (status.value === 'loading')
    return '正在进入工具页'
  if (status.value === 'unsupported')
    return '当前环境不支持访问'
  if (status.value === 'invalid')
    return '打开参数无效'
  return '工具页进入失败'
})

onMounted(async () => {
  const result = await bootstrap(route.query as Record<string, unknown>)
  if (result.status === 'success' && result.targetUrl) {
    router.replace(result.targetUrl)
    return
  }

  if (result.status === 'invalid' || result.status === 'unsupported')
    status.value = result.status
  else
    status.value = 'auth-failed'

  message.value = result.message || embeddedToolStore.lastAuthError || '请返回小程序重新进入'
})

function handleBack() {
  router.back()
}
</script>

<template>
  <view class="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
    <view class="w-full rounded-2xl bg-white p-6 shadow-sm">
      <view class="text-lg text-slate-900 font-600">
        {{ statusTitle }}
      </view>
      <view class="mt-3 text-sm text-slate-500 leading-6">
        {{ message }}
      </view>

      <view v-if="status !== 'loading'" class="mt-6 flex justify-center">
        <wd-button type="primary" @click="handleBack">
          返回上一页
        </wd-button>
      </view>
    </view>
  </view>
</template>
