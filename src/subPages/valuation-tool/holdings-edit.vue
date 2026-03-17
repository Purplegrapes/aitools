<script setup lang="ts">
import BottomActionBar from './components/BottomActionBar.vue'
import EditPositionSheet from './components/EditPositionSheet.vue'
import { usePortfolio } from './composables/usePortfolio'
import { createHoldingsPath, formatCurrency, normalizeKeyword } from './utils'

definePage({
  name: 'valuation-tool-holdings-edit',
  layout: 'default',
  style: {
    navigationBarTitleText: '修改持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const globalToast = useGlobalToast()
const { ensureLoaded, getPositionById, updatePosition, removePosition, metrics } = usePortfolio()

const positionId = computed(() => normalizeKeyword(route.query.id))
const holdingAmount = shallowRef('')
const holdingProfit = shallowRef('')

const currentPosition = computed(() => getPositionById(positionId.value))
const currentMetric = computed(() => metrics.value.find(item => item.id === positionId.value) || null)

onShow(() => {
  ensureLoaded()
  if (!currentMetric.value)
    return
  holdingAmount.value = toEditableNumber(currentMetric.value.currentAmount)
  holdingProfit.value = toEditableNumber(currentMetric.value.cumulativeProfit)
})

function handleSave() {
  if (!currentPosition.value || !currentMetric.value) {
    globalToast.error('当前持仓信息不完整')
    return
  }

  const currentNav = Number(currentMetric.value.currentNav)
  const holdingAmountValue = Number(holdingAmount.value)
  const holdingProfitValue = Number(holdingProfit.value)

  if (!currentNav || Number.isNaN(currentNav)) {
    globalToast.error('当前估值暂不可用，暂时无法保存修改')
    return
  }

  if (!holdingAmountValue || Number.isNaN(holdingAmountValue)) {
    globalToast.error('请填写当前持有金额')
    return
  }

  if (Number.isNaN(holdingProfitValue)) {
    globalToast.error('请填写当前持有收益')
    return
  }

  const sharesValue = holdingAmountValue / currentNav
  const costAmountValue = holdingAmountValue - holdingProfitValue
  const costNavValue = costAmountValue / sharesValue

  if (!sharesValue || !costNavValue || costAmountValue <= 0) {
    globalToast.error('输入的持有金额和持有收益不合理，请检查后再试')
    return
  }

  updatePosition({
    ...currentPosition.value,
    shares: sharesValue,
    costNav: costNavValue,
  })
  globalToast.success('持仓已更新')
  router.replace(createHoldingsPath())
}

function handleRemove() {
  if (!currentPosition.value)
    return
  removePosition(currentPosition.value.id)
  globalToast.success('持仓已删除')
  router.replace(createHoldingsPath())
}

function toEditableNumber(value: number) {
  return Number(value).toFixed(2)
}
</script>

<template>
  <view class="min-h-screen overflow-x-hidden bg-surfaceSubtle pb-[220rpx] pt-[24rpx]">
    <view
      class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx]"
      style="background: linear-gradient(180deg, rgba(232,241,255,0.96), rgba(248,250,253,0.72) 58%, transparent);"
    />
    <view
      class="pointer-events-none absolute right-[-120rpx] top-[88rpx] h-[240rpx] w-[240rpx] rounded-full opacity-70"
      style="background: radial-gradient(circle, rgba(120,161,255,0.18), transparent 68%);"
    />

    <view class="relative mx-auto max-w-[702rpx] px-[24rpx]">
      <view class="px-[4rpx] py-[8rpx]">
        <text class="block text-[34rpx] text-primary font-700">
          修改持仓
        </text>
        <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
          修改这只基金的持有份额和成本净值，保存后会重新计算当前收益表现。
        </text>
      </view>

      <view class="mt-[18rpx]">
        <EditPositionSheet
          v-if="currentPosition"
          :code="currentPosition.code"
          :cumulative-profit-text="formatCurrency(currentMetric?.cumulativeProfit ?? 0)"
          :current-amount-text="formatCurrency(currentMetric?.currentAmount ?? 0)"
          :holding-amount="holdingAmount"
          :holding-profit="holdingProfit"
          :name="currentPosition.name"
          :update-time-text="currentMetric?.updateTime || '刚刚更新'"
          @update:holding-amount="holdingAmount = $event"
          @update:holding-profit="holdingProfit = $event"
        />

        <view v-else class="border border-line/65 rounded-[20rpx] bg-surface/96 px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)] backdrop-blur-[12rpx]">
          <text class="block text-[30rpx] text-primary font-600">
            没找到这条持仓
          </text>
          <text class="mt-[12rpx] block text-[24rpx] text-secondary leading-[36rpx]">
            这条记录可能已经被删除了，先回持仓页继续查看。
          </text>
        </view>
      </view>
    </view>

    <BottomActionBar
      :secondary-text="currentPosition ? '删除持仓' : undefined"
      :primary-text="currentPosition ? '保存修改' : '返回持仓页'"
      @primary="currentPosition ? handleSave() : router.replace(createHoldingsPath())"
      @secondary="handleRemove"
    />
  </view>
</template>
