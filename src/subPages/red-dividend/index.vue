<script setup lang="ts">
import type {
  ApiEnvelope,
  RedDividendContextResponse,
  RedDividendMarketViewResponse,
} from './types'
import { getRedDividendContext, getRedDividendMarketView } from './api'
import MarketSummaryStrip from './components/MarketSummaryStrip.vue'
import StrategyHeroCard from './components/StrategyHeroCard.vue'
import StrategyPosterCard from './components/StrategyPosterCard.vue'
import {
  fallbackRedDividendContext,
  fallbackRedDividendMarketView,
} from './mock'
import {
  buildOtherStrategies,
  buildRecommendedStrategy,
  createRedDividendCategoryPath,
  createRedDividendComparisonPath,
  getEnvelopeData,
  isRedDividendContextResponse,
  isRedDividendMarketViewResponse,
  setCurrentRedDividendCategoryCode,
} from './utils'

definePage({
  name: 'red-dividend-home',
  layout: 'default',
  style: {
    backgroundColor: '#f5f5f5',
    navigationBarTitleText: '红利风向标',
    navigationBarBackgroundColor: '#f5f5f5',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()

const { data: contextResponse, loading: contextLoading } = useRequest(() => getRedDividendContext(), {
  immediate: true,
  onError: () => undefined,
})

const { data: marketViewResponse, loading: marketViewLoading } = useRequest(() => getRedDividendMarketView(), {
  immediate: true,
  onError: () => undefined,
})

const context = computed<RedDividendContextResponse>(() => {
  const payload = getEnvelopeData(contextResponse.value as ApiEnvelope<RedDividendContextResponse> | undefined)
  return isRedDividendContextResponse(payload) ? payload : fallbackRedDividendContext
})

const marketView = computed<RedDividendMarketViewResponse>(() => {
  const payload = getEnvelopeData(marketViewResponse.value as ApiEnvelope<RedDividendMarketViewResponse> | undefined)
  return isRedDividendMarketViewResponse(payload) ? payload : fallbackRedDividendMarketView
})

const recommendedStrategy = computed(() => buildRecommendedStrategy(context.value, marketView.value))
const otherStrategies = computed(() => buildOtherStrategies(context.value, marketView.value))
const isLoading = computed(() => contextLoading.value || marketViewLoading.value)

function handleOpenCategory(categoryCode: typeof recommendedStrategy.value.categoryCode) {
  setCurrentRedDividendCategoryCode(categoryCode)
  router.push(createRedDividendCategoryPath())
}

function handleOpenComparison() {
  router.push(createRedDividendComparisonPath())
}
</script>

<template>
  <view class="relative min-h-screen overflow-x-hidden">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[420rpx] bg-[linear-gradient(180deg,_#F8F6F1_0%,_#F2EFE9_56%,_rgba(244,242,238,0)_100%)]" />
    <view class="relative px-[16rpx] pb-[80rpx] pt-[14rpx]">
      <template v-if="isLoading">
        <view class="rounded-card bg-surface p-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)]">
          <wd-loading />
          <text class="mt-[18rpx] block text-sm text-secondary">
            正在准备红利风向标...
          </text>
        </view>
      </template>

      <template v-else>
        <MarketSummaryStrip
          :title="context.brief.title"
          :summary="context.brief.summary"
          :strategy-core="context.brief.strategyCore"
          :market-summary="marketView.summary"
        />

        <view class="mt-[24rpx]">
          <view class="mb-[16rpx] flex items-center justify-between px-[4rpx]">
            <text class="text-base text-primary font-medium">
              本期推荐
            </text>
          </view>
          <StrategyHeroCard :strategy="recommendedStrategy" @select="handleOpenCategory" />
        </view>

        <view class="mt-[24rpx]">
          <view class="mb-[16rpx] flex items-center justify-between px-[4rpx]">
            <text class="text-base text-primary font-medium">
              其他策略
            </text>
          </view>
          <view class="grid grid-cols-2 gap-[16rpx]">
            <StrategyPosterCard
              v-for="item in otherStrategies"
              :key="item.categoryCode"
              :strategy="item"
              @select="handleOpenCategory"
            />
          </view>
        </view>

        <view class="mt-[34rpx] rd-cta-card px-[26rpx] py-[26rpx] shadow-[0_18rpx_40rpx_rgba(42,34,23,0.04)]" @click="handleOpenComparison">
          <view class="flex items-center justify-between gap-[20rpx]">
            <view class="min-w-0 flex items-center gap-[12rpx]">
              <text class="shrink-0 text-sm text-primary font-700">
                查看策略差异
              </text>
              <text class="truncate text-xs text-secondary">
                分红预估与环境映射
              </text>
            </view>
            <view class="i-carbon-arrow-right shrink-0 text-sm text-secondary" />
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
