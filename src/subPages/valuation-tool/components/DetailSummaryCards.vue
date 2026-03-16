<script setup lang="ts">
import type { FundResult } from '../types'
import { formatIntradayValue, getIntradayTone } from '../utils'

defineProps<{
  result: FundResult
}>()
</script>

<template>
  <view class="flex flex-col gap-4">
    <view class="">
      <text class="block text-lg text-primary font-600">
        {{ result.name }}
      </text>
      <text class="mt-1 block text-sm text-secondary">
        {{ result.code }}
      </text>

      <view class="mt-3 flex flex-wrap gap-2">
        <wd-tag
          v-for="tag in result.tags || []"
          :key="tag"
          bg-color="rgba(22,120,255,0.12)"
          custom-class="!rounded-full !border-none !px-2"
        >
          <text class="text-xs text-brand">
            {{ tag }}
          </text>
        </wd-tag>
      </view>
    </view>

    <view class="rounded-4 bg-surface p-4 shadow-sm">
      <view class="flex items-start justify-between gap-4">
        <view>
          <text class="block text-sm text-secondary">
            今日表现参考
          </text>
          <text class="mt-1 block text-2xl font-700" :class="getIntradayTone(result.intraday)">
            {{ formatIntradayValue(result.intraday) }}
          </text>
        </view>
        <text class="text-xs text-secondary">
          {{ result.intraday?.updateTime }} 估算更新
        </text>
      </view>

      <view class="mt-4 rounded-3 bg-page px-3 py-3">
        <text class="text-sm text-regular leading-6">
          {{ result.intraday?.explanation }}
        </text>
      </view>
    </view>

    <view class="rounded-4 bg-surface p-4 shadow-sm">
      <text class="block text-base text-primary font-600">
        快速看懂这只基金
      </text>

      <view class="grid grid-cols-3 mt-4 gap-3 text-center">
        <view class="rounded-3 bg-page px-2 py-3">
          <text class="block text-xs text-secondary">
            费率
          </text>
          <text class="mt-2 block text-base text-primary font-600">
            {{ result.quickFacts?.feeRate }}
          </text>
          <text class="mt-1 block text-xs text-secondary leading-5">
            {{ result.quickFacts?.feeExplanation }}
          </text>
        </view>
        <view class="rounded-3 bg-page px-2 py-3">
          <text class="block text-xs text-secondary">
            历史最大跌幅
          </text>
          <text class="mt-2 block text-base text-success font-600">
            {{ result.quickFacts?.maxDrawdown }}
          </text>
          <text class="mt-1 block text-xs text-secondary leading-5">
            {{ result.quickFacts?.drawdownExplanation }}
          </text>
        </view>
        <view class="rounded-3 bg-page px-2 py-3">
          <text class="block text-xs text-secondary">
            近一年表现
          </text>
          <text class="mt-2 block text-base text-danger font-600">
            {{ result.quickFacts?.oneYearReturn }}
          </text>
          <text class="mt-1 block text-xs text-secondary leading-5">
            {{ result.quickFacts?.returnExplanation }}
          </text>
        </view>
      </view>

      <view class="mt-4 rounded-3 bg-brand-muted px-3 py-3">
        <text class="text-xs text-regular leading-6">
          {{ result.definition }}
        </text>
      </view>

      <view class="grid grid-cols-2 mt-4 gap-3">
        <view class="rounded-3 bg-page px-3 py-3">
          <text class="block text-xs text-secondary">
            主要跟踪
          </text>
          <text class="mt-2 block text-sm text-primary font-600">
            {{ result.targetIndex }}
          </text>
        </view>
        <view class="rounded-3 bg-page px-3 py-3">
          <text class="block text-xs text-secondary">
            覆盖方向
          </text>
          <text class="mt-2 block text-sm text-primary font-600">
            {{ result.marketCoverage }}
          </text>
        </view>
      </view>

      <view class="mt-4 rounded-3 bg-page px-3 py-3">
        <text class="block text-sm text-primary font-600">
          日常波动预感
        </text>
        <text class="mt-2 block text-xs text-regular leading-6">
          {{ result.riskDescription }}
        </text>
      </view>

      <view class="mt-4 rounded-3 bg-page px-3 py-3">
        <text class="block text-sm text-primary font-600">
          谁更适合关注它？
        </text>
        <text class="mt-2 block text-xs text-regular leading-6">
          {{ result.targetAudience }}
        </text>
      </view>

      <view v-if="result.reasonList?.length" class="mt-4 rounded-3 bg-page px-3 py-3">
        <text class="block text-sm text-primary font-600">
          为什么今天会这样
        </text>
        <view class="mt-3 flex flex-col gap-2">
          <view v-for="reason in result.reasonList" :key="reason" class="flex items-start gap-2">
            <view class="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
            <text class="min-w-0 flex-1 text-xs text-regular leading-6">
              {{ reason }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
