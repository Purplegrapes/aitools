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
  <view class="fixed inset-x-0 bottom-0 z-20 border-t border-line/70 bg-surface/96 px-4 pb-[calc(env(safe-area-inset-bottom)+20rpx)] pt-4 backdrop-blur-[20rpx]">
    <view class="mx-auto max-w-[680rpx] flex items-center gap-3">
      <view
        class="h-[88rpx] flex flex-1 items-center justify-center gap-2 rounded-full bg-page text-primary"
        @click="emit('toggle')"
      >
        <view :class="watchlisted ? 'i-carbon-star-filled text-warning' : 'i-carbon-star text-secondary'" />
        <text class="text-sm font-600">
          {{ watchlisted ? '取消自选' : '加入自选' }}
        </text>
      </view>

      <view
        class="h-[88rpx] flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-muted text-brand"
        @click="emit('openWatchlist')"
      >
        <view class="i-carbon-list text-base" />
        <text class="text-sm font-600">
          自选列表
        </text>
      </view>

      <view
        class="h-[88rpx] flex flex-[1.1] items-center justify-center gap-2 rounded-full bg-brand text-inverse shadow-[0_16rpx_34rpx_rgba(22,120,255,0.24)]"
        @click="emit('openMineScan')"
      >
        <view class="i-carbon-warning-hex-filled text-base" />
        <text class="text-sm font-600">
          基金扫雷
        </text>
      </view>
    </view>
  </view>
</template>
