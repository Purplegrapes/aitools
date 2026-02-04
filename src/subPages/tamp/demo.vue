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

// 审核状态文本
const auditStatusText = computed(() => {
  const statusMap: Record<string, string> = {
    APPROVED: '已通过',
    PENDING: '审核中',
    REJECTED: '已拒绝',
  }
  return shopInfo.value ? statusMap[shopInfo.value.auditStatus] || shopInfo.value.auditStatus : '-'
})

// 审核状态颜色
const auditStatusClass = computed(() => {
  const classMap: Record<string, string> = {
    APPROVED: 'text-green-500',
    PENDING: 'text-amber-500',
    REJECTED: 'text-red-500',
  }
  return shopInfo.value ? classMap[shopInfo.value.auditStatus] || 'text-gray-500' : 'text-gray-500'
})

// 店铺状态文本
const shopStatusText = computed(() => {
  const statusMap: Record<string, string> = {
    ENABLE: '启用',
    DISABLE: '禁用',
  }
  return shopInfo.value ? statusMap[shopInfo.value.shopStatus] || shopInfo.value.shopStatus : '-'
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 加载状态 -->
    <view v-if="loading" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <wd-loading />
      <text class="text-sm text-gray-500">
        加载中...
      </text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="min-h-screen flex flex-col items-center justify-center gap-4">
      <text class="text-sm text-red-500">
        加载失败，请重试
      </text>
    </view>

    <!-- 店铺信息 -->
    <view v-else-if="shopInfo" class="p-4">
      <!-- 店铺头部 -->
      <view class="mb-4 flex gap-6 rounded-2xl bg-white p-4 shadow-sm">
        <image
          v-if="shopInfo.logo"
          :src="shopInfo.logo"
          class="h-30 w-30 flex-shrink-0 rounded-xl"
          mode="aspectFill"
        />
        <view v-else class="h-30 w-30 flex flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <text class="text-5xl">
            🏪
          </text>
        </view>
        <view class="flex flex-1 flex-col justify-center">
          <view class="mb-3 text-lg text-gray-800 font-semibold">
            {{ shopInfo.name }}
          </view>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="mb-4 flex justify-around rounded-2xl bg-white p-4 shadow-sm">
        <view class="flex flex-col items-center gap-2">
          <text class="text-2xl text-gray-800 font-semibold">
            {{ shopInfo.fansCount }}
          </text>
          <text class="text-xs text-gray-400">
            粉丝数
          </text>
        </view>
        <view class="w-1px bg-gray-100" />
        <view class="flex flex-col items-center gap-2">
          <text class="text-2xl text-gray-800 font-semibold">
            {{ shopInfo.subscribeCount }}
          </text>
          <text class="text-xs text-gray-400">
            订阅数
          </text>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <view class="mb-6 text-base text-gray-800 font-semibold">
          店铺信息
        </view>
        <view class="flex items-center justify-between border-b border-gray-50 py-5 last:border-b-0">
          <text class="text-sm text-gray-500">
            店铺ID
          </text>
          <text class="ml-6 flex-1 break-all text-right text-sm text-gray-800 font-medium">
            {{ shopInfo.id }}
          </text>
        </view>
        <view class="flex items-center justify-between border-b border-gray-50 py-5 last:border-b-0">
          <text class="text-sm text-gray-500">
            审核状态
          </text>
          <text class="text-sm font-medium" :class="auditStatusClass">
            {{ auditStatusText }}
          </text>
        </view>
        <view class="flex items-center justify-between border-b border-gray-50 py-5 last:border-b-0">
          <text class="text-sm text-gray-500">
            店铺状态
          </text>
          <text class="text-sm text-gray-800 font-medium">
            {{ shopStatusText }}
          </text>
        </view>
        <view class="flex items-center justify-between border-b border-gray-50 py-5 last:border-b-0">
          <text class="text-sm text-gray-500">
            创建时间
          </text>
          <text class="text-sm text-gray-800 font-medium">
            {{ shopInfo.createTime }}
          </text>
        </view>
        <view class="flex items-center justify-between border-b border-gray-50 py-5 last:border-b-0">
          <text class="text-sm text-gray-500">
            新用户登录
          </text>
          <text class="text-sm text-gray-800 font-medium">
            {{ shopInfo.newUserLogin ? '是' : '否' }}
          </text>
        </view>
        <view class="flex items-center justify-between py-5">
          <text class="text-sm text-gray-500">
            引导收藏
          </text>
          <text class="text-sm text-gray-800 font-medium">
            {{ shopInfo.guideFavorite ? '是' : '否' }}
          </text>
        </view>
      </view>

      <!-- 分享信息 -->
      <view v-if="shopInfo.shareInfo" class="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <view class="mb-6 text-base text-gray-800 font-semibold">
          分享信息
        </view>
        <view class="flex items-center justify-between border-b border-gray-50 py-5 last:border-b-0">
          <text class="flex-shrink-0 text-sm text-gray-500">
            分享内容
          </text>
          <text class="ml-6 flex-1 break-all text-right text-sm text-gray-800 font-medium">
            {{ shopInfo.shareInfo.content }}
          </text>
        </view>
        <view v-if="shopInfo.shareInfo.image" class="flex items-center justify-between py-5">
          <text class="flex-shrink-0 text-sm text-gray-500">
            分享图片
          </text>
          <image
            :src="shopInfo.shareInfo.image"
            class="h-30 w-30 rounded-lg"
            mode="aspectFill"
          />
        </view>
      </view>
    </view>
  </view>
</template>
