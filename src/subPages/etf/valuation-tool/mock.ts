import type {
  DetailStateMeta,
  FundResult,
  FundResultStatus,
  FundSearchItem,
  HotSearchFund,
  MarketSentiment,
  SearchResultViewModel,
} from './types'

export const fallbackMarketSentiment: MarketSentiment = {
  updateTime: '14:05',
  temperature: 32,
  label: '偏冷',
  level: 'cool',
  description: '当前市场情绪整体偏谨慎，热点轮动较快，更适合先看清基金投向，再决定是否继续关注。',
}

export const fallbackHotSearches: HotSearchFund[] = [
  { rank: 1, code: '000300', name: '沪深300ETF联接', tag: '宽基稳健' },
  { rank: 2, code: '270042', name: '广发纳斯达克100', tag: '海外科技' },
  { rank: 3, code: '009051', name: '易方达中证红利', tag: '防御收息' },
  { rank: 4, code: '000218', name: '华安黄金ETF联接', tag: '抗通胀' },
]

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
    feeRate: '0.60%',
    feeExplanation: '长期拿着的成本属于中等水平。',
    maxDrawdown: '-35.40%',
    drawdownExplanation: '历史上最难受的时候，大概跌过三成多。',
    oneYearReturn: '+12.50%',
    returnExplanation: '过去一年整体表现偏强，但不代表之后会一直这样。',
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
