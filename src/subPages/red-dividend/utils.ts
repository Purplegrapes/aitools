import type {
  ApiEnvelope,
  RedDividendCategory,
  RedDividendCategoryCode,
  RedDividendCompareViewItem,
  RedDividendComparisonResponse,
  RedDividendContextResponse,
  RedDividendExplanation,
  RedDividendMappingNodeView,
  RedDividendMarketViewResponse,
} from './types'

const DEFAULT_CATEGORY_CODE: RedDividendCategoryCode = 'CORE_DIVIDEND'

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

export function normalizeKeyword(value: unknown) {
  if (typeof value !== 'string')
    return ''

  try {
    return decodeURIComponent(value).trim()
  }
  catch {
    return value.trim()
  }
}

export function normalizeCategoryCode(value: unknown): RedDividendCategoryCode {
  const normalized = normalizeKeyword(value).toUpperCase()
  if (
    normalized === 'BOND_LIKE_DIVIDEND'
    || normalized === 'CYCLICAL_DIVIDEND'
    || normalized === 'CORE_DIVIDEND'
  ) {
    return normalized
  }
  return DEFAULT_CATEGORY_CODE
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

export function findCategoryByCode(categories: RedDividendCategory[], categoryCode: RedDividendCategoryCode) {
  return categories.find(item => item.categoryCode === categoryCode) ?? categories[0]
}

export function buildRecommendedStrategy(
  context: RedDividendContextResponse,
  marketView: RedDividendMarketViewResponse,
) {
  return findCategoryByCode(context.categories, marketView.matchedCategoryCode)
}

export function buildOtherStrategies(
  context: RedDividendContextResponse,
  marketView: RedDividendMarketViewResponse,
) {
  return context.categories.filter(item => item.categoryCode !== marketView.matchedCategoryCode)
}

export function buildComparisonItems(
  comparison: RedDividendComparisonResponse,
  context: RedDividendContextResponse,
) {
  return comparison.dividendCompare.items.map((item): RedDividendCompareViewItem => {
    const category = findCategoryByCode(context.categories, item.categoryCode)
    return {
      ...item,
      categoryName: category.categoryName,
      shortTag: category.shortTag,
    }
  })
}

export function buildMappingNodes(
  comparison: RedDividendComparisonResponse,
  context: RedDividendContextResponse,
) {
  return comparison.mapping.nodes.map((item): RedDividendMappingNodeView => {
    const category = findCategoryByCode(context.categories, item.categoryCode)
    return {
      ...item,
      categoryName: category.categoryName,
      shortTag: category.shortTag,
    }
  })
}

export function findExplanation(
  explanations: RedDividendExplanation[],
  categoryCode: RedDividendCategoryCode,
) {
  return explanations.find(item => item.categoryCode === categoryCode) ?? explanations[0]
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

export function getCategoryToneClass(categoryCode: RedDividendCategoryCode) {
  if (categoryCode === 'BOND_LIKE_DIVIDEND')
    return 'text-success'
  if (categoryCode === 'CYCLICAL_DIVIDEND')
    return 'text-warning'
  return 'text-brand'
}

export function getCategoryEnvironmentLabel(categoryCode: RedDividendCategoryCode) {
  if (categoryCode === 'BOND_LIKE_DIVIDEND')
    return '偏防御环境'
  if (categoryCode === 'CYCLICAL_DIVIDEND')
    return '弹性环境'
  return '平衡环境'
}
