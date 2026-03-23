import type { TokenResponseDto } from '../../tamp/api'
import cookie from 'js-cookie'
import { useEtfUserStore } from '@/store/etfUserStore'

export interface AuthSessionPayload {
  token: string
  refreshToken?: string
  tokenType?: string
  expiresIn?: number
  userInfo?: Record<string, any> | null
}

export function extractAuthSessionPayload(response: TokenResponseDto | any): AuthSessionPayload | null {
  const data = response?.data || response?.result || response
  const token = data?.access_token || data?.token || data?.accessToken || data?.jwtToken || ''

  if (!token || typeof token !== 'string')
    return null

  return {
    token,
    refreshToken: data?.refresh_token || data?.refreshToken || '',
    tokenType: data?.token_type || data?.tokenType || '',
    expiresIn: Number(data?.expires_in || data?.expiresIn || 0) || 0,
    userInfo: data?.userInfo || null,
  }
}

export function applyAuthSession(payload: AuthSessionPayload) {
  const userStore = useEtfUserStore()
  userStore.setAuthTokens(payload.token, payload.refreshToken || '')
  if (payload.userInfo)
    userStore.setUserInfo(payload.userInfo)

  // TAMP /app-api 仍使用同域 ticket cookie，补写一份保证链路一致。
  // #ifdef H5
  cookie.set('ticket', payload.token)
  // #endif
}

export function applyAuthUserProfile(profile: {
  id: string
  nickname?: string
  avatar_url?: string
  [key: string]: any
}) {
  const userStore = useEtfUserStore()
  userStore.setUserInfo({
    ...profile,
    avatar: profile.avatar || profile.avatar_url,
  })
}
