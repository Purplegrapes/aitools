<script setup lang="ts">
import type { IEventReturn } from 'alova/client'
import { useRequest } from 'alova/client'
import Apis from '@/api'

definePage({
  name: 'etf',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF 工具',
  },
})

/**
 * 一级 Tab 导航配置
 */
const navbar = [
  { label: '行情', name: 'quotation' },
  { label: '估值', name: 'valuation' },
  { label: '业绩', name: 'performance' },
  { label: '费率', name: 'rate' },
]

/**
 * 当前激活的一级 tab
 */
const activeTab = ref('quotation')

/**
 * 当前激活的二级 tab (分类 code)
 */
const activeCategory = ref('watchlist')

/**
 * 获取分类列表 - 使用 useRequest hook
 */
const {
  data: categories,
  loading,
  onError,
} = useRequest(Apis.etf.getTabList(), {
  immediate: true,
})

/**
 * 监听分类数据加载完成，设置默认选中第一个分类
 */
watchEffect(() => {
  if (categories.value?.data && categories.value.data.length > 0) {
    activeCategory.value = categories.value.data[0].code
  }
})

/**
 * 错误处理
 */
onError((error) => {
  console.error('获取分类列表失败:', error)
})

/**
 * 一级 Tab 切换事件
 */
function onTabChange(value: string | number) {
  activeTab.value = value as string
  console.log('切换一级 Tab:', value)
}

/**
 * 二级 Tab 切换事件
 */
function onCategoryChange(value: string | number) {
  activeCategory.value = value as string
  // TODO: 根据选中的分类获取对应的 ETF 列表数据
  console.log('切换分类:', value)
}
</script>

<template>
  <view class="min-h-screen bg-gray-100">
    <!-- 一级 Tab 导航 -->
    <wd-tabs v-model="activeTab" @change="onTabChange">
      <wd-tab v-for="tab in navbar" :key="tab.name" :name="tab.name" :title="tab.label" />
    </wd-tabs>

    <!-- 二级 Tab 导航 (分类) -->
    <wd-tabs v-model="activeCategory" sticky @change="onCategoryChange">
      <wd-tab v-for="category in categories?.data || []" :key="category.id" :name="category.code" :title="category.name" />
    </wd-tabs>

    <!-- 内容区域 -->
    <view class="p-3">
      <wd-loadmore v-if="loading" status="loading" />
      <wd-cell-group v-else border>
        <wd-cell title="当前一级 Tab" :value="activeTab" />
        <wd-cell title="当前二级 Tab" :value="categories?.data?.find((c: any) => c.code === activeCategory)?.name || ''" />
      </wd-cell-group>
    </view>

    <!-- 底部提示 -->
    <wd-divider />
    <view class="pb-4 text-center">
      <wd-text text="数据仅供参考，不构成投资建议" type="info" align="center" size="12px" />
    </view>
  </view>
</template>
