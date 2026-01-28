<script setup lang="ts">
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

onLaunch(async () => {
  // 自动登录：检查是否有 token，如果没有则尝试登录
  if (!userStore.token) {
    try {
      await userStore.accountLogin({
        username: 'admin',
        password: 'OIAyWw8Y0Uo8',
      })
    }
    catch (err) {
      console.log('自动登录失败:', err)
    }
  }
})
</script>

<style lang="scss">
.page-wraper {
  min-height: calc(100vh - var(--window-top));
  box-sizing: border-box;
  background: #f9f9f9;
}

.wot-theme-dark.page-wraper {
  background: #222;
}
</style>
