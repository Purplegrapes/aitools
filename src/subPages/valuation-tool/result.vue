<script setup lang="ts">
import type {
  ApiEnvelope,
  DiscoveryFundValuation,
  FundDetailServiceResponse,
  FundMetricsServiceResponse,
  FundRealtimeDataServiceResponse,
  FundResult,
} from './types'
import { getFundDetail, getFundMetrics, getFundRealtimeData } from './api/valuationTool'
import DetailActionBar from './components/DetailActionBar.vue'
import DetailStateCard from './components/DetailStateCard.vue'
import DetailSummaryCards from './components/DetailSummaryCards.vue'
import RiskNoteCard from './components/RiskNoteCard.vue'
import { usePortfolio } from './composables/usePortfolio'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { detailStateMetaMap } from './mock'
import {
  buildPortfolioDeleteConfirmMessage,
  getPortfolioDeleteErrorMessage,
} from './position-actions.js'
import {
  createSearchPath,
  createValuationHomePath,
  createWatchlistPath,
  inferMarketTypeFromChannel,
  isApiNotFound,
  isApiSuccess,
  mapFundDetailToResult,
  mapFundRealtimeDataToExchangeQuote,
  mapFundRealtimeToValuation,
  normalizeKeyword,
} from './utils'

definePage({
  name: 'valuation-tool-result',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '基金详情',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const toast = useToast()
const route = useRoute()
const globalToast = useGlobalToast()
const { confirm: showConfirm } = useGlobalMessage()
const fundCode = computed(() => normalizeKeyword(route.query.code))
const requestError = shallowRef(false)
const realtimeDataError = shallowRef(false)
const deletingHolding = shallowRef(false)
const {
  refreshWatchlist,
  toggleWatchlist,
  isWatchlisted,
} = useValuationWatchlist()
const {
  positions,
  refreshPositions,
  removePosition,
} = usePortfolio()

const {
  data: detailResponse,
  loading: detailLoading,
  send: fetchDetail,
} = useRequest(
  () => getFundDetail(fundCode.value),
  {
    immediate: false,
    onError: () => {
      requestError.value = true
    },
  },
)

const {
  data: metricsResponse,
  loading: metricsLoading,
  send: fetchMetrics,
} = useRequest(
  () => getFundMetrics(fundCode.value),
  {
    immediate: false,
  },
)

const {
  data: realtimeDataResponse,
  loading: realtimeDataLoading,
  send: fetchRealtimeData,
} = useRequest(
  () => getFundRealtimeData(fundCode.value),
  {
    immediate: false,
    onError: () => {
      realtimeDataError.value = true
    },
  },
)

const loading = computed(() => detailLoading.value || metricsLoading.value || realtimeDataLoading.value)

const detailEnvelope = computed(() => detailResponse.value as ApiEnvelope<FundDetailServiceResponse> | undefined)
const metricsEnvelope = computed(() => metricsResponse.value as ApiEnvelope<FundMetricsServiceResponse> | undefined)
const realtimeDataEnvelope = computed(() => realtimeDataResponse.value as ApiEnvelope<FundRealtimeDataServiceResponse> | undefined)

const detailPayload = computed(() => isApiSuccess(detailEnvelope.value) ? detailEnvelope.value?.data : undefined)
const metricsPayload = computed(() => isApiSuccess(metricsEnvelope.value) ? metricsEnvelope.value?.data : undefined)
const realtimeDataPayload = computed(() => isApiSuccess(realtimeDataEnvelope.value) ? realtimeDataEnvelope.value?.data : undefined)

const result = computed<FundResult>(() => {
  const mapped = mapFundDetailToResult(detailPayload.value, metricsPayload.value, realtimeDataPayload.value)
  if (mapped)
    return mapped
  return { status: 'loading' }
})

const displayStatus = computed<FundResult['status'] | 'error'>(() => {
  if (requestError.value)
    return 'error'
  if (isApiNotFound(detailEnvelope.value))
    return 'not_found'
  if (detailEnvelope.value && !detailPayload.value)
    return 'missing_value'
  return result.value.status
})

const marketType = computed(() => inferMarketTypeFromChannel(detailPayload.value?.channel))
const exchangeQuote = computed(() => {
  return mapFundRealtimeDataToExchangeQuote(realtimeDataPayload.value)
})

const valuation = computed<DiscoveryFundValuation | undefined>(() => mapFundRealtimeToValuation(detailPayload.value, realtimeDataPayload.value))

const stateMeta = computed(() => detailStateMetaMap[displayStatus.value])
const showDetail = computed(() => displayStatus.value === 'ok')
const watchlisted = computed(() => isWatchlisted(fundCode.value))
const holdingPosition = computed(() => {
  const currentCode = fundCode.value.trim().toUpperCase()
  if (!currentCode)
    return null
  return positions.value.find(item => item.code.trim().toUpperCase() === currentCode) || null
})
const isHolding = computed(() => Boolean(holdingPosition.value))

watch(
  fundCode,
  (value) => {
    if (!value) {
      requestError.value = true
      return
    }
    requestError.value = false
    realtimeDataError.value = false
    fetchDetail()
    fetchMetrics()
    fetchRealtimeData()
    refreshWatchlist()
  },
  { immediate: true },
)

onShow(() => {
  void refreshPositions()
})

function handlePrimaryAction() {
  if (displayStatus.value === 'not_found')
    router.replace(createSearchPath('沪深300'))
  else
    router.replace(createValuationHomePath())
}

function handleOpenWatchlist() {
  router.push(createWatchlistPath())
}

function handleOpenMineScan() {
  if (!fundCode.value)
    return
  toast.info('敬请期待')

  // router.push(createMineScanPath(fundCode.value))
}

function handleToggleWatchlist() {
  if (!fundCode.value)
    return

  toggleWatchlist({
    code: fundCode.value,
    name: result.value.name,
    dailyChange: marketType.value === 'exchange'
      ? exchangeQuote.value?.priceChangeRatio ?? null
      : result.value.intraday?.value ?? null,
    updateTime: marketType.value === 'exchange'
      ? exchangeQuote.value?.updateTime
      : result.value.intraday?.updateTime,
  })
}

function handleRemoveHolding() {
  if (!holdingPosition.value || deletingHolding.value)
    return

  showConfirm({
    title: '删除持有',
    msg: buildPortfolioDeleteConfirmMessage(holdingPosition.value.name),
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    success: async (actionResult) => {
      if (actionResult.action !== 'confirm' || !holdingPosition.value || deletingHolding.value)
        return

      deletingHolding.value = true
      try {
        await removePosition({
          id: holdingPosition.value.id,
          code: holdingPosition.value.code,
        })
        globalToast.success('持仓已删除')
      }
      catch (error) {
        globalToast.error(getPortfolioDeleteErrorMessage(error))
      }
      finally {
        deletingHolding.value = false
      }
    },
  })
}
</script>

<template>
  <view class="relative overflow-x-hidden bg-page vt-page-shell" :class="showDetail ? 'pb-[160rpx]' : 'pb-8'">
    <view
      v-if="showDetail"
      class="pointer-events-none absolute inset-x-0 top-0 h-[380rpx] bg-[linear-gradient(180deg,_#E7F0FF_0%,_#F0F5FF_54%,_rgba(245,247,250,0)_100%)]"
    />
    <view
      v-if="showDetail"
      class="pointer-events-none absolute right-[-36rpx] top-[74rpx] h-[180rpx] w-[180rpx] rounded-full bg-[radial-gradient(circle,_rgba(22,120,255,0.15)_0%,_rgba(22,120,255,0.04)_56%,_rgba(22,120,255,0)_100%)]"
    />
    <view
      v-if="showDetail"
      class="pointer-events-none absolute left-[-42rpx] top-[132rpx] h-[132rpx] w-[132rpx] rounded-full bg-[radial-gradient(circle,_rgba(24,144,255,0.09)_0%,_rgba(24,144,255,0)_72%)]"
    />

    <view class="relative mx-auto flex flex-col gap-4">
      <view v-if="loading && !showDetail" class="rounded-card bg-surface p-6 text-center">
        <wd-loading />
        <text class="mt-3 block text-sm text-secondary">
          加载中...
        </text>
      </view>

      <DetailStateCard
        v-else-if="!showDetail"
        :title="stateMeta.title"
        :description="stateMeta.description"
        :action-text="stateMeta.primaryAction"
        @action="handlePrimaryAction"
      />

      <template v-else>
        <DetailSummaryCards
          class="pt-[18rpx]"
          :exchange-quote="realtimeDataError ? undefined : exchangeQuote"
          :market-type="marketType"
          :result="result"
          :valuation="marketType === 'otc' && !realtimeDataError ? valuation : undefined"
        />
        <view class="py-[24rpx] vt-page-x">
          <RiskNoteCard :text="result.disclaimer" />
        </view>
      </template>
    </view>

    <DetailActionBar
      v-if="showDetail"
      :deleting-holding="deletingHolding"
      :holding="isHolding"
      :watchlisted="watchlisted"
      @remove-holding="handleRemoveHolding"
      @open-mine-scan="handleOpenMineScan"
      @open-watchlist="handleOpenWatchlist"
      @toggle="handleToggleWatchlist"
    />
  </view>
</template>
