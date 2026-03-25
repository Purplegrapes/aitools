<script setup lang="ts">
import type { ValuationWatchlistFund } from '../types'
import { formatDailyChange, formatMetricNumber, getDailyChangeTone } from '../utils'

defineProps<{
  item: ValuationWatchlistFund
}>()

const emit = defineEmits<{
  select: [code: string]
}>()
</script>

<template>
  <view class="grid grid-cols-[minmax(0,1.5fr)_140rpx_140rpx] items-center gap-[12rpx] border-b border-line/70 px-4 py-4 last:border-b-0">
    <view class="min-w-0" @click="emit('select', item.code)">
      <text class="block truncate text-sm text-primary font-600">
        {{ item.name }}
      </text>
      <text class="mt-1 block text-xs text-secondary tracking-[1rpx]">
        {{ item.code }}
      </text>
    </view>

    <view class="text-center" @click="emit('select', item.code)">
      <text class="block text-sm font-700" :class="getDailyChangeTone(item.dailyChange)">
        {{ formatDailyChange(item.dailyChange) }}
      </text>
    </view>

    <view class="text-center" @click="emit('select', item.code)">
      <text class="block text-sm text-primary font-600">
        {{ formatMetricNumber(item.realtimeNav, 4) }}
      </text>
    </view>
  </view>
</template>
