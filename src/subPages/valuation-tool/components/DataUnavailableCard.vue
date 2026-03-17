<script setup lang="ts">
defineProps<{
  title: string
  description: string
  hint: string
}>()
</script>

<template>
  <view class="border border-line/70 rounded-[20rpx] bg-surface px-[24rpx] py-[24rpx]">
    <view class="h-[64rpx] w-[64rpx] flex items-center justify-center rounded-[20rpx] bg-surfaceSubtle text-secondary">
      <view class="i-carbon-warning-alt-filled text-[30rpx]" />
    </view>
    <text class="mt-[20rpx] block text-[32rpx] text-primary font-600">
      {{ title }}
    </text>
    <text class="mt-[12rpx] block text-[26rpx] text-regular leading-[38rpx]">
      {{ description }}
    </text>
    <text class="mt-[14rpx] block text-[22rpx] text-secondary leading-[34rpx]">
      {{ hint }}
    </text>
  </view>
</template>
