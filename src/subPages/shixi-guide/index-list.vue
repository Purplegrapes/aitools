<script setup lang="ts">
import { createGlobalLoadingMiddleware } from '@/api/core/middleware'
import { getAssetPoolData } from './api'
import type { AssetPoolAsset, AssetPoolResponse } from './api'
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

definePage({
  name: 'dividend-index-list',
  layout: 'default',
  style: {
    navigationBarTitleText: '红利指数浏览器',
  },
})

const router = useRouter()
const descending = ref(true)

const dataDate = ref('')
const currentPoolCode = ref<MonthlyDividendPoolCode>(MonthlyDividendPoolCode.ETF)
const sourceList = ref<DividendIndexItem[]>([])

const { send: fetchAssetPoolList } = useRequest(
  () => getAssetPoolData(currentPoolCode.value),
  {
    immediate: false,
    middleware: createGlobalLoadingMiddleware({
      loadingText: '加载中...',
    }),
  },
).onSuccess((res) => {
  const payload = ((res as any)?.data ?? res) as Partial<AssetPoolResponse> | undefined
  if (!payload) {
    sourceList.value = []
    dataDate.value = ''
    return
  }

  dataDate.value = payload.adjust_date || ''

  const assets = Array.isArray(payload.assets) ? payload.assets : []
  sourceList.value = assets
    .map(mapAssetToIndexItem)
    .filter((item): item is DividendIndexItem => !!item)
}).onError(() => {
  sourceList.value = []
  dataDate.value = ''
})

const displayList = computed(() => {
  return [...sourceList.value].sort((a, b) => {
    return descending.value
      ? b.dividendRate - a.dividendRate
      : a.dividendRate - b.dividendRate
  })
})

onMounted(() => {
  fetchAssetPoolList()
})

function toggleSort() {
  descending.value = !descending.value
}

function openDetail(item: DividendIndexItem) {
  router.push({
    name: 'asset-detail',
    query: {
      code: item.code,
      name: item.name,
    },
  })
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

  // 兼容后端返回小数(0.068)或百分数(6.8)两种口径
  if (Math.abs(rate) <= 1) {
    return rate * 100
  }
  return rate
}
</script>

<template>
  <view class="min-h-screen bg-#f5f7fb text-#1f2937">
    <view class="px-4 pb-3 pt-4">
      <view class="flex justify-end">
        <text class="text-base text-#b2bac7">
          数据更新日：{{ dataDate || '--' }}
        </text>
      </view>
    </view>

    <view class="px-4">
      <view class="list-header text-base">
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
        clickable
        @click="openDetail(item)"
      >
        <view class="w-full flex items-center">
          <view class="w-[45%] overflow-hidden">
            <text class="block truncate text-base text-#1f2937 font-medium leading-6">
              {{ item.name }}
            </text>
            <view class="mt-1 flex items-center gap-1.5">
              <text class="text-sm text-#8b95a5 leading-5">
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
            <text class="text-xl font-semibold leading-7" :class="getRateClass(item.dividendRate)">
              {{ formatRate(item.dividendRate) }}
            </text>
          </view>

          <view class="w-[25%] text-right">
            <text class="text-xl text-#111827 font-semibold leading-7">
              {{ item.constituentCount }}
            </text>
          </view>
        </view>
      </wd-cell>

      <view v-if="displayList.length === 0" class="py-8 text-center text-sm text-#9ca3af">
        暂无指数数据
      </view>
    </view>

    <view v-if="displayList.length > 0" class="pb-[calc(env(safe-area-inset-bottom)+18px)] pt-6 text-center">
      <view class="inline-flex items-center gap-2 text-lg text-#8b95a5">
        <text>上滑加载更多</text>
        <wd-loading custom-class="load-icon" type="ring" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.list-header {
  display: flex;
  align-items: center;
  padding: 0 0 10px;
  border-bottom: 1rpx solid #e5e7eb;
  color: #9ca3af;
}

:deep(.list-row-cell) {
  padding-left: 0 !important;
  background: transparent !important;
}

:deep(.list-row-cell .wd-cell__wrapper) {
  min-height: 88px !important;
  padding: 9px 0 !important;
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
  padding: 0 4px !important;
  border-radius: 4px !important;
  font-size: 12px !important;
}

.sort-icon-active {
  font-size: 12px !important;
  color: #111827 !important;
  height: 10px !important;
  line-height: 10px !important;
}

.sort-icon-muted {
  font-size: 12px !important;
  color: #d1d5db !important;
  height: 10px !important;
  line-height: 10px !important;
}

.load-icon {
  width: 16px !important;
  height: 16px !important;
}
</style>
