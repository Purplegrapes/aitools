<script setup lang="ts">
import type { FundSearchItem, RequestDisplayState } from './types'
import { searchFunds } from './api/valuationTool'
import ValuationSearchBar from './components/ValuationSearchBar.vue'
import { findFallbackSearchResult } from './mock'
import { createResultPath, createSearchPath, normalizeKeyword } from './utils'

definePage({
  name: 'valuation-tool-search',
  layout: 'default',
  style: {
    navigationBarTitleText: '基金搜索',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const keyword = computed(() => normalizeKeyword(route.query.q))
const searchKeyword = shallowRef('')
const requestState = shallowRef<RequestDisplayState>('idle')

const {
  loading,
  send: runSearch,
} = useRequest(
  () => searchFunds({
    q: keyword.value,
  }),
  {
    immediate: false,
    onSuccess: (response) => {
      const item = (response as { data?: FundSearchItem | null } | undefined)?.data || null
      if (!item) {
        requestState.value = 'empty'
        return
      }
      requestState.value = 'success'
      router.replace(createResultPath(item.code))
    },
    onError: () => {
      if (import.meta.env.DEV) {
        const fallbackItem = findFallbackSearchResult(keyword.value)
        if (fallbackItem) {
          requestState.value = 'success'
          router.replace(createResultPath(fallbackItem.code))
          return
        }
      }
      requestState.value = 'error'
    },
  },
)

watch(
  keyword,
  (value) => {
    searchKeyword.value = value
    if (!value) {
      requestState.value = 'empty'
      return
    }
    requestState.value = 'loading'
    runSearch()
  },
  { immediate: true },
)

watch(loading, (value) => {
  if (value)
    requestState.value = 'loading'
})

function handleSubmit() {
  const nextKeyword = searchKeyword.value.trim()
  if (!nextKeyword)
    return

  router.replace(createSearchPath(nextKeyword))
}
</script>

<template>
  <view class="min-h-screen bg-page px-4 pb-8 pt-4">
    <view class="mx-auto max-w-[680rpx] flex flex-col gap-4">
      <ValuationSearchBar
        v-model="searchKeyword"
        placeholder="继续搜索基金名称或代码"
        button-text="查看"
        @submit="handleSubmit"
      />

      <view v-if="requestState === 'loading'" class="rounded-4 bg-surface p-6 text-center shadow-sm">
        <wd-loading />
        <text class="mt-3 block text-sm text-secondary">
          正在精确匹配基金信息...
        </text>
      </view>

      <view v-else-if="requestState === 'empty'" class="rounded-4 bg-surface p-6 shadow-sm">
        <text class="block text-base text-primary font-600">
          没找到精确匹配的基金
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          请直接输入完整基金代码或准确基金名称后再试。
        </text>
      </view>

      <view v-else-if="requestState === 'error'" class="rounded-4 bg-surface p-6 shadow-sm">
        <text class="block text-base text-primary font-600">
          搜索暂时有点忙
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          当前没能完成精确搜索，请稍后再试。
        </text>
      </view>
    </view>
  </view>
</template>
