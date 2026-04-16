<script setup lang="ts">
import type { RedDividendAssetItem } from '../types'
import { formatAmountWithSign } from '../utils'

const props = defineProps<{
  items: RedDividendAssetItem[]
}>()
</script>

<template>
  <view class="flex flex-col gap-[16rpx]">
    <view
      v-for="item in props.items"
      :key="item.assetId"
      class="border border-rdLine rounded-[24rpx] bg-white px-[22rpx] py-[22rpx]"
    >
      <view class="flex items-start justify-between gap-[18rpx]">
        <view class="min-w-0 flex-1">
          <text class="block text-sm text-primary font-700 leading-[1.5]">
            {{ item.assetName }}
          </text>
          <view class="mt-[14rpx] flex flex-wrap gap-[10rpx]">
            <view
              v-for="tag in item.tags"
              :key="tag"
            >
              <wd-tag bg-color="var(--un-color-rdGoldSoft)" type="primary" color="var(--un-color-rdGold)" mark plain custom-class="text-xxs! text-rdGold!">
                {{ tag }}
              </wd-tag>
            </view>
          </view>
        </view>
        <view
          class="max-w-[42%] min-w-[168rpx] px-[16rpx] py-[14rpx] text-right"
        >
          <text class="block text-xs text-tertiary leading-[1.6]">
            预估分红
          </text>
          <text class="mt-[12rpx] block text-sm text-rdGold font-800">
            {{ formatAmountWithSign(item.annualDividendAmountBy100k) }}
          </text>
          <text class="mt-[12rpx] block text-xs text-tertiary">
            投入10万 / 年
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
