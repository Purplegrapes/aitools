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
  <view class="position-table overflow-hidden border border-[#DDE8F6] rounded-[24rpx] bg-surface shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
    <view class="position-table-summary border-b border-[#E5EDF8] px-[22rpx] py-[18rpx]">
      <view class="flex items-start justify-between gap-[18rpx]">
        <view class="min-w-0">
          <text class="block text-base text-primary font-600">
            持仓明细
          </text>
          <text class="mt-[6rpx] block text-[22rpx] text-secondary">
            按基金维度查看累计收益与当日表现
          </text>
        </view>
      </view>
    </view>

    <view class="table-head grid grid-cols-[300rpx_1fr_1fr] border-b border-[#E1EAF6] bg-[#F4F8FE] px-[22rpx] py-[16rpx]">
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
      class="grid grid-cols-[300rpx_1fr_1fr] border-b border-[#EEF3F9] px-[22rpx] py-[20rpx] last:border-b-0"
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

<style scoped lang="scss">
.position-table {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.96));
}

.position-table-summary {
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.9), rgba(243, 248, 255, 0.72));
}

.position-table-chip {
  background: rgba(255, 255, 255, 0.72);
  border: 2rpx solid rgba(139, 171, 214, 0.16);
}
</style>
