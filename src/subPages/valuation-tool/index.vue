<script setup lang="ts">
import type { HotSearchFund, MarketSentiment } from './types'
import { getHotSearchFunds, getMarketSentiment } from './api/valuationTool'
import HomeActionBar from './components/HomeActionBar.vue'
import HotSearchList from './components/HotSearchList.vue'
import SentimentCard from './components/SentimentCard.vue'
import ValuationSearchBar from './components/ValuationSearchBar.vue'
import { fallbackHotSearches, fallbackMarketSentiment } from './mock'
import { createHoldingsPath, createResultPath, createSearchPath, createWatchlistPath } from './utils'

definePage({
  name: 'valuation-tool-home',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF估值工具',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const searchKeyword = shallowRef('')

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
  return (sentimentResponse.value as { data?: MarketSentiment } | undefined)?.data || fallbackMarketSentiment
})

const hotSearches = computed<HotSearchFund[]>(() => {
  return (hotSearchResponse.value as { data?: { items?: HotSearchFund[] } } | undefined)?.data?.items || fallbackHotSearches
})

const isLoading = computed(() => sentimentLoading.value || hotSearchLoading.value)

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword)
    return

  router.push(createSearchPath(keyword))
}

function handleSelectHotSearch(item: HotSearchFund) {
  router.push(createResultPath(item.code))
}

function handleOpenWatchlist() {
  router.push(createWatchlistPath())
}

function handleOpenHoldings() {
  router.push(createHoldingsPath())
}
</script>

<template>
  <view class="relative min-h-screen overflow-x-hidden bg-page">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[540rpx] bg-[linear-gradient(180deg,_#D8E8FF_0%,_#EAF2FF_52%,_rgba(245,247,250,0)_100%)]" />
    <view class="pointer-events-none absolute right-[-44rpx] top-[66rpx] h-[228rpx] w-[220rpx] rotate-[8deg] rounded-[46rpx] bg-[linear-gradient(180deg,_rgba(67,191,255,0.3),_rgba(22,120,255,0.08))] shadow-[0_24rpx_50rpx_rgba(38,115,255,0.16)]" />
    <view class="pointer-events-none absolute right-[30rpx] top-[92rpx] h-[198rpx] w-[152rpx] border border-white/60 rounded-[32rpx] border-solid bg-[linear-gradient(180deg,_rgba(255,255,255,0.84),_rgba(230,240,255,0.42))]" />
    <view class="pointer-events-none absolute right-[76rpx] top-[130rpx] h-[92rpx] w-[92rpx] border-[10rpx] border-[#63B8FF]/55 rounded-full border-solid" />
    <view class="pointer-events-none absolute right-[58rpx] top-[194rpx] h-[16rpx] w-[112rpx] rotate-[44deg] rounded-full bg-[#2A69FF]/75" />
    <view class="pointer-events-none absolute right-[118rpx] top-[118rpx] h-[92rpx] w-[4rpx] rounded-full bg-white/55 shadow-[24rpx_0_0_rgba(255,255,255,0.42),_48rpx_0_0_rgba(255,255,255,0.28)]" />

    <view class="relative mx-auto box-border vt-page-x pb-[180rpx] pt-[28rpx]">
      <view class="min-h-[288rpx] px-[4rpx] pt-[96rpx]">
        <view class="max-w-[430rpx]">
          <text class="block text-[56rpx] text-primary font-700 leading-[1.08] tracking-[1rpx]">
            ETF估值工具
          </text>
          <text class="mt-[18rpx] block text-[26rpx] text-secondary leading-[40rpx]">
            一键查估值，快速看懂你的基
          </text>
        </view>

        <view class="mt-[34rpx]">
          <ValuationSearchBar
            v-model="searchKeyword"
            placeholder="请输入基金全称或代码"
            button-text="查询"
            @submit="handleSearch"
          />
        </view>
      </view>

      <view class="mt-[6rpx] flex flex-col gap-[18rpx]">
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

        <view>
          <view class="flex items-center gap-[12rpx]">
            <view class="i-carbon-information text-[24rpx] text-secondary" />
            <text class="min-w-0 flex-1 text-[22rpx] text-secondary leading-[36rpx]">
              以上内容用于帮助你快速理解基金，不构成投资建议。短期涨跌只是一种参考，先判断它适不适合自己更重要。
            </text>
          </view>
        </view>
      </view>
    </view>

    <HomeActionBar
      @open-holdings="handleOpenHoldings"
      @open-watchlist="handleOpenWatchlist"
    />
  </view>
</template>
