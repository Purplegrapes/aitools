<script setup lang="ts">
import WatchlistFundCard from './components/WatchlistFundCard.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { createResultPath } from './utils'

definePage({
  name: 'valuation-tool-watchlist',
  layout: 'default',
  style: {
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
  removeFromWatchlist,
} = useValuationWatchlist()

onShow(() => {
  refreshWatchlist(true)
})

const watchlistSummary = computed(() => {
  const items = watchlistItems.value
  const risingCount = items.filter(item => typeof item.dailyChange === 'number' && item.dailyChange > 0).length
  const fallingCount = items.filter(item => typeof item.dailyChange === 'number' && item.dailyChange < 0).length

  return {
    total: items.length,
    risingCount,
    fallingCount,
  }
})

function handleSelect(code: string) {
  router.push(createResultPath(code))
}

function handleRemove(code: string) {
  removeFromWatchlist(code)
}

function handleBackHome() {
  router.replace('/subPages/valuation-tool/index')
}
</script>

<template>
  <view class="min-h-screen bg-page vt-page-shell pb-8">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[280rpx] bg-[radial-gradient(circle_at_top,_rgba(22,120,255,0.14),_transparent_62%)]" />

    <view class="relative mx-auto flex flex-col gap-4">
      <view class="border border-line/70 vt-card bg-surface shadow-[0_20rpx_48rpx_rgba(17,37,62,0.06)]">
        <view class="flex items-start justify-between gap-4">
          <view class="min-w-0 flex-1">
            <text class="block text-lg text-primary font-600">
              自选基金
            </text>
            <text class="mt-2 block text-sm text-regular leading-6">
              在这里快速比较你关注基金的当日表现，决定要不要进一步点开查看。
            </text>
          </view>
          <view class="h-[72rpx] w-[72rpx] flex shrink-0 items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
            <view class="i-carbon-star text-[34rpx]" />
          </view>
        </view>

        <view class="grid grid-cols-3 mt-5 gap-3">
          <view class="rounded-[24rpx] bg-surfaceSubtle px-3 py-3">
            <text class="block text-xs text-secondary">
              已自选
            </text>
            <text class="mt-2 block text-lg text-primary font-600">
              {{ watchlistSummary.total }}
            </text>
          </view>
          <view class="rounded-[24rpx] bg-surfaceSubtle px-3 py-3">
            <text class="block text-xs text-secondary">
              今日上涨
            </text>
            <text class="mt-2 block text-lg text-danger font-600">
              {{ watchlistSummary.risingCount }}
            </text>
          </view>
          <view class="rounded-[24rpx] bg-surfaceSubtle px-3 py-3">
            <text class="block text-xs text-secondary">
              今日下跌
            </text>
            <text class="mt-2 block text-lg text-success font-600">
              {{ watchlistSummary.fallingCount }}
            </text>
          </view>
        </view>
      </view>

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
          <wd-button size="small" type="primary" @click="refreshWatchlist(true)">
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
          <wd-button size="small" type="primary" @click="handleBackHome">
            去找基金
          </wd-button>
        </view>
      </view>

      <template v-else>
        <view class="overflow-hidden border border-line/70 rounded-card bg-surface shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
          <view class="grid grid-cols-[minmax(0,1.4fr)_120rpx_110rpx_120rpx] items-center gap-[12rpx] bg-surfaceSubtle px-4 py-3">
            <text class="text-xs text-secondary font-600">
              基金
            </text>
            <text class="text-center text-xs text-secondary font-600">
              当日涨幅
            </text>
            <text class="text-center text-xs text-secondary font-600">
              更新时间
            </text>
            <text class="text-right text-xs text-secondary font-600">
              操作
            </text>
          </view>

          <WatchlistFundCard
            v-for="item in watchlistItems"
            :key="item.code"
            :item="item"
            @remove="handleRemove"
            @select="handleSelect"
          />
        </view>
      </template>
    </view>
  </view>
</template>
