<script setup lang="ts">
import { initVConsole } from '@/utils/vconsole'

// 初始化 VConsole（H5 开发环境）
initVConsole()

onLaunch(() => {
  console.log('App onLaunch')
})
</script>

<style lang="scss">
html,
body,
#app,
.uni-app,
.uni-page-body,
.page-wraper {
  background: #f5f7fa;
}

.page-wraper {
  min-height: calc(100vh - var(--window-top));
  box-sizing: border-box;
}

.wot-theme-dark.page-wraper {
  background: #222;
}
</style>
