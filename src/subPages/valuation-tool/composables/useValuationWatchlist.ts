import type { ValuationWatchlistFund, ValuationWatchlistMutationInput } from '../types'
import {
  addValuationWatchlist,
  getValuationWatchlist,
  removeValuationWatchlist,
} from '../api/valuationTool'
import {
  getFallbackWatchlistFunds,
  removeFallbackWatchlistFund,
  saveFallbackWatchlistFund,
} from '../mock'

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
      const response = await getValuationWatchlist().send()
      const items = (response as { data?: ValuationWatchlistFund[] | { items?: ValuationWatchlistFund[] } } | undefined)?.data
      watchlistItemsState.value = normalizeWatchlistItems(Array.isArray(items) ? items : items?.items)
      watchlistLoadedState.value = true
    }
    catch {
      if (import.meta.env.DEV) {
        watchlistItemsState.value = normalizeWatchlistItems(getFallbackWatchlistFunds())
        watchlistLoadedState.value = true
      }
      else {
        watchlistErrorState.value = true
      }
    }
    finally {
      watchlistLoadingState.value = false
    }
  }

  async function addToWatchlist(input: ValuationWatchlistMutationInput) {
    try {
      await addValuationWatchlist(input).send()
      upsertWatchlistItem(input)
      globalToast.success('加入自选成功')
      return true
    }
    catch {
      if (!import.meta.env.DEV) {
        globalToast.error('加入自选失败')
        return false
      }

      const fallbackItem = saveFallbackWatchlistFund(input)
      watchlistItemsState.value = normalizeWatchlistItems([...watchlistItemsState.value, fallbackItem])
      watchlistLoadedState.value = true
      globalToast.success('加入自选成功')
      return true
    }
  }

  async function removeFromWatchlist(code: string) {
    try {
      await removeValuationWatchlist(code).send()
      watchlistItemsState.value = watchlistItemsState.value.filter(item => item.code !== code)
      globalToast.success('取消自选成功')
      return true
    }
    catch {
      if (!import.meta.env.DEV) {
        globalToast.error('取消自选失败')
        return false
      }

      removeFallbackWatchlistFund(code)
      watchlistItemsState.value = watchlistItemsState.value.filter(item => item.code !== code)
      watchlistLoadedState.value = true
      globalToast.success('取消自选成功')
      return true
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
}

function normalizeWatchlistItems(items?: ValuationWatchlistFund[]) {
  if (!Array.isArray(items))
    return [] as ValuationWatchlistFund[]

  return items.map((item) => {
    return {
      code: item.code,
      name: item.name,
      dailyChange: typeof item.dailyChange === 'number' ? item.dailyChange : null,
      updateTime: item.updateTime || '14:05',
      watchlisted: true,
    } satisfies ValuationWatchlistFund
  })
}

function upsertWatchlistItem(input: ValuationWatchlistMutationInput) {
  const nextItem: ValuationWatchlistFund = {
    code: input.code,
    name: input.name || `基金 ${input.code}`,
    dailyChange: typeof input.dailyChange === 'number' ? input.dailyChange : null,
    updateTime: input.updateTime || '14:05',
    watchlisted: true,
  }

  watchlistItemsState.value = normalizeWatchlistItems([
    ...watchlistItemsState.value.filter(item => item.code !== input.code),
    nextItem,
  ])
  watchlistLoadedState.value = true
  watchlistErrorState.value = false
}
