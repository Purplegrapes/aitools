import type { Ref } from 'vue'

export interface PagedQueryOptions<TRaw, TItem> {
  pagingRef: Ref<ZPagingRef<TItem> | null> | { value: ZPagingRef<TItem> | null }
  request: (pageNo: number, pageSize: number, from: ZPagingEnums.QueryFrom) => Promise<TRaw>
  getList: (raw: TRaw) => TItem[]
  getTotal?: (raw: TRaw) => number | null | undefined
  getNoMore?: (raw: TRaw) => boolean | null | undefined
  onSuccess?: (raw: TRaw) => void
  onError?: (error: unknown) => void
}

/**
 * 全局通用分页查询模式：
 * 统一处理 z-paging 的 query、complete、error 逻辑。
 */
export function usePagedQuery<TRaw, TItem>(options: PagedQueryOptions<TRaw, TItem>) {
  const loading = ref(false)

  async function onQuery(pageNo: number, pageSize: number, from: ZPagingEnums.QueryFrom) {
    loading.value = true
    try {
      const raw = await options.request(pageNo, pageSize, from)
      options.onSuccess?.(raw)

      const list = options.getList(raw) || []
      const noMore = options.getNoMore?.(raw)
      if (typeof noMore === 'boolean') {
        await options.pagingRef.value?.completeByNoMore(list, noMore)
        return
      }

      const total = options.getTotal?.(raw)
      if (typeof total === 'number' && Number.isFinite(total)) {
        await options.pagingRef.value?.completeByTotal(list, total)
        return
      }

      await options.pagingRef.value?.complete(list)
    }
    catch (error) {
      options.onError?.(error)
      await options.pagingRef.value?.complete(false)
    }
    finally {
      loading.value = false
    }
  }

  function reload(animate = false) {
    return options.pagingRef.value?.reload(animate)
  }

  return {
    loading,
    onQuery,
    reload,
  }
}
