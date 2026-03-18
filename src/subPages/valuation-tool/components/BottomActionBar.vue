<script setup lang="ts">
defineProps<{
  secondaryText?: string
  primaryText: string
}>()

const emit = defineEmits<{
  secondary: []
  primary: []
}>()
</script>

<template>
  <view class="fixed inset-x-0 bottom-0 z-20 bg-surface/96 vt-page-x pb-[calc(env(safe-area-inset-bottom)+20rpx)] pt-[16rpx] shadow-[0_-8rpx_30rpx_rgba(17,37,62,0.06)] backdrop-blur-[20rpx]">
    <view class="flex items-center gap-[16rpx]">
      <view
        v-if="secondaryText"
        class="h-[76rpx] w-[180rpx] flex shrink-0 items-center justify-center rounded-[18rpx] bg-surfaceSubtle text-[26rpx] text-primary font-600"
        @click="emit('secondary')"
      >
        {{ secondaryText }}
      </view>
      <view
        class="h-[76rpx] min-w-0 flex flex-1 items-center justify-center rounded-[18rpx] bg-brand text-[26rpx] text-inverse font-600 shadow-[0_16rpx_32rpx_rgba(22,120,255,0.24)]"
        @click="emit('primary')"
      >
        {{ primaryText }}
      </view>
    </view>
  </view>
</template>
