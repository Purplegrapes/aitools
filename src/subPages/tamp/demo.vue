<script setup lang="ts">
import { getShopInfo } from './api'

/**
 * 分享信息
 */
interface ShareInfo {
  content: string
  image: string
  imageType: string
}

/**
 * 店铺信息
 */
interface ShopInfo {
  id: string
  auditTaskId: string
  name: string
  description: string
  logo: string
  shareInfo: ShareInfo
  newUserLogin: boolean
  guideFavorite: boolean
  creator: string
  auditStatus: string
  fansCount: number
  subscribeCount: number
  createTime: string
  auditType: string
  shopStatus: string
  nameUpdateTime: string
  validationMethod: string | null
}

definePage({
  name: 'tamp-demo',
  layout: 'default',
  style: {
    navigationBarTitleText: '店铺详情',
  },
})

const route = useRoute()

// 从 URL 参数获取 shopId，默认使用测试店铺 ID
const shopId = (route.query.shopId as string) || 'V0000725'

// 获取店铺信息
const { data, loading, error } = useRequest(
  getShopInfo({ params: { shopId } }),
)

// 店铺信息
const shopInfo = computed<ShopInfo | null>(() => {
  if (!data.value)
    return null
  const result = data.value as any
  return result?.data || null
})

const pageTitle = computed(() => shopInfo.value?.name || '')
const pageSubtitle = computed(() => shopInfo.value?.description || '')

const introParagraphs = computed(() => {
  const description = shopInfo.value?.description || ''
  return description.split(/\n+/).map(item => item.trim()).filter(Boolean)
})
</script>

<template>
  <view class="box-border min-h-screen bg-[radial-gradient(120%_80%_at_20%_0%,_#e4f2ff_0%,_#f4f6fb_55%,_#f8fafc_100%)] text-slate-900">
    <!-- 加载状态 -->
    <view v-if="loading" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <wd-loading />
      <text class="text-sm text-slate-500">
        加载中...
      </text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <text class="text-sm text-red-500">
        加载失败，请重试
      </text>
    </view>

    <view v-else class="mx-auto box-border max-w-[720px] w-full px-6 pb-10 pt-6 text-center">
      <view class="flex flex-col items-center gap-3 py-6">
        <view class="h-[180rpx] w-[180rpx] flex items-center justify-center">
          <view class="h-[160rpx] w-[160rpx] flex items-center justify-center rounded-full bg-white shadow-[0_18rpx_40rpx_rgba(15,23,42,0.12)]">
            <view class="h-[132rpx] w-[132rpx] flex items-center justify-center rounded-full bg-[repeating-linear-gradient(45deg,_#111827_0,_#111827_4rpx,_#f8fafc_4rpx,_#f8fafc_8rpx)]">
              <image
                v-if="shopInfo?.logo"
                :src="shopInfo.logo"
                class="h-[120rpx] w-[120rpx] rounded-full"
                mode="aspectFill"
              />
            </view>
          </view>
        </view>
        <view class="text-[36rpx] text-slate-900 font-bold tracking-[2rpx]">
          {{ pageTitle }}
        </view>
        <view class="text-[24rpx] text-slate-500">
          {{ pageSubtitle }}
        </view>
      </view>

      <view class="my-6 h-[2rpx] bg-[linear-gradient(90deg,_transparent,_rgba(148,163,184,0.6),_transparent)]" />

      <view class="rounded-[24rpx] bg-[rgba(248,250,252,0.7)] px-6 pb-9 pt-7 text-slate-700 shadow-[0_20rpx_60rpx_rgba(15,23,42,0.06)]">
        <view class="flex flex-col gap-4 text-center">
          <text
            v-for="(paragraph, index) in introParagraphs"
            :key="`intro-${index}`"
            class="text-[28rpx] text-slate-600 leading-[1.9]"
          >
            {{ paragraph }}
          </text>
        </view>
        <image
          v-if="shopInfo?.shareInfo?.image"
          :src="shopInfo.shareInfo.image"
          class="mt-6 max-w-full w-full rounded-[20rpx]"
          mode="widthFix"
        />
      </view>
    </view>
  </view>
</template>
