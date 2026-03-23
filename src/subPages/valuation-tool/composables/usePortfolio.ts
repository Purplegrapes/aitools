import type {
  FundSearchServiceItem,
  PortfolioFundOption,
  PortfolioInsight,
  PortfolioPosition,
  PortfolioPositionMetrics,
  PortfolioPreviewState,
  PortfolioSummary,
  PortfolioUnavailableState,
  PositionItemServiceResponse,
  PositionRealtimeItemServiceResponse,
} from '../types'
import {
  addPortfolioPosition,
  getPortfolioPositions,
  getPortfolioPositionsRealtime,
  searchFunds as searchFundsRequest,
} from '../api/valuationTool'
import {
  fallbackPortfolioFundCatalog,
  getFallbackPortfolioInsight,
  getFallbackPortfolioMetrics,
  getFallbackPortfolioPositions,
  getFallbackPortfolioUnavailableState,
  removeFallbackPortfolioPosition,
  saveFallbackPortfolioPosition,
  searchFallbackPortfolioFunds,
  updateFallbackPortfolioPosition,
} from '../mock'
import {
  buildPortfolioSummary,
  createPositionId,
  formatCurrentTimeLabel,
  isPortfolioPreviewState,
} from '../utils'

const portfolioPositionsState = shallowRef<PortfolioPosition[]>([])
const portfolioMetricsState = shallowRef<PortfolioPositionMetrics[]>([])
const portfolioLoadedState = shallowRef(false)
const portfolioRefreshingState = shallowRef(false)

export function usePortfolio() {
  const route = useRoute()
  const positions = computed(() => portfolioPositionsState.value)
  const previewState = computed<PortfolioPreviewState>(() => {
    const stateValue = route.query.state
    return isPortfolioPreviewState(stateValue) ? stateValue : 'default'
  })

  const metrics = computed<PortfolioPositionMetrics[]>(() => {
    return portfolioMetricsState.value
  })

  const summary = computed<PortfolioSummary>(() => buildPortfolioSummary(metrics.value))
  const insight = computed<PortfolioInsight>(() => getFallbackPortfolioInsight(metrics.value))
  const unavailableState = computed<PortfolioUnavailableState>(() => getFallbackPortfolioUnavailableState())

  const { send: sendPortfolioPositionsRequest } = useRequest(
    () => getPortfolioPositions(),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const { send: sendAddPortfolioPositionRequest } = useRequest(
    (input: { fundCode: string, holdingAmount: number, holdingProfit: number }) => addPortfolioPosition(input),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const { send: sendPortfolioRealtimeRequest } = useRequest(
    () => getPortfolioPositionsRealtime(),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const { send: sendFundSearchRequest } = useRequest(
    (keyword: string) => searchFundsRequest({ keyword }),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  function ensureLoaded() {
    if (portfolioLoadedState.value)
      return
    void refreshPositions()
  }

  async function refreshPositions() {
    if (portfolioRefreshingState.value)
      return

    portfolioRefreshingState.value = true
    try {
      const [positionsResult, realtimeResult] = await Promise.allSettled([
        sendPortfolioPositionsRequest(),
        sendPortfolioRealtimeRequest(),
      ])

      const positionsResponse = positionsResult.status === 'fulfilled' ? positionsResult.value : undefined
      const realtimeResponse = realtimeResult.status === 'fulfilled' ? realtimeResult.value : undefined

      const items = (positionsResponse as { data?: PositionItemServiceResponse[] } | undefined)?.data
      const realtimeItems = (realtimeResponse as { data?: PositionRealtimeItemServiceResponse[] } | undefined)?.data

      if (Array.isArray(items)) {
        applyPortfolioFromService(items, Array.isArray(realtimeItems) ? realtimeItems : [])
      }
      else {
        applyFallbackPortfolio()
      }
    }
    catch {
      applyFallbackPortfolio()
    }
    finally {
      portfolioRefreshingState.value = false
    }

    portfolioLoadedState.value = true
  }

  function getPositionById(id: string) {
    return portfolioPositionsState.value.find(item => item.id === id) || null
  }

  function addPosition(input: Omit<PortfolioPosition, 'id'>) {
    const nextPosition: PortfolioPosition = {
      ...input,
      id: createPositionId(input),
    }
    saveFallbackPortfolioPosition(nextPosition)
    void refreshPositions()
    return nextPosition
  }

  async function addManualPosition(input: {
    code: string
    name: string
    holdingAmount: number
    holdingProfit: number
  }) {
    await sendAddPortfolioPositionRequest({
      fundCode: input.code,
      holdingAmount: input.holdingAmount,
      holdingProfit: input.holdingProfit,
    })

    await refreshPositions()
  }

  function updatePosition(position: PortfolioPosition) {
    updateFallbackPortfolioPosition(position)
    void refreshPositions()
    return position
  }

  function removePosition(id: string) {
    removeFallbackPortfolioPosition(id)
    void refreshPositions()
  }

  function searchFunds(keyword: string) {
    const results = searchFallbackPortfolioFunds(keyword)
    if (results.length)
      return results
    return fallbackPortfolioFundCatalog.filter(item => item.code.includes(keyword.trim()))
  }

  async function searchFundsByKeyword(keyword: string): Promise<PortfolioFundOption[]> {
    const normalizedKeyword = keyword.trim()
    if (!normalizedKeyword)
      return []

    try {
      const response = await sendFundSearchRequest(normalizedKeyword)
      const serviceItems = (response as { data?: FundSearchServiceItem[] } | undefined)?.data
      if (Array.isArray(serviceItems) && serviceItems.length)
        return serviceItems.map(item => mapFundSearchItemToOption(item))
      return searchFunds(normalizedKeyword)
    }
    catch {
      return searchFunds(normalizedKeyword)
    }
  }

  function getFundOptionByCode(code: string) {
    return fallbackPortfolioFundCatalog.find(item => item.code === code) || null
  }

  function resolveFundOption(keyword: string) {
    if (!keyword.trim())
      return null

    const exactCode = getFundOptionByCode(keyword.trim())
    if (exactCode)
      return exactCode

    const exactName = fallbackPortfolioFundCatalog.find(item => item.name === keyword.trim())
    if (exactName)
      return exactName

    return searchFunds(keyword.trim())[0] || null
  }

  function getStrongestHolding() {
    return [...metrics.value].sort((a, b) => b.cumulativeProfit - a.cumulativeProfit)[0] || null
  }

  function getWeakestHolding() {
    return [...metrics.value].sort((a, b) => a.cumulativeProfit - b.cumulativeProfit)[0] || null
  }

  function getFocusHolding() {
    return [...metrics.value].sort((a, b) => Math.abs(b.todayProfit ?? 0) - Math.abs(a.todayProfit ?? 0))[0] || null
  }

  return {
    positions,
    metrics,
    summary,
    insight,
    previewState,
    unavailableState,
    ensureLoaded,
    refreshPositions,
    getPositionById,
    addPosition,
    addManualPosition,
    updatePosition,
    removePosition,
    searchFunds,
    searchFundsByKeyword,
    getFundOptionByCode,
    resolveFundOption,
    getStrongestHolding,
    getWeakestHolding,
    getFocusHolding,
  }

  function applyFallbackPortfolio() {
    portfolioPositionsState.value = getFallbackPortfolioPositions()
    portfolioMetricsState.value = getFallbackPortfolioMetrics(portfolioPositionsState.value)
  }

  function applyPortfolioFromService(
    items: PositionItemServiceResponse[],
    realtimeItems: PositionRealtimeItemServiceResponse[],
  ) {
    const realtimeMap = new Map(
      realtimeItems.map(item => [normalizeFundCode(item.code), item] as const),
    )

    const normalizedItems = items
      .map((item) => {
        const realtimeItem = realtimeMap.get(normalizeFundCode(item.code))
        const currentAmount = Number(item.totalAmount)
        const cumulativeProfit = Number(item.totalProfit)
        const cumulativeProfitRateRaw = Number(item.totalProfitRate)
        const cumulativeProfitRate = Number.isFinite(cumulativeProfitRateRaw) ? cumulativeProfitRateRaw : null

        if (![currentAmount, cumulativeProfit].every(Number.isFinite))
          return null

        const costAmount = currentAmount - cumulativeProfit
        const shares = 1
        const costNav = costAmount > 0 ? costAmount : currentAmount
        const currentNav = Number.isFinite(Number(realtimeItem?.nav)) ? Number(realtimeItem?.nav) : null
        const yieldRatio = normalizeYieldRatio(realtimeItem?.yieldChange)
        const dailyChangeRate = yieldRatio === null ? null : yieldRatio * 100
        const todayProfit = yieldRatio === null
          ? null
          : currentAmount - currentAmount / (1 + yieldRatio)

        return {
          position: {
            id: item.code,
            code: item.code,
            name: item.name,
            shares,
            costNav,
          } satisfies PortfolioPosition,
          metric: {
            id: item.code,
            code: item.code,
            name: item.name,
            shares,
            costNav,
            currentNav,
            currentAmount,
            costAmount,
            cumulativeProfit,
            cumulativeProfitRate,
            todayProfit,
            dailyChangeRate,
            statusLabel: resolveStatusLabel(cumulativeProfitRate),
            note: '持仓累计收益已同步到最新记录。',
            updateTime: formatCurrentTimeLabel(),
          } satisfies PortfolioPositionMetrics,
        }
      })
      .filter(Boolean) as Array<{
      position: PortfolioPosition
      metric: PortfolioPositionMetrics
    }>

    portfolioPositionsState.value = normalizedItems.map(item => item.position)
    portfolioMetricsState.value = normalizedItems.map(item => item.metric)
  }
}

function normalizeFundCode(code?: string | null) {
  return `${code || ''}`.trim().toUpperCase()
}

function normalizeYieldRatio(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return null

  const numericValue = Number(value)
  return Math.abs(numericValue) > 1 ? numericValue / 100 : numericValue
}

function mapFundSearchItemToOption(item: FundSearchServiceItem): PortfolioFundOption {
  const fallbackOption = fallbackPortfolioFundCatalog.find(
    catalog => catalog.code === item.code || catalog.name === item.name,
  )

  const category = fallbackOption?.category || '基金'
  const statusLabel = fallbackOption?.statusLabel || '震荡'
  const tagParts = [item.channel === 'EXCHANGE' ? '场内' : '场外'].filter(Boolean)

  return {
    code: item.code,
    name: item.name,
    category,
    tag: tagParts.join(' · ') || fallbackOption?.tag || '基金',
    estimatedNav: fallbackOption?.estimatedNav || 1,
    dailyChangeRate: fallbackOption?.dailyChangeRate ?? null,
    statusLabel,
  }
}

function resolveStatusLabel(rate: number | null) {
  if (rate === null)
    return '震荡' as const
  if (rate >= 5)
    return '偏强' as const
  if (rate <= -5)
    return '偏弱' as const
  return '震荡' as const
}
