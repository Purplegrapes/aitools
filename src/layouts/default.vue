<script lang="ts" setup>
// #ifdef MP-WEIXIN
const route = useRoute()
const router = useRouter()

// 判断是否显示返回按钮（页面栈深度 > 1）
const showBack = computed(() => {
  const pages = getCurrentPages()
  return pages.length > 1
})

// 导航栏配置
const navbarConfig = computed(() => {
  // 从页面 definePage 的 style 中获取导航栏标题
  const title = (route as any)?.style?.navigationBarTitleText
  return {
    title,
    leftArrow: showBack.value,
    border: false,
    fixed: true,
    placeholder: true,
    safeAreaInsetTop: true,
    onClickLeft: showBack.value ? () => router.back() : undefined,
  }
})
// #endif
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
</template>
