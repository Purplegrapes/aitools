<script setup lang="ts">
import type { RedDividendCategory } from '../types'
import { computed } from 'vue'

const props = defineProps<{
  strategy: RedDividendCategory
}>()

const emit = defineEmits<{
  select: [categoryCode: RedDividendCategory['categoryCode']]
}>()

const artClass = computed(() => {
  if (props.strategy.categoryCode === 'BOND_LIKE_DIVIDEND')
    return 'bond'
  return 'cycle'
})
</script>

<template>
  <view class="overflow-hidden rounded-[34rpx] bg-surface shadow-[0_16rpx_34rpx_rgba(17,37,62,0.06)]" @click="emit('select', strategy.categoryCode)">
    <view class="relative h-[206rpx] overflow-hidden bg-[#1C1C1E]">
      <template v-if="artClass === 'bond'">
        <view class="absolute left-[88rpx] top-[54rpx] h-[96rpx] w-[96rpx] border-[4rpx] border-[#C99B4D]/90 rounded-full" />
        <view class="absolute left-[112rpx] top-[78rpx] h-[48rpx] w-[48rpx] border-[3rpx] border-[#DDBA74]/92 rounded-full" />
        <view class="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,_rgba(241,198,104,0.12)_0%,_rgba(242,191,99,0.04)_26%,_rgba(28,28,30,0)_64%)]" />
      </template>

      <template v-else>
        <view class="absolute left-[110rpx] top-[74rpx] h-[34rpx] w-[34rpx] rounded-full bg-[#D8D9E5]/92 blur-[4rpx]" />
        <view class="absolute left-[82rpx] top-[50rpx] h-[92rpx] w-[92rpx] rounded-full bg-[#C9CBDA]/12 blur-[28rpx]" />
      </template>

      <view class="absolute right-[18rpx] top-[18rpx] rounded-full bg-black/18 px-[16rpx] py-[8rpx] text-xs text-white font-600">
        {{ strategy.shortTag }}
      </view>
    </view>
    <view class="px-[22rpx] py-[20rpx]">
      <text class="block text-sm text-primary font-700">
        {{ strategy.categoryName }}
      </text>
      <text class="mt-[10rpx] block text-xs text-secondary leading-[1.6]">
        {{ strategy.description }}
      </text>
    </view>
  </view>
</template>
