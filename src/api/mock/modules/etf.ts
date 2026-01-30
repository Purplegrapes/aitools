import type { AssetStructure, CoreIndicators, FundManager } from '@/subPages/etf/types'
/*
 * @Description: ETF 基金简况 Mock 数据
 */
import { defineMock } from '@alova/mock'

// Mock 数据
export const mockFundManager: FundManager = {
  name: '张伟',
  education: '硕士',
  experience: 8,
  manageAssets: 50000000000, // 500亿
  manageFunds: 15,
  startDate: '2020-01-15',
  intro: '拥有8年证券从业经验，擅长指数基金管理，曾管理多只宽基指数ETF和行业主题ETF，管理经验丰富。',
}

export const mockCoreIndicators: CoreIndicators = {
  // 规模指标
  netAssets: 50000000000,
  dailyTurnover: 1000000000,

  // 业绩指标
  return1w: 0.025,
  return1m: 0.068,
  return3m: 0.125,
  return6m: 0.089,
  return1y: 0.156,
  return3y: 0.423,
  returnYtd: 0.032,

  // 估值指标
  pe: 11.5,
  pb: 1.35,
  dividendYield: 0.028,
  profitYield: 0.087,

  // 风险指标
  volatility: 0.18,
  maxDrawdown: -0.23,
  sharpeRatio: 1.2,
}

export const mockAssetStructure: AssetStructure = {
  assetAllocation: [
    { name: '股票', value: 480, percentage: 96 },
    { name: '现金', value: 15, percentage: 3 },
    { name: '其他', value: 5, percentage: 1 },
  ],
  industryAllocation: [
    { name: '金融', value: 120, percentage: 24 },
    { name: '科技', value: 98, percentage: 19.6 },
    { name: '消费', value: 85, percentage: 17 },
    { name: '工业', value: 65, percentage: 13 },
    { name: '医疗', value: 52, percentage: 10.4 },
    { name: '能源', value: 35, percentage: 7 },
    { name: '材料', value: 28, percentage: 5.6 },
    { name: '公用事业', value: 17, percentage: 3.4 },
  ],
  topHoldings: [
    { name: '贵州茅台', value: 25, percentage: 5 },
    { name: '宁德时代', value: 22, percentage: 4.4 },
    { name: '中国平安', value: 20, percentage: 4 },
    { name: '招商银行', value: 18, percentage: 3.6 },
    { name: '五粮液', value: 16, percentage: 3.2 },
    { name: '美的集团', value: 14, percentage: 2.8 },
    { name: '比亚迪', value: 12, percentage: 2.4 },
    { name: '长江电力', value: 10, percentage: 2 },
    { name: '恒瑞医药', value: 9, percentage: 1.8 },
    { name: '兴业银行', value: 8, percentage: 1.6 },
  ],
}

export default defineMock({
  // 获取基金经理信息
  '[GET]/api/v1/etf/manager/{code}': ({ params }) => {
    console.log('[Mock] GET /api/v1/etf/manager/', params.code)
    return {
      code: 0,
      data: mockFundManager,
      message: 'success',
    }
  },

  // 获取核心指标
  '[GET]/api/v1/etf/indicators/{code}': ({ params }) => {
    console.log('[Mock] GET /api/v1/etf/indicators/', params.code)
    return {
      code: 0,
      data: mockCoreIndicators,
      message: 'success',
    }
  },

  // 获取资产结构
  '[GET]/api/v1/etf/asset-structure/{code}': ({ params }) => {
    console.log('[Mock] GET /api/v1/etf/asset-structure/', params.code)
    return {
      code: 0,
      data: mockAssetStructure,
      message: 'success',
    }
  },
}, true)
