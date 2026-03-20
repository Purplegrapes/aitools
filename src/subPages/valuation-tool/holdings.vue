<script setup lang="ts">
import DataUnavailableCard from './components/DataUnavailableCard.vue'
import EmptyPortfolioState from './components/EmptyPortfolioState.vue'
import PortfolioSummaryCard from './components/PortfolioSummaryCard.vue'
import PositionFundCard from './components/PositionFundCard.vue'
import PositionInsightCard from './components/PositionInsightCard.vue'
import SkeletonBlock from './components/SkeletonBlock.vue'
import ValuationBottomNav from './components/ValuationBottomNav.vue'
import { usePortfolio } from './composables/usePortfolio'
import {
  createHoldingsEditPath,
  createHoldingsSyncPath,
  createResultPath,
} from './utils'

definePage({
  name: 'valuation-tool-holdings',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '我的持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const {
  positions,
  metrics,
  summary,
  insight,
  previewState,
  unavailableState,
  ensureLoaded,
} = usePortfolio()

onShow(() => {
  ensureLoaded()
})

const isLoadingState = computed(() => previewState.value === 'loading')
const isDataUnavailable = computed(() => previewState.value === 'data-unavailable')
const hasPositions = computed(() => positions.value.length > 0)

function handleOpenSync() {
  router.push(createHoldingsSyncPath())
}

function handleEditPosition(id: string) {
  router.push(createHoldingsEditPath(id))
}

function handleOpenFundDetail(code: string) {
  router.push(createResultPath(code))
}
</script>

<template>
  <view class="bg-page px-[24rpx] pb-[220rpx] pt-[24rpx]">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[360rpx] bg-[linear-gradient(180deg,_rgba(232,241,255,0.96),_rgba(248,250,253,0.72)_58%,_transparent)]" />
    <view class="pointer-events-none absolute inset-x-0 top-[120rpx] h-[220rpx] bg-[radial-gradient(circle_at_top,_rgba(22,120,255,0.08),_transparent_68%)]" />

    <view class="relative mx-auto max-w-[702rpx] flex flex-col gap-[20rpx]">
      <view class="flex items-center justify-between gap-[20rpx] px-[4rpx] py-[6rpx]">
        <text class="block text-[34rpx] text-primary font-700">
          我的持仓
        </text>
        <view
          v-if="!isLoadingState && hasPositions"
          class="shrink-0 rounded-full bg-brand px-[22rpx] py-[14rpx] text-[24rpx] text-white font-600 shadow-[0_12rpx_24rpx_rgba(22,120,255,0.22)]"
          @click="handleOpenSync"
        >
          同步持仓
        </view>
      </view>

      <template v-if="isLoadingState">
        <view class="border border-line/70 rounded-[20rpx] bg-surface px-[24rpx] py-[24rpx] shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
          <SkeletonBlock height="32rpx" width="180rpx" rounded="14rpx" />
          <SkeletonBlock class="mt-[14rpx]" height="36rpx" width="220rpx" rounded="16rpx" />
          <view class="grid grid-cols-2 mt-[22rpx] gap-[16rpx]">
            <SkeletonBlock height="140rpx" rounded="16rpx" />
            <SkeletonBlock height="140rpx" rounded="16rpx" />
          </view>
        </view>

        <view class="border border-line/70 rounded-[20rpx] bg-surface px-[24rpx] py-[22rpx] shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]">
          <SkeletonBlock height="30rpx" width="220rpx" rounded="14rpx" />
          <SkeletonBlock class="mt-[14rpx]" height="24rpx" rounded="14rpx" />
          <SkeletonBlock class="mt-[10rpx]" height="24rpx" width="88%" rounded="14rpx" />
        </view>

        <view class="flex flex-col gap-[16rpx]">
          <view
            v-for="idx in 2"
            :key="idx"
            class="border border-line/70 rounded-[20rpx] bg-surface px-[22rpx] py-[22rpx] shadow-[0_16rpx_40rpx_rgba(17,37,62,0.05)]"
          >
            <SkeletonBlock height="30rpx" width="240rpx" rounded="14rpx" />
            <SkeletonBlock class="mt-[10rpx]" height="22rpx" width="160rpx" rounded="12rpx" />
            <view class="grid grid-cols-2 mt-[18rpx] gap-[14rpx]">
              <SkeletonBlock height="120rpx" rounded="16rpx" />
              <SkeletonBlock height="120rpx" rounded="16rpx" />
            </view>
            <SkeletonBlock class="mt-[16rpx]" height="24rpx" rounded="12rpx" />
          </view>
        </view>
      </template>

      <EmptyPortfolioState
        v-else-if="!hasPositions"
        @sync="handleOpenSync"
      />

      <template v-else>
        <PortfolioSummaryCard
          :summary="summary"
          :today-unavailable="isDataUnavailable"
        />

        <DataUnavailableCard
          v-if="isDataUnavailable"
          :title="unavailableState.title"
          :description="unavailableState.description"
          :hint="unavailableState.hint"
        />

        <PositionInsightCard :insight="insight" />

        <view class="flex flex-col gap-[16rpx]">
          <PositionFundCard
            v-for="item in metrics"
            :key="item.id"
            :item="item"
            :today-unavailable="isDataUnavailable"
            @edit="handleEditPosition"
            @select="handleOpenFundDetail(item.code)"
          />
        </view>
      </template>
    </view>

    <ValuationBottomNav current="holdings" />
  </view>
</template>
