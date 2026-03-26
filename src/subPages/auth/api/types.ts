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
  open_id?: string
  nickname: string
  avatar_url: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

export interface VerifyPhoneCodeResponse {
  data: AuthorizeResponseDto
}

export interface TransformTicketVerifyResponseDto {
  user: AuthUserProfileDto & {
    wechat_open_id?: string
    wechat_union_id?: string
    phone?: string | null
    has_binding?: boolean
  }
  user_id: string
  system_key: string
  expires_at: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}
