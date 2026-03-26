/**
 * TAMP 外部来源状态管理
 * 用于存储外部跳入时的认证信息
 */
import type { ExternalSourceType } from '@/subPages/auth/utils/sourceDetector'
import cookie from 'js-cookie'
import { defineStore } from 'pinia'

/**
 * 外部来源信息
 * 注意：不再通过 URL 传递 token（安全考虑）
 * - 小程序：通过 code 换取 token
 * - H5：直接使用同域 cookie 中的 token
 */
export interface TampExternalInfo {
  source: ExternalSourceType
  loginUrl?: string
  shopId?: string
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
    isFromH5: state => state.externalInfo?.source !== 'miniprogram',

    /**
     * 获取访问 token
     * 优先从 cookie 读取（H5 同域存储），返回空字符串表示未登录
     */
    token: () => cookie.get('ticket') || '',

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
