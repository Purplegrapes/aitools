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

const infoRows = computed(() => [
  {
    label: '成立日期',
    value: props.result.foundDate || '--',
  },
  {
    label: '交易渠道',
    value: props.result.channelLabel || props.result.marketCoverage || '--',
  },
])

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

function getOneMonthReturnMeta(value?: string | null) {
  const numericValue = parseMetricNumber(value)
  if (numericValue === null) {
    return {
      evaluation: '暂无数据',
      evaluationTextClass: 'text-secondary',
      tip: '近1月收益是接口返回的最近 1 个月区间收益率，可用于快速查看这只基金近期表现。',
    }
  }

  return {
    evaluation: numericValue >= 0 ? '近期上涨' : '近期回撤',
    evaluationTextClass: numericValue >= 0 ? 'text-brand' : 'text-warning',
    tip: '近1月收益是接口返回的最近 1 个月区间收益率，可用于快速查看这只基金近期表现。',
  }
}

function getMaxDrawdownMeta(value?: string | null) {
  const numericValue = parseMetricNumber(value)
  if (numericValue === null) {
    return {
      evaluation: '暂无数据',
      evaluationTextClass: 'text-secondary',
      tip: '最大回撤是接口返回的历史区间最大回撤值，用来观察这只基金曾经经历过的最大跌幅。',
    }
  }

  return {
    evaluation: numericValue >= -20 ? '回撤较小' : numericValue >= -35 ? '回撤中等' : '回撤较大',
    evaluationTextClass: 'text-danger',
    tip: '最大回撤是接口返回的历史区间最大回撤值，用来观察这只基金曾经经历过的最大跌幅。',
  }
}

function getFeeRateMeta(value?: string | null) {
  const numericValue = parseMetricNumber(value)
  if (numericValue === null) {
    return {
      evaluation: '暂无数据',
      evaluationTextClass: 'text-secondary',
      tip: '费率是接口返回的年度费率数据，主要用于了解长期持有时的成本水平。',
    }
  }

  return {
    evaluation: numericValue <= 0.6 ? '成本较低' : numericValue <= 1 ? '成本适中' : '成本较高',
    evaluationTextClass: numericValue <= 0.6 ? 'text-brand' : 'text-warning',
    tip: '费率是接口返回的年度费率数据，主要用于了解长期持有时的成本水平。',
  }
}

const quickFactRows = computed(() => {
  const oneMonthPerformanceMeta = getOneMonthReturnMeta(props.result.quickFacts?.oneMonthReturn)
  const maxDrawdownMeta = getMaxDrawdownMeta(props.result.quickFacts?.maxDrawdown)
  const feeRateMeta = getFeeRateMeta(props.result.quickFacts?.feeRate)

  return [
    {
      label: '近1月收益',
      value: props.result.quickFacts?.oneMonthReturn || '--',
      evaluation: oneMonthPerformanceMeta.evaluation,
      tip: oneMonthPerformanceMeta.tip,
      valueClass: parseMetricNumber(props.result.quickFacts?.oneMonthReturn) === null
        ? 'text-primary'
        : parseMetricNumber(props.result.quickFacts?.oneMonthReturn)! >= 0 ? 'text-danger' : 'text-success',
      evaluationTextClass: oneMonthPerformanceMeta.evaluationTextClass,
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
        label: '参考净值',
        value: formatMetricNumber(props.exchangeQuote?.currentPrice, 4),
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

const detailInfoCards = computed(() => infoRows.value.map((item, index) => ({
  label: item.label,
  value: item.value,
  iconClass: index % 2 === 0 ? 'i-carbon-chart-line-data' : 'i-carbon-calendar',
  iconToneClass: index % 2 === 0 ? 'bg-brandMuted text-brand' : 'bg-danger/10 text-danger',
  panelStyle: 'background: linear-gradient(180deg, rgba(238,244,253,1) 0%, rgba(244,248,255,1) 100%);',
})))

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
        基金信息摘要
      </text>

      <view class="mt-[24rpx] flex flex-col gap-[16rpx]">
        <view
          v-for="item in quickFactRows"
          :key="item.label"
          class="rounded-panel vt-panel bg-surfaceSubtle"
        >
          <view class="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)] items-center gap-[20rpx]">
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
