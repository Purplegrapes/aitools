import type {
  ApiEnvelope,
  RedDividendCategoryCode,
  RedDividendComparisonResponse,
  RedDividendContextResponse,
  RedDividendMarketViewResponse,
} from './types'

export function createRedDividendHomePath() {
  return '/subPages/red-dividend/index'
}

export function createRedDividendCategoryPath(categoryCode?: RedDividendCategoryCode) {
  if (!categoryCode)
    return '/subPages/red-dividend/category'
  return `/subPages/red-dividend/category?categoryCode=${encodeURIComponent(categoryCode)}`
}

export function createRedDividendComparisonPath() {
  return '/subPages/red-dividend/comparison'
}

export function getEnvelopeData<T>(response?: ApiEnvelope<T> | T | null): T | null {
  if (!response) {
    return null
  }

  if (typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data ?? null
  }

  return response as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function isRedDividendContextResponse(value: unknown): value is RedDividendContextResponse {
  if (!isRecord(value))
    return false

  const brief = value.brief
  const categories = value.categories
  const mappingConfig = value.mappingConfig

  return isRecord(brief)
    && typeof brief.title === 'string'
    && typeof brief.summary === 'string'
    && typeof brief.strategyCore === 'string'
    && Array.isArray(categories)
    && categories.length > 0
    && isRecord(mappingConfig)
}

export function isRedDividendMarketViewResponse(value: unknown): value is RedDividendMarketViewResponse {
  if (!isRecord(value))
    return false

  return typeof value.summary === 'string' && typeof value.matchedCategoryCode === 'string'
}

export function isRedDividendStrategyResponse(value: unknown): value is {
  categoryCode: string
  metric: Record<string, unknown>
  assetList: unknown[]
} {
  if (!isRecord(value))
    return false

  return typeof value.categoryCode === 'string'
    && isRecord(value.metric)
    && Array.isArray(value.assetList)
}

export function isRedDividendComparisonResponse(value: unknown): value is RedDividendComparisonResponse {
  if (!isRecord(value))
    return false

  return isRecord(value.dividendCompare)
    && Array.isArray(value.dividendCompare.items)
    && isRecord(value.mapping)
    && Array.isArray(value.mapping.nodes)
    && typeof value.mapping.matchedCategoryCode === 'string'
    && Array.isArray(value.explanations)
}

export function formatAmount(amount: number) {
  return `${amount.toLocaleString('zh-CN')} 元`
}

export function formatAmountWithSign(amount: number) {
  return `${amount > 0 ? '+' : ''}${amount.toLocaleString('zh-CN')} 元`
}

export function formatYield(value: number) {
  return `${value > 0 ? '' : ''}${value}%`
}

export function getMappingNodeStyle(xValue: number, yValue: number) {
  return {
    left: `${xValue * 100}%`,
    bottom: `${yValue * 100}%`,
  }
}
