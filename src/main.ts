import { createSSRApp } from 'vue'
import { initZPagingGlobalConfig } from '@/utils/zPaging'
import App from './App.vue'
import router from './router'

import 'uno.css'

const pinia = createPinia()
pinia.use(persistPlugin)
export function createApp() {
  initZPagingGlobalConfig()
  const app = createSSRApp(App)
  app.use(router)
  app.use(pinia)
  return {
    app,
  }
}
