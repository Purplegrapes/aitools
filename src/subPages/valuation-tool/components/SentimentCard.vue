<script setup lang="ts">
import type { MarketSentiment } from '../types'

const props = defineProps<{
  sentiment: MarketSentiment
}>()

const temperatureLabel = computed(() => `${props.sentiment.temperature}°C`)
const trackStyle = computed(() => {
  const progress = Math.min(Math.max(props.sentiment.temperature, 0), 100)
  return {
    width: `${progress}%`,
  }
})
</script>

<template>
  <view class="overflow-hidden border border-line/70 rounded-[36rpx] bg-surface px-[28rpx] py-[28rpx] shadow-[0_20rpx_60rpx_rgba(17,37,62,0.08)]">
    <view class="flex items-center justify-between gap-[24rpx]">
      <view class="flex items-center gap-[14rpx]">
        <view class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-full bg-page text-brand">
          <view class="i-carbon-ibm-cloud-pak-manta-automated-data-lineage text-[24rpx]" />
        </view>
        <text class="text-[28rpx] text-primary font-600">
          今日市场情绪
        </text>
      </view>
      <text class="text-[20rpx] text-secondary tracking-[1rpx]">
        {{ sentiment.updateTime }} 估算更新
      </text>
    </view>

    <view class="mt-[26rpx] flex items-end justify-between gap-[18rpx]">
      <view class="flex items-end gap-[16rpx]">
        <text class="text-[50rpx] text-primary font-700 leading-none">
          {{ temperatureLabel }}
        </text>
        <text class="pb-[8rpx] text-[24rpx] text-brand font-600 tracking-[2rpx]">
          {{ sentiment.label }}
        </text>
      </view>
      <view class="border border-line rounded-full bg-page px-[18rpx] py-[10rpx]">
        <text class="text-[18rpx] text-secondary">
          情绪脉冲
        </text>
      </view>
    </view>

    <view class="mt-[26rpx] rounded-full bg-page p-[8rpx]">
      <view class="h-[12rpx] overflow-hidden rounded-full bg-surfaceMuted">
        <view class="h-full rounded-full bg-brand shadow-[0_0_20rpx_rgba(22,120,255,0.35)]" :style="trackStyle" />
      </view>
    </view>

    <view class="mt-[14rpx] flex items-center justify-between text-[18rpx] text-secondary">
      <text>极寒</text>
      <text>常温</text>
      <text>狂热</text>
    </view>

    <view class="mt-[24rpx] rounded-[28rpx] bg-page px-[22rpx] py-[22rpx]">
      <text class="block text-[22rpx] text-regular leading-[36rpx]">
        {{ sentiment.description }}
      </text>
    </view>
  </view>
</template>
