export const AUTH_GATEWAY_PATH = '/subPages/auth/gateway'
export const LEGACY_TAMP_GATEWAY_PATH = '/subPages/tamp/index'

const GATEWAY_PASSTHROUGH_KEYS = [
  'from',
  'referrer',
  'transferH5Ticket',
  'loginUrl',
  'shopId',
  'targetUrl',
  'ticket',
] as const

const GATEWAY_TRANSIENT_TARGET_KEYS = [
  'from',
  'referrer',
  'transferH5Ticket',
  'loginUrl',
  'shopId',
  'ticket',
  'appId',
] as const

function pickQueryValue(value: unknown) {
  if (Array.isArray(value))
    return value[0]
  return typeof value === 'string' ? value : ''
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

function buildTargetFullPath(path: string, query: Record<string, unknown>) {
  return `${path}${stringifyQuery(query)}`
}

function stripGatewayTransientTargetQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([key]) => !GATEWAY_TRANSIENT_TARGET_KEYS.includes(key as typeof GATEWAY_TRANSIENT_TARGET_KEYS[number])),
  )
}

export function decodeQueryValue(input: unknown) {
  if (Array.isArray(input))
    input = input[0]
  if (typeof input !== 'string')
    return ''

  try {
    return decodeURIComponent(input).trim()
  }
  catch {
    return input.trim()
  }
}

export function normalizeGatewayReferer(input: unknown) {
  const decoded = decodeQueryValue(input)
  if (!decoded)
    return ''

  return decoded
}

export function hasRequiredGatewayParams(query: Record<string, unknown>) {
  return !!(decodeQueryValue(query.referrer) && decodeQueryValue(query.transferH5Ticket))
}

export function shouldExchangeTransferTicket(
  source: 'miniprogram' | 'h5' | 'internal',
) {
  return source === 'miniprogram'
}

export function shouldWrapMiniProgramExternalAccess(path: string, query: Record<string, unknown>) {
  if (!path.startsWith('/subPages/'))
    return false
  if (path === AUTH_GATEWAY_PATH || path.startsWith(`${AUTH_GATEWAY_PATH}/`))
    return false
  if (path.startsWith('/subPages/tamp/'))
    return false

  return decodeQueryValue(query.from) === 'miniapp'
}

export function buildGatewayPassthroughQuery(query: Record<string, unknown>) {
  const nextQuery: Record<string, string> = {}

  GATEWAY_PASSTHROUGH_KEYS.forEach((key) => {
    const value = query[key]
    if (typeof value === 'string' && value.trim())
      nextQuery[key] = value
  })

  return nextQuery
}

export function buildLegacyGatewayRedirectRoute(query: Record<string, unknown>) {
  return {
    navType: 'replace',
    path: AUTH_GATEWAY_PATH,
    query: buildGatewayPassthroughQuery(query),
  }
}

export function buildAuthGatewayRouteFromTarget(path: string, query: Record<string, unknown>) {
  const targetQuery = stripGatewayTransientTargetQuery(query)
  const referrer = buildTargetFullPath(path, targetQuery)
  const nextQuery: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(query).filter(([, value]) => typeof value === 'string'),
    ),
    from: 'miniapp',
    referrer: encodeURIComponent(referrer),
  }

  const targetUrl = path.startsWith('/subPages/tools/')
    ? referrer
    : pickQueryValue(query.targetUrl)
  if (targetUrl)
    nextQuery.targetUrl = targetUrl

  return {
    navType: 'replace',
    path: AUTH_GATEWAY_PATH,
    query: nextQuery,
  }
}
