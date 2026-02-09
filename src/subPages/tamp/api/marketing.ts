/**
 * TAMP 营销页 API
 */
import { alovaInstance } from '@/api/core/instance'

export interface DisplayContentOption {
  type: 'HOLD_TIME' | 'INVEST_TARGET' | 'ALLOCATION_PLAN' | 'INVEST_PLAN'
  description: string
}

export interface AgencyConfigView {
  agencyCode: string
  agencyName?: string
  jumpUrl?: string
  order: number
  isDirectSale?: boolean
}

export interface MarketingPageView {
  id?: number
  shopId: string
  portfolioCode: string
  portfolioName: string
  riskLevel?: string
  shareTitle?: string
  displayContents: DisplayContentOption[]
  selectedDisplayContents: Array<'HOLD_TIME' | 'INVEST_TARGET' | 'ALLOCATION_PLAN' | 'INVEST_PLAN'>
  agencies: AgencyConfigView[]
  auditStatus?: 'UNCOMMITED' | 'PENDING' | 'RUNNING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  auditId?: number
}

export interface CommonResultMarketingPageView {
  code: 0
  data?: MarketingPageView
  msg?: string
}

/**
 * C端-查询营销页配置
 */
export function queryMarketingPage(params: {
  portfolioCode: string
  shopId: string
}) {
  return alovaInstance.Get<CommonResultMarketingPageView>('/app-api/investment-portfolio/marketing-page', {
    params,
  })
}

/**
 * C端-预览营销页数据
 */
export function previewMarketingPage(params: {
  portfolioCode: string
  shopId: string
}) {
  return alovaInstance.Get<CommonResultMarketingPageView>('/app-api/investment-portfolio/marketing-page/preview', {
    params,
  })
}
