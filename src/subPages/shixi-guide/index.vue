<script setup lang="ts">
/**
 * 资产详情页
 * 显示资产基本信息和股息率走势图
 */
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
  },

})

const route = useRoute()

// ==================== 主题常量 ====================
// 正股息率主题（红色）
const POSITIVE_DIVIDEND_THEME = {
  label: 'text-red-600/70',
  value: 'text-red-600',
  card: 'from-red-50 to-red-100/30',
  ring: 'ring-red-200/50',
  blur: 'bg-red-500/5',
} as const

// 负股息率主题（绿色）
const NEGATIVE_DIVIDEND_THEME = {
  label: 'text-emerald-600/70',
  value: 'text-emerald-600',
  card: 'from-emerald-50 to-emerald-100/30',
  ring: 'ring-emerald-200/50',
  blur: 'bg-emerald-500/5',
} as const

// ==================== 时间范围常量 ====================
const TIME_RANGE_OPTIONS: Array<{ value: TimeRange, label: string, days: number }> = [
  { value: '1w', label: '近一周', days: 7 },
  { value: '1m', label: '近一月', days: 30 },
  { value: '1q', label: '近一季度', days: 90 },
] as const

// ==================== 路由参数 ====================
const query = computed(() => route.query as {
  code?: string
  name?: string
})

// ==================== 状态 ====================
const currentTimeRange = ref<TimeRange>('1m')
const loading = ref(true)

// ==================== API 请求 ====================
// 资产代码
const assetCode = ref('')

// 资产详情
const { data: assetDetail, send: fetchAssetDetail } = useRequest(
  () => getAssetDetail(assetCode.value),
  { immediate: false },
)

// 百分比格式化后的股息率（用于显示）
const formattedDividendRate = computed(() => {
  return formatDecimalToPercent(assetDetail.value?.dividend_rate)
})

const hasDividendRate = computed(() => assetDetail.value?.dividend_rate != null)
const hasManagementCompany = computed(() => !!assetDetail.value?.management_company)
const hasEstablishmentDate = computed(() => !!assetDetail.value?.establishment_date)
const hasMonthlyDividendInvestment = computed(() => assetDetail.value?.monthly_dividend_investment != null)
const hasAnyMetrics = computed(() => {
  return (
    hasDividendRate.value
    || hasManagementCompany.value
    || hasEstablishmentDate.value
    || hasMonthlyDividendInvestment.value
  )
})

// 股息率颜色主题（正数红色，负数绿色）
const dividendRateTheme = computed(() => {
  const rate = assetDetail.value?.dividend_rate
  const isPositive = rate != null && rate > 0
  return isPositive ? POSITIVE_DIVIDEND_THEME : NEGATIVE_DIVIDEND_THEME
})

// 因子历史参数
const factorParams = ref<{
  start_date: string
  end_date: string
  codes: string
  factors: string
} | null>(null)

// 因子历史数据
const { data: factorHistoryData, send: fetchFactorHistory } = useRequest(
  () => getFactorHistory(factorParams.value ?? {
    start_date: '',
    end_date: '',
    codes: '',
    factors: '',
  }),
  { immediate: false },
)

// ==================== 计算属性 ====================
// 当前日期
const currentDate = computed(() => {
  return new Date().toISOString().split('T')[0]
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
      // 稳妥规则：首个有效值出现之前不填 0，保持断线；之后用最近一次值向后填充
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

// 股息率历史数据
const dividendHistory = computed(() => {
  const data = factorHistoryData.value as ApiFactorHistoryResponse
  if (data?.data?.[0]?.factors?.length) {
    return fillDividendHistorySparse(
      data.data[0].factors,
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

const isDividendHistoryFallback = computed(() => {
  const data = factorHistoryData.value as ApiFactorHistoryResponse
  return !(data?.data?.[0]?.factors?.length)
})

// 余额宝对比数据（Mock）- 与 dividendHistory 的每个日期点匹配
const yuEBaoHistory = computed<YuEBaoPoint[]>(() => {
  if (dividendHistory.value.length === 0) {
    return []
  }

  // 余额宝7日年化大约在 1.5% - 2.5% 之间波动（使用小数格式：0.015 - 0.025）
  // 使用基于日期的确定性算法，确保相同输入产生相同输出
  const BASE_RATE = 0.02

  return dividendHistory.value.map((item: DividendRatePoint) => {
    // 使用日期字符串的哈希值生成确定性波动
    const hash = item.date.split('-').join('').slice(-6)
    const hashNum = Number.parseInt(hash) || 0
    // 基于哈希值生成波动范围 [-0.0005, 0.0005]
    const fluctuation = ((hashNum % 1000) / 1000 - 0.5) * 0.001
    const rate = Math.max(0.015, Math.min(0.025, BASE_RATE + fluctuation))

    return {
      date: item.date,
      rate: Number.parseFloat(rate.toFixed(6)),
    }
  })
})

// 处理后的图表数据
const chartData = computed<ChartDataPoint[]>(() => {
  return dividendHistory.value.map((item: DividendRatePoint) => {
    const rate = item.dividend_rate == null
      ? null
      : Number.parseFloat((item.dividend_rate * 100).toFixed(2)) // 转换为百分比数值，保留两位小数
    return {
      name: item.date,
      value: [item.date, rate],
      dividend_rate: rate,
    }
  })
})

// 余额宝图表数据
const yuEBaoChartData = computed(() => {
  return yuEBaoHistory.value.map((item) => {
    const rate = Number.parseFloat((item.rate * 100).toFixed(2)) // 转换为百分比数值，保留两位小数
    return {
      name: item.date,
      value: [item.date, rate],
    }
  })
})

// ==================== 图表配置 ====================
/**
 * 转换 hex 颜色为 rgba 格式
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 图表配置
const chartOption = computed<EChartsOption>(() => ({
  backgroundColor: 'transparent',
  grid: { left: '8%', right: '8%', top: '10%', bottom: '18%' },
  color: ['#3b82f6', '#f59e0b'],
  legend: {
    bottom: '2%',
    icon: 'rect',
    show: true,
    textStyle: { color: '#475569', fontSize: 11 },
    itemWidth: 16,
    itemHeight: 8,
    borderRadius: 4,
    data: ['食息率', '余额宝'],
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textStyle: { color: '#1f2937' },
    formatter: (params: any) => {
      if (!params || params.length === 0)
        return ''
      const date = params[0].name
      let result = `${date}\n`
      params.forEach((param: any) => {
        const value = param.value?.[1]?.toFixed(2) || '0.00'
        result += `${param.seriesName}: ${value}%\n`
      })
      return result
    },
  },
  xAxis: {
    type: 'category',
    splitLine: { show: false },
    boundaryGap: ['0%', '0%'],
    axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
    axisLabel: {
      color: '#64748b',
      fontSize: 10,
      formatter: (v: string) => {
        const parts = v.split('-')
        return `${parts[1]}-${parts[2]}`
      },
      interval: Math.ceil(chartData.value.length / 6),
    },
    data: chartData.value.map(item => item.name),
  },
  yAxis: {
    type: 'value',
    name: '食息率 (%)',
    min: 'dataMin',
    max: 'dataMax',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
    axisLabel: {
      color: '#64748b',
      fontSize: 10,
      formatter: (v: number) => `${v.toFixed(2)}%`,
    },
    nameTextStyle: { color: '#64748b', fontSize: 10 },
  },
  series: [
    {
      name: '食息率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: chartData.value,
      lineStyle: { width: 2, color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba('#3b82f6', 0.15) },
            { offset: 1, color: hexToRgba('#3b82f6', 0.02) },
          ],
        },
      },
    },
    {
      name: '余额宝',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: yuEBaoChartData.value,
      lineStyle: { width: 2, color: '#f59e0b', type: 'dashed' },
    },
  ],
}))

// ==================== 数据加载函数 ====================
/**
 * 加载资产详情
 */
function loadAssetDetail(code: string) {
  assetCode.value = code
  fetchAssetDetail()
}

/**
 * 加载股息率历史数据
 */
function loadFactorHistory(code: string, days: number) {
  const end = currentDate.value
  const start = new Date()
  start.setDate(start.getDate() - days)
  const startDate = start.toISOString().split('T')[0]

  factorParams.value = {
    start_date: startDate,
    end_date: end,
    codes: code,
    factors: 'dividend_rate',
  }
  fetchFactorHistory()
}

/**
 * 刷新数据（切换时间范围）
 */
function refreshData() {
  if (!assetCode.value)
    return

  const option = TIME_RANGE_OPTIONS.find(o => o.value === currentTimeRange.value)
  if (option) {
    loadFactorHistory(assetCode.value, option.days)
  }
}

// ==================== 事件处理 ====================

// ==================== 生命周期 ====================
const globalToast = useGlobalToast()

onMounted(() => {
  const { code } = query.value

  if (!code) {
    globalToast.error({ msg: '缺少资产代码' })
    return
  }

  loading.value = true

  // 加载资产详情
  loadAssetDetail(code)

  // 加载股息率历史数据
  const option = TIME_RANGE_OPTIONS.find(o => o.value === currentTimeRange.value)
  if (option) {
    loadFactorHistory(code, option.days)
  }

  loading.value = false
})

// 监听数据变化
watch([assetDetail, dividendHistory], () => {
  loading.value = false
})

watch(
  [isDividendHistoryFallback, dividendHistory],
  ([isFallback, history]) => {
    if (isFallback || history.length === 0)
      return
    const rangeStart = factorParams.value?.start_date
    const rangeEnd = factorParams.value?.end_date
    console.info('[asset-detail] dividend history filled', {
      rangeStart,
      rangeEnd,
      points: history.length,
      firstPoint: history[0],
      lastPoint: history[history.length - 1],
    })
  },
  { immediate: true },
)
</script>

<template>
  <view class="asset-detail-page min-h-screen from-slate-50 to-slate-100/50 bg-gradient-to-b pb-[env(safe-area-inset-bottom)]">
    <!-- 加载状态 -->
    <transition name="fade">
      <view v-if="loading" class="loading-container flex flex-col items-center justify-center py-24">
        <view class="relative">
          <wd-loading type="spinner" size="28px" />
          <view class="animate-pulse-soft absolute inset-0 rounded-full bg-blue-500/10" />
        </view>
        <text class="loading-text mt-3 text-sm text-slate-400 font-medium tracking-wide">
          加载中...
        </text>
      </view>
    </transition>

    <transition name="fade">
      <view v-if="!loading" class="content-container p-4 space-y-4">
        <!-- 资产介绍卡片 -->
        <view class="asset-card overflow-hidden rounded-2xl bg-white shadow-slate-200/50 shadow-sm ring-slate-900/5">
          <view class="card-header border-b border-slate-100/80 px-5 py-4">
            <view class="flex items-start justify-between">
              <view class="flex-1">
                <text class="asset-name text-xl text-slate-800 font-bold tracking-tight">
                  {{ assetDetail?.name ?? '--' }}
                </text>
              </view>
            </view>
          </view>

          <!-- 关键指标 -->
          <view v-if="hasAnyMetrics" class="metrics-grid grid grid-cols-2 gap-3 px-5 py-4">
            <view
              v-if="hasDividendRate"
              class="metric-card group relative overflow-hidden rounded-xl bg-gradient-to-br p-3"
              :class="[dividendRateTheme.card, dividendRateTheme.ring]"
            >
              <view class="metric-label text-xs font-medium tracking-wider uppercase" :class="dividendRateTheme.label">
                食息率
              </view>
              <text class="metric-value mt-1 text-lg font-bold tracking-tight" :class="dividendRateTheme.value">
                {{ formattedDividendRate }}
              </text>
              <view class="absolute h-12 w-12 rounded-full blur-xl -right-2 -top-2" :class="dividendRateTheme.blur" />
            </view>

            <view
              v-if="hasManagementCompany"
              class="metric-card group relative overflow-hidden rounded-xl from-slate-50 to-slate-100/30 bg-gradient-to-br p-3 ring-slate-200/50"
            >
              <view class="metric-label text-xs text-slate-400 font-medium tracking-wider uppercase">
                管理公司
              </view>
              <text class="metric-value mt-1 block truncate text-sm text-slate-700 font-medium leading-tight">
                {{ assetDetail?.management_company ?? '--' }}
              </text>
            </view>

            <view
              v-if="hasEstablishmentDate"
              class="metric-card group relative overflow-hidden rounded-xl from-slate-50 to-slate-100/30 bg-gradient-to-br p-3 ring-slate-200/50"
            >
              <view class="metric-label text-xs text-slate-400 font-medium tracking-wider uppercase">
                成立日期
              </view>
              <text class="metric-value mt-1 text-sm text-slate-700 font-medium">
                {{ assetDetail?.establishment_date ?? '--' }}
              </text>
            </view>

            <view
              v-if="hasMonthlyDividendInvestment"
              class="metric-card group relative overflow-hidden rounded-xl from-blue-50 to-blue-100/30 bg-gradient-to-br p-3 ring-blue-200/50"
            >
              <view class="metric-label text-xs text-blue-600/70 font-medium tracking-wider uppercase">
                月分红投入
              </view>
              <text class="metric-value mt-1 text-sm text-blue-700 font-semibold">
                {{ assetDetail?.monthly_dividend_investment != null ? formatAssets(assetDetail.monthly_dividend_investment) : '--' }}
              </text>
            </view>
          </view>

          <!-- 资产描述 -->
          <view v-if="assetDetail?.description" class="description-section border-t border-slate-100/80 from-slate-50/50 to-slate-100/30 bg-gradient-to-br px-5 py-4">
            <view class="relative rounded-xl bg-white/60 p-4 ring-slate-200/50 backdrop-blur-sm">
              <view class="absolute left-4 top-4 h-4 w-0.5 rounded-full from-blue-400 to-blue-500 bg-gradient-to-b" />
              <text class="description-text pl-3 text-sm text-slate-600 font-medium leading-relaxed">
                {{ assetDetail?.description }}
              </text>
            </view>
          </view>
        </view>

        <!-- 股息率走势 -->
        <view class="chart-card overflow-hidden rounded-2xl bg-white shadow-slate-200/50 shadow-sm ring-slate-900/5">
          <view class="chart-header flex items-center justify-between border-b border-slate-100/80 px-5 py-4">
            <view class="flex items-center gap-2">
              <text class="text-lg text-slate-800 font-bold tracking-tight">
                食息率走势
              </text>
            </view>
          </view>
          <!-- 时间范围选择器 -->
          <view class="px-4">
            <SegmentedControl
              v-model="currentTimeRange"
              :options="TIME_RANGE_OPTIONS.map(o => ({ label: o.label, value: o.value }))"
              @change="refreshData"
            />
          </view>

          <!-- 图表容器 -->
          <view class="chart-container relative px-2 pb-4 pt-2">
            <view class="chart-wrapper h-72">
              <LineChart :option="chartOption" custom-class="h-full w-full" />
            </view>
          </view>
        </view>
      </view>
    </transition>
  </view>
</template>

<style lang="scss" scoped>
// 进入动画
.fade-enter-active {
  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 脉冲加载动画
@keyframes pulse-soft {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-soft {
  animation: pulse-soft 1.5s ease-in-out infinite;
}

// 指标卡片悬停效果
.metric-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-card:active {
  transform: scale(0.98);
  opacity: 0.9;
}
</style>
