import loadingIcon from '@/assets/loading.png'

interface ZPagingGlobalConfig {
  [key: string]: string | number | boolean | Record<string, string>
}

interface UniWithZPaging extends UniNamespace.Uni {
  $zp?: {
    config: ZPagingGlobalConfig
  }
}

const Z_PAGING_GLOBAL_CONFIG: ZPagingGlobalConfig = {
  refresherDefaultText: '下拉可刷新',
  refresherPullingText: '松手立即刷新',
  refresherRefreshingText: '正在同步数据...',
  refresherCompleteText: '刷新成功',
  refresherImgStyle: {
    width: '30rpx',
    height: '30rpx',
    marginRight: '10rpx',
  },
  refresherTitleStyle: {
    color: '#6B7280',
    fontSize: '24rpx',
  },
  refresherDefaultImg: loadingIcon,
  refresherPullingImg: loadingIcon,
  refresherRefreshingImg: loadingIcon,
  loadingMoreDefaultText: '上滑加载更多',
  loadingMoreLoadingText: '加载中...',
  loadingMoreNoMoreText: '没有更多了',
  loadingMoreTitleCustomStyle: {
    color: '#6B7280',
    fontSize: '24rpx',
  },
  loadingMoreLoadingIconCustomImage: loadingIcon,
  loadingMoreLoadingIconCustomStyle: {
    width: '28rpx',
    height: '28rpx',
  },
}

/**
 * 初始化 z-paging 全局样式配置，统一下拉刷新与上滑加载的视觉表现。
 */
export function initZPagingGlobalConfig(): void {
  const uniWithZPaging = uni as UniWithZPaging
  uniWithZPaging.$zp = {
    ...(uniWithZPaging.$zp || {}),
    config: {
      ...(uniWithZPaging.$zp?.config || {}),
      ...Z_PAGING_GLOBAL_CONFIG,
    },
  }
}
