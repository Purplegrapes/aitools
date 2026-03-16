import type { DiscoveryFundValuation, FundIntraday, FundResultStatus } from './types'

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

export function createSearchPath(keyword: string) {
  return `/subPages/etf/valuation-tool/search?q=${encodeURIComponent(keyword.trim())}`
}

export function createResultPath(code: string) {
  return `/subPages/etf/valuation-tool/result?code=${encodeURIComponent(code)}`
}

export function isFundResultStatus(value: unknown): value is FundResultStatus {
  return value === 'ok' || value === 'not_found' || value === 'missing_value' || value === 'loading'
}

export function formatIntradayValue(intraday?: FundIntraday) {
  if (!intraday)
    return '--'

  const sign = intraday.value > 0 ? '+' : ''
  return `${sign}${intraday.value.toFixed(2)}${intraday.unit}`
}

export function getIntradayTone(intraday?: FundIntraday) {
  if (!intraday || intraday.value === 0)
    return 'text-primary'
  return intraday.value > 0 ? 'text-danger' : 'text-success'
}

export function mapValuationToIntraday(valuation?: DiscoveryFundValuation | null): FundIntraday | undefined {
  if (!valuation)
    return undefined

  const intradayRatio = Number(valuation.ratio)
  const estimatedValue = Number(valuation.valuation)
  const netValueChange = Number(valuation.offChangeNetValue)

  if ([intradayRatio, estimatedValue, netValueChange].some(Number.isNaN))
    return undefined

  return {
    value: intradayRatio * 100,
    unit: '%',
    updateTime: formatCurrentTime(),
    source: 'estimate',
    explanation: `当前估算净值约为 ${estimatedValue.toFixed(4)}，较上一交易日净值变动 ${formatSignedNumber(netValueChange, 4)}，对应今日估算涨跌 ${formatSignedNumber(intradayRatio * 100, 2)}%。`,
  }
}

function formatCurrentTime() {
  const currentDate = new Date()
  const hours = `${currentDate.getHours()}`.padStart(2, '0')
  const minutes = `${currentDate.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

function formatSignedNumber(value: number, fractionDigits: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(fractionDigits)}`
}
