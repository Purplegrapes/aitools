<script setup lang="ts">
import BottomActionBar from './components/BottomActionBar.vue'
import UploadPositionCard from './components/UploadPositionCard.vue'
import { createHoldingsAddPath } from './utils'

definePage({
  name: 'valuation-tool-holdings-upload',
  layout: 'default',
  style: {
    navigationBarTitleText: '上传持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const globalToast = useGlobalToast()
const router = useRouter()

function handleChooseFile() {
  globalToast.success('上传入口已预留，后续会补完整导入流程')
}
</script>

<template>
  <view class="min-h-screen overflow-x-hidden bg-surfaceSubtle pb-[220rpx] pt-[24rpx]">
    <view
      class="pointer-events-none absolute inset-x-0 top-0 h-[320rpx]"
      style="background: linear-gradient(180deg, rgba(232,241,255,0.96), rgba(248,250,253,0.74) 58%, transparent);"
    />
    <view
      class="pointer-events-none absolute left-[-110rpx] top-[112rpx] h-[220rpx] w-[220rpx] rounded-full opacity-70"
      style="background: radial-gradient(circle, rgba(120,161,255,0.16), transparent 70%);"
    />

    <view class="relative mx-auto max-w-[702rpx] px-[24rpx]">
      <view class="px-[4rpx] py-[8rpx]">
        <text class="block text-[34rpx] text-primary font-700">
          上传持仓
        </text>
        <text class="mt-[10rpx] block text-[24rpx] text-secondary leading-[36rpx]">
          批量导入会更快。首版先预留入口和说明，后续再补完整导入流程。
        </text>
      </view>

      <view class="mt-[18rpx]">
        <UploadPositionCard />
      </view>
    </view>

    <BottomActionBar
      secondary-text="手动添加"
      primary-text="选择文件"
      @primary="handleChooseFile"
      @secondary="router.push(createHoldingsAddPath())"
    />
  </view>
</template>
