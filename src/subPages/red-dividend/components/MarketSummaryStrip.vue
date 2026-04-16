<script setup lang="ts">
defineProps<{
  title: string
  strategyCore: string
  marketSummary: string
}>()
</script>

<template>
  <view class="relative min-h-[348rpx] overflow-hidden bg-[linear-gradient(180deg,_#090B0E_0%,_#101418_38%,_#171C22_68%,_#1E242B_100%)] px-[24rpx] pb-[62rpx] pt-[24rpx]">
    <view class="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,_rgba(201,212,224,0.2)_0%,_rgba(201,212,224,0)_24%)]" />
    <view class="absolute inset-x-0 bottom-0 h-[132rpx] bg-[linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.04)_100%)]" />
    <view class="absolute right-[90rpx] top-[58rpx] h-[110rpx] w-[110rpx] rounded-full bg-[#D2D9E2]/16 blur-[26rpx]" />

    <view class="relative z-1 min-h-[362rpx] flex flex-col">
      <view class="mt-[80rpx] max-w-[560rpx]">
        <text class="block text-xl text-white font-700 leading-[1.82]">
          {{ title }}
        </text>
        <text class="mt-[12rpx] block max-w-[500rpx] text-xs text-white/76 leading-[1.9]">
          {{ strategyCore }}
        </text>
      </view>
    </view>
  </view>
</template>
