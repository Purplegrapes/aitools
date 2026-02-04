<script setup lang="ts">
import { useUserStore } from '@/store/userStore'
import { handleExternalRedirect } from './utils/externalRedirect'
import { detectAccessMode, getPageQuery } from './utils/sourceDetector'

definePage({
  name: 'tamp',
  layout: 'default',
  style: {
    navigationBarTitleText: 'TAMP',
  },
})

const userStore = useUserStore()

// 外部来源状态
const externalSource = ref<{
  source: 'miniprogram' | 'h5' | 'internal'
  appId?: string
  loginUrl?: string
}>({
  source: 'internal',
})

// 检测并处理外部跳入
onMounted(async () => {
  console.log('TAMP 页面加载')

  const query = getPageQuery()
  const { mode, source } = detectAccessMode(query)

  console.log('访问模式:', { mode, source, query })

  // 外部跳入模式
  if (mode === 'external') {
    externalSource.value = {
      source,
      appId: query.appId as string || undefined,
      loginUrl: query.loginUrl as string || undefined,
    }

    // 从URL参数直接获取token（临时方案）
    const accessToken = query.accessToken || query.token
    const refreshToken = query.refreshToken || ''

    if (accessToken) {
      console.log('从URL参数获取token...')
      userStore.setTokens({
        accessToken,
        refreshToken,
      })
      console.log('token设置成功')

      // 清理URL中的token参数（可选）
      // #ifdef H5
      if (import.meta.env.MODE === 'development') {
        const url = new URL(window.location.href)
        url.searchParams.delete('accessToken')
        url.searchParams.delete('token')
        url.searchParams.delete('refreshToken')
        window.history.replaceState({}, '', url.toString())
      }
      // #endif

      return
    }

    // 原有逻辑：通过API获取token（服务端实现后启用）
    // try {
    //   if (source === 'miniprogram' && query.code) {
    //     console.log('通过code换取token...')
    //     await userStore.loginByCode(query.code, query.appId)
    //     console.log('code换取token成功')
    //   }
    //   else if (source === 'h5' && query.sessionId) {
    //     console.log('通过sessionId获取token...')
    //     await userStore.loginBySession(query.sessionId)
    //     console.log('sessionId获取token成功')
    //   }
    // }
    // catch (error: any) {
    //   console.error('外部认证失败:', error)
    //   await handleExternalRedirect(source, query.loginUrl)
    // }

    // 如果没有token，跳转外部登录
    console.warn('URL中未找到token参数，跳转外部登录')
    await handleExternalRedirect(source, query.loginUrl)
  }
  // 内部访问模式
  else {
    console.log('内部访问模式，无需外部认证')
  }
})
</script>

<template>
  <view class="tamp-page">
    <wd-navbar title="TAMP" />
    <view class="content">
      <view class="info-card">
        <view class="info-item">
          <text class="label">
            来源:
          </text>
          <text class="value">
            {{ externalSource.source }}
          </text>
        </view>
        <view v-if="externalSource.appId" class="info-item">
          <text class="label">
            AppID:
          </text>
          <text class="value">
            {{ externalSource.appId }}
          </text>
        </view>
        <view v-if="userStore.accessToken" class="info-item">
          <text class="label">
            Token:
          </text>
          <text class="value">
            {{ userStore.accessToken.slice(0, 10) }}...
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.tamp-page {
  min-height: 100vh;
  background: #f9f9f9;
}

.content {
  padding: 32rpx;
}

.info-card {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
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
</style>
