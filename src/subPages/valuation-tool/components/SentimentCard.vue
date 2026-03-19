<script setup lang="ts">
import type { MarketSentiment } from '../types'

const props = defineProps<{
  sentiment: MarketSentiment
}>()

const temperatureLabel = computed(() => `${props.sentiment.temperature}°C`)
const progress = computed(() => Math.min(Math.max(props.sentiment.temperature, 0), 100))
const sentimentTone = computed(() => {
  const toneMap: Record<MarketSentiment['level'], { color: string, softBg: string, shadow: string }> = {
    freezing: {
      color: '#10B388',
      softBg: 'rgba(16,179,136,0.12)',
      shadow: '0 8rpx 18rpx rgba(16,179,136,0.24)',
    },
    cool: {
      color: '#7CC88E',
      softBg: 'rgba(124,200,142,0.16)',
      shadow: '0 8rpx 18rpx rgba(124,200,142,0.24)',
    },
    neutral: {
      color: '#D6A23C',
      softBg: 'rgba(244,215,164,0.28)',
      shadow: '0 8rpx 18rpx rgba(214,162,60,0.20)',
    },
    hot: {
      color: '#FF7A1A',
      softBg: 'rgba(255,122,26,0.14)',
      shadow: '0 8rpx 18rpx rgba(255,122,26,0.24)',
    },
  }

  return toneMap[props.sentiment.level]
})
const thumbStyle = computed(() => {
  return {
    left: `calc(${progress.value}% - 18rpx)`,
    background: sentimentTone.value.color,
    boxShadow: sentimentTone.value.shadow,
  }
})
</script>

<template>
  <view class="overflow-hidden vt-card bg-surface">
    <view class="flex items-center justify-between gap-[20rpx]">
      <view class="flex items-center gap-[12rpx]">
        <view class="i-carbon-temperature text-[30rpx]" :style="{ color: sentimentTone.color }" />
        <text class="text-base text-primary font-600 leading-[42rpx]">
          今日市场情绪
        </text>
      </view>
      <view class="flex items-center gap-[8rpx] text-[20rpx] text-tertiary leading-[30rpx]">
        <view class="i-carbon-time text-[24rpx]" />
        <text>{{ sentiment.updateTime }} 提示更新</text>
      </view>
    </view>

    <view class="mt-[30rpx] flex items-center gap-[20rpx]">
      <text class="text-2xl font-700 leading-none" :style="{ color: sentimentTone.color }">
        {{ temperatureLabel }}
      </text>
      <view class="rounded-[12rpx] px-[16rpx] py-[8rpx]" :style="{ background: sentimentTone.softBg }">
        <text class="text-[22rpx] font-600 leading-[30rpx]" :style="{ color: sentimentTone.color }">
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

    <view class="mt-[28rpx] rounded-panel vt-panel-tight bg-[#F4F8FF]">
      <view class="flex items-start gap-[12rpx]">
        <wd-icon name="info-circle" size="20px" :color="sentimentTone.color" />
        <text class="min-w-0 flex-1 text-[24rpx] leading-[40rpx]" :style="{ color: sentimentTone.color }">
          {{ sentiment.description }}
        </text>
      </view>
    </view>
  </view>
</template>
