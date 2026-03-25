/// <reference types="@uni-helper/vite-plugin-uni-pages/client" />
import { pages, subPackages } from 'virtual:uni-pages'
import { buildAuthGatewayRouteFromTarget, shouldWrapMiniProgramExternalAccess } from '@/subPages/auth/utils/gateway'
import { buildRefererPath, createAuthLoginRoute, getStoredAuthToken } from '@/subPages/auth/utils/loginGuard'

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

const valuationAuthPaths = new Set([
  '/subPages/valuation-tool/watchlist',
  '/subPages/valuation-tool/holdings',
  '/subPages/valuation-tool/holdings-sync',
  '/subPages/valuation-tool/holdings-add',
  '/subPages/valuation-tool/holdings-edit',
  '/subPages/valuation-tool/holdings-upload',
])

function isValuationAuthRequired(path: string) {
  return valuationAuthPaths.has(path)
}

router.beforeEach((to, from, next) => {
  console.log('🚀 beforeEach 守卫触发:', { to, from })

  const toQuery = (to.query || {}) as Record<string, unknown>

  if (shouldWrapMiniProgramExternalAccess(to.path || '', toQuery)) {
    next(buildAuthGatewayRouteFromTarget(to.path, toQuery))
    return
  }

  if (isValuationAuthRequired(to.path || '')) {
    const token = getStoredAuthToken()
    // 只以 token 作为登录态门槛，避免 user/me 回填时序导致登录后被守卫回跳登录页
    if (!token) {
      const referrer = buildRefererPath(to.path || '/subPages/valuation-tool/index', toQuery)
      next(createAuthLoginRoute(referrer))
      return
    }
  }

  // 演示：基本的导航日志记录
  if (to.path && from.path) {
    console.log(`📍 导航: ${from.path} → ${to.path}`)
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
})

export default router
