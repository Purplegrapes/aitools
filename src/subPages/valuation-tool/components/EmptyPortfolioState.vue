<script setup lang="ts">
const emit = defineEmits<{
  sync: []
}>()
</script>

<template>
  <view class="border border-line/70 rounded-[20rpx] bg-surface px-[24rpx] py-[28rpx] text-center shadow-[0_20rpx_48rpx_rgba(17,37,62,0.06)]">
    <view class="mx-auto h-[96rpx] w-[96rpx] flex items-center justify-center rounded-[28rpx] bg-brand-muted text-brand">
      <view class="i-carbon-wallet text-[42rpx]" />
    </view>
    <text class="mt-[20rpx] block text-[34rpx] text-primary font-600">
      还没有持仓
    </text>
    <text class="mt-[12rpx] block text-[26rpx] text-regular leading-[38rpx]">
      添加几只基金，看看当前收益和今天的变化。
    </text>
    <view class="mt-[24rpx]">
      <wd-button block size="large" type="primary" @click="emit('sync')">
        同步持仓
      </wd-button>
    </view>
  </view>
</template>
