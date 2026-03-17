<script setup lang="ts">
import type { PortfolioFundOption } from './types'
import AddPositionForm from './components/AddPositionForm.vue'
import BottomActionBar from './components/BottomActionBar.vue'
import { usePortfolio } from './composables/usePortfolio'
import { createHoldingsPath, createHoldingsUploadPath } from './utils'

definePage({
  name: 'valuation-tool-holdings-add',
  layout: 'default',
  style: {
    navigationBarTitleText: '添加持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const globalToast = useGlobalToast()
const { ensureLoaded, addPosition, searchFunds } = usePortfolio()

const keyword = shallowRef('')
const selectedFund = shallowRef<PortfolioFundOption | null>(null)
const holdingAmount = shallowRef('')
const holdingProfit = shallowRef('')

const searchResults = computed(() => {
  if (!keyword.value.trim())
    return []
  if (selectedFund.value && keyword.value.trim() === selectedFund.value.name)
    return []
  return searchFunds(keyword.value)
})

onShow(() => {
  ensureLoaded()
})

function handleSelectFund(fund: PortfolioFundOption) {
  selectedFund.value = fund
  keyword.value = fund.name
}

function handleSave(resetAfterSave = false) {
  if (!selectedFund.value) {
    globalToast.error('请先选择基金')
    return
  }

  const currentNav = Number(selectedFund.value.estimatedNav)
  const holdingAmountValue = Number(holdingAmount.value)
  const holdingProfitValue = Number(holdingProfit.value)

  if (!currentNav || Number.isNaN(currentNav)) {
    globalToast.error('当前估值暂不可用，暂时无法保存持仓')
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

  addPosition({
    code: selectedFund.value.code,
    name: selectedFund.value.name,
    shares: sharesValue,
    costNav: costNavValue,
  })
  globalToast.success('持仓已保存')

  if (resetAfterSave) {
    keyword.value = ''
    selectedFund.value = null
    holdingAmount.value = ''
    holdingProfit.value = ''
    return
  }

  router.replace(createHoldingsPath())
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
          添加持仓
        </text>
        <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
          先选基金，再填持有金额和持有收益，保存后就能回到持仓页看整体收益。
        </text>
      </view>

      <view class="mt-[18rpx] border border-line/65 rounded-[20rpx] bg-surface/96 px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)] backdrop-blur-[12rpx]">
        <view class="mb-[20rpx] flex items-start justify-between gap-[16rpx]">
          <view>
            <text class="block text-[30rpx] text-primary font-600">
              录入一只基金
            </text>
            <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
              搜索基金后，只需要补两个关键数字。
            </text>
          </view>
          <view class="rounded-full bg-brand-muted px-[16rpx] py-[8rpx]">
            <text class="text-[22rpx] text-brand font-600">
              轻量录入
            </text>
          </view>
        </view>

        <AddPositionForm
          v-model:holding-amount="holdingAmount"
          v-model:holding-profit="holdingProfit"
          v-model:keyword="keyword"
          :hide-actions="true"
          :results="searchResults"
          :selected-fund="selectedFund"
          @select-fund="handleSelectFund"
        />

        <view class="mt-[18rpx] rounded-[16rpx] bg-brand-muted/70 px-[18rpx] py-[18rpx]">
          <text class="block text-[22rpx] text-secondary">
            填写提示
          </text>
          <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
            持有金额填你现在这只基金的金额，持有收益填当前累计收益，系统会自动换算底层持仓信息。
          </text>
        </view>
      </view>
    </view>

    <BottomActionBar
      secondary-text="上传持仓"
      primary-text="保存持仓"
      @primary="handleSave(false)"
      @secondary="router.push(createHoldingsUploadPath())"
    />
  </view>
</template>
