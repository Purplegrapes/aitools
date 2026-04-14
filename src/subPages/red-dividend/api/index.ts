import type {
  ApiEnvelope,
  RedDividendCategoryCode,
  RedDividendComparisonResponse,
  RedDividendContextResponse,
  RedDividendMarketViewResponse,
  RedDividendStrategyResponse,
} from '../types'
import { alovaInstance } from '@/api/core/instance'

export function getRedDividendContext() {
  return alovaInstance.Get<ApiEnvelope<RedDividendContextResponse>>('/tools-api/api/redline/context', {
    meta: {
      suppressErrorToast: true,
    },
  })
}

export function getRedDividendMarketView() {
  return alovaInstance.Get<ApiEnvelope<RedDividendMarketViewResponse>>('/tools-api/api/redline/market-view', {
    meta: {
      suppressErrorToast: true,
    },
  })
}

export function getRedDividendStrategy(categoryCode: RedDividendCategoryCode) {
  return alovaInstance.Get<ApiEnvelope<RedDividendStrategyResponse>>(`/tools-api/api/redline/strategies/${encodeURIComponent(categoryCode)}`, {
    meta: {
      suppressErrorToast: true,
    },
  })
}

export function getRedDividendComparison() {
  return alovaInstance.Get<ApiEnvelope<RedDividendComparisonResponse>>('/tools-api/api/redline/strategy-comparison', {
    meta: {
      suppressErrorToast: true,
    },
  })
}
