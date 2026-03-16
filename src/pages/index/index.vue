<script setup lang="ts">
/**
 * 首页 - 工具集合
 * 支付宝简约风格设计
 */

definePage({
  name: 'home',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: 'Beta Mini',
    navigationBarBackgroundColor: '#4F46E5',
    navigationBarTextStyle: 'white',
  },
})

const router = useRouter()

/**
 * 工具分类类型
 */
type ToolCategory = 'investment' | 'data' | 'marketing' | 'other'

/**
 * 工具项接口
 */
interface ToolItem {
  id: string
  name: string
  description: string
  icon: string
  category: ToolCategory
  route?: {
    name: string
    params?: Record<string, string>
  }
  external?: boolean
  popular?: boolean
}

/**
 * 工具分类配置 - 科技感配色
 */
const categories = {
  investment: {
    label: '投资工具',
    color: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    iconColor: 'text-indigo-500',
  },
  data: {
    label: '数据工具',
    color: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    iconColor: 'text-cyan-500',
  },
  marketing: {
    label: '营销工具',
    color: 'bg-violet-50',
    textColor: 'text-violet-600',
    iconColor: 'text-violet-500',
  },
  other: {
    label: '其他工具',
    color: 'bg-slate-50',
    textColor: 'text-slate-600',
    iconColor: 'text-slate-500',
  },
} as const

/**
 * 所有工具列表
 */
const allTools: ToolItem[] = [
  // 投资工具
  {
    id: 'etf-valuation',
    name: '今日几星',
    description: 'ETF估值表',
    icon: 'chart-line',
    category: 'investment',
    route: { name: 'etf' },
    popular: true,
  },
  {
    id: 'etf-valuation-tool',
    name: 'ETF翻译器',
    description: '小白快速看懂基金',
    icon: 'idea',
    category: 'investment',
    route: { name: 'etf-valuation-tool-home' },
    popular: true,
  },
  {
    id: 'asset-detail',
    name: '资产详情',
    description: '查看资产表现',
    icon: 'chart-pie',
    category: 'investment',
    route: {
      name: 'asset-detail',
      params: { code: '515080_OF' },
    },
  },
  {
    id: 'performance',
    name: '业绩分析',
    description: '基金业绩追踪',
    icon: 'arrow-up-bold',
    category: 'investment',
  },
  // 数据工具
  {
    id: 'food-interest',
    name: '食息指南',
    description: '饮食与收益',
    icon: 'data',
    category: 'data',
    route: {
      name: 'asset-detail',
      params: { code: '515080_OF' },
    },
    popular: true,
  },
  {
    id: 'market-data',
    name: '市场数据',
    description: '实时行情数据',
    icon: 'chart-bar',
    category: 'data',
  },
  {
    id: 'calendar',
    name: '交易日历',
    description: '交易日查询',
    icon: 'calendar',
    category: 'data',
  },
  // 营销工具
  {
    id: 'tamp-marketing',
    name: 'TAMP营销页',
    description: '产品营销展示',
    icon: 'document',
    category: 'marketing',
    route: {
      name: 'tamp-marketing',
      params: {
        shopId: 'V0000821',
        portfolioCode: 'CFJH_0422',
      },
    },
    popular: true,
  },
  {
    id: 'promo-material',
    name: '宣传材料',
    description: '营销素材库',
    icon: 'image',
    category: 'marketing',
  },
  // 其他工具
  {
    id: 'calculator',
    name: '收益计算器',
    description: '投资收益测算',
    icon: 'calculation',
    category: 'other',
  },
  {
    id: 'settings',
    name: '设置',
    description: '偏好设置',
    icon: 'setting',
    category: 'other',
  },
]

/**
 * 常用工具（最多8个）
 */
const popularTools = computed(() =>
  allTools.filter(tool => tool.popular).slice(0, 8),
)

/**
 * 按分类分组的工具
 */
const groupedTools = computed(() => {
  const groups: Record<string, ToolItem[]> = {}
  for (const tool of allTools) {
    if (!groups[tool.category]) {
      groups[tool.category] = []
    }
    groups[tool.category].push(tool)
  }
  return groups
})

/**
 * 工具点击处理
 */
function handleToolClick(tool: ToolItem) {
  if (!tool.route) {
    uni.showToast({
      title: '功能开发中',
      icon: 'none',
    })
    return
  }

  router.push({
    name: tool.route.name,
    params: tool.route.params,
  })
}

/**
 * 获取分类配置
 */
function getCategoryConfig(category: ToolCategory) {
  return categories[category]
}

/**
 * 获取分类图标名称
 */
function getCategoryIcon(category: ToolCategory): string {
  const icons: Record<ToolCategory, string> = {
    investment: 'chart-pie',
    data: 'data',
    marketing: 'broadcast',
    other: 'more',
  }
  return icons[category]
}
</script>

<template>
  <view class="min-h-screen bg-[#F5F5F5]">
    <!-- 顶部欢迎区域 -->
    <view class="from-indigo-600 to-indigo-500 bg-gradient-to-br px-4 pb-12 pt-6">
      <view class="flex items-center justify-between">
        <view>
          <text class="text-2xl text-white font-bold">
            Beta Mini
          </text>
          <text class="mt-1 block text-sm text-white/80">
            您的智能工具集合
          </text>
        </view>
        <view class="h-12 w-12 rounded-full bg-white/20 p-1">
          <view class="h-full w-full flex items-center justify-center rounded-full bg-white/30">
            <wd-icon name="user" custom-class="text-white! text-5!" />
          </view>
        </view>
      </view>
    </view>

    <!-- 常用工具区域 -->
    <view class="mx-4 -mt-6">
      <view class="rounded-2xl bg-white p-4 shadow-sm">
        <view class="mb-3 flex items-center gap-2">
          <wd-icon name="star" custom-class="text-yellow-500! text-5!" />
          <text class="text-base text-[#1D2129] font-semibold">
            常用工具
          </text>
        </view>
        <view class="grid grid-cols-4 gap-4">
          <view
            v-for="tool in popularTools"
            :key="tool.id"
            class="flex flex-col items-center gap-2"
            @click="handleToolClick(tool)"
          >
            <view
              class="h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95"
              :class="getCategoryConfig(tool.category).color"
            >
              <wd-icon
                :name="tool.icon"
                :custom-class="`${getCategoryConfig(tool.category).iconColor} text-5!`"
              />
            </view>
            <text class="text-center text-xs text-[#4E5969]">
              {{ tool.name }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 全部工具区域 -->
    <view class="mt-4 px-4">
      <view class="mb-3 flex items-center gap-2">
        <wd-icon name="list" custom-class="text-indigo-500! text-5!" />
        <text class="text-base text-[#1D2129] font-semibold">
          全部工具
        </text>
      </view>

      <!-- 按分类展示 -->
      <view
        v-for="(tools, category) in groupedTools"
        :key="category"
        class="mb-3 overflow-hidden rounded-2xl bg-white"
      >
        <view
          class="border-b border-gray-100 px-4 py-3"
          :class="getCategoryConfig(category as ToolCategory).color"
        >
          <view class="flex items-center gap-2">
            <wd-icon
              :name="getCategoryIcon(category as ToolCategory)"
              :custom-class="`${getCategoryConfig(category as ToolCategory).iconColor} text-4!`"
            />
            <text
              class="text-sm font-medium"
              :class="getCategoryConfig(category as ToolCategory).textColor"
            >
              {{ getCategoryConfig(category as ToolCategory).label }}
            </text>
            <text class="ml-auto text-xs text-gray-400">
              {{ tools.length }}
            </text>
          </view>
        </view>

        <view class="divide-y divide-gray-50">
          <view
            v-for="tool in tools"
            :key="tool.id"
            class="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-150 active:bg-gray-50"
            @click="handleToolClick(tool)"
          >
            <view
              class="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-xl"
              :class="getCategoryConfig(category as ToolCategory).color"
            >
              <wd-icon
                :name="tool.icon"
                :custom-class="`${getCategoryConfig(category as ToolCategory).iconColor} text-4!`"
              />
            </view>
            <view class="min-w-0 flex-1">
              <text class="block text-sm text-[#1D2129] font-medium">
                {{ tool.name }}
              </text>
              <text class="block text-xs text-[#8A95A1]">
                {{ tool.description }}
              </text>
            </view>
            <wd-icon name="arrow-right" custom-class="text-gray-300! text-3!" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="h-24" />
  </view>
</template>
