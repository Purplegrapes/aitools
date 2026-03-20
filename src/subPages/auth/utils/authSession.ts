import type { TokenResponseDto } from '../api'
import cookie from 'js-cookie'
import { useEtfUserStore } from '@/store/etfUserStore'

export interface AuthSessionPayload {
  token: string
  userInfo?: Record<string, any> | null
}

export function extractAuthSessionPayload(response: TokenResponseDto | any): AuthSessionPayload | null {
  const data = response?.data || response?.result || response
  const token = data?.access_token || data?.token || data?.accessToken || data?.jwtToken || ''

  if (!token || typeof token !== 'string')
    return null

  return {
    token,
    userInfo: data?.userInfo || null,
  }
}

export function applyAuthSession(payload: AuthSessionPayload) {
  const userStore = useEtfUserStore()
  userStore.setToken(payload.token)
  if (payload.userInfo)
    userStore.setUserInfo(payload.userInfo)

  // TAMP /app-api 仍使用同域 ticket cookie，补写一份保证链路一致。
  // #ifdef H5
  cookie.set('ticket', payload.token)
  // #endif
}
