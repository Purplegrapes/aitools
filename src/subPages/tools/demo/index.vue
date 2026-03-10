<script setup lang="ts">
import { useEmbeddedToolStore } from '@/store/embeddedToolStore'
import { queryBridgeTaskResult } from '../api'
import { useEmbeddedAuth } from '../composables/useEmbeddedAuth'
import { useMiniEmbedBridge } from '../composables/useMiniEmbedBridge'

definePage({
  name: 'tools-demo',
  layout: 'default',
  style: {
    navigationBarTitleText: '嵌入式工具页 Demo',
  },
})

const embeddedToolStore = useEmbeddedToolStore()
const globalToast = useGlobalToast()
const bridge = useMiniEmbedBridge()
const { isEmbeddedToolPage } = useEmbeddedAuth()

const pageState = shallowRef<'ready' | 'invalid'>('ready')
const subscribeState = shallowRef<'idle' | 'pending' | 'authorized' | 'denied' | 'failed'>('idle')
const subscribeMessage = shallowRef('点击下方按钮模拟请求宿主能力。')

const contextCards = computed(() => [
  { label: '目标页面', value: embeddedToolStore.targetUrl || '--' },
  { label: '链路追踪', value: embeddedToolStore.traceId || '--' },
  { label: '嵌入环境', value: embeddedToolStore.isEmbedded ? '是' : '否' },
  { label: '会话状态', value: embeddedToolStore.sessionReady ? '已建立' : '未建立' },
  { label: 'Bridge 状态', value: embeddedToolStore.bridgeReady ? '已就绪' : '未就绪' },
])

onMounted(() => {
  if (!embeddedToolStore.canEnterTool || !isEmbeddedToolPage()) {
    pageState.value = 'invalid'
    subscribeMessage.value = '请通过统一入口页进入当前工具页。'
  }
})

async function handleRequestSubscribe() {
  if (!embeddedToolStore.traceId) {
    globalToast.error('缺少 traceId，无法发起授权')
    return
  }

  subscribeState.value = 'pending'
  subscribeMessage.value = '正在请求宿主执行订阅消息授权...'

  const response = await bridge.requestSubscribeMessage({
    scene: 'TOOLS_DEMO',
    bizId: embeddedToolStore.traceId,
  }, embeddedToolStore.traceId)

  if (response.status !== 'success') {
    subscribeState.value = 'failed'
    subscribeMessage.value = response.message || '宿主未响应授权请求'
    return
  }

  try {
    const result = await queryBridgeTaskResult({ traceId: embeddedToolStore.traceId })
    const bridgeStatus = result?.data?.status || result?.status

    if (bridgeStatus === 'authorized') {
      subscribeState.value = 'authorized'
      subscribeMessage.value = '宿主已完成订阅消息授权。'
      return
    }

    if (bridgeStatus === 'denied') {
      subscribeState.value = 'denied'
      subscribeMessage.value = '用户拒绝了订阅消息授权。'
      return
    }

    subscribeState.value = 'pending'
    subscribeMessage.value = '授权请求已发出，当前结果待宿主回传。'
  }
  catch (error) {
    subscribeState.value = 'failed'
    subscribeMessage.value = error instanceof Error ? error.message : '查询授权结果失败'
  }
}
</script>

<template>
  <view class="min-h-screen bg-slate-50 px-4 py-6">
    <view class="mx-auto max-w-180 flex flex-col gap-4">
      <view class="rounded-2xl bg-white p-5 shadow-sm">
        <view class="text-lg text-slate-900 font-600">
          嵌入式工具页接入示例
        </view>
        <view class="mt-2 text-sm text-slate-500 leading-6">
          该页面假设会话已由统一入口页建立，只展示宿主桥接与结果查询方式。
        </view>
      </view>

      <view class="rounded-2xl bg-white p-5 shadow-sm">
        <view class="text-base text-slate-900 font-600">
          当前上下文
        </view>
        <view class="mt-4 flex flex-col gap-3">
          <view
            v-for="item in contextCards"
            :key="item.label"
            class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
          >
            <text class="text-sm text-slate-500">
              {{ item.label }}
            </text>
            <text class="max-w-58 break-all text-right text-sm text-slate-900">
              {{ item.value }}
            </text>
          </view>
        </view>
      </view>

      <view class="rounded-2xl bg-white p-5 shadow-sm">
        <view class="text-base text-slate-900 font-600">
          宿主能力示例
        </view>
        <view class="mt-2 text-sm text-slate-500 leading-6">
          {{ subscribeMessage }}
        </view>
        <view class="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <text class="text-sm text-slate-500">
            授权状态
          </text>
          <text class="text-sm text-slate-900">
            {{ subscribeState }}
          </text>
        </view>
        <view class="mt-4">
          <wd-button :disabled="pageState === 'invalid' || subscribeState === 'pending'" type="primary" @click="handleRequestSubscribe">
            请求订阅消息授权
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>
