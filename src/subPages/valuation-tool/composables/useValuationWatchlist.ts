import type {
  FavouriteItemServiceResponse,
  FavouriteRealtimeItemServiceResponse,
  ValuationWatchlistFund,
  ValuationWatchlistMutationInput,
} from '../types'
import {
  addValuationWatchlist,
  getValuationWatchlist,
  getValuationWatchlistRealtime,
  removeValuationWatchlist,
} from '../api/valuationTool'

const watchlistItemsState = shallowRef<ValuationWatchlistFund[]>([])
const watchlistLoadingState = shallowRef(false)
const watchlistLoadedState = shallowRef(false)
const watchlistErrorState = shallowRef(false)

export function useValuationWatchlist() {
  const globalToast = useGlobalToast()

  const watchlistItems = computed(() => watchlistItemsState.value)

  function isWatchlisted(code: string) {
    return watchlistItemsState.value.some(item => item.code === code)
  }

  async function refreshWatchlist(force = false) {
    if (watchlistLoadingState.value)
      return
    if (!force && watchlistLoadedState.value)
      return

    watchlistLoadingState.value = true
    watchlistErrorState.value = false

    try {
      const [listResponse, realtimeResponse] = await Promise.all([
        getValuationWatchlist().send(),
        getValuationWatchlistRealtime().send(),
      ])
      const listItems = (listResponse as { data?: FavouriteItemServiceResponse[] } | undefined)?.data
      const realtimeItems = (realtimeResponse as { data?: FavouriteRealtimeItemServiceResponse[] } | undefined)?.data
      const normalizedItems = normalizeWatchlistItems(listItems, realtimeItems)
      watchlistItemsState.value = normalizedItems
      watchlistLoadedState.value = true
    }
    catch {
      watchlistItemsState.value = []
      watchlistErrorState.value = true
    }
    finally {
      watchlistLoadingState.value = false
    }
  }

  async function refreshWatchlistListOnly() {
    if (watchlistLoadingState.value)
      return

    watchlistLoadingState.value = true
    watchlistErrorState.value = false

    try {
      const listResponse = await getValuationWatchlist().send()
      const listItems = (listResponse as { data?: FavouriteItemServiceResponse[] } | undefined)?.data
      watchlistItemsState.value = normalizeWatchlistItems(listItems)
      watchlistLoadedState.value = true
    }
    catch (error) {
      watchlistErrorState.value = true
      throw error
    }
    finally {
      watchlistLoadingState.value = false
    }
  }

  async function addToWatchlist(input: ValuationWatchlistMutationInput) {
    try {
      await addValuationWatchlist(input).send()
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
    try {
      await removeValuationWatchlist(code).send()
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

  return {
    watchlistItems,
    watchlistLoading: readonly(watchlistLoadingState),
    watchlistLoaded: readonly(watchlistLoadedState),
    watchlistError: readonly(watchlistErrorState),
    isWatchlisted,
    refreshWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
  }

  async function syncWatchlistListAfterMutation(fallback: () => void) {
    try {
      await refreshWatchlistListOnly()
    }
    catch {
      fallback()
    }
  }
}

function normalizeWatchlistItems(
  items?: ValuationWatchlistFund[] | FavouriteItemServiceResponse[],
  realtimeItems?: FavouriteRealtimeItemServiceResponse[],
) {
  if (!Array.isArray(items))
    return [] as ValuationWatchlistFund[]

  const realtimeMap = new Map(
    Array.isArray(realtimeItems)
      ? realtimeItems.map(item => [normalizeWatchlistCode(item.code), item])
      : [],
  )

  return items.map((item) => {
    const realtimeItem = realtimeMap.get(normalizeWatchlistCode(item.code))
    return {
      code: item.code,
      name: item.name,
      dailyChange: normalizeWatchlistDailyChange(
        'dailyChange' in item ? item.dailyChange : getRealtimeYieldChange(realtimeItem),
      ),
      updateTime: 'updateTime' in item ? item.updateTime || currentTimeText() : currentTimeText(),
      watchlisted: true,
    } satisfies ValuationWatchlistFund
  })
}

function upsertWatchlistItem(input: ValuationWatchlistMutationInput) {
  const normalizedCode = normalizeWatchlistCode(input.code)
  const nextItem: ValuationWatchlistFund = {
    code: input.code,
    name: input.name || input.code,
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
  watchlistLoadedState.value = true
  watchlistErrorState.value = false
}

function removeLocalWatchlistItem(code: string) {
  const normalizedCode = normalizeWatchlistCode(code)
  watchlistItemsState.value = watchlistItemsState.value.filter(
    item => normalizeWatchlistCode(item.code) !== normalizedCode,
  )
  watchlistLoadedState.value = true
  watchlistErrorState.value = false
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
