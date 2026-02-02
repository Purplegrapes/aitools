<script setup lang="ts">
/**
 * 资产详情页
 * 显示资产基本信息和股息率走势图
 */
import type { EChartsOption } from 'echarts'
import type { ChartDataPoint, TimeRange, YuEBaoPoint } from './types'
import { getAssetDetail, getFactorHistory } from '@/api/modules/asset'
import LineChart from '@/subEcharts/echarts/components/LineChart.vue'
import { formatAssets, formatDecimalToPercent } from '@/utils/format'

defineOptions({
  componentPlaceholder: {
    LineChart: 'view',
  },
})

definePage({
  name: 'asset-detail',
  layout: 'default',
  style: {
    navigationBarTitleText: '资产详情',
    navigationBarBackgroundColor: '#f8fafc',
    navigationBarTextStyle: 'black',
  },
})

const route = useRoute()

// ==================== 路由参数 ====================
const query = computed(() => route.query as {
  code?: string
  name?: string
})

// ==================== 状态 ====================
const currentTimeRange = ref<TimeRange>('1m')
const loading = ref(true)

// ==================== 时间范围配置 ====================
const timeRangeOptions: Array<{ value: TimeRange, label: string, days: number }> = [
  { value: '1w', label: '近一周', days: 7 },
  { value: '1m', label: '近一月', days: 30 },
  { value: '1q', label: '近一季度', days: 90 },
]

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

// 因子历史参数
const factorParams = ref<{
  start_date: string
  end_date: string
  codes: string
  factors: string
} | null>(null)

// 因子历史数据
const { data: factorHistoryData, send: fetchFactorHistory } = useRequest(
  () => getFactorHistory(factorParams.value!),
  { immediate: false },
)

// ==================== 计算属性 ====================
// 当前日期
const currentDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// 股息率历史数据
const dividendHistory = computed(() => {
  const data = factorHistoryData.value as any
  if (!data?.data?.[0]?.factors) {
    return []
  }
  return data.data[0].factors
})

// 余额宝对比数据（Mock）- 与 dividendHistory 的每个日期点匹配
const yuEBaoHistory = computed<YuEBaoPoint[]>(() => {
  if (dividendHistory.value.length === 0) {
    return []
  }

  // 余额宝7日年化大约在 1.5% - 2.5% 之间波动（使用小数格式：0.015 - 0.025）
  let baseRate = 0.02

  // 直接基于 dividendHistory 的每个日期点生成对应数据
  return dividendHistory.value.map((item: any) => {
    // 模拟随机波动
    baseRate += (Math.random() - 0.5) * 0.001
    baseRate = Math.max(0.015, Math.min(0.025, baseRate))

    return {
      date: item.date,
      rate: Number.parseFloat(baseRate.toFixed(6)),
    }
  })
})

// 处理后的图表数据
const chartData = computed<ChartDataPoint[]>(() => {
  return dividendHistory.value.map((item: any) => {
    const rate = Number.parseFloat((item.dividend_rate * 100).toFixed(2)) // 转换为百分比数值，保留两位小数
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
    data: ['股息率', '余额宝'],
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
    name: '股息率 (%)',
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
      name: '股息率',
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

  const option = timeRangeOptions.find(o => o.value === currentTimeRange.value)
  if (option) {
    loadFactorHistory(assetCode.value, option.days)
  }
}

// ==================== 事件处理 ====================
/**
 * 处理时间范围变化
 */
function handleTimeRangeChange(value: TimeRange) {
  currentTimeRange.value = value
  refreshData()
}

// ==================== 生命周期 ====================
onMounted(() => {
  const { code, name } = query.value

  if (!code) {
    uni.showToast({
      title: '缺少资产代码',
      icon: 'none',
    })
    return
  }

  if (name) {
    uni.setNavigationBarTitle({
      title: decodeURIComponent(name),
    })
  }

  loading.value = true

  // 加载资产详情
  loadAssetDetail(code)

  // 加载股息率历史数据
  const option = timeRangeOptions.find(o => o.value === currentTimeRange.value)
  if (option) {
    loadFactorHistory(code, option.days)
  }

  loading.value = false
})

// 监听数据变化
watch([assetDetail, dividendHistory], () => {
  loading.value = false
})
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
        <view class="asset-card overflow-hidden rounded-2xl bg-white shadow-slate-200/50 shadow-sm ring-1 ring-slate-900/5">
          <view class="card-header border-b border-slate-100/80 px-5 py-4">
            <view class="flex items-start justify-between">
              <view class="flex-1">
                <text class="asset-name text-xl text-slate-800 font-bold tracking-tight">
                  {{ assetDetail?.name ?? '--' }}
                </text>
                <view class="mt-2.5 flex flex-wrap items-center gap-2">
                  <view class="tag-base rounded-lg from-blue-50 to-blue-100/50 bg-gradient-to-br px-2.5 py-1 shadow-blue-100/50 shadow-sm">
                    <text class="text-xs text-blue-600 font-semibold">
                      {{ assetDetail?.asset_type ?? '--' }}
                    </text>
                  </view>
                  <view class="tag-base rounded-lg from-amber-50 to-amber-100/50 bg-gradient-to-br px-2.5 py-1 shadow-amber-100/50 shadow-sm">
                    <text class="text-xs text-amber-600 font-semibold">
                      {{ assetDetail?.risk_level ?? '--' }}
                    </text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 关键指标 -->
          <view class="metrics-grid grid grid-cols-2 gap-3 px-5 py-4">
            <view class="metric-card group relative overflow-hidden rounded-xl from-slate-50 to-slate-100/30 bg-gradient-to-br p-3 ring-1 ring-slate-200/50">
              <view class="metric-label text-xs text-slate-400 font-medium tracking-wider uppercase">
                单位净值
              </view>
              <text class="metric-value mt-1 text-lg text-slate-800 font-bold tracking-tight">
                {{ assetDetail?.fund_nav_unit ?? '--' }}
              </text>
            </view>

            <view class="metric-card group relative overflow-hidden rounded-xl from-emerald-50 to-emerald-100/30 bg-gradient-to-br p-3 ring-1 ring-emerald-200/50">
              <view class="metric-label text-xs text-emerald-600/70 font-medium tracking-wider uppercase">
                股息率
              </view>
              <text class="metric-value mt-1 text-lg text-emerald-600 font-bold tracking-tight">
                {{ formattedDividendRate }}
              </text>
              <view class="absolute h-12 w-12 rounded-full bg-emerald-500/5 blur-xl -right-2 -top-2" />
            </view>

            <view class="metric-card group relative overflow-hidden rounded-xl from-slate-50 to-slate-100/30 bg-gradient-to-br p-3 ring-1 ring-slate-200/50">
              <view class="metric-label text-xs text-slate-400 font-medium tracking-wider uppercase">
                管理公司
              </view>
              <text class="metric-value mt-1 block text-sm text-slate-700 font-medium leading-tight">
                {{ assetDetail?.management_company ?? '--' }}
              </text>
            </view>

            <view class="metric-card group relative overflow-hidden rounded-xl from-slate-50 to-slate-100/30 bg-gradient-to-br p-3 ring-1 ring-slate-200/50">
              <view class="metric-label text-xs text-slate-400 font-medium tracking-wider uppercase">
                基金经理
              </view>
              <text class="metric-value mt-1 text-sm text-slate-700 font-medium">
                {{ assetDetail?.fund_manager ?? '--' }}
              </text>
            </view>

            <view class="metric-card group relative overflow-hidden rounded-xl from-slate-50 to-slate-100/30 bg-gradient-to-br p-3 ring-1 ring-slate-200/50">
              <view class="metric-label text-xs text-slate-400 font-medium tracking-wider uppercase">
                成立日期
              </view>
              <text class="metric-value mt-1 text-sm text-slate-700 font-medium">
                {{ assetDetail?.establishment_date ?? '--' }}
              </text>
            </view>

            <view class="metric-card group relative overflow-hidden rounded-xl from-blue-50 to-blue-100/30 bg-gradient-to-br p-3 ring-1 ring-blue-200/50">
              <view class="metric-label text-xs text-blue-600/70 font-medium tracking-wider uppercase">
                月分红投入
              </view>
              <text class="metric-value mt-1 text-sm text-blue-700 font-semibold">
                {{ assetDetail?.monthly_dividend_investment != null ? formatAssets((assetDetail as any).monthly_dividend_investment) : '--' }}
              </text>
            </view>
          </view>

          <!-- 资产描述 -->
          <view v-if="assetDetail?.description" class="description-section border-t border-slate-100/80 from-slate-50/50 to-slate-100/30 bg-gradient-to-br px-5 py-4">
            <view class="relative rounded-xl bg-white/60 p-4 ring-1 ring-slate-200/50 backdrop-blur-sm">
              <view class="absolute left-4 top-4 h-4 w-0.5 rounded-full from-blue-400 to-blue-500 bg-gradient-to-b" />
              <text class="description-text pl-3 text-sm text-slate-600 font-medium leading-relaxed">
                {{ (assetDetail as any).description }}
              </text>
            </view>
          </view>
        </view>

        <!-- 股息率走势 -->
        <view class="chart-card overflow-hidden rounded-2xl bg-white shadow-slate-200/50 shadow-sm ring-1 ring-slate-900/5">
          <view class="chart-header flex items-center justify-between border-b border-slate-100/80 px-5 py-4">
            <view class="flex items-center gap-2">
              <text class="text-lg text-slate-800 font-bold tracking-tight">
                股息率走势
              </text>
            </view>
          </view>
          <!-- 时间范围选择器 -->
          <view class="time-selector mx-4 flex rounded-xl bg-slate-100/80 p-1 ring-1 ring-slate-200/50 backdrop-blur-sm">
            <view
              v-for="option in timeRangeOptions"
              :key="option.value"
              class="selector-option relative overflow-hidden rounded-lg px-3.5 py-2 transition-all duration-200 ease-out"
              :class="currentTimeRange === option.value ? 'active-option' : 'inactive-option'"
              @tap="handleTimeRangeChange(option.value)"
            >
              <text class="relative z-10 text-xs font-semibold">
                {{ option.label }}
              </text>
              <view v-if="currentTimeRange === option.value" class="active-indicator absolute inset-0 bg-white shadow-sm" />
            </view>
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
