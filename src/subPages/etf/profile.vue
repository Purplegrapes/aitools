<script setup lang="ts">
/**
 * ETF 基金简况页面
 * 展示基金的基础信息、基金经理、核心指标和资产结构
 */
import type { EChartsOption } from 'echarts'
import type { AssetStructure, CoreIndicators, FundManager } from './types'
import PieChart from '@/subEcharts/echarts/components/PieChart.vue'
import { formatAssets, formatPercentage } from '@/utils/format'
import { assetStructure, basicInfo, coreIndicators, fundManager } from './api'

defineOptions({
  componentPlaceholder: {
    PieChart: 'view',
  },
})

definePage({
  name: 'etf-profile',
  layout: 'default',
  style: {
    navigationBarTitleText: '基金简况',
  },
})

const route = useRoute()

// ==================== 状态 ====================
const collapseValue = ref<string[]>(['basic', 'manager', 'indicators', 'assets'])
const assetTabValue = ref(0)
// 资产结构
const { data: assetStructureData } = useRequest(
  () => assetStructure(route.query.code),
  { immediate: true },
)
// 资产结构Tab配置
const assetTabs = computed(() => {
  const tabs = ['资产配置']
  if (assetStructureData.value?.data?.industryAllocation?.length) {
    tabs.push('行业配置')
  }
  if (assetStructureData.value?.data?.topHoldings?.length) {
    tabs.push('前十大持仓')
  }
  return tabs
})

// 基金信息
const { data: etfInfoData } = useRequest(
  () => basicInfo(route.query.code),
  { immediate: true },
)

// 基金经理
const { data: managerData } = useRequest(
  () => fundManager(route.query.code),
  { immediate: true },
)

// 核心指标
const { data: indicatorsData } = useRequest(
  () => coreIndicators(route.query.code),
  { immediate: true },
)

// ==================== 计算属性 ====================
// 当前基金信息
const currentEtfInfo = computed(() => {
  if (etfInfoData.value?.data) {
    return etfInfoData.value.data
  }
  return {}
})

// 当前基金经理
const currentManager = computed(() => {
  if (managerData.value?.data) {
    return managerData.value.data as FundManager
  }
  return null
})

// 当前核心指标
const currentIndicators = computed(() => {
  if (indicatorsData.value?.data) {
    return indicatorsData.value.data as CoreIndicators
  }
  return null
})

// 当前展示的资产数据（根据Tab切换）
const currentAssetData = computed(() => {
  const data = assetStructureData.value?.data as AssetStructure | undefined
  if (!data)
    return []

  if (assetTabValue.value === 1 && data.industryAllocation) {
    return data.industryAllocation
  }
  if (assetTabValue.value === 2 && data.topHoldings) {
    return data.topHoldings
  }
  return data.assetAllocation || []
})

// 资产配置饼图配置
const assetPieOption = computed<EChartsOption>(() => {
  const data = assetStructureData.value?.data?.assetAllocation || []

  return {
    legend: {
      show: false,
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['35%', '60%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 11,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10,
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#ffffff',
          borderRadius: 8,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data.map(item => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
  }
})

// ==================== 辅助函数 ====================
/**
 * 根据数值返回对应颜色类名
 */
function getValueColorClass(value: number | undefined | null) {
  if (value === undefined || value === null || value === 0)
    return 'text-gray-600'
  return value > 0 ? 'text-red-500' : 'text-green-500'
}

/**
 * 格式化从业年限
 */
function formatExperience(years?: number): string {
  if (!years)
    return '--'
  return `${years}年`
}

/**
 * 格式化管理规模
 */
function formatManageAssets(assets?: number): string {
  if (!assets)
    return '--'
  return formatAssets(assets)
}

/**
 * 获取收益率属性键名
 * @param period 时间周期 (1w, 1m, 3m, 6m, 1y, 3y, ytd)
 * @returns 对应的属性键名 (return1w, return1m, etc.)
 */
function getReturnKey(period: string): keyof CoreIndicators {
  return `return${period.charAt(0).toUpperCase() + period.slice(1)}` as keyof CoreIndicators
}

/**
 * 获取收益率值
 * @param indicators 核心指标数据
 * @param period 时间周期
 * @returns 收益率值
 */
function getReturnValue(indicators: CoreIndicators | null, period: string): number | undefined {
  if (!indicators)
    return undefined
  return indicators[getReturnKey(period)]
}

// ==================== 事件处理 ====================
function handleAssetTabChange({ name }: { name: number }) {
  assetTabValue.value = name
}

// ==================== 生命周期 ====================
onMounted(() => {
  const { name } = route.query
  if (name) {
    uni.setNavigationBarTitle({
      title: decodeURIComponent(name),
    })
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-[env(safe-area-inset-bottom)]">
    <view class="p-2 space-y-3">
      <!-- 基础信息卡片 -->
      <wd-collapse v-model="collapseValue">
        <wd-collapse-item title="基础信息" name="basic">
          <view class="space-y-3">
            <wd-cell-group border custom-class="rounded-2! overflow-hidden">
              <wd-cell title="基金代码" :value="currentEtfInfo.code || '--'" />
              <wd-cell title="基金全称" :value="currentEtfInfo.name || '--'" />
              <wd-cell title="基金类型" :value="currentEtfInfo.fundType || '--'" />
              <wd-cell title="成立日期" :value="currentEtfInfo.establishDate || '--'" />
              <wd-cell title="基金公司" :value="currentEtfInfo.company || '--'" />
              <wd-cell title="托管人" :value="currentEtfInfo.custodian || '--'" />
              <wd-cell title="管理费率" :value="currentEtfInfo.manageFeeRatio ? `${(currentEtfInfo.manageFeeRatio * 100).toFixed(2)}%` : '--'" />
              <wd-cell title="托管费率" :value="currentEtfInfo.custodianFeeRatio ? `${(currentEtfInfo.custodianFeeRatio * 100).toFixed(2)}%` : '--'" />
              <wd-cell title="跟踪指数" :value="currentEtfInfo.trackIndexName || '--'" />
            </wd-cell-group>
          </view>
        </wd-collapse-item>

        <!-- 基金经理卡片 -->
        <wd-collapse-item title="基金经理" name="manager">
          <view v-if="currentManager" class="space-y-4">
            <!-- 基金经理头部信息 -->
            <view class="flex items-center gap-3">
              <view class="from-blue-400 to-blue-600 h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br">
                <text class="text-lg text-white font-semibold">
                  {{ currentManager.name?.charAt(0) || '基' }}
                </text>
              </view>
              <view class="flex-1">
                <view class="text-base text-gray-800 font-semibold">
                  {{ currentManager.name || '--' }}
                </view>
                <view class="text-xs text-gray-500">
                  {{ currentManager.education || '--' }} | {{ formatExperience(currentManager.experience) }}经验
                </view>
              </view>
            </view>

            <!-- 基金经理详细信息 -->
            <wd-cell-group border custom-class="rounded-2! overflow-hidden">
              <wd-cell title="管理规模" :value="formatManageAssets(currentManager.manageAssets)" />
              <wd-cell title="在管基金" :value="currentManager.manageFunds ? `${currentManager.manageFunds}只` : '--'" />
              <wd-cell title="管理该基金起始日" :value="currentManager.startDate || '--'" />
            </wd-cell-group>

            <!-- 基金经理简介 -->
            <view v-if="currentManager.intro" class="rounded-xl bg-gray-50 p-3">
              <text class="text-sm text-gray-600 leading-relaxed">
                {{ currentManager.intro }}
              </text>
            </view>
          </view>
          <view v-else class="py-4 text-center text-sm text-gray-400">
            暂无基金经理信息
          </view>
        </wd-collapse-item>

        <!-- 核心指标卡片 -->
        <wd-collapse-item title="核心指标" name="indicators">
          <view v-if="currentIndicators" class="space-y-4">
            <!-- 规模指标 -->
            <view>
              <view class="mb-2 text-sm text-gray-800 font-semibold">
                规模指标
              </view>
              <wd-cell-group border custom-class="rounded-2! overflow-hidden">
                <wd-cell title="净资产" :value="formatAssets(currentIndicators.netAssets)" />
                <wd-cell title="日成交额" :value="formatAssets(currentIndicators.dailyTurnover)" />
              </wd-cell-group>
            </view>

            <!-- 业绩指标 -->
            <view>
              <view class="mb-2 text-sm text-gray-800 font-semibold">
                业绩指标
              </view>
              <view class="grid grid-cols-3 gap-2">
                <view v-for="period in ['1w', '1m', '3m', '6m', '1y', '3y', 'ytd']" :key="period" class="rounded-xl bg-gray-50 p-3 text-center">
                  <view class="mb-1 text-xs text-gray-500">
                    {{ period === 'ytd' ? '年初至今' : `近${period === '1w' ? '1周' : period === '1m' ? '1月' : period === '1y' ? '1年' : period === '3y' ? '3年' : `${period}月`}` }}
                  </view>
                  <view class="text-base font-semibold" :class="getValueColorClass(getReturnValue(currentIndicators, period))">
                    {{ formatPercentage(getReturnValue(currentIndicators, period)) }}
                  </view>
                </view>
              </view>
            </view>

            <!-- 估值指标 -->
            <view>
              <view class="mb-2 text-sm text-gray-800 font-semibold">
                估值指标
              </view>
              <view class="grid grid-cols-2 gap-2">
                <view class="rounded-xl bg-gray-50 p-3 text-center">
                  <view class="mb-1 text-xs text-gray-500">
                    市盈率 (PE)
                  </view>
                  <view class="text-blue-600 text-lg font-bold">
                    {{ currentIndicators.pe || '--' }}
                  </view>
                </view>
                <view class="rounded-xl bg-gray-50 p-3 text-center">
                  <view class="mb-1 text-xs text-gray-500">
                    市净率 (PB)
                  </view>
                  <view class="text-lg text-orange-600 font-bold">
                    {{ currentIndicators.pb || '--' }}
                  </view>
                </view>
                <view class="rounded-xl bg-gray-50 p-3 text-center">
                  <view class="mb-1 text-xs text-gray-500">
                    股息率
                  </view>
                  <view class="text-green-600 text-base font-semibold">
                    {{ formatPercentage(currentIndicators.dividendYield) }}
                  </view>
                </view>
                <view class="rounded-xl bg-gray-50 p-3 text-center">
                  <view class="mb-1 text-xs text-gray-500">
                    盈利收益率
                  </view>
                  <view class="text-base text-purple-600 font-semibold">
                    {{ formatPercentage(currentIndicators.profitYield) }}
                  </view>
                </view>
              </view>
            </view>

            <!-- 风险指标 -->
            <view>
              <view class="mb-2 text-sm text-gray-800 font-semibold">
                风险指标
              </view>
              <wd-cell-group border custom-class="rounded-2! overflow-hidden">
                <wd-cell title="波动率" :value="currentIndicators.volatility ? `${(currentIndicators.volatility * 100).toFixed(2)}%` : '--'" />
                <wd-cell title="最大回撤" :value="formatPercentage(currentIndicators.maxDrawdown)" :value-class="getValueColorClass(currentIndicators.maxDrawdown)" />
                <wd-cell title="夏普比率" :value="currentIndicators.sharpeRatio?.toFixed(2) || '--'" />
              </wd-cell-group>
            </view>
          </view>
          <view v-else class="py-4 text-center text-sm text-gray-400">
            暂无核心指标数据
          </view>
        </wd-collapse-item>

        <!-- 资产结构卡片 -->
        <wd-collapse-item title="资产结构" name="assets">
          <view v-if="currentAssetData.length" class="space-y-4">
            <!-- Tab切换 -->
            <wd-tabs v-model="assetTabValue" @click="handleAssetTabChange">
              <block v-for="(tab, index) in assetTabs" :key="index">
                <wd-tab :title="tab" :name="index" />
              </block>
            </wd-tabs>

            <!-- 资产配置（饼图） -->
            <view v-if="assetTabValue === 0" class="space-y-3">
              <view class="h-50 rounded-2xl bg-white">
                <PieChart v-if="assetPieOption.series?.[0]?.data?.length" :option="assetPieOption" custom-class="h-200px" />
                <view v-else class="h-full flex items-center justify-center text-sm text-gray-400">
                  暂无数据
                </view>
              </view>

              <!-- 资产配置列表 -->
              <wd-cell-group border custom-class="rounded-2! overflow-hidden">
                <block v-for="(item, index) in currentAssetData" :key="index">
                  <wd-cell :title="item.name" :value="formatPercentage(item.percentage)" />
                </block>
              </wd-cell-group>
            </view>

            <!-- 行业配置/前十大持仓（列表） -->
            <view v-else>
              <wd-cell-group border custom-class="rounded-2! overflow-hidden">
                <block v-for="(item, index) in currentAssetData" :key="index">
                  <wd-cell :title="item.name" :value="formatPercentage(item.percentage)" />
                </block>
              </wd-cell-group>
            </view>
          </view>
          <view v-else class="py-4 text-center text-sm text-gray-400">
            暂无资产结构数据
          </view>
        </wd-collapse-item>
      </wd-collapse>
    </view>
  </view>
</template>
