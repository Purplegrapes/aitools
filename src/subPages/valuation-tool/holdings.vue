<script setup lang="ts">
definePage({
  name: 'valuation-tool-holdings',
  layout: 'default',
  style: {
    navigationBarTitleText: '持有基金',
    navigationBarBackgroundColor: '#F5F7FA',
    navigationBarTextStyle: 'black',
  },
})

const router = useRouter()

function handleBackHome() {
  router.replace('/subPages/valuation-tool/index')
}
</script>

<template>
  <view class="min-h-screen bg-page px-4 pb-8 pt-4">
    <view class="pointer-events-none absolute inset-x-0 top-0 h-[260rpx] bg-[radial-gradient(circle_at_top,_rgba(22,120,255,0.14),_transparent_62%)]" />

    <view class="relative mx-auto max-w-[680rpx]">
      <view class="border border-line/70 rounded-[32rpx] bg-surface p-6 shadow-[0_20rpx_48rpx_rgba(17,37,62,0.06)]">
        <view class="h-[72rpx] w-[72rpx] flex items-center justify-center rounded-[24rpx] bg-brand-muted text-brand">
          <view class="i-carbon-wallet text-[34rpx]" />
        </view>
        <text class="mt-4 block text-lg text-primary font-600">
          持有入口已预留
        </text>
        <text class="mt-2 block text-sm text-regular leading-6">
          后续会在这里展示你真正持有的基金、成本和盈亏情况。当前先保留为稳定入口，方便首页直达。
        </text>
        <view class="mt-5">
          <wd-button size="small" type="primary" @click="handleBackHome">
            返回首页
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>
