import type { AssetDetail, FactorHistoryResponse } from '@/subPages/shixi-guide/types'
/**
 * 资产相关 Mock 数据
 */
import { defineMock } from '@alova/mock'

// Mock 资产详情数据
export const mockAssetDetail: AssetDetail = {
  code: '510300',
  name: '华泰柏瑞沪深300ETF',
  asset_type: 'ETF',
  risk_level: '中风险',
  dividend_rate: 2.85,
  fund_nav_unit: 4.523,
  management_company: '华泰柏瑞基金管理有限公司',
  establishment_date: '2012-05-28',
  fund_manager: '柳军',
  monthly_dividend_investment: 42105.26,
  description: '本基金采用指数化投资策略，紧密跟踪沪深300指数，追求跟踪偏离度和跟踪误差最小化。适合长期持有获取市场平均收益，同时通过股息分红产生现金流。',
  updated_at: '2025-01-15',
}

// 生成股息率历史数据（近90天）
function generateDividendHistory(days: number) {
  const data: Array<{ date: string, dividend_rate: number }> = []
  const today = new Date()
  let baseRate = 2.5

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // 模拟股息率波动
    baseRate += (Math.random() - 0.5) * 0.3
    baseRate = Math.max(1.8, Math.min(3.5, baseRate))

    data.push({
      date: dateStr,
      dividend_rate: Number.parseFloat(baseRate.toFixed(2)),
    })
  }

  return data
}

// // 生成余额宝对比数据（近90天）
// function generateYuEBaoHistory(days: number) {
//   const data: Array<{ date: string, rate: number }> = []
//   const today = new Date()

//   for (let i = days - 1; i >= 0; i--) {
//     const date = new Date(today)
//     date.setDate(date.getDate() - i)
//     const dateStr = date.toISOString().split('T')[0]

//     // 余额宝收益率相对稳定，在 1.5% - 2.0% 之间波动
//     const rate = 1.5 + Math.random() * 0.5

//     data.push({
//       date: dateStr,
//       rate: Number.parseFloat(rate.toFixed(2)),
//     })
//   }

//   return data
// }

export default defineMock({
  // 获取资产详情
  '[GET]/api/assets/{code}/detail': ({ params }) => {
    console.log('[Mock] GET /api/assets/', params.code, '/detail')
    return {
      code: 0,
      data: mockAssetDetail,
      message: 'success',
    }
  },

  // 获取因子历史数据
  '[GET]/api/assets/factors': ({ query }) => {
    console.log('[Mock] GET /api/assets/factors', query)
    const days = Math.ceil((new Date(query.end_date as string).getTime() - new Date(query.start_date as string).getTime()) / (1000 * 60 * 60 * 24))
    const dividendHistory = generateDividendHistory(days)

    const response: FactorHistoryResponse = {
      data: [
        {
          code: query.codes as string,
          date: query.end_date as string,
          factors: dividendHistory,
        },
      ],
      total: dividendHistory.length,
    }

    return {
      code: 0,
      data: response,
      message: 'success',
    }
  },
}, true)
