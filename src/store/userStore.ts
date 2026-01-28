import { defineStore } from 'pinia'
import { userApi } from '@/api'

/**
 * 用户信息接口
 */
export interface UserInfo {
  id?: string | number
  nickname?: string
  avatar?: string
  openid?: string
  token?: string
  [key: string]: any
}

/**
 * 用户状态
 */
export interface UserState {
  userInfo: UserInfo | null
  token: string
  isLogin: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean
  data: {
    token: string
    userInfo?: UserInfo
  }
  message?: string
}

/**
 * 用户信息 Store
 */
export const useUserStore = defineStore('user', {
  state: (): UserState => ({
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

    /**
     * 获取用户 ID
     */
    userId: state => state.userInfo?.id || '',
  },

  actions: {
    /**
     * 设置用户信息
     */
    setUserInfo(userInfo: UserInfo) {
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
    login(userInfo: UserInfo, token: string) {
      this.setUserInfo(userInfo)
      this.setToken(token)
    },

    /**
     * 微信小程序登录
     */
    async wechatLogin() {
      return new Promise<LoginResponse>((resolve, reject) => {
        // #ifdef MP-WEIXIN
        uni.login({
          provider: 'weixin',
          success: async (loginRes) => {
            try {
              // 调用后端登录接口
              const res = await userApi.wechatLogin({
                authorizationCode: loginRes.code,
              })
              const data = res as any

              if (data.success || data.data?.token) {
                // 登录成功，保存 token
                this.setToken(data.data.token)
                if (data.data.userInfo) {
                  this.setUserInfo(data.data.userInfo)
                }
                resolve(data as LoginResponse)
              }
              else {
                reject(new Error(data.message || '登录失败'))
              }
            }
            catch (err) {
              console.error('wechatLogin error:', err)
              reject(err)
            }
          },
          fail: (err) => {
            console.error('uni.login fail:', err)
            reject(err)
          },
        })
        // #endif

        // #ifndef MP-WEIXIN
        reject(new Error('当前平台不支持微信登录'))
        // #endif
      })
    },

    /**
     * 账号密码登录
     */
    async accountLogin(params: { username: string, password: string }) {
      try {
        const res = await userApi.login(params)
        const data = res as any

        if (data.success || data.data?.token) {
          this.setToken(data.data.token)
          if (data.data.userInfo) {
            this.setUserInfo(data.data.userInfo)
          }
          return data
        }
        else {
          throw new Error(data.message || '登录失败')
        }
      }
      catch (err) {
        console.error('accountLogin error:', err)
        throw err
      }
    },

    /**
     * 退出登录
     */
    async logout() {
      try {
        // 调用退出登录接口
        await userApi.logout()
      }
      catch (err) {
        console.error('logout API error:', err)
      }
      finally {
        // 无论接口是否成功，都清除本地状态
        this.userInfo = null
        this.token = ''
        this.isLogin = false
      }
    },

    /**
     * 更新用户信息
     */
    updateUserInfo(partialInfo: Partial<UserInfo>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...partialInfo }
      }
    },
  },
})
