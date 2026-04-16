<script setup lang="ts">
import type {
  ApiEnvelope,
  RedDividendContextResponse,
  RedDividendMarketViewResponse,
  RedDividendStrategyResponse,
} from './types'
import { getRedDividendContext, getRedDividendMarketView, getRedDividendStrategy } from './api'
import AssetListCard from './components/AssetListCard.vue'
import CategorySegmentedTabs from './components/CategorySegmentedTabs.vue'
import DividendMetricCard from './components/DividendMetricCard.vue'
import {
  fallbackRedDividendContext,
  fallbackRedDividendMarketView,
  fallbackRedDividendStrategies,
} from './mock'
import {
  createRedDividendComparisonPath,
  getEnvelopeData,
  isRedDividendContextResponse,
  isRedDividendMarketViewResponse,
  isRedDividendStrategyResponse,
} from './utils'

definePage({
  name: 'red-dividend-category',
  layout: 'default',
  style: {
    backgroundColor: '#FFFFFF',
    navigationBarTitleText: '策略详情',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const initialEntryCategoryCode = typeof route.query.categoryCode === 'string' ? route.query.categoryCode : ''
const selectedCategoryCode = ref<string>(initialEntryCategoryCode)
const shouldFollowMatchedCategory = ref(!route.query.categoryCode)

const { data: contextResponse } = useRequest(() => getRedDividendContext(), {
  immediate: true,
  onError: () => undefined,
})

const { data: marketViewResponse } = useRequest(() => getRedDividendMarketView(), {
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

const currentCategoryCode = computed<RedDividendStrategyResponse['categoryCode']>(() => {
  return context.value.categories.find(item => item.categoryCode === selectedCategoryCode.value)?.categoryCode
    ?? marketView.value.matchedCategoryCode
    ?? fallbackRedDividendMarketView.matchedCategoryCode
})

watch(
  marketView,
  (value) => {
    if (!shouldFollowMatchedCategory.value)
      return
    selectedCategoryCode.value = value.matchedCategoryCode
  },
  { immediate: true },
)

const { data: strategyResponse, loading: strategyLoading } = useRequest(
  () => getRedDividendStrategy(currentCategoryCode.value),
  {
    immediate: true,
    watch: [currentCategoryCode],
    onError: () => undefined,
  },
)

const strategy = computed<RedDividendStrategyResponse>(() => {
  const payload = getEnvelopeData(strategyResponse.value as ApiEnvelope<RedDividendStrategyResponse> | undefined)
  if (isRedDividendStrategyResponse(payload) && payload.categoryCode === currentCategoryCode.value)
    return payload as RedDividendStrategyResponse

  return fallbackRedDividendStrategies[currentCategoryCode.value]
})

const category = computed(() => {
  return context.value.categories.find(item => item.categoryCode === currentCategoryCode.value) ?? context.value.categories[0]
})
const isMatchedCategory = computed(() => marketView.value.matchedCategoryCode === currentCategoryCode.value)

function handleSelectCategory(categoryCode: RedDividendStrategyResponse['categoryCode']) {
  if (categoryCode === currentCategoryCode.value)
    return
  shouldFollowMatchedCategory.value = false
  selectedCategoryCode.value = categoryCode
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
    <view class="relative min-h-[328rpx] overflow-hidden bg-[linear-gradient(180deg,_#090B0E_0%,_#101418_38%,_#171C22_68%,_#1E242B_100%)] px-[16rpx] pb-[72rpx] pt-[18rpx]">
      <view class="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,_rgba(201,212,224,0.2)_0%,_rgba(201,212,224,0)_24%)]" />
      <view class="absolute right-[90rpx] top-[58rpx] h-[110rpx] w-[110rpx] rounded-full bg-[#D2D9E2]/16 blur-[26rpx]" />

      <view class="relative z-1 min-h-[294rpx] flex flex-col pb-[18rpx] pt-[10rpx]">
        <view class="absolute right-[10rpx] top-[20rpx]">
          <wd-tag
            v-if="isMatchedCategory"
            bg-color="#f5f5f5" type="primary" color="#000" round
          >
            当前市场更匹配
          </wd-tag>
        </view>

        <view class="mt-[80rpx]">
          <text class="block text-xl text-white font-700 leading-[1.7]">
            {{ category.categoryName }}
          </text>
          <text class="mt-[8rpx] block text-sm text-white/76 leading-[1.8]">
            {{ category.description }}
          </text>
          <view class="mt-[20rpx] flex flex-wrap gap-[10rpx]">
            <view
              v-for="tag in category.tags"
              :key="tag"
            >
              <wd-tag bg-color="#E7DFD1" type="primary" color="#C78A31" round>
                {{ tag }}
              </wd-tag>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="relative z-1 mt-[-28rpx] rd-poster-shell">
      <view>
        <view class="px-[16rpx] pt-[28rpx]">
          <CategorySegmentedTabs
            :items="context.categories"
            :current="currentCategoryCode"
            @select="handleSelectCategory"
          />

          <view v-if="strategyLoading" class="mt-[24rpx] rd-loading-card">
            <wd-loading type="ring" />
            <text class="mt-[18rpx] block text-sm text-secondary">
              正在切换策略内容...
            </text>
          </view>

          <template v-else>
            <view :key="currentCategoryCode" class="mt-[24rpx]">
              <DividendMetricCard
                :metric="strategy.metric"
                :category-name="category.categoryName"
              />
            </view>

            <view :key="`${currentCategoryCode}-assets`" class="mt-[24rpx]">
              <view class="mb-[14rpx] flex items-center justify-between">
                <text class="text-base text-primary font-700">
                  代表资产
                </text>
              </view>
              <AssetListCard :items="strategy.assetList" />
            </view>

            <view
              class="mt-[24rpx] overflow-hidden rd-cta-card px-[26rpx] py-[26rpx] rd-focus-ring"
              role="button"
              aria-label="查看策略差异，了解分红与环境映射"
              tabindex="0"
              @tap="handleOpenComparison"
              @keydown="handleOpenComparisonByKeyboard"
            >
              <view class="flex items-center justify-between gap-[20rpx]">
                <view class="min-w-0 flex items-center gap-[10rpx]">
                  <text class="shrink-0 text-sm text-primary font-700">
                    查看策略差异
                  </text>
                  <text class="truncate text-xs text-secondary">
                    分红与环境映射
                  </text>
                </view>
                <view class="i-carbon-arrow-right text-sm text-rdGold" />
              </view>
            </view>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>
