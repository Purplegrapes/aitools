<script setup lang="ts">
import type {
  HotFundServiceItem,
  HotSearchFund,
  MarketSentiment,
  MarketSentimentServiceResponse,
} from './types'
import { getHotSearchFunds, getMarketSentiment } from './api/valuationTool'
import HotSearchList from './components/HotSearchList.vue'
import RiskNoteCard from './components/RiskNoteCard.vue'
import SentimentCard from './components/SentimentCard.vue'
import ValuationBottomNav from './components/ValuationBottomNav.vue'
import {
  fallbackHotSearches,
  fallbackMarketSentiment,
  normalizeHotFundItem,
  normalizeMarketSentimentResponse,
} from './mock'
import { createResultPath, createSearchPath } from './utils'

definePage({
  name: 'valuation-tool-home',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '宝倍估值',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()

const {
  data: sentimentResponse,
  loading: sentimentLoading,
} = useRequest(() => getMarketSentiment(), {
  immediate: true,
  onError: () => undefined,
})

const {
  data: hotSearchResponse,
  loading: hotSearchLoading,
} = useRequest(() => getHotSearchFunds(), {
  immediate: true,
  onError: () => undefined,
})

const sentiment = computed<MarketSentiment>(() => {
  const payload = (sentimentResponse.value as { data?: MarketSentimentServiceResponse } | undefined)?.data
  return payload ? normalizeMarketSentimentResponse(payload) : fallbackMarketSentiment
})

const hotSearches = computed<HotSearchFund[]>(() => {
  const items = (hotSearchResponse.value as { data?: { items?: HotFundServiceItem[] } } | undefined)?.data?.items
  return items?.map(normalizeHotFundItem) || fallbackHotSearches
})

const isLoading = computed(() => sentimentLoading.value || hotSearchLoading.value)

onShow(() => {
  uni.hideTabBar()
})

function handleSelectHotSearch(item: HotSearchFund) {
  router.push(createResultPath(item.code))
}

function handleOpenSearch() {
  router.push(createSearchPath(''))
}
</script>

<template>
  <view class="relative overflow-x-hidden bg-page">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[360rpx] bg-[linear-gradient(180deg,_#E4EEFF_0%,_#EFF5FF_58%,_rgba(245,247,250,0)_100%)]" />
    <view class="pointer-events-none absolute right-[-30rpx] top-[78rpx] h-[164rpx] w-[164rpx] rounded-full bg-[radial-gradient(circle,_rgba(22,120,255,0.16)_0%,_rgba(22,120,255,0.03)_58%,_rgba(22,120,255,0)_100%)]" />
    <view class="pointer-events-none absolute left-[-36rpx] top-[126rpx] h-[120rpx] w-[120rpx] rounded-full bg-[radial-gradient(circle,_rgba(24,144,255,0.08)_0%,_rgba(24,144,255,0)_72%)]" />

    <view class="relative mx-auto box-border vt-page-x pb-[220rpx] pt-[28rpx]">
      <view class="px-[4rpx] pt-[72rpx]">
        <view class="max-w-[460rpx]">
          <text class="block text-[56rpx] text-primary font-700 leading-[1.08] tracking-[1rpx]">
            宝倍估值
          </text>
          <text class="mt-[14rpx] block text-[26rpx] text-secondary leading-[38rpx]">
            一键查估值，快速看懂你的基
          </text>
        </view>

        <view
          class="mt-[24rpx] vt-top-card px-[22rpx] py-[20rpx]"
          hover-class="opacity-92"
          @click="handleOpenSearch"
        >
          <view class="flex items-center gap-[14rpx]">
            <view class="h-[54rpx] w-[54rpx] flex shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
              <view class="i-carbon-search text-[32rpx]" />
            </view>
            <view class="min-w-0 flex-1">
              <text class="block text-[28rpx] text-primary font-600">
                查基金估值
              </text>
            </view>
            <view class="h-[64rpx] flex shrink-0 items-center justify-center rounded-[18rpx] bg-brand px-[24rpx]">
              <text class="text-[24rpx] text-white font-500">
                去搜索
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="mt-[18rpx] flex flex-col gap-[18rpx]">
        <view v-if="isLoading" class="border border-line/70 rounded-card bg-surface p-6 text-center shadow-[0_20rpx_60rpx_rgba(17,37,62,0.08)]">
          <wd-loading />
          <text class="mt-3 block text-[22rpx] text-secondary">
            正在准备首页内容...
          </text>
        </view>

        <template v-else>
          <SentimentCard :sentiment="sentiment" />
          <HotSearchList :items="hotSearches" @select="handleSelectHotSearch" />
        </template>

        <RiskNoteCard text="以上内容用于帮助你快速理解基金，不构成投资建议。短期涨跌只是一种参考，先判断它适不适合自己更重要。" />
      </view>
    </view>

    <ValuationBottomNav current="home" />
  </view>
</template>
