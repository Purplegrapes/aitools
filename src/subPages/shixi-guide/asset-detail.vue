<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import type { ApiFactorHistoryResponse, ChartDataPoint, DividendRatePoint, TimeRange, YuEBaoPoint } from './types'
import SegmentedControl from '@/components/SegmentedControl.vue'
import LineChart from '@/subEcharts/echarts/components/LineChart.vue'
import { formatAssets, formatDecimalToPercent } from '@/utils/format'
import { getAssetDetail, getFactorHistory } from './api'

defineOptions({
  componentPlaceholder: {
    SegmentedControl: 'view',
    LineChart: 'view',
  },
})

definePage({
  name: 'asset-detail',
  layout: 'default',
  style: {
    navigationBarTitleText: '资产详情',
    backgroundColor: '#F5F7FA',
    navigationBarBackgroundColor: '#CFE3FB',
  },
})

const route = useRoute()
const globalToast = useGlobalToast()
const YUEBAO_COMPARISON_CODE = '000198_OF'
const TEN_YEAR_TREASURY_CODE = '_10nqcxgz'

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange, label: string, days: number }> = [
  { value: '1w', label: '近一周', days: 7 },
  { value: '1m', label: '近一月', days: 30 },
  { value: '1q', label: '近一季度', days: 90 },
] as const

const query = computed(() => route.query as { code?: string, name?: string, assetType?: string, poolCode?: string })

const currentTimeRange = ref<TimeRange>('1m')
const loading = ref(true)
const assetCode = ref('')

const { data: assetDetail, send: fetchAssetDetail } = useRequest(
  () => getAssetDetail(assetCode.value),
  { immediate: false },
)
const isIndexAsset = computed(() => {
  const assetType = (query.value.assetType || assetDetail.value?.asset_type || '').trim()
  return assetType.toLowerCase() === 'index'
})

const factorParams = ref<{
  start_date: string
  end_date: string
  codes: string
  factors: string
} | null>(null)

const { data: factorHistoryData, send: fetchFactorHistory } = useRequest(
  () => getFactorHistory(factorParams.value ?? {
    start_date: '',
    end_date: '',
    codes: '',
    factors: '',
  }),
  { immediate: false },
)

const currentDate = computed(() => new Date().toISOString().split('T')[0])

const assetTitle = computed(() => {
  return query.value.name || assetDetail.value?.name || '指数详情'
})

const assetDisplayCode = computed(() => {
  return assetDetail.value?.code || query.value.code || '--'
})

const updatedDate = computed(() => {
  return normalizeDateValue(assetDetail.value?.dividend_update_date)
    || normalizeDateValue(assetDetail.value?.updated_at)
    || '--'
})

const formattedDividendRate = computed(() => {
  return formatDecimalToPercent(assetDetail.value?.dividend_rate)
})

const monthlyInvestmentText = computed(() => {
  const value = assetDetail.value?.monthly_dividend_investment
  if (value == null || Number.isNaN(Number(value)))
    return '--'
  return Number(value).toFixed(2)
})

const detailRows = computed(() => {
  const detail = (assetDetail.value ?? {}) as Record<string, unknown>
  if (isIndexAsset.value) {
    const shortName = toText(detail.short_name)
      || toText(assetTitle.value.replace(/指数$/, ''))
      || '--'

    return [
      { label: '指数简称', value: shortName, icon: 'chart-pie' },
      { label: '指数成分个数', value: toText(detail.constituent_count) || toText(detail.constituents_count) || '--', icon: 'layers' },
      { label: '指数加权方式', value: toText(detail.weighting_method) || '--', icon: 'swap' },
      { label: '指数样本调整周期', value: toText(detail.rebalance_cycle) || '--', icon: 'time' },
      { label: '股息率(TTM)', value: formattedDividendRate.value, icon: 'chart' },
      { label: '每月千元分红需总投入(万元)', value: monthlyInvestmentText.value, icon: 'creditcard' },
    ]
  }

  const rows: Array<{ label: string, value: string, icon: string }> = []

  const dividendRate = toNumber(detail.dividend_rate)
  if (dividendRate != null) {
    rows.push({
      label: '食息率',
      value: formatDecimalToPercent(dividendRate),
      icon: 'chart',
    })
  }

  const managementCompany = toText(detail.management_company)
  if (managementCompany) {
    rows.push({
      label: '管理公司',
      value: managementCompany,
      icon: 'layers',
    })
  }

  const establishmentDate = toText(detail.establishment_date)
  if (establishmentDate) {
    rows.push({
      label: '成立日期',
      value: establishmentDate,
      icon: 'time',
    })
  }

  const monthlyInvestment = toNumber(detail.monthly_dividend_investment)
  if (monthlyInvestment != null) {
    rows.push({
      label: '月分红投入',
      value: formatAssets(monthlyInvestment),
      icon: 'creditcard',
    })
  }

  return rows
})

function parseDateUTC(dateString: string): Date | null {
  if (!dateString)
    return null
  const date = new Date(`${dateString}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateUTC(date: Date): string {
  return date.toISOString().split('T')[0]
}

function normalizeDateValue(raw: unknown): string {
  if (typeof raw !== 'string')
    return ''
  const text = raw.trim()
  if (!text)
    return ''
  if (text.includes('T'))
    return text.split('T')[0] || ''
  return text.slice(0, 10)
}

const chartBaseEndDate = computed(() => {
  return normalizeDateValue(assetDetail.value?.dividend_update_date)
    || normalizeDateValue(assetDetail.value?.updated_at)
    || currentDate.value
})

function fillDividendHistorySparse(
  factors: DividendRatePoint[],
  rangeStart?: string,
  rangeEnd?: string,
): DividendRatePoint[] {
  if (!factors?.length)
    return []

  const start = parseDateUTC(rangeStart)
  const end = parseDateUTC(rangeEnd || currentDate.value)
  if (!start || !end || start.getTime() > end.getTime())
    return factors

  const sorted = [...factors].sort((a, b) => a.date.localeCompare(b.date))
  const factorMap = new Map(sorted.map(item => [item.date, item.dividend_rate]))
  const firstKnownRate = sorted[0]?.dividend_rate ?? null
  const firstKnownDate = sorted[0]?.date

  const points: DividendRatePoint[] = []
  const cursor = new Date(start.getTime())
  let lastRate: number | null = null
  while (cursor.getTime() <= end.getTime()) {
    const dateKey = formatDateUTC(cursor)
    const dayRate = factorMap.get(dateKey)
    if (dayRate != null)
      lastRate = dayRate
    points.push({
      date: dateKey,
      dividend_rate: (firstKnownDate && dateKey < firstKnownDate) ? null : (lastRate ?? firstKnownRate),
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return points
}

function buildFixedRateHistory(
  dividendRate: number,
  rangeStart?: string,
  rangeEnd?: string,
): DividendRatePoint[] {
  const start = parseDateUTC(rangeStart)
  const end = parseDateUTC(rangeEnd || currentDate.value)
  if (!start || !end || start.getTime() > end.getTime())
    return []

  const points: DividendRatePoint[] = []
  const cursor = new Date(start.getTime())
  while (cursor.getTime() <= end.getTime()) {
    points.push({
      date: formatDateUTC(cursor),
      dividend_rate: dividendRate,
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return points
}

const dividendHistory = computed(() => {
  const data = factorHistoryData.value as ApiFactorHistoryResponse
  const currentAssetHistory = data?.data?.find(item => item.code === assetCode.value)
  if (currentAssetHistory?.factors?.length) {
    return fillDividendHistorySparse(
      currentAssetHistory.factors,
      factorParams.value?.start_date,
      factorParams.value?.end_date,
    )
  }
  const dividendRate = assetDetail.value?.dividend_rate
  if (dividendRate == null)
    return [] as DividendRatePoint[]
  return buildFixedRateHistory(
    dividendRate,
    factorParams.value?.start_date,
    factorParams.value?.end_date,
  )
})

const yuEBaoHistory = computed<YuEBaoPoint[]>(() => {
  const data = factorHistoryData.value as ApiFactorHistoryResponse
  const yuEBaoFactorHistory = data?.data?.find(item => item.code === YUEBAO_COMPARISON_CODE)
  if (!yuEBaoFactorHistory?.factors?.length)
    return []

  return fillDividendHistorySparse(
    yuEBaoFactorHistory.factors,
    factorParams.value?.start_date,
    factorParams.value?.end_date,
  ).filter(item => item.dividend_rate != null).map((item) => {
    return {
      date: item.date,
      rate: Number(item.dividend_rate),
    }
  })
})

const treasuryYieldHistory = computed<YuEBaoPoint[]>(() => {
  const data = factorHistoryData.value as ApiFactorHistoryResponse
  const treasuryFactorHistory = data?.data?.find(item => item.code === TEN_YEAR_TREASURY_CODE)
  if (!treasuryFactorHistory?.factors?.length)
    return []

  return fillDividendHistorySparse(
    treasuryFactorHistory.factors,
    factorParams.value?.start_date,
    factorParams.value?.end_date,
  ).filter(item => item.dividend_rate != null).map((item) => {
    return {
      date: item.date,
      rate: Number(item.dividend_rate),
    }
  })
})

const chartData = computed<ChartDataPoint[]>(() => {
  return dividendHistory.value.map((item: DividendRatePoint) => {
    const rate = item.dividend_rate == null ? null : Number.parseFloat((item.dividend_rate * 100).toFixed(2))
    return {
      name: item.date,
      value: [item.date, rate],
      dividend_rate: rate,
    }
  })
})

const yuEBaoChartData = computed(() => {
  return yuEBaoHistory.value.map((item) => {
    const rate = Number.parseFloat((item.rate * 100).toFixed(2))
    return {
      name: item.date,
      value: [item.date, rate],
    }
  })
})

const treasuryYieldChartData = computed(() => {
  return treasuryYieldHistory.value.map((item) => {
    const rate = Number.parseFloat((item.rate * 100).toFixed(2))
    return {
      name: item.date,
      value: [item.date, rate],
    }
  })
})

const latestLegendDate = computed(() => chartData.value[chartData.value.length - 1]?.name || '--')
const latestDividendValue = computed(() => {
  const rate = chartData.value[chartData.value.length - 1]?.dividend_rate
  return typeof rate === 'number' ? `${rate.toFixed(2)}%` : '--'
})
const latestYuEBaoValue = computed(() => {
  const raw = yuEBaoChartData.value[yuEBaoChartData.value.length - 1]?.value?.[1]
  return typeof raw === 'number' ? `${raw.toFixed(2)}%` : '--'
})
const latestTreasuryYieldValue = computed(() => {
  const raw = treasuryYieldChartData.value[treasuryYieldChartData.value.length - 1]?.value?.[1]
  return typeof raw === 'number' ? `${raw.toFixed(2)}%` : '--'
})
const comparisonLegendItems = computed(() => [
  {
    label: '股息率',
    value: latestDividendValue.value,
    colorClass: 'bg-blue',
  },
  {
    label: '余额宝7日年化',
    value: latestYuEBaoValue.value,
    colorClass: 'bg-#ff7a1a',
  },
  {
    label: '10年期国债收益率',
    value: latestTreasuryYieldValue.value,
    colorClass: 'bg-#A7AFBF',
  },
])

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const chartOption = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  grid: { left: '8%', right: '5%', top: '8%', bottom: '16%' },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    textStyle: { color: '#1f2937' },
    formatter: (params: any) => {
      if (!params || params.length === 0)
        return ''
      const date = params[0].name
      const lines = params.map((param: any) => {
        const value = param.value?.[1]?.toFixed(2) || '0.00'
        return `${param.seriesName}: ${value}%`
      })
      return [date, ...lines].join('\n')
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: ['0%', '0%'],
    axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.35)' } },
    axisTick: { show: false },
    axisLabel: {
      color: '#94a3b8',
      fontSize: 10,
      interval: Math.max(Math.ceil(chartData.value.length / 3), 1),
      formatter: (v: string) => {
        const parts = v.split('-')
        return `${parts[0]}-${parts[1]}-${parts[2]}`
      },
    },
    splitLine: { show: false },
    data: chartData.value.map(item => item.name),
  },
  yAxis: {
    type: 'value',
    min: 0,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.25)', type: 'dashed' } },
    axisLabel: {
      color: '#94a3b8',
      fontSize: 10,
      formatter: (v: number) => `${v.toFixed(1)}%`,
    },
  },
  series: [
    {
      name: '股息率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: chartData.value,
      lineStyle: { width: 2, color: '#2371eb' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba('#2371eb', 0.14) },
            { offset: 1, color: hexToRgba('#2371eb', 0.01) },
          ],
        },
      },
    },
    {
      name: '余额宝7日年化',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: yuEBaoChartData.value,
      lineStyle: { width: 2, color: '#ff7a1a' },
    },
    {
      name: '10年期国债收益率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: treasuryYieldChartData.value,
      lineStyle: { width: 2, color: '#A7AFBF' },
    },
  ],
}))

function buildFactorParams(code: string, days: number, endDate: string) {
  const endDateObject = parseDateUTC(endDate)
  if (!endDateObject)
    return null
  const start = new Date(endDateObject.getTime())
  start.setUTCDate(start.getUTCDate() - days)
  return {
    start_date: start.toISOString().split('T')[0],
    end_date: formatDateUTC(endDateObject),
    codes: `${code},${YUEBAO_COMPARISON_CODE},${TEN_YEAR_TREASURY_CODE}`,
    factors: 'dividend_rate',
  }
}

async function refreshData() {
  if (!assetCode.value)
    return
  const option = TIME_RANGE_OPTIONS.find(o => o.value === currentTimeRange.value)
  if (!option)
    return
  const nextParams = buildFactorParams(assetCode.value, option.days, chartBaseEndDate.value)
  if (!nextParams)
    return
  factorParams.value = nextParams
  await fetchFactorHistory()
}

async function handleRangeChange() {
  await refreshData()
}

function toText(value: unknown): string {
  if (value == null)
    return ''
  const text = String(value).trim()
  return text === '' ? '' : text
}

function toNumber(value: unknown): number | null {
  if (value == null)
    return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

onMounted(async () => {
  const code = query.value.code

  if (!code) {
    globalToast.error({ msg: '缺少资产代码' })
    loading.value = false
    return
  }

  assetCode.value = code
  loading.value = true
  try {
    await fetchAssetDetail()
    const option = TIME_RANGE_OPTIONS.find(o => o.value === currentTimeRange.value) || TIME_RANGE_OPTIONS[0]
    const nextParams = buildFactorParams(code, option.days, chartBaseEndDate.value)
    if (!nextParams)
      throw new Error('invalid date range')
    factorParams.value = nextParams
    await fetchFactorHistory()
  }
  catch {
    globalToast.error({ msg: '数据加载失败，请稍后重试' })
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <view class="relative min-h-screen pb-[env(safe-area-inset-bottom)]">
    <!-- 渐变背景 - 只覆盖页面高度的 40% -->
    <view class="absolute left-0 right-0 top-0 h-[460rpx] from-#CFE3FB via-#EBF3FE to-#F5F7FA bg-gradient-to-b" />
    <view v-if="loading" class="relative z-1 flex items-center justify-center py-28">
      <wd-loading type="ring" />
    </view>

    <view v-else class="relative z-1 px-4 pb-5 pt-2">
      <!-- 顶部标题区域 -->
      <view class="pb-4">
        <text class="block text-xl text-primary font-500 leading-tight">
          {{ assetTitle }}
        </text>
        <view class="mt-2 flex items-center gap-1.5">
          <text class="text-sm text-secondary">
            {{ assetDisplayCode }}
          </text>
          <text class="text-secondary">
            |
          </text>
          <wd-icon name="calendar" custom-class="text-12px! text-secondary! leading-none!" />
          <text class="text-sm text-secondary">
            更新日期：{{ updatedDate }}
          </text>
        </view>
      </view>

      <!-- 指数详情卡片 -->
      <view
        v-if="detailRows.length"
        class="rounded-2xl bg-white p-3.5 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
      >
        <view
          v-for="(row, index) in detailRows"
          :key="row.label"
          class="flex items-center justify-between py-2"
          :class="index < detailRows.length - 1 ? 'border-b border-#eef2f7' : ''"
        >
          <text class="text-sm text-regular leading-5">
            {{ row.label }}
          </text>
          <text class="text-sm text-primary leading-5">
            {{ row.value }}
          </text>
        </view>
      </view>

      <!-- 食息率图表卡片 -->
      <view class="mt-4 rounded-2xl bg-white p-3.5 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
        <view class="flex items-center gap-2">
          <text class="text-base text-primary font-500">
            食息率
          </text>
          <wd-icon name="info-circle" custom-class="text-14px! text-tertiary! leading-none!" />
        </view>

        <view class="mt-3 rounded-xl bg-#f2f5fb px-3 py-3">
          <text class="text-sm text-tertiary leading-5">
            {{ latestLegendDate }}
          </text>
          <view class="grid grid-cols-[0.82fr_1.08fr_1.22fr] mt-3 gap-2">
            <view
              v-for="item in comparisonLegendItems"
              :key="item.label"
              class="min-w-0 flex items-start gap-2"
            >
              <view :class="item.colorClass" class="mt-[4rpx] h-[60rpx] w-[6rpx] shrink-0 rounded-full" />
              <view class="min-w-0">
                <text class="block truncate text-xs text-secondary leading-[32rpx]">
                  {{ item.label }}
                </text>
                <text class="mt-[8rpx] block text-sm text-primary font-600 leading-[32rpx]">
                  {{ item.value }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view class="mt-3 h-80">
          <LineChart :option="chartOption" custom-class="h-full w-full" />
        </view>

        <view class="mt-3">
          <SegmentedControl
            v-model="currentTimeRange"
            :options="TIME_RANGE_OPTIONS.map(o => ({ label: o.label, value: o.value }))"
            @change="handleRangeChange"
          />
        </view>
      </view>

      <!-- 数据说明 -->
      <view v-if="isIndexAsset" class="mt-4 px-1 pb-2 pt-1">
        <text class="text-sm text-tertiary font-500">
          数据说明：
        </text>
        <view class="mt-2.5 space-y-2">
          <text class="block text-xs text-tertiary leading-6">
            1. 本表中"股息率"指标选取主要红利指数近12个月动态股息率；
          </text>
          <text class="block text-xs text-tertiary leading-6">
            2. 本表中"每月千元分红需总投入"仅考虑基于指数股息率计算所得的股息回报（理论值），对应ETF的实际分红到账取决于基金公司的分红策略，二者可能存在较大出入。
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
// 保留无法用 UnoCSS 表达的样式
</style>
