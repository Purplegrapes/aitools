import type {
  FavouriteItemServiceResponse,
  FavouriteRealtimeItemServiceResponse,
  ValuationWatchlistFund,
  ValuationWatchlistMutationInput,
} from '../types'
import { useEtfUserStore } from '@/store/etfUserStore'
import { buildRefererPath, createAuthLoginRoute, getStoredUserId } from '@/subPages/auth/utils/loginGuard'
import {
  addValuationWatchlist,
  getValuationWatchlist,
  getValuationWatchlistRealtime,
  removeValuationWatchlist,
} from '../api/valuationTool'

const watchlistItemsState = shallowRef<ValuationWatchlistFund[]>([])
const watchlistHasSnapshotState = shallowRef(false)
const watchlistRefreshModeState = shallowRef<'full' | 'list-only' | null>(null)

export function useValuationWatchlist() {
  const router = useRouter()
  const route = useRoute()
  const globalToast = useGlobalToast()
  const userStore = useEtfUserStore()

  const watchlistItems = computed(() => watchlistItemsState.value)

  function isWatchlisted(code: string) {
    return watchlistItemsState.value.some(item => item.code === code)
  }

  const { error: watchlistListRequestError, loading: watchlistListLoading, send: sendWatchlistListRequest } = useRequest(
    (uid: string) => getValuationWatchlist(uid),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const { error: watchlistRealtimeRequestError, loading: watchlistRealtimeLoading, send: sendWatchlistRealtimeRequest } = useRequest(
    (uid: string) => getValuationWatchlistRealtime(uid),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const { send: sendAddWatchlistRequest } = useRequest(
    (input: ValuationWatchlistMutationInput & { uid: string }) => addValuationWatchlist(input),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const { send: sendRemoveWatchlistRequest } = useRequest(
    ({ code, uid }: { code: string, uid: string }) => removeValuationWatchlist(code, uid),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  const watchlistLoading = computed(() => {
    return watchlistRefreshModeState.value === 'full' && (watchlistListLoading.value || watchlistRealtimeLoading.value)
  })
  const watchlistError = computed(() => {
    if (watchlistLoading.value)
      return false

    if (watchlistRefreshModeState.value === 'list-only')
      return false

    if (watchlistHasSnapshotState.value)
      return false

    return !!watchlistListRequestError.value || !!watchlistRealtimeRequestError.value
  })

  async function refreshWatchlist(force = false) {
    const userId = ensureUserId()
    if (!userId) {
      watchlistItemsState.value = []
      return
    }
    if (watchlistRefreshModeState.value)
      return
    if (!force && watchlistHasSnapshotState.value)
      return

    watchlistRefreshModeState.value = 'full'
    try {
      const [listResponse, realtimeResponse] = await Promise.all([
        sendWatchlistListRequest(userId),
        sendWatchlistRealtimeRequest(userId),
      ])
      applyWatchlistItems(
        (listResponse as { data?: FavouriteItemServiceResponse[] } | undefined)?.data,
        (realtimeResponse as { data?: FavouriteRealtimeItemServiceResponse[] } | undefined)?.data,
      )
    }
    catch {
      watchlistItemsState.value = []
    }
    finally {
      watchlistRefreshModeState.value = null
    }
  }

  async function refreshWatchlistListOnly() {
    const userId = ensureUserId()
    if (!userId)
      return false

    if (watchlistRefreshModeState.value)
      return false

    watchlistRefreshModeState.value = 'list-only'

    try {
      const listResponse = await sendWatchlistListRequest(userId)
      applyWatchlistItems((listResponse as { data?: FavouriteItemServiceResponse[] } | undefined)?.data)
      return true
    }
    catch {
      return false
    }
    finally {
      watchlistRefreshModeState.value = null
    }
  }

  async function addToWatchlist(input: ValuationWatchlistMutationInput) {
    const userId = ensureUserId()
    if (!userId)
      return false

    try {
      await sendAddWatchlistRequest({
        ...input,
        uid: userId,
      })
      await syncWatchlistListAfterMutation(() => upsertWatchlistItem(input))
      globalToast.success('加入自选成功')
      return true
    }
    catch {
      globalToast.error('加入自选失败')
      return false
    }
  }

  async function removeFromWatchlist(code: string) {
    const userId = ensureUserId()
    if (!userId)
      return false

    try {
      await sendRemoveWatchlistRequest({ code, uid: userId })
      await syncWatchlistListAfterMutation(() => removeLocalWatchlistItem(code))
      globalToast.success('取消自选成功')
      return true
    }
    catch {
      globalToast.error('取消自选失败')
      return false
    }
  }

  async function toggleWatchlist(input: ValuationWatchlistMutationInput) {
    if (isWatchlisted(input.code))
      return removeFromWatchlist(input.code)
    return addToWatchlist(input)
  }

  function ensureUserId() {
    const inMemoryUserId = userStore.userInfo?.id
    if (inMemoryUserId !== null && inMemoryUserId !== undefined && `${inMemoryUserId}`.trim())
      return `${inMemoryUserId}`

    const persistedUserId = getStoredUserId()
    if (persistedUserId)
      return persistedUserId

    const referer = buildRefererPath(route.path || '/subPages/valuation-tool/index', route.query as Record<string, unknown>)
    router.replace(createAuthLoginRoute(referer))
    globalToast.warning('请先登录后再使用该功能')
    return ''
  }

  return {
    watchlistItems,
    watchlistLoading,
    watchlistError,
    isWatchlisted,
    refreshWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  }

  async function syncWatchlistListAfterMutation(fallback: () => void) {
    const synced = await refreshWatchlistListOnly()
    if (!synced) {
      fallback()
    }
  }
}

function applyWatchlistItems(
  items?: ValuationWatchlistFund[] | FavouriteItemServiceResponse[],
  realtimeItems?: FavouriteRealtimeItemServiceResponse[],
) {
  watchlistItemsState.value = normalizeWatchlistItems(items, realtimeItems, watchlistItemsState.value)
  watchlistHasSnapshotState.value = true
}

function normalizeWatchlistItems(
  items?: ValuationWatchlistFund[] | FavouriteItemServiceResponse[],
  realtimeItems?: FavouriteRealtimeItemServiceResponse[],
  currentItems: ValuationWatchlistFund[] = [],
) {
  if (!Array.isArray(items))
    return [] as ValuationWatchlistFund[]

  const realtimeMap = new Map(
    Array.isArray(realtimeItems)
      ? realtimeItems.map(item => [normalizeWatchlistCode(item.code), item])
      : [],
  )
  const currentItemMap = new Map(
    currentItems.map(item => [normalizeWatchlistCode(item.code), item]),
  )

  return items.map((item) => {
    const realtimeItem = realtimeMap.get(normalizeWatchlistCode(item.code))
    const currentItem = currentItemMap.get(normalizeWatchlistCode(item.code))
    const realtimeNav = 'realtimeNav' in item
      ? item.realtimeNav
      : getRealtimeNav(realtimeItem) ?? currentItem?.realtimeNav
    const dailyChange = 'dailyChange' in item
      ? item.dailyChange
      : getRealtimeYieldChange(realtimeItem) ?? currentItem?.dailyChange
    const updateTime = 'updateTime' in item
      ? item.updateTime || currentTimeText()
      : currentItem?.updateTime || currentTimeText()

    return {
      code: item.code,
      name: item.name,
      realtimeNav: normalizeWatchlistRealtimeNav(realtimeNav),
      dailyChange: normalizeWatchlistDailyChange(dailyChange),
      updateTime,
      watchlisted: true,
    } satisfies ValuationWatchlistFund
  })
}

function upsertWatchlistItem(input: ValuationWatchlistMutationInput) {
  const normalizedCode = normalizeWatchlistCode(input.code)
  const nextItem: ValuationWatchlistFund = {
    code: input.code,
    name: input.name || input.code,
    realtimeNav: null,
    dailyChange: normalizeWatchlistDailyChange(input.dailyChange),
    updateTime: input.updateTime || currentTimeText(),
    watchlisted: true,
  }

  const currentItems = [...watchlistItemsState.value]
  const currentIndex = currentItems.findIndex(item => normalizeWatchlistCode(item.code) === normalizedCode)

  if (currentIndex >= 0) {
    currentItems[currentIndex] = {
      ...currentItems[currentIndex],
      ...nextItem,
      name: input.name || currentItems[currentIndex].name,
      watchlisted: true,
    }
  }
  else {
    currentItems.unshift(nextItem)
  }

  watchlistItemsState.value = currentItems
  watchlistHasSnapshotState.value = true
}

function removeLocalWatchlistItem(code: string) {
  const normalizedCode = normalizeWatchlistCode(code)
  watchlistItemsState.value = watchlistItemsState.value.filter(
    item => normalizeWatchlistCode(item.code) !== normalizedCode,
  )
  watchlistHasSnapshotState.value = true
}

function normalizeWatchlistCode(code?: string | null) {
  return `${code || ''}`.trim().toUpperCase()
}

function getRealtimeYieldChange(item?: FavouriteRealtimeItemServiceResponse | null) {
  if (!item)
    return null

  const candidate = (item as FavouriteRealtimeItemServiceResponse & {
    yield_change?: number | null
    yield?: number | null
  }).yieldChange
  ?? (item as FavouriteRealtimeItemServiceResponse & { yield_change?: number | null }).yield_change
  ?? (item as FavouriteRealtimeItemServiceResponse & { yield?: number | null }).yield

  return candidate ?? null
}

function getRealtimeNav(item?: FavouriteRealtimeItemServiceResponse | null) {
  if (!item)
    return null

  return item.nav
}

function normalizeWatchlistRealtimeNav(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return null

  return Number(value)
}

function normalizeWatchlistDailyChange(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return null

  const numericValue = Number(value)
  if (Math.abs(numericValue) <= 1)
    return numericValue * 100

  return numericValue
}

function currentTimeText() {
  const currentDate = new Date()
  const hours = `${currentDate.getHours()}`.padStart(2, '0')
  const minutes = `${currentDate.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}
