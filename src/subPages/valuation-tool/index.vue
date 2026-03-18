<script setup lang="ts">
import type { HotSearchFund, MarketSentiment } from './types'
import { getHotSearchFunds, getMarketSentiment } from './api/valuationTool'
import HomeActionBar from './components/HomeActionBar.vue'
import HotSearchList from './components/HotSearchList.vue'
import RiskNoteCard from './components/RiskNoteCard.vue'
import SentimentCard from './components/SentimentCard.vue'
import ValuationSearchBar from './components/ValuationSearchBar.vue'
import { fallbackHotSearches, fallbackMarketSentiment } from './mock'
import { createHoldingsPath, createResultPath, createSearchPath, createWatchlistPath } from './utils'

definePage({
  name: 'valuation-tool-home',
  layout: 'default',
  style: {
    navigationBarTitleText: '宝倍估值',
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
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[360rpx] bg-[linear-gradient(180deg,_#E4EEFF_0%,_#EFF5FF_58%,_rgba(245,247,250,0)_100%)]" />
    <view class="pointer-events-none absolute right-[-30rpx] top-[78rpx] h-[164rpx] w-[164rpx] rounded-full bg-[radial-gradient(circle,_rgba(22,120,255,0.16)_0%,_rgba(22,120,255,0.03)_58%,_rgba(22,120,255,0)_100%)]" />
    <view class="pointer-events-none absolute left-[-36rpx] top-[126rpx] h-[120rpx] w-[120rpx] rounded-full bg-[radial-gradient(circle,_rgba(24,144,255,0.08)_0%,_rgba(24,144,255,0)_72%)]" />

    <view class="relative mx-auto box-border vt-page-x pb-[180rpx] pt-[28rpx]">
      <view class="px-[4rpx] pt-[72rpx]">
        <view class="max-w-[460rpx]">
          <text class="block text-[56rpx] text-primary font-700 leading-[1.08] tracking-[1rpx]">
            宝倍估值
          </text>
          <text class="mt-[14rpx] block text-[26rpx] text-secondary leading-[38rpx]">
            一键查估值，快速看懂你的基
          </text>
        </view>

        <view class="mt-[24rpx]">
          <ValuationSearchBar
            v-model="searchKeyword"
            placeholder="请输入基金全称或代码"
            button-text="查询"
            @submit="handleSearch"
          />
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

    <HomeActionBar
      @open-holdings="handleOpenHoldings"
      @open-watchlist="handleOpenWatchlist"
    />
  </view>
</template>
