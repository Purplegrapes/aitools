<script setup lang="ts">
import type { SearchResultViewModel } from '../types'

defineProps<{
  item: SearchResultViewModel
  watchlisted: boolean
}>()

const emit = defineEmits<{
  select: [code: string]
  toggle: [item: SearchResultViewModel]
}>()
</script>

<template>
  <view class="grid grid-cols-[minmax(0,1.3fr)_150rpx_150rpx] items-center gap-[12rpx] border-t border-line/60 px-[24rpx] py-[22rpx]">
    <view class="min-w-0" @click="emit('select', item.code)">
      <text class="block truncate text-[26rpx] text-primary font-600">
        {{ item.name }}
      </text>
    </view>

    <view class="justify-self-center">
      <text class="text-[22rpx] text-secondary">
        {{ item.code }}
      </text>
    </view>

    <view class="justify-self-end">
      <wd-button
        custom-class="!h-[56rpx] !rounded-[16rpx] !px-[20rpx] !text-[22rpx]"
        :plain="watchlisted"
        size="small"
        :type="watchlisted ? 'info' : 'primary'"
        @click.stop="emit('toggle', item)"
      >
        {{ watchlisted ? '删自选' : '加自选' }}
      </wd-button>
    </view>
  </view>
</template>
