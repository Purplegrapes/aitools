<script setup lang="ts">
/**
 * ETF 详情页
 * 按 Figma 设计稿重构估值/行情布局，保留现有数据与图表逻辑。
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
import EtfDetailChartSummary from './components/EtfDetailChartSummary.vue'
import EtfDetailMetricGrid from './components/EtfDetailMetricGrid.vue'
import EtfDetailOverview from './components/EtfDetailOverview.vue'
import { REALTIME_POLLING_INTERVAL } from './constants'
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

const query = computed(() => route.query as {
  code?: string
  name?: string
  djId?: string
  date?: string
})

const tabValue = shallowRef<TabValue>('valuation')
const handleData = shallowRef<EChartsTooltipParams | null>(null)
const descriptionExpanded = shallowRef(false)
const segmentedValue = ref<Record<'quotation' | 'valuation', string>>({
  quotation: '1年',
  valuation: '1年',
})

const currentDate = shallowRef('')
const etfCode = shallowRef('')
const realtimeCode = shallowRef('')
const valuationId = shallowRef<string | number>('')

let timer: ReturnType<typeof setInterval> | null = null

const { data: configData, send: fetchShowQuote } = useRequest(showQuote(), {
  immediate: false,
})

const { data: etfInfoData, send: fetchEtfInfo } = useRequest(
  () => etfInfo(etfCode.value),
  { immediate: false },
)

const factorParams = ref<{ securityCode: string, factorCodes: string[], from: string, to: string } | null>(null)
const { data: factorData, send: fetchFactorExposure } = useRequest(
  () => factorExposure(factorParams.value!),
  { immediate: false },
)

const { data: realtimeLineData, send: fetchRealtimeLineData } = useRequest(
  () => realtimeLine(realtimeCode.value),
  { immediate: false },
)

const realtimeParams = ref<{ securityCodes: string[], assetType: string } | null>(null)
const { data: realtimeData, send: fetchRealtimeData } = useRequest(
  () => realtime(realtimeParams.value!),
  { immediate: false },
)

const { data: valuationData, send: fetchValuationShow } = useRequest(
  () => valuationShow(valuationId.value),
  { immediate: false },
)

const configShow = computed(() => {
  return !!(configData.value as { data?: unknown } | undefined)?.data
})

const dynamicSegmentedList = computed(() => {
  const baseList = segmentedList as unknown as Record<TabValue, Array<{ label: string, value: string, key: string }>>
  if (!configShow.value) {
    return {
      quotation: baseList.quotation.filter(item => item.key !== 'day'),
      valuation: baseList.valuation,
    }
  }
  return baseList
})

const processedFactorData = computed(() => {
  if (!factorData.value?.dates)
    return []

  return factorData.value.dates.map((item: string, index: number) => {
    const data: Record<string, number> = {}
    factorData.value?.factorExposures?.forEach((it: { factorCode: string, values: number[] }) => {
      data[it.factorCode] = it.values[index]
    })
    return {
      name: item,
      value: [item, data.f_mkt_close_price_adj],
      ...data,
    }
  })
})

const processedRealtimeLineData = computed(() => {
  if (!realtimeLineData.value || !realtimeData.value)
    return []

  const res = realtimeLineData.value as RealtimeLineItem[]
  const real = realtimeData.value as Array<{ preClosePrice?: number }>

  if (!Array.isArray(res))
    return []

  return res.map((item: RealtimeLineItem) => ({
    name: item.timestamp?.split(' ')?.[1],
    date: item.timestamp?.split(' ')?.[0],
    value: [item.timestamp?.split(' ')?.[1], item.currentPrice],
    riseFall: item.currentPrice / (real?.[0]?.preClosePrice || item.currentPrice) - 1,
    tradeAmountIntraDay: item.tradeAmountIntraDay,
    currentPrice: item.currentPrice,
  }))
})

const currentData = computed(() => {
  const base: EtfDetailData & {
    dayData: typeof processedRealtimeLineData.value
    quotationData: typeof processedFactorData.value
    f_mkt_amount?: number
    f_mkt_close_price?: number
    date?: string
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
    f_mkt_amount: processedFactorData.value.at(-1)?.f_mkt_amount,
    f_mkt_close_price: processedFactorData.value.at(-1)?.f_mkt_close_price_adj,
  }

  if (etfInfoData.value?.data) {
    Object.assign(base, etfInfoData.value.data)
  }

  if (processedRealtimeLineData.value.length > 0) {
    const lastData = processedRealtimeLineData.value.at(-1)!
    base.currentPrice = lastData.currentPrice
    base.riseFall = lastData.riseFall
    base.tradeAmountIntraDay = lastData.tradeAmountIntraDay
  }

  return base
})

const currentValuationData = computed(() => {
  const data = valuationData.value
  if (Array.isArray(data))
    return data[0] ?? {}
  if (isValuationDetailData(data) && data.result_code === 0)
    return data.data ?? {}
  return {}
})

const displayName = computed(() => {
  if (currentData.value.name)
    return currentData.value.name
  if (!query.value.name)
    return '--'
  return decodeURIComponent(query.value.name)
})

const visibleDescription = computed(() => {
  const source = currentData.value.investIdea || '暂无说明'
  if (descriptionExpanded.value || source.length <= 42)
    return source
  return `${source.slice(0, 42)}...`
})

const descriptionExpandable = computed(() => {
  return (currentData.value.investIdea || '').length > 42
})

const latestPrice = computed(() => {
  const price = currentData.value.currentPrice || currentData.value.f_mkt_close_price
  if (price === null || price === undefined)
    return '--'
  return Number(price).toFixed(3)
})

const priceChangeAmount = computed(() => {
  const price = Number(currentData.value.currentPrice || currentData.value.f_mkt_close_price)
  const rise = Number(currentData.value.riseFall || 0)
  if (!Number.isFinite(price) || !rise)
    return null
  const previousClose = price / (1 + rise)
  return price - previousClose
})

const overviewPriceDelta = computed(() => {
  if (priceChangeAmount.value === null)
    return '--'
  const sign = priceChangeAmount.value > 0 ? '+' : ''
  return `${sign}${priceChangeAmount.value.toFixed(3)}`
})

const summaryItems = computed(() => {
  const premiumRate = currentData.value.premiumRate ?? 0
  return [
    {
      label: '成交额',
      value: formatAssets(currentData.value.tradeAmountIntraDay || currentData.value.f_mkt_amount),
    },
    {
      label: '总规模',
      value: formatAssets(currentData.value.fundNetAssets),
    },
    {
      label: '折溢价率',
      value: formatPercentage(premiumRate),
      accent: premiumRate > 0 ? 'positive' : premiumRate < 0 ? 'negative' : 'neutral',
    },
  ] as const
})

const metricCards = computed(() => {
  if (tabValue.value === 'valuation') {
    return [
      {
        label: `当前PE(${currentData.value.date || '--'})`,
        value: formatMetricNumber(currentValuationData.value.pe),
      },
      {
        label: '股息率',
        value: formatPercentage(currentValuationData.value.dividend_yield),
        tone: 'success' as const,
      },
      {
        label: '当前PB',
        value: formatMetricNumber(currentValuationData.value.pb),
      },
      {
        label: 'ROE',
        value: formatPercentage(currentValuationData.value.roe),
        tone: 'warning' as const,
      },
    ]
  }

  return [
    {
      label: segmentedValue.value.quotation === '日内' ? '当前价格' : '后复权价',
      value: segmentedValue.value.quotation === '日内'
        ? latestPrice.value
        : formatMetricNumber(currentData.value.f_mkt_close_price, 3),
      tone: 'primary' as const,
    },
    {
      label: '年涨跌幅',
      value: formatPercentage(currentData.value.yearRiseFall),
      tone: getTone(currentData.value.yearRiseFall),
    },
    {
      label: '成交额',
      value: formatAssets(currentData.value.tradeAmountIntraDay || currentData.value.f_mkt_amount),
    },
    {
      label: '折溢价率',
      value: formatPercentage(currentData.value.premiumRate),
      tone: getTone(currentData.value.premiumRate),
    },
  ]
})

const chartSummaryDate = computed(() => {
  if (tabValue.value === 'valuation')
    return handleData.value?.[0]?.name || currentData.value.date || '--'
  return handleData.value?.name || currentData.value.date || '--'
})

const chartSummaryItems = computed(() => {
  if (tabValue.value === 'valuation') {
    return [
      {
        label: '市盈率(左)',
        value: formatMetricNumber(handleData.value?.[0]?.data?.pe ?? currentValuationData.value.pe),
        color: '#1678FF',
      },
      {
        label: '市净率(右)',
        value: formatMetricNumber(handleData.value?.[1]?.data?.pb ?? currentValuationData.value.pb),
        color: '#FF7A00',
      },
    ]
  }

  return [
    {
      label: segmentedValue.value.quotation === '日内' ? '最新价' : '后复权价',
      value: segmentedValue.value.quotation === '日内'
        ? formatMetricNumber(handleData.value?.currentPrice ?? currentData.value.currentPrice, 3)
        : formatMetricNumber(handleData.value?.f_mkt_close_price_adj ?? currentData.value.f_mkt_close_price, 3),
      color: '#1678FF',
    },
    {
      label: '涨跌幅',
      value: formatPercentage(handleData.value?.riseFall ?? currentData.value.riseFall),
      color: '#F02D30',
    },
    {
      label: '成交额',
      value: formatAssets(
        (segmentedValue.value.quotation === '日内'
          ? handleData.value?.tradeAmountIntraDay
          : handleData.value?.f_mkt_amount) as number | undefined
          ?? (currentData.value.tradeAmountIntraDay || currentData.value.f_mkt_amount),
      ),
      color: '#8A95A1',
    },
  ]
})

const activeSegmentOptions = computed(() => {
  return dynamicSegmentedList.value[tabValue.value]
})

const quotationOption = ref<EChartsOption>({
  backgroundColor: 'transparent',
  grid: { left: '8%', right: '5%', top: '9%', bottom: '12%' },
  legend: { show: false },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textStyle: { color: '#1f2937' },
    axisPointer: {
      animation: false,
      lineStyle: { color: '#c8d4e5', type: 'dashed' },
    },
    formatter: (params: EChartsTooltipParams) => {
      handleData.value = params
      return ''
    },
  },
  xAxis: [{
    type: 'category',
    splitLine: { show: false },
    boundaryGap: ['0%', '0%'],
    axisLine: { lineStyle: { color: '#c9d3df' } },
    axisLabel: {
      color: '#98A3AF',
      fontSize: 10,
      formatter: (v: string) => {
        if (segmentedValue.value.quotation === '日内') {
          const parts = v.split(':')
          return `${parts[0]}:${parts[1]}`
        }
        const parts = v?.split('-')
        return `${parts[1]}-${parts[2]}`
      },
    },
  }],
  yAxis: [{
    type: 'value',
    min: 'dataMin',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#e4eaf2', type: 'dashed' } },
    axisLabel: { color: '#98A3AF', fontSize: 10 },
  }],
  series: [{
    type: 'line',
    showSymbol: false,
    smooth: true,
    data: [],
    lineStyle: { width: 2, color: '#1678FF' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: hexToRgba('#1678FF', 0.16) },
          { offset: 1, color: hexToRgba('#1678FF', 0.02) },
        ],
      },
    },
  }],
})

const valuationOption = ref<EChartsOption>({
  backgroundColor: 'transparent',
  grid: { left: '8%', right: '8%', top: '9%', bottom: '12%' },
  legend: { show: false },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    textStyle: { color: '#1f2937' },
    axisPointer: {
      animation: false,
      lineStyle: { color: '#c8d4e5', type: 'dashed' },
    },
    formatter: (params: EChartsTooltipParams) => {
      handleData.value = params
      return ''
    },
  },
  xAxis: [{
    type: 'time',
    splitLine: { show: false },
    boundaryGap: ['0%', '0%'],
    splitNumber: 5,
    min: 'dataMin',
    axisLine: { lineStyle: { color: '#c9d3df' } },
    axisLabel: {
      color: '#98A3AF',
      fontSize: 10,
      formatter: { year: '{yyyy}', month: '{MM}-{dd}' },
    },
  }],
  yAxis: [
    {
      type: 'value',
      position: 'left',
      min: 'dataMin',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e4eaf2', type: 'dashed' } },
      axisLabel: { color: '#98A3AF', fontSize: 10 },
    },
    {
      type: 'value',
      position: 'right',
      min: 'dataMin',
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: { color: '#98A3AF', fontSize: 10 },
    },
  ],
  series: [
    {
      name: '市盈率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: [],
      lineStyle: { width: 2, color: '#1678FF' },
    },
    {
      name: '市净率',
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: [],
      yAxisIndex: 1,
      lineStyle: { width: 2, color: '#FF7A00' },
    },
  ],
})

function formatMetricNumber(value: unknown, decimals = 2): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const number = Number(value)
  if (Number.isNaN(number))
    return '--'
  return number.toFixed(decimals)
}

function getTone(value: number | undefined | null) {
  if (!value)
    return 'neutral' as const
  return value > 0 ? 'primary' as const : 'success' as const
}

function formatSegmentLabel(label: string, value: string) {
  if (tabValue.value !== 'valuation')
    return label
  if (value === '全部')
    return '成立以来'
  return `近${value}`
}

function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function computesQuotationOption() {
  const key = segmentedValue.value.quotation
  const newData = currentData.value.quotationData

  if (key === '日内') {
    if (!currentData.value.dayData.length)
      return
  }
  else if (!newData.length) {
    return
  }

  if (key === '日内') {
    quotationOption.value.series = [{
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: currentData.value.dayData,
      lineStyle: { width: 2, color: '#1678FF' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba('#1678FF', 0.16) },
            { offset: 1, color: hexToRgba('#1678FF', 0.02) },
          ],
        },
      },
    }]
    quotationOption.value.xAxis = [{
      type: 'category',
      splitLine: { show: false },
      boundaryGap: ['0%', '0%'],
      axisLine: { lineStyle: { color: '#c9d3df' } },
      axisLabel: {
        color: '#98A3AF',
        fontSize: 10,
        formatter: (v: string) => {
          const parts = v.split(':')
          return `${parts[0]}:${parts[1]}`
        },
      },
      data: currentData.value.dayData.map((item: QuotationDataPoint) => item.name),
    }]
  }
  else if (key === '全部') {
    const riseFallData = formatRiseFall(newData)
    quotationOption.value.series = [{
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: riseFallData,
      lineStyle: { width: 2, color: '#1678FF' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: hexToRgba('#1678FF', 0.16) },
            { offset: 1, color: hexToRgba('#1678FF', 0.02) },
          ],
        },
      },
    }]
    quotationOption.value.xAxis = [{
      type: 'category',
      splitLine: { show: false },
      boundaryGap: ['0%', '0%'],
      axisLine: { lineStyle: { color: '#c9d3df' } },
      axisLabel: {
        color: '#98A3AF',
        fontSize: 10,
        formatter: (v: string) => {
          const parts = v?.split('-')
          return `${parts[1]}-${parts[2]}`
        },
      },
      data: riseFallData.map((item: QuotationDataPoint) => item.name),
    }]
  }
  else {
    const periodKey = segmentedList.quotation.find(item => item.value === key)?.key
    const targetDate = calculatePreviousDates(currentData.value.date || currentDate.value)[periodKey as keyof ReturnType<typeof calculatePreviousDates>]
    const startIndex = newData.findIndex((item: QuotationDataPoint) => item.name > targetDate)

    if (startIndex !== -1) {
      const riseFallData = formatRiseFall(newData.slice(startIndex))
      quotationOption.value.series = [{
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: riseFallData,
        lineStyle: { width: 2, color: '#1678FF' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: hexToRgba('#1678FF', 0.16) },
              { offset: 1, color: hexToRgba('#1678FF', 0.02) },
            ],
          },
        },
      }]
      quotationOption.value.xAxis = [{
        type: 'category',
        splitLine: { show: false },
        boundaryGap: ['0%', '0%'],
        axisLine: { lineStyle: { color: '#c9d3df' } },
        axisLabel: {
          color: '#98A3AF',
          fontSize: 10,
          formatter: (v: string) => {
            const parts = v?.split('-')
            return `${parts[1]}-${parts[2]}`
          },
        },
        data: riseFallData.map((item: QuotationDataPoint) => item.name),
      }]
    }
  }

  quotationOption.value = { ...quotationOption.value }
}

function computesValuationOption() {
  const key = segmentedValue.value.valuation
  const pbTrends = currentValuationData.value.pb_trends?.map((item: { time: string, pb: number }) => ({
    ...item,
    name: item.time,
    value: [item.time, item.pb],
  }))
  const peTrends = currentValuationData.value.pe_trends?.map((item: { time: string, pe: number }) => ({
    ...item,
    name: item.time,
    value: [item.time, item.pe],
  }))

  if (!pbTrends?.length || !peTrends?.length)
    return

  if (key === '全部') {
    valuationOption.value.series = [
      {
        name: '市盈率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: peTrends,
        lineStyle: { width: 2, color: '#1678FF' },
      },
      {
        name: '市净率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: pbTrends,
        yAxisIndex: 1,
        lineStyle: { width: 2, color: '#FF7A00' },
      },
    ]
  }
  else {
    const periodKey = segmentedList.valuation.find(item => item.value === key)?.key
    const targetDate = calculatePreviousDates(currentData.value.date || currentDate.value)[periodKey as keyof ReturnType<typeof calculatePreviousDates>]
    const peIndex = peTrends.findIndex((item: ValuationTrendPoint) => item.name > targetDate)
    const pbIndex = pbTrends.findIndex((item: ValuationTrendPoint) => item.name > targetDate)
    const newPeTrends = formatRiseFall(peTrends.slice(peIndex))
    const newPbTrends = formatRiseFall(pbTrends.slice(pbIndex))

    valuationOption.value.series = [
      {
        name: '市盈率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: newPeTrends,
        lineStyle: { width: 2, color: '#1678FF' },
      },
      {
        name: '市净率',
        type: 'line',
        showSymbol: false,
        smooth: true,
        data: newPbTrends,
        yAxisIndex: 1,
        lineStyle: { width: 2, color: '#FF7A00' },
      },
    ]
  }

  valuationOption.value = { ...valuationOption.value }
}

function handleTabChange(name: TabValue) {
  tabValue.value = name
  handleData.value = null

  const nextOptions = dynamicSegmentedList.value[name]
  const currentValue = name === 'quotation' ? segmentedValue.value.quotation : segmentedValue.value.valuation
  if (!nextOptions.some(option => option.value === currentValue)) {
    if (name === 'quotation')
      segmentedValue.value.quotation = nextOptions[0].value
    else
      segmentedValue.value.valuation = nextOptions[0].value
  }

  if (name === 'quotation') {
    startRealtimePolling()
    computesQuotationOption()
    return
  }

  stopRealtimePolling()
  computesValuationOption()
}

function handleSegmentChange(value: string) {
  if (tabValue.value === 'quotation') {
    segmentedValue.value.quotation = value
    computesQuotationOption()
  }
  else {
    segmentedValue.value.valuation = value
    computesValuationOption()
  }
  handleData.value = null
}

function startRealtimePolling() {
  stopRealtimePolling()
  if (!currentData.value.code)
    return
  timer = setInterval(() => {
    loadRealtimeData(currentData.value.code)
  }, REALTIME_POLLING_INTERVAL)
}

function stopRealtimePolling() {
  if (!timer)
    return
  clearInterval(timer)
  timer = null
}

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

onMounted(() => {
  if (query.value.name) {
    uni.setNavigationBarTitle({
      title: decodeURIComponent(query.value.name),
    })
  }

  const { code, djId, date } = query.value
  if (!code)
    return

  currentDate.value = date || new Date().toISOString().split('T')[0]
  fetchShowQuote()
  loadEtfData(code)
  loadFactorData(code)
  loadRealtimeData(code)

  if (djId) {
    valuationId.value = djId
    fetchValuationShow()
  }
})

watch([processedFactorData, processedRealtimeLineData, currentValuationData], ([factor, realtime, valuation]) => {
  if (tabValue.value === 'quotation') {
    const key = segmentedValue.value.quotation
    const hasDayData = realtime && realtime.length > 0
    const hasHistoryData = factor && factor.length > 0
    if (key === '日内' && !hasDayData)
      return
    if (key !== '日内' && !hasHistoryData)
      return
    computesQuotationOption()
    return
  }

  if (!valuation || Object.keys(valuation).length === 0)
    return
  computesValuationOption()
}, { deep: true })

onShow(() => {
  if (tabValue.value === 'quotation' && currentData.value.code)
    startRealtimePolling()
})

onHide(() => {
  stopRealtimePolling()
})

onUnload(() => {
  stopRealtimePolling()
})
</script>

<template>
  <view class="detail-page min-h-screen bg-[#F5F7FA] pb-[220rpx]">
    <EtfDetailOverview
      :title="displayName"
      :code="currentData.code"
      :update-date="currentData.date || '--'"
      :description="visibleDescription"
      :description-expanded="descriptionExpanded"
      :description-expandable="descriptionExpandable"
      :current-price="latestPrice"
      :price-delta="overviewPriceDelta"
      :rise-fall="formatPercentage(currentData.riseFall)"
      :rise-fall-value="currentData.riseFall"
      :summary-items="summaryItems"
      @toggle-description="descriptionExpanded = !descriptionExpanded"
    />

    <view class="mx-[32rpx] -mt-[8rpx] space-y-[32rpx]">
      <view class="overflow-hidden rounded-[48rpx] bg-white px-[32rpx] pb-[32rpx] pt-[24rpx] shadow-[0_20rpx_60rpx_rgba(21,63,128,0.08)]">
        <view class="rounded-4 bg-[#F2F3F5] p-[8rpx]">
          <view class="grid grid-cols-2 gap-[8rpx]">
            <view
              v-for="item in tabs"
              :key="item.name"
              class="rounded-[32rpx] py-[24rpx] text-center text-xs transition-all duration-200"
              :class="tabValue === item.name ? 'bg-white text-[#1D2129] font-600 shadow-[0_8rpx_28rpx_rgba(29,33,41,0.08)]' : 'text-[#8A95A1]'"
              @tap="handleTabChange(item.name)"
            >
              {{ item.label }}
            </view>
          </view>
        </view>

        <view class="mt-[32rpx]">
          <EtfDetailMetricGrid :cards="metricCards" />
        </view>

        <view class="mt-[32rpx]">
          <EtfDetailChartSummary
            :date-text="chartSummaryDate"
            :items="chartSummaryItems"
          />
        </view>

        <view class="mt-[24rpx] rounded-[36rpx] bg-[#F8FAFD] px-[16rpx] py-[24rpx]">
          <view class="h-[544rpx]">
            <LineChart
              v-if="tabValue === 'quotation'"
              :option="quotationOption"
              custom-class="h-full w-full"
            />
            <LineChart
              v-else
              :option="valuationOption"
              custom-class="h-full w-full"
            />
          </view>
        </view>

        <view class="mt-[32rpx] rounded-[36rpx] bg-[#F2F3F5] p-[8rpx]">
          <view class="flex gap-[8rpx]">
            <view
              v-for="item in activeSegmentOptions"
              :key="item.value"
              class="min-w-0 flex-1 rounded-[28rpx] px-[16rpx] py-2 text-center text-sm transition-all duration-200"
              :class="(tabValue === 'quotation' ? segmentedValue.quotation : segmentedValue.valuation) === item.value
                ? 'bg-[#1678FF] text-white shadow-[0_16rpx_36rpx_rgba(22,120,255,0.28)]'
                : 'text-[#8A95A1]'"
              @tap="handleSegmentChange(item.value)"
            >
              {{ formatSegmentLabel(item.label, item.value) }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="fixed inset-x-0 bottom-0 z-20 bg-white/94 px-[32rpx] pb-[calc(env(safe-area-inset-bottom)+16rpx)] pt-[24rpx] shadow-[0_-24rpx_56rpx_rgba(26,53,98,0.08)] backdrop-blur-[24rpx]">
      <view class="flex items-center gap-[24rpx]">
        <view class="h-12 flex flex-1 items-center justify-center gap-[16rpx] rounded-full bg-[#E8F1FF] text-[#1678FF]">
          <view class="i-carbon-notification text-base" />
          <text class="text-sm font-500">
            通知提醒
          </text>
        </view>
        <view class="h-12 flex flex-[1.35] items-center justify-center gap-[16rpx] rounded-full bg-[#1678FF] text-white shadow-[0_20rpx_44rpx_rgba(22,120,255,0.28)]">
          <view class="i-carbon-add-filled text-base" />
          <text class="text-sm font-500">
            加入自选
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.detail-page {
  position: relative;
}
</style>
