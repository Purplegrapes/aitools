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
        <wd-cell title="今日几星" is-link @click="navigateTo('etf')" />
        <wd-cell title="食息指南" is-link @click="goEtfPerformance()" />
      </wd-cell-group>
    </demo-block>
  </view>
</template>
