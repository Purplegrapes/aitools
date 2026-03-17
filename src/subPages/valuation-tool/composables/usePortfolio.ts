import type {
  PortfolioInsight,
  PortfolioPosition,
  PortfolioPositionMetrics,
  PortfolioPreviewState,
  PortfolioSummary,
  PortfolioUnavailableState,
} from '../types'
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
  isPortfolioPreviewState,
} from '../utils'

const portfolioPositionsState = shallowRef<PortfolioPosition[]>([])
const portfolioLoadedState = shallowRef(false)

export function usePortfolio() {
  const route = useRoute()
  const positions = computed(() => portfolioPositionsState.value)
  const previewState = computed<PortfolioPreviewState>(() => {
    const stateValue = route.query.state
    return isPortfolioPreviewState(stateValue) ? stateValue : 'default'
  })

  const metrics = computed<PortfolioPositionMetrics[]>(() => {
    return getFallbackPortfolioMetrics(portfolioPositionsState.value)
  })

  const summary = computed<PortfolioSummary>(() => buildPortfolioSummary(metrics.value))
  const insight = computed<PortfolioInsight>(() => getFallbackPortfolioInsight(metrics.value))
  const unavailableState = computed<PortfolioUnavailableState>(() => getFallbackPortfolioUnavailableState())

  function ensureLoaded() {
    if (portfolioLoadedState.value)
      return
    portfolioPositionsState.value = getFallbackPortfolioPositions()
    portfolioLoadedState.value = true
  }

  function refreshPositions() {
    portfolioPositionsState.value = getFallbackPortfolioPositions()
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
    refreshPositions()
    return nextPosition
  }

  function updatePosition(position: PortfolioPosition) {
    updateFallbackPortfolioPosition(position)
    refreshPositions()
    return position
  }

  function removePosition(id: string) {
    removeFallbackPortfolioPosition(id)
    refreshPositions()
  }

  function searchFunds(keyword: string) {
    const results = searchFallbackPortfolioFunds(keyword)
    if (results.length)
      return results
    return fallbackPortfolioFundCatalog.filter(item => item.code.includes(keyword.trim()))
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
    updatePosition,
    removePosition,
    searchFunds,
    getStrongestHolding,
    getWeakestHolding,
    getFocusHolding,
  }
}
