<script setup lang="ts">
import type {
  RedDividendCategoryCode,
  RedDividendMappingConfig,
  RedDividendMappingNodeView,
} from '../types'
import { getMappingNodeStyle } from '../utils'

const props = defineProps<{
  config: RedDividendMappingConfig
  nodes: RedDividendMappingNodeView[]
  activeCategoryCode: RedDividendCategoryCode
}>()

function getZoneName(categoryCode: RedDividendCategoryCode) {
  return props.config.zones.find(item => item.categoryCode === categoryCode)?.zoneName ?? ''
}
</script>

<template>
  <view class="rd-map-card">
    <view class="absolute left-[50%] top-[56rpx] h-[372rpx] w-[2rpx] bg-[#D8D2C7]/78" />
    <view class="absolute left-[48rpx] right-[48rpx] top-[242rpx] h-[2rpx] bg-[#D8D2C7]/78" />

    <view class="absolute right-[78rpx] top-[48rpx] h-[164rpx] w-[164rpx] rounded-full bg-[#E7D8B3]/38 blur-[24rpx]" />
    <view class="absolute bottom-[52rpx] left-[62rpx] h-[132rpx] w-[132rpx] rounded-full bg-[#DDE7F6]/34 blur-[26rpx]" />

    <text class="absolute left-[24rpx] top-[20rpx] text-xs text-secondary">
      {{ config.yAxis.bottomText }}
    </text>
    <text class="absolute right-[24rpx] top-[20rpx] text-xs text-secondary">
      {{ config.yAxis.topText }}
    </text>
    <text class="absolute bottom-[16rpx] left-[24rpx] text-xs text-secondary">
      {{ config.xAxis.leftText }}
    </text>
    <text class="absolute bottom-[16rpx] right-[24rpx] text-xs text-secondary">
      {{ config.xAxis.rightText }}
    </text>

    <view
      v-for="item in nodes"
      :key="item.categoryCode"
      class="absolute max-w-[176rpx] min-w-[132rpx] translate-x-[-50%] translate-y-[50%] rounded-[28rpx] px-[18rpx] py-[18rpx] text-center"
      :class="item.categoryCode === activeCategoryCode
        ? 'border border-white/10 bg-[#232323] text-white shadow-[0_18rpx_36rpx_rgba(0,0,0,0.28)]'
        : 'border border-[#E9E0D2] bg-rdPaper text-primary shadow-[0_12rpx_28rpx_rgba(17,37,62,0.08)]'"
      :style="getMappingNodeStyle(item.xValue, item.yValue)"
    >
      <text class="block text-sm font-700">
        {{ item.categoryName }}
      </text>
      <text
        class="mt-[8rpx] block text-xs leading-[1.6]"
        :class="item.categoryCode === activeCategoryCode ? 'text-white/80' : 'text-primary/62'"
      >
        {{ getZoneName(item.categoryCode) }}
      </text>
    </view>
  </view>
</template>
