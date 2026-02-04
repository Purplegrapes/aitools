/// <reference types="@uni-helper/vite-plugin-uni-pages/client" />
import { pages, subPackages } from 'virtual:uni-pages'
import { useExternalSourceStore } from '@/store/externalSourceStore'
import { useUserStore } from '@/store/userStore'
import { handleExternalRedirect } from '@/utils/externalRedirect'

function generateRoutes() {
  const routes = pages.map((page) => {
    const newPath = `/${page.path}`
    return { ...page, path: newPath }
  })
  if (subPackages && subPackages.length > 0) {
    subPackages.forEach((subPackage) => {
      const subRoutes = subPackage.pages.map((page: any) => {
        const newPath = `/${subPackage.root}/${page.path}`
        return { ...page, path: newPath }
      })
      routes.push(...subRoutes)
    })
  }
  return routes
}

const router = createRouter({
  routes: generateRoutes(),
})
router.beforeEach((to, from, next) => {
  console.log('🚀 beforeEach 守卫触发:', { to, from })

  // 认证守卫：检查token是否有效
  const userStore = useUserStore()
  const externalSourceStore = useExternalSourceStore()

  // 如果不是登录页，检查登录状态
  // 注意：这里假设登录页的name是'login'，请根据实际情况调整
  if (to.name !== 'login' && !userStore.accessToken) {
    console.log('🛡️ 未登录，重定向到登录页')
    // 根据来源决定跳转
    if (externalSourceStore.isExternal && !externalSourceStore.isExpired) {
      handleExternalRedirect()
      return
    }
    else {
      // 不跳转，直接访问
      // // router.replaceAll({ name: 'login' })
      // return
    }
  }

  // 演示：基本的导航日志记录
  if (to.path && from.path) {
    console.log(`📍 导航: ${from.path} → ${to.path}`)
  }

  // 演示：对受保护页面的简单拦截
  if (to.name === 'demo-protected') {
    const { confirm: showConfirm } = useGlobalMessage()
    console.log('🛡️ 检测到访问受保护页面')

    return new Promise<void>((resolve, reject) => {
      showConfirm({
        title: '守卫拦截演示',
        msg: '这是一个受保护的页面，需要确认后才能访问',
        confirmButtonText: '允许访问',
        cancelButtonText: '取消',
        success() {
          console.log('✅ 用户确认访问，允许导航')
          next()
          resolve()
        },
        fail() {
          console.log('❌ 用户取消访问，阻止导航')
          next(false)
          reject(new Error('用户取消访问'))
        },
      })
    })
  }

  // 继续导航
  next()
})

router.afterEach((to, from) => {
  console.log('🎯 afterEach 钩子触发:', { to, from })

  // 演示：简单的页面切换记录
  if (to.path) {
    console.log(`📄 页面切换完成: ${to.path}`)
  }

  // 演示：针对 afterEach 演示页面的简单提示
  if (to.name === 'demo-aftereach') {
    const { show: showToast } = useGlobalToast()
    console.log('📊 进入 afterEach 演示页面')
    setTimeout(() => {
      showToast('afterEach 钩子已触发！')
    }, 500)
  }
})

export default router
