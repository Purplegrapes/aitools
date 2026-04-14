export type RedDividendCategoryCode
  = | 'CORE_DIVIDEND'
    | 'BOND_LIKE_DIVIDEND'
    | 'CYCLICAL_DIVIDEND'

export interface ApiEnvelope<T> {
  code: number
  msg?: string
  message?: string
  data: T
}

export interface RedDividendBrief {
  title: string
  summary: string
  strategyCore: string
}

export interface RedDividendCategory {
  categoryCode: RedDividendCategoryCode
  categoryName: string
  shortTag: string
  homeTagLabel: string
  coverImage: string
  description: string
  categoryDesc: string
  tags: string[]
}

export interface MappingAxis {
  label: string
  leftText?: string
  rightText?: string
  bottomText?: string
  topText?: string
}

export interface MappingZone {
  zoneName: string
  categoryCode: RedDividendCategoryCode
}

export interface RedDividendMappingConfig {
  title: string
  tag: string
  xAxis: MappingAxis
  yAxis: MappingAxis
  zones: MappingZone[]
}

export interface RedDividendContextResponse {
  brief: RedDividendBrief
  categories: RedDividendCategory[]
  mappingConfig: RedDividendMappingConfig
}

export interface RedDividendMarketViewResponse {
  summary: string
  matchedCategoryCode: RedDividendCategoryCode
}

export interface RedDividendMetricAttribute {
  label: string
  value: string
}

export interface RedDividendCategoryMetric {
  annualDividendAmountBy100k: number
  attributes: RedDividendMetricAttribute[]
}

export interface RedDividendAssetItem {
  assetId: string
  assetName: string
  tags: string[]
  annualDividendAmountBy100k: number
}

export interface RedDividendStrategyResponse {
  categoryCode: RedDividendCategoryCode
  metric: RedDividendCategoryMetric
  assetList: RedDividendAssetItem[]
}

export interface RedDividendCompareItem {
  categoryCode: RedDividendCategoryCode
  annualDividendAmountBy100k: number
  dividendYield: number
}

export interface RedDividendMappingNode {
  categoryCode: RedDividendCategoryCode
  xValue: number
  yValue: number
}

export interface RedDividendExplanation {
  categoryCode: RedDividendCategoryCode
  summary: string
  reasonPoints: string[]
}

export interface RedDividendComparisonResponse {
  dividendCompare: {
    items: RedDividendCompareItem[]
  }
  mapping: {
    nodes: RedDividendMappingNode[]
    matchedCategoryCode: RedDividendCategoryCode
  }
  explanations: RedDividendExplanation[]
}

export interface RedDividendCompareViewItem extends RedDividendCompareItem {
  categoryName: string
  shortTag: string
}

export interface RedDividendMappingNodeView extends RedDividendMappingNode {
  categoryName: string
  shortTag: string
}
