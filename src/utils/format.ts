/**
 * 格式化相关工具函数
 */

/**
 * 格式化百分比
 * @param value 数值
 * @param decimals 小数位数，默认2
 * @returns 格式化后的字符串
 */
export function formatPercentage(value: number | string | undefined, decimals = 2): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const num = Number(value)
  if (Number.isNaN(num))
    return '--'
  const sign = num > 0 ? '+' : ''
  return `${sign}${num.toFixed(decimals)}%`
}

/**
 * 格式化资产金额
 * @param value 数值（单位：元）
 * @returns 格式化后的字符串
 */
export function formatAssets(value: number | string | undefined): string {
  if (value === null || value === undefined || value === '')
    return '--'
  const num = Number(value)
  if (Number.isNaN(num))
    return '--'

  // 万
  if (num >= 10000 && num < 100000000) {
    return `${(num / 10000).toFixed(2)}万`
  }
  // 亿
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}亿`
  }
  return num.toFixed(2)
}

/**
 * 计算日期之前的年份/月份日期
 * @param endDate 结束日期（格式：YYYY-MM-DD）
 * @returns 包含各时间段的起始日期
 */
export function calculatePreviousDates(endDate: string): Record<string, string> {
  const end = new Date(endDate)

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 1个月前
  const oneMonthAgo = new Date(end)
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  // 3个月前
  const threeMonthsAgo = new Date(end)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  // 6个月前
  const sixMonthsAgo = new Date(end)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // 1年前
  const oneYearAgo = new Date(end)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // 3年前
  const threeYearsAgo = new Date(end)
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

  return {
    day: formatDate(end), // 当天
    month1: formatDate(oneMonthAgo),
    month3: formatDate(threeMonthsAgo),
    month6: formatDate(sixMonthsAgo),
    year1: formatDate(oneYearAgo),
    year3: formatDate(threeYearsAgo),
  }
}

/**
 * 格式化涨跌幅数据
 * 为历史数据添加涨跌幅字段
 * @param data 历史数据数组
 * @returns 添加了涨跌幅字段的数据数组
 */
export function formatRiseFall(data: Array<{ f_mkt_close_price_adj: number, name: string }>) {
  if (!data || data.length === 0)
    return []

  return data.map((item, index) => {
    let riseFall = 0
    if (index > 0 && data[index - 1].f_mkt_close_price_adj) {
      riseFall = item.f_mkt_close_price_adj / data[index - 1].f_mkt_close_price_adj - 1
    }
    return {
      ...item,
      riseFall,
    }
  })
}

/**
 * 获取涨跌颜色
 * @param value 数值
 * @returns 颜色值
 */
export function getChangeColor(value: number | string | undefined): string {
  if (value === null || value === undefined || value === '')
    return '#999'
  const num = Number(value)
  if (Number.isNaN(num))
    return '#999'
  if (num > 0)
    return '#ff3b30' // 红色
  if (num < 0)
    return '#28cd41' // 绿色
  return '#333'
}
