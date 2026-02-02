<script setup lang="ts">
definePage({
  name: 'home',
  layout: 'tabbar',
  style: {
    navigationBarTitleText: '首页',
  },
})

const router = useRouter()

// 页面跳转方法
function navigateTo(name: string) {
  router.push({
    name,
  })
}
function goEtfProfile() {
  router.push({
    name: 'etf-profile',
    params: {
      code: '510300',
      name: '沪深300ETF',
    },
  })
}

function goEtfPerformance() {
  router.push({
    name: 'asset-detail',
    params: {
      code: '515080_OF',
    },
  })
}
</script>

<template>
  <view class="box-border py-3">
    <demo-block title="工具链介绍" transparent>
      <wd-cell-group border custom-class="rounded-2! overflow-hidden">
        <wd-cell title="📊 ETF 工具" is-link @click="navigateTo('etf')" />
        <wd-cell title="📊 ETF 基础信息demo" is-link @click="goEtfProfile()" />
        <wd-cell title="📊 ETF 走势demo" is-link @click="goEtfPerformance()" />
      </wd-cell-group>
    </demo-block>
  </view>
</template>
