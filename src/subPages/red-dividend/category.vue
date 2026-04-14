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
  findCategoryByCode,
  getEnvelopeData,
  isRedDividendContextResponse,
  isRedDividendMarketViewResponse,
  isRedDividendStrategyResponse,
  normalizeCategoryCode,
} from './utils'

definePage({
  name: 'red-dividend-category',
  layout: 'default',
  style: {
    backgroundColor: '#F4F2EE',
    navigationBarTitleText: '策略详情',
    navigationBarBackgroundColor: '#F4F2EE',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const initialEntryCategoryCode = normalizeCategoryCode(route.query.categoryCode)
const selectedCategoryCode = ref<RedDividendStrategyResponse['categoryCode']>(
  initialEntryCategoryCode,
)
const shouldFollowMatchedCategory = ref(!route.query.categoryCode)

const { data: contextResponse } = useRequest(() => getRedDividendContext(), {
  immediate: true,
  onError: () => undefined,
})

const { data: marketViewResponse } = useRequest(() => getRedDividendMarketView(), {
  immediate: true,
  onError: () => undefined,
})

const { data: strategyResponse, loading: strategyLoading } = useRequest(
  () => getRedDividendStrategy(selectedCategoryCode.value),
  {
    immediate: true,
    watch: [selectedCategoryCode],
    onError: () => undefined,
  },
)

const context = computed<RedDividendContextResponse>(() => {
  const payload = getEnvelopeData(contextResponse.value as ApiEnvelope<RedDividendContextResponse> | undefined)
  return isRedDividendContextResponse(payload) ? payload : fallbackRedDividendContext
})

const marketView = computed<RedDividendMarketViewResponse>(() => {
  const payload = getEnvelopeData(marketViewResponse.value as ApiEnvelope<RedDividendMarketViewResponse> | undefined)
  return isRedDividendMarketViewResponse(payload) ? payload : fallbackRedDividendMarketView
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

const strategy = computed<RedDividendStrategyResponse>(() => {
  const payload = getEnvelopeData(strategyResponse.value as ApiEnvelope<RedDividendStrategyResponse> | undefined)
  if (isRedDividendStrategyResponse(payload) && payload.categoryCode === selectedCategoryCode.value)
    return payload as RedDividendStrategyResponse

  return fallbackRedDividendStrategies[selectedCategoryCode.value]
})

const category = computed(() => findCategoryByCode(context.value.categories, selectedCategoryCode.value))
const isMatchedCategory = computed(() => marketView.value.matchedCategoryCode === selectedCategoryCode.value)

function handleSelectCategory(categoryCode: typeof selectedCategoryCode.value) {
  if (categoryCode === selectedCategoryCode.value)
    return
  shouldFollowMatchedCategory.value = false
  selectedCategoryCode.value = categoryCode
}

function handleOpenComparison() {
  router.push(createRedDividendComparisonPath())
}
</script>

<template>
  <view class="relative min-h-screen overflow-x-hidden bg-[#F4F2EE]">
    <view
      class="relative min-h-[250rpx] overflow-hidden bg-rdHeroBlack px-[28rpx] py-[34rpx] text-white shadow-[0_18rpx_36rpx_rgba(17,37,62,0.1)]"
    >
      <view class="absolute right-[96rpx] top-[62rpx] h-[140rpx] w-[140rpx] rounded-full bg-[#F3C34C] blur-[14rpx]" />
      <view class="absolute right-[42rpx] top-[74rpx] h-[120rpx] w-[132rpx] rounded-full bg-[#F27A4A]/80 blur-[18rpx]" />
      <view class="absolute right-[18rpx] top-[68rpx] h-[132rpx] w-[118rpx] rounded-full bg-[#91A3D8]/64 blur-[24rpx]" />
      <view class="absolute right-[84rpx] top-[72rpx] h-[124rpx] w-[124rpx] rounded-full bg-[radial-gradient(circle_at_58%_52%,_#FFD36C_0%,_#F6AC48_36%,_#312415_72%,_#111111_100%)] shadow-[0_0_0_8rpx_rgba(0,0,0,0.14)]" />
      <view
        v-if="isMatchedCategory"
        class="absolute right-[20rpx] top-[20rpx] rounded-full bg-white/16 px-[18rpx] py-[10rpx] text-sm font-600"
      >
        当前匹配
      </view>
      <text class="mt-[36rpx] block text-xl font-700">
        {{ category.categoryName }}
      </text>
      <text class="mt-[8rpx] block text-sm text-white/84">
        {{ category.categoryDesc }}
      </text>
      <view class="mt-[18rpx] flex flex-wrap gap-[10rpx]">
        <text v-for="tag in category.tags" :key="tag" class="rd-chip-hero">
          {{ tag }}
        </text>
      </view>
    </view>

    <view class="relative z-1 mt-[-24rpx] overflow-hidden rounded-t-[36rpx] bg-surface shadow-[0_-10rpx_28rpx_rgba(17,37,62,0.06)]">
      <view class="rd-page-shell pt-[28rpx]">
        <view class="mt-[20rpx]">
          <CategorySegmentedTabs
            :items="context.categories"
            :current="selectedCategoryCode"
            @select="handleSelectCategory"
          />
        </view>

        <view v-if="strategyLoading" class="mt-[24rpx] rd-card">
          <wd-loading />
          <text class="mt-[18rpx] block text-sm text-secondary">
            正在切换策略内容...
          </text>
        </view>

        <template v-else>
          <view :key="selectedCategoryCode" class="mt-[24rpx]">
            <DividendMetricCard :metric="strategy.metric" :category-name="category.categoryName" />
          </view>

          <view :key="`${selectedCategoryCode}-assets`" class="mt-[24rpx]">
            <view class="mb-[14rpx] flex items-center justify-between">
              <text class="text-base text-primary font-700">
                代表资产
              </text>
            </view>
            <AssetListCard :items="strategy.assetList" />
          </view>

          <view class="mt-[24rpx] rd-cta-card" @tap="handleOpenComparison">
            <view class="flex items-center justify-between gap-[20rpx]">
              <view class="min-w-0 flex items-center gap-[10rpx]">
                <text class="shrink-0 text-sm text-primary font-700">
                  查看策略差异
                </text>
                <text class="truncate text-xs text-secondary">
                  分红与环境映射
                </text>
              </view>
              <view class="i-carbon-arrow-right text-sm text-secondary" />
            </view>
          </view>
        </template>
      </view>
    </view>
  </view>
</template>
