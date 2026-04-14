<script setup lang="ts">
import type {
  RedDividendCategoryCode,
  RedDividendMappingConfig,
  RedDividendMappingNodeView,
} from '../types'
import { getCategoryEnvironmentLabel, getMappingNodeStyle } from '../utils'

defineProps<{
  config: RedDividendMappingConfig
  nodes: RedDividendMappingNodeView[]
  activeCategoryCode: RedDividendCategoryCode
}>()
</script>

<template>
  <view class="relative h-[520rpx] rounded-[34rpx] bg-[linear-gradient(180deg,_#FBF8F2_0%,_#F3EEE4_100%)] px-[28rpx] py-[24rpx]">
    <view class="absolute left-[50%] top-[56rpx] h-[372rpx] w-[2rpx] bg-[#D8D2C7]" />
    <view class="absolute left-[48rpx] right-[48rpx] top-[242rpx] h-[2rpx] bg-[#D8D2C7]" />

    <view class="absolute right-[78rpx] top-[48rpx] h-[164rpx] w-[164rpx] rounded-full bg-[#E7D8B3]/54 blur-[34rpx]" />
    <view class="absolute bottom-[48rpx] left-[54rpx] h-[164rpx] w-[164rpx] rounded-full bg-[#D9DEE7]/54 blur-[34rpx]" />

    <text class="absolute left-[24rpx] top-[20rpx] text-sm text-secondary font-600">
      {{ config.yAxis.bottomText }}
    </text>
    <text class="absolute right-[24rpx] top-[20rpx] text-sm text-secondary font-600">
      {{ config.yAxis.topText }}
    </text>
    <text class="absolute bottom-[16rpx] left-[24rpx] text-sm text-secondary font-600">
      {{ config.xAxis.leftText }}
    </text>
    <text class="absolute bottom-[16rpx] right-[24rpx] text-sm text-secondary font-600">
      {{ config.xAxis.rightText }}
    </text>

    <view
      v-for="item in nodes"
      :key="item.categoryCode"
      class="absolute w-[160rpx] translate-x-[-50%] translate-y-[50%] rounded-[28rpx] px-[18rpx] py-[18rpx] text-center"
      :class="item.categoryCode === activeCategoryCode ? 'border border-[#E9D2A9] bg-[#202A3D] text-white shadow-[0_18rpx_36rpx_rgba(32,42,61,0.24)]' : 'bg-white text-primary shadow-[0_12rpx_28rpx_rgba(17,37,62,0.08)]'"
      :style="getMappingNodeStyle(item.xValue, item.yValue)"
    >
      <text class="block text-sm font-700">
        {{ item.categoryName }}
      </text>
      <text class="mt-[8rpx] block text-sm" :class="item.categoryCode === activeCategoryCode ? 'text-white/80' : 'text-secondary'">
        {{ getCategoryEnvironmentLabel(item.categoryCode) }}
      </text>
    </view>
  </view>
</template>
