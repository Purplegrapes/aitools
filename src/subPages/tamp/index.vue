<script setup lang="ts">
import { useTampStore } from '@/store/tampStore'
import { detectAccessMode } from './utils/sourceDetector'

definePage({
  name: 'tamp',
  layout: 'default',
  style: {
    navigationBarTitleText: 'TAMP',
  },
})

const router = useRouter()
const route = useRoute()
const tampStore = useTampStore()

// 检测并处理外部跳入，完成后根据referer参数跳转
onMounted(async () => {
  console.log('TAMP 页面加载 - 处理公共逻辑')

  const query = route.query
  const { mode, source } = detectAccessMode(query)
  const rawReferer = query.referer as string | undefined
  const rawLoginUrl = query.loginUrl as string | undefined
  const referer = rawReferer ? decodeURIComponent(rawReferer) : undefined
  const loginUrl = rawLoginUrl ? decodeURIComponent(rawLoginUrl) : undefined

  console.log('访问模式:', { mode, source, referer, query })

  // 外部跳入模式
  if (mode === 'external') {
    // 从URL参数直接获取token（临时方案）
    const rawToken = query.token as string | undefined
    const token = rawToken ? decodeURIComponent(rawToken) : undefined

    if (token) {
      console.log('从URL参数获取token...')

      // 清理URL中的token参数（可选）
      // #ifdef H5
      if (import.meta.env.MODE === 'development') {
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.toString())
      }
      // #endif
    }
    // 存储外部来源信息到 tampStore
    tampStore.setExternalInfo({
      source,
      token,
      loginUrl,
    })

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
    //   // 认证成功后跳转
    //   await redirectToTarget(referer)
    // }
    // catch (error: any) {
    //   console.error('外部认证失败:', error)
    //   await handleExternalRedirect(source, query.loginUrl)
    // }
  }

  // 内部访问模式 - 直接跳转
  await redirectToTarget(referer || '/subPages/tamp/demo')
})

/**
 * 跳转到目标页面
 * @param referer 目标页面路径，如果为空则跳转到首页
 */
async function redirectToTarget(referer: string) {
  // 使用 replace 避免返回到 TAMP 中转页
  router.replace(referer)
}
</script>

<template>
  <view />
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
