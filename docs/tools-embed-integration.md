# 外部小程序嵌入 H5 工具页接入说明

## 1. 打开方式
- 外部小程序统一只打开中转入口页：`/subPages/tamp/index`
- 不允许外部直接打开具体工具页
- 当目标为 `subPages/tools/**` 时，中转页会二跳到 `subPages/tools/entry` 建立 embed 会话，再进入具体工具页

示例：

```text
https://your-h5-domain.com/#/subPages/tamp/index?referer=%2FsubPages%2Ftools%2Fdemo&targetUrl=%2FsubPages%2Ftools%2Fdemo&ticket=xxx&timestamp=1741586400&nonce=abc123&sign=sign-value&traceId=trace-demo-001&from=miniapp
```

## 2. 启动参数
- `referer`: 目标 H5 内部路径（统一中转参数，建议与 `targetUrl` 一致）
- `targetUrl`: 目标 H5 内部路径，必须以 `/subPages/tools/` 开头
- `ticket`: 一次性换票凭证
- `timestamp`: 时间戳
- `nonce`: 随机串
- `sign`: 对参数签名
- `traceId`: 链路追踪 ID
- `bizId`: 可选业务 ID

限制：
- 外部入口必须指向 `/subPages/tamp/index`
- `targetUrl` 只能是当前 H5 站点的受控内部路径
- 禁止传完整 URL、协议头、外部域名
- 禁止传 `/subPages/tools/entry`

## 3. H5 启动流程
1. 外部小程序拼接统一中转页 URL（`/subPages/tamp/index`）。
2. TAMP 校验来源和目标路径，识别是否为 tools 目标。
3. 若目标为 `subPages/tools/**`，TAMP 透传 embed 参数并跳转到 `/subPages/tools/entry`。
4. tools entry 校验 `targetUrl` 与换票参数、检测小程序 `web-view` 环境。
5. tools entry 调用后端换票接口建立本域会话，清理敏感参数后跳转 `targetUrl`。
6. 若目标不是 tools 页面，TAMP 按统一登录与重定向规则直接落目标页。

## 4. Bridge 协议
Bridge 在这里是“宿主协作协议”，不要求外部小程序一定额外封装一个独立 SDK。协议可以通过两种方式承载：

- 方式 A：外部小程序注入 `window.__MINI_TOOL_BRIDGE__`
- 方式 B：H5 直接使用 `wx.miniProgram` + `postMessage`，由小程序监听消息并执行原生能力

建议优先级：

- 基础能力：优先直接使用 `wx.miniProgram`
- 高阶能力：走 `postMessage` 或宿主注入 bridge，再由小程序执行原生能力

### 4.0 能力边界
H5 可直接调用：

- `wx.miniProgram.getEnv`
- `wx.miniProgram.navigateTo`
- `wx.miniProgram.redirectTo`
- `wx.miniProgram.navigateBack`
- `wx.miniProgram.switchTab`
- `wx.miniProgram.reLaunch`
- `wx.miniProgram.postMessage`

必须由小程序宿主执行：

- `wx.requestSubscribeMessage`
- 小程序登录态读取与用户身份确认
- H5 免登票据刷新
- 需要小程序原生上下文的分享或授权
- 宿主级原生页面打开并回传结果

结论：

- H5 可以主动发起“请求”
- 但不能直接执行小程序专属原生能力
- 订阅消息、票据刷新这类能力必须由小程序接住请求后自行触发

推荐宿主注入：

```ts
window.__MINI_TOOL_BRIDGE__ = {
  invoke(request) {
    return Promise.resolve({
      status: 'success',
      traceId: request.traceId,
      payload: {},
    })
  },
}
```

当前 H5 约定的方法：
- `getEnv`
- `requestAuthRefresh`
- `requestSubscribeMessage`
- `openNativePage`
- `closeWebview`

### 4.1 推荐的消息结构
无论走自定义 bridge 还是 `postMessage`，都建议统一消息结构：

```json
{
  "type": "REQUEST_SUBSCRIBE_MESSAGE",
  "traceId": "trace-demo-001",
  "payload": {
    "scene": "TOOLS_DEMO",
    "bizId": "trace-demo-001"
  }
}
```

字段说明：

- `type`: 消息类型
- `traceId`: 链路追踪 ID，H5、小程序、后端统一使用
- `payload`: 消息体

推荐消息类型：

- `REQUEST_AUTH_REFRESH`
- `REQUEST_SUBSCRIBE_MESSAGE`
- `OPEN_NATIVE_PAGE`
- `CLOSE_WEBVIEW`
- `HOST_RESULT_CALLBACK`

### 4.2 requestAuthRefresh
用于 H5 会话失效后的恢复，宿主返回：

```json
{
  "status": "success",
  "traceId": "trace-demo-001",
  "payload": {
    "ticket": "new-ticket",
    "timestamp": "1741586401",
    "nonce": "new-nonce",
    "sign": "new-sign"
  }
}
```

如果走 `postMessage`，则建议 H5 发：

```json
{
  "type": "REQUEST_AUTH_REFRESH",
  "traceId": "trace-demo-001",
  "payload": {
    "targetUrl": "/subPages/tools/demo"
  }
}
```

小程序执行后，不要求同步把结果立刻返回 H5。更稳妥的方式是：

1. 小程序刷新票据
2. 小程序调用本项目后端保存刷新结果
3. H5 再通过接口查询结果，或由宿主重新打开入口页

### 4.3 requestSubscribeMessage
H5 发起请求：

```json
{
  "type": "REQUEST_SUBSCRIBE_MESSAGE",
  "traceId": "trace-demo-001",
  "payload": {
    "scene": "TOOLS_DEMO",
    "bizId": "trace-demo-001"
  }
}
```

宿主收到后执行小程序原生订阅消息授权，并将最终结果回传给本项目后端。

宿主回传后端建议字段：

```json
{
  "traceId": "trace-demo-001",
  "scene": "TOOLS_DEMO",
  "bizId": "trace-demo-001",
  "status": "authorized",
  "rawResult": {
    "templateId": "tmpl_xxx"
  }
}
```

`status` 建议枚举：

- `authorized`
- `denied`
- `failed`
- `pending`

### 4.4 openNativePage
H5 请求宿主打开小程序原生页面：

```json
{
  "type": "OPEN_NATIVE_PAGE",
  "traceId": "trace-demo-001",
  "payload": {
    "path": "/pages/example/index?id=1"
  }
}
```

### 4.5 closeWebview
H5 请求宿主关闭当前 web-view：

```json
{
  "type": "CLOSE_WEBVIEW",
  "traceId": "trace-demo-001",
  "payload": {}
}
```

### 4.6 postMessage 模式说明
如果外部小程序不实现 `window.__MINI_TOOL_BRIDGE__`，可以只实现 `web-view` 消息监听。

建议模式：

1. H5 使用 `wx.miniProgram.postMessage({ data })`
2. 小程序在 `web-view` 宿主页监听消息
3. 小程序执行原生能力
4. 小程序把异步结果写回本项目后端
5. H5 使用 `traceId` 调用 `GET /tools-api/embed/bridge/result`

不建议把 `postMessage` 当成强同步 RPC 通道。

当前项目的 bridge SDK 已按这个模式实现：

- `getEnv`、页面跳转、返回优先直接使用 `wx.miniProgram`
- `requestAuthRefresh`、`requestSubscribeMessage` 在没有宿主注入 bridge 时，会自动退化为 `postMessage + traceId 查询结果`

## 5. 后端接口
本项目后端需提供：
- `POST /tools-api/embed/session/exchange`
- `POST /tools-api/embed/session/refresh`
- `GET /tools-api/embed/bridge/result`
- `POST /tools-api/embed/bridge/callback`（推荐）

职责：
- 校验 `ticket/timestamp/nonce/sign`
- 建立 H5 会话
- 接收并保存宿主回传的授权结果
- 提供 traceId 结果查询

`GET /tools-api/embed/bridge/result` 建议返回：

```json
{
  "code": 0,
  "data": {
    "traceId": "trace-demo-001",
    "status": "authorized",
    "scene": "TOOLS_DEMO",
    "bizId": "trace-demo-001"
  }
}
```

## 6. 错误码建议
- `missing_target_url`
- `invalid_target_url`
- `missing_ticket`
- `missing_timestamp`
- `missing_nonce`
- `missing_sign`
- `missing_trace_id`
- `not_in_miniprogram`
- `refresh_unavailable`
- `refresh_failed`
- `bridge_unsupported`
- `bridge_timeout`
- `subscribe_denied`
- `host_callback_missing`

## 7. 联调检查项
- 外部入口是否总是打开 `/subPages/tamp/index`
- tools 目标是否总是经过 `TAMP -> tools/entry` 二跳链路
- `targetUrl` 是否经过 encodeURIComponent
- 宿主是否提供 `requestAuthRefresh`
- 宿主是否实现订阅消息授权后回调本项目后端
- H5 401 后是否能触发刷新票据流程
- H5 是否只把高阶能力当“请求”，而不是直接调用小程序专属原生 API
- 小程序是否为每个异步请求带上同一个 `traceId`

## 8. 小程序宿主页伪代码
以下示例改为与当前项目一致的风格：`uni-app + Vue 3 + <script setup lang="ts"> + Composition API`。外部小程序团队如果也是同类技术栈，可以直接按这个结构落地。

### 8.1 页面结构

```vue
<script setup lang="ts">
definePage({
  name: 'tools-host',
  layout: 'default',
  style: {
    navigationBarTitleText: '工具页容器',
  },
})

const webviewUrl = shallowRef('')
const route = useRoute()

onLoad(async (options) => {
  const targetUrl = decodeURIComponent((options?.targetUrl as string) || '/subPages/tools/demo')
  const traceId = (options?.traceId as string) || `trace_${Date.now()}`

  const ticketPayload = await createEmbedTicket({
    targetUrl,
    traceId,
  })

  const query = new URLSearchParams({
    targetUrl,
    ticket: ticketPayload.ticket,
    timestamp: ticketPayload.timestamp,
    nonce: ticketPayload.nonce,
    sign: ticketPayload.sign,
    traceId,
  })

  webviewUrl.value = `https://your-h5-domain.com/#/subPages/tools/entry?${query.toString()}`
})

async function createEmbedTicket(payload: {
  targetUrl: string
  traceId: string
}) {
  // 可替换为 useRequest(createEmbedTicketApi(...))
  return {
    ticket: 'ticket_xxx',
    timestamp: `${Date.now()}`,
    nonce: 'nonce_xxx',
    sign: 'sign_xxx',
  }
}
</script>

<template>
  <web-view :src="webviewUrl" @message="handleWebviewMessage" />
</template>
```

### 8.2 监听 H5 消息

```ts
type HostBridgeMessageType =
  | 'REQUEST_AUTH_REFRESH'
  | 'REQUEST_SUBSCRIBE_MESSAGE'
  | 'OPEN_NATIVE_PAGE'
  | 'CLOSE_WEBVIEW'

interface HostBridgeMessage {
  type: HostBridgeMessageType
  traceId: string
  payload?: Record<string, any>
}

async function handleWebviewMessage(event: any) {
  const messages = (event?.detail?.data || []) as HostBridgeMessage[]

  for (const message of messages) {
    const { type, traceId, payload = {} } = message

    if (!type || !traceId)
      continue

    try {
      switch (type) {
        case 'REQUEST_AUTH_REFRESH':
          await handleAuthRefresh({ traceId, payload })
          break
        case 'REQUEST_SUBSCRIBE_MESSAGE':
          await handleSubscribeMessage({ traceId, payload })
          break
        case 'OPEN_NATIVE_PAGE':
          handleOpenNativePage(payload)
          break
        case 'CLOSE_WEBVIEW':
          uni.navigateBack()
          break
      }
    }
    catch (error: any) {
      await reportBridgeResult({
        traceId,
        status: 'failed',
        errorMessage: error?.message || 'host_execute_failed',
      })
    }
  }
}
```

### 8.3 刷新 H5 票据

```ts
async function handleAuthRefresh({
  traceId,
  payload,
}: {
  traceId: string
  payload: Record<string, any>
}) {
  const ticketPayload = await createEmbedTicket({
    targetUrl: payload.targetUrl,
    traceId,
  })

  await reportBridgeResult({
    traceId,
    status: 'authorized',
    payload: ticketPayload,
  })
}
```

说明：

- 这里的 `status` 只是示例，本质是把新 `ticket/timestamp/nonce/sign` 回传给后端
- H5 随后会使用相同 `traceId` 查询结果并继续恢复流程

### 8.4 触发订阅消息授权

```ts
async function handleSubscribeMessage({
  traceId,
  payload,
}: {
  traceId: string
  payload: Record<string, any>
}) {
  const templateIds = resolveTemplateIds(payload.scene)
  const result = await requestSubscribeMessage(templateIds)

  const accepted = templateIds.some(id => result[id] === 'accept')
  const status = accepted ? 'authorized' : 'denied'

  await reportBridgeResult({
    traceId,
    status,
    scene: payload.scene,
    bizId: payload.bizId,
    rawResult: result,
  })
}

function resolveTemplateIds(scene: string) {
  const templateMap: Record<string, string[]> = {
    TOOLS_DEMO: ['tmpl_xxx'],
  }

  return templateMap[scene] || []
}

function requestSubscribeMessage(tmplIds: string[]) {
  return new Promise<Record<string, string>>((resolve, reject) => {
    uni.requestSubscribeMessage({
      tmplIds,
      success: resolve,
      fail: reject,
    })
  })
}
```

### 8.5 打开小程序原生页面

```ts
function handleOpenNativePage(payload: Record<string, any>) {
  if (!payload.path)
    return

  uni.navigateTo({
    url: payload.path,
  })
}
```

### 8.6 回调本项目后端

```ts
async function reportBridgeResult(payload: Record<string, any>) {
  return uni.request({
    url: 'https://your-api-domain.com/tools-api/embed/bridge/callback',
    method: 'POST',
    data: payload,
    header: {
      'content-type': 'application/json',
    },
  })
}
```

如果外部小程序项目也使用 Alova，建议把 `createEmbedTicket` 和 `reportBridgeResult` 都抽到独立 API 模块里，不要直接散落在页面中。

建议回调字段：

```json
{
  "traceId": "trace-demo-001",
  "status": "authorized",
  "scene": "TOOLS_DEMO",
  "bizId": "trace-demo-001",
  "payload": {
    "ticket": "ticket_xxx",
    "timestamp": "1741586401",
    "nonce": "nonce_xxx",
    "sign": "sign_xxx"
  },
  "rawResult": {}
}
```

### 8.7 小程序侧实施要点
- `web-view` 的 `@message` 收到的 `event.detail.data` 可能是数组，按数组遍历处理。
- 所有异步宿主动作都要带上同一个 `traceId` 回传。
- 不要假设 H5 在线等待同步返回，统一以后端回调结果为准。
- `REQUEST_AUTH_REFRESH` 和 `REQUEST_SUBSCRIBE_MESSAGE` 都属于异步能力，建议都走“执行后回调后端”的模式。
- 页面本身尽量只做宿主编排，换票接口和回调接口建议独立成 API 模块，保持和当前项目一致的分层方式。
