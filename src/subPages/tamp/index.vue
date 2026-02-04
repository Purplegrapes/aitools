<script setup lang="ts">
import { getTampData } from './api'

const { data, loading, error } = useRequest(getTampData)

definePage({
  name: 'tamp',
  layout: 'default',
  style: {
    navigationBarTitleText: 'TAMP',
  },
})
console.log('TAMP 页面加载', { data, loading, error })
</script>

<template>
  <view class="tamp-page">
    <wd-navbar title="TAMP" />
    <view v-if="loading" class="loading">
      <wd-loading />
    </view>
    <view v-else-if="error" class="error">
      {{ error }}
    </view>
    <view v-else class="content">
      TAMP 子包页面
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tamp-page {
  min-height: 100vh;
  background: #f9f9f9;
}

.loading,
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
}

.content {
  padding: 32rpx;
}
</style>
