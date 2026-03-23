/**
 * TAMP 子包独立 API 接口
 * API 前缀: /tamp-api
 */
import { alovaInstance } from '@/api/core/instance'

export * from './marketing'

// ==================== 外部认证相关 API ====================
export interface AuthorizeResponseDto {
  code: string
  expires_in: number
}

export interface TokenResponseDto {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface SendSmsCodeResponseDto {
  success: boolean
  expires_in: number
}

export interface AuthUserProfileDto {
  id: string
  open_id: string
  nickname: string
  avatar_url: string
  created_at: string
  updated_at: string
}

/**
 * 通过code换取token（小程序跳转H5场景）
 * @param params 认证参数
 */
export function tokenByCode(params: {
  code: string
}) {
  return alovaInstance.Post<TokenResponseDto>('/auth-api/oauth/token', {
    code: params.code,
    grant_type: 'authorization_code',
  })
}

/**
 * 验证session获取token（H5跳转小程序场景）
 * @param params 认证参数
 */
export function tokenBySession(params: {
  sessionId: string
}) {
  return alovaInstance.Post<TokenResponseDto>('/auth-api/oauth/token', {
    code: params.sessionId,
    grant_type: 'authorization_code',
  })
}

/**
 * 发送手机号短信验证码（H5 登录）
 */
export function sendPhoneCode(params: {
  phone: string
}) {
  return alovaInstance.Post<SendSmsCodeResponseDto>('/auth-api/oauth/sms/send', params)
}

/**
 * 校验手机号短信验证码（H5 登录）
 */
export function verifyPhoneCode(params: {
  phone: string
  code: string
}) {
  return alovaInstance.Post<AuthorizeResponseDto>('/auth-api/oauth/sms/verify', params)
}

/**
 * 校验手机号短信验证码响应（Alova 包装后）
 */
export interface VerifyPhoneCodeResponse {
  data: AuthorizeResponseDto
}

/**
 * 授权码换 token（OAuth）
 */
export function exchangeToken(params: {
  code: string
  grant_type?: 'authorization_code'
}) {
  return alovaInstance.Post<TokenResponseDto>('/auth-api/oauth/token', {
    code: params.code,
    grant_type: params.grant_type || 'authorization_code',
  })
}

/**
 * 使用 refresh_token 刷新 token
 */
export function refreshAccessToken(params: {
  refresh_token: string
}) {
  return alovaInstance.Post<TokenResponseDto>('/auth-api/oauth/token/refresh', params)
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentAuthUser() {
  return alovaInstance.Get<AuthUserProfileDto>('/auth-api/user/me')
}

/**
 * 获取 TAMP 数据
 * @param params 查询参数
 */
export function getTampData(params?: Record<string, any>) {
  return alovaInstance.Get('/tamp-api/data', {
    params,
  })
}

// ==================== 商铺相关 API ====================
/**
 * 获取商铺信息
 * @param params 商铺参数
 * @param options 额外选项
 */
export function getShopInfo({
  params,
  options,
}: {
  // 店铺ID
  params: { shopId: string }
  options?: { [key: string]: unknown }
} = { params: { shopId: '' } }) {
  const { shopId } = params

  return alovaInstance.Get(`/app-api/shop/info/${shopId}`, {
    ...(options || {}),
  })
}
