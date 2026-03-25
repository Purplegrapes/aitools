import { alovaInstance } from '../../../api/core/instance.js'
export type {
  AuthorizeResponseDto,
  AuthUserProfileDto,
  SendSmsCodeResponseDto,
  TokenResponseDto,
  TransformTicketVerifyResponseDto,
  VerifyPhoneCodeResponse,
} from './types.js'
import type {
  AuthorizeResponseDto,
  AuthUserProfileDto,
  SendSmsCodeResponseDto,
  TokenResponseDto,
  TransformTicketVerifyResponseDto,
} from './types.js'

export function transferH5TicketForToken(params: {
  transferH5Ticket: string
}) {
  return alovaInstance.Post<TransformTicketVerifyResponseDto>('/shixi-api/oauth/h5/transform-ticket/verify', {
    transform_h5_ticket: params.transferH5Ticket,
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
