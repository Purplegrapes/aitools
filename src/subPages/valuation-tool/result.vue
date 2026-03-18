<script setup lang="ts">
import type { DiscoveryFundValuation, ExchangeFundQuotePayload, FundIntraday, FundResult } from './types'
import { getFundValuation } from '@/api/discovery'
import { getExchangeFundQuote, getFundResult } from './api/valuationTool'
import DetailActionBar from './components/DetailActionBar.vue'
import DetailStateCard from './components/DetailStateCard.vue'
import DetailSummaryCards from './components/DetailSummaryCards.vue'
import RiskNoteCard from './components/RiskNoteCard.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { detailStateMetaMap, getFallbackFundResult } from './mock'
import {
  createMineScanPath,
  createSearchPath,
  createWatchlistPath,
  inferFundMarketType,
  isFundResultStatus,
  mapExchangeQuote,
  mapValuationToIntraday,
  normalizeKeyword,
} from './utils'

definePage({
  name: 'valuation-tool-result',
  layout: 'default',
  style: {
    navigationBarTitleText: '基金详情',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const fundCode = computed(() => normalizeKeyword(route.query.code))
const requestError = shallowRef(false)
const valuationError = shallowRef(false)
const {
  refreshWatchlist,
  toggleWatchlist,
  isWatchlisted,
} = useValuationWatchlist()

const {
  data: resultResponse,
  loading,
  send: fetchResult,
} = useRequest(
  () => getFundResult(fundCode.value),
  {
    immediate: false,
    onError: () => {
      requestError.value = true
    },
  },
)

const {
  data: valuationResponse,
  send: fetchValuation,
} = useRequest(
  () => getFundValuation(fundCode.value),
  {
    immediate: false,
    onError: () => {
      valuationError.value = true
    },
  },
)

const exchangeQuoteError = shallowRef(false)
const {
  data: exchangeQuoteResponse,
  send: fetchExchangeQuote,
} = useRequest(
  () => getExchangeFundQuote(fundCode.value),
  {
    immediate: false,
    onError: () => {
      exchangeQuoteError.value = true
    },
  },
)

const result = computed<FundResult>(() => {
  const payload = (resultResponse.value as { data?: FundResult } | undefined)?.data
  if (payload && isFundResultStatus(payload.status))
    return payload
  if (import.meta.env.DEV && fundCode.value)
    return getFallbackFundResult(fundCode.value)
  return { status: 'loading' }
})

const displayStatus = computed<FundResult['status'] | 'error'>(() => {
  if (requestError.value)
    return 'error'
  return result.value.status
})

const realtimeIntraday = computed<FundIntraday | undefined>(() => {
  const payload = valuationResponse.value as DiscoveryFundValuation | undefined
  return mapValuationToIntraday(payload)
})

const marketType = computed(() => inferFundMarketType(result.value))
const exchangeQuote = computed(() => {
  const payload = exchangeQuoteResponse.value as ExchangeFundQuotePayload[] | undefined
  return mapExchangeQuote(payload?.[0])
})

const displayResult = computed<FundResult>(() => {
  if (marketType.value !== 'otc' || !realtimeIntraday.value || valuationError.value)
    return result.value

  return {
    ...result.value,
    intraday: realtimeIntraday.value,
  }
})

const stateMeta = computed(() => detailStateMetaMap[displayStatus.value])
const showDetail = computed(() => displayStatus.value === 'ok')
const watchlisted = computed(() => isWatchlisted(fundCode.value))

watch(
  fundCode,
  (value) => {
    if (!value) {
      requestError.value = true
      return
    }
    requestError.value = false
    valuationError.value = false
    exchangeQuoteError.value = false
    fetchResult()
    fetchValuation()
    fetchExchangeQuote()
    refreshWatchlist()
  },
  { immediate: true },
)

function handlePrimaryAction() {
  if (displayStatus.value === 'not_found')
    router.replace(createSearchPath('沪深300'))
  else
    router.replace('/subPages/valuation-tool/index')
}

function handleOpenWatchlist() {
  router.push(createWatchlistPath())
}

function handleOpenMineScan() {
  if (!fundCode.value)
    return

  router.push(createMineScanPath(fundCode.value))
}

function handleToggleWatchlist() {
  if (!fundCode.value)
    return

  toggleWatchlist({
    code: fundCode.value,
    name: displayResult.value.name,
    dailyChange: marketType.value === 'exchange'
      ? exchangeQuote.value?.priceChangeRatio ?? null
      : displayResult.value.intraday?.value ?? null,
    updateTime: marketType.value === 'exchange'
      ? exchangeQuote.value?.updateTime
      : displayResult.value.intraday?.updateTime,
  })
}
</script>

<template>
  <view class="min-h-screen bg-page vt-page-shell" :class="showDetail ? 'pb-[160rpx]' : 'pb-8'">
    <view class="mx-auto flex flex-col gap-4">
      <view v-if="loading && !showDetail" class="rounded-card bg-surface p-6 text-center">
        <wd-loading />
        <text class="mt-3 block text-sm text-secondary">
          正在生成基金说明...
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
          :exchange-quote="exchangeQuoteError ? undefined : exchangeQuote"
          :market-type="marketType"
          :result="displayResult"
          :valuation="marketType === 'otc' && !valuationError ? (valuationResponse as DiscoveryFundValuation | undefined) : undefined"
        />
        <view class="py-[24rpx] vt-page-x">
          <RiskNoteCard :text="displayResult.disclaimer" />
        </view>
      </template>
    </view>

    <DetailActionBar
      v-if="showDetail"
      :watchlisted="watchlisted"
      @open-mine-scan="handleOpenMineScan"
      @open-watchlist="handleOpenWatchlist"
      @toggle="handleToggleWatchlist"
    />
  </view>
</template>
