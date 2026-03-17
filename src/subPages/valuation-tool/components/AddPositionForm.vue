<script setup lang="ts">
import type { PortfolioFundOption } from '../types'
import SearchFundInput from './SearchFundInput.vue'

defineProps<{
  keyword: string
  results: PortfolioFundOption[]
  selectedFund: PortfolioFundOption | null
  holdingAmount: string
  holdingProfit: string
  saveText?: string
  showContinue?: boolean
  hideActions?: boolean
}>()

const emit = defineEmits<{
  'update:keyword': [value: string]
  'selectFund': [fund: PortfolioFundOption]
  'update:holdingAmount': [value: string]
  'update:holdingProfit': [value: string]
  'save': []
  'saveAndContinue': []
}>()
</script>

<template>
  <view class="flex flex-col gap-[20rpx]">
    <SearchFundInput
      :keyword="keyword"
      :results="results"
      :selected-fund="selectedFund"
      @select="emit('selectFund', $event)"
      @update:keyword="emit('update:keyword', $event)"
    />

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

    <view v-if="!hideActions" class="mt-[4rpx] flex flex-col gap-[14rpx]">
      <wd-button type="primary" custom-class="!h-[76rpx] !rounded-[18rpx] !text-[26rpx]" @click="emit('save')">
        {{ saveText || '保存持仓' }}
      </wd-button>
      <wd-button
        v-if="showContinue"
        plain
        custom-class="!h-[76rpx] !rounded-[18rpx] !border-line !text-[26rpx] !text-primary"
        @click="emit('saveAndContinue')"
      >
        保存并继续添加
      </wd-button>
    </view>
  </view>
</template>
