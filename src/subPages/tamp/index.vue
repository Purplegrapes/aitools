<script setup lang="ts">
import { buildLegacyGatewayRedirectRoute } from '../auth/utils/gateway'

definePage({
  name: 'tamp',
  layout: 'default',
  style: {
    navigationBarTitleText: '认证跳转',
  },
})

const router = useRouter()
const route = useRoute()

onMounted(() => {
  router.replace(buildLegacyGatewayRedirectRoute(route.query as Record<string, unknown>))
})
</script>

<template>
  <view class="min-h-screen flex items-center justify-center bg-page px-[24rpx]">
    <view class="rounded-card bg-surface px-[28rpx] py-[24rpx] text-secondary shadow-sm">
      正在校验登录并跳转...
    </view>
  </view>
</template>
