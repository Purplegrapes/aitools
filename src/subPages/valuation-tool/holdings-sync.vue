<script setup lang="ts">
import { recognizePortfolioScreenshots } from './api/valuationTool'
import { setPortfolioRecognitionSession } from './composables/usePortfolioRecognitionSession'
import { createHoldingsAddPath, createHoldingsUploadPath, getRecognitionDraftStatusMeta } from './utils'

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

function handleOpenManualEntry() {
  router.push(createHoldingsAddPath())
}

async function handleOpenScreenshotEntry() {
  const chooseImage = uni.chooseImage
  if (!chooseImage) {
    globalToast.error('当前环境暂不支持选择图片，请稍后再试。')
    return
  }

  try {
    const result = await chooseImage({
      count: 6,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    const fileNames = (result.tempFiles || []).map((item, index) => {
      if ('name' in item && item.name)
        return item.name
      return `持仓截图-${index + 1}.png`
    })

    const response = await recognizePortfolioScreenshots({
      fileNames,
    })

    const drafts = response.data.items.map((item) => {
      const meta = getRecognitionDraftStatusMeta(item)
      return {
        ...item,
        status: meta.status,
        issue: meta.issue,
      }
    }).filter(item => item.status === 'ready')

    setPortfolioRecognitionSession({
      selectedImageNames: fileNames,
      drafts,
      recognitionState: drafts.length ? 'ready' : 'empty',
      recognitionError: drafts.length ? '' : '暂未识别到可导入的持仓信息，请重新上传或改为手动录入。',
    })
    router.push(createHoldingsUploadPath())
  }
  catch (error) {
    const errorMessage = `${error}`
    if (errorMessage.toLowerCase().includes('cancel'))
      return

    globalToast.error('截图识别失败，请重新上传或改为手动录入。')
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
            <view class="i-carbon-image-search text-[30rpx]" />
          </view>
          <text class="mt-[18rpx] block text-[30rpx] text-primary font-600">
            上传截图
          </text>
          <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
            适合一次录入多只基金。点击后会直接打开图片选择，选完就进入待确认的识别列表页。
          </text>
        </view>
      </view>
    </view>
  </view>
</template>
