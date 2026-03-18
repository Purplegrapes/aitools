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

function formatSignedMetricNumber(value?: number | null, fractionDigits = 4) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return '--'

  const numericValue = Number(value)
  const sign = numericValue > 0 ? '+' : ''
  return `${sign}${numericValue.toFixed(fractionDigits)}`
}

function parseMetricNumber(value?: string | null) {
  if (!value)
    return null

  const matched = value.match(/-?\d+(\.\d+)?/)
  if (!matched)
    return null

  const parsed = Number(matched[0])
  return Number.isNaN(parsed) ? null : parsed
}

function formatFeeRateDisplay(value?: string | null) {
  if (!value)
    return '--'

  return value.includes('年') ? value : `${value} / 年`
}

function getOneYearPerformanceMeta(value?: string | null) {
  const numericValue = parseMetricNumber(value)
  if (numericValue === null) {
    return {
      evaluation: '暂无结论',
      evaluationTextClass: 'text-secondary',
      tip: '近一年表现是指这只基金过去 1 年的累计涨跌幅。它能帮助你快速了解这只基金最近一年的整体表现，但不能单独代表未来收益，也要结合风险和回撤一起看。',
    }
  }

  if (numericValue >= 20) {
    return {
      evaluation: '过去一年整体表现较强',
      evaluationTextClass: 'text-success',
      tip: '近一年表现是指这只基金过去 1 年的累计涨跌幅。它能帮助你快速了解这只基金最近一年的整体表现，但不能单独代表未来收益，也要结合风险和回撤一起看。',
    }
  }
  if (numericValue >= 10) {
    return {
      evaluation: '过去一年表现不错',
      evaluationTextClass: 'text-brand',
      tip: '近一年表现是指这只基金过去 1 年的累计涨跌幅。它能帮助你快速了解这只基金最近一年的整体表现，但不能单独代表未来收益，也要结合风险和回撤一起看。',
    }
  }
  if (numericValue >= 0) {
    return {
      evaluation: '过去一年表现一般',
      evaluationTextClass: 'text-warning',
      tip: '近一年表现是指这只基金过去 1 年的累计涨跌幅。它能帮助你快速了解这只基金最近一年的整体表现，但不能单独代表未来收益，也要结合风险和回撤一起看。',
    }
  }
  if (numericValue >= -10) {
    return {
      evaluation: '过去一年表现偏弱',
      evaluationTextClass: 'text-warning',
      tip: '近一年表现是指这只基金过去 1 年的累计涨跌幅。它能帮助你快速了解这只基金最近一年的整体表现，但不能单独代表未来收益，也要结合风险和回撤一起看。',
    }
  }

  return {
    evaluation: '过去一年整体偏弱',
    evaluationTextClass: 'text-danger',
    tip: '近一年表现是指这只基金过去 1 年的累计涨跌幅。它能帮助你快速了解这只基金最近一年的整体表现，但不能单独代表未来收益，也要结合风险和回撤一起看。',
  }
}

function getMaxDrawdownMeta(value?: string | null) {
  const numericValue = parseMetricNumber(value)
  if (numericValue === null) {
    return {
      evaluation: '暂无结论',
      evaluationTextClass: 'text-secondary',
      tip: '历史最大跌幅是这只基金在一段历史时间里，从最高点跌到最低点的最大跌幅。它能帮助你理解这只基金过去最极端的回撤有多大，也能帮助判断它的波动风险。',
    }
  }

  if (numericValue >= -10) {
    return {
      evaluation: '最差时跌幅不大',
      evaluationTextClass: 'text-success',
      tip: '历史最大跌幅是这只基金在一段历史时间里，从最高点跌到最低点的最大跌幅。它能帮助你理解这只基金过去最极端的回撤有多大，也能帮助判断它的波动风险。',
    }
  }
  if (numericValue >= -20) {
    return {
      evaluation: '最差时跌幅还算可控',
      evaluationTextClass: 'text-brand',
      tip: '历史最大跌幅是这只基金在一段历史时间里，从最高点跌到最低点的最大跌幅。它能帮助你理解这只基金过去最极端的回撤有多大，也能帮助判断它的波动风险。',
    }
  }
  if (numericValue >= -30) {
    return {
      evaluation: '最差时大概跌过 2 成',
      evaluationTextClass: 'text-brand',
      tip: '历史最大跌幅是这只基金在一段历史时间里，从最高点跌到最低点的最大跌幅。它能帮助你理解这只基金过去最极端的回撤有多大，也能帮助判断它的波动风险。',
    }
  }
  if (numericValue >= -40) {
    return {
      evaluation: '最差时大概跌过 3 成',
      evaluationTextClass: 'text-warning',
      tip: '历史最大跌幅是这只基金在一段历史时间里，从最高点跌到最低点的最大跌幅。它能帮助你理解这只基金过去最极端的回撤有多大，也能帮助判断它的波动风险。',
    }
  }

  return {
    evaluation: '最差时跌得比较深',
    evaluationTextClass: 'text-danger',
    tip: '历史最大跌幅是这只基金在一段历史时间里，从最高点跌到最低点的最大跌幅。它能帮助你理解这只基金过去最极端的回撤有多大，也能帮助判断它的波动风险。',
  }
}

function getFeeRateMeta(value?: string | null) {
  const numericValue = parseMetricNumber(value)
  if (numericValue === null) {
    return {
      evaluation: '暂无结论',
      evaluationTextClass: 'text-secondary',
      tip: '费率是持有基金时需要承担的年度费用比例。费率越低，长期持有时越有利；费率越高，长期收益越容易被成本侵蚀。在同类基金中，费率通常是一个很重要的比较指标。',
    }
  }

  if (numericValue <= 0.3) {
    return {
      evaluation: '长期持有成本较低',
      evaluationTextClass: 'text-success',
      tip: '费率是持有基金时需要承担的年度费用比例。费率越低，长期持有时越有利；费率越高，长期收益越容易被成本侵蚀。在同类基金中，费率通常是一个很重要的比较指标。',
    }
  }
  if (numericValue <= 0.6) {
    return {
      evaluation: '长期持有成本中等',
      evaluationTextClass: 'text-brand',
      tip: '费率是持有基金时需要承担的年度费用比例。费率越低，长期持有时越有利；费率越高，长期收益越容易被成本侵蚀。在同类基金中，费率通常是一个很重要的比较指标。',
    }
  }
  if (numericValue <= 1) {
    return {
      evaluation: '长期持有成本偏高',
      evaluationTextClass: 'text-warning',
      tip: '费率是持有基金时需要承担的年度费用比例。费率越低，长期持有时越有利；费率越高，长期收益越容易被成本侵蚀。在同类基金中，费率通常是一个很重要的比较指标。',
    }
  }

  return {
    evaluation: '长期持有成本较高',
    evaluationTextClass: 'text-danger',
    tip: '费率是持有基金时需要承担的年度费用比例。费率越低，长期持有时越有利；费率越高，长期收益越容易被成本侵蚀。在同类基金中，费率通常是一个很重要的比较指标。',
  }
}

const quickFactRows = computed(() => {
  const oneYearPerformanceMeta = getOneYearPerformanceMeta(props.result.quickFacts?.oneYearPerformance)
  const maxDrawdownMeta = getMaxDrawdownMeta(props.result.quickFacts?.maxDrawdown)
  const feeRateMeta = getFeeRateMeta(props.result.quickFacts?.feeRate)

  return [
    {
      label: '近一年表现',
      value: props.result.quickFacts?.oneYearPerformance || '--',
      evaluation: oneYearPerformanceMeta.evaluation,
      tip: oneYearPerformanceMeta.tip,
      valueClass: parseMetricNumber(props.result.quickFacts?.oneYearPerformance) === null
        ? 'text-primary'
        : parseMetricNumber(props.result.quickFacts?.oneYearPerformance)! >= 0 ? 'text-danger' : 'text-success',
      evaluationTextClass: oneYearPerformanceMeta.evaluationTextClass,
    },
    {
      label: '历史最大跌幅',
      value: props.result.quickFacts?.maxDrawdown || '--',
      evaluation: maxDrawdownMeta.evaluation,
      tip: maxDrawdownMeta.tip,
      valueClass: 'text-danger',
      evaluationTextClass: maxDrawdownMeta.evaluationTextClass,
    },
    {
      label: '费率',
      value: formatFeeRateDisplay(props.result.quickFacts?.feeRate),
      evaluation: feeRateMeta.evaluation,
      tip: feeRateMeta.tip,
      valueClass: 'text-primary',
      evaluationTextClass: feeRateMeta.evaluationTextClass,
    },
  ]
})

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

const isOtcMetricLayout = computed(() => props.marketType !== 'exchange')
const otcPrimaryMetric = computed(() => todayMetrics.value[1])
const otcSecondaryMetric = computed(() => todayMetrics.value[0])

const todayExplanation = computed(() => {
  if (props.marketType === 'exchange')
    return props.exchangeQuote?.explanation || '当前暂无可用的场内行情数据，可稍后再看。'

  return props.result.intraday?.explanation || '当前暂无可用的估值数据，可稍后再看。'
})

const otcExplanationMetrics = computed(() => {
  if (props.marketType === 'exchange' || !props.valuation || !props.result.intraday)
    return null

  return {
    valuation: formatMetricNumber(props.valuation.valuation, 4),
    offChangeNetValue: formatSignedMetricNumber(props.valuation.offChangeNetValue, 4),
    offChangeNetValueToneClass: getDailyChangeTone(props.valuation.offChangeNetValue),
    intradayValue: formatIntradayValue(props.result.intraday),
    intradayToneClass: getIntradayTone(props.result.intraday),
  }
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

      <view
        v-if="isOtcMetricLayout"
        class="mt-[24rpx] rounded-panel bg-brandMuted px-[24rpx] py-[24rpx]"
      >
        <view class="flex items-start justify-between gap-[24rpx]">
          <view class="min-w-0 flex-1">
            <text class="block text-[22rpx] text-secondary leading-[32rpx]">
              {{ otcPrimaryMetric?.label }}
            </text>
            <text
              class="mt-[10rpx] block text-[56rpx] font-700 leading-[1.08]"
              :class="otcPrimaryMetric?.toneClass"
            >
              {{ otcPrimaryMetric?.value }}
            </text>
          </view>

          <view class="min-w-0 flex shrink-0 flex-col items-end text-right">
            <text class="text-[22rpx] text-secondary leading-[32rpx]">
              {{ otcSecondaryMetric?.label }}
            </text>
            <text
              class="mt-[8rpx] text-[34rpx] text-primary font-600 leading-[1.15]"
              :class="otcSecondaryMetric?.toneClass"
            >
              {{ otcSecondaryMetric?.value }}
            </text>
          </view>
        </view>
      </view>

      <view
        v-else
        class="grid mt-4 gap-3"
        :class="marketType === 'exchange' ? 'grid-cols-3' : 'grid-cols-2'"
      >
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
        <text v-if="otcExplanationMetrics" class="text-sm text-regular leading-6">
          当前估算净值约为
          <text class="text-primary font-600">
            {{ otcExplanationMetrics.valuation }}
          </text>
          ，较上一交易日净值变动
          <text :class="otcExplanationMetrics.offChangeNetValueToneClass" class="font-600">
            {{ otcExplanationMetrics.offChangeNetValue }}
          </text>
          ，对应今日估算涨跌
          <text :class="otcExplanationMetrics.intradayToneClass" class="font-600">
            {{ otcExplanationMetrics.intradayValue }}
          </text>
          。
        </text>
        <text v-else class="text-sm text-regular leading-6">
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
          <view class="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.5fr)] items-center gap-[20rpx]">
            <view class="min-w-0 flex items-center gap-[8rpx]">
              <text class="truncate text-[28rpx] text-regular leading-[40rpx]">
                {{ item.label }}
              </text>
              <wd-icon
                name="info-circle"
                custom-class="text-14px! text-secondary! leading-none!"
                @click="handleShowMetricTip({ label: item.label, tip: item.tip })"
              />
            </view>

            <view class="min-w-0 text-center">
              <text
                class="block truncate text-[28rpx] font-600 leading-[40rpx]"
                :class="item.valueClass"
              >
                {{ item.value }}
              </text>
            </view>

            <view class="min-w-0 text-right">
              <text
                class="block text-[22rpx] leading-[32rpx]"
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
