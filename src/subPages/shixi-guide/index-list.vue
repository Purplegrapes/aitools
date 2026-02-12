<script setup lang="ts">
import type { AssetPoolAsset, AssetPoolResponse } from './types'
import { getAssetPoolData } from './api'
import { MonthlyDividendPoolCode } from './types'

interface MarketTag {
  text: string
  color: string
  bgColor: string
}

interface DividendIndexItem {
  name: string
  code: string
  dividendRate: number
  constituentCount: number
  tag?: MarketTag
}

interface BasePagingExpose<T = any> {
  pagingRef: ZPagingRef<T> | null
  reload: (animate?: boolean) => Promise<ZPagingParams.ReturnData<T>> | undefined
}

definePage({
  name: 'dividend-index-list',
  layout: 'default',
  style: {
    navigationBarTitleText: '红利指数浏览器',
  },
})

const router = useRouter()
const route = useRoute()
const descending = ref(true)

const DEFAULT_POOL_CODE = MonthlyDividendPoolCode.ETF
const dataDate = ref('')
const currentPoolCode = ref<MonthlyDividendPoolCode>(DEFAULT_POOL_CODE)
const sourceList = ref<DividendIndexItem[]>([])

const basePagingRef = ref<BasePagingExpose<DividendIndexItem> | null>(null)
const pagingRef = computed<ZPagingRef<DividendIndexItem> | null>(() => {
  return basePagingRef.value?.pagingRef ?? null
})

const { onQuery, reload } = usePagedQuery<Partial<AssetPoolResponse>, DividendIndexItem>({
  pagingRef,
  request: async (pageNo, pageSize) => {
    const res = await getAssetPoolData(currentPoolCode.value, {
      page_no: pageNo,
      page_size: pageSize,
    })
    return ((res as any)?.data ?? res) as Partial<AssetPoolResponse>
  },
  getList: raw => (Array.isArray(raw.assets) ? raw.assets : [])
    .map(mapAssetToIndexItem)
    .filter((item): item is DividendIndexItem => !!item),
  getTotal: (raw) => {
    const total = Number(raw.total_count)
    return Number.isFinite(total) ? total : null
  },
  onSuccess: (raw) => {
    dataDate.value = raw.adjust_date || dataDate.value
  },
  onError: () => {
    dataDate.value = ''
  },
})

watch(
  () => route.query?.poolCode,
  (poolCodeQuery) => {
    const nextPoolCode = normalizePoolCode(poolCodeQuery)
    if (nextPoolCode === currentPoolCode.value)
      return

    currentPoolCode.value = nextPoolCode
    dataDate.value = ''
    reload()
  },
  { immediate: true },
)

const displayList = computed(() => {
  return [...sourceList.value].sort((a, b) => {
    return descending.value
      ? b.dividendRate - a.dividendRate
      : a.dividendRate - b.dividendRate
  })
})

function toggleSort() {
  descending.value = !descending.value
}

function openDetail(item: DividendIndexItem) {
  router.push(`/subPages/shixi-guide/asset-detail?code=${encodeURIComponent(item.code)}&assetType=${encodeURIComponent(currentPoolCode.value)}`)
}

function getRateClass(rate: number) {
  return rate >= 0 ? 'text-#ef4444' : 'text-#16a34a'
}

function formatRate(rate: number) {
  return `${rate.toFixed(2)}%`
}

function mapAssetToIndexItem(asset: AssetPoolAsset): DividendIndexItem | null {
  const raw = asset as Record<string, unknown>
  const code = toStringValue(raw.code)
  const name = toStringValue(raw.name)
  if (!code || !name)
    return null

  const rawDividendRate = toNumber(raw.dividend_rate, raw.dividendRate, raw.dividend_yield)
  const dividendRate = normalizeDividendRate(rawDividendRate)
  const constituentCount = toNumber(raw.constituent_count, raw.constituents_count, raw.count) ?? 0
  const marketTag = toStringValue(raw.market_tag, raw.tag, raw.market, raw.exchange)

  return {
    name,
    code,
    dividendRate,
    constituentCount,
    tag: createMarketTag(marketTag),
  }
}

function createMarketTag(tagText: string): MarketTag | undefined {
  if (!tagText)
    return undefined

  const normalizedTag = tagText.trim()
  const tagThemeMap: Record<string, Omit<MarketTag, 'text'>> = {
    沪: { color: '#ef4444', bgColor: '#fff1f2' },
    深: { color: '#2563eb', bgColor: '#eff6ff' },
    港: { color: '#4f46e5', bgColor: '#eef2ff' },
    沪港深: { color: '#ea580c', bgColor: '#fff7ed' },
    A股: { color: '#2563eb', bgColor: '#eff6ff' },
  }
  const theme = tagThemeMap[normalizedTag] ?? { color: '#6b7280', bgColor: '#f3f4f6' }
  return {
    text: normalizedTag,
    ...theme,
  }
}

function toStringValue(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

function toNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (Number.isFinite(parsed))
        return parsed
    }
  }
  return null
}

function normalizeDividendRate(rate: number | null): number {
  if (rate == null || !Number.isFinite(rate))
    return 0

  if (Math.abs(rate) <= 1) {
    return rate * 100
  }
  return rate
}

function normalizePoolCode(value: unknown): MonthlyDividendPoolCode {
  if (typeof value !== 'string' || !value.trim())
    return DEFAULT_POOL_CODE

  let decoded = value.trim()
  try {
    decoded = decodeURIComponent(decoded).trim()
  }
  catch {
    decoded = value.trim()
  }
  if (
    decoded === MonthlyDividendPoolCode.MAIN
    || decoded === MonthlyDividendPoolCode.ETF
    || decoded === MonthlyDividendPoolCode.FUND
  ) {
    return decoded
  }
  return DEFAULT_POOL_CODE
}
</script>

<template>
  <BasePaging
    ref="basePagingRef"
    v-model:list="sourceList"
    :fixed="true"
    :page-size="10"
    empty-text="暂无指数数据"
    @query="onQuery"
  >
    <view class="px-4 pb-2 pt-3">
      <view class="flex items-center justify-end">
        <text class="text-xs text-#b2bac7">
          数据更新日：{{ dataDate || '--' }}
        </text>
      </view>
    </view>

    <view class="px-4">
      <view class="list-header text-xs">
        <text class="w-[45%] text-left">
          指数代码
        </text>
        <view class="w-[30%] flex items-center justify-center gap-1" @click="toggleSort">
          <text>股息率</text>
          <view class="flex flex-col leading-none">
            <wd-icon
              name="arrow-up"
              :custom-class="descending ? 'sort-icon-active' : 'sort-icon-muted'"
            />
            <wd-icon
              name="arrow-down"
              :custom-class="descending ? 'sort-icon-muted' : 'sort-icon-active'"
            />
          </view>
        </view>
        <text class="w-[25%] text-right">
          成分个数
        </text>
      </view>

      <wd-cell
        v-for="item in displayList"
        :key="item.code"
        custom-class="list-row-cell"
        :border="false"
        value-align="left"
      >
        <view class="w-full flex items-center" @click="openDetail(item)">
          <view class="w-[45%] overflow-hidden">
            <text class="block truncate text-xs text-#1f2937 font-medium leading-5">
              {{ item.name }}
            </text>
            <view class="mt-1 flex items-center gap-1.5">
              <text class="text-xs text-#8b95a5 leading-4">
                {{ item.code }}
              </text>
              <wd-tag
                v-if="item.tag"
                plain
                custom-class="index-tag"
                :color="item.tag.color"
                :bg-color="item.tag.bgColor"
              >
                {{ item.tag.text }}
              </wd-tag>
            </view>
          </view>

          <view class="w-[30%] text-center">
            <text class="text-sm font-semibold leading-5" :class="getRateClass(item.dividendRate)">
              {{ formatRate(item.dividendRate) }}
            </text>
          </view>

          <view class="w-[25%] text-right">
            <text class="text-sm text-#111827 font-semibold leading-5">
              {{ item.constituentCount }}
            </text>
          </view>
        </view>
      </wd-cell>
    </view>
  </BasePaging>
</template>

<style lang="scss" scoped>
.list-header {
  display: flex;
  align-items: center;
  padding: 0 0 8px;
  border-bottom: 1rpx solid #e5e7eb;
  color: #9ca3af;
}

:deep(.list-row-cell) {
  padding-left: 0 !important;
  background: transparent !important;
}

:deep(.list-row-cell .wd-cell__wrapper) {
  min-height: 64px !important;
  padding: 7px 0 !important;
  border-bottom: 1rpx solid #e5e7eb !important;
  align-items: center !important;
}

:deep(.list-row-cell .wd-cell__right) {
  flex: 1 !important;
}

:deep(.list-row-cell .wd-cell__body) {
  width: 100% !important;
}

.index-tag {
  padding: 0 3px !important;
  border-radius: 4px !important;
  font-size: 10px !important;
}

.sort-icon-active {
  font-size: 10px !important;
  color: #111827 !important;
  height: 8px !important;
  line-height: 8px !important;
}

.sort-icon-muted {
  font-size: 10px !important;
  color: #d1d5db !important;
  height: 8px !important;
  line-height: 8px !important;
}
</style>
