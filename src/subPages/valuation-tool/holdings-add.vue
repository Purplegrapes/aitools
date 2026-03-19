<script setup lang="ts">
import type { PortfolioFundOption } from './types'
import AddPositionForm from './components/AddPositionForm.vue'
import BottomActionBar from './components/BottomActionBar.vue'
import { usePortfolio } from './composables/usePortfolio'
import { buildPortfolioPositionFromSnapshot, createHoldingsSyncPath } from './utils'

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

  const result = buildPortfolioPositionFromSnapshot(
    selectedFund.value,
    holdingAmount.value,
    holdingProfit.value,
  )

  if ('error' in result) {
    globalToast.error(result.error)
    return
  }

  addPosition(result.position)
  globalToast.success('持仓已保存')

  if (resetAfterSave) {
    keyword.value = ''
    selectedFund.value = null
    holdingAmount.value = ''
    holdingProfit.value = ''
    return
  }

  router.pushTab({ name: 'valuation-tool-holdings' })
}

function handleOpenScreenshotFlow() {
  router.push(createHoldingsSyncPath())
}
</script>

<template>
  <view class="relative min-h-screen overflow-hidden bg-surfaceSubtle pb-[220rpx] pt-[24rpx]">
    <view
      class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx]"
      style="background: linear-gradient(180deg, rgba(232,241,255,0.96), rgba(248,250,253,0.72) 58%, transparent);"
    />
    <view
      class="pointer-events-none absolute right-[-120rpx] top-[88rpx] h-[240rpx] w-[240rpx] rounded-full opacity-70"
      style="background: radial-gradient(circle, rgba(120,161,255,0.18), transparent 68%);"
    />

    <view class="relative mx-auto box-border max-w-[750rpx] w-full px-[24rpx]">
      <view class="border border-line/65 rounded-[20rpx] bg-surface/96 px-[24rpx] py-[24rpx] shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)] backdrop-blur-[12rpx]">
        <view class="mb-[20rpx] flex items-start justify-between gap-[16rpx]">
          <view>
            <text class="block text-[30rpx] text-primary font-600">
              手动录入一只基金
            </text>
            <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
              适合少量持仓，输入当前金额和累计收益即可。
            </text>
          </view>
          <view class="rounded-full bg-brand-muted px-[16rpx] py-[8rpx]">
            <text class="text-[22rpx] text-brand font-600">
              快速录入
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
            持有金额填你现在这只基金值多少钱，持有收益填当前累计赚了或亏了多少钱，系统会自动换算底层持仓信息。
          </text>
        </view>

        <view class="mt-[18rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[18rpx]">
          <text class="block text-[22rpx] text-secondary">
            还有批量录入需求？
          </text>
          <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
            如果你有多只基金要补录，可以直接去上传持仓截图，系统会先识别，再让你确认后保存。
          </text>
        </view>
      </view>
    </view>

    <BottomActionBar
      secondary-text="同步持仓"
      primary-text="保存持仓"
      @primary="handleSave(false)"
      @secondary="handleOpenScreenshotFlow"
    />
  </view>
</template>
