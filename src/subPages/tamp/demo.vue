<script setup lang="ts">
definePage({
  name: 'tamp-demo',
  layout: 'default',
  style: {
    navigationBarTitleText: 'TAMP 样例',
  },
})
</script>

<template>
  <view class="tamp-demo-page">
    <view class="content">
      <view class="success-card">
        <view class="icon-container">
          <text class="success-icon">
            ✓
          </text>
        </view>
        <view class="title">
          跳转成功
        </view>
        <view class="description">
          恭喜！您已成功通过 TAMP 中转页跳转到此页面
        </view>
      </view>

      <view class="info-section">
        <view class="section-title">
          跳转说明
        </view>
        <view class="info-item">
          <text class="label">
            中转页：
          </text>
          <text class="value">
            /subPages/tamp/index
          </text>
        </view>
        <view class="info-item">
          <text class="label">
            目标页：
          </text>
          <text class="value">
            /subPages/tamp/demo
          </text>
        </view>
        <view class="info-item">
          <text class="label">
            参数：
          </text>
          <text class="value">
            referer=/subPages/tamp/demo
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tamp-demo-page {
  min-height: 100vh;
  background: #f9f9f9;
}

.content {
  padding: 32rpx;
}

.success-card {
  background: white;
  border-radius: 16rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  text-align: center;
  margin-bottom: 32rpx;
}

.icon-container {
  width: 120rpx;
  height: 120rpx;
  margin: 0 auto 24rpx;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 64rpx;
  color: white;
  font-weight: bold;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.description {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.info-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 24rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.label {
  color: #666;
  font-size: 28rpx;
}

.value {
  color: #333;
  font-size: 28rpx;
  font-weight: 500;
}

.action-section {
  margin-top: 48rpx;
}
</style>
