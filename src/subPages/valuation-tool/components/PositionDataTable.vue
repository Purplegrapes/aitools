<script setup lang="ts">
import type { PortfolioPositionMetrics } from '../types'
import { formatCurrency, formatPercent, getPortfolioValueTone } from '../utils'

defineProps<{
  items: PortfolioPositionMetrics[]
  todayUnavailable?: boolean
}>()

const emit = defineEmits<{
  select: [code: string]
}>()
</script>

<template>
  <view class="border border-line/70 rounded-[20rpx] bg-surface shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
    <view class="border-b border-line/60 px-[22rpx] py-[18rpx]">
      <text class="text-base text-primary font-600">
        持仓明细
      </text>
    </view>

    <view class="table-head grid grid-cols-[300rpx_1fr_1fr] border-b border-line/50 bg-surfaceSubtle px-[22rpx] py-[16rpx]">
      <text class="text-[22rpx] text-secondary">
        基金
      </text>
      <text class="text-[22rpx] text-secondary">
        持有收益
      </text>
      <text class="text-[22rpx] text-secondary">
        当日收益
      </text>
    </view>

    <view
      v-for="item in items"
      :key="item.id"
      class="grid grid-cols-[300rpx_1fr_1fr] border-b border-line/40 px-[22rpx] py-[18rpx] last:border-b-0"
      @click="emit('select', item.code)"
    >
      <view class="min-w-0 pr-[12rpx]">
        <text class="block truncate text-sm text-primary font-600">
          {{ item.name }}
        </text>
        <text class="mt-[6rpx] block text-xs text-secondary">
          {{ item.code }}
        </text>
      </view>

      <view>
        <text class="block text-sm font-600" :class="getPortfolioValueTone(item.cumulativeProfit)">
          {{ formatCurrency(item.cumulativeProfit) }}
        </text>
        <text class="mt-[4rpx] block text-xs" :class="getPortfolioValueTone(item.cumulativeProfitRate)">
          {{ formatPercent(item.cumulativeProfitRate) }}
        </text>
      </view>

      <view>
        <text class="block text-sm font-600" :class="todayUnavailable ? 'text-secondary' : getPortfolioValueTone(item.todayProfit)">
          {{ todayUnavailable ? '--' : formatCurrency(item.todayProfit) }}
        </text>
        <text class="mt-[4rpx] block text-xs" :class="todayUnavailable ? 'text-secondary' : getPortfolioValueTone(item.dailyChangeRate)">
          {{ todayUnavailable ? '暂无估值' : formatPercent(item.dailyChangeRate) }}
        </text>
      </view>
    </view>
  </view>
</template>
