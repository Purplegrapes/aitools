<script lang="ts" setup>
const router = useRouter()

const route = useRoute()

const { activeTabbar, getTabbarItemValue, tabbarList } = useTabbar()

// #ifdef MP-WEIXIN
// 导航栏配置
const navbarConfig = computed(() => {
  // 从页面 definePage 的 style 中获取导航栏标题
  const title = (route as any)?.style?.navigationBarTitleText

  // 判断是否显示返回按钮（页面栈深度 > 1）
  const pages = getCurrentPages()
  const showBack = pages.length > 1

  return {
    title,
    leftArrow: showBack,
    border: false,
    fixed: true,
    placeholder: true,
    safeAreaInsetTop: true,
    onClickLeft: showBack ? () => router.back() : undefined,
  }
})
// #endif

function handleTabbarChange({ value }: { value: string }) {
  if (value === activeTabbar.value?.name)
    return

  router.pushTab({ name: value })
}

onMounted(() => {
  // #ifdef APP
  uni.hideTabBar()
  // #endif
})
</script>

<script lang="ts">
export default {
  options: {
    addGlobalClass: true,
    virtualHost: true,
    styleIsolation: 'shared',
  },
}
</script>

<template>
  <!-- #ifdef MP-WEIXIN -->
  <wd-navbar v-bind="navbarConfig" />
  <!-- #endif -->
  <slot />
  <wd-tabbar
    :model-value="activeTabbar.name"
    :bordered="false"
    safe-area-inset-bottom
    fixed
    @change="handleTabbarChange"
  >
    <wd-tabbar-item
      v-for="(item, index) in tabbarList" :key="index" :name="item.name"
      :value="getTabbarItemValue(item.name)" :title="item.title" :icon="item.icon"
    />
  </wd-tabbar>
</template>
