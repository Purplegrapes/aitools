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
  <view class="grid grid-cols-[minmax(0,1.5fr)_150rpx_120rpx] items-center gap-[12rpx] border-b border-line/70 px-4 py-4 last:border-b-0">
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

    <view class="flex justify-end">
      <wd-button size="small" plain @click="emit('remove', item.code)">
        移除
      </wd-button>
    </view>
  </view>
</template>
