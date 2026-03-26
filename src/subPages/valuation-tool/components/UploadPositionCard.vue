<script setup lang="ts">
</script>

<template>
  <view class="vt-top-card px-[24rpx] py-[24rpx]">
    <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
      <view class="i-carbon-image-search text-[30rpx]" />
    </view>
    <text class="mt-[18rpx] block text-[30rpx] text-primary font-600">
      上传持仓截图
    </text>
    <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
      适合一次录入多只基金。上传截图后，系统会直接调用后端识别并导入持仓。
    </text>

    <view class="mt-[20rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        支持内容
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary">
        基金持仓列表截图
      </text>
      <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
        支持从相册选择或直接拍照，解析成功后会自动返回持仓页并刷新最新结果。
      </text>
    </view>

    <view class="mt-[18rpx] rounded-[16rpx] bg-brand-muted/70 px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        上传说明
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
        单次只处理 1 张截图。若后端解析失败，页面会停留在当前页，方便你重新上传或改为手动录入。
      </text>
    </view>
  </view>
</template>
