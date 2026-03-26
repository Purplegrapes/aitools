export const AUTH_VISITOR_META = {
  authRole: 'visitor',
} as const

export const AUTH_REFRESH_META = {
  authRole: 'refreshToken',
} as const

export function isAuthOAuthPath(url: string) {
  return url.includes('/shixi-api/oauth/') || url.includes('/api/oauth/')
}

export function isRefreshRetryableError(error: unknown) {
  const responseError = error as {
    code?: number
    statusCode?: number
  } | null

  return Boolean(
    (typeof responseError?.code === 'number' && (responseError.code === 401 || responseError.code === 403))
    || (typeof responseError?.statusCode === 'number' && (responseError.statusCode === 401 || responseError.statusCode === 403)),
  )
}

export function isRefreshRetryableStatus(statusCode: unknown) {
  return statusCode === 401 || statusCode === 403
}

export function shouldRefreshTokenOnError(error: unknown, url: string) {
  return isRefreshRetryableError(error) && !isAuthOAuthPath(url)
}

export function shouldRefreshTokenOnSuccess(
  response: {
    statusCode?: number
  } | null | undefined,
  url: string,
) {
  return isRefreshRetryableStatus(response?.statusCode) && !isAuthOAuthPath(url)
}

export function applyBearerToken(
  headers: Record<string, unknown>,
  token: string,
) {
  const trimmedToken = token.trim()
  if (!trimmedToken)
    return

  headers.Authorization = trimmedToken.startsWith('Bearer ')
    ? trimmedToken
    : `Bearer ${trimmedToken}`
}

export function shouldShowErrorToast(method?: {
  meta?: {
    suppressErrorToast?: boolean
  }
} | null) {
  return !method?.meta?.suppressErrorToast
}
