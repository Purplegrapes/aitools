<script setup lang="ts">
import type { RedDividendCategory } from '../types'

defineProps<{
  strategy: RedDividendCategory
}>()

const emit = defineEmits<{
  select: [categoryCode: RedDividendCategory['categoryCode']]
}>()
</script>

<template>
  <view class="overflow-hidden rounded-[40rpx] bg-surface shadow-[0_20rpx_48rpx_rgba(17,37,62,0.07)]" @click="emit('select', strategy.categoryCode)">
    <view class="relative h-[320rpx] overflow-hidden bg-rdHeroBlack">
      <view class="absolute left-[330rpx] top-[64rpx] h-[160rpx] w-[160rpx] rounded-full bg-[#F3C34C] blur-[10rpx]" />
      <view class="absolute left-[398rpx] top-[88rpx] h-[112rpx] w-[140rpx] rounded-full bg-[#F27A4A]/88 blur-[18rpx]" />
      <view class="absolute left-[452rpx] top-[94rpx] h-[116rpx] w-[96rpx] rounded-full bg-[#91A3D8]/72 blur-[22rpx]" />
      <view class="absolute left-[342rpx] top-[74rpx] h-[136rpx] w-[136rpx] rounded-full bg-[radial-gradient(circle_at_58%_52%,_#FFD36C_0%,_#F6AC48_36%,_#312415_72%,_#111111_100%)] shadow-[0_0_0_8rpx_rgba(0,0,0,0.14)]" />
      <view class="absolute right-[24rpx] top-[24rpx] rounded-full bg-black/24 px-[20rpx] py-[10rpx] text-xs text-white font-600">
        {{ strategy.homeTagLabel }}
      </view>
    </view>
    <view class="px-[28rpx] py-[24rpx]">
      <text class="block text-sm text-primary font-700">
        {{ strategy.categoryName }}
      </text>
      <text class="mt-[12rpx] block text-xs text-secondary leading-[1.6]">
        {{ strategy.description }}
      </text>
    </view>
  </view>
</template>
