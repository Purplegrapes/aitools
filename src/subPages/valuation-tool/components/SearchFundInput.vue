<script setup lang="ts">
import type { PortfolioFundOption } from '../types'

defineProps<{
  keyword: string
  results: PortfolioFundOption[]
  selectedFund?: PortfolioFundOption | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:keyword': [value: string]
  'select': [fund: PortfolioFundOption]
}>()
</script>

<template>
  <view>
    <view class="border border-line rounded-[18rpx] bg-surfaceSubtle px-[20rpx] py-[18rpx]">
      <text class="block text-[22rpx] text-secondary">
        基金名称 / 基金代码
      </text>
      <input
        class="mt-[10rpx] h-[40rpx] text-[28rpx] text-primary"
        :value="keyword"
        placeholder="搜索基金名称或代码"
        placeholder-class="text-[26rpx] text-tertiary"
        @input="emit('update:keyword', ($event as InputEvent).detail.value)"
      >
    </view>

    <view v-if="selectedFund" class="mt-[12rpx] rounded-[16rpx] bg-brand-muted px-[18rpx] py-[16rpx]">
      <text class="block text-[26rpx] text-primary font-600">
        {{ selectedFund.name }}
      </text>
      <text class="mt-[6rpx] block text-[22rpx] text-secondary">
        {{ selectedFund.code }} · {{ selectedFund.category }}
      </text>
    </view>

    <view v-if="results.length" class="mt-[12rpx] flex flex-col gap-[10rpx]">
      <view
        v-for="fund in results"
        :key="fund.code"
        class="border border-line/70 rounded-[16rpx] bg-surface px-[18rpx] py-[16rpx]"
        @click="emit('select', fund)"
      >
        <text class="block text-[26rpx] text-primary font-600">
          {{ fund.name }}
        </text>
        <text class="mt-[6rpx] block text-[22rpx] text-secondary">
          {{ fund.code }} · {{ fund.tag }}
        </text>
      </view>
    </view>

    <view
      v-else-if="keyword.trim() && !selectedFund"
      class="mt-[12rpx] rounded-[16rpx] bg-surface px-[18rpx] py-[16rpx]"
    >
      <text class="block text-[22rpx] text-secondary">
        {{ loading ? '正在搜索基金...' : '未搜索到匹配基金' }}
      </text>
    </view>
  </view>
</template>
