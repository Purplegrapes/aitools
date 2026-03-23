<script setup lang="ts">
import type { PortfolioSummary } from '../types'
import { formatCurrency, formatPercent, getPortfolioValueTone } from '../utils'

defineProps<{
  summary: PortfolioSummary
  todayUnavailable?: boolean
}>()
</script>

<template>
  <view class="summary-card relative overflow-hidden rounded-[24rpx] px-[26rpx] py-[24rpx] shadow-[0_20rpx_56rpx_rgba(35,72,130,0.12)]">
    <view class="summary-card-glow absolute right-[-56rpx] top-[-48rpx] h-[220rpx] w-[220rpx] rounded-full" />
    <view class="summary-card-glow absolute bottom-[-110rpx] left-[-100rpx] h-[240rpx] w-[240rpx] rounded-full opacity-65" />

    <view class="relative z-1">
      <view class="flex items-center justify-between gap-[16rpx]">
        <view class="min-w-0 flex-1">
          <text class="block text-base text-[#1F3D73] font-600">
            收益总览
          </text>
          <text class="mt-[8rpx] block text-[20rpx] text-[#4B638C]">
            持仓 {{ summary.holdingCount }} 只
          </text>
        </view>
        <view class="rounded-full bg-white/72 px-[18rpx] py-[8rpx] text-xs text-[#2D4A78]">
          总资产 {{ formatCurrency(summary.totalAmount) }}
        </view>
      </view>

      <view class="mt-[24rpx] rounded-[20rpx] bg-white/90 px-[20rpx] py-[20rpx] shadow-[0_10rpx_28rpx_rgba(58,92,146,0.1)]">
        <text class="block text-[20rpx] text-[#506689]">
          累计收益（元）
        </text>
        <text class="mt-[10rpx] block text-xl font-700 leading-[1.05]" :class="getPortfolioValueTone(summary.totalProfit)">
          {{ formatCurrency(summary.totalProfit) }}
        </text>
      </view>

      <view class="grid grid-cols-2 mt-[16rpx] gap-[14rpx]">
        <view class="rounded-[16rpx] bg-white/78 px-[18rpx] py-[16rpx]">
          <text class="block text-[20rpx] text-[#556B90]">
            累计收益率
          </text>
          <text class="mt-[8rpx] block text-[30rpx] font-700" :class="getPortfolioValueTone(summary.totalProfitRate)">
            {{ formatPercent(summary.totalProfitRate) }}
          </text>
        </view>

        <view class="rounded-[16rpx] bg-white/78 px-[18rpx] py-[16rpx]">
          <text class="block text-[20rpx] text-[#556B90]">
            今日盈亏（估）
          </text>
          <text
            class="mt-[8rpx] block text-[30rpx] font-700"
            :class="todayUnavailable ? 'text-[#7A8BA9]' : getPortfolioValueTone(summary.todayProfit)"
          >
            {{ todayUnavailable ? '--' : formatCurrency(summary.todayProfit) }}
          </text>
        </view>
      </view>

      <text class="mt-[16rpx] block text-[20rpx] text-[#637A9D]">
        {{ todayUnavailable ? '当前暂无实时估值，收益数据将在可用时更新' : '收益为估算结果，最终以基金净值披露为准' }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.summary-card {
  background:
    linear-gradient(165deg, #e9f3ff 0%, #dcecff 48%, #eef5ff 100%);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
}

.summary-card-glow {
  background: radial-gradient(circle, rgba(104, 173, 255, 0.28) 0%, rgba(104, 173, 255, 0) 72%);
}
</style>
