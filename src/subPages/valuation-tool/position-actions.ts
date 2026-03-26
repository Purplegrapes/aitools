import type { ApiEnvelope } from './types.js'

const DEFAULT_PORTFOLIO_DELETE_ERROR_MESSAGE = '删除持仓失败，请稍后再试。'

export function isPortfolioDeleteSuccess(response?: Pick<ApiEnvelope<unknown>, 'code'> | null) {
  return response?.code === 0
}

export function buildPortfolioDeleteConfirmMessage(name: string) {
  return `确认删除“${name}”这条持仓吗？删除后需要重新同步或手动录入才能恢复。`
}

export function getPortfolioDeleteErrorMessage(
  input: unknown,
  fallback = DEFAULT_PORTFOLIO_DELETE_ERROR_MESSAGE,
) {
  if (input && typeof input === 'object' && 'message' in input && typeof input.message === 'string' && input.message.trim())
    return input.message.trim()
  if (input && typeof input === 'object' && 'msg' in input && typeof input.msg === 'string' && input.msg.trim())
    return input.msg.trim()
  if (input instanceof Error && input.message.trim())
    return input.message.trim()
  if (typeof input === 'string' && input.trim())
    return input.trim()
  return fallback
}
