/**
 * 用户相关 API 接口
 */
import { alovaInstance } from '../core/instance'

/**
 * 微信小程序登录
 * @param params 登录参数
 */
export function wechatLogin(params: {
  authorizationCode: string
  [key: string]: any
}) {
  return alovaInstance.Post('/api/v1/user/login/wechat', params)
}

/**
 * 用户名密码登录
 * @param params 登录参数
 */
export function login(params: {
  username: string
  password: string
}) {
  return alovaInstance.Post('/api/v1/user/login', params)
}

/**
 * 微信扫码登录绑定
 * @param key 扫码登录的 key
 */
export function wechatBind(key: string) {
  return alovaInstance.Get(`/api/v1/user/wechat/bind?key=${key}`)
}

/**
 * 退出登录
 */
export function logout() {
  return alovaInstance.Post('/api/v1/user/logout')
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return alovaInstance.Get('/api/v1/user/info')
}
