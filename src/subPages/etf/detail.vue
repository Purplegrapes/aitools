<script setup lang="ts">
definePage({
  name: 'etf-detail',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF 详情',
  },
})

const router = useRouter()

/**
 * 获取路由参数
 */
const query = computed(() => router.currentRoute.value.query as { code?: string })
const code = computed(() => query.value.code || '')

/**
 * ETF 详情数据
 */
const etfDetail = ref({
  code: '588110',
  name: '中证1000ETF',
  price: 4.256,
  change: 0.015,
  changePercent: 0.35,
  netValue: 4.255,
  discount: 0.02,
  scale: 125.6,
  day1: 0.5,
  month1: 2.3,
  month3: 5.6,
  month6: 12.3,
  year1: 18.5,
})

/**
 * 涨跌颜色
 */
function getChangeColor(value: number) {
  return value > 0 ? 'text-red-500' : value < 0 ? 'text-green-500' : 'text-gray-500'
}

/**
 * 返回首页
 */
function goBack() {
  router.back()
}
</script>

<template>
  <view class="min-h-screen bg-gray-100">
    <!-- 顶部信息卡片 -->
    <view class="bg-white p-4 mb-2">
      <view class="mb-4 flex items-center justify-between">
        <view>
          <text class="text-xl font-bold text-gray-800">
            {{ etfDetail.name }}
          </text>
          <text class="ml-2 text-sm text-gray-500">
            {{ etfDetail.code }}
          </text>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="flex items-baseline justify-between border-b border-gray-100 pb-4 mb-4">
        <view>
          <text class="text-3xl font-bold text-gray-800">
            {{ etfDetail.price.toFixed(3) }}
          </text>
          <text class="ml-2 text-base" :class="getChangeColor(etfDetail.change)">
            {{ etfDetail.change > 0 ? '+' : '' }}{{ etfDetail.change.toFixed(3) }}
            ({{ etfDetail.changePercent > 0 ? '+' : '' }}{{ etfDetail.changePercent.toFixed(2) }}%)
          </text>
        </view>
      </view>

      <!-- 关键指标 -->
      <view class="grid grid-cols-4 gap-2">
        <view class="text-center">
          <view class="text-sm text-gray-500">净值</view>
          <view class="text-base font-bold text-gray-800">
            {{ etfDetail.netValue.toFixed(3) }}
          </view>
        </view>
        <view class="text-center">
          <view class="text-sm text-gray-500">折溢价</view>
          <view class="text-base font-bold" :class="getChangeColor(etfDetail.discount)">
            {{ etfDetail.discount > 0 ? '+' : '' }}{{ etfDetail.discount.toFixed(2) }}%
          </view>
        </view>
        <view class="text-center">
          <view class="text-sm text-gray-500">规模(亿)</view>
          <view class="text-base font-bold text-gray-800">
            {{ etfDetail.scale.toFixed(2) }}
          </view>
        </view>
        <view class="text-center">
          <view class="text-sm text-gray-500">状态</view>
          <view class="text-base font-bold text-green-500">
            正常
          </view>
        </view>
      </view>
    </view>

    <!-- 收益表现 -->
    <view class="bg-white p-4 mb-2">
      <view class="mb-4 text-base font-bold text-gray-800">
        收益表现
      </view>
      <view class="grid grid-cols-5 gap-2">
        <view class="text-center rounded-lg bg-gray-50 p-2">
          <view class="text-xs text-gray-500">近1周</view>
          <view class="text-base font-bold" :class="getChangeColor(etfDetail.day1)">
            {{ etfDetail.day1 > 0 ? '+' : '' }}{{ etfDetail.day1 }}%
          </view>
        </view>
        <view class="text-center rounded-lg bg-gray-50 p-2">
          <view class="text-xs text-gray-500">近1月</view>
          <view class="text-base font-bold" :class="getChangeColor(etfDetail.month1)">
            {{ etfDetail.month1 > 0 ? '+' : '' }}{{ etfDetail.month1 }}%
          </view>
        </view>
        <view class="text-center rounded-lg bg-gray-50 p-2">
          <view class="text-xs text-gray-500">近3月</view>
          <view class="text-base font-bold" :class="getChangeColor(etfDetail.month3)">
            {{ etfDetail.month3 > 0 ? '+' : '' }}{{ etfDetail.month3 }}%
          </view>
        </view>
        <view class="text-center rounded-lg bg-gray-50 p-2">
          <view class="text-xs text-gray-500">近6月</view>
          <view class="text-base font-bold" :class="getChangeColor(etfDetail.month6)">
            {{ etfDetail.month6 > 0 ? '+' : '' }}{{ etfDetail.month6 }}%
          </view>
        </view>
        <view class="text-center rounded-lg bg-gray-50 p-2">
          <view class="text-xs text-gray-500">近1年</view>
          <view class="text-base font-bold" :class="getChangeColor(etfDetail.year1)">
            {{ etfDetail.year1 > 0 ? '+' : '' }}{{ etfDetail.year1 }}%
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="bg-white p-4">
      <view class="flex gap-3">
        <wd-button type="primary" block @click="goBack">
          返回列表
        </wd-button>
        <wd-button type="success" block>
          加入自选
        </wd-button>
      </view>
    </view>

    <!-- 风险提示 -->
    <view class="mt-4 px-4 text-center text-xs text-gray-400">
      基金有风险，投资需谨慎
    </view>
  </view>
</template>
