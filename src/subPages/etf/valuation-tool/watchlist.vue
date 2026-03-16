<script setup lang="ts">
import WatchlistFundCard from './components/WatchlistFundCard.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { createResultPath } from './utils'

definePage({
  name: 'etf-valuation-tool-watchlist',
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

function handleSelect(code: string) {
  router.push(createResultPath(code))
}

function handleRemove(code: string) {
  removeFromWatchlist(code)
}

function handleBackHome() {
  router.replace('/subPages/etf/valuation-tool/index')
}
</script>

<template>
  <view class="min-h-screen bg-page px-4 pb-8 pt-4">
    <view class="mx-auto max-w-[680rpx] flex flex-col gap-4">
      <view v-if="watchlistLoading" class="rounded-4 bg-surface p-6 text-center shadow-sm">
        <wd-loading />
        <text class="mt-3 block text-sm text-secondary">
          正在加载自选基金...
        </text>
      </view>

      <view v-else-if="watchlistError" class="rounded-4 bg-surface p-6 shadow-sm">
        <text class="block text-base text-primary font-600">
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

      <view v-else-if="!watchlistItems.length" class="rounded-4 bg-surface p-6 shadow-sm">
        <text class="block text-base text-primary font-600">
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
        <WatchlistFundCard
          v-for="item in watchlistItems"
          :key="item.code"
          :item="item"
          @remove="handleRemove"
          @select="handleSelect"
        />
      </template>
    </view>
  </view>
</template>
