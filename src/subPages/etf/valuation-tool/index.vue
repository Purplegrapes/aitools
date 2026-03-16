<script setup lang="ts">
import type { HotSearchFund, MarketSentiment } from './types'
import { getHotSearchFunds, getMarketSentiment } from '../api/valuationTool'
import HotSearchList from './components/HotSearchList.vue'
import SentimentCard from './components/SentimentCard.vue'
import ValuationSearchBar from './components/ValuationSearchBar.vue'
import { fallbackHotSearches, fallbackMarketSentiment } from './mock'
import { createResultPath, createSearchPath } from './utils'

definePage({
  name: 'etf-valuation-tool-home',
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
const heroBadges = [
  '移动端基金翻译器',
  '轻量读懂今日状态',
  '不构成投资建议',
]

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword)
    return

  router.push(createSearchPath(keyword))
}

function handleSelectHotSearch(item: HotSearchFund) {
  router.push(createResultPath(item.code))
}
</script>

<template>
  <view class="min-h-screen overflow-hidden bg-page">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[420rpx] bg-[radial-gradient(circle_at_top,_rgba(22,120,255,0.18),_transparent_60%)]" />
    <view class="pointer-events-none absolute left-[-120rpx] top-[120rpx] h-[280rpx] w-[280rpx] rounded-full bg-[rgba(24,144,255,0.08)] blur-[40rpx]" />
    <view class="pointer-events-none absolute right-[-80rpx] top-[260rpx] h-[220rpx] w-[220rpx] rounded-full bg-[rgba(29,33,41,0.05)] blur-[44rpx]" />

    <view class="relative mx-auto max-w-[680rpx] px-4 pb-10 pt-4">
      <view>
        <view>
          <text class="mt-[18rpx] block text-[48rpx] text-primary font-700 leading-[1.08] tracking-[1rpx]">
            ETF估值工具
          </text>
          <text class="mt-[14rpx] block max-w-[520rpx] text-[24rpx] text-regular leading-[38rpx]">
            一键查估值，快速看懂你的基。先看它投什么，再看它今天大概怎么样。
          </text>
        </view>

        <view class="mt-[24rpx] flex flex-wrap gap-[12rpx]">
          <view
            v-for="badge in heroBadges"
            :key="badge"
          >
            <wd-tag mark type="primary" plain>
              {{ badge }}
            </wd-tag>
          </view>
        </view>

        <view class="mt-[26rpx]">
          <ValuationSearchBar
            v-model="searchKeyword"
            placeholder="输入基金全称或代码"
            button-text="查询"
            @submit="handleSearch"
          />
        </view>
      </view>

      <view class="mt-[24rpx] flex flex-col gap-[18rpx]">
        <view v-if="isLoading" class="border border-line/70 rounded-[36rpx] bg-surface p-6 text-center shadow-[0_20rpx_60rpx_rgba(17,37,62,0.08)]">
          <wd-loading />
          <text class="mt-3 block text-[22rpx] text-secondary">
            正在准备首页内容...
          </text>
        </view>

        <template v-else>
          <SentimentCard :sentiment="sentiment" />
          <HotSearchList :items="hotSearches" @select="handleSelectHotSearch" />
        </template>

        <view class="border border-line/70 rounded-[36rpx] bg-surface px-[28rpx] py-[28rpx] shadow-[0_20rpx_60rpx_rgba(17,37,62,0.08)]">
          <view class="flex items-center justify-between gap-[16rpx]">
            <text class="text-[28rpx] text-primary font-600">
              新手阅读顺序
            </text>
            <text class="text-[20rpx] text-secondary tracking-[2rpx]">
              阅读指引
            </text>
          </view>
          <view class="mt-[20rpx] flex flex-col gap-[14rpx]">
            <view class="flex items-start gap-[14rpx] rounded-[24rpx] bg-page px-[20rpx] py-[18rpx]">
              <view class="h-[44rpx] w-[44rpx] flex shrink-0 items-center justify-center rounded-full bg-brand text-[22rpx] text-inverse font-700">
                1
              </view>
              <view>
                <text class="block text-[24rpx] text-primary font-600">
                  先看它投什么
                </text>
                <text class="mt-[6rpx] block text-[22rpx] text-regular leading-[36rpx]">
                  先判断这只基金跟的是大盘、红利、黄金还是海外科技，不急着盯当天涨跌。
                </text>
              </view>
            </view>
            <view class="flex items-start gap-[14rpx] rounded-[24rpx] bg-page px-[20rpx] py-[18rpx]">
              <view class="h-[44rpx] w-[44rpx] flex shrink-0 items-center justify-center rounded-full bg-primary text-[22rpx] text-inverse font-700">
                2
              </view>
              <view>
                <text class="block text-[24rpx] text-primary font-600">
                  再看今天大概怎么样
                </text>
                <text class="mt-[6rpx] block text-[22rpx] text-regular leading-[36rpx]">
                  把今天的状态当成理解市场的小线索，而不是立刻下结论的理由。
                </text>
              </view>
            </view>
          </view>
        </view>

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
  </view>
</template>
