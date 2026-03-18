<script setup lang="ts">
</script>

<template>
  <view class="border border-line/65 rounded-[20rpx] bg-surface/96 px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)] backdrop-blur-[12rpx]">
    <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
      <view class="i-carbon-image-search text-[30rpx]" />
    </view>
    <text class="mt-[18rpx] block text-[30rpx] text-primary font-600">
      上传持仓截图
    </text>
    <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
      适合一次录入多只基金。上传截图后，系统会先识别，再由你确认后保存。
    </text>

    <view class="mt-[20rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        支持内容
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary">
        基金持仓列表截图
      </text>
      <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
        支持从相册选择或直接拍照，识别结果不会直接入库，保存前你还可以再检查一遍。
      </text>
    </view>

    <view class="mt-[18rpx] rounded-[16rpx] bg-brand-muted/70 px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        识别说明
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
        如果有基金名称、金额或收益识别不准，你可以逐条修改、删除，或者改成手动录入。
      </text>
    </view>
  </view>
</template>
