<script setup lang="ts">
import { calculateTabScrollPositions, mergeAllColumns, navbar } from './data'

definePage({
  name: 'etf',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF估值表',
  },
})

const router = useRouter()
const GlobalToast = useGlobalToast()

/**
 * 当前选中的导航
 */
const activeNav = ref<'quotation' | 'valuation' | 'performance' | 'rate'>('quotation')

/**
 * 当前选中的分类Tab
 */
const activeTab = ref('all')

/**
 * 导航栏配置
 */
const navbarItems = navbar

/**
 * 获取ETF列表 - 使用 useRequest
 */
const {
  data: etfListData,
  loading: etfLoading,
} = useRequest(() => (Apis as any).etf.etfInfoList(), {
  immediate: true,
})

/**
 * ETF列表数据
 */
const etfList = computed(() => etfListData.value?.data || [])

/**
 * 业绩数据
 */
const performanceData = ref<Record<string, any>>({})

/**
 * 获取业绩数据
 */
const { send: fetchPerformanceData } = useRequest(
  () => {
    const codes = etfList.value.map((item: any) => `${item.code}`)
    const factorCodes = [
      'f_mkt_return_1w',
      'f_mkt_return_1m',
      'f_mkt_return_3m',
      'f_mkt_return_6m',
      'f_mkt_return_1y',
      'f_mkt_return_3y',
    ]
    return (Apis as any).etf.factorValue({
      data: {
        securityCodes: codes,
        factorCodes,
        securityType: 'ETF',
      },
    })
  },
  {
    immediate: false,
  },
).onSuccess((res) => {
  performanceData.value = (res.data as any) || {}
})

/**
 * 估值数据
 */
const valuationData = ref([])

/**
 * 获取估值数据
 */
const { send: fetchValuationData } = useRequest(
  () => (Apis as any).etf.valuationDetail({
    params: {
      source: 'lsd',
      category_code: '6',
    },
  }),
  {
    immediate: false,
  },
).onSuccess((res) => {
  valuationData.value = (res as any)?.data?.data.valuations || []
  // 获取完估值数据后，获取业绩数据
  fetchPerformanceData()
})

/**
 * 实时行情数据
 */
const realtimeData = ref([])

/**
 * 定时器引用
 */
let realtimeTimer: ReturnType<typeof setInterval> | null = null

/**
 * 获取实时行情 - 使用 useRequest
 */
const { send: fetchRealtime } = useRequest(
  () => {
    const params = {
      securityCodes: etfList.value.map((item: any) => item.code),
      assetType: 'ETF',
    }
    return (Apis as any).etf.realtime({
      data: params,
    })
  },
  {
    immediate: false,
  },
).onSuccess((res) => {
  realtimeData.value = (res as any)?.data || []
  // 如果交易状态为false，停止定时器
  if ((res as any)?.[0]?.tradeInfo?.status === false) {
    if (realtimeTimer) {
      clearInterval(realtimeTimer)
      realtimeTimer = null
    }
  }
}).onError(() => {
  // Silent error handling - errors are logged by Alova
})

// ETF列表加载完成后，获取估值数据
watch(etfList, (list) => {
  if (list && list.length > 0) {
    fetchValuationData()
    // 启动实时行情定时器
    fetchRealtime()
    realtimeTimer = setInterval(fetchRealtime, 15000)
  }
}, { immediate: true })

// 组件卸载时清除定时器
onUnmounted(() => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
})

/**
 * 获取分类列表 - 使用 useRequest
 */
const {
  data: categoryData,
} = useRequest(() => (Apis as any).etf.getTabList(), {
  immediate: true,
}).onError((error) => {
  GlobalToast.error(error.error?.message || '获取分类列表失败')
})

/**
 * 分类列表
 */
const categoryList = computed(() => {
  const data = categoryData.value?.data || []
  return [
    ...data.map((item: any) => ({
      name: item.code,
      code: item.code,
      label: item.name,
    })),
  ]
})

/**
 * 获取数据日期 - 使用 useRequest
 */
const {
  data: dataDateData,
} = useRequest(() => (Apis as any).etf.getAshare(), {
  immediate: true,
})

/**
 * 数据日期
 */
const dataDate = computed(() => dataDateData.value || '-')

/**
 * 获取显示报价配置 - 使用 useRequest
 */
const {
  data: showQuoteData,
} = useRequest(() => (Apis as any).etf.showQuote(), {
  immediate: true,
})

/**
 * 是否显示报价列
 */
const showQuote = computed(() => showQuoteData.value?.data || false)

/**
 * 表格列定义 - 合并所有列
 */
const columns = computed(() => mergeAllColumns(showQuote.value))

/**
 * 每个 tab 的滚动位置
 */
const tabScrollPositions = computed(() => calculateTabScrollPositions(showQuote.value))

/**
 * 当前滚动位置
 */
const scrollLeft = ref(0)

/**
 * 自定义表格组件引用
 */
const tableRef = ref()

/**
 * 根据分类筛选后的数据
 */
const filteredList = computed(() => {
  const list = etfList.value || []
  const filtered = activeTab.value === 'all'
    ? list
    : activeTab.value === 'watchlist'
      ? list.filter((item: any) => item.watchList)
      : list.filter((item: any) => item.categoryCode === activeTab.value)

  // 合并估值和业绩数据
  return filtered.map((item: any) => {
    // 使用 trackIndexCode 从估值数据中获取对应的估值信息
    const valuation = valuationData.value?.find((it: any) => it.index_code === item.trackIndexCode)
    const perfKey = `${item.code}`
    const performance = performanceData.value
    const realData = realtimeData.value.find((it: any) => it?.code === item?.code) || {}
    // 合并业绩数据
    const performanceFields: Record<string, any> = {}
    if (performance.f_mkt_return_1w?.[perfKey] !== undefined)
      performanceFields.f_mkt_return_1w = performance.f_mkt_return_1w[perfKey]
    if (performance.f_mkt_return_1m?.[perfKey] !== undefined)
      performanceFields.f_mkt_return_1m = performance.f_mkt_return_1m[perfKey]
    if (performance.f_mkt_return_3m?.[perfKey] !== undefined)
      performanceFields.f_mkt_return_3m = performance.f_mkt_return_3m[perfKey]
    if (performance.f_mkt_return_6m?.[perfKey] !== undefined)
      performanceFields.f_mkt_return_6m = performance.f_mkt_return_6m[perfKey]
    if (performance.f_mkt_return_1y?.[perfKey] !== undefined)
      performanceFields.f_mkt_return_1y = performance.f_mkt_return_1y[perfKey]
    if (performance.f_mkt_return_3y?.[perfKey] !== undefined)
      performanceFields.f_mkt_return_3y = performance.f_mkt_return_3y[perfKey]
    return {
      ...item,
      ...realData,
      ...valuation,
      ...performanceFields,
    }
  })
})

/**
 * 可显示的分类Tab
 */
const visibleTabs = computed(() => {
  const list = etfList.value || []
  return categoryList.value.filter((tab) => {
    if (tab.name === 'watchlist')
      return list.some((item: any) => item.watchList)
    if (tab.name === 'all')
      return true
    return list.some((item: any) => item.categoryCode === tab.name)
  })
})

/**
 * 监听滚动位置变化，更新导航状态
 */
function handleScrollChange(value: number) {
  scrollLeft.value = value
  // 根据滚动位置判断当前在哪个 tab
  const positions = tabScrollPositions.value
  const tolerance = 50 // 容差值

  if (value < positions.valuation - tolerance) {
    activeNav.value = 'quotation'
  }
  else if (value >= positions.valuation - tolerance && value < positions.performance - tolerance) {
    activeNav.value = 'valuation'
  }
  else if (value >= positions.performance - tolerance && value < positions.rate - tolerance) {
    activeNav.value = 'performance'
  }
  else {
    activeNav.value = 'rate'
  }
}

/**
 * 导航切换 - 滚动到对应位置
 */
function handleNavChange({ name }: any) {
  activeNav.value = name
  // 滚动到对应 tab 的位置
  const targetScrollLeft = tabScrollPositions.value[name as keyof typeof tabScrollPositions.value] || 0
  scrollLeft.value = targetScrollLeft
  nextTick(() => {
    tableRef.value?.scrollTo(targetScrollLeft)
  })
}

/**
 * 分类Tab切换
 */
function handleTabChange({ name }: any) {
  activeTab.value = name
}

/**
 * 行点击 - 跳转详情
 */
function handleRowClick(row: any) {
  router.push({
    path: '/subPages/etf/detail',
    query: {
      djId: row.danjuanId,
      code: row.code,
      name: row.name,
      date: dataDate.value,
    },
  })
}

/**
 * 自选按钮点击 - 使用 useRequest
 */
function handleOptionalClick(row: any) {
  const requestFn = row.watchList
    ? () => (Apis as any).etf.watchlistDel({ pathParams: { code: row.code } })
    : () => (Apis as any).etf.watchlistAdd({ data: { code: row.code } })

  const { send } = useRequest(requestFn, {
    immediate: true,
  }).onSuccess((res) => {
    const data = (res as any)?.data
    if (data?.success) {
      GlobalToast.success(row.watchList ? '移除自选成功' : '添加自选成功')
      // 直接更新本地状态
      const list = etfListData.value?.data
      const index = list?.findIndex((item: any) => item.code === row.code)
      if (index !== undefined && index >= 0) {
        list[index].watchList = !row.watchList
      }
    }
    else {
      GlobalToast.error((res as any)?.msg || '操作失败')
    }
  }).onError((error) => {
    GlobalToast.error(error.error?.message || '操作失败')
  })

  send()
}
</script>

<template>
  <view class="min-h-screen bg-[#f5f5f5]">
    <!-- 顶部导航 -->
    <view class="sticky top-0 z-[999] mb-1 bg-white">
      <wd-tabs v-model="activeNav" @click="handleNavChange">
        <wd-tab
          v-for="item in navbarItems"
          :key="item.name"
          :title="item.label"
          :name="item.name"
        />
      </wd-tabs>
    </view>

    <!-- 头部信息 -->
    <view class="bg-white mb-2 flex items-center justify-between p-12rpx">
      <text class="font-bold text-base text-[#333]">ETF估值表</text>
      <text class="text-sm text-[#999]">{{ dataDate }}更新</text>
    </view>

    <!-- 分类Tab -->
    <view class="sticky top-10 z-[998] mb-2 bg-white">
      <wd-tabs v-model="activeTab" sticky @click="handleTabChange">
        <wd-tab
          v-for="item in visibleTabs"
          :key="item.name"
          :title="item.label"
          :name="item.name"
        />
      </wd-tabs>
    </view>

    <!-- 表格区域 -->
    <view class="min-h-200 bg-white">
      <custom-table
        ref="tableRef"
        :columns="columns"
        :data-source="filteredList"
        :loading="etfLoading"
        :scroll-left="scrollLeft"
        :row-click="handleRowClick"
        :optional-click="handleOptionalClick"
        @update:scroll-left="handleScrollChange"
      />
    </view>

    <!-- 底部安全区域 -->
    <view class="h-[env(safe-area-inset-bottom)]" />
  </view>
</template>
