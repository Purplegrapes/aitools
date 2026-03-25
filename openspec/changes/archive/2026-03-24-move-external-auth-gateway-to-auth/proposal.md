## Why

当前外部小程序/H5 进入应用后的“认证中转页”放在 `src/subPages/tamp/index.vue`，但它承担的职责已经是统一鉴权入口、登录态初始化和安全跳转控制，而不是 TAMP 业务页面本身。登录页、登录态工具和路由守卫已经集中在 `auth` 子包，继续把中转页留在 `tamp` 会让目录语义混乱、复用边界不清，也提高后续维护成本。

## What Changes

- 将小程序外部来源进入应用的认证中转页从 `tamp` 子包迁移到 `auth` 子包，由 `auth` 统一承接来源识别、`transferH5Ticket` 换 token、完成换票后的 referrer 直跳和失败分流。
- 抽离与中转页强绑定的工具函数和类型，使外部入口构造、来源检测、回跳处理不再依赖 `tamp` 业务目录。
- 更新路由守卫与登录跳转链路，统一改为指向新的 `auth` 中转入口。
- 保留旧的 `/subPages/tamp/index` 兼容入口，用于过渡期转发到新的 `auth` 中转页，避免外部接入立即失效。
- 清理 `tamp` 子包中与营销/演示页面无关的认证入口职责，收敛 TAMP 目录为业务页面与业务 API。

## Capabilities

### New Capabilities
- `auth-external-entry-gateway`: `auth` 子包提供统一的外部访问中转入口，负责来源识别、安全校验和目标页跳转。
- `auth-gateway-compatibility-alias`: 旧的 `tamp` 中转入口在迁移期内提供兼容转发能力，保证历史外链与外部接入配置不会立即中断。

### Modified Capabilities

## Impact

- Affected code:
  - `src/subPages/auth/**`
  - `src/subPages/tamp/index.vue`
  - `src/subPages/tamp/utils/**`
  - `src/router/index.ts`
  - `src/store/tampStore.ts`
- Affected APIs:
- 继续复用现有小程序 `transferH5Ticket` 换 token、`getCurrentAuthUser` 等认证接口，不新增后端接口
- Dependencies/constraints:
  - 小程序中转页入参中仅 `transferH5Ticket` 与 `referrer` 为必传字段，其余字段均为可选
  - `appId` 不再作为网关透传参数参与迁移范围
  - `referrer` 可以是完整网站 URL，换票完成后应直接跳转到该地址
  - 需要控制迁移风险，避免外部小程序已配置的旧入口链接失效
