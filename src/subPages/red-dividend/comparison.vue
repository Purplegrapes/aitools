<script setup lang="ts">
import type {
  ApiEnvelope,
  RedDividendComparisonResponse,
  RedDividendContextResponse,
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
  buildComparisonItems,
  buildMappingNodes,
  findExplanation,
  getEnvelopeData,
  isRedDividendComparisonResponse,
  isRedDividendContextResponse,
} from './utils'

definePage({
  name: 'red-dividend-comparison',
  layout: 'default',
  style: {
    backgroundColor: '#f5f5f5',
    navigationBarTitleText: '策略对比',
    navigationBarBackgroundColor: '#f5f5f5',
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

const compareItems = computed(() => buildComparisonItems(comparison.value, context.value))
const mappingNodes = computed(() => buildMappingNodes(comparison.value, context.value))
const activeExplanation = computed(() => findExplanation(
  comparison.value.explanations,
  comparison.value.mapping.matchedCategoryCode,
))
const activeCategory = computed(() => {
  return context.value.categories.find(item => item.categoryCode === comparison.value.mapping.matchedCategoryCode) ?? context.value.categories[0]
})
</script>

<template>
  <view class="relative min-h-screen overflow-x-hidden bg-[#F4F2EE]">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[300rpx]" />
    <view class="relative min-h-[250rpx] overflow-hidden bg-rdHeroBlack px-[28rpx] py-[34rpx] text-white shadow-[0_18rpx_36rpx_rgba(17,37,62,0.1)]">
      <view class="absolute right-[72rpx] top-[70rpx] h-[128rpx] w-[128rpx] rounded-full bg-[#F3C34C] blur-[16rpx]" />
      <view class="absolute right-[24rpx] top-[82rpx] h-[110rpx] w-[124rpx] rounded-full bg-[#F27A4A]/72 blur-[20rpx]" />
      <view class="absolute right-[-8rpx] top-[76rpx] h-[124rpx] w-[112rpx] rounded-full bg-[#91A3D8]/58 blur-[28rpx]" />
      <view class="absolute right-[58rpx] top-[78rpx] h-[116rpx] w-[116rpx] rounded-full bg-[radial-gradient(circle_at_58%_52%,_#FFD36C_0%,_#F6AC48_36%,_#312415_72%,_#111111_100%)] shadow-[0_0_0_8rpx_rgba(0,0,0,0.14)]" />
      <text class="relative z-1 mt-[36rpx] block max-w-[420rpx] text-xl font-700 leading-[1.5]">
        当前市场下，为什么更匹配{{ activeCategory.categoryName }}？
      </text>
      <text class="relative z-1 mt-[8rpx] block max-w-[480rpx] text-xs text-white/82 leading-[1.65]">
        策略核心：衰退期持“债”，复苏期持“核心”，通胀期持“资源
      </text>
    </view>

    <view class="relative z-1 mt-[-18rpx] rounded-t-[28rpx] bg-surface shadow-[0_-8rpx_24rpx_rgba(17,37,62,0.04)]">
      <view class="rd-page-shell pt-[28rpx]">
        <view v-if="comparisonLoading" class="mt-[24rpx] rd-card">
          <wd-loading />
          <text class="mt-[18rpx] block text-sm text-secondary">
            正在生成策略对比...
          </text>
        </view>

        <template v-else>
          <view>
            <view class="mb-[30rpx]">
              <text class="text-base text-primary font-700">
                分红预估
              </text>
              <text class="text-xs text-secondary">
                (投入10万/年)
              </text>
            </view>
            <DividendCompareCard
              :items="compareItems"
              :active-category-code="comparison.mapping.matchedCategoryCode"
            />
          </view>

          <view class="mt-[24rpx]">
            <view class="mb-[30rpx] flex items-center justify-between">
              <text class="text-base text-primary font-700">
                {{ context.mappingConfig.title }}
              </text>
              <text class="text-xs text-secondary">
                {{ context.mappingConfig.tag }}
              </text>
            </view>
            <EnvironmentMappingCard
              :config="context.mappingConfig"
              :nodes="mappingNodes"
              :active-category-code="comparison.mapping.matchedCategoryCode"
            />
          </view>

          <view class="mt-[24rpx]">
            <ExplanationCard
              :title="`${activeCategory.categoryName}更适合当前市场的${activeCategory.categoryDesc}`"
              :explanation="activeExplanation"
            />
          </view>
        </template>
      </view>
    </view>
  </view>
</template>
