<script setup lang="ts">
import type { FundResult } from '../types'
import { computed } from 'vue'
import { formatIntradayValue, getIntradayTone } from '../utils'

const props = defineProps<{
  result: FundResult
}>()
const showMetricTipPopup = shallowRef(false)
const activeMetricTip = shallowRef<{
  label: string
  description: string
} | null>(null)

function getEvaluationClass(evaluation: string) {
  if (evaluation.includes('暂无'))
    return 'bg-surfaceMuted text-secondary'
  if (evaluation.includes('优秀'))
    return 'bg-success/10 text-success'
  if (evaluation.includes('良好'))
    return 'bg-brandMuted text-brand'
  if (evaluation.includes('一般'))
    return 'bg-warning/10 text-warning'
  if (evaluation.includes('较弱'))
    return 'bg-danger/10 text-danger'
  if (evaluation.includes('中等'))
    return 'bg-brandMuted text-brand'
  return 'bg-surfaceMuted text-regular'
}

const quickFactRows = computed(() => [
  {
    label: '最大回撤',
    value: props.result.quickFacts?.maxDrawdown || '--',
    evaluation: props.result.quickFacts?.maxDrawdown ? '稳定性一般' : '暂无结论',
    tip: '看这只基金历史上最深跌过多少，通常回撤越小，持有体验越稳。',
    valueClass: 'text-success',
    evaluationClass: getEvaluationClass(props.result.quickFacts?.maxDrawdown ? '稳定性一般' : '暂无结论'),
  },
  {
    label: '夏普比率',
    value: props.result.quickFacts?.sharpeRatio || '--',
    evaluation: props.result.quickFacts?.sharpeRatio ? '性价比中等' : '暂无结论',
    tip: '看承担一份波动能换来多少收益，通常数值越高，收益效率越好。',
    valueClass: 'text-primary',
    evaluationClass: getEvaluationClass(props.result.quickFacts?.sharpeRatio ? '性价比中等' : '暂无结论'),
  },
  {
    label: '卡玛比率',
    value: props.result.quickFacts?.calmarRatio || '--',
    evaluation: props.result.quickFacts?.calmarRatio ? '回撤比一般' : '暂无结论',
    tip: '看每承受一份最大回撤能换来多少收益，通常数值越高越划算。',
    valueClass: 'text-danger',
    evaluationClass: getEvaluationClass(props.result.quickFacts?.calmarRatio ? '回撤比一般' : '暂无结论'),
  },
])

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

    <view class="rounded-4 bg-surface p-4 shadow-sm">
      <view class="flex items-start justify-between gap-4">
        <view>
          <text class="block text-sm text-secondary">
            今日表现参考
          </text>
          <text class="mt-1 block text-2xl font-700" :class="getIntradayTone(result.intraday)">
            {{ formatIntradayValue(result.intraday) }}
          </text>
        </view>
        <text class="text-xs text-secondary">
          {{ result.intraday?.updateTime }} 估算更新
        </text>
      </view>

      <view class="mt-4 rounded-3 bg-page px-3 py-3">
        <text class="text-sm text-regular leading-6">
          {{ result.intraday?.explanation }}
        </text>
      </view>
    </view>

    <view class="rounded-4 bg-surface p-4 shadow-sm">
      <text class="block text-base text-primary font-600">
        快速看懂这只基金
      </text>

      <view class="mt-4 rounded-3 bg-page px-3">
        <view
          v-for="(item, index) in quickFactRows"
          :key="item.label"
          class="flex items-center gap-3 py-4"
          :class="index > 0 ? 'mt-1' : ''"
        >
          <view class="w-[150rpx] flex shrink-0 items-center gap-1">
            <text class="text-sm text-secondary">
              {{ item.label }}
            </text>
            <wd-icon
              name="info-circle"
              custom-class="text-14px! text-secondary! leading-none!"
              @click="handleShowMetricTip({ label: item.label, tip: item.tip })"
            />
          </view>
          <text
            class="w-[170rpx] shrink-0 text-center text-base font-600"
            :class="item.valueClass"
          >
            {{ item.value }}
          </text>
          <view class="min-w-0 flex flex-1 justify-end">
            <text
              class="inline-flex rounded-full px-2 py-[6rpx] text-xs font-600 leading-4"
              :class="item.evaluationClass"
            >
              {{ item.evaluation }}
            </text>
          </view>
        </view>
      </view>

      <view class="mt-4 rounded-3 bg-brand-muted px-3 py-3">
        <text class="text-xs text-regular leading-6">
          {{ result.definition }}
        </text>
      </view>

      <view class="grid grid-cols-2 mt-4 gap-3">
        <view class="rounded-3 bg-page px-3 py-3">
          <text class="block text-xs text-secondary">
            主要跟踪
          </text>
          <text class="mt-2 block text-sm text-primary font-600">
            {{ result.targetIndex }}
          </text>
        </view>
        <view class="rounded-3 bg-page px-3 py-3">
          <text class="block text-xs text-secondary">
            覆盖方向
          </text>
          <text class="mt-2 block text-sm text-primary font-600">
            {{ result.marketCoverage }}
          </text>
        </view>
      </view>

      <view class="mt-4 rounded-3 bg-page px-3 py-3">
        <text class="block text-sm text-primary font-600">
          日常波动预感
        </text>
        <text class="mt-2 block text-xs text-regular leading-6">
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

        <view class="rounded-3 bg-page px-4 py-4">
          <text class="block text-sm text-regular leading-6">
            {{ activeMetricTip?.description }}
          </text>
        </view>
      </view>
    </wd-popup>
  </view>
</template>
