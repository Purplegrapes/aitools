import { defineStore } from 'pinia'

/**
 * 外部来源类型
 */
export type ExternalSourceType = 'miniprogram' | 'h5' | 'internal'

/**
 * 外部来源信息接口
 */
export interface ExternalSource {
  source: ExternalSourceType
  appId?: string
  loginUrl?: string
  targetPath?: string
  timestamp: number
}

/**
 * 外部来源状态
 */
export interface ExternalSourceState {
  source: ExternalSourceType
  appId?: string
  loginUrl?: string
  targetPath?: string
  timestamp: number
}

/**
 * 外部来源信息 Store
 * 用于持久化存储外部跳入来源，登录失效时跳转回外部登录页
 */
export const useExternalSourceStore = defineStore('externalSource', {
  state: (): ExternalSourceState => ({
    source: 'internal',
    appId: '',
    loginUrl: '',
    targetPath: '',
    timestamp: 0,
  }),

  getters: {
    /**
     * 是否为外部跳入
     */
    isExternal: state => state.source !== 'internal',

    /**
     * 来源是否已过期（超过1小时）
     */
    isExpired: (state) => {
      if (state.source === 'internal') {
        return false
      }
      const oneHour = 60 * 60 * 1000
      return Date.now() - state.timestamp > oneHour
    },
  },

  actions: {
    /**
     * 从URL查询参数初始化来源信息
     */
    initFromQuery(query: Record<string, any>) {
      // 小程序跳入
      if (query.code && query.from === 'miniapp') {
        this.source = 'miniprogram'
        this.appId = query.appId as string
        // 构造返回登录页URL（需要根据实际情况调整）
        this.loginUrl = '' // 小程序不需要loginUrl，直接通过appId跳转
        this.targetPath = `/${query.target || 'index'}`
        this.timestamp = Date.now()
      }
      // H5跳入
      else if (query.sessionId && query.from === 'h5') {
        this.source = 'h5'
        this.loginUrl = query.loginUrl as string || ''
        this.targetPath = `/${query.target || 'index'}`
        this.timestamp = Date.now()
      }
      // 内部访问
      else {
        this.clear()
      }
    },

    /**
     * 设置外部来源信息
     */
    setSource(source: ExternalSource) {
      this.source = source.source
      this.appId = source.appId
      this.loginUrl = source.loginUrl
      this.targetPath = source.targetPath
      this.timestamp = source.timestamp
    },

    /**
     * 清除来源信息（重置为内部访问）
     */
    clear() {
      this.source = 'internal'
      this.appId = ''
      this.loginUrl = ''
      this.targetPath = ''
      this.timestamp = 0
    },
  },
})
