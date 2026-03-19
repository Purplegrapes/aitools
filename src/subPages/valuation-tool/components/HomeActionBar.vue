<script setup lang="ts">
const emit = defineEmits<{
  openWatchlist: []
  openHoldings: []
}>()
</script>

<template>
  <view class="vt-action-bar">
    <view class="flex items-center gap-[16rpx]">
      <view
        class="min-w-0 vt-action-secondary flex flex-1"
        @click="emit('openWatchlist')"
      >
        <view class="i-carbon-star text-[28rpx] text-brand" />
        <text>
          自选
        </text>
      </view>

      <view
        class="min-w-0 vt-action-primary flex flex-1"
        @click="emit('openHoldings')"
      >
        <view class="i-carbon-wallet text-[28rpx]" />
        <text>
          持有
        </text>
      </view>
    </view>
  </view>
</template>
