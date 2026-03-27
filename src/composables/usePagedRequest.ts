import type { Method } from 'alova'
import type { PagedQueryOptions } from './usePagedQuery'
import { usePagedQuery } from './usePagedQuery'

type PagingRefValue<TItem> = PagedQueryOptions<unknown, TItem>['pagingRef']

export interface PagedRequestOptions<TRaw, TItem, TArgs extends unknown[]> extends Omit<PagedQueryOptions<TRaw, TItem>, 'request'> {
  pagingRef: PagingRefValue<TItem>
  createMethod: (...args: TArgs) => Method
  fetchRaw: (
    pageNo: number,
    pageSize: number,
    from: ZPagingEnums.QueryFrom,
    sendRequest: (...args: TArgs) => Promise<TRaw>,
  ) => Promise<TRaw>
}

/**
 * 给 z-paging 列表补一层 Alova useRequest 桥接，避免页面直接对 Method 调用 send。
 */
export function usePagedRequest<TRaw, TItem, TArgs extends unknown[]>(
  options: PagedRequestOptions<TRaw, TItem, TArgs>,
) {
  const {
    pagingRef,
    createMethod,
    fetchRaw,
    ...pagedQueryOptions
  } = options

  const { send } = useRequest(
    (...args: TArgs) => createMethod(...args),
    {
      immediate: false,
      onError: () => undefined,
    },
  )

  function sendRequest(...args: TArgs) {
    return send(...(args as unknown as Parameters<typeof send>)) as Promise<TRaw>
  }

  return usePagedQuery<TRaw, TItem>({
    ...pagedQueryOptions,
    pagingRef,
    request: (pageNo, pageSize, from) => {
      return fetchRaw(pageNo, pageSize, from, sendRequest)
    },
  })
}
