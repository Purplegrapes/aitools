<script setup lang="ts">
import type { PortfolioSummary } from '../types'
import { formatCurrency, formatCurrencyNoSign, formatPercent, getPortfolioValueTone } from '../utils'

const props = defineProps<{
  summary: PortfolioSummary
  todayUnavailable?: boolean
}>()

const isPrivacyMode = ref(false)

const realtimeToneClass = computed(() => {
  return props.todayUnavailable ? 'text-[#8CA0BA]' : getPortfolioValueTone(props.summary.todayChangeRate)
})

const realtimeStatusText = computed(() => {
  if (props.todayUnavailable)
    return '实时估值暂不可用'
  if (props.summary.updateTime)
    return `最新更新 ${props.summary.updateTime}`
  return '实时估值更新中'
})

function formatAmount(value: number) {
  return isPrivacyMode.value ? '••••' : formatCurrencyNoSign(value)
}

function formatProfitAmount(value: number) {
  return isPrivacyMode.value ? '••••' : formatCurrency(value)
}
</script>

<template>
  <view class="summary-card relative overflow-hidden rounded-[28rpx] px-[24rpx] py-[20rpx] shadow-[0_22rpx_48rpx_rgba(43,86,145,0.09)]">
    <view class="summary-ambient absolute inset-0" />
    <view class="summary-orb absolute left-[-72rpx] top-[-54rpx] h-[220rpx] w-[220rpx] rounded-full" />
    <view class="summary-orb absolute bottom-[-96rpx] right-[-54rpx] h-[210rpx] w-[210rpx] rounded-full opacity-75" />

    <view class="relative z-1">
      <view class="mb-[16rpx] flex items-center justify-between gap-[16rpx]">
        <text class="text-xs text-secondary">
          {{ realtimeStatusText }}
        </text>

        <view
          class="privacy-toggle h-[52rpx] w-[52rpx] inline-flex items-center justify-center rounded-full"
          @click="isPrivacyMode = !isPrivacyMode"
        >
          <view :class="isPrivacyMode ? 'i-carbon-view-off' : 'i-carbon-view'" class="text-[30rpx] text-[#6E87A8]" />
        </view>
      </view>

      <view class="glass-panel rounded-[24rpx] px-[20rpx] py-[18rpx]">
        <view class="flex flex-col items-center text-center">
          <text class="text-[22rpx] text-[#7388A4]">
            总资产
          </text>
          <text class="mt-[8rpx] block text-[46rpx] text-[#183B63] font-700 leading-[1]">
            {{ formatAmount(summary.totalAmount) }}
          </text>
        </view>

        <view class="realtime-panel mt-[20rpx] rounded-[20rpx] px-[18rpx] py-[16rpx]">
          <view class="grid grid-cols-2 gap-[18rpx]">
            <view class="min-w-0 text-left">
              <text class="block text-[20rpx] text-[#7489A4]">
                累计收益
              </text>
              <text class="mt-[8rpx] block text-[30rpx] font-700 leading-[1.04]" :class="getPortfolioValueTone(summary.totalProfit)">
                {{ formatProfitAmount(summary.totalProfit) }}
              </text>
              <text class="mt-[6rpx] block text-[20rpx] font-500" :class="getPortfolioValueTone(summary.totalProfitRate)">
                {{ formatPercent(summary.totalProfitRate) }}
              </text>
            </view>

            <view class="min-w-0 text-right">
              <text class="block text-[20rpx] text-[#7489A4]">
                实时收益
              </text>
              <text class="mt-[8rpx] block text-[30rpx] font-700 leading-[1.04]" :class="todayUnavailable ? 'text-[#8CA0BA]' : getPortfolioValueTone(summary.todayProfit)">
                {{ todayUnavailable ? '--' : formatProfitAmount(summary.todayProfit ?? 0) }}
              </text>
              <text class="mt-[6rpx] block text-[20rpx] font-500" :class="realtimeToneClass">
                {{ todayUnavailable ? '--' : formatPercent(summary.todayChangeRate) }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.summary-card {
  background:
    linear-gradient(180deg, rgba(249, 252, 255, 0.92), rgba(240, 247, 255, 0.9));
  border: 2rpx solid rgba(255, 255, 255, 0.82);
}

.summary-ambient {
  backdrop-filter: blur(18rpx);
  background:
    radial-gradient(circle at 18% 22%, rgba(153, 202, 255, 0.2), transparent 32%),
    radial-gradient(circle at 82% 78%, rgba(112, 166, 255, 0.14), transparent 34%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.26), rgba(222, 236, 255, 0.32));
}

.summary-orb {
  background: radial-gradient(circle, rgba(126, 187, 255, 0.18) 0%, rgba(126, 187, 255, 0) 72%);
}

.summary-chip {
  background: rgba(255, 255, 255, 0.62);
  border: 2rpx solid rgba(140, 175, 220, 0.2);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(14rpx);
}

.privacy-toggle {
  background: rgba(255, 255, 255, 0.56);
  border: 2rpx solid rgba(140, 175, 220, 0.18);
  backdrop-filter: blur(14rpx);
}

.glass-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(246, 250, 255, 0.68));
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.86),
    0 16rpx 42rpx rgba(52, 92, 147, 0.06);
  backdrop-filter: blur(20rpx);
}

.realtime-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(241, 247, 255, 0.82));
  border: 2rpx solid rgba(133, 169, 214, 0.14);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.72);
}

.realtime-badge {
  min-width: 188rpx;
  background: rgba(255, 255, 255, 0.56);
  border: 2rpx solid rgba(136, 173, 219, 0.12);
}

.info-item {
  background: rgba(255, 255, 255, 0.48);
  border: 2rpx solid rgba(136, 173, 219, 0.12);
}
</style>
