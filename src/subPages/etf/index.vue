<script setup lang="ts">
definePage({
  name: 'etf',
  layout: 'default',
  style: {
    navigationBarTitleText: 'ETF 工具',
  },
})

const router = useRouter()

/**
 * 基金列表数据
 */
const etfList = ref([
  {
    code: '588110',
    name: '中证1000ETF',
    price: 4.256,
    change: 0.015,
    changePercent: 0.35,
  },
  {
    code: '159516',
    name: '新能源ETF',
    price: 1.234,
    change: -0.008,
    changePercent: -0.64,
  },
  {
    code: '512400',
    name: '沪深300ETF',
    price: 3.876,
    change: 0.025,
    changePercent: 0.65,
  },
  {
    code: '159546',
    name: '军工龙头ETF',
    price: 1.567,
    change: 0.012,
    changePercent: 0.77,
  },
])

/**
 * 涨跌颜色
 */
function getChangeColor(value: number) {
  return value > 0 ? 'text-red-500' : value < 0 ? 'text-green-500' : 'text-gray-500'
}

/**
 * 跳转到详情页
 */
function goToDetail(code: string) {
  router.push({
    path: '/subPages/etf/detail',
    query: { code },
  })
}

/**
 * 刷新数据
 */
function onRefresh() {
  console.log('刷新 ETF 列表')
  // TODO: 调用 API 刷新数据
}
</script>

<template>
  <view class="min-h-screen bg-gray-100 p-3">
    <!-- ETF 列表 -->
    <view class="bg-white rounded-2 overflow-hidden">
      <view
        v-for="item in etfList"
        :key="item.code"
        class="flex items-center justify-between border-b border-gray-100 p-4 active:bg-gray-50"
        @click="goToDetail(item.code)"
      >
        <view class="flex-1">
          <view class="mb-2 text-base font-bold text-gray-800">
            {{ item.name }}
          </view>
          <view class="text-sm text-gray-500">
            {{ item.code }}
          </view>
        </view>
        <view class="text-right">
          <view class="mb-1 text-lg font-bold">
            {{ item.price.toFixed(3) }}
          </view>
          <view class="flex items-center justify-end gap-1">
            <view class="text-sm" :class="getChangeColor(item.change)">
              {{ item.change > 0 ? '+' : '' }}{{ item.change.toFixed(3) }}
            </view>
            <view class="text-sm" :class="getChangeColor(item.changePercent)">
              {{ item.changePercent > 0 ? '+' : '' }}{{ item.changePercent.toFixed(2) }}%
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="mt-4 text-center text-sm text-gray-400">
      数据仅供参考，不构成投资建议
    </view>
  </view>
</template>
