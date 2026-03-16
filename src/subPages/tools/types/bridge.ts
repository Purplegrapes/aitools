export type MiniEmbedBridgeCommand = 'getEnv' | 'requestAuthRefresh' | 'requestSubscribeMessage' | 'openNativePage' | 'closeWebview'
export type MiniEmbedBridgeMessageType = 'REQUEST_AUTH_REFRESH' | 'REQUEST_SUBSCRIBE_MESSAGE' | 'OPEN_NATIVE_PAGE' | 'CLOSE_WEBVIEW'

export type MiniEmbedBridgeStatus = 'success' | 'error' | 'unsupported' | 'timeout'

export interface MiniEmbedBridgeRequest<T = unknown> {
  command: MiniEmbedBridgeCommand
  traceId?: string
  payload?: T
}

export interface MiniEmbedBridgeResponse<T = unknown> {
  status: MiniEmbedBridgeStatus
  message?: string
  traceId?: string
  payload?: T
}

export interface MiniEmbedHostBridge {
  invoke: <T = unknown>(request: MiniEmbedBridgeRequest) =>
    Promise<MiniEmbedBridgeResponse<T>> | MiniEmbedBridgeResponse<T>
}

export interface MiniProgramEnvPayload {
  miniprogram: boolean
  provider: 'host-bridge' | 'wx-mini-program' | 'browser'
}

export interface AuthRefreshPayload {
  ticket: string
  timestamp: string
  nonce: string
  sign: string
}

export interface SubscribeMessagePayload {
  scene: string
  bizId: string
}

export interface NativePagePayload {
  path: string
  appId?: string
  envVersion?: 'develop' | 'trial' | 'release'
}

declare global {
  interface Window {
    __MINI_TOOL_BRIDGE__?: MiniEmbedHostBridge
  }
}

export {}
