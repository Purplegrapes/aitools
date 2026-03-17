<script setup lang="ts">
</script>

<template>
  <view class="border border-line/65 rounded-[20rpx] bg-surface/96 px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)] backdrop-blur-[12rpx]">
    <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
      <view class="i-carbon-document-add text-[30rpx]" />
    </view>
    <text class="mt-[18rpx] block text-[30rpx] text-primary font-600">
      上传持仓
    </text>
    <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
      首版预留 Excel / CSV 导入。上传后可以更快看到组合收益和今天的变化。
    </text>

    <view class="mt-[20rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        支持格式
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary">
        Excel、CSV
      </text>
      <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
        首版先保留导入入口和说明，后续会补上模板与导入预览。
      </text>
    </view>

    <view class="mt-[18rpx] rounded-[16rpx] bg-brand-muted/70 px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        导入说明
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
        导入后会自动汇总累计收益、今日盈亏和单只基金表现，页面底部可直接继续下一步。
      </text>
    </view>
  </view>
</template>
