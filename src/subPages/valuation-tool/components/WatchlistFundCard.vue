<script setup lang="ts">
import type { ValuationWatchlistFund } from '../types'
import { formatDailyChange, getDailyChangeTone } from '../utils'

defineProps<{
  item: ValuationWatchlistFund
}>()

const emit = defineEmits<{
  select: [code: string]
  remove: [code: string]
}>()
</script>

<template>
  <view class="rounded-[32rpx] bg-surface p-4 shadow-sm">
    <view class="flex items-start justify-between gap-3">
      <view class="min-w-0 flex-1" @click="emit('select', item.code)">
        <text class="block truncate text-base text-primary font-600">
          {{ item.name }}
        </text>
        <text class="mt-1 block text-xs text-secondary">
          {{ item.code }}
        </text>
      </view>

      <wd-tag bg-color="rgba(22,120,255,0.12)" custom-class="!rounded-full !border-none !px-3">
        <text class="text-xs text-brand">
          已自选
        </text>
      </wd-tag>
    </view>

    <view class="mt-4 flex items-center justify-between gap-3 rounded-[24rpx] bg-page px-4 py-3">
      <view>
        <text class="block text-xs text-secondary">
          当日涨幅
        </text>
        <text class="mt-1 block text-lg font-700" :class="getDailyChangeTone(item.dailyChange)">
          {{ formatDailyChange(item.dailyChange) }}
        </text>
      </view>
      <text class="text-xs text-secondary">
        {{ item.updateTime || '--' }} 更新
      </text>
    </view>

    <view class="mt-4 flex items-center justify-between gap-3">
      <view class="flex items-center gap-2 text-xs text-secondary" @click="emit('select', item.code)">
        <text>查看详情</text>
        <view class="i-carbon-arrow-up-right" />
      </view>
      <wd-button size="small" plain type="warning" @click="emit('remove', item.code)">
        取消自选
      </wd-button>
    </view>
  </view>
</template>
