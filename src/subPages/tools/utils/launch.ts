export interface EmbeddedLaunchParams {
  targetUrl: string
  ticket: string
  timestamp: string
  nonce: string
  sign: string
  traceId: string
  bizId?: string
}

export type LaunchValidationErrorCode = 'missing_target_url' | 'invalid_target_url' | 'missing_ticket' | 'missing_timestamp' | 'missing_nonce' | 'missing_sign' | 'missing_trace_id'

export interface LaunchValidationResult {
  valid: boolean
  params?: EmbeddedLaunchParams
  errorCode?: LaunchValidationErrorCode
}

const ENTRY_PATH = '/subPages/tools/entry'
const TOOLS_PREFIX = '/subPages/tools/'

function pickQueryValue(value: unknown) {
  if (Array.isArray(value))
    return value[0]

  return typeof value === 'string' ? value : ''
}

function decodeQueryValue(value: string) {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

export function normalizeTargetUrl(rawTargetUrl: string) {
  const decodedTargetUrl = decodeQueryValue(rawTargetUrl).trim()
  if (!decodedTargetUrl)
    return ''

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(decodedTargetUrl) || decodedTargetUrl.startsWith('//'))
    return ''

  const withLeadingSlash = decodedTargetUrl.startsWith('/')
    ? decodedTargetUrl
    : `/${decodedTargetUrl}`

  try {
    const normalizedUrl = new URL(withLeadingSlash, 'https://tools.local')
    const normalizedPath = normalizedUrl.pathname

    if (!normalizedPath.startsWith(TOOLS_PREFIX) || normalizedPath === ENTRY_PATH)
      return ''

    return `${normalizedPath}${normalizedUrl.search}${normalizedUrl.hash}`
  }
  catch {
    return ''
  }
}

export function validateEmbeddedLaunchParams(query: Record<string, unknown>): LaunchValidationResult {
  const targetUrl = normalizeTargetUrl(pickQueryValue(query.targetUrl))
  if (!targetUrl)
    return { valid: false, errorCode: pickQueryValue(query.targetUrl) ? 'invalid_target_url' : 'missing_target_url' }

  const ticket = pickQueryValue(query.ticket)
  if (!ticket)
    return { valid: false, errorCode: 'missing_ticket' }

  const timestamp = pickQueryValue(query.timestamp)
  if (!timestamp)
    return { valid: false, errorCode: 'missing_timestamp' }

  const nonce = pickQueryValue(query.nonce)
  if (!nonce)
    return { valid: false, errorCode: 'missing_nonce' }

  const sign = pickQueryValue(query.sign)
  if (!sign)
    return { valid: false, errorCode: 'missing_sign' }

  const traceId = pickQueryValue(query.traceId)
  if (!traceId)
    return { valid: false, errorCode: 'missing_trace_id' }

  return {
    valid: true,
    params: {
      targetUrl,
      ticket,
      timestamp,
      nonce,
      sign,
      traceId,
      bizId: pickQueryValue(query.bizId) || undefined,
    },
  }
}

export function isToolsPagePath(path: string) {
  return path.startsWith('subPages/tools/') || path.startsWith('/subPages/tools/')
}
