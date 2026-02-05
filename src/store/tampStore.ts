/**
 * TAMP 外部来源状态管理
 * 用于存储外部跳入时的认证信息
 */
import type { ExternalSourceType } from '@/subPages/tamp/utils/sourceDetector'
import { defineStore } from 'pinia'

/**
 * 外部来源信息
 */
export interface TampExternalInfo {
  source: ExternalSourceType
  appId?: string
  token?: string
  loginUrl?: string
}

/**
 * TAMP 状态
 */
export interface TampState {
  externalInfo: TampExternalInfo | null
}

/**
 * TAMP 外部来源 Store
 */
export const useTampStore = defineStore('tamp', {
  state: (): TampState => ({
    externalInfo: null,
  }),

  getters: {
    /**
     * 是否为外部来源
     */
    isExternal: state => state.externalInfo !== null,

    /**
     * 是否为小程序来源
     */
    isFromMiniprogram: state => state.externalInfo?.source === 'miniprogram',

    /**
     * 是否为 H5 来源
     */
    isFromH5: state => state.externalInfo?.source === 'h5',

    /**
     * 获取访问 token
     */
    token: state => state.externalInfo?.token || '',

    /**
     * 获取 AppID
     */
    appId: state => state.externalInfo?.appId || '',

    /**
     * 获取登录页地址
     */
    loginUrl: state => state.externalInfo?.loginUrl || '',

    /**
     * 获取来源类型
     */
    source: state => state.externalInfo?.source || 'internal',
  },

  actions: {
    /**
     * 设置外部来源信息
     */
    setExternalInfo(info: TampExternalInfo) {
      console.log('setExternalInfo', info)
      this.externalInfo = info
    },

    /**
     * 清空外部来源信息
     */
    clearExternalInfo() {
      this.externalInfo = null
    },
  },
})
