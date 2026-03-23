<script setup lang="ts">
import type { FundSearchServiceItem, SearchResultViewModel } from './types'
import { searchFunds } from './api/valuationTool'
import ValuationSearchBar from './components/ValuationSearchBar.vue'
import { useValuationWatchlist } from './composables/useValuationWatchlist'
import { findFallbackSearchResults, normalizeFundSearchServiceItem } from './mock'
import { createResultPath, normalizeKeyword } from './utils'

definePage({
  name: 'valuation-tool-search',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
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

// 动画相关
const staggerDelay = ref(0)
const resultCount = computed(() => searchResults.value.length)

watch(resultCount, (newCount, oldCount) => {
  if (newCount > 0 && oldCount === 0) {
    staggerDelay.value = Date.now()
  }
})

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
  <view class="min-h-full bg-page vt-page-shell">
    <!-- 顶部搜索区域 -->
    <view class="sticky top-0 z-10 bg-page/95 backdrop-blur-sm">
      <view class="mx-auto py-2">
        <ValuationSearchBar
          v-model="searchKeyword"
          placeholder="输入基金名称或代码"
          button-text="搜索"
          @submit="handleSubmit"
        />
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="mx-auto pb-8">
      <!-- 空闲状态 -->
      <transition name="fade">
        <view v-if="isIdle" class="min-h-[50vh] flex flex-col items-center justify-center py-12">
          <view class="from-blue-50 shadow-blue-200/50 mb-6 h-20 w-20 flex items-center justify-center rounded-full to-indigo-100 bg-gradient-to-br shadow-lg">
            <wd-icon name="search" class="text-brand" size="30" />
          </view>
          <text class="mb-3 text-base text-primary font-semibold">
            发现优质基金
          </text>
          <text class="max-w-[280rpx] text-center text-sm text-secondary leading-relaxed">
            输入基金名称或代码，快速找到您关注的基金
          </text>

          <!-- 热门搜索提示 -->
          <view class="mt-8 flex flex-wrap justify-center gap-2">
            <view
              v-for="hint in ['沪深300', '中证500', '创业板']"
              :key="hint"
              class="cursor-pointer rounded-full bg-surface px-4 py-2 text-sm text-secondary transition-all active:scale-95"
              @click="searchKeyword = hint; handleSubmit()"
            >
              {{ hint }}
            </view>
          </view>
        </view>
      </transition>

      <!-- 加载状态 -->
      <transition name="fade">
        <view v-if="loading" class="min-h-[50vh] flex flex-col items-center justify-center py-12">
          <view class="relative">
            <view class="border-blue-100 border-t-blue-500 h-14 w-14 animate-spin border-4 rounded-full" />
            <view class="absolute inset-0 h-14 w-14 flex items-center justify-center">
              <view class="i-carbon-time text-blue-500 text-[24rpx]" />
            </view>
          </view>
          <text class="mt-6 text-sm text-secondary">
            正在搜索基金...
          </text>
        </view>
      </transition>

      <!-- 空结果状态 -->
      <transition name="slide-up">
        <view v-if="isEmpty" class="min-h-[50vh] flex flex-col items-center justify-center py-12">
          <view class="mb-6 h-20 w-20 flex items-center justify-center rounded-full from-amber-50 to-orange-100 bg-gradient-to-br shadow-amber-200/50 shadow-lg">
            <view class="i-carbon-folder-off text-[40rpx] text-amber-500" />
          </view>
          <text class="mb-3 text-base text-primary font-semibold">
            未找到相关基金
          </text>
          <text class="max-w-[280rpx] text-center text-sm text-secondary leading-relaxed">
            试试缩短关键词，或直接输入完整的基金代码
          </text>
        </view>
      </transition>

      <!-- 错误状态 -->
      <transition name="slide-up">
        <view v-if="isError" class="min-h-[50vh] flex flex-col items-center justify-center py-12">
          <view class="from-red-50 shadow-red-200/50 mb-6 h-20 w-20 flex items-center justify-center rounded-full to-pink-100 bg-gradient-to-br shadow-lg">
            <view class="i-carbon-warning-alt text-red-500 text-[40rpx]" />
          </view>
          <text class="mb-3 text-base text-primary font-semibold">
            搜索暂时繁忙
          </text>
          <text class="max-w-[280rpx] text-center text-sm text-secondary leading-relaxed">
            服务暂时不可用，请稍后再试
          </text>
          <view
            class="mt-6 cursor-pointer rounded-full bg-primary px-6 py-3 text-sm text-white font-medium transition-all active:scale-95"
            @click="handleSubmit"
          >
            重试
          </view>
        </view>
      </transition>

      <!-- 搜索结果 - 紧凑列表 -->
      <transition-group name="stagger" tag="view" class="mt-4 flex flex-col gap-2">
        <template v-if="isSuccess">
          <!-- 结果计数 -->
          <view class="mb-2 flex items-center gap-2 px-2">
            <wd-icon name="check-circle-filled" size="22px" class="text-brand" />
            <text class="text-sm text-primary">
              找到 <text class="text-blue-600 text-base font-semibold">
                {{ searchResults.length }}
              </text> 只基金
            </text>
          </view>

          <!-- 结果列表 -->
          <view
            v-for="(item, index) in searchResults"
            :key="item.code"
            :style="{ animationDelay: `${index * 30}ms` }"
            class="flex items-center gap-3 rounded-xl bg-surface px-3 py-3 transition-all active:bg-surfaceSubtle"
            @click="handleSelectFund(item.code)"
          >
            <!-- 基金信息 -->
            <view class="min-w-0 flex-1">
              <text class="block truncate text-sm text-primary leading-relaxed">
                {{ item.name }}
              </text>
              <view class="mt-1 flex items-center gap-2">
                <text class="text-xs text-secondary font-mono">
                  {{ item.code }}
                </text>
                <view v-if="item.channel" class="rounded-md bg-surfaceSubtle px-1.5 py-0.5">
                  <text class="text-[10rpx] text-secondary">
                    {{ item.channel }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 自选按钮 -->
            <view
              class="h-9 w-9 flex flex-shrink-0 items-center justify-center rounded-full transition-all active:scale-90"
              :class="isWatchlisted(item.code) ? 'bg-amber-50' : ''"
              @click.stop="handleToggleWatchlist(item)"
            >
              <view
                class="text-[26rpx] transition-all"
                :class="isWatchlisted(item.code) ? 'i-carbon-star-filled text-[#FFB800]' : 'i-carbon-star text-secondary'"
              />
            </view>
          </view>
        </template>
      </transition-group>
    </view>
  </view>
</template>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑入动画 */
.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* 交错动画 */
.stagger-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.stagger-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.95);
}

.stagger-move {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
