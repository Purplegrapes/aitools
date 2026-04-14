<script setup lang="ts">
import type { RedDividendExplanation } from '../types'

defineProps<{
  title: string
  explanation: RedDividendExplanation
}>()
</script>

<template>
  <view class="rd-panel">
    <text class="mt-[12rpx] block text-sm text-primary font-700 leading-[1.55]">
      {{ title }}
    </text>
    <text class="mt-[12rpx] block text-xs text-secondary leading-[1.7]">
      {{ explanation.summary }}
    </text>
    <view class="mt-[18rpx] flex flex-col gap-[12rpx]">
      <view
        v-for="point in explanation.reasonPoints"
        :key="point"
        class="rounded-[20rpx] bg-[#F8F6F2] px-[18rpx] py-[16rpx]"
      >
        <text class="block text-xs text-secondary leading-[1.6]">
          {{ point }}
        </text>
      </view>
    </view>
  </view>
</template>
