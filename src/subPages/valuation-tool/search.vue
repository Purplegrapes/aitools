<script setup lang="ts">
import type { FundSearchServiceItem, SearchResultViewModel } from './types'
import { searchFunds } from './api/valuationTool'
import SearchResultTableRow from './components/SearchResultTableRow.vue'
import ValuationSearchBar from './components/ValuationSearchBar.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { findFallbackSearchResults, normalizeFundSearchServiceItem } from './mock'
import { createResultPath, normalizeKeyword } from './utils'

definePage({
  name: 'valuation-tool-search',
  layout: 'default',
  style: {
    navigationBarTitleText: '基金搜索',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const searchKeyword = shallowRef('')
const submittedKeyword = shallowRef('')
const {
  refreshWatchlist,
  isWatchlisted,
  toggleWatchlist,
} = useValuationWatchlist()

const {
  data: searchResponse,
  loading,
  error,
  send: runSearch,
} = useRequest(
  () => searchFunds({
    keyword: submittedKeyword.value,
  }),
  {
    immediate: false,
    onError: () => undefined,
  },
)

function resolveSearchItems(response: unknown) {
  const normalizedResponse = normalizeSearchPayload(response)
  const candidateList = findSearchCandidateList(normalizedResponse)

  return candidateList
    .map(normalizeSearchItem)
    .filter((item): item is FundSearchServiceItem => !!item)
}

const searchResults = computed<SearchResultViewModel[]>(() => {
  const items = resolveSearchItems(searchResponse.value).map(normalizeFundSearchServiceItem)
  if (items.length)
    return items

  if (error.value && import.meta.env.DEV)
    return findFallbackSearchResults(submittedKeyword.value)

  return []
})

const hasKeyword = computed(() => !!submittedKeyword.value)
const isIdle = computed(() => !hasKeyword.value)
const isEmpty = computed(() => hasKeyword.value && !loading.value && !error.value && !searchResults.value.length)
const isSuccess = computed(() => hasKeyword.value && !loading.value && !!searchResults.value.length)
const isError = computed(() => hasKeyword.value && !loading.value && !searchResults.value.length && !!error.value)

const initialKeyword = normalizeKeyword(route.query.q)
if (initialKeyword) {
  searchKeyword.value = initialKeyword
  submittedKeyword.value = initialKeyword
  runSearch()
}

onShow(() => {
  refreshWatchlist()
})

function handleSubmit() {
  const nextKeyword = searchKeyword.value.trim()
  if (!nextKeyword)
    return

  submittedKeyword.value = nextKeyword
  runSearch()
  refreshWatchlist()
}

function handleSelectFund(code: string) {
  router.push(createResultPath(code))
}

function handleToggleWatchlist(item: SearchResultViewModel) {
  toggleWatchlist({
    code: item.code,
    name: item.name,
  })
}

function normalizeSearchPayload(payload: unknown): unknown {
  if (typeof payload !== 'string')
    return payload

  try {
    return JSON.parse(payload)
  }
  catch {
    return payload
  }
}

function findSearchCandidateList(payload: unknown): unknown[] {
  if (Array.isArray(payload))
    return payload

  if (!payload || typeof payload !== 'object')
    return []

  const objectPayload = payload as Record<string, unknown>
  const preferredKeys = ['data', 'items', 'list', 'records', 'rows', 'result']

  for (const key of preferredKeys) {
    const value = objectPayload[key]
    if (Array.isArray(value))
      return value
  }

  for (const key of preferredKeys) {
    const value = objectPayload[key]
    const nestedList = findSearchCandidateList(value)
    if (nestedList.length)
      return nestedList
  }

  return []
}

function normalizeSearchItem(item: unknown): FundSearchServiceItem | null {
  if (!item || typeof item !== 'object')
    return null

  const payload = item as Record<string, unknown>
  const code = `${payload.code ?? payload.fundCode ?? payload.securityCode ?? ''}`.trim()
  const name = `${payload.name ?? payload.fundName ?? payload.securityName ?? ''}`.trim()

  if (!code && !name)
    return null

  return {
    code,
    name: name || code,
    channel: stringifyNullableField(payload.channel ?? payload.saleChannel ?? payload.source),
    subCategoryId: stringifyNullableField(payload.subCategoryId ?? payload.categoryId ?? payload.subCategory),
  }
}

function stringifyNullableField(value: unknown) {
  if (value === null || value === undefined)
    return null

  const normalizedValue = `${value}`.trim()
  return normalizedValue || null
}
</script>

<template>
  <view class="min-h-screen bg-page vt-page-shell pb-8">
    <view class="mx-auto max-w-[680rpx] flex flex-col gap-4">
      <ValuationSearchBar
        v-model="searchKeyword"
        placeholder="继续搜索基金名称或代码"
        button-text="查看"
        @submit="handleSubmit"
      />

      <view v-if="isIdle" class="vt-top-card p-6">
        <text class="block text-base text-primary font-600">
          搜索基金
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          输入基金名称或代码，结果会按名称、代码和自选操作直接展示。
        </text>
      </view>

      <view v-else-if="loading" class="vt-top-card p-6 text-center">
        <wd-loading />
        <text class="mt-3 block text-sm text-secondary">
          正在搜索相关基金...
        </text>
      </view>

      <view v-else-if="isEmpty" class="vt-top-card p-6">
        <text class="block text-base text-primary font-600">
          没找到相关基金
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          请换一个更短的关键词，或者直接输入基金代码再试。
        </text>
      </view>

      <view v-else-if="isError" class="vt-top-card p-6">
        <text class="block text-base text-primary font-600">
          搜索暂时有点忙
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          当前没能完成精确搜索，请稍后再试。
        </text>
      </view>

      <view v-else-if="isSuccess" class="flex flex-col gap-[16rpx]">
        <text class="px-[4rpx] text-[24rpx] text-secondary">
          找到 {{ searchResults.length }} 只相关基金，可直接加入或删除自选
        </text>

        <view class="overflow-hidden rounded-card bg-surface shadow-sm">
          <view class="grid grid-cols-[minmax(0,1.3fr)_150rpx_150rpx] items-center gap-[12rpx] bg-surfaceSubtle px-[24rpx] py-[20rpx]">
            <text class="text-[22rpx] text-secondary font-600">
              基金名称
            </text>
            <text class="text-center text-[22rpx] text-secondary font-600">
              代码
            </text>
            <text class="text-right text-[22rpx] text-secondary font-600">
              自选
            </text>
          </view>

          <SearchResultTableRow
            v-for="item in searchResults"
            :key="item.code"
            :item="item"
            :watchlisted="isWatchlisted(item.code)"
            @select="handleSelectFund"
            @toggle="handleToggleWatchlist"
          />
        </view>
      </view>
    </view>
  </view>
</template>
