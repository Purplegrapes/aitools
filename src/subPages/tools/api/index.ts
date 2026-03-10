import { alovaInstance } from '@/api/core/instance'

export interface ExchangeEmbedTicketParams {
  targetUrl: string
  ticket: string
  timestamp: string
  nonce: string
  sign: string
  traceId: string
  bizId?: string
}

export interface RefreshEmbedTicketParams {
  targetUrl: string
  traceId: string
  ticket: string
  timestamp: string
  nonce: string
  sign: string
}

export interface QueryBridgeTaskResultParams {
  traceId: string
}

export function exchangeEmbedTicket(params: ExchangeEmbedTicketParams) {
  return alovaInstance.Post('/tools-api/embed/session/exchange', params)
}

export function refreshEmbedTicket(params: RefreshEmbedTicketParams) {
  return alovaInstance.Post('/tools-api/embed/session/refresh', params)
}

export function queryBridgeTaskResult(params: QueryBridgeTaskResultParams) {
  return alovaInstance.Get('/tools-api/embed/bridge/result', {
    params,
  })
}
