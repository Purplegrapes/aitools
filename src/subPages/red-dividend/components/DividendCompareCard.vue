<script setup lang="ts">
import type { RedDividendCompareViewItem } from '../types'
import { formatAmountWithSign, formatYield } from '../utils'

defineProps<{
  items: RedDividendCompareViewItem[]
  activeCategoryCode: RedDividendCompareViewItem['categoryCode']
}>()
</script>

<template>
  <view class="grid grid-cols-3 gap-[16rpx]">
    <view
      v-for="item in items"
      :key="item.categoryCode"
      class="border rounded-[24rpx] px-[16rpx] py-[20rpx] text-center shadow-[0_14rpx_30rpx_rgba(61,46,28,0.06)]"
      :class="item.categoryCode === activeCategoryCode
        ? 'border-[#E7D9BF] bg-[#FFF6E7] shadow-[0_20rpx_38rpx_rgba(61,46,28,0.12)]'
        : 'border-rdLine bg-rdPaper shadow-[0_14rpx_26rpx_rgba(61,46,28,0.06)]'"
    >
      <text class="block text-sm text-primary font-700 leading-[1.5]">
        {{ item.categoryName }}
      </text>
      <text class="mt-[14rpx] block text-sm text-rdGold font-800 leading-[1.2] tracking-[0.02em]">
        {{ formatAmountWithSign(item.annualDividendAmountBy100k) }}
      </text>
      <text class="mt-[10rpx] block text-xs text-primary/62 leading-[1.6]">
        股息率约 {{ formatYield(item.dividendYield) }}
      </text>
    </view>
  </view>
</template>
