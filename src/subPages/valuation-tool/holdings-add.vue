<script setup lang="ts">
import type { PortfolioFundOption } from './types'
import AddPositionForm from './components/AddPositionForm.vue'
import BottomActionBar from './components/BottomActionBar.vue'
import { usePortfolio } from './composables/usePortfolio'
import { buildPortfolioPositionFromSnapshot, createHoldingsPath, createHoldingsSyncPath } from './utils'

definePage({
  name: 'valuation-tool-holdings-add',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '添加持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const globalToast = useGlobalToast()
const { ensureLoaded, addManualPosition, searchFundsByKeyword } = usePortfolio()

const keyword = shallowRef('')
const selectedFund = shallowRef<PortfolioFundOption | null>(null)
const holdingAmount = shallowRef('')
const holdingProfit = shallowRef('')
const searchResults = shallowRef<PortfolioFundOption[]>([])
const searchLoading = shallowRef(false)
let searchSeq = 0
let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(keyword, (value) => {
  const normalizedKeyword = value.trim()
  if (!normalizedKeyword) {
    selectedFund.value = null
    searchResults.value = []
    searchLoading.value = false
    return
  }

  if (selectedFund.value && normalizedKeyword !== selectedFund.value.name)
    selectedFund.value = null

  if (selectedFund.value && normalizedKeyword === selectedFund.value.name) {
    searchResults.value = []
    searchLoading.value = false
    return
  }

  if (searchTimer)
    clearTimeout(searchTimer)

  searchTimer = setTimeout(async () => {
    const seq = ++searchSeq
    const requestKeyword = normalizedKeyword
    searchLoading.value = true
    try {
      const results = await searchFundsByKeyword(requestKeyword)
      if (seq !== searchSeq)
        return
      if (keyword.value.trim() === requestKeyword)
        searchResults.value = results
    }
    finally {
      if (seq === searchSeq)
        searchLoading.value = false
    }
  }, 240)
})

onShow(() => {
  ensureLoaded()
})

onBeforeUnmount(() => {
  if (searchTimer)
    clearTimeout(searchTimer)
})

function handleSelectFund(fund: PortfolioFundOption) {
  selectedFund.value = fund
  keyword.value = fund.name
  searchResults.value = []
  searchLoading.value = false
}

async function handleSave(resetAfterSave = false) {
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

  try {
    await addManualPosition({
      code: result.position.code,
      name: result.position.name,
      holdingAmount: Number(holdingAmount.value),
      holdingProfit: Number(holdingProfit.value),
    })
    globalToast.success('持仓已保存')
  }
  catch {
    globalToast.error('持仓保存失败，请稍后再试')
    return
  }

  if (resetAfterSave) {
    keyword.value = ''
    selectedFund.value = null
    holdingAmount.value = ''
    holdingProfit.value = ''
    return
  }

  router.replace(createHoldingsPath())
}

function handleOpenScreenshotFlow() {
  router.push(createHoldingsSyncPath())
}
</script>

<template>
  <view class="relative overflow-x-hidden bg-page vt-page-shell pb-[calc(env(safe-area-inset-bottom)+156rpx)]">
    <view
      class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx]"
      style="background: linear-gradient(180deg, rgba(232,241,255,0.92), rgba(245,247,250,0) 72%);"
    />

    <view class="relative mx-auto flex flex-col">
      <view class="vt-top-card px-[24rpx] py-[24rpx]">
        <view class="mb-[20rpx] flex items-start justify-between gap-[16rpx]">
          <view>
            <text class="block text-[32rpx] text-primary font-600">
              手动录入持仓
            </text>
            <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
              选基金后，填写持有金额和持有收益即可保存。
            </text>
          </view>
          <text class="rounded-full bg-brand-muted px-[14rpx] py-[6rpx] text-[20rpx] text-brand font-600">
            逐条添加
          </text>
        </view>

        <AddPositionForm
          v-model:holding-amount="holdingAmount"
          v-model:holding-profit="holdingProfit"
          v-model:keyword="keyword"
          :hide-actions="true"
          :results="searchResults"
          :search-loading="searchLoading"
          :selected-fund="selectedFund"
          @select-fund="handleSelectFund"
        />

        <view class="mt-[24rpx] border-t border-line/70 pt-[20rpx]">
          <text class="block text-[22rpx] text-secondary">
            其他方式
          </text>
          <view
            class="mt-[10rpx] flex items-center justify-between gap-[12rpx] rounded-[16rpx] bg-surfaceSubtle px-[18rpx] py-[16rpx]"
            hover-class="opacity-88"
            @click="handleOpenScreenshotFlow"
          >
            <view class="min-w-0 flex-1">
              <text class="block text-[24rpx] text-primary font-500">
                同步持仓
              </text>
              <text class="mt-[6rpx] block text-[21rpx] text-secondary leading-[32rpx]">
                批量补录时更省事，上传截图后确认即可。
              </text>
            </view>
            <view class="flex shrink-0 items-center gap-[4rpx] text-[22rpx] text-brand font-600">
              去同步
              <view class="i-carbon-chevron-right text-[18rpx]" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <BottomActionBar
      primary-text="保存持仓"
      @primary="handleSave(false)"
    />
  </view>
</template>
