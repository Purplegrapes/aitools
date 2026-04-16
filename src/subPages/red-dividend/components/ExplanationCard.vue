<script setup lang="ts">
import type { RedDividendExplanation } from '../types'

defineProps<{
  title: string
  explanation: RedDividendExplanation
}>()
</script>

<template>
  <view>
    <view class="flex items-center gap-[12rpx]">
      <text class="inline-flex px-[16rpx] py-[8rpx] text-base text-primary font-600">
        为什么
      </text>
      <view class="h-[2rpx] flex-1 rounded-full bg-[linear-gradient(90deg,_rgba(205,164,82,0.44)_0%,_rgba(205,164,82,0)_100%)]" />
    </view>

    <view class="mt-[18rpx] rd-soft-panel px-[20rpx] py-[20rpx]">
      <view class="border border-[#E7D9BF] rounded-[22rpx] px-[18rpx] py-[18rpx]">
        <text class="mt-[10rpx] block text-sm text-primary font-700 leading-[1.75]">
          {{ title }}
        </text>
        <text class="mt-[10rpx] block text-xs text-secondary leading-[1.75]">
          {{ explanation.summary }}
        </text>
      </view>

      <view class="mt-[14rpx] flex flex-col gap-[12rpx]">
        <view
          v-for="(point, index) in explanation.reasonPoints"
          :key="point"
          class="border border-rdLineSoft rounded-[22rpx] bg-rdPaper px-[16rpx] py-[16rpx]"
        >
          <view class="flex items-center gap-[14rpx]">
            <view class="mt-[2rpx] flex shrink-0 items-center gap-[10rpx]">
              <text class="text-xs text-rdGold font-700">
                0{{ index + 1 }}
              </text>
              <view class="h-[24rpx] w-[2rpx] rounded-full bg-rdGold/42" />
            </view>
            <text class="min-w-0 flex-1 text-xs text-secondary leading-[1.78]">
              {{ point }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
