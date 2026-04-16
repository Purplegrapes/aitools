<script setup lang="ts">
import type { RedDividendCategoryMetric } from '../types'
import { formatAmountWithSign } from '../utils'

defineProps<{
  metric: RedDividendCategoryMetric
  categoryName: string
}>()
</script>

<template>
  <view class="border border-rdLine rounded-[24rpx] bg-rdPaper px-[22rpx] py-[22rpx] shadow-[0_18rpx_36rpx_rgba(61,46,28,0.08)]">
    <view class="flex items-start justify-between gap-[20rpx]">
      <view class="min-w-0 flex-1">
        <text class="block text-xs text-secondary leading-[1.6]">
          投入10万 · 一年分红预估
        </text>
        <text class="mt-[8rpx] block text-base text-rdGold font-800">
          {{ formatAmountWithSign(metric.annualDividendAmountBy100k) }}
        </text>
      </view>
    </view>
    <text class="mt-[10rpx] block text-xs text-secondary leading-[1.7]">
      按静态股息率估算，仅作策略理解
    </text>

    <view class="grid grid-cols-3 mt-[22rpx] gap-[16rpx]">
      <view
        v-for="item in metric.attributes"
        :key="item.label"
        class="border border-white/70 rounded-[20rpx] bg-white px-[18rpx] py-[18rpx] shadow-[0_8rpx_20rpx_rgba(42,34,23,0.05)]"
      >
        <text class="block text-xs text-secondary leading-[1.6]">
          {{ item.label }}
        </text>
        <text class="mt-[8rpx] block text-sm text-primary font-700 leading-[1.4]">
          {{ item.value }}
        </text>
      </view>
    </view>
  </view>
</template>
