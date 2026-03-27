<script setup lang="ts">
import type { ApiEnvelope, FlashNewsItem, FlashNewsServiceItem } from './types'
import BasePaging from '@/components/BasePaging.vue'
import { usePagedRequest } from '@/composables/usePagedRequest'
import { getLatestNews } from './api'
import FlashNewsCard from './components/FlashNewsCard.vue'

interface BasePagingExpose {
  pagingRef: ZPagingRef<FlashNewsItem> | null
  reload: (animate?: boolean) => Promise<ZPagingParams.ReturnData<FlashNewsItem>> | undefined
}

const DEFAULT_NEWS_FILTER = {
  minScore: 80,
  recentDay: 1,
} as const

definePage({
  name: 'tool-news',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '实时热点',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const newsError = shallowRef(false)
const newsItems = ref<FlashNewsItem[]>([])
const basePagingRef = ref<BasePagingExpose | null>(null)
const pagingRef = computed<ZPagingRef<FlashNewsItem> | null>(() => {
  return basePagingRef.value?.pagingRef ?? null
})
const hasShown = shallowRef(false)

const { loading: newsLoading, onQuery, reload: refreshNews } = usePagedRequest<ApiEnvelope<FlashNewsServiceItem[]>, FlashNewsItem, [{ minScore: number, recentDay: number }]>({
  pagingRef,
  createMethod: params => getLatestNews(params),
  fetchRaw: async (pageNo, pageSize, _from, sendRequest) => {
    if (pageNo > 1) {
      return {
        code: 0,
        data: [],
      } satisfies ApiEnvelope<FlashNewsServiceItem[]>
    }

    return await sendRequest({
      minScore: DEFAULT_NEWS_FILTER.minScore,
      recentDay: DEFAULT_NEWS_FILTER.recentDay,
    })
  },
  getList: raw => normalizeNewsItems(raw.data),
  getNoMore: () => true,
  onSuccess: () => {
    newsError.value = false
  },
  onError: () => {
    newsError.value = true
  },
})

const skeletonRows = [
  [1, { width: '48%' }],
  [{ width: '100%', height: '36rpx' }],
  [{ width: '85%', height: '32rpx' }],
  [{ width: '100%', height: '120rpx', borderRadius: '24rpx' }],
  [{ width: '30%', height: '28rpx' }, { width: '22%', height: '28rpx', marginLeft: '16rpx' }],
]

onShow(() => {
  if (hasShown.value) {
    refreshNews(true)
    return
  }

  hasShown.value = true
})

function handleRefresh() {
  return refreshNews(true)
}

function normalizeNewsItems(items?: FlashNewsServiceItem[]) {
  if (!Array.isArray(items))
    return []

  return items.map(item => ({
    id: item.id,
    title: item.title || '未命名快讯',
    pubDate: item.pubDate || '',
    description: item.description || '',
    score: Number(item.score) || 0,
    summary: item.summary || '暂无摘要',
    tags: Array.isArray(item.tags) ? item.tags.filter(Boolean) : [],
  }))
}
</script>

<template>
  <view class="news-page bg-page vt-page-shell pb-[220rpx]">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx] bg-[linear-gradient(180deg,_#E4EEFF_0%,_#F2F7FF_56%,_rgba(245,247,250,0)_100%)]" />
    <BasePaging
      ref="basePagingRef"
      v-model:list="newsItems"
      :auto="true"
      :fixed="false"
      empty-text=""
      :page-size="20"
      :use-page-scroll="true"
      @query="onQuery"
    >
      <view v-if="newsLoading && !newsItems.length" class="news-content flex flex-col gap-[18rpx]">
        <view
          v-for="index in 3"
          :key="index"
          class="border border-line/70 rounded-card bg-surface px-[24rpx] py-[22rpx]"
        >
          <wd-skeleton
            animation="gradient"
            :row-col="skeletonRows"
          />
        </view>
      </view>

      <view v-else-if="newsError && !newsItems.length" class="news-content border border-line/70 rounded-card bg-surface p-6 shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
        <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-surfaceSubtle text-secondary">
          <view class="i-carbon-warning-alt-filled text-[32rpx]" />
        </view>
        <text class="mt-4 block text-base text-primary font-600">
          快讯列表暂时没加载出来
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          你可以稍后重试，我们会继续帮你拉取最新市场动态。
        </text>
        <view class="mt-4">
          <wd-button block size="large" type="primary" :loading="newsLoading" @click="handleRefresh">
            重新加载
          </wd-button>
        </view>
      </view>

      <view v-else-if="!newsItems.length" class="news-content border border-line/70 rounded-card bg-surface p-6 shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
        <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
          <view class="i-carbon-flash text-[32rpx]" />
        </view>
        <text class="mt-4 block text-base text-primary font-600">
          现在还没有可展示的快讯
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          等服务端有新内容后，这里会自动显示最新市场消息。
        </text>
      </view>

      <template v-else>
        <view class="news-content flex flex-col gap-[18rpx]">
          <FlashNewsCard
            v-for="item in newsItems"
            :key="item.id"
            :item="item"
            :featured="item.id === newsItems[0]?.id"
          />
        </view>
      </template>

      <template #empty>
        <view />
      </template>
    </BasePaging>

    <ValuationBottomNav current="news" />
  </view>
</template>
