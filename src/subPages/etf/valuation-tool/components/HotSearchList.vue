<script setup lang="ts">
import type { HotSearchFund } from '../types'

defineProps<{
  items: HotSearchFund[]
}>()

const emit = defineEmits<{
  select: [item: HotSearchFund]
}>()
</script>

<template>
  <view class="border border-line/70 rounded-[36rpx] bg-surface px-[28rpx] py-[28rpx] shadow-[0_20rpx_60rpx_rgba(17,37,62,0.08)]">
    <view class="flex items-center justify-between gap-[20rpx]">
      <view class="flex items-center gap-[14rpx]">
        <view class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-full bg-page text-brand">
          <view class="i-carbon-chart-line-smooth text-[24rpx]" />
        </view>
        <text class="text-[28rpx] text-primary font-600">
          热搜榜单
        </text>
      </view>
      <text class="text-[20rpx] text-secondary tracking-[1rpx]">
        实时热搜
      </text>
    </view>

    <view class="mt-[24rpx] flex flex-col gap-[18rpx]">
      <view
        v-for="item in items"
        :key="item.code"
        class="flex items-center gap-[18rpx] border border-line/70 rounded-[28rpx] bg-page px-[22rpx] py-[22rpx]"
        @click="emit('select', item)"
      >
        <view class="h-[60rpx] w-[60rpx] flex shrink-0 items-center justify-center rounded-[22rpx] bg-surface text-[24rpx] text-brand font-700">
          {{ item.rank }}
        </view>
        <view class="min-w-0 flex-1">
          <text class="block truncate text-[24rpx] text-primary font-600">
            {{ item.name }}
          </text>
          <text class="mt-[8rpx] block text-[20rpx] text-secondary tracking-[1rpx]">
            {{ item.code }}
          </text>
        </view>
        <view class="flex shrink-0 flex-col items-end gap-[10rpx]">
          <wd-tag bg-color="rgba(22,120,255,0.12)" custom-class="!rounded-full !border-none !px-[18rpx] !py-[8rpx]">
            <text class="text-[20rpx] text-brand">
              {{ item.tag }}
            </text>
          </wd-tag>
          <view class="flex items-center gap-[8rpx] text-[18rpx] text-secondary">
            <text>查看</text>
            <view class="i-carbon-arrow-up-right" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
