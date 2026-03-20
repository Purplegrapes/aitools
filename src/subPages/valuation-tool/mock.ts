import type {
  DetailStateMeta,
  FundResult,
  FundResultStatus,
  FundSearchItem,
  FundSearchServiceItem,
  HotFundServiceItem,
  HotSearchFund,
  MarketSentiment,
  MarketSentimentServiceResponse,
  PortfolioFundOption,
  PortfolioInsight,
  PortfolioPosition,
  PortfolioPositionMetrics,
  PortfolioRecognitionDraft,
  PortfolioRecognitionResult,
  PortfolioUnavailableState,
  SearchResultViewModel,
  ValuationWatchlistFund,
  ValuationWatchlistMutationInput,
} from './types'
import {
  buildPortfolioSummary,
  createPositionId,
  getPortfolioUnavailableState,
} from './utils'

export const fallbackMarketSentiment: MarketSentiment = {
  updateTime: '14:05',
  temperature: 32,
  label: '偏冷',
  level: 'cool',
  description: '当前市场情绪整体偏谨慎，热点轮动较快，更适合先看清基金投向，再决定是否继续关注。',
}

export const fallbackHotSearches: HotSearchFund[] = [
  { rank: 1, code: '000300', name: '沪深300ETF联接', changeText: '+2.36%', changeValue: 2.36 },
  { rank: 2, code: '270042', name: '广发纳斯达克100', changeText: '+1.92%', changeValue: 1.92 },
  { rank: 3, code: '009051', name: '易方达中证红利', changeText: '+1.48%', changeValue: 1.48 },
  { rank: 4, code: '000218', name: '华安黄金ETF联接', changeText: '+1.15%', changeValue: 1.15 },
]

const sentimentLabelMap: Record<MarketSentiment['level'], string> = {
  freezing: '极冷',
  cool: '偏冷',
  neutral: '中性',
  hot: '偏热',
}

const sentimentDescriptionMap: Record<MarketSentiment['level'], string> = {
  freezing: '当前市场情绪明显降温，热点持续性偏弱，更适合放慢节奏看清基金投向。',
  cool: '当前市场情绪整体偏谨慎，热点轮动较快，更适合先看清基金投向，再决定是否继续关注。',
  neutral: '当前市场情绪相对平稳，结构性机会和波动会同时存在，适合按计划观察。',
  hot: '当前市场关注度较高，短期波动和情绪放大都更明显，先看清基金定位再行动会更稳。',
}

export function normalizeMarketSentimentResponse(payload?: MarketSentimentServiceResponse | null): MarketSentiment {
  const score = clampScore(payload?.score)
  const level = inferSentimentLevel(score)

  return {
    updateTime: formatMarketPulseTime(payload?.updatedAt),
    temperature: Math.round(score),
    label: sentimentLabelMap[level],
    level,
    description: sentimentDescriptionMap[level],
  }
}

export function normalizeHotFundItem(item: HotFundServiceItem): HotSearchFund {
  const normalizedChangeValue = normalizeHotFundYield(item.yield)

  return {
    rank: item.rank,
    code: item.code,
    name: item.name?.trim() || `基金 ${item.code}`,
    changeText: formatHotFundChange(normalizedChangeValue),
    changeValue: normalizedChangeValue,
  }
}

export const fallbackSearchResults: FundSearchItem[] = [
  {
    code: '110020',
    name: '易方达沪深300ETF联接A',
    tags: ['宽基指数', '被动定投', '大盘风格'],
    summary: '这是一只主要跟着沪深300指数走的基金，适合先从大盘整体开始理解市场。',
    todayTag: '今天偏稳',
  },
  {
    code: '270042',
    name: '广发纳斯达克100ETF联接',
    tags: ['跨境', '海外科技'],
    summary: '它主要跟着美国大型科技公司走，波动感通常会比宽基更明显。',
    todayTag: '今天波动较大',
  },
]

export function findFallbackSearchResult(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword)
    return null

  return fallbackSearchResults.find((item) => {
    return item.code.toLowerCase() === normalizedKeyword
      || item.name.toLowerCase() === normalizedKeyword
  }) || null
}

export function findFallbackSearchResults(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword)
    return []

  return fallbackSearchResults.filter((item) => {
    return item.code.toLowerCase().includes(normalizedKeyword)
      || item.name.toLowerCase().includes(normalizedKeyword)
  })
}

export function normalizeFundSearchServiceItem(item: FundSearchServiceItem): SearchResultViewModel {
  const categoryTag = inferCategoryTag(item.subCategoryId)
  const channelTag = item.channel?.trim()

  const tags = [categoryTag, channelTag].filter(Boolean) as string[]

  return {
    code: item.code,
    name: item.name,
    tags: tags.length ? tags : ['基金'],
    summary: buildSearchSummary(item),
    todayTag: inferTodayTag(tags),
  }
}

export const fallbackFundResult: FundResult = {
  status: 'ok',
  code: '110020',
  name: '易方达沪深300ETF联接A',
  tags: ['宽基指数', '被动定投', '大盘风格'],
  intraday: {
    value: 1.26,
    unit: '%',
    updateTime: '14:05',
    source: 'estimate',
    explanation: '大金融发力带领沪深300走强，所以这只基金今天看起来也更偏强一些。',
  },
  quickFacts: {
    oneYearPerformance: '12.80%',
    maxDrawdown: '-35.40%',
    feeRate: '0.60%',
  },
  definition: '它主要跟着沪深300指数走。你可以把它理解成：一次买入一篮子中国核心大盘公司。',
  targetIndex: '沪深300指数',
  marketCoverage: 'A股核心资产',
  riskDescription: '日常会跟着市场一起波动，适合能接受中等起伏、又不想自己挑股票的人。',
  targetAudience: '适合想先用一只基金理解A股大盘，而不是上来就研究复杂行业轮动的新手。',
  disclaimer: '上述内容仅做理解参考，不构成投资建议。',
  reasonList: [
    '今天大盘权重股更有支撑，所以宽基相关基金相对更稳。',
    '它跟踪的是大盘核心公司，情绪通常没有主题基金那么跳。',
    '短期表现只能辅助理解市场，不能替代长期判断。',
  ],
}

const fallbackFundProfiles: Record<string, Partial<FundResult>> = {
  '000300': {
    code: '000300',
    name: '沪深300ETF联接',
    targetAudience: '适合刚开始接触基金、想先理解A股大盘整体是什么感觉的新手。',
  },
  '270042': {
    code: '270042',
    name: '广发纳斯达克100ETF联接',
    marketCoverage: '海外科技龙头',
    targetIndex: '纳斯达克100指数',
    definition: '它主要跟着美国大型科技公司走。你可以把它理解成：把海外科技核心公司打包放进一只基金里。',
    riskDescription: '因为科技权重更高，短期波动通常会比宽基更明显，心态上要更能接受起伏。',
    targetAudience: '适合已经知道自己想看看海外科技方向，但又不想逐只研究美股公司的用户。',
  },
  '009051': {
    code: '009051',
    name: '易方达中证红利',
    marketCoverage: '红利风格资产',
    targetIndex: '中证红利指数',
    definition: '它主要偏向分红能力更强的公司。你可以把它理解成：优先挑现金流和分红相对稳定的一篮子股票。',
    riskDescription: '通常没有高弹性主题那么跳，但依旧会跟着市场一起起伏。',
  },
  '000218': {
    code: '000218',
    name: '华安黄金ETF联接',
    marketCoverage: '黄金资产',
    targetIndex: '黄金ETF',
    definition: '它主要跟着黄金价格走。你可以把它理解成：不用自己买实物金，也能间接跟踪黄金波动。',
    riskDescription: '遇到市场避险情绪升温时可能更受关注，但波动也会受到国际价格影响。',
  },
}

export const detailStateMetaMap: Record<FundResultStatus | 'error', DetailStateMeta> = {
  loading: {
    title: '结果还在生成中',
    description: '正在根据基金资料和参考行情整理更好懂的说明，请稍等一下再刷新。',
    primaryAction: '返回首页',
  },
  not_found: {
    title: '暂时没找到这只基金',
    description: '可以试试输入更短的基金名字，或者换成基金代码重新搜索。',
    primaryAction: '重新搜索',
  },
  missing_value: {
    title: '这只基金还有部分关键数据待补齐',
    description: '我们先不贸然给你结论，建议换一只基金看看，或者稍后再来。',
    primaryAction: '回到首页',
  },
  ok: {
    title: '',
    description: '',
    primaryAction: '',
  },
  error: {
    title: '网络有点忙，暂时没拿到结果',
    description: '你仍然可以先返回首页看看热搜基金，或者稍后再试一次。',
    primaryAction: '返回首页',
  },
}

export function getFallbackFundResult(code: string): FundResult {
  const profile = fallbackFundProfiles[code]
  if (!profile) {
    return {
      ...fallbackFundResult,
      code: code || fallbackFundResult.code,
      name: code ? `基金 ${code}` : fallbackFundResult.name,
    }
  }

  return {
    ...fallbackFundResult,
    ...profile,
  }
}

export function normalizeSearchResult(item: FundSearchItem): SearchResultViewModel {
  return {
    ...item,
    todayTag: item.todayTag || inferTodayTag(item.tags),
  }
}

function inferTodayTag(tags: string[]) {
  const tagText = tags.join(' ')
  if (tagText.includes('债') || tagText.includes('红利'))
    return '今天偏稳'
  if (tagText.includes('黄金') || tagText.includes('科技'))
    return '今天波动较大'
  return '今天偏弱'
}

function clampScore(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return fallbackMarketSentiment.temperature
  return Math.max(0, Math.min(100, Number(value)))
}

function inferSentimentLevel(score: number): MarketSentiment['level'] {
  if (score < 20)
    return 'freezing'
  if (score < 45)
    return 'cool'
  if (score < 70)
    return 'neutral'
  return 'hot'
}

function formatMarketPulseTime(updatedAt?: string | null) {
  if (!updatedAt)
    return fallbackMarketSentiment.updateTime
  return updatedAt.replace('T', ' ').slice(0, 16)
}

function normalizeHotFundYield(yieldValue: number) {
  if (Number.isNaN(Number(yieldValue)))
    return null

  const numericValue = Number(yieldValue)
  if (Math.abs(numericValue) <= 1)
    return numericValue * 100

  return numericValue
}

function formatHotFundChange(yieldValue?: number | null) {
  if (yieldValue === null || yieldValue === undefined || Number.isNaN(Number(yieldValue)))
    return '--'

  const sign = yieldValue > 0 ? '+' : ''
  return `${sign}${Number(yieldValue).toFixed(2)}%`
}

function inferCategoryTag(subCategoryId?: string | null) {
  const rawValue = subCategoryId?.trim()
  if (!rawValue)
    return '基金'

  const normalizedValue = rawValue.toLowerCase()

  if (normalizedValue.includes('bond') || normalizedValue.includes('债'))
    return '债券'
  if (normalizedValue.includes('gold') || normalizedValue.includes('黄金'))
    return '黄金'
  if (normalizedValue.includes('hongli') || normalizedValue.includes('dividend') || normalizedValue.includes('红利'))
    return '红利'
  if (normalizedValue.includes('nasdaq') || normalizedValue.includes('oversea') || normalizedValue.includes('qdii') || normalizedValue.includes('海外'))
    return '跨境'
  if (normalizedValue.includes('broad') || normalizedValue.includes('index') || normalizedValue.includes('宽基'))
    return '宽基'

  return rawValue
}

function buildSearchSummary(item: FundSearchServiceItem) {
  const channelText = item.channel?.trim()
  const categoryText = inferCategoryTag(item.subCategoryId)

  if (channelText && categoryText !== '基金')
    return `这是一只${categoryText}基金，当前可在${channelText}等渠道看到相关资料。`
  if (categoryText !== '基金')
    return `这是一只${categoryText}基金，适合先从基金类型和跟踪方向开始理解。`
  if (channelText)
    return `这只基金当前可在${channelText}等渠道查询到基础资料。`

  return '这只基金已搜到基础资料，你可以先进入详情页查看更完整的解释。'
}

const VALUATION_WATCHLIST_STORAGE_KEY = 'valuationToolWatchlist'

const fallbackWatchlistCatalog: Record<string, ValuationWatchlistFund> = {
  '110020': {
    code: '110020',
    name: '易方达沪深300ETF联接A',
    realtimeNav: 1.1824,
    dailyChange: 1.26,
    updateTime: '14:05',
    watchlisted: true,
  },
  '270042': {
    code: '270042',
    name: '广发纳斯达克100ETF联接',
    realtimeNav: 1.4386,
    dailyChange: -0.84,
    updateTime: '14:05',
    watchlisted: true,
  },
  '009051': {
    code: '009051',
    name: '易方达中证红利',
    realtimeNav: 1.0973,
    dailyChange: 0.36,
    updateTime: '14:05',
    watchlisted: true,
  },
}

export function getFallbackWatchlistFunds() {
  const storedList = readStoredWatchlist()
  if (storedList?.length)
    return storedList
  return Object.values(fallbackWatchlistCatalog)
}

export function saveFallbackWatchlistFund(input: ValuationWatchlistMutationInput) {
  const currentList = getFallbackWatchlistFunds()
  const nextItem: ValuationWatchlistFund = {
    code: input.code,
    name: input.name || fallbackWatchlistCatalog[input.code]?.name || `基金 ${input.code}`,
    realtimeNav: fallbackWatchlistCatalog[input.code]?.realtimeNav ?? null,
    dailyChange: input.dailyChange ?? fallbackWatchlistCatalog[input.code]?.dailyChange ?? null,
    updateTime: input.updateTime || fallbackWatchlistCatalog[input.code]?.updateTime || '14:05',
    watchlisted: true,
  }

  const nextList = [...currentList.filter(item => item.code !== input.code), nextItem]
  writeStoredWatchlist(nextList)
  return nextItem
}

export function removeFallbackWatchlistFund(code: string) {
  const nextList = getFallbackWatchlistFunds().filter(item => item.code !== code)
  writeStoredWatchlist(nextList)
  return nextList
}

function readStoredWatchlist() {
  try {
    const storedValue = uni.getStorageSync(VALUATION_WATCHLIST_STORAGE_KEY)
    if (storedValue === '' || storedValue === undefined || storedValue === null)
      return null
    if (!Array.isArray(storedValue))
      return null

    return storedValue.map((item) => {
      return {
        code: item.code,
        name: item.name,
        realtimeNav: typeof item.realtimeNav === 'number' ? item.realtimeNav : null,
        dailyChange: typeof item.dailyChange === 'number' ? item.dailyChange : null,
        updateTime: typeof item.updateTime === 'string' ? item.updateTime : '14:05',
        watchlisted: true,
      } satisfies ValuationWatchlistFund
    })
  }
  catch {
    return null
  }
}

function writeStoredWatchlist(items: ValuationWatchlistFund[]) {
  uni.setStorageSync(VALUATION_WATCHLIST_STORAGE_KEY, items)
}

const PORTFOLIO_STORAGE_KEY = 'valuationToolPortfolioPositions'

export const fallbackPortfolioFundCatalog: PortfolioFundOption[] = [
  {
    code: '110020',
    name: '易方达沪深300ETF联接A',
    category: '宽基指数',
    tag: '稳健底仓',
    estimatedNav: 1.1824,
    dailyChangeRate: 1.26,
    statusLabel: '偏强',
  },
  {
    code: '270042',
    name: '广发纳斯达克100ETF联接',
    category: '海外科技',
    tag: '高波动',
    estimatedNav: 1.468,
    dailyChangeRate: -0.84,
    statusLabel: '震荡',
  },
  {
    code: '009051',
    name: '易方达中证红利',
    category: '红利防守',
    tag: '分红偏稳',
    estimatedNav: 1.0631,
    dailyChangeRate: 0.36,
    statusLabel: '偏强',
  },
  {
    code: '000218',
    name: '华安黄金ETF联接',
    category: '黄金资产',
    tag: '避险关注',
    estimatedNav: 1.2982,
    dailyChangeRate: -0.22,
    statusLabel: '偏弱',
  },
]

const fallbackPortfolioSeed: PortfolioPosition[] = [
  {
    id: createPositionId({ code: '110020', shares: 6800, costNav: 1.12 }),
    code: '110020',
    name: '易方达沪深300ETF联接A',
    shares: 6800,
    costNav: 1.12,
  },
  {
    id: createPositionId({ code: '270042', shares: 2200, costNav: 1.38 }),
    code: '270042',
    name: '广发纳斯达克100ETF联接',
    shares: 2200,
    costNav: 1.38,
  },
  {
    id: createPositionId({ code: '009051', shares: 3600, costNav: 1.01 }),
    code: '009051',
    name: '易方达中证红利',
    shares: 3600,
    costNav: 1.01,
  },
]

export function searchFallbackPortfolioFunds(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword)
    return [] as PortfolioFundOption[]

  return fallbackPortfolioFundCatalog.filter((item) => {
    return item.code.includes(normalizedKeyword)
      || item.name.toLowerCase().includes(normalizedKeyword)
      || item.category.toLowerCase().includes(normalizedKeyword)
  })
}

export function getFallbackPortfolioPositions() {
  const storedPositions = readStoredPortfolio()
  if (storedPositions)
    return storedPositions
  return []
}

export function saveFallbackPortfolioPosition(position: PortfolioPosition) {
  const nextPositions = [
    ...getFallbackPortfolioPositions().filter(item => item.id !== position.id),
    position,
  ]
  writeStoredPortfolio(nextPositions)
  return position
}

export function updateFallbackPortfolioPosition(position: PortfolioPosition) {
  const nextPositions = getFallbackPortfolioPositions().map((item) => {
    return item.id === position.id ? position : item
  })
  writeStoredPortfolio(nextPositions)
  return position
}

export function removeFallbackPortfolioPosition(id: string) {
  const nextPositions = getFallbackPortfolioPositions().filter(item => item.id !== id)
  writeStoredPortfolio(nextPositions)
  return nextPositions
}

export function getFallbackPortfolioMetrics(positions: PortfolioPosition[]): PortfolioPositionMetrics[] {
  return positions.map((position) => {
    const catalog = fallbackPortfolioFundCatalog.find(item => item.code === position.code)
    const currentNav = catalog?.estimatedNav ?? null
    const currentAmount = currentNav ? position.shares * currentNav : 0
    const costAmount = position.shares * position.costNav
    const cumulativeProfit = currentAmount - costAmount
    const cumulativeProfitRate = costAmount > 0 ? (cumulativeProfit / costAmount) * 100 : null
    const dailyChangeRate = catalog?.dailyChangeRate ?? null
    const previousNav = currentNav && dailyChangeRate !== null
      ? currentNav / (1 + dailyChangeRate / 100)
      : null
    const todayProfit = previousNav !== null && currentNav !== null
      ? position.shares * (currentNav - previousNav)
      : null

    return {
      id: position.id,
      code: position.code,
      name: position.name,
      shares: position.shares,
      costNav: position.costNav,
      currentNav,
      currentAmount,
      costAmount,
      cumulativeProfit,
      cumulativeProfitRate,
      todayProfit,
      dailyChangeRate,
      statusLabel: catalog?.statusLabel || '震荡',
      note: buildPortfolioNote(position.costNav, currentNav, catalog?.tag),
      updateTime: '14:05',
    } satisfies PortfolioPositionMetrics
  })
}

export function getFallbackPortfolioInsight(metrics: PortfolioPositionMetrics[]): PortfolioInsight {
  if (!metrics.length) {
    return {
      title: '先添加几只基金',
      description: '添加持仓后，你就能在这里快速看到整体赚亏和今天的大概变化。',
    }
  }

  const strongest = [...metrics].sort((a, b) => b.cumulativeProfit - a.cumulativeProfit)[0]
  const weakest = [...metrics].sort((a, b) => a.cumulativeProfit - b.cumulativeProfit)[0]
  const focus = [...metrics].sort((a, b) => Math.abs(b.todayProfit ?? 0) - Math.abs(a.todayProfit ?? 0))[0]

  if (focus?.todayProfit && focus.todayProfit > 0) {
    return {
      title: '今天你的组合有明显抬升',
      description: `当前组合里，${focus.name} 对今日盈亏贡献更明显；${strongest?.name || focus.name} 仍是累计收益靠前的基金，值得继续关注节奏变化。`,
      focusFundName: focus.name,
    }
  }

  return {
    title: '今天更适合看组合结构',
    description: `${weakest?.name || focus?.name || '部分基金'} 暂时拖累了组合表现，当前更值得先看它的波动来源，再结合 ${strongest?.name || '表现较稳的基金'} 一起判断整体节奏。`,
    focusFundName: weakest?.name,
  }
}

export function getFallbackPortfolioUnavailableState(): PortfolioUnavailableState {
  return getPortfolioUnavailableState()
}

export function getFallbackPortfolioRecognitionResult(fileNames: string[]): PortfolioRecognitionResult {
  const normalizedFileNames = fileNames.length ? fileNames : ['持仓截图-1.png']

  return {
    items: [
      {
        id: `ocr-${normalizedFileNames[0]}-1`,
        sourceImage: normalizedFileNames[0],
        name: '易方达沪深300ETF联接A',
        code: '110020',
        holdingAmount: '8056.32',
        holdingProfit: '440.18',
        status: 'ready',
      },
      {
        id: `ocr-${normalizedFileNames[0]}-2`,
        sourceImage: normalizedFileNames[0],
        name: '广发纳斯达克100联接',
        holdingAmount: '3280.50',
        holdingProfit: '-128.44',
        status: 'needs_fund_match',
        issue: '基金名称识别到了，但还没匹配到唯一基金代码。',
      },
      {
        id: `ocr-${normalizedFileNames[Math.min(1, normalizedFileNames.length - 1)]}-3`,
        sourceImage: normalizedFileNames[Math.min(1, normalizedFileNames.length - 1)],
        name: '易方达中证红利',
        code: '009051',
        holdingAmount: '',
        holdingProfit: '86.20',
        status: 'needs_review',
        issue: '持有金额识别不完整，请补充后再导入。',
      },
    ] satisfies PortfolioRecognitionDraft[],
  }
}

function buildPortfolioNote(costNav: number, currentNav: number | null, tag?: string) {
  if (currentNav === null)
    return '当前暂无实时估值，可继续关注累计收益表现。'

  const delta = currentNav - costNav
  if (delta > 0.03)
    return `${tag || '当前表现偏强'}，已经明显高于持仓成本。`
  if (delta < -0.03)
    return `${tag || '波动偏弱'}，当前仍在成本线下方，可继续观察。`
  return `${tag || '当前节奏平稳'}，离持仓成本不远。`
}

function readStoredPortfolio() {
  try {
    const storedValue = uni.getStorageSync(PORTFOLIO_STORAGE_KEY)
    if (storedValue === '' || storedValue === undefined || storedValue === null)
      return null
    if (!Array.isArray(storedValue))
      return null

    return storedValue.map((item) => {
      return {
        id: item.id,
        code: item.code,
        name: item.name,
        shares: Number(item.shares),
        costNav: Number(item.costNav),
      } satisfies PortfolioPosition
    }).filter(item => item.id && item.code && item.name && item.shares > 0 && item.costNav > 0)
  }
  catch {
    return null
  }
}

function writeStoredPortfolio(items: PortfolioPosition[]) {
  uni.setStorageSync(PORTFOLIO_STORAGE_KEY, items)
}

export const fallbackPortfolioSummary = buildPortfolioSummary(getFallbackPortfolioMetrics(fallbackPortfolioSeed))
