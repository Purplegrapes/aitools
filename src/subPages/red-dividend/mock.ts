import type {
  RedDividendCategoryCode,
  RedDividendComparisonResponse,
  RedDividendContextResponse,
  RedDividendMarketViewResponse,
  RedDividendStrategyResponse,
} from './types'

const coverGradientMap: Record<RedDividendCategoryCode, string> = {
  CORE_DIVIDEND: 'linear-gradient(135deg, #18324d 0%, #335c7a 52%, #9cc8e4 100%)',
  BOND_LIKE_DIVIDEND: 'linear-gradient(135deg, #20402f 0%, #3d6c54 52%, #b9dbc4 100%)',
  CYCLICAL_DIVIDEND: 'linear-gradient(135deg, #5a2d10 0%, #a05324 50%, #f1bf6b 100%)',
}

export const fallbackRedDividendContext: RedDividendContextResponse = {
  brief: {
    title: '投资红利并非死守，而是在收息的同时，攻守自如。',
    summary: '顺着宏观环境切换红利角色，用更轻松的方式理解当下更适合关注哪一类。',
    strategyCore: '衰退期持“债”，复苏期持“核心”，通胀期持“资源”。',
  },
  categories: [
    {
      categoryCode: 'CORE_DIVIDEND',
      categoryName: '价值红利',
      shortTag: '核心',
      homeTagLabel: '价值',
      coverImage: coverGradientMap.CORE_DIVIDEND,
      description: '以价值红利为中枢：品牌护城河及优质现金流，长期持仓的压舱石。',
      categoryDesc: '长期底仓 · 均衡配置',
      tags: ['底仓', '稳定', '长期'],
    },
    {
      categoryCode: 'BOND_LIKE_DIVIDEND',
      categoryName: '类债红利',
      shortTag: '类债',
      homeTagLabel: '类债',
      coverImage: coverGradientMap.BOND_LIKE_DIVIDEND,
      description: '以类债红利避险：经营极稳如水电，利率下行时的避风港。',
      categoryDesc: '防御优先 · 稳定收息',
      tags: ['低波', '稳健', '防御'],
    },
    {
      categoryCode: 'CYCLICAL_DIVIDEND',
      categoryName: '周期红利',
      shortTag: '周期',
      homeTagLabel: '周期',
      coverImage: coverGradientMap.CYCLICAL_DIVIDEND,
      description: '以周期红利博价：煤炭石油等稀缺资源，通胀回升时的进攻器。',
      categoryDesc: '景气驱动 · 分红弹性',
      tags: ['周期', '景气', '弹性'],
    },
  ],
  mappingConfig: {
    title: '环境映射',
    tag: '当前适配',
    xAxis: {
      label: '增长预期',
      leftText: '增长偏弱',
      rightText: '增长回升',
    },
    yAxis: {
      label: '风险偏好',
      bottomText: '风险偏好弱',
      topText: '风险偏好强',
    },
    zones: [
      {
        zoneName: '防御区',
        categoryCode: 'BOND_LIKE_DIVIDEND',
      },
      {
        zoneName: '平衡区',
        categoryCode: 'CORE_DIVIDEND',
      },
      {
        zoneName: '弹性区',
        categoryCode: 'CYCLICAL_DIVIDEND',
      },
    ],
  },
}

export const fallbackRedDividendMarketView: RedDividendMarketViewResponse = {
  summary: '增长修复中，风险偏好温和',
  matchedCategoryCode: 'CORE_DIVIDEND',
}

export const fallbackRedDividendStrategies: Record<RedDividendCategoryCode, RedDividendStrategyResponse> = {
  CORE_DIVIDEND: {
    categoryCode: 'CORE_DIVIDEND',
    metric: {
      annualDividendAmountBy100k: 5000,
      attributes: [
        { label: '策略属性', value: '均衡底仓' },
        { label: '波动感受', value: '中低' },
        { label: '适配环境', value: '平衡' },
      ],
    },
    assetList: [
      { assetId: 'asset_001', assetName: '央企红利精选', tags: ['底仓', '稳定现金流'], annualDividendAmountBy100k: 4800 },
      { assetId: 'asset_002', assetName: '沪深高股息篮子', tags: ['均衡', '长期配置'], annualDividendAmountBy100k: 5100 },
      { assetId: 'asset_003', assetName: '价值红利ETF', tags: ['ETF', '价值'], annualDividendAmountBy100k: 4900 },
    ],
  },
  BOND_LIKE_DIVIDEND: {
    categoryCode: 'BOND_LIKE_DIVIDEND',
    metric: {
      annualDividendAmountBy100k: 4000,
      attributes: [
        { label: '策略属性', value: '稳健防御' },
        { label: '波动感受', value: '低' },
        { label: '适配环境', value: '防御' },
      ],
    },
    assetList: [
      { assetId: 'asset_101', assetName: '公用事业红利篮子', tags: ['公用事业', '稳定收息'], annualDividendAmountBy100k: 3900 },
      { assetId: 'asset_102', assetName: '低波高股息组合', tags: ['低波', '防守'], annualDividendAmountBy100k: 4100 },
      { assetId: 'asset_103', assetName: '类债红利ETF', tags: ['稳健', '现金流'], annualDividendAmountBy100k: 4000 },
    ],
  },
  CYCLICAL_DIVIDEND: {
    categoryCode: 'CYCLICAL_DIVIDEND',
    metric: {
      annualDividendAmountBy100k: 7000,
      attributes: [
        { label: '策略属性', value: '景气弹性' },
        { label: '波动感受', value: '中高' },
        { label: '适配环境', value: '弹性' },
      ],
    },
    assetList: [
      { assetId: 'asset_201', assetName: '资源高股息组合', tags: ['资源', '景气'], annualDividendAmountBy100k: 6800 },
      { assetId: 'asset_202', assetName: '能源红利篮子', tags: ['能源', '分红弹性'], annualDividendAmountBy100k: 7200 },
      { assetId: 'asset_203', assetName: '周期红利ETF', tags: ['周期', '高股息'], annualDividendAmountBy100k: 7000 },
    ],
  },
}

export const fallbackRedDividendComparison: RedDividendComparisonResponse = {
  dividendCompare: {
    items: [
      { categoryCode: 'CORE_DIVIDEND', annualDividendAmountBy100k: 5000, dividendYield: 5 },
      { categoryCode: 'BOND_LIKE_DIVIDEND', annualDividendAmountBy100k: 4000, dividendYield: 4 },
      { categoryCode: 'CYCLICAL_DIVIDEND', annualDividendAmountBy100k: 7000, dividendYield: 7 },
    ],
  },
  mapping: {
    nodes: [
      { categoryCode: 'BOND_LIKE_DIVIDEND', xValue: 0.18, yValue: 0.26 },
      { categoryCode: 'CORE_DIVIDEND', xValue: 0.5, yValue: 0.5 },
      { categoryCode: 'CYCLICAL_DIVIDEND', xValue: 0.82, yValue: 0.76 },
    ],
    matchedCategoryCode: 'CORE_DIVIDEND',
  },
  explanations: [
    {
      categoryCode: 'CORE_DIVIDEND',
      summary: '当前市场下，更适合作为兼顾分红稳定性与底仓属性的优先关注方向。',
      reasonPoints: [
        '增长修复中，风险偏好温和。',
        '相比类债红利更有收益弹性。',
        '相比周期红利，波动和回撤更可控。',
      ],
    },
    {
      categoryCode: 'BOND_LIKE_DIVIDEND',
      summary: '当风险偏好偏弱、市场更重视稳定收息时，类债红利更适合作为防御型方向。',
      reasonPoints: [
        '盈利与分红稳定性更强。',
        '利率下行阶段更容易体现配置价值。',
        '适合更重视回撤控制的环境。',
      ],
    },
    {
      categoryCode: 'CYCLICAL_DIVIDEND',
      summary: '当增长预期明显回升、风险偏好持续改善时，周期红利更容易体现盈利与分红弹性。',
      reasonPoints: [
        '增长回升，景气方向更受关注。',
        '周期资源品的盈利弹性更强。',
        '适合对波动容忍度更高的阶段。',
      ],
    },
  ],
}
