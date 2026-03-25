import { alovaInstance } from '@/api/core/instance'

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

export interface VerifyPhoneCodeResponse {
  data: AuthorizeResponseDto
}

export function transferH5TicketForToken(params: {
  transferH5Ticket: string
}) {
  return alovaInstance.Post<TokenResponseDto>('/shixi-api/oauth/token', {
    code: params.transferH5Ticket,
    grant_type: 'authorization_code',
  })
}

export function tokenBySession(params: {
  sessionId: string
}) {
  return alovaInstance.Post<TokenResponseDto>('/shixi-api/oauth/token', {
    code: params.sessionId,
    grant_type: 'authorization_code',
  })
}

export function sendPhoneCode(params: {
  phone: string
}) {
  return alovaInstance.Post<SendSmsCodeResponseDto>('/shixi-api/oauth/sms/send', params)
}

export function verifyPhoneCode(params: {
  phone: string
  code: string
}) {
  return alovaInstance.Post<AuthorizeResponseDto>('/shixi-api/oauth/sms/verify', params)
}

export function exchangeToken(params: {
  code: string
  grant_type?: 'authorization_code'
}) {
  return alovaInstance.Post<TokenResponseDto>('/shixi-api/oauth/token', {
    code: params.code,
    grant_type: params.grant_type || 'authorization_code',
  })
}

export function refreshAccessToken(params: {
  refresh_token: string
}) {
  return alovaInstance.Post<TokenResponseDto>('/shixi-api/oauth/token/refresh', params)
}

export function getCurrentAuthUser() {
  return alovaInstance.Get<AuthUserProfileDto>('/shixi-api/user/me')
}
