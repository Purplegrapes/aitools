## ADDED Requirements

### Requirement: Legacy Tamp Gateway SHALL Forward To Auth Gateway During Migration
系统 SHALL 在迁移期内保留旧的 `/subPages/tamp/index` 入口，并将其作为兼容别名转发到新的 `auth` 网关。

#### Scenario: Legacy tamp gateway URL is opened
- **WHEN** 用户或外部接入方访问 `/subPages/tamp/index`
- **THEN** 系统 SHALL 将请求重定向到新的 `auth` 网关路径
- **AND** `transferH5Ticket` 与 `referrer` SHALL 被原样保留
- **AND** `from`、`loginUrl`、`shopId` 及其他可选参数 SHALL 在存在时被原样保留
- **AND** 系统 SHALL 不要求传递 `appId`

#### Scenario: Legacy gateway keeps a full referrer url unchanged
- **WHEN** 旧入口收到的 `referrer` 是完整网站 URL
- **THEN** 兼容转发 SHALL 原样保留该 `referrer`
- **AND** 最终仍 SHALL 由新的 `auth` 网关直接跳转到该目标地址

### Requirement: Compatibility Alias SHALL Not Duplicate Auth Side Effects
系统 SHALL 确保兼容别名页只承担转发职责，不重复执行认证、副作用写入或失败分流。

#### Scenario: Legacy alias forwards request
- **WHEN** 旧入口开始向新网关转发
- **THEN** 旧入口 SHALL 不自行发起 `transferH5Ticket` 换 token 请求
- **AND** 旧入口 SHALL 不修改本地登录态或来源状态
- **AND** 所有认证与回跳逻辑 SHALL 仅在新网关中执行
