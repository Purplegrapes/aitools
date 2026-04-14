<script setup lang="ts">
defineProps<{
  title: string
  summary: string
  strategyCore: string
  marketSummary: string
}>()
</script>

<template>
  <view class="border border-[#EDE7DE] rounded-[40rpx] px-[36rpx] py-[40rpx] shadow-[0_22rpx_50rpx_rgba(42,34,23,0.06)]">
    <view class="mx-auto h-[140rpx] w-[140rpx] flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,_rgba(255,255,255,0.98)_0%,_rgba(245,242,236,0.9)_20%,_rgba(185,181,173,0.72)_42%,_rgba(110,106,100,0.96)_100%)] shadow-[0_20rpx_40rpx_rgba(60,50,38,0.12)]">
      <view class="h-[46rpx] w-[46rpx] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.96)_0%,_rgba(226,220,210,0.72)_48%,_rgba(132,128,122,0.16)_100%)]" />
    </view>

    <text class="mt-[28rpx] block text-center text-xl text-primary font-700 leading-[1.5] tracking-[-1rpx]">
      {{ title }}
    </text>

    <view class="mt-[26rpx] border-t border-[#E8E1D8] pt-[24rpx]">
      <text class="block text-center text-sm text-secondary leading-[1.7]">
        策略核心：{{ strategyCore }}
      </text>
    </view>
  </view>
</template>
