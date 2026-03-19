<script setup lang="ts">
import type { PortfolioRecognitionDraft, PortfolioRecognitionState } from './types'
import { confirmRecognizedPortfolioPositions, recognizePortfolioScreenshots } from './api/valuationTool'
import BottomActionBar from './components/BottomActionBar.vue'
import UploadPositionCard from './components/UploadPositionCard.vue'
import { usePortfolio } from './composables/usePortfolio'
import { consumePortfolioRecognitionSession } from './composables/usePortfolioRecognitionSession'
import {
  buildPortfolioPositionFromSnapshot,
  createHoldingsPath,
  createHoldingsSyncPath,
  getRecognitionDraftStatusMeta,
} from './utils'

definePage({
  name: 'valuation-tool-holdings-upload',
  layout: 'default',
  style: {
    navigationBarTitleText: '确认持仓信息',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const globalToast = useGlobalToast()
const router = useRouter()
const {
  ensureLoaded,
  addPosition,
  resolveFundOption,
} = usePortfolio()

const recognitionState = shallowRef<PortfolioRecognitionState>('idle')
const recognitionError = shallowRef('')
const selectedImageNames = shallowRef<string[]>([])
const drafts = shallowRef<PortfolioRecognitionDraft[]>([])

onShow(() => {
  ensureLoaded()
  const nextSession = consumePortfolioRecognitionSession()
  if (nextSession) {
    selectedImageNames.value = nextSession.selectedImageNames
    drafts.value = nextSession.drafts
    recognitionState.value = nextSession.recognitionState
    recognitionError.value = nextSession.recognitionError
  }
})

function refreshDraftStatus(draft: PortfolioRecognitionDraft) {
  const meta = getRecognitionDraftStatusMeta(draft)
  return {
    ...draft,
    status: meta.status,
    issue: meta.issue,
  } satisfies PortfolioRecognitionDraft
}

function retainReadyDrafts(items: PortfolioRecognitionDraft[]) {
  return items.filter(item => item.status === 'ready')
}

function patchDraft(id: string, patch: Partial<PortfolioRecognitionDraft>) {
  drafts.value = drafts.value.map((item) => {
    if (item.id !== id)
      return item
    return refreshDraftStatus({
      ...item,
      ...patch,
    })
  })
}

async function handleChooseImages() {
  const chooseImage = uni.chooseImage
  if (!chooseImage) {
    recognitionState.value = 'error'
    recognitionError.value = '当前环境暂不支持选择图片，请稍后再试或改为手动录入。'
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

    selectedImageNames.value = fileNames
    await runRecognition(fileNames)
  }
  catch (error) {
    const errorMessage = `${error}`
    if (errorMessage.toLowerCase().includes('cancel'))
      return

    recognitionState.value = 'error'
    recognitionError.value = '截图选择失败，请重新上传或改为手动录入。'
  }
}

async function runRecognition(fileNames: string[]) {
  recognitionState.value = 'recognizing'
  recognitionError.value = ''

  try {
    const response = await recognizePortfolioScreenshots({
      fileNames,
    })
    const items = retainReadyDrafts(response.data.items.map(refreshDraftStatus))

    drafts.value = items
    recognitionState.value = items.length ? 'ready' : 'empty'
  }
  catch {
    drafts.value = []
    recognitionState.value = 'error'
    recognitionError.value = '截图识别失败，请重新上传后再试。'
  }
}

function handleReuploadImages() {
  handleChooseImages()
}

function handleRemoveDraft(id: string) {
  drafts.value = drafts.value.filter(item => item.id !== id)
  if (!drafts.value.length)
    recognitionState.value = 'empty'
}

async function handleConfirmImport() {
  const readyDrafts = drafts.value.filter(item => item.status === 'ready')
  if (!readyDrafts.length) {
    globalToast.error('当前没有可导入的持仓记录')
    return
  }

  const importedIds: string[] = []
  let importedCount = 0

  for (const draft of readyDrafts) {
    const fund = draft.code ? resolveFundOption(draft.code) : resolveFundOption(draft.name)
    if (!fund)
      continue

    const result = buildPortfolioPositionFromSnapshot(
      fund,
      draft.holdingAmount,
      draft.holdingProfit,
    )

    if ('error' in result)
      continue

    addPosition(result.position)
    importedIds.push(draft.id)
    importedCount += 1
  }

  if (!importedCount) {
    globalToast.error('暂时没有可导入的持仓，请先确认基金和金额信息')
    return
  }

  await confirmRecognizedPortfolioPositions({
    items: readyDrafts.filter(item => importedIds.includes(item.id)),
  })

  drafts.value = drafts.value.filter(item => !importedIds.includes(item.id))

  if (!drafts.value.length) {
    globalToast.success(`已导入 ${importedCount} 条持仓`)
    router.replace(createHoldingsPath())
    return
  }

  recognitionState.value = 'ready'
  globalToast.success(`已导入 ${importedCount} 条持仓，剩余项可继续处理`)
}

function handlePrimaryAction() {
  if (recognitionState.value === 'ready') {
    handleConfirmImport()
    return
  }

  handleChooseImages()
}

function handleSecondaryAction() {
  if (recognitionState.value === 'ready') {
    handleReuploadImages()
    return
  }

  router.replace(createHoldingsSyncPath())
}
</script>

<template>
  <view class="min-h-screen overflow-x-hidden bg-page pb-[220rpx] pt-[24rpx]">
    <view
      class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx]"
      style="background: linear-gradient(180deg, rgba(232,241,255,0.96), rgba(248,250,253,0.74) 58%, transparent);"
    />
    <view
      class="pointer-events-none absolute left-[-110rpx] top-[112rpx] h-[220rpx] w-[220rpx] rounded-full opacity-70"
      style="background: radial-gradient(circle, rgba(120,161,255,0.16), transparent 70%);"
    />

    <view class="relative mx-auto max-w-[702rpx] px-[24rpx]">
      <view v-if="recognitionState === 'idle'" class="flex flex-col gap-[18rpx]">
        <UploadPositionCard />
      </view>

      <view
        v-else-if="recognitionState === 'recognizing'"
        class="vt-top-card px-[24rpx] py-[36rpx] text-center"
      >
        <wd-loading />
        <text class="mt-[18rpx] block text-[28rpx] text-primary font-600">
          正在识别持仓截图
        </text>
        <text class="mt-[10rpx] block text-[22rpx] text-secondary leading-[34rpx]">
          我们会先帮你提取基金、持有金额和持有收益，识别后还需要你再确认一次。
        </text>
      </view>

      <view
        v-else-if="recognitionState === 'empty' || recognitionState === 'error'"
        class="vt-top-card px-[24rpx] py-[24rpx]"
      >
        <text class="block text-[30rpx] text-primary font-600">
          {{ recognitionState === 'empty' ? '暂未识别到持仓信息' : '截图识别失败' }}
        </text>
        <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
          {{ recognitionError || '建议上传基金持仓列表页截图，或者返回同步持仓页改为手动录入。当前只会保留识别成功的基金。' }}
        </text>
      </view>

      <view v-else class="flex flex-col gap-[18rpx]">
        <view class="vt-top-card px-[24rpx] py-[22rpx]">
          <text class="block text-[30rpx] text-primary font-600">
            确认持仓信息
          </text>
          <text class="mt-[8rpx] block text-[22rpx] text-secondary leading-[34rpx]">
            已识别 {{ drafts.length }} 条可导入记录，确认后会直接同步到你的持仓。
          </text>
          <text v-if="selectedImageNames.length" class="mt-[10rpx] block text-[22rpx] text-secondary leading-[34rpx]">
            本次上传：{{ selectedImageNames.join('、') }}
          </text>
        </view>

        <view class="overflow-hidden rounded-[20rpx] bg-surface shadow-[0_16rpx_36rpx_rgba(17,37,62,0.05)]">
          <view class="grid grid-cols-[2.4fr_1.2fr_1.2fr_72rpx] gap-[16rpx] border-b border-line/70 px-[24rpx] py-[18rpx]">
            <text class="text-[22rpx] text-secondary font-600">
              基金
            </text>
            <text class="text-[22rpx] text-secondary font-600">
              持有金额
            </text>
            <text class="text-[22rpx] text-secondary font-600">
              持有收益
            </text>
            <text class="text-center text-[22rpx] text-secondary font-600">
              操作
            </text>
          </view>

          <view
            v-for="draft in drafts"
            :key="draft.id"
            class="border-b border-line/55 px-[24rpx] py-[20rpx] last:border-b-0"
          >
            <view class="grid grid-cols-[2.4fr_1.2fr_1.2fr_72rpx] items-start gap-[16rpx]">
              <view class="min-w-0">
                <text class="block truncate text-[28rpx] text-primary font-600 leading-[36rpx]">
                  {{ draft.name }}
                </text>
                <text class="mt-[6rpx] block text-[22rpx] text-secondary">
                  {{ draft.code || '待匹配' }}
                </text>
              </view>

              <input
                class="h-[40rpx] rounded-[12rpx] bg-surfaceSubtle px-[12rpx] text-[26rpx] text-primary"
                type="digit"
                :value="draft.holdingAmount"
                placeholder="金额"
                placeholder-class="text-[24rpx] text-tertiary"
                @input="patchDraft(draft.id, { holdingAmount: ($event as InputEvent).detail.value })"
              >

              <input
                class="h-[40rpx] rounded-[12rpx] bg-surfaceSubtle px-[12rpx] text-[26rpx] text-primary"
                type="text"
                :value="draft.holdingProfit"
                placeholder="收益"
                placeholder-class="text-[24rpx] text-tertiary"
                @input="patchDraft(draft.id, { holdingProfit: ($event as InputEvent).detail.value })"
              >

              <view
                class="h-[40rpx] w-[40rpx] flex items-center justify-center justify-self-center rounded-full bg-danger/8 text-danger"
                @click="handleRemoveDraft(draft.id)"
              >
                <view class="i-carbon-trash-can text-[22rpx]" />
              </view>
            </view>
          </view>
        </view>

        <view v-if="hasDrafts" class="rounded-[18rpx] bg-surface px-[22rpx] py-[22rpx]">
          <text class="block text-[22rpx] text-secondary">
            导入说明
          </text>
          <text class="mt-[8rpx] block text-[24rpx] text-primary leading-[36rpx]">
            可导入项会先保存到你的持仓里，待确认项会继续保留在这里，方便你补充后再导入。
          </text>
        </view>
      </view>
    </view>

    <BottomActionBar
      :secondary-text="recognitionState === 'ready' ? '重新上传' : '手动录入'"
      :primary-text="recognitionState === 'ready' ? '确认导入' : '选择截图'"
      @primary="handlePrimaryAction"
      @secondary="handleSecondaryAction"
    />
  </view>
</template>
