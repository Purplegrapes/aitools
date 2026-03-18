<script setup lang="ts">
import type { DiscoveryFundValuation, FundExchangeQuote, FundMarketType, FundResult } from '../types'
import { computed } from 'vue'
import { formatIntradayValue, formatMetricNumber, formatPercent, getDailyChangeTone, getIntradayTone } from '../utils'

const props = defineProps<{
  exchangeQuote?: FundExchangeQuote
  marketType: FundMarketType
  result: FundResult
  valuation?: DiscoveryFundValuation
}>()
const showMetricTipPopup = shallowRef(false)
const activeMetricTip = shallowRef<{
  label: string
  description: string
} | null>(null)
function getEvaluationTextClass(evaluation: string) {
  if (evaluation.includes('暂无'))
    return 'text-secondary'
  if (evaluation.includes('优秀'))
    return 'text-success'
  if (evaluation.includes('良好') || evaluation.includes('中等'))
    return 'text-brand'
  if (evaluation.includes('一般'))
    return 'text-warning'
  if (evaluation.includes('较弱'))
    return 'text-danger'
  return 'text-regular'
}

const quickFactRows = computed(() => [
  {
    label: '最大回撤',
    value: props.result.quickFacts?.maxDrawdown || '--',
    evaluation: props.result.quickFacts?.maxDrawdown ? '稳定性一般' : '暂无结论',
    tip: '看这只基金历史上最深跌过多少，通常回撤越小，持有体验越稳。',
    valueClass: 'text-success',
    evaluationTextClass: getEvaluationTextClass(props.result.quickFacts?.maxDrawdown ? '稳定性一般' : '暂无结论'),
  },
  {
    label: '夏普比率',
    value: props.result.quickFacts?.sharpeRatio || '--',
    evaluation: props.result.quickFacts?.sharpeRatio ? '性价比中等' : '暂无结论',
    tip: '看承担一份波动能换来多少收益，通常数值越高，收益效率越好。',
    valueClass: 'text-primary',
    evaluationTextClass: getEvaluationTextClass(props.result.quickFacts?.sharpeRatio ? '性价比中等' : '暂无结论'),
  },
  {
    label: '卡玛比率',
    value: props.result.quickFacts?.calmarRatio || '--',
    evaluation: props.result.quickFacts?.calmarRatio ? '回撤比一般' : '暂无结论',
    tip: '看每承受一份最大回撤能换来多少收益，通常数值越高越划算。',
    valueClass: 'text-danger',
    evaluationTextClass: getEvaluationTextClass(props.result.quickFacts?.calmarRatio ? '回撤比一般' : '暂无结论'),
  },
])

const todayMetrics = computed(() => {
  if (props.marketType === 'exchange') {
    return [
      {
        label: '场内价格',
        value: formatMetricNumber(props.exchangeQuote?.currentPrice, 3),
        toneClass: 'text-primary',
      },
      {
        label: '场内涨幅',
        value: formatPercent(props.exchangeQuote?.priceChangeRatio),
        toneClass: getDailyChangeTone(props.exchangeQuote?.priceChangeRatio),
      },
      {
        label: '溢价率',
        value: formatPercent(props.exchangeQuote?.premiumRate),
        toneClass: getDailyChangeTone(props.exchangeQuote?.premiumRate),
      },
    ]
  }

  return [
    {
      label: '净值',
      value: formatMetricNumber(props.valuation?.valuation, 4),
      toneClass: 'text-primary',
    },
    {
      label: '估算涨跌',
      value: formatIntradayValue(props.result.intraday),
      toneClass: getIntradayTone(props.result.intraday),
    },
  ]
})

const todayExplanation = computed(() => {
  if (props.marketType === 'exchange')
    return props.exchangeQuote?.explanation || '当前暂无可用的场内行情数据，可稍后再看。'

  return props.result.intraday?.explanation || '当前暂无可用的估值数据，可稍后再看。'
})

const updateTimeText = computed(() => {
  if (props.marketType === 'exchange')
    return props.exchangeQuote?.updateTime

  return props.result.intraday?.updateTime
})

const detailInfoCards = computed(() => [
  {
    label: '主要跟踪',
    value: props.result.targetIndex || '--',
    iconClass: 'i-carbon-chart-line-data',
    iconToneClass: 'bg-brandMuted text-brand',
    panelStyle: 'background: linear-gradient(180deg, rgba(238,244,253,1) 0%, rgba(244,248,255,1) 100%);',
  },
  {
    label: '覆盖方向',
    value: props.result.marketCoverage || '--',
    iconClass: 'i-carbon-compass',
    iconToneClass: 'bg-danger/10 text-danger',
    panelStyle: 'background: linear-gradient(180deg, rgba(238,244,253,1) 0%, rgba(244,248,255,1) 100%);',
  },
])

const riskLevel = computed(() => {
  const description = props.result.riskDescription || ''
  if (!description)
    return '暂无'
  if (description.includes('较大') || description.includes('明显') || description.includes('更高'))
    return '较高'
  if (description.includes('较低') || description.includes('偏稳'))
    return '较低'
  return '中度'
})

function handleShowMetricTip(row: { label: string, tip: string }) {
  activeMetricTip.value = {
    label: row.label,
    description: row.tip,
  }
  showMetricTipPopup.value = true
}
</script>

<template>
  <view class="flex flex-col gap-4">
    <view class="">
      <text class="block text-lg text-primary font-600">
        {{ result.name }}
      </text>
      <text class="mt-1 block text-sm text-secondary">
        {{ result.code }}
      </text>

      <view class="mt-3 flex flex-wrap gap-2">
        <wd-tag
          v-for="tag in result.tags || []"
          :key="tag"
          bg-color="rgba(22,120,255,0.12)"
          custom-class="!rounded-full !border-none !px-2"
        >
          <text class="text-xs text-brand">
            {{ tag }}
          </text>
        </wd-tag>
      </view>
    </view>

    <view class="rounded-card bg-surface p-4">
      <view class="flex items-start justify-between gap-4">
        <view>
          <text class="block text-sm text-secondary">
            {{ marketType === 'exchange' ? '场内行情参考' : '净值估算参考' }}
          </text>
        </view>
        <text class="text-xs text-secondary">
          {{ updateTimeText || '--' }} {{ marketType === 'exchange' ? '盘中更新' : '估算更新' }}
        </text>
      </view>

      <view class="grid mt-4 gap-3" :class="marketType === 'exchange' ? 'grid-cols-3' : 'grid-cols-2'">
        <view
          v-for="item in todayMetrics"
          :key="item.label"
          class="rounded-panel bg-page px-3 py-3"
        >
          <text class="block text-xs text-secondary">
            {{ item.label }}
          </text>
          <text class="mt-2 block text-base font-700" :class="item.toneClass">
            {{ item.value }}
          </text>
        </view>
      </view>

      <view class="mt-4 rounded-panel bg-page px-3 py-3">
        <text class="text-sm text-regular leading-6">
          {{ todayExplanation }}
        </text>
      </view>
    </view>

    <view class="vt-card bg-surface">
      <text class="block text-lg text-primary font-600 leading-tight">
        快速看懂这只基金
      </text>

      <view class="mt-[24rpx] flex flex-col gap-[16rpx]">
        <view
          v-for="item in quickFactRows"
          :key="item.label"
          class="rounded-panel vt-panel bg-surfaceSubtle"
        >
          <view class="flex items-start justify-between gap-[24rpx]">
            <view class="min-w-0 flex items-center gap-[8rpx] pt-[4rpx]">
              <text class="text-[30rpx] text-regular leading-[40rpx]">
                {{ item.label }}
              </text>
              <wd-icon
                name="info-circle"
                custom-class="text-14px! text-secondary! leading-none!"
                @click="handleShowMetricTip({ label: item.label, tip: item.tip })"
              />
            </view>

            <view class="min-w-0 flex flex-col items-end text-right">
              <text
                class="text-[30rpx] font-600 leading-[42rpx]"
                :class="item.valueClass"
              >
                {{ item.value }}
              </text>
              <text
                class="mt-[6rpx] text-[22rpx] leading-[32rpx]"
                :class="item.evaluationTextClass"
              >
                {{ item.evaluation }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <view class="mt-[28rpx]">
        <text class="block text-[24rpx] text-secondary leading-[38rpx]">
          {{ result.definition }}
        </text>
      </view>

      <view class="grid grid-cols-2 mt-[26rpx] gap-[20rpx]">
        <view
          v-for="item in detailInfoCards"
          :key="item.label"
          class="border border-white rounded-panel border-solid px-[18rpx] py-[18rpx]"
          :style="item.panelStyle"
        >
          <view :class="item.iconToneClass" class="h-[40rpx] w-[40rpx] flex items-center justify-center rounded-full">
            <view :class="item.iconClass" class="text-[22rpx]" />
          </view>
          <text class="mt-[10rpx] block text-[24rpx] text-regular leading-[34rpx]">
            {{ item.label }}
          </text>
          <text class="mt-[14rpx] block text-[30rpx] text-primary font-600 leading-[42rpx]">
            {{ item.value }}
          </text>
        </view>
      </view>

      <view class="mt-[28rpx]">
        <view class="flex items-center gap-[12rpx]">
          <text class="text-[30rpx] text-primary font-600 leading-[42rpx]">
            日常波动预感
          </text>
          <text class="rounded-[10rpx] bg-warning/10 px-[14rpx] py-[6rpx] text-[20rpx] text-warning font-600 leading-[28rpx]">
            {{ riskLevel }}
          </text>
        </view>
        <text class="mt-[12rpx] block text-[24rpx] text-secondary leading-[38rpx]">
          {{ result.riskDescription }}
        </text>
      </view>
    </view>

    <wd-popup
      v-model="showMetricTipPopup"
      root-portal
      position="bottom"
      closable
      close-icon
      custom-style="border-radius: 24rpx 24rpx 0 0;"
    >
      <view class="px-4 pb-[calc(env(safe-area-inset-bottom)+220rpx)] pt-3">
        <view class="h-[96rpx] flex items-center justify-center">
          <text class="text-lg text-primary font-600">
            {{ activeMetricTip?.label }}
          </text>
        </view>

        <view class="rounded-panel bg-page px-4 py-4">
          <text class="block text-sm text-regular leading-6">
            {{ activeMetricTip?.description }}
          </text>
        </view>
      </view>
    </wd-popup>
  </view>
</template>
