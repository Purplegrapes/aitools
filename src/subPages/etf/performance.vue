<script setup lang="ts">
/**
 * ETF 基金业绩走势页面
 * 专业金融数据可视化界面
 */
import type { EChartsOption } from 'echarts'
import SegmentedControl from '@/components/SegmentedControl.vue'
import LineChart from '@/subEcharts/echarts/components/LineChart.vue'
import { formatPercentage } from '@/utils/format'
import { coreIndicators } from './api'

defineOptions({
  componentPlaceholder: {
    LineChart: 'view',
  },
})

definePage({
  name: 'etf-performance',
  layout: 'default',
  style: {
    navigationBarTitleText: '业绩走势',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTextStyle: 'black',
  },
})

const route = useRoute()

// ==================== 状态 ====================
const activePeriod = ref('1y')
const chartType = ref('return') // 'return' | 'drawdown' | 'volatility'

// 核心指标数据
const { data: indicatorsData } = useRequest(
  () => coreIndicators(route.query.code as string),
  { immediate: true },
)

// 模拟历史数据（实际应从API获取）
const mockHistoryData = ref<Record<string, Array<{ date: string, value: number }>>>({
  return: generateMockReturnData(),
  drawdown: generateMockDrawdownData(),
  volatility: generateMockVolatilityData(),
})

// ==================== 计算属性 ====================
const currentIndicators = computed(() => {
  return indicatorsData.value?.data || null
})

const periodOptions = computed(() => [
  { label: '近1月', value: '1m' },
  { label: '近3月', value: '3m' },
  { label: '近6月', value: '6m' },
  { label: '近1年', value: '1y' },
  { label: '近3年', value: '3y' },
  { label: '年初至今', value: 'ytd' },
] as const)

const chartTypeOptions = computed(() => [
  { label: '收益率', value: 'return', color: '#22c55e' },
  { label: '回撤', value: 'drawdown', color: '#ef4444' },
  { label: '波动率', value: 'volatility', color: '#3b82f6' },
])

// 当前图表数据
const chartData = computed(() => {
  const data = mockHistoryData.value[chartType.value] || []
  const daysMap: Record<string, number> = { '1m': 30, '3m': 90, '6m': 180, '1y': 365, '3y': 1095, 'ytd': Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) }
  const days = daysMap[activePeriod.value] || 365
  return data.slice(-days)
})

// 图表配置
const chartOption = computed<EChartsOption>(() => {
  const type = chartType.value
  const data = chartData.value
  const option = chartTypeOptions.value.find(o => o.value === type)

  const isPositive = data.length > 0 && data[data.length - 1].value >= 0
  const mainColor = type === 'return' ? (isPositive ? '#22c55e' : '#ef4444') : option?.color || '#3b82f6'

  return {
    backgroundColor: 'transparent',
    grid: {
      left: '8%',
      right: '5%',
      top: '10%',
      bottom: '15%',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      textStyle: { color: '#1f2937' },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        const value = p.value
        const label = type === 'return' ? '收益率' : type === 'drawdown' ? '回撤' : '波动率'
        const formatted = type === 'volatility' ? `${(value * 100).toFixed(2)}%` : formatPercentage(value)
        return `<view style="padding: 8px 0;">
          <text style="color: #6b7280; font-size: 12px;">${p.axisValue}</text>
          <view style="margin-top: 4px; color: #1f2937;">${label}: <text style="color: ${mainColor}">${formatted}</text></view>
        </view>`
      },
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        formatter: (v: string) => {
          const date = new Date(v)
          return activePeriod.value === '1y' || activePeriod.value === 'ytd'
            ? `${date.getMonth() + 1}/${date.getDate()}`
            : activePeriod.value === '3y'
              ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              : `${date.getMonth() + 1}/${date.getDate()}`
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
      axisLabel: {
        color: '#6b7280',
        fontSize: 10,
        formatter: (v: number) => {
          if (type === 'volatility')
            return `${(v * 100).toFixed(1)}%`
          return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`
        },
      },
    },
    series: [
      {
        type: 'line',
        data: data.map(d => d.value),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: mainColor,
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: type === 'drawdown'
              ? [
                  { offset: 0, color: hexToRgba(mainColor, 0.25) },
                  { offset: 1, color: hexToRgba(mainColor, 0.05) },
                ]
              : [
                  { offset: 0, color: hexToRgba(mainColor, 0.19) },
                  { offset: 1, color: hexToRgba(mainColor, 0.02) },
                ],
          },
        },
        markPoint: data.length > 0
          ? {
              data: [
                { type: 'max', name: '最大值', itemStyle: { color: mainColor } },
                { type: 'min', name: '最小值', itemStyle: { color: mainColor } },
              ],
              symbolSize: 40,
              label: { color: '#4b5563', fontSize: 10 },
            }
          : undefined,
      },
    ],
  }
})

// 当前收益率显示
const currentReturnValue = computed(() => {
  const data = chartData.value
  if (data.length === 0)
    return null
  const key = activePeriod.value
  const map: Record<string, keyof CoreIndicators> = {
    '1m': 'return1m',
    '3m': 'return3m',
    '6m': 'return6m',
    '1y': 'return1y',
    '3y': 'return3y',
    'ytd': 'returnYtd',
  }
  const indicatorKey = map[key]
  if (!indicatorKey)
    return null
  return currentIndicators.value?.[indicatorKey]
})

// 年度收益数据
const yearlyReturns = computed(() => [
  { year: '2024', value: 15.6, positive: true },
  { year: '2023', value: 18.5, positive: true },
  { year: '2022', value: -12.3, positive: false },
  { year: '2021', value: 22.8, positive: true },
  { year: '2020', value: 28.4, positive: true },
  { year: '2019', value: 35.2, positive: true },
])

// ==================== 辅助函数 ====================
function getValueColor(value: number | undefined | null) {
  if (!value)
    return '#64748b'
  return value > 0 ? '#22c55e' : '#ef4444'
}

// 转换 hex 颜色为 rgba 格式
function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function generateMockReturnData() {
  const data: Array<{ date: string, value: number }> = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 3)
  let value = 0

  for (let i = 0; i < 1095; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      value += (Math.random() - 0.45) * 2
      data.push({
        date: date.toISOString().split('T')[0],
        value: Number(value.toFixed(2)),
      })
    }
  }
  return data
}

function generateMockDrawdownData() {
  const data: Array<{ date: string, value: number }> = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 3)
  let peak = 0
  let current = 100

  for (let i = 0; i < 1095; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      current += (Math.random() - 0.45) * 3
      peak = Math.max(peak, current)
      const drawdown = ((current - peak) / peak) * 100
      data.push({
        date: date.toISOString().split('T')[0],
        value: Number(drawdown.toFixed(2)),
      })
    }
  }
  return data
}

function generateMockVolatilityData() {
  const data: Array<{ date: string, value: number }> = []
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 3)

  for (let i = 0; i < 1095; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      const vol = 0.12 + Math.random() * 0.15
      data.push({
        date: date.toISOString().split('T')[0],
        value: Number(vol.toFixed(3)),
      })
    }
  }
  return data
}

// ==================== 事件处理 ====================
function handlePeriodChange(value: string) {
  activePeriod.value = value
}
</script>

<template>
  <view class="relative min-h-screen overflow-hidden bg-[#F8FAFC]">
    <!-- 背景装饰 - 深色主题 -->
    <view class="pointer-events-none fixed inset-0 z-0">
      <view class="absolute h-300px w-300px rounded-full bg-[#0A4FE5] opacity-20 blur-80px -right-100px -top-100px" />
      <view class="absolute bottom-20% h-250px w-250px rounded-full bg-[#00D4AA] opacity-20 blur-80px -left-80px" />
      <view class="absolute top-1/2 h-200px w-200px rounded-full bg-[#FFD700] opacity-20 blur-80px -right-50px" />
    </view>

    <!-- 主内容区 -->
    <view class="relative z-1 p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
      <!-- 头部概览卡片 -->
      <text class="mb-3 block text-sm text-[#1F2937] font-semibold">
        业绩概览
      </text>
      <view class="mb-3 border border-black/[0.08] rounded-2xl bg-white p-4">
        <view class="mb-5 flex items-center justify-between">
          <view class="flex items-center gap-1 px-4 py-2">
            <text class="text-xs">
              {{ currentReturnValue && currentReturnValue > 0 ? '↑' : currentReturnValue && currentReturnValue < 0 ? '↓' : '–' }}
            </text>
            <text class="text-base font-bold" :style="{ color: getValueColor(currentReturnValue) }">
              {{ formatPercentage(currentReturnValue) }}
            </text>
          </view>
        </view>
        <view class="grid grid-cols-3 gap-3">
          <view class="text-center">
            <text class="mb-2 block text-xs text-[#9AA0A6]">
              夏普比率
            </text>
            <text class="block text-base text-[#1F2937] font-semibold tabular-nums">
              {{ currentIndicators?.sharpeRatio?.toFixed(2) || '--' }}
            </text>
          </view>
          <view class="text-center">
            <text class="mb-2 block text-xs text-[#9AA0A6]">
              最大回撤
            </text>
            <text class="block text-base font-semibold tabular-nums" :style="{ color: getValueColor(currentIndicators?.maxDrawdown) }">
              {{ formatPercentage(currentIndicators?.maxDrawdown) }}
            </text>
          </view>
          <view class="text-center">
            <text class="mb-2 block text-xs text-[#9AA0A6]">
              波动率
            </text>
            <text class="block text-base text-[#1F2937] font-semibold tabular-nums">
              {{ currentIndicators?.volatility ? `${(currentIndicators.volatility * 100).toFixed(2)}%` : '--' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 图表类型选择器 -->
      <view class="mb-3">
        <SegmentedControl
          v-model="chartType"
          :options="chartTypeOptions"
        />
      </view>

      <!-- 图表区域 -->
      <text class="mb-3 block text-sm text-[#1F2937] font-semibold">
        {{ chartTypeOptions.find(o => o.value === chartType)?.label }}走势
      </text>
      <view class="mb-3 border border-black/[0.08] rounded-2xl bg-white p-4">
        <view class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <view class="flex flex-wrap gap-1.5">
            <view
              v-for="period in periodOptions"
              :key="period.value"
              class="cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-all"
              :class="activePeriod === period.value ? 'bg-[#0A4FE5]/20 text-[#0A4FE5] font-semibold' : 'bg-[#253850] text-[#9AA0A6]'"
              @tap="handlePeriodChange(period.value)"
            >
              {{ period.label }}
            </view>
          </view>
        </view>
        <view class="h-70">
          <LineChart :option="chartOption" custom-class="h-full w-full" />
        </view>
      </view>

      <!-- 业绩对比卡片 -->
      <view class="mb-3">
        <text class="mb-3 block text-sm text-[#1F2937] font-semibold">
          业绩对比
        </text>
        <view class="grid grid-cols-3 gap-3">
          <view class="border border-black/[0.08] rounded-2xl bg-white p-4">
            <view class="mb-3 flex flex-col items-center">
              <text class="text-2xl">
                🎯
              </text>
              <text class="text-xs text-[#9AA0A6]">
                相对基准
              </text>
            </view>
            <view class="flex flex-col items-center gap-1">
              <text class="text-lg font-bold tabular-nums" :style="{ color: getValueColor(5.23) }">
                +5.23%
              </text>
              <text class="text-xs text-[#5F6368]">
                近1年
              </text>
            </view>
          </view>
          <view class="border border-black/[0.08] rounded-2xl bg-white p-4">
            <view class="mb-3 flex flex-col items-center gap-2">
              <text class="text-2xl">
                📊
              </text>
              <text class="text-xs text-[#9AA0A6]">
                同类排名
              </text>
            </view>
            <view class="flex flex-col items-center gap-1">
              <text class="text-lg text-[#FFD700] font-bold">
                前15%
              </text>
              <text class="text-xs text-[#5F6368]">
                近1年
              </text>
            </view>
          </view>
          <view class="border border-black/[0.08] rounded-2xl bg-white p-4">
            <view class="mb-3 flex flex-col items-center gap-2">
              <text class="text-2xl">
                ⭐
              </text>
              <text class="text-xs text-[#9AA0A6]">
                晨星评级
              </text>
            </view>
            <view class="flex flex-col items-center gap-1">
              <text class="text-lg text-[#FFD700] font-bold">
                ★★★★☆
              </text>
              <text class="text-xs text-[#5F6368]">
                五年评级
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 年度收益分布 -->
      <text class="mb-4 block text-sm text-[#1F2937] font-semibold">
        年度收益分布
      </text>
      <view class="border border-black/[0.08] rounded-2xl bg-white p-4">
        <view class="flex flex-col gap-4">
          <view v-for="item in yearlyReturns" :key="item.year" class="flex items-center gap-3">
            <text class="w-12 text-sm text-[#9AA0A6] font-medium tabular-nums">
              {{ item.year }}
            </text>
            <view class="h-2 flex-1 overflow-hidden rounded-full bg-[#253850]">
              <view
                class="relative h-full rounded-full transition-all duration-800"
                :class="item.positive ? 'bg-gradient-to-r from-[#00E676] to-[#00C853]' : 'bg-gradient-to-r from-[#FF6B6B] to-[#FF4D4F]'"
                :style="{ width: `${Math.min(Math.abs(item.value), 30)}%` }"
              >
                <view class="animate-shimmer absolute inset-0 from-transparent via-white/40 to-transparent bg-gradient-to-r" />
              </view>
            </view>
            <text class="w-20 text-right text-sm font-semibold tabular-nums" :class="item.positive ? 'text-[#00C853]' : 'text-[#FF4D4F]'">
              {{ item.positive ? '+' : '' }}{{ item.value.toFixed(2) }}%
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
</style>
