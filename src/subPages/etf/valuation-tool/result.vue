<script setup lang="ts">
import type { DiscoveryFundValuation, FundIntraday, FundResult } from './types'
import { getFundValuation } from '@/api/discovery'
import { getFundResult } from '../api/valuationTool'
import DetailActionBar from './components/DetailActionBar.vue'
import DetailStateCard from './components/DetailStateCard.vue'
import DetailSummaryCards from './components/DetailSummaryCards.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { detailStateMetaMap, getFallbackFundResult } from './mock'
import {
  createMineScanPath,
  createSearchPath,
  createWatchlistPath,
  isFundResultStatus,
  mapValuationToIntraday,
  normalizeKeyword,
} from './utils'

definePage({
  name: 'etf-valuation-tool-result',
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

const displayResult = computed<FundResult>(() => {
  if (!realtimeIntraday.value || valuationError.value)
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
    fetchResult()
    fetchValuation()
    refreshWatchlist()
  },
  { immediate: true },
)

function handlePrimaryAction() {
  if (displayStatus.value === 'not_found')
    router.replace(createSearchPath('沪深300'))
  else
    router.replace('/subPages/etf/valuation-tool/index')
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
    dailyChange: displayResult.value.intraday?.value ?? null,
    updateTime: displayResult.value.intraday?.updateTime,
  })
}
</script>

<template>
  <view class="min-h-screen bg-page px-4 pt-4" :class="showDetail ? 'pb-[220rpx]' : 'pb-8'">
    <view class="mx-auto max-w-[680rpx] flex flex-col gap-4">
      <view v-if="loading && !showDetail" class="rounded-4 bg-surface p-6 text-center shadow-sm">
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
        <DetailSummaryCards :result="displayResult" />
        <view class="p-4 text-center">
          <text class="text-xs text-secondary leading-6">
            {{ displayResult.disclaimer }}
          </text>
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
