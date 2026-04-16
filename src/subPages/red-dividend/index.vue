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
  createRedDividendCategoryPath,
  createRedDividendComparisonPath,
  getEnvelopeData,
  isRedDividendContextResponse,
  isRedDividendMarketViewResponse,
} from './utils'

definePage({
  name: 'red-dividend-home',
  layout: 'default',
  style: {
    backgroundColor: '#fff',
    navigationBarTitleText: '红利风向标',
    navigationBarBackgroundColor: '#fff',
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

const recommendedStrategy = computed(() => {
  return context.value.categories.find(item => item.categoryCode === marketView.value.matchedCategoryCode) ?? context.value.categories[0]
})
const otherStrategies = computed(() => {
  return context.value.categories.filter(item => item.categoryCode !== recommendedStrategy.value.categoryCode)
})
const isLoading = computed(() => contextLoading.value || marketViewLoading.value)

function handleOpenCategory(categoryCode: typeof recommendedStrategy.value.categoryCode) {
  router.push(createRedDividendCategoryPath(categoryCode))
}

function handleOpenComparison() {
  router.push(createRedDividendComparisonPath())
}

function handleOpenComparisonByKeyboard(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ')
    return

  event.preventDefault()
  handleOpenComparison()
}
</script>

<template>
  <view class="relative min-h-screen overflow-x-hidden bg-surface">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[420rpx] bg-[linear-gradient(180deg,_rgba(6,8,10,0.2)_0%,_rgba(6,8,10,0)_74%)]" />
    <view class="relative">
      <template v-if="isLoading">
        <view class="mx-[16rpx] mt-[18rpx] rd-soft-card-lg bg-rdPaperMuted p-[24rpx] text-center">
          <wd-loading type="ring" />
          <text class="mt-[18rpx] block text-sm text-secondary">
            正在准备红利风向标...
          </text>
        </view>
      </template>

      <template v-else>
        <MarketSummaryStrip
          :title="context.brief.title"
          :strategy-core="context.brief.strategyCore"
          :market-summary="marketView.summary"
        />

        <view class="relative z-1 mt-[-26rpx]">
          <view class="rounded-t-[32rpx] bg-surface pb-[80rpx]">
            <view class="px-[16rpx] pt-[28rpx]">
              <view class="mt-[8rpx]">
                <view class="mb-[20rpx] flex items-center justify-between px-[4rpx]">
                  <text class="text-base text-primary font-700">
                    本期推荐
                  </text>
                </view>
                <StrategyHeroCard :strategy="recommendedStrategy" @select="handleOpenCategory" />
              </view>

              <view class="mt-[28rpx]">
                <view class="mb-[20rpx] flex items-center justify-between px-[4rpx]">
                  <text class="text-base text-primary font-700">
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

              <view
                class="mt-[34rpx] overflow-hidden rd-cta-card px-[26rpx] py-[26rpx] rd-focus-ring"
                role="button"
                aria-label="查看策略差异，了解分红预估与环境映射"
                tabindex="0"
                @click="handleOpenComparison"
                @keydown="handleOpenComparisonByKeyboard"
              >
                <view class="flex items-center justify-between gap-[20rpx]">
                  <view class="min-w-0 flex items-center gap-[12rpx]">
                    <text class="shrink-0 text-sm text-primary font-700">
                      查看策略差异
                    </text>
                    <text class="truncate text-xs text-secondary">
                      分红预估与环境映射
                    </text>
                  </view>
                  <view class="i-carbon-arrow-right shrink-0 text-sm text-rdGold" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
