<script setup lang="ts">
import type {
  CategoryData,
  EtfInfo,
  PerformanceData,
  RealtimeData,
  ValuationData,
  WotTabEvent,
} from './types'
import {
  REALTIME_POLLING_INTERVAL,
  SCROLL_TOLERANCE,
} from './constants'
import {
  calculateTabScrollPositions,
  mergeAllColumns,
  navbar,
} from './data'
import {
  isApiResponse,
  isNestedValuationDetailResponse,
} from './types'

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
 * 根据分类筛选 ETF 列表
 */
function filterByCategory(list: EtfInfo[], category: string): EtfInfo[] {
  if (category === 'all')
    return list
  if (category === 'watchlist')
    return list.filter((item: EtfInfo) => item.watchList)
  return list.filter((item: EtfInfo) => item.categoryCode === category)
}

/**
 * 提取 ETF 的业绩数据
 */
function extractPerformanceFields(
  code: string,
  performance: PerformanceData,
): Partial<PerformanceData> {
  const perfKey = `${code}`
  const fields: Partial<PerformanceData> = {}
  const periodKeys = [
    'f_mkt_return_1w',
    'f_mkt_return_1m',
    'f_mkt_return_3m',
    'f_mkt_return_6m',
    'f_mkt_return_1y',
    'f_mkt_return_3y',
  ] as const

  for (const key of periodKeys) {
    const record = performance[key]
    if (record && perfKey in record) {
      ;(fields as Record<string, unknown>)[key] = record[perfKey]
    }
  }

  return fields
}

/**
 * 合并 ETF 的所有数据源
 */
function mergeEtfData(
  item: EtfInfo,
  valuationData: ValuationData[],
  performanceData: PerformanceData,
  realtimeData: RealtimeData[],
): EtfInfo & Partial<RealtimeData> & Partial<ValuationData> & Partial<PerformanceData> {
  const valuation = valuationData.find((it: ValuationData) => it.index_code === item.trackIndexCode)
  const performanceFields = extractPerformanceFields(item.code, performanceData)
  const realData = realtimeData.find((it: RealtimeData) => it?.code === item?.code) || {}

  return {
    ...item,
    ...realData,
    ...valuation,
    ...performanceFields,
  }
}

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
const performanceData = ref<PerformanceData>({})

/**
 * 获取业绩数据
 */
const { send: fetchPerformanceData } = useRequest(
  () => {
    const codes = etfList.value.map((item: EtfInfo) => `${item.code}`)
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
  if (isApiResponse<PerformanceData>(res)) {
    performanceData.value = res.data || {}
  }
})

/**
 * 估值数据
 */
const valuationData = ref<ValuationData[]>([])

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
  if (isNestedValuationDetailResponse(res)) {
    valuationData.value = res?.data?.data?.valuations || []
  }
  else {
    valuationData.value = []
  }
  // 获取完估值数据后，获取业绩数据
  fetchPerformanceData()
})

/**
 * 实时行情数据
 */
const realtimeData = ref<RealtimeData[]>([])

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
      securityCodes: etfList.value.map((item: EtfInfo) => item.code),
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
  if (isApiResponse<RealtimeData[]>(res)) {
    const data = res.data
    realtimeData.value = data || []
    // 如果交易状态为false，停止定时器
    if (data?.[0]?.tradeInfo?.status === false) {
      if (realtimeTimer) {
        clearInterval(realtimeTimer)
        realtimeTimer = null
      }
    }
  }
  else {
    realtimeData.value = []
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
    realtimeTimer = setInterval(fetchRealtime, REALTIME_POLLING_INTERVAL)
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
  const data = (categoryData.value?.data as CategoryData[]) || []
  return [
    ...data.map((item: CategoryData) => ({
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
  const filtered = filterByCategory(list, activeTab.value)

  // 合并估值和业绩数据
  return filtered.map((item: EtfInfo) => {
    return mergeEtfData(item, valuationData.value, performanceData.value, realtimeData.value)
  })
})

/**
 * 可显示的分类Tab
 */
const visibleTabs = computed(() => {
  const list = etfList.value || []
  return categoryList.value.filter((tab) => {
    if (tab.name === 'watchlist')
      return list.some((item: EtfInfo) => item.watchList)
    if (tab.name === 'all')
      return true
    return list.some((item: EtfInfo) => item.categoryCode === tab.name)
  })
})

/**
 * 监听滚动位置变化，更新导航状态
 */
function handleScrollChange(value: number) {
  scrollLeft.value = value
  // 根据滚动位置判断当前在哪个 tab
  const positions = tabScrollPositions.value
  const tolerance = SCROLL_TOLERANCE

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
function handleNavChange({ name }: WotTabEvent) {
  activeNav.value = name as 'quotation' | 'valuation' | 'performance' | 'rate'
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
function handleTabChange({ name }: WotTabEvent) {
  activeTab.value = name
}

/**
 * 行点击 - 跳转详情
 */
function handleRowClick(row: EtfInfo & RealtimeData) {
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
function handleOptionalClick(row: EtfInfo) {
  const requestFn = row.watchList
    ? () => (Apis as any).etf.watchlistDel({ pathParams: { code: row.code } })
    : () => (Apis as any).etf.watchlistAdd({ data: { code: row.code } })

  const { send } = useRequest(requestFn, {
    immediate: true,
  }).onSuccess((res) => {
    if (isApiResponse<{ success?: boolean }>(res)) {
      const data = res.data
      if (data?.success) {
        GlobalToast.success(row.watchList ? '移除自选成功' : '添加自选成功')
        // 直接更新本地状态
        const list = etfListData.value?.data
        if (Array.isArray(list)) {
          const index = list.findIndex((item: EtfInfo) => item.code === row.code)
          if (index >= 0) {
            list[index].watchList = !row.watchList
          }
        }
      }
      else {
        const errorMsg = 'msg' in res ? (res as { msg?: string }).msg : undefined
        GlobalToast.error(errorMsg || '操作失败')
      }
    }
  }).onError((error) => {
    const errorMsg = error && typeof error === 'object' && 'error' in error
      ? (error as { error?: { message?: string } }).error?.message || '操作失败'
      : '操作失败'
    GlobalToast.error(errorMsg)
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
    <view class="mb-2 flex items-center justify-between bg-white p-12rpx">
      <text class="text-base text-[#333] font-bold">
        ETF估值表
      </text>
      <text class="text-sm text-[#999]">
        {{ dataDate }}更新
      </text>
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
        :table-data="filteredList"
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
