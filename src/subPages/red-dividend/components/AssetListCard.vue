<script setup lang="ts">
import type { RedDividendAssetItem } from '../types'
import { formatAmountWithSign } from '../utils'

defineProps<{
  items: RedDividendAssetItem[]
}>()
</script>

<template>
  <view class="flex flex-col gap-[16rpx]">
    <view
      v-for="item in items"
      :key="item.assetId"
      class="rd-card"
    >
      <view class="flex items-start justify-between gap-[18rpx]">
        <view class="min-w-0 flex-1">
          <text class="block text-sm text-primary font-700">
            {{ item.assetName }}
          </text>
          <view class="mt-[14rpx] flex flex-wrap gap-[10rpx]">
            <text v-for="tag in item.tags" :key="tag" class="rd-chip">
              {{ tag }}
            </text>
          </view>
        </view>
        <view class="shrink-0 text-right">
          <text class="block text-xs text-secondary">
            预估分红
          </text>
          <text class="mt-[8rpx] block text-sm text-rdGold font-700">
            {{ formatAmountWithSign(item.annualDividendAmountBy100k) }}
          </text>
          <text class="mt-[10rpx] inline-flex rd-chip">
            投入10万 / 年
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
