<script setup lang="ts">
import type { MarketSentiment } from '../types'

const props = defineProps<{
  sentiment: MarketSentiment
}>()

const temperatureLabel = computed(() => `${props.sentiment.temperature}°C`)
const progress = computed(() => Math.min(Math.max(props.sentiment.temperature, 0), 100))
const thumbStyle = computed(() => {
  return {
    left: `calc(${progress.value}% - 18rpx)`,
  }
})
</script>

<template>
  <view class="overflow-hidden rounded-[32rpx] bg-surface px-[28rpx] py-[28rpx] shadow-[0_18rpx_54rpx_rgba(17,37,62,0.08)]">
    <view class="flex items-center justify-between gap-[20rpx]">
      <view class="flex items-center gap-[12rpx]">
        <view class="i-carbon-temperature text-[30rpx] text-brand" />
        <text class="text-[30rpx] text-primary font-600 leading-[42rpx]">
          今日市场情绪
        </text>
      </view>
      <view class="flex items-center gap-[8rpx] text-[20rpx] text-tertiary leading-[30rpx]">
        <view class="i-carbon-time text-[24rpx]" />
        <text>{{ sentiment.updateTime }} 提示更新</text>
      </view>
    </view>

    <view class="mt-[22rpx] flex items-center gap-[20rpx]">
      <text class="text-2xl text-success font-700 leading-none">
        {{ temperatureLabel }}
      </text>
      <view class="rounded-[12rpx] bg-success/12 px-[16rpx] py-[8rpx]">
        <text class="text-[22rpx] text-success font-600 leading-[30rpx]">
          {{ sentiment.label }}
        </text>
      </view>
    </view>

    <view class="relative mt-[28rpx] px-[2rpx]">
      <view class="h-[16rpx] overflow-hidden rounded-full bg-[linear-gradient(90deg,_#10B388_0%,_#7CC88E_26%,_#F4D7A4_56%,_#FF9B7C_76%,_#FF2020_100%)]" />
      <view
        class="absolute top-1/2 h-[26rpx] w-[26rpx] border-[6rpx] border-white rounded-full border-solid bg-[#8CC97F] shadow-[0_8rpx_18rpx_rgba(97,168,90,0.28)] -translate-y-1/2"
        :style="thumbStyle"
      />
    </view>

    <view class="mt-[16rpx] flex items-center justify-between text-[24rpx] text-secondary leading-[34rpx]">
      <text>极寒</text>
      <text>常温</text>
      <text>狂热</text>
    </view>

    <view class="mt-[28rpx] border border-[#CFE0FF] rounded-[20rpx] border-solid bg-[#F4F8FF] px-[22rpx] py-[22rpx]">
      <view class="flex items-start gap-[12rpx]">
        <view class="i-carbon-information text-[28rpx] text-brand" />
        <text class="min-w-0 flex-1 text-[24rpx] text-brand leading-[40rpx]">
          {{ sentiment.description }}
        </text>
      </view>
    </view>
  </view>
</template>
