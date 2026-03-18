<script setup lang="ts">
import type { HotSearchFund } from '../types'

const props = defineProps<{
  items: HotSearchFund[]
}>()

const emit = defineEmits<{
  select: [item: HotSearchFund]
}>()

function getRankClass(rank: number) {
  return rank <= 3 ? 'text-danger' : 'text-tertiary'
}
</script>

<template>
  <view class="vt-card bg-surface">
    <view class="flex items-center gap-[14rpx]">
      <view class="i-carbon-fire text-[32rpx] text-danger" />
      <text class="text-[34rpx] text-primary font-600 leading-[48rpx]">
        热搜排行榜
      </text>
    </view>

    <view class="mt-[20rpx] flex flex-col">
      <view
        v-for="item in props.items"
        :key="item.code"
        class="flex items-center gap-[22rpx] px-[6rpx] py-[20rpx]"
        @click="emit('select', item)"
      >
        <view class="w-[42rpx] shrink-0 text-center text-[34rpx] font-700 leading-[44rpx]" :class="getRankClass(item.rank)">
          {{ item.rank }}
        </view>
        <view class="min-w-0 flex-1">
          <text class="block truncate text-[30rpx] text-primary leading-[42rpx]">
            {{ item.name }}
          </text>
          <text class="mt-[6rpx] block text-[24rpx] text-secondary leading-[34rpx]">
            {{ item.code }}
          </text>
        </view>
        <view class="shrink-0 rounded-[12rpx] bg-surfaceSubtle px-[16rpx] py-[10rpx]">
          <text class="text-[22rpx] text-secondary leading-[30rpx]">
            {{ item.tag }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
