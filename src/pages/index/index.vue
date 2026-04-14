<script setup lang="ts">
import performance from '@/assets/performance.png'
import valuationIcon from '@/assets/valuation.svg'
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
    label: '行情工具',
    color: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    iconColor: 'text-indigo-500',
  },
  data: {
    label: '投资工具',
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
    id: 'valuation-tool',
    name: '宝倍估值',
    description: '宝倍查估值，快速看懂你的基',
    icon: valuationIcon,
    category: 'investment',
    route: { name: 'valuation-tool-home' },
    popular: true,
  },
  {
    id: 'performance',
    name: '业绩分析',
    description: '基金业绩追踪',
    category: 'data',
    icon: 'calendar',
  },
  // 数据工具
  {
    id: 'calendar',
    name: '新闻快迅',
    description: '关注实时热点',
    icon: performance,
    route: { name: 'tool-news' },
    category: 'investment',
  },
  {
    id: 'red-dividend',
    name: '红利风向标',
    description: '看懂当前更适合哪类红利',
    icon: valuationIcon,
    route: { name: 'red-dividend-home' },
    category: 'investment',
    popular: true,
  },
  {
    id: 'etf-valuation',
    name: '今日几星',
    description: 'ETF估值表',
    icon: 'chart-bar',
    category: 'data',
    // route: { name: 'etf' },
    popular: true,
  },

  // 其他工具
  {
    id: 'calculator',
    name: '收益计算器',
    description: '投资收益测算',
    icon: 'calculation',
    category: 'other',
  },
]

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
    <view class="from-indigo-600 to-indigo-500 bg-gradient-to-br px-4 pb-6 pt-6">
      <view class="flex items-center justify-between">
        <view>
          <text class="text-2xl text-white font-bold">
            Beta Mini
          </text>
          <text class="mt-1 block text-sm text-white/80">
            您的投资工具集合
          </text>
        </view>
      </view>
    </view>

    <!-- 全部工具区域 -->
    <view class="mt-4 px-4">
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
              <wd-img :src="tool.icon" class="h-10 w-10" />
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
