import type {
  AuthRefreshPayload,
  MiniEmbedBridgeMessageType,
  MiniEmbedBridgeRequest,
  MiniEmbedBridgeResponse,
  MiniProgramEnvPayload,
  NativePagePayload,
  SubscribeMessagePayload,
} from '../types/bridge'

const BRIDGE_TIMEOUT = 8000

function getHostBridge() {
  return typeof window === 'undefined' ? undefined : window.__MINI_TOOL_BRIDGE__
}

function getWxMiniProgram() {
  return typeof window === 'undefined' ? undefined : window.wx?.miniProgram
}

function createUnsupportedResponse<T = unknown>(message: string): MiniEmbedBridgeResponse<T> {
  return {
    status: 'unsupported',
    message,
  }
}

function resolveMessageType(command: MiniEmbedBridgeRequest['command']): MiniEmbedBridgeMessageType {
  switch (command) {
    case 'requestAuthRefresh':
      return 'REQUEST_AUTH_REFRESH'
    case 'requestSubscribeMessage':
      return 'REQUEST_SUBSCRIBE_MESSAGE'
    case 'openNativePage':
      return 'OPEN_NATIVE_PAGE'
    case 'closeWebview':
      return 'CLOSE_WEBVIEW'
    default:
      return 'REQUEST_AUTH_REFRESH'
  }
}

function postMessageToMiniProgram<T>(request: MiniEmbedBridgeRequest): MiniEmbedBridgeResponse<T> {
  const miniProgram = getWxMiniProgram()
  if (!miniProgram)
    return createUnsupportedResponse<T>('当前环境不支持发送宿主消息')

  miniProgram.postMessage({
    type: resolveMessageType(request.command),
    traceId: request.traceId,
    payload: request.payload || {},
  })

  return {
    status: 'success',
    traceId: request.traceId,
    message: '消息已发送，等待宿主处理',
  }
}

async function invokeHostBridge<T>(request: MiniEmbedBridgeRequest): Promise<MiniEmbedBridgeResponse<T>> {
  const hostBridge = getHostBridge()
  if (!hostBridge)
    return createUnsupportedResponse<T>('宿主未注入 bridge')

  try {
    const response = await Promise.race([
      Promise.resolve(hostBridge.invoke<T>(request)),
      new Promise<MiniEmbedBridgeResponse<T>>(resolve => setTimeout(() => resolve({
        status: 'timeout',
        message: '宿主 bridge 响应超时',
        traceId: request.traceId,
      }), BRIDGE_TIMEOUT)),
    ])

    return response
  }
  catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '宿主 bridge 调用失败',
      traceId: request.traceId,
    }
  }
}

export function useMiniEmbedBridge() {
  async function getEnv() {
    const hostBridge = getHostBridge()
    if (hostBridge) {
      return invokeHostBridge<MiniProgramEnvPayload>({
        command: 'getEnv',
      })
    }

    const miniProgram = getWxMiniProgram()
    if (!miniProgram) {
      return {
        status: 'success',
        payload: {
          miniprogram: false,
          provider: 'browser',
        },
      } satisfies MiniEmbedBridgeResponse<MiniProgramEnvPayload>
    }

    return new Promise<MiniEmbedBridgeResponse<MiniProgramEnvPayload>>((resolve) => {
      miniProgram.getEnv((res) => {
        resolve({
          status: 'success',
          payload: {
            miniprogram: !!res.miniprogram,
            provider: 'wx-mini-program',
          },
        })
      })
    })
  }

  async function requestAuthRefresh(traceId: string) {
    const hostBridge = getHostBridge()
    if (!hostBridge) {
      return postMessageToMiniProgram<AuthRefreshPayload>({
        command: 'requestAuthRefresh',
        traceId,
      })
    }

    return invokeHostBridge<AuthRefreshPayload>({
      command: 'requestAuthRefresh',
      traceId,
    })
  }

  async function requestSubscribeMessage(payload: SubscribeMessagePayload, traceId: string) {
    const hostBridge = getHostBridge()
    if (!hostBridge) {
      return postMessageToMiniProgram<SubscribeMessagePayload>({
        command: 'requestSubscribeMessage',
        traceId,
        payload,
      })
    }

    return invokeHostBridge<SubscribeMessagePayload>({
      command: 'requestSubscribeMessage',
      traceId,
      payload,
    })
  }

  async function openNativePage(payload: NativePagePayload, traceId?: string) {
    const hostBridge = getHostBridge()
    if (hostBridge) {
      return invokeHostBridge<NativePagePayload>({
        command: 'openNativePage',
        traceId,
        payload,
      })
    }

    const miniProgram = getWxMiniProgram()
    if (!miniProgram)
      return createUnsupportedResponse('当前环境不支持打开小程序页面')

    miniProgram.navigateTo({
      url: payload.path,
      appId: payload.appId,
      envVersion: payload.envVersion,
    })

    return {
      status: 'success',
      traceId,
      payload,
    } satisfies MiniEmbedBridgeResponse<NativePagePayload>
  }

  async function closeWebview(traceId?: string) {
    const hostBridge = getHostBridge()
    if (hostBridge) {
      return invokeHostBridge({
        command: 'closeWebview',
        traceId,
      })
    }

    const miniProgram = getWxMiniProgram()
    if (!miniProgram)
      return createUnsupportedResponse('当前环境不支持关闭 web-view')

    miniProgram.navigateBack({ delta: 1 })
    return {
      status: 'success',
      traceId,
    } satisfies MiniEmbedBridgeResponse
  }

  return {
    getEnv,
    requestAuthRefresh,
    requestSubscribeMessage,
    openNativePage,
    closeWebview,
  }
}
