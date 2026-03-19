<script setup lang="ts">
import { createResultPath, createValuationHomePath, normalizeKeyword } from './utils'

definePage({
  name: 'valuation-tool-mine-scan',
  layout: 'default',
  style: {
    navigationBarTitleText: '基金诊断',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
const route = useRoute()
const fundCode = computed(() => normalizeKeyword(route.query.code))

function handleBackToDetail() {
  if (!fundCode.value) {
    router.replace(createValuationHomePath())
    return
  }

  router.replace(createResultPath(fundCode.value))
}
</script>

<template>
  <view class="min-h-screen bg-page vt-page-shell pb-8">
    <view class="mx-auto max-w-[680rpx] vt-top-card p-6">
      <view class="h-[96rpx] w-[96rpx] flex items-center justify-center rounded-full bg-brand-muted text-brand">
        <view class="i-carbon-warning-alt-filled text-[44rpx]" />
      </view>
      <text class="mt-4 block text-lg text-primary font-600">
        基金诊断入口已打开
      </text>
      <text class="mt-2 block text-sm text-regular leading-6">
        当前基金代码：{{ fundCode || '未提供' }}。后续扫雷能力会基于这个基金继续展开，这一页先作为稳定入口保留。
      </text>
      <view class="mt-5">
        <wd-button block size="large" type="primary" @click="handleBackToDetail">
          返回基金详情
        </wd-button>
      </view>
    </view>
  </view>
</template>
