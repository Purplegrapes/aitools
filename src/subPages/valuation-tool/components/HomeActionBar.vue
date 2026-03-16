<script setup lang="ts">
const emit = defineEmits<{
  openWatchlist: []
  openHoldings: []
}>()
</script>

<template>
  <view class="fixed inset-x-0 bottom-0 z-20 bg-surface/96 px-4 pb-[calc(env(safe-area-inset-bottom)+20rpx)] pt-4 shadow-[0_-8rpx_30rpx_rgba(17,37,62,0.06)] backdrop-blur-[20rpx]">
    <view class="flex items-center gap-[16rpx]">
      <view
        class="h-[96rpx] flex flex-1 flex-col items-center justify-center gap-[6rpx] rounded-[24rpx] bg-surfaceSubtle text-primary"
        @click="emit('openWatchlist')"
      >
        <view class="i-carbon-star text-[26rpx] text-brand" />
        <text class="text-xs font-600">
          自选
        </text>
      </view>

      <view
        class="h-[96rpx] flex flex-1 flex-col items-center justify-center gap-[6rpx] rounded-[24rpx] bg-brand-muted text-brand"
        @click="emit('openHoldings')"
      >
        <view class="i-carbon-wallet text-[26rpx]" />
        <text class="text-xs font-600">
          持有
        </text>
      </view>
    </view>
  </view>
</template>
