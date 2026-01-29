<script setup lang="ts">
/**
 * ETF 详情页
 * 展示 ETF 的行情和估值数据
 */
import type { EChartsOption } from 'echarts'
import type { TabValue } from './data'
import type {
  EChartsTooltipParams,
  EtfDetailData,
  QuotationDataPoint,
  RealtimeLineItem,
  ValuationTrendPoint,
} from './types'
import {
  etfInfo,
  factorExposure,
  realtime,
  realtimeLine,
  showQuote,
  valuationShow,
} from '@/api/modules/etf'
import {
  calculatePreviousDates,
  formatAssets,
  formatPercentage,
  formatRiseFall,
} from '@/utils/format'
import { REALTIME_POLLING_INTERVAL, TOOLTIP_AUTO_HIDE_DELAY } from './constants'
import { segmentedList, tabs } from './data'
import { isValuationDetailData } from './types'

definePage({
  name: 'etf-detail',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF详情',
  },
})

const route = useRoute()

// ==================== 路由参数 ====================
const query = computed(() => route.query as {
  code?: string
  name?: string
  djId?: string
  date?: string
})

// ==================== 状态 ====================
const tabValue = ref<TabValue>('quotation')
const collapseValue = ref<string[]>([])
const showChartTip = ref(false)
const handleData = ref<EChartsTooltipParams | null>(null)

// 分段选择器值
const segmentedValue = ref<Record<'quotation' | 'valuation', string>>({
  quotation: '1年',
  valuation: '1年',
})

// 当前日期
const currentDate = ref('')

// 定时器
let timer: ReturnType<typeof setInterval> | null = null
let tooltipTimer: ReturnType<typeof setTimeout> | null = null

// ==================== API 请求 (useRequest) ====================
// 显示报价配置
const { data: configData, send: fetchShowQuote } = useRequest(showQuote(), {
  immediate: false,
})

// ETF 信息
const etfCode = ref('')
const { data: etfInfoData, send: fetchEtfInfo } = useRequest(
  () => etfInfo(etfCode.value),
  { immediate: false },
)

// 历史行情数据
const factorParams = ref<{ securityCode: string, factorCodes: string[], from: string, to: string } | null>(null)
const { data: factorData, send: fetchFactorExposure } = useRequest(
  () => factorExposure(factorParams.value!),
  { immediate: false },
)

// 实时分钟行情
const realtimeCode = ref('')
const { data: realtimeLineData, send: fetchRealtimeLineData } = useRequest(
  () => realtimeLine(realtimeCode.value),
  { immediate: false },
)

// 实时数据
const realtimeParams = ref<{ securityCodes: string[], assetType: string } | null>(null)
const { data: realtimeData, send: fetchRealtimeData } = useRequest(
  () => realtime(realtimeParams.value!),
  { immediate: false },
)

// 估值数据
const valuationId = ref<string | number>('')
const { data: valuationData, send: fetchValuationShow } = useRequest(
  () => valuationShow(valuationId.value),
  { immediate: false },
)

// ==================== 计算属性 ====================
// 配置显示状态
const configShow = computed(() => {
  return !!(configData.value as any)?.data
})

// 动态分段列表
const dynamicSegmentedList = computed(() => {
  if (configShow.value) {
    return segmentedList as unknown as Record<TabValue, Array<{ label: string, value: string, key: string }>>
  }
  return {
    quotation: segmentedList.quotation.filter(item => item.key !== 'day'),
    valuation: segmentedList.valuation,
  } as unknown as Record<TabValue, Array<{ label: string, value: string, key: string }>>
})

// 处理后的历史行情数据
const processedFactorData = computed(() => {
  if (!factorData.value?.dates)
    return []

  const newData = factorData.value.dates?.map((item: string, index: number) => {
    const data: Record<string, number> = {}
    factorData.value.factorExposures?.forEach((it: { factorCode: string, values: number[] }) => {
      data[it.factorCode] = it.values[index]
    })
    return {
      name: item,
      value: [item, data?.f_mkt_close_price_adj],
      ...data,
    }
  })

  return newData
})

// 处理后的实时分钟行情数据
const processedRealtimeLineData = computed(() => {
  if (!realtimeLineData.value || !realtimeData.value)
    return []

  const res = realtimeLineData.value as RealtimeLineItem[]
  const real = realtimeData.value as Array<{ preClosePrice?: number }>

  if (!Array.isArray(res))
    return []

  const result = res?.map((item: RealtimeLineItem) => {
    return {
      name: item.timestamp?.split(' ')?.[1],
      date: item.timestamp?.split(' ')?.[0],
      value: [item.timestamp?.split(' ')?.[1], item.currentPrice],
      riseFall: item?.currentPrice / real?.[0]?.preClosePrice - 1,
      tradeAmountIntraDay: item?.tradeAmountIntraDay,
      currentPrice: item.currentPrice,
    }
  }) ?? []
  return result
})

// 当前数据（合并所有数据源）
const currentData = computed(() => {
  const base: EtfDetailData & {
    dayData: typeof processedRealtimeLineData.value
    quotationData: typeof processedFactorData.value
    f_mkt_amount?: number
    f_mkt_close_price?: number
  } = {
    code: etfCode.value,
    name: '',
    currentPrice: 0,
    premiumRate: realtimeData.value?.[0]?.premiumRate || 0,
    fundNetAssets: 0,
    tradeAmountIntraDay: 0,
    riseFall: 0,
    yearRiseFall: 0,
    date: currentDate.value,
    dayData: processedRealtimeLineData.value,
    quotationData: processedFactorData.value,
    f_mkt_amount: processedFactorData.value?.[processedFactorData.value?.length - 1]?.f_mkt_amount,
    f_mkt_close_price: processedFactorData.value?.[processedFactorData.value?.length - 1]?.f_mkt_close_price_adj,
  }

  if (etfInfoData.value?.data) {
    Object.assign(base, etfInfoData.value.data)
  }

  if (processedRealtimeLineData.value.length > 0) {
    const lastData = processedRealtimeLineData.value[processedRealtimeLineData.value.length - 1]
    base.currentPrice = lastData.currentPrice
    base.riseFall = lastData.riseFall
    base.tradeAmountIntraDay = lastData.tradeAmountIntraDay
  }

  return base
})

// 当前估值数据
const currentValuationData = computed(() => {
  const data = valuationData.value
  // API 可能直接返回数组，或者返回 {result_code: 0, data: {...}} 格式
  if (Array.isArray(data)) {
    // API 直接返回数组，取第一个元素作为估值数据
    return data?.[0] ?? {}
  }
  if (isValuationDetailData(data) && data.result_code === 0) {
    return data?.data ?? {}
  }
  return {}
})

// ==================== 辅助函数 ====================
/**
 * 根据价格涨跌返回对应颜色类名
 */
function getPriceColorClass(value: number | undefined | null) {
  if (value === undefined || value === null || value === 0)
    return 'text-gray-600'
  return value > 0 ? 'text-red-500' : 'text-green-500'
}

// ==================== 图表配置 ====================
const quotationOption = ref<EChartsOption>({
  color: ['#FCCA01'],
  grid: { bottom: '10%', right: '5%' },
  legend: { show: false },
  tooltip: {
    trigger: 'axis',
    axisPointer: { animation: false },
    formatter: (params: EchartsTooltipParams) => {
      handleData.value = params
      showChartTip.value = true
      if (tooltipTimer)
        clearTimeout(tooltipTimer)
      tooltipTimer = setTimeout(() => {
        showChartTip.value = false
      }, TOOLTIP_AUTO_HIDE_DELAY)
      return ''
    },
  },
  xAxis: [{
    type: 'category',
    splitLine: { show: false },
    boundaryGap: ['0%', '0%'],
    axisLabel: {
      formatter: (v: string) => {
        if (segmentedValue.value.quotation === '日内') {
          const parts = v.split(':')
          return `${parts[0]}:${parts[1]}`
        }
        else {
          const parts = v?.split('-')
          return `${parts[0]}-${parts[1]}`
        }
      },
    },
  }],
  yAxis: [{
    type: 'value',
    name: '当前价格',
    min: 'dataMin',
    splitLine: { show: false },
  }],
  series: [{
    name: '当前价格',
    type: 'line',
    showSymbol: false,
    smooth: true,
    data: [],
    lineStyle: { width: 1 },
  }],
})

const valuationOption = ref<EChartsOption>({
  grid: { bottom: '15%' },
  color: ['#4095E5', '#FCCA01'],
  legend: { bottom: '5', icon: 'rect', show: true },
  tooltip: {
    trigger: 'axis',
    formatter: (params: EchartsTooltipParams) => {
      handleData.value = params
      showChartTip.value = true
      if (tooltipTimer)
        clearTimeout(tooltipTimer)
      tooltipTimer = setTimeout(() => {
        showChartTip.value = false
      }, TOOLTIP_AUTO_HIDE_DELAY)
      return ''
    },
  },
  xAxis: [{
    type: 'time',
    splitLine: { show: false },
    boundaryGap: ['0%', '0%'],
    splitNumber: 5,
    min: 'dataMin',
    axisLabel: {
      formatter: { year: '{yyyy}', month: '{yyyy}-{MM}' },
    },
  }],
  yAxis: [
    {
      type: 'value',
      position: 'left',
      name: '市盈率',
      min: 'dataMin',
      splitLine: { show: false },
    },
    {
      type: 'value',
      name: '市净率',
      position: 'right',
      min: 'dataMin',
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '市盈率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: [],
      lineStyle: { width: 1 },
    },
    {
      name: '市净率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: [],
      lineStyle: { width: 1 },
    },
  ],
})

// ==================== 图表更新 ====================
function computesQuotationOption() {
  const key = segmentedValue.value.quotation
  const newData = currentData.value.quotationData

  // 数据校验：如果是日内，需要 dayData；否则需要 quotationData
  if (key === '日内') {
    if (!currentData.value.dayData || currentData.value.dayData.length === 0)
      return
  }
  else {
    if (!newData || newData.length === 0)
      return
  }

  if (key === '日内') {
    quotationOption.value.series = [{
      name: '当前价格',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: currentData.value.dayData,
      lineStyle: { width: 1 },
    }]
    quotationOption.value.yAxis = [{
      type: 'value',
      name: '当前价格',
      min: 'dataMin',
      splitLine: { show: false },
    }]
    quotationOption.value.xAxis = [{
      type: 'category',
      splitLine: { show: false },
      boundaryGap: ['0%', '0%'],
      axisLabel: {
        formatter: (v: string) => {
          const parts = v.split(':')
          return `${parts[0]}:${parts[1]}`
        },
      },
      data: currentData.value.dayData?.map((item: QuotationDataPoint) => item?.name),
    }]
  }
  else if (key === '全部') {
    const riseFallData = formatRiseFall(newData)
    quotationOption.value.series = [{
      name: '后复权价',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: riseFallData,
      lineStyle: { width: 1 },
    }]
    quotationOption.value.yAxis = [{
      type: 'value',
      name: '后复权价',
      min: 'dataMin',
      splitLine: { show: false },
    }]
    quotationOption.value.xAxis = [{
      type: 'category',
      splitLine: { show: false },
      boundaryGap: ['0%', '0%'],
      axisLabel: {
        formatter: (v: string) => {
          const parts = v?.split('-')
          return `${parts[0]}-${parts[1]}`
        },
      },
      data: riseFallData?.map((item: QuotationDataPoint) => item?.name),
    }]
  }
  else {
    const i = segmentedList.quotation.find(item => item.value === key)?.key
    const date = calculatePreviousDates(currentData.value.date)[i as keyof ReturnType<typeof calculatePreviousDates>]
    const index = newData?.findIndex((item: QuotationDataPoint) => item.name > date)

    if (index !== -1) {
      const riseFallData = formatRiseFall(newData.slice(index))
      quotationOption.value.series = [{
        name: '后复权价',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: riseFallData,
        lineStyle: { width: 1 },
      }]
      quotationOption.value.yAxis = [{
        type: 'value',
        name: '后复权价',
        min: 'dataMin',
        splitLine: { show: false },
      }]
      quotationOption.value.xAxis = [{
        type: 'category',
        splitLine: { show: false },
        boundaryGap: ['0%', '0%'],
        axisLabel: {
          formatter: (v: string) => {
            const parts = v?.split('-')
            return `${parts[0]}-${parts[1]}`
          },
        },
        data: riseFallData?.map((item: QuotationDataPoint) => item?.name),
      }]
    }
  }

  quotationOption.value = { ...quotationOption.value }
}

function computesValuationOption() {
  const key = segmentedValue.value.valuation

  const pbTrends = currentValuationData.value?.pb_trends?.map((item: { time: string, pb: number }) => ({
    ...item,
    name: item.time,
    value: [item.time, item.pb],
  }))

  const peTrends = currentValuationData.value?.pe_trends?.map((item: { time: string, pe: number }) => ({
    ...item,
    name: item.time,
    value: [item.time, item.pe],
  }))

  // 数据校验
  if (!pbTrends || pbTrends.length === 0 || !peTrends || peTrends.length === 0)
    return

  if (key === '全部') {
    valuationOption.value.series = [
      {
        name: '市盈率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: peTrends,
        lineStyle: { width: 1 },
      },
      {
        name: '市净率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: pbTrends,
        lineStyle: { width: 1 },
      },
    ]
  }
  else {
    const i = segmentedList.valuation.find(item => item.value === key)?.key
    const date = calculatePreviousDates(currentData.value.date)[i as keyof ReturnType<typeof calculatePreviousDates>]

    const peIndex = peTrends?.findIndex((item: ValuationTrendPoint) => item.name > date)
    const pbIndex = pbTrends?.findIndex((item: ValuationTrendPoint) => item.name > date)

    const newPbTrends = formatRiseFall(pbTrends?.slice(pbIndex))
    const newPeTrends = formatRiseFall(peTrends?.slice(peIndex))

    valuationOption.value.series = [
      {
        name: '市盈率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: newPeTrends,
        lineStyle: { width: 1 },
      },
      {
        name: '市净率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: newPbTrends,
        lineStyle: { width: 1 },
      },
    ]
  }

  valuationOption.value = { ...valuationOption.value }
}

// ==================== 事件处理 ====================
function handleTabsChange({ name }: { name: TabValue }) {
  showChartTip.value = false

  if (name === 'quotation') {
    // 先清除已存在的定时器
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    // 创建新的定时器
    timer = setInterval(() => {
      fetchRealtimeLineData()
      realtimeParams.value = {
        securityCodes: [currentData.value.code],
        assetType: 'ETF',
      }
      fetchRealtimeData()
    }, REALTIME_POLLING_INTERVAL)
    computesQuotationOption()
  }
  else {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    computesValuationOption()
  }
}

function handleQuotationSegmentedClick() {
  computesQuotationOption()
}

function handleValuationSegmentedClick() {
  computesValuationOption()
}

// ==================== 数据加载函数 ====================
function loadEtfData(code: string) {
  etfCode.value = code
  fetchEtfInfo()
}

function loadFactorData(code: string) {
  factorParams.value = {
    securityCode: code,
    factorCodes: [
      'f_mkt_close_price',
      'f_mkt_close_price_adj',
      'f_mkt_day_yield',
      'f_mkt_amount',
    ],
    from: '2000-01-01',
    to: currentDate.value,
  }
  fetchFactorExposure()
}

function loadRealtimeData(code: string) {
  realtimeCode.value = code
  fetchRealtimeLineData()
  realtimeParams.value = {
    securityCodes: [code],
    assetType: 'ETF',
  }
  fetchRealtimeData()
}

// ==================== 生命周期 ====================
onMounted(() => {
  if (query.value.name) {
    uni.setNavigationBarTitle({
      title: decodeURIComponent(query.value.name),
    })
  }

  const { code, djId, date } = query.value
  if (code) {
    currentDate.value = date || new Date().toISOString().split('T')[0]

    fetchShowQuote()
    loadEtfData(code)
    loadFactorData(code)
    loadRealtimeData(code)

    if (djId) {
      valuationId.value = djId
      fetchValuationShow()
    }
  }
})

// 监听数据变化，更新图表
watch([processedFactorData, processedRealtimeLineData, currentValuationData], ([factor, realtime, valuation]) => {
  if (tabValue.value === 'quotation') {
    // 检查数据是否就绪
    const key = segmentedValue.value.quotation
    const hasDayData = realtime && realtime.length > 0
    const hasHistoryData = factor && factor.length > 0

    if (key === '日内' && !hasDayData)
      return
    if (key !== '日内' && !hasHistoryData)
      return

    computesQuotationOption()
  }
  else {
    // 估值数据校验
    if (!valuation || Object.keys(valuation).length === 0)
      return
    computesValuationOption()
  }
}, { deep: true })

onShow(() => {
  // 先清除已存在的定时器，防止重复创建
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (currentData.value.code) {
    timer = setInterval(() => {
      loadRealtimeData(currentData.value.code)
    }, REALTIME_POLLING_INTERVAL)
  }
})

onHide(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

onUnload(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (tooltipTimer) {
    clearTimeout(tooltipTimer)
    tooltipTimer = null
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-[env(safe-area-inset-bottom)]">
    <!-- Sticky Tabs -->
    <wd-sticky :z-index="99">
      <wd-tabs v-model="tabValue" sticky @click="handleTabsChange">
        <block v-for="item in tabs" :key="item.name">
          <wd-tab :title="item.label" :name="item.name" />
        </block>
      </wd-tabs>
    </wd-sticky>

    <!-- 内容区域 -->
    <view class="p-2 space-y-3">
      <!-- 详情卡片 -->
      <wd-collapse v-model="collapseValue">
        <wd-collapse-item title="投资说明" name="detail">
          <text class="text-sm text-gray-600 leading-relaxed">
            {{ currentData.investIdea || '暂无说明' }}
          </text>
        </wd-collapse-item>
      </wd-collapse>
    </view>

    <!-- 关键指标卡片 -->
    <view class="rounded-2xl bg-white p-5 shadow-sm">
      <view class="mb-4">
        <text class="text-sm text-gray-800 font-semibold">
          关键指标
        </text>
      </view>
      <view class="grid grid-cols-3 gap-4">
        <!-- 行情数据 -->
        <view v-if="tabValue === 'quotation'" class="space-y-2">
          <view v-if="segmentedValue.quotation === '日内' && configShow" class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              当前价格
            </text>
            <text class="text-xl font-bold" :class="getPriceColorClass(currentData.riseFall)">
              {{ currentData.currentPrice || '--' }}
            </text>
          </view>
          <view v-else class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              后复权收盘价
            </text>
            <text class="text-xl font-bold">
              {{ currentData.quotationData?.[currentData.quotationData?.length - 1]?.f_mkt_close_price_adj || '--' }}
            </text>
          </view>
          <view class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              折溢价率
            </text>
            <text class="text-base font-semibold" :class="getPriceColorClass(currentData.premiumRate)">
              {{ formatPercentage(currentData.premiumRate) }}
            </text>
          </view>
        </view>

        <!-- 估值数据 -->
        <view v-else class="space-y-2">
          <view class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              市盈率 (PE)
            </text>
            <text class="text-xl text-blue-600 font-bold">
              {{ currentValuationData.pe || '--' }}
            </text>
          </view>
          <view class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              市净率 (PB)
            </text>
            <text class="text-xl text-orange-600 font-bold">
              {{ currentValuationData.pb || '--' }}
            </text>
          </view>
          <view class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              股息率
            </text>
            <text class="text-base text-green-600 font-semibold">
              {{ formatPercentage(currentValuationData.dividend_yield) }}
            </text>
          </view>
        </view>

        <!-- 通用数据 -->
        <view class="space-y-2">
          <view class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              净资产(亿)
            </text>
            <text class="text-lg text-gray-800 font-semibold">
              {{ currentData.fundNetAssets ? formatAssets(currentData.fundNetAssets) : '--' }}
            </text>
          </view>
          <view v-if="segmentedValue.quotation !== '日内'" class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              年涨跌幅
            </text>
            <text class="text-base font-semibold" :class="getPriceColorClass(currentData.yearRiseFall)">
              {{ formatPercentage(currentData.yearRiseFall) }}
            </text>
          </view>
        </view>
        <view class="space-y-2">
          <view class="text-center">
            <text class="mb-1 block text-xs text-gray-500">
              数据日期
            </text>
            <text class="text-sm text-gray-700">
              {{ currentData.date || '--' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分段选择器 -->
    <view class="p-2">
      <wd-segmented
        v-if="tabValue === 'quotation'"
        v-model:value="segmentedValue.quotation"
        :options="dynamicSegmentedList.quotation"
        :disabled="!currentData.quotationData"
        @click="handleQuotationSegmentedClick"
      />
      <wd-segmented
        v-else
        v-model:value="segmentedValue.valuation"
        :options="dynamicSegmentedList.valuation"
        :disabled="!currentValuationData"
        @click="handleValuationSegmentedClick"
      />
    </view>

    <!-- 图表 -->
    <view class="h-80 bg-white p-2">
      <uni-echarts v-if="tabValue === 'quotation'" custom-class="h-300px" :option="quotationOption" />
      <uni-echarts v-else custom-class="h-300px" :option="valuationOption" />
    </view>

    <!-- 图表 Tooltip -->
    <view v-if="showChartTip" class="bg-white p-5 text-sm text-gray-800">
      <view class="mb-2 font-bold">
        {{ handleData?.name || handleData?.[0]?.name || '' }}
      </view>
      <!-- 行情 tooltip -->
      <view v-if="tabValue === 'quotation'">
        <view class="mb-2 flex gap-5">
          <text>{{ segmentedValue.quotation === '日内' ? '历史价格' : '后复权价' }}</text>
          <text :style="{ color: '#FCCA01' }">
            {{ segmentedValue.quotation === '日内' ? handleData?.currentPrice : handleData?.f_mkt_close_price_adj }}
          </text>
        </view>
        <view class="mb-2 flex gap-5">
          <text>涨跌幅</text>
          <text :style="{ color: '#FCCA01' }">
            {{ formatPercentage(handleData?.riseFall) }}
          </text>
        </view>
        <view class="mb-2 flex gap-5">
          <text>成交额</text>
          <text :style="{ color: '#FCCA01' }">
            {{ segmentedValue.quotation === '日内' ? formatAssets(handleData?.tradeAmountIntraDay) : formatAssets(handleData?.f_mkt_amount) }}
          </text>
        </view>
      </view>
      <!-- 估值 tooltip -->
      <view v-if="tabValue === 'valuation'">
        <view class="mb-2 flex gap-5">
          <text>PE</text>
          <text :style="{ color: '#4095E5' }">
            {{ handleData?.[0]?.data?.pe || '--' }}
          </text>
        </view>
        <view class="mb-2 flex gap-5">
          <text>PB</text>
          <text :style="{ color: '#FCCA01' }">
            {{ handleData?.[1]?.data?.pb || '--' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
