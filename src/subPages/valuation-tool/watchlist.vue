<script setup lang="ts">
import ValuationBottomNav from './components/ValuationBottomNav.vue'
import WatchlistFundCard from './components/WatchlistFundCard.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { createResultPath, createValuationHomePath } from './utils'

definePage({
  name: 'valuation-tool-watchlist',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '自选基金',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const {
  watchlistItems,
  watchlistLoading,
  watchlistError,
  refreshWatchlist,
} = useValuationWatchlist()

onShow(() => {
  refreshWatchlist(true)
})

const sortedWatchlistItems = computed(() => {
  return [...watchlistItems.value].sort((a, b) => {
    const aHasValue = typeof a.dailyChange === 'number'
    const bHasValue = typeof b.dailyChange === 'number'
    if (aHasValue && bHasValue)
      return (b.dailyChange as number) - (a.dailyChange as number)
    if (aHasValue)
      return -1
    if (bHasValue)
      return 1
    return 0
  })
})

function handleSelect(code: string) {
  router.push(createResultPath(code))
}

function handleBackHome() {
  router.replace(createValuationHomePath())
}
</script>

<template>
  <view class="bg-page vt-page-shell pb-[220rpx]">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[280rpx] bg-[radial-gradient(circle_at_top,_rgba(22,120,255,0.14),_transparent_62%)]" />

    <view class="relative mx-auto flex flex-col gap-4">
      <view v-if="watchlistLoading" class="border border-line/70 rounded-card bg-surface p-6 text-center shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
        <wd-loading />
        <text class="mt-3 block text-sm text-secondary">
          正在加载自选基金...
        </text>
      </view>

      <view v-else-if="watchlistError" class="border border-line/70 rounded-card bg-surface p-6 shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
        <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-surfaceSubtle text-secondary">
          <view class="i-carbon-warning-alt-filled text-[32rpx]" />
        </view>
        <text class="mt-4 block text-base text-primary font-600">
          自选列表暂时没加载出来
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          你可以稍后重试，或者先回首页继续搜索基金。
        </text>
        <view class="mt-4">
          <wd-button block size="large" type="primary" @click="refreshWatchlist(true)">
            重新加载
          </wd-button>
        </view>
      </view>

      <view v-else-if="!watchlistItems.length" class="border border-line/70 rounded-card bg-surface p-6 shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
        <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
          <view class="i-carbon-search text-[32rpx]" />
        </view>
        <text class="mt-4 block text-base text-primary font-600">
          你还没有加入任何自选基金
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          去基金详情页点一下“加入自选”，之后就能在这里快速比较当日表现。
        </text>
        <view class="mt-4">
          <wd-button block size="large" type="primary" @click="handleBackHome">
            去找基金
          </wd-button>
        </view>
      </view>

      <template v-else>
        <view class="overflow-hidden border border-line/70 rounded-card bg-surface shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
          <view class="grid grid-cols-[minmax(0,1.5fr)_140rpx_140rpx] items-center gap-[12rpx] bg-surfaceSubtle px-4 py-3">
            <text class="text-xs text-secondary font-600">
              基金
            </text>
            <view class="text-center">
              <text class="block text-xs text-secondary font-600">
                当日涨幅
              </text>
            </view>
            <view class="text-center">
              <text class="block text-xs text-secondary font-600">
                实时净值
              </text>
            </view>
          </view>

          <WatchlistFundCard
            v-for="item in sortedWatchlistItems"
            :key="item.code"
            :item="item"
            @select="handleSelect"
          />
        </view>
      </template>
    </view>

    <ValuationBottomNav current="watchlist" />
  </view>
</template>
