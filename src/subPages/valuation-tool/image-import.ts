import type { ApiEnvelope } from './types.js'

interface PortfolioImportImageTempFile {
  name?: unknown
  path?: unknown
}

interface PortfolioImportImageSelectionInput {
  tempFilePaths?: unknown[]
  tempFiles?: PortfolioImportImageTempFile[]
}

export interface PortfolioImportImageSelection {
  filePath: string
  fileName: string
}

export type PortfolioImportImageResponse = Pick<ApiEnvelope<string>, 'code' | 'data' | 'msg' | 'message'>

const DEFAULT_PORTFOLIO_IMPORT_ERROR_MESSAGE = '截图上传失败，请重新上传后再试。'

export function pickPortfolioImportImage(
  input: PortfolioImportImageSelectionInput,
): PortfolioImportImageSelection | null {
  const firstPath = typeof input.tempFilePaths?.[0] === 'string'
    ? input.tempFilePaths[0]
    : typeof input.tempFiles?.[0]?.path === 'string'
      ? input.tempFiles[0].path
      : ''

  if (!firstPath)
    return null

  const rawName = input.tempFiles?.[0]?.name
  const fileName = typeof rawName === 'string' && rawName.trim()
    ? rawName.trim()
    : '持仓截图-1.png'

  return {
    filePath: firstPath,
    fileName,
  }
}

export function parsePortfolioImportImageResponse(payload: unknown): PortfolioImportImageResponse | null {
  if (!payload)
    return null

  const normalizedPayload = typeof payload === 'string'
    ? safeJsonParse(payload)
    : payload

  if (!normalizedPayload || typeof normalizedPayload !== 'object')
    return null

  const response = normalizedPayload as Partial<PortfolioImportImageResponse>
  if (typeof response.code !== 'number')
    return null

  return response as PortfolioImportImageResponse
}

export function isPortfolioImportImageSuccess(response?: Pick<ApiEnvelope<unknown>, 'code'> | null) {
  return response?.code === 0
}

export function getPortfolioImportImageErrorMessage(
  input: unknown,
  fallback = DEFAULT_PORTFOLIO_IMPORT_ERROR_MESSAGE,
) {
  const response = parsePortfolioImportImageResponse(input)
  if (typeof response?.message === 'string' && response.message.trim())
    return response.message.trim()
  if (typeof response?.msg === 'string' && response.msg.trim())
    return response.msg.trim()
  if (input && typeof input === 'object' && 'message' in input && typeof input.message === 'string' && input.message.trim())
    return input.message.trim()
  if (input && typeof input === 'object' && 'msg' in input && typeof input.msg === 'string' && input.msg.trim())
    return input.msg.trim()
  if (input instanceof Error && input.message.trim())
    return input.message.trim()
  if (typeof input === 'string' && input.trim())
    return input.trim()
  if (input && typeof input === 'object' && 'errMsg' in input && typeof input.errMsg === 'string' && input.errMsg.trim())
    return input.errMsg.trim()
  return fallback
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  }
  catch {
    return null
  }
}
