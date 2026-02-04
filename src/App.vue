<script setup lang="ts">
import { useExternalSourceStore } from '@/store/externalSourceStore'
import { useUserStore } from '@/store/userStore'
import { handleExternalRedirect } from '@/utils/externalRedirect'
import { detectAccessMode, getPageQuery } from '@/utils/sourceDetector'

const userStore = useUserStore()
const externalSourceStore = useExternalSourceStore()

onLaunch(async () => {
  console.log('App onLaunch')

  // 检测访问模式
  const query = getPageQuery()
  const { mode, source } = detectAccessMode(query)

  console.log('访问模式:', { mode, source, query })

  // 外部跳入模式
  if (mode === 'external') {
    // 初始化外部来源信息
    externalSourceStore.initFromQuery(query)

    // 尝试通过外部方式获取token
    try {
      if (source === 'miniprogram' && query.code) {
        console.log('通过code换取token...')
        await userStore.loginByCode(query.code, query.appId)
        console.log('code换取token成功')
      }
      else if (source === 'h5' && query.sessionId) {
        console.log('通过sessionId获取token...')
        await userStore.loginBySession(query.sessionId)
        console.log('sessionId获取token成功')
      }
    }
    catch (error: any) {
      console.error('外部认证失败:', error)
      // 认证失败，跳转外部登录
      await handleExternalRedirect()
    }
  }
  // 内部访问模式：保持原有自动登录逻辑
  else if (!userStore.accessToken) {
    try {
      console.log('尝试账号登录...')
      await userStore.accountLogin({
        username: 'admin',
        password: 'OIAyWw8Y0Uo8',
      })
      console.log('账号登录成功')
    }
    catch (err) {
      console.log('账号登录失败:', err)
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
