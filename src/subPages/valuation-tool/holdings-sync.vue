<script setup lang="ts">
import { importPortfolioPositionsFromImage } from './api/valuationTool'
import { usePortfolio } from './composables/usePortfolio'
import {
  getPortfolioImportImageErrorMessage,
  isPortfolioImportImageSuccess,
  pickPortfolioImportImage,
} from './image-import'
import {
  createHoldingsAddPath,
  createHoldingsPath,
} from './utils'

definePage({
  name: 'valuation-tool-holdings-sync',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '同步持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const globalToast = useGlobalToast()
const { refreshPositions } = usePortfolio()
const isUploading = shallowRef(false)

function handleOpenManualEntry() {
  router.push(createHoldingsAddPath())
}

async function handleOpenScreenshotEntry() {
  if (isUploading.value)
    return

  const chooseImage = uni.chooseImage
  if (!chooseImage) {
    globalToast.error('当前环境暂不支持选择图片，请稍后再试。')
    return
  }

  try {
    const result = await chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    const selectedImage = pickPortfolioImportImage(result)
    if (!selectedImage) {
      globalToast.error('当前未读取到可上传的截图，请重新选择后再试。')
      return
    }

    isUploading.value = true
    const response = await importPortfolioPositionsFromImage(selectedImage.filePath)
    if (!isPortfolioImportImageSuccess(response)) {
      globalToast.error(getPortfolioImportImageErrorMessage(response))
      return
    }

    await refreshPositions()
    globalToast.success('持仓截图解析成功')
    router.replace(createHoldingsPath())
  }
  catch (error) {
    const errorMessage = `${error}`
    if (!errorMessage.toLowerCase().includes('cancel')) {
      globalToast.error(getPortfolioImportImageErrorMessage(error))
    }
  }
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <view class="overflow-x-hidden bg-page pb-[48rpx] pt-[24rpx]">
    <view
      class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx]"
      style="background: linear-gradient(180deg, rgba(232,241,255,0.96), rgba(248,250,253,0.72) 58%, transparent);"
    />
    <view
      class="pointer-events-none absolute right-[-120rpx] top-[88rpx] h-[240rpx] w-[240rpx] rounded-full opacity-70"
      style="background: radial-gradient(circle, rgba(120,161,255,0.18), transparent 68%);"
    />

    <view class="relative mx-auto max-w-[702rpx] px-[24rpx]">
      <view class="flex flex-col gap-[18rpx]">
        <view
          class="vt-top-card px-[24rpx] py-[24rpx]"
          @click="handleOpenManualEntry"
        >
          <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
            <view class="i-carbon-edit text-[30rpx]" />
          </view>
          <text class="mt-[18rpx] block text-[30rpx] text-primary font-600">
            手动录入
          </text>
          <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
            适合补录少量基金。输入基金、当前持有金额和累计收益，系统会自动换算底层持仓信息。
          </text>
        </view>

        <view
          class="vt-top-card px-[24rpx] py-[24rpx]"
          @click="handleOpenScreenshotEntry"
        >
          <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
            <view
              :class="isUploading ? 'i-carbon-circle-dash animate-spin text-[30rpx]' : 'i-carbon-image-search text-[30rpx]'"
            />
          </view>
          <text class="mt-[18rpx] block text-[30rpx] text-primary font-600">
            {{ isUploading ? '正在解析截图' : '上传截图' }}
          </text>
          <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
            {{ isUploading ? '请稍候，系统正在上传并解析持仓截图。解析成功后会直接回到持仓页。' : '适合一次录入多只基金。点击后直接选图上传，解析成功会回到持仓页并重新拉取最新持仓。' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
