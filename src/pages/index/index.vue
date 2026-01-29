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
</script>

<template>
  <view class="box-border py-3">
    <demo-block title="工具链介绍" transparent>
      <wd-cell-group border custom-class="rounded-2! overflow-hidden">
        <wd-cell title="📊 ETF 工具" is-link @click="navigateTo('etf')" />
      </wd-cell-group>
    </demo-block>
  </view>
</template>
