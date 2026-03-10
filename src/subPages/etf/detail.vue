<script setup lang="ts">
/**
 * ETF 详情页
 * 专业金融数据可视化界面
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
import SegmentedControl from '@/components/SegmentedControl.vue'
import LineChart from '@/subEcharts/echarts/components/LineChart.vue'
import {
  calculatePreviousDates,
  formatAssets,
  formatPercentage,
  formatRiseFall,
} from '@/utils/format'
import {
  etfInfo,
  factorExposure,
  realtime,
  realtimeLine,
  showQuote,
  valuationShow,
} from './api'
import { REALTIME_POLLING_INTERVAL, TOOLTIP_AUTO_HIDE_DELAY } from './constants'
import { segmentedList, tabs } from './data'
import { isValuationDetailData } from './types'

defineOptions({
  componentPlaceholder: {

    LineChart: 'view',

  },
})

definePage({
  name: 'etf-detail',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF详情',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTextStyle: 'black',
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
const router = useRouter()
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
  const baseList = segmentedList as unknown as Record<TabValue, Array<{ label: string, value: string, key: string }>>
  // 如果配置显示为 false，过滤掉日内选项
  if (!configShow.value) {
    return {
      quotation: baseList.quotation.filter(item => item.key !== 'day'),
      valuation: baseList.valuation,
    }
  }
  return baseList
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
    return 'text-slate-400'
  return value > 0 ? 'text-red-500' : 'text-green-500'
}

/**
 * 获取颜色值
 */
function getValueColor(value: number | undefined | null) {
  if (!value)
    return '#64748b'
  return value > 0 ? '#ef4444' : '#22c55e'
}

/**
 * 转换 hex 颜色为 rgba 格式
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// ==================== 图表配置 ====================
const quotationOption = ref<EChartsOption>({
  backgroundColor: 'transparent',
  grid: { left: '8%', right: '5%', top: '8%', bottom: '12%' },
  legend: { show: false },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textStyle: { color: '#1f2937' },
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
    axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
    axisLabel: {
      color: '#64748b',
      fontSize: 10,
      formatter: (v: string) => {
        if (segmentedValue.value.quotation === '日内') {
          const parts = v.split(':')
          return `${parts[0]}:${parts[1]}`
        }
        else {
          const parts = v?.split('-')
          return `${parts[1]}-${parts[2]}`
        }
      },
    },
  }],
  yAxis: [{
    type: 'value',
    name: '当前价格',
    min: 'dataMin',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
    axisLabel: { color: '#64748b', fontSize: 10 },
    nameTextStyle: { color: '#64748b', fontSize: 10 },
  }],
  series: [{
    name: '当前价格',
    type: 'line',
    showSymbol: false,
    smooth: true,
    data: [],
    lineStyle: { width: 2, color: '#3b82f6' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: hexToRgba('#3b82f6', 0.19) },
          { offset: 1, color: hexToRgba('#3b82f6', 0.02) },
        ],
      },
    },
  }],
})

const valuationOption = ref<EChartsOption>({
  backgroundColor: 'transparent',
  grid: { left: '8%', right: '8%', top: '8%', bottom: '15%' },
  color: ['#3b82f6', '#f59e0b'],
  legend: {
    bottom: '5%',
    icon: 'rect',
    show: true,
    textStyle: { color: '#475569', fontSize: 11 },
    itemWidth: 16,
    itemHeight: 8,
    borderRadius: 4,
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textStyle: { color: '#1f2937' },
    formatter: (params: EChartsTooltipParams) => {
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
    axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
    axisLabel: {
      color: '#64748b',
      fontSize: 10,
      formatter: { year: '{yyyy}', month: '{yyyy}-{MM}' },
    },
  }],
  yAxis: [
    {
      type: 'value',
      position: 'left',
      name: '市盈率',
      min: 'dataMin',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
      nameTextStyle: { color: '#64748b', fontSize: 10 },
    },
    {
      type: 'value',
      name: '市净率',
      position: 'right',
      min: 'dataMin',
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#64748b', fontSize: 10 },
      nameTextStyle: { color: '#64748b', fontSize: 10 },
    },
  ],
  series: [
    {
      name: '市盈率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: [],
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
      name: '市净率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: [],
      lineStyle: { width: 2, color: '#f59e0b' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba('#f59e0b', 0.15) },
            { offset: 1, color: hexToRgba('#f59e0b', 0.02) },
          ],
        },
      },
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

  const mainColor = '#3b82f6'

  if (key === '日内') {
    quotationOption.value.series = [{
      name: '当前价格',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: currentData.value.dayData,
      lineStyle: { width: 2, color: mainColor },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba(mainColor, 0.19) },
            { offset: 1, color: hexToRgba(mainColor, 0.02) },
          ],
        },
      },
    }]
    quotationOption.value.yAxis = [{
      type: 'value',
      name: '当前价格',
      min: 'dataMin',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
      nameTextStyle: { color: '#64748b', fontSize: 10 },
    }]
    quotationOption.value.xAxis = [{
      type: 'category',
      splitLine: { show: false },
      boundaryGap: ['0%', '0%'],
      axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
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
      lineStyle: { width: 2, color: mainColor },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba(mainColor, 0.19) },
            { offset: 1, color: hexToRgba(mainColor, 0.02) },
          ],
        },
      },
    }]
    quotationOption.value.yAxis = [{
      type: 'value',
      name: '后复权价',
      min: 'dataMin',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
      nameTextStyle: { color: '#64748b', fontSize: 10 },
    }]
    quotationOption.value.xAxis = [{
      type: 'category',
      splitLine: { show: false },
      boundaryGap: ['0%', '0%'],
      axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        formatter: (v: string) => {
          const parts = v?.split('-')
          return `${parts[1]}-${parts[2]}`
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
        lineStyle: { width: 2, color: mainColor },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(mainColor, 0.19) },
              { offset: 1, color: hexToRgba(mainColor, 0.02) },
            ],
          },
        },
      }]
      quotationOption.value.yAxis = [{
        type: 'value',
        name: '后复权价',
        min: 'dataMin',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 10 },
        nameTextStyle: { color: '#64748b', fontSize: 10 },
      }]
      quotationOption.value.xAxis = [{
        type: 'category',
        splitLine: { show: false },
        boundaryGap: ['0%', '0%'],
        axisLine: { lineStyle: { color: 'rgba(0, 0, 0, 0.06)' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
          formatter: (v: string) => {
            const parts = v?.split('-')
            return `${parts[1]}-${parts[2]}`
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

  const peColor = '#3b82f6'
  const pbColor = '#f59e0b'

  if (key === '全部') {
    valuationOption.value.series = [
      {
        name: '市盈率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: peTrends,
        lineStyle: { width: 2, color: peColor },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(peColor, 0.15) },
              { offset: 1, color: hexToRgba(peColor, 0.02) },
            ],
          },
        },
      },
      {
        name: '市净率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: pbTrends,
        lineStyle: { width: 2, color: pbColor },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(pbColor, 0.15) },
              { offset: 1, color: hexToRgba(pbColor, 0.02) },
            ],
          },
        },
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
        lineStyle: { width: 2, color: peColor },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(peColor, 0.15) },
              { offset: 1, color: hexToRgba(peColor, 0.02) },
            ],
          },
        },
      },
      {
        name: '市净率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: newPbTrends,
        lineStyle: { width: 2, color: pbColor },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba(pbColor, 0.15) },
              { offset: 1, color: hexToRgba(pbColor, 0.02) },
            ],
          },
        },
      },
    ]
  }

  valuationOption.value = { ...valuationOption.value }
}

// ==================== 事件处理 ====================
function handleTabsChange({ name }: { name: TabValue }) {
  showChartTip.value = false

  // 获取新 tab 的选项列表
  const newOptions = dynamicSegmentedList.value[name]
  if (newOptions && newOptions.length > 0) {
    // 获取当前 tab 对应的值
    const currentValue = name === 'quotation' ? segmentedValue.value.quotation : segmentedValue.value.valuation
    // 检查当前值是否在新选项列表中
    const exists = newOptions.some(option => option.value === currentValue)
    // 如果不存在，重置为第一个选项
    if (!exists) {
      if (name === 'quotation') {
        segmentedValue.value.quotation = newOptions[0].value
      }
      else {
        segmentedValue.value.valuation = newOptions[0].value
      }
    }
  }

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

/**
 * 处理分段器值变化
 */
function handleSegmentChange(value: string) {
  if (tabValue.value === 'quotation') {
    segmentedValue.value.quotation = value
    handleQuotationSegmentedClick()
  }
  else {
    segmentedValue.value.valuation = value
    handleValuationSegmentedClick()
  }
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

function goFundDetail() {
  // router.push({ name: 'etf-performance', query: { code: '510300' } })
  router.push({
    name: 'etf-profile',
    params: {
      code: '510300',
      name: '沪深300ETF',
    },
  })
}

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
  <view class="min-h-screen bg-[#F8FAFC] pb-[env(safe-area-inset-bottom)]">
    <!-- Sticky Tabs - 浅色主题 -->
    <wd-sticky :z-index="99" :offset-top="0">
      <view class="border-b border-black/[0.08] bg-white/95 backdrop-blur-xl">
        <wd-tabs v-model="tabValue" sticky line-color="#00D4AA" @click="handleTabsChange">
          <block v-for="item in tabs" :key="item.name">
            <wd-tab :title="item.label" :name="item.name" />
          </block>
        </wd-tabs>
      </view>
    </wd-sticky>

    <!-- 内容区域 -->
    <view class="px-3 space-y-3">
      <!-- 详情卡片 -->
      <view class="border border-black/[0.08] rounded-2xl bg-white p-4 shadow-sm">
        <wd-collapse v-model="collapseValue">
          <wd-collapse-item title="投资说明" name="detail">
            <text class="text-sm text-[#64748B] leading-relaxed">
              {{ currentData.investIdea || '暂无说明' }}
            </text>
          </wd-collapse-item>
        </wd-collapse>
      </view>

      <!-- 关键指标卡片 -->
      <view class="border border-black/[0.08] rounded-2xl bg-white p-4 shadow-sm">
        <view class="mb-4 flex items-center justify-between">
          <text class="text-sm text-[#1F2937] font-semibold">
            关键指标
          </text>
          <view class="flex items-center gap-1 text-xs text-[#00D4AA]" @click="goFundDetail">
            <text>基本资料</text>
            <wd-icon name="arrow-right" custom-class="text-[#00D4AA]!" />
          </view>
        </view>

        <view class="grid grid-cols-3 gap-4">
          <!-- 行情数据 -->
          <view v-if="tabValue === 'quotation'" class="space-y-3">
            <view v-if="segmentedValue.quotation === '日内' && configShow" class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                当前价格
              </text>
              <text class="text-xl font-bold" :class="getPriceColorClass(currentData.riseFall)">
                {{ currentData.currentPrice || '--' }}
              </text>
            </view>
            <view v-else class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                后复权收盘价
              </text>
              <text class="text-xl text-[#1F2937] font-bold tabular-nums">
                {{ currentData.quotationData?.[currentData.quotationData?.length - 1]?.f_mkt_close_price_adj || '--' }}
              </text>
            </view>
            <view class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                折溢价率
              </text>
              <text class="text-base font-semibold tabular-nums" :class="getPriceColorClass(currentData.premiumRate)">
                {{ formatPercentage(currentData.premiumRate) }}
              </text>
            </view>
          </view>

          <!-- 估值数据 -->
          <view v-else class="space-y-3">
            <view class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                市盈率 (PE)
              </text>
              <text class="text-xl text-[#0A4FE5] font-bold tabular-nums">
                {{ currentValuationData.pe || '--' }}
              </text>
            </view>
            <view class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                市净率 (PB)
              </text>
              <text class="text-xl text-[#FFD700] font-bold tabular-nums">
                {{ currentValuationData.pb || '--' }}
              </text>
            </view>
            <view class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                股息率
              </text>
              <text class="text-base text-[#00C853] font-semibold tabular-nums">
                {{ formatPercentage(currentValuationData.dividend_yield) }}
              </text>
            </view>
          </view>

          <!-- 通用数据 -->
          <view class="space-y-3">
            <view class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                净资产(亿)
              </text>
              <text class="text-lg text-[#1F2937] font-semibold tabular-nums">
                {{ currentData.fundNetAssets ? formatAssets(currentData.fundNetAssets) : '--' }}
              </text>
            </view>
            <view v-if="segmentedValue.quotation !== '日内'" class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                年涨跌幅
              </text>
              <text class="text-base font-semibold tabular-nums" :class="getPriceColorClass(currentData.yearRiseFall)">
                {{ formatPercentage(currentData.yearRiseFall) }}
              </text>
            </view>
          </view>

          <view class="space-y-3">
            <view class="text-center">
              <text class="mb-1 block text-xs text-[#64748B]">
                数据日期
              </text>
              <text class="text-sm text-[#1F2937] tabular-nums">
                {{ currentData.date || '--' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="px-3">
      <!-- 分段选择器 - 深色主题 -->
      <SegmentedControl
        v-if="tabValue === 'quotation'"
        :model-value="segmentedValue.quotation"
        :options="dynamicSegmentedList[tabValue]"
        :disabled="!currentData.quotationData"
        @update:model-value="handleSegmentChange"
      />
      <SegmentedControl
        v-else
        :model-value="segmentedValue.valuation"
        :options="dynamicSegmentedList[tabValue]"
        :disabled="!currentValuationData"
        @update:model-value="handleSegmentChange"
      />
    </view>

    <!-- 图表卡片 -->
    <view class="mx-3 border border-black/[0.08] rounded-2xl bg-white p-4">
      <view class="h-80">
        <LineChart v-if="tabValue === 'quotation'" :option="quotationOption" custom-class="h-full w-full" />
        <LineChart v-else :option="valuationOption" custom-class="h-full w-full" />
      </view>
    </view>

    <!-- 图表 Tooltip - 深色玻璃态 -->
    <view v-if="showChartTip" class="mx-3 border border-black/[0.12] rounded-2xl bg-black/[0.03] p-4 shadow-xl backdrop-blur-xl">
      <view class="mb-3 text-sm text-[#1F2937] font-semibold">
        {{ handleData?.name || handleData?.[0]?.name || '' }}
      </view>
      <!-- 行情 tooltip -->
      <view v-if="tabValue === 'quotation'" class="space-y-2">
        <view class="flex items-center justify-between">
          <text class="text-xs text-[#64748B]">
            {{ segmentedValue.quotation === '日内' ? '历史价格' : '后复权价' }}
          </text>
          <text class="text-sm text-[#0A4FE5] font-semibold tabular-nums">
            {{ segmentedValue.quotation === '日内' ? handleData?.currentPrice : handleData?.f_mkt_close_price_adj }}
          </text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-xs text-[#64748B]">
            涨跌幅
          </text>
          <text class="text-sm font-semibold tabular-nums" :style="{ color: getValueColor(handleData?.riseFall) }">
            {{ formatPercentage(handleData?.riseFall) }}
          </text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-xs text-[#64748B]">
            成交额
          </text>
          <text class="text-sm text-[#1F2937] font-semibold tabular-nums">
            {{ segmentedValue.quotation === '日内' ? formatAssets(handleData?.tradeAmountIntraDay) : formatAssets(handleData?.f_mkt_amount) }}
          </text>
        </view>
      </view>
      <!-- 估值 tooltip -->
      <view v-if="tabValue === 'valuation'" class="space-y-2">
        <view class="flex items-center justify-between">
          <text class="text-xs text-[#64748B]">
            市盈率 (PE)
          </text>
          <text class="text-sm text-[#0A4FE5] font-semibold tabular-nums">
            {{ handleData?.[0]?.data?.pe || '--' }}
          </text>
        </view>
        <view class="flex items-center justify-between">
          <text class="text-xs text-[#64748B]">
            市净率 (PB)
          </text>
          <text class="text-sm text-[#FFD700] font-semibold tabular-nums">
            {{ handleData?.[1]?.data?.pb || '--' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 覆盖 wd-sticky 吸顶容器 top 值，使其在 H5 环境下紧贴顶部 */
:deep(.wd-sticky__container) {
  top: 0 !important;
}
</style>
