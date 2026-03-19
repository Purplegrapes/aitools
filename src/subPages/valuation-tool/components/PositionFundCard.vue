<script setup lang="ts">
import type { PortfolioPositionMetrics } from '../types'
import {
  formatCurrency,
  formatPercent,
  getPortfolioValueTone,
} from '../utils'

defineProps<{
  item: PortfolioPositionMetrics
  todayUnavailable?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  edit: [id: string]
}>()
</script>

<template>
  <view class="border border-line/70 rounded-[20rpx] bg-surface px-[22rpx] py-[22rpx] shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
    <view class="flex items-start justify-between gap-[16rpx]">
      <view class="min-w-0 flex-1" @click="emit('select', item.id)">
        <text class="block truncate text-[30rpx] text-primary font-600">
          {{ item.name }}
        </text>
        <text class="mt-[6rpx] block text-[22rpx] text-secondary">
          {{ item.code }}
        </text>
      </view>

      <view class="rounded-full bg-brand-muted px-[16rpx] py-[8rpx]">
        <text class="text-[22rpx] text-brand font-600">
          {{ item.statusLabel }}
        </text>
      </view>
    </view>

    <view class="grid grid-cols-2 mt-[18rpx] gap-[14rpx]">
      <view class="rounded-[16rpx] bg-surfaceSubtle px-[16rpx] py-[16rpx]">
        <text class="block text-[22rpx] text-secondary">
          累计收益
        </text>
        <text class="mt-[8rpx] block text-[32rpx] font-700" :class="getPortfolioValueTone(item.cumulativeProfit)">
          {{ formatCurrency(item.cumulativeProfit) }}
        </text>
        <text class="mt-[6rpx] block text-[22rpx]" :class="getPortfolioValueTone(item.cumulativeProfitRate)">
          {{ formatPercent(item.cumulativeProfitRate) }}
        </text>
      </view>

      <view class="rounded-[16rpx] bg-surfaceSubtle px-[16rpx] py-[16rpx]">
        <text class="block text-[22rpx] text-secondary">
          今日盈亏
        </text>
        <text class="mt-[8rpx] block text-[32rpx] font-700" :class="todayUnavailable ? 'text-secondary' : getPortfolioValueTone(item.todayProfit)">
          {{ todayUnavailable ? '--' : formatCurrency(item.todayProfit) }}
        </text>
        <text class="mt-[6rpx] block text-[22rpx]" :class="todayUnavailable ? 'text-secondary' : getPortfolioValueTone(item.dailyChangeRate)">
          {{ todayUnavailable ? '暂无估值' : formatPercent(item.dailyChangeRate) }}
        </text>
      </view>
    </view>

    <view class="mt-[14rpx] flex items-center justify-between gap-[16rpx]">
      <view class="min-w-0 flex-1">
        <text class="block text-[22rpx] text-secondary">
          {{ item.currentNav === null ? '估值暂缺' : `估值 ${item.currentNav.toFixed(4)}` }} · {{ item.updateTime }}
        </text>
      </view>

      <view
        class="flex shrink-0 items-center gap-[6rpx] text-[22rpx] text-brand font-600"
        @click="emit('edit', item.id)"
      >
        <text>调仓</text>
        <view class="i-carbon-chevron-right text-[20rpx]" />
      </view>
    </view>
  </view>
</template>
