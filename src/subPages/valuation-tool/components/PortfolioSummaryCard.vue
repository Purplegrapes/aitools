<script setup lang="ts">
import type { PortfolioSummary } from '../types'
import { formatCurrency, formatPercent, getPortfolioValueTone } from '../utils'

defineProps<{
  summary: PortfolioSummary
  todayUnavailable?: boolean
}>()
</script>

<template>
  <view class="border border-line/70 rounded-[20rpx] bg-surface px-[24rpx] py-[24rpx] shadow-[0_20rpx_48rpx_rgba(17,37,62,0.06)]">
    <view class="flex items-end justify-between gap-[16rpx]">
      <view class="min-w-0 flex-1">
        <text class="block text-[22rpx] text-secondary">
          累计收益
        </text>
        <text class="mt-[10rpx] block text-[36rpx] font-700" :class="getPortfolioValueTone(summary.totalProfit)">
          {{ formatCurrency(summary.totalProfit) }}
        </text>
        <text class="mt-[6rpx] block text-[24rpx] font-600" :class="getPortfolioValueTone(summary.totalProfitRate)">
          {{ formatPercent(summary.totalProfitRate) }}
        </text>
      </view>

      <view class="text-right">
        <text class="block text-[20rpx] text-secondary">
          持仓 {{ summary.holdingCount }}只
        </text>
        <text class="mt-[8rpx] block text-[24rpx] text-primary font-600">
          {{ formatCurrency(summary.totalAmount) }}
        </text>
      </view>
    </view>

    <view class="mt-[22rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[18rpx]">
      <view class="flex items-end justify-between gap-[16rpx]">
        <view>
          <text class="block text-[22rpx] text-secondary">
            今日盈亏（参考）
          </text>
          <text
            class="mt-[10rpx] block text-[34rpx] font-700"
            :class="todayUnavailable ? 'text-secondary' : getPortfolioValueTone(summary.todayProfit)"
          >
            {{ todayUnavailable ? '--' : formatCurrency(summary.todayProfit) }}
          </text>
        </view>

        <text class="block text-[20rpx] text-secondary">
          {{ todayUnavailable ? '当前暂无实时估值' : '最终以基金净值披露为准' }}
        </text>
      </view>
    </view>
  </view>
</template>
