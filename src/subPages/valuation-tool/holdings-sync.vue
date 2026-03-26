<script setup lang="ts">
import holdingsReferenceImage from '@/assets/holding.png'
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
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <view class="min-h-full overflow-x-hidden">
    <view class="mx-auto px-[24rpx]">
      <view class="flex flex-col items-center pt-[36rpx]">
        <wd-img
          :src="holdingsReferenceImage"
          mode="aspectFit"
          class="block h-[800rpx] w-full"
        />
        <text class="mt-[52rpx] px-[16rpx] text-center text-sm text-secondary leading-[40rpx]">
          请按示意图上传您各金融平台“持仓”截图
        </text>

        <view class="mt-[56rpx] w-[calc(100%-60rpx)] flex flex-col gap-[24rpx]">
          <wd-button
            block
            size="large"
            type="primary"
            custom-class="rounded-xl!"
            :loading="isUploading"
            @click="handleOpenScreenshotEntry"
          >
            {{ isUploading ? '正在解析截图' : '上传持仓截图' }}
          </wd-button>

          <wd-button
            size="large"
            block
            custom-class="bg-[#E0EAFA]! text-brand! rounded-xl!"
            type="info"
            @click="handleOpenManualEntry"
          >
            手动录入持仓
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>
