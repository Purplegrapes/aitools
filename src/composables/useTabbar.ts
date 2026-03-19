export interface TabbarItem {
  name: string
  value: number | null
  title: string
  icon: string
  group: 'app' | 'valuation-tool'
}

const tabbarItems = ref<TabbarItem[]>([
  { name: 'home', value: null, title: '首页', icon: 'home', group: 'app' },
  { name: 'about', value: null, title: '关于', icon: 'user', group: 'app' },
  { name: 'valuation-tool-home', value: null, title: '首页', icon: 'home', group: 'valuation-tool' },
  { name: 'valuation-tool-watchlist', value: null, title: '自选', icon: 'star', group: 'valuation-tool' },
  { name: 'valuation-tool-holdings', value: null, title: '持仓', icon: 'wallet', group: 'valuation-tool' },
])

const valuationToolRouteNames = new Set([
  'valuation-tool-home',
  'valuation-tool-watchlist',
  'valuation-tool-holdings',
])

export function useTabbar() {
  const route = useRoute()

  const currentGroup = computed<'app' | 'valuation-tool'>(() => {
    return valuationToolRouteNames.has(`${route.name || ''}`) ? 'valuation-tool' : 'app'
  })

  const tabbarList = computed(() => {
    return tabbarItems.value.filter(item => item.group === currentGroup.value)
  })

  const activeTabbar = computed(() => {
    const currentRouteName = `${route.name || ''}`
    const item = tabbarList.value.find(item => item.name === currentRouteName)
    return item || tabbarList.value[0]
  })

  const getTabbarItemValue = (name: string) => {
    const item = tabbarList.value.find(item => item.name === name)
    return item && item.value ? item.value : null
  }

  const setTabbarItem = (name: string, value: number) => {
    const tabbarItem = tabbarItems.value.find(item => item.name === name)
    if (tabbarItem) {
      tabbarItem.value = value
    }
  }

  return {
    tabbarList,
    activeTabbar,
    currentGroup,
    getTabbarItemValue,
    setTabbarItem,
  }
}
