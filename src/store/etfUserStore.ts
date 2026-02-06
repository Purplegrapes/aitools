import { defineStore } from 'pinia'

/**
 * ETF 用户信息接口
 */
export interface EtfUserInfo {
  id?: string | number
  nickname?: string
  avatar?: string
  [key: string]: any
}

/**
 * ETF 用户状态
 */
export interface EtfUserState {
  userInfo: EtfUserInfo | null
  token: string
  isLogin: boolean
}

/**
 * ETF 用户信息 Store
 */
export const useEtfUserStore = defineStore('etfUser', {
  state: (): EtfUserState => ({
    userInfo: null,
    token: '',
    isLogin: false,
  }),

  getters: {
    /**
     * 获取用户昵称
     */
    nickname: state => state.userInfo?.nickname || '',

    /**
     * 获取用户头像
     */
    avatar: state => state.userInfo?.avatar || '',
  },

  actions: {
    /**
     * 设置用户信息
     */
    setUserInfo(userInfo: EtfUserInfo) {
      this.userInfo = userInfo
    },

    /**
     * 设置 Token
     */
    setToken(token: string) {
      this.token = token
      this.isLogin = !!token
    },

    /**
     * 登录成功
     */
    login(userInfo: EtfUserInfo, token: string) {
      this.setUserInfo(userInfo)
      this.setToken(token)
    },

    /**
     * 退出登录
     */
    async logout() {
      this.userInfo = null
      this.token = ''
      this.isLogin = false
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(partialInfo: Partial<EtfUserInfo>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...partialInfo }
      }
    },
  },
})
