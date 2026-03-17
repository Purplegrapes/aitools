<script setup lang="ts">
defineProps<{
  watchlisted: boolean
}>()

const emit = defineEmits<{
  toggle: []
  openWatchlist: []
  openMineScan: []
}>()
</script>

<template>
  <view class="fixed inset-x-0 bottom-0 z-20 bg-surface/96 px-4 pb-[calc(env(safe-area-inset-bottom)+20rpx)] pt-4 shadow-[0_-8rpx_30rpx_rgba(17,37,62,0.06)] backdrop-blur-[20rpx]">
    <view class="w-full">
      <view class="flex items-center gap-[16rpx]">
        <view
          class="h-[88rpx] w-[120rpx] flex shrink-0 flex-col items-center justify-center gap-[4rpx] rounded-[22rpx] text-primary"
          @click="emit('openWatchlist')"
        >
          <view class="i-carbon-list text-[34rpx] text-secondary" />
          <text class="text-xs font-600">
            自选列表
          </text>
        </view>

        <view
          class="h-[88rpx] w-[120rpx] flex shrink-0 flex-col items-center justify-center gap-[4rpx] rounded-[22rpx] text-brand"
          @click="emit('openMineScan')"
        >
          <view class="i-carbon-warning-hex-filled text-[34rpx]" />
          <text class="text-xs font-600">
            基金诊断
          </text>
        </view>

        <view
          class="h-[88rpx] min-w-0 flex flex-1 items-center justify-center gap-[12rpx] rounded-[24rpx] bg-brand text-inverse shadow-[0_16rpx_34rpx_rgba(22,120,255,0.24)]"
          @click="emit('toggle')"
        >
          <view :class="watchlisted ? 'i-carbon-star-filled text-[30rpx] text-[#FFE082]' : 'i-carbon-star text-[30rpx] text-inverse'" />
          <text class="text-base font-600">
            {{ watchlisted ? '取消自选' : '加自选' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
