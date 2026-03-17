<script setup lang="ts">
defineProps<{
  code: string
  name: string
  holdingAmount: string
  holdingProfit: string
  currentAmountText: string
  cumulativeProfitText: string
  updateTimeText: string
}>()

const emit = defineEmits<{
  'update:holdingAmount': [value: string]
  'update:holdingProfit': [value: string]
}>()
</script>

<template>
  <view class="border border-line/65 rounded-[20rpx] bg-surface/96 px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)] backdrop-blur-[12rpx]">
    <view class="rounded-[18rpx] bg-surfaceSubtle px-[20rpx] py-[20rpx]">
      <text class="block text-[30rpx] text-primary font-600">
        {{ name }}
      </text>
      <text class="mt-[8rpx] block text-[22rpx] text-secondary">
        基金代码 {{ code }}
      </text>

      <view class="grid grid-cols-2 mt-[18rpx] gap-[14rpx]">
        <view class="rounded-[16rpx] bg-surface px-[18rpx] py-[18rpx]">
          <text class="block text-[22rpx] text-secondary">
            当前持有金额
          </text>
          <text class="mt-[8rpx] block text-[28rpx] text-primary font-600">
            {{ currentAmountText }}
          </text>
        </view>
        <view class="rounded-[16rpx] bg-surface px-[18rpx] py-[18rpx]">
          <text class="block text-[22rpx] text-secondary">
            当前累计收益
          </text>
          <text class="mt-[8rpx] block text-[28rpx] text-primary font-600">
            {{ cumulativeProfitText }}
          </text>
        </view>
      </view>

      <text class="mt-[14rpx] block text-[20rpx] text-tertiary">
        最近更新 {{ updateTimeText }}
      </text>
    </view>

    <view class="mt-[18rpx] flex flex-col gap-[20rpx]">
      <view class="border border-line rounded-[18rpx] bg-surfaceSubtle px-[20rpx] py-[18rpx]">
        <text class="block text-[22rpx] text-secondary">
          持有金额
        </text>
        <input
          class="mt-[10rpx] h-[40rpx] text-[28rpx] text-primary"
          type="digit"
          :value="holdingAmount"
          placeholder="输入这只基金当前持有金额"
          placeholder-class="text-[26rpx] text-tertiary"
          @input="emit('update:holdingAmount', ($event as InputEvent).detail.value)"
        >
      </view>

      <view class="border border-line rounded-[18rpx] bg-surfaceSubtle px-[20rpx] py-[18rpx]">
        <text class="block text-[22rpx] text-secondary">
          持有收益
        </text>
        <input
          class="mt-[10rpx] h-[40rpx] text-[28rpx] text-primary"
          type="text"
          :value="holdingProfit"
          placeholder="输入这只基金当前累计收益，亏损可填负数"
          placeholder-class="text-[26rpx] text-tertiary"
          @input="emit('update:holdingProfit', ($event as InputEvent).detail.value)"
        >
      </view>
    </view>

    <view class="mt-[18rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        修改说明
      </text>
      <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
        保存时会根据当前估值换算持有份额和成本信息。删除操作是永久移除，请确认后再处理。
      </text>
    </view>
  </view>
</template>
