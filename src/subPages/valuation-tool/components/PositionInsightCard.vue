<script setup lang="ts">
import type { PortfolioInsight } from '../types'

defineProps<{
  insight: PortfolioInsight
}>()
</script>

<template>
  <view class="rounded-[16rpx] bg-brand-muted px-[20rpx] py-[18rpx]">
    <text class="block text-[24rpx] text-primary font-600">
      {{ insight.title }}
    </text>
    <text class="mt-[8rpx] block text-[22rpx] text-regular leading-[34rpx]">
      {{ insight.description }}
    </text>
  </view>
</template>
