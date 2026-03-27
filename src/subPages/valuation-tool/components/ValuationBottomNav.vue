<script setup lang="ts">
import { createHoldingsPath, createNewsPath, createValuationHomePath, createWatchlistPath } from '../utils'

const props = defineProps<{
  current: 'home' | 'watchlist' | 'holdings' | 'news'
}>()

const router = useRouter()

const items = [
  {
    key: 'home',
    title: '首页',
    icon: 'i-carbon-home',
    path: createValuationHomePath(),
  },
  {
    key: 'news',
    title: '快讯',
    icon: 'i-carbon-flash',
    path: createNewsPath(),
  },
  {
    key: 'watchlist',
    title: '自选',
    icon: 'i-carbon-star',
    path: createWatchlistPath(),
  },
  {
    key: 'holdings',
    title: '持仓',
    icon: 'i-carbon-wallet',
    path: createHoldingsPath(),
  },
] as const

function handleNavigate(path: string, key: typeof items[number]['key']) {
  if (props.current === key)
    return

  router.replace(path)
}
</script>

<template>
  <view class="vt-action-bar">
    <view class="flex items-center gap-[16rpx]">
      <view
        v-for="item in items"
        :key="item.key"
        class="h-[88rpx] min-w-0 flex flex-1 flex-col items-center justify-center gap-[6rpx] px-[12rpx] text-[20rpx] font-500 transition-colors"
        :class="props.current === item.key
          ? 'text-brand'
          : 'text-secondary'"
        @click="handleNavigate(item.path, item.key)"
      >
        <view
          :class="item.icon"
          class="text-[28rpx]"
        />
        <text class="whitespace-nowrap leading-[1.2]">
          {{ item.title }}
        </text>
      </view>
    </view>
  </view>
</template>
