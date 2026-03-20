export function getStoredUserId() {
  try {
    const storedUser = uni.getStorageSync('etfUser')
    const userInfo = storedUser?.userInfo || {}
    const userId = userInfo.id ?? userInfo.user_id ?? ''
    return userId ? `${userId}` : ''
  }
  catch {
    return ''
  }
}

export function getStoredAuthToken() {
  try {
    const storedUser = uni.getStorageSync('etfUser')
    const token = storedUser?.token
    return typeof token === 'string' ? token.trim() : ''
  }
  catch {
    return ''
  }
}

function stringifyQuery(query: Record<string, unknown>) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '')
      return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null)
          params.append(key, `${item}`)
      })
      return
    }
    params.append(key, `${value}`)
  })
  const search = params.toString()
  return search ? `?${search}` : ''
}

export function buildRefererPath(path: string, query: Record<string, unknown>) {
  return `${path}${stringifyQuery(query)}`
}

export function createAuthLoginRoute(referer: string) {
  return {
    path: '/subPages/auth/login',
    query: {
      referer: encodeURIComponent(referer),
    },
  }
}
