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
    active-color="#1678FF"
    custom-class="vt-tabbar-shell"
    custom-style="background: rgba(255,255,255,0.96);"
    inactive-color="#8A95A1"
    safe-area-inset-bottom
    fixed
    @change="handleTabbarChange"
  >
    <wd-tabbar-item
      v-for="(item, index) in tabbarList" :key="index" :name="item.name"
      custom-class="vt-tabbar-item"
      :value="getTabbarItemValue(item.name)" :title="item.title" :icon="item.icon"
    />
  </wd-tabbar>
</template>

<style lang="scss" scoped>
:deep(.vt-tabbar-shell) {
  box-sizing: content-box;
  padding-top: 16rpx;
  box-shadow: 0 -8rpx 30rpx rgba(17, 37, 62, 0.06);
  backdrop-filter: blur(20rpx);
}

:deep(.vt-tabbar-shell .wd-tabbar-item) {
  min-width: 0;
}

:deep(.vt-tabbar-shell .wd-tabbar-item__body) {
  width: 100%;
  min-height: 88rpx;
  justify-content: center;
  gap: 6rpx;
  border-radius: 20rpx;
  transition: background-color 0.2s ease, color 0.2s ease;
}

:deep(.vt-tabbar-shell .wd-tabbar-item__body-title) {
  font-size: 20rpx;
  line-height: 1.2;
  font-weight: 500;
  white-space: nowrap;
}

:deep(.vt-tabbar-shell .wd-tabbar-item__body .is-inactive) {
  color: #8A95A1 !important;
}

:deep(.vt-tabbar-shell .wd-tabbar-item__body .is-active) {
  color: #1678FF !important;
}

:deep(.vt-tabbar-shell .wd-tabbar-item:active .wd-tabbar-item__body) {
  background: rgba(242, 245, 250, 0.9);
}
</style>
