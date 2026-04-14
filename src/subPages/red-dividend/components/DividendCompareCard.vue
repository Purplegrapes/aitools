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
      class="border rounded-[34rpx] px-[16rpx] py-[22rpx] text-center shadow-[0_14rpx_30rpx_rgba(17,37,62,0.04)]"
      :class="item.categoryCode === activeCategoryCode ? 'border-[#E9D2A9] bg-[#FFF9F0] text-primary' : 'border-transparent bg-surface text-primary'"
    >
      <text class="block text-sm font-700">
        {{ item.categoryName }}
      </text>
      <text class="mt-[16rpx] block text-sm text-rdGold font-700">
        {{ formatAmountWithSign(item.annualDividendAmountBy100k) }}
      </text>
      <text class="mt-[10rpx] block text-xs text-secondary">
        股息率约 {{ formatYield(item.dividendYield) }}
      </text>
    </view>
  </view>
</template>
