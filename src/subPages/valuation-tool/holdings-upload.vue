<script setup lang="ts">
import { createHoldingsSyncPath } from './utils'

definePage({
  name: 'valuation-tool-holdings-upload',
  layout: 'default',
  style: {
    backgroundColor: '#F5F7FA',
    navigationBarTitleText: '同步持仓',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()
onShow(() => {
  router.replace(createHoldingsSyncPath())
})
</script>

<template>
  <view class="bg-page px-[24rpx] pt-[48rpx] text-center">
    <wd-loading />
    <text class="mt-[18rpx] block text-[28rpx] text-primary font-600">
      正在返回同步持仓页
    </text>
  </view>
</template>
