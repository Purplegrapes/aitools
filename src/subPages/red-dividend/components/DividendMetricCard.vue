<script setup lang="ts">
import type { RedDividendCategoryMetric } from '../types'
import { formatAmountWithSign } from '../utils'

defineProps<{
  metric: RedDividendCategoryMetric
  categoryName: string
}>()
</script>

<template>
  <view class="rd-panel-soft">
    <view class="flex items-start justify-between gap-[20rpx]">
      <view>
        <text class="block text-sm text-secondary">
          投入10万 · 一年分红预估
        </text>
        <text class="mt-[10rpx] block text-sm text-rdGold font-700">
          {{ formatAmountWithSign(metric.annualDividendAmountBy100k) }}
        </text>
      </view>
      <view class="pt-[46rpx] text-sm text-rdGold font-700">
        {{ categoryName }}
      </view>
    </view>
    <text class="mt-[10rpx] block text-xs text-secondary">
      按静态股息率估算，仅作策略理解
    </text>

    <view class="grid grid-cols-3 mt-[22rpx] gap-[16rpx]">
      <view v-for="item in metric.attributes" :key="item.label" class="rounded-[28rpx] bg-[#F3EFE8] px-[18rpx] py-[18rpx]">
        <text class="block text-xs text-secondary">
          {{ item.label }}
        </text>
        <text class="mt-[10rpx] block text-xs text-primary font-700">
          {{ item.value }}
        </text>
      </view>
    </view>
  </view>
</template>
