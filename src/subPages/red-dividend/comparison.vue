<script setup lang="ts">
import type {
  ApiEnvelope,
  RedDividendCompareViewItem,
  RedDividendComparisonResponse,
  RedDividendContextResponse,
  RedDividendMappingNodeView,
} from './types'
import { getRedDividendComparison, getRedDividendContext } from './api'
import DividendCompareCard from './components/DividendCompareCard.vue'
import EnvironmentMappingCard from './components/EnvironmentMappingCard.vue'
import ExplanationCard from './components/ExplanationCard.vue'
import {
  fallbackRedDividendComparison,
  fallbackRedDividendContext,
} from './mock'
import {
  getEnvelopeData,
  isRedDividendComparisonResponse,
  isRedDividendContextResponse,
} from './utils'

definePage({
  name: 'red-dividend-comparison',
  layout: 'default',
  style: {
    backgroundColor: '#FFFFFF',
    navigationBarTitleText: '策略对比',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTextStyle: 'black',
  },
})

const { data: contextResponse } = useRequest(() => getRedDividendContext(), {
  immediate: true,
  onError: () => undefined,
})

const { data: comparisonResponse, loading: comparisonLoading } = useRequest(() => getRedDividendComparison(), {
  immediate: true,
  onError: () => undefined,
})

const context = computed<RedDividendContextResponse>(() => {
  const payload = getEnvelopeData(contextResponse.value as ApiEnvelope<RedDividendContextResponse> | undefined)
  return isRedDividendContextResponse(payload) ? payload : fallbackRedDividendContext
})

const comparison = computed<RedDividendComparisonResponse>(() => {
  const payload = getEnvelopeData(comparisonResponse.value as ApiEnvelope<RedDividendComparisonResponse> | undefined)
  return isRedDividendComparisonResponse(payload) ? payload : fallbackRedDividendComparison
})

const compareItems = computed<RedDividendCompareViewItem[]>(() => {
  return comparison.value.dividendCompare.items.map((item) => {
    const category = context.value.categories.find(categoryItem => categoryItem.categoryCode === item.categoryCode)
    return {
      ...item,
      categoryName: category?.categoryName ?? item.categoryCode,
      shortTag: category?.shortTag ?? '',
    }
  })
})
const mappingNodes = computed<RedDividendMappingNodeView[]>(() => {
  return comparison.value.mapping.nodes.map((item) => {
    const category = context.value.categories.find(categoryItem => categoryItem.categoryCode === item.categoryCode)
    return {
      ...item,
      categoryName: category?.categoryName ?? item.categoryCode,
      shortTag: category?.shortTag ?? '',
    }
  })
})
const activeExplanation = computed(() => {
  return comparison.value.explanations.find(item => item.categoryCode === comparison.value.mapping.matchedCategoryCode)
    ?? comparison.value.explanations[0]
})
const activeCategory = computed(() => {
  return context.value.categories.find(item => item.categoryCode === comparison.value.mapping.matchedCategoryCode)
    ?? context.value.categories[0]
})
</script>

<template>
  <view class="relative min-h-screen overflow-x-hidden bg-surface">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[420rpx] bg-[linear-gradient(180deg,_rgba(6,8,10,0.2)_0%,_rgba(6,8,10,0)_74%)]" />
    <view class="relative min-h-[328rpx] overflow-hidden bg-[linear-gradient(180deg,_#090B0E_0%,_#101418_38%,_#171C22_68%,_#1E242B_100%)] px-[16rpx] pb-[72rpx] pt-[18rpx]">
      <view class="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,_rgba(201,212,224,0.2)_0%,_rgba(201,212,224,0)_24%)]" />
      <view class="absolute inset-x-0 bottom-0 h-[132rpx] bg-[linear-gradient(180deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.04)_100%)]" />
      <view class="absolute right-[90rpx] top-[58rpx] h-[110rpx] w-[110rpx] rounded-full bg-[#D2D9E2]/16 blur-[26rpx]" />

      <view class="relative z-1 min-h-[294rpx] flex flex-col pb-[18rpx] pt-[10rpx]">
        <view class="mt-auto max-w-[520rpx]">
          <text class="block text-xl text-white font-700 leading-[1.7]">
            当前市场下，为什么更匹配{{ activeCategory.categoryName }}？
          </text>
          <text class="mt-[8rpx] block text-sm text-white/76 leading-[1.8]">
            {{ context.brief.strategyCore }}
          </text>
        </view>
      </view>
    </view>

    <view class="relative z-1 mt-[-28rpx]">
      <view class="rd-poster-shell">
        <view class="px-[16rpx] pt-[28rpx]">
          <view v-if="comparisonLoading" class="mt-[24rpx] rd-loading-card">
            <wd-loading type="ring" />
            <text class="mt-[18rpx] block text-sm text-secondary">
              正在生成策略对比...
            </text>
          </view>

          <template v-else>
            <view>
              <view class="mb-[30rpx] mt-[20rpx] flex items-center justify-between px-[4rpx]">
                <text class="text-base text-primary font-700">
                  分红预估
                </text>
                <text class="rounded-full bg-[#F4EBDC] px-[14rpx] py-[6rpx] text-xs text-rdGold font-600">
                  投入10万/年
                </text>
              </view>
              <DividendCompareCard
                :items="compareItems"
                :active-category-code="comparison.mapping.matchedCategoryCode"
              />
            </view>

            <view class="mt-[24rpx]">
              <view class="flex items-center justify-between px-[4rpx] py-[30rpx]">
                <text class="text-base text-primary font-700">
                  {{ context.mappingConfig.title }}
                </text>
              </view>
              <EnvironmentMappingCard
                :config="context.mappingConfig"
                :nodes="mappingNodes"
                :active-category-code="comparison.mapping.matchedCategoryCode"
              />
            </view>

            <view class="mt-[30rpx]">
              <ExplanationCard
                :title="`${activeCategory.categoryName}更适合当前市场的${activeCategory.categoryDesc}`"
                :explanation="activeExplanation"
              />
            </view>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>
