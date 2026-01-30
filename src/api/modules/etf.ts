/**
 * ETF 相关 API 接口
 */
import { alovaInstance } from '../core/instance'

/**
 * 微信扫码登录
 */
export function wechatBind(key: string) {
  return alovaInstance.Get('/api/v1/user/wechat/bind', {
    params: { key },
  })
}

/**
 * 实时价格
 */
export function realtime(params?: Record<string, any>) {
  return alovaInstance.Post('/api/realtime', params)
}

/**
 * 获取 tab 列表
 */
export function getTabList() {
  return alovaInstance.Get('/api/v1/category/list')
}

/**
 * 数据截止日期
 */
export function getAshare() {
  return alovaInstance.Get('/api/common/date/data-source/ashare')
}

/**
 * 全量基金指数
 */
export function etfInfoList() {
  return alovaInstance.Get('/api/v1/etf/info/list')
}

/**
 * 规模、折溢价率等因子数据
 * @param params { securityCodes, factorCodes, securityType }
 */
export function factorValue(params: {
  securityCodes: string[]
  factorCodes: string[]
  securityType: string
}) {
  return alovaInstance.Post('/api/common/factor-value', params)
}

/**
 * 添加自选
 */
export function watchlistAdd(params: Record<string, any>) {
  return alovaInstance.Post('/api/v1/watchlist/add', params)
}

/**
 * 删除自选
 */
export function watchlistDel(code: string) {
  return alovaInstance.Delete(`/api/v1/watchlist/${code}`)
}

/**
 * 估值详情
 */
export function valuationDetail() {
  return alovaInstance.Get('/djapi/fundx/base/vip/valuation/show/detail')
}

/**
 * 估值展示
 */
export function valuationShow(id: string | number) {
  return alovaInstance.Get('/djapi/fundx/base/vip/valuation/show', {
    params: { id: String(id), source: 'lsd' },
  })
}

/**
 * 历史行情
 * @param params { securityCode, factorCodes, from, to }
 */
export function factorExposure(params: {
  securityCode: string
  factorCodes: string[]
  from: string
  to: string
}) {
  return alovaInstance.Post('/api/common/factor-exposure', params)
}

/**
 * 实时分钟行情
 */
export function realtimeLine(code: string) {
  return alovaInstance.Get(`/api/realtime/k-line/${code}`, {
    params: { assetType: 'ETF', frequency: 'MINUTE' },
  })
}

/**
 * 基金详情
 */
export function etfInfo(code: string) {
  return alovaInstance.Get(`/api/v1/etf/info/${code}`)
}

/**
 * 显示报价配置
 */
export function showQuote() {
  return alovaInstance.Get('/api/v1/config', {
    params: { k: 'show_quote' },
  })
}

// ==================== 基金简况相关 API ====================

/**
 * 获取基金经理信息
 * @param code ETF代码
 */
export function fundManager(code: string) {
  return alovaInstance.Get(`/api/v1/etf/manager/${code}`)
}

/**
 * 获取核心指标
 * @param code ETF代码
 */
export function coreIndicators(code: string) {
  return alovaInstance.Get(`/api/v1/etf/indicators/${code}`)
}

/**
 * 获取资产结构
 * @param code ETF代码
 */
export function assetStructure(code: string) {
  return alovaInstance.Get(`/api/v1/etf/asset-structure/${code}`)
}
