## ADDED Requirements

### Requirement: External Mini Program Access To SubPages SHALL Go Through TAMP Gateway
系统 SHALL 将 TAMP 中转页定义为外部小程序访问当前 `subPages` 任意页面的强制前置入口。

#### Scenario: External mini program targets any subPages route
- **WHEN** 外部小程序希望跳转到当前应用内 `subPages/**` 任意页面
- **THEN** 外部跳转 SHALL 先进入 TAMP 中转页
- **AND** 目标页路径 SHALL 通过 `referer` 或等价参数传给中转页
- **AND** 中转页完成鉴权与来源处理后 SHALL 再重定向到目标页

#### Scenario: External mini program directly lands on subPages target without tamp context
- **WHEN** 用户从外部来源直接落到 `subPages/**` 目标页且缺少中转上下文
- **THEN** 系统 SHALL 回跳到 TAMP 中转页并携带当前目标页作为 referer
- **AND** 目标页 SHALL 不绕过中转页直接完成业务流程

### Requirement: Tools Targets SHALL Be Forwarded To Tools Entry By TAMP
系统 SHALL 在目标路径属于 `subPages/tools/**` 时由 TAMP 转发到 `subPages/tools/entry`，并保持 tools-embed 会话参数完整透传。

#### Scenario: External mini program targets tools page
- **WHEN** 外部请求目标路径匹配 `subPages/tools/**`
- **THEN** TAMP SHALL 跳转到 `subPages/tools/entry`
- **AND** 原始目标路径 SHALL 作为 `targetUrl` 传入
- **AND** `ticket`、`timestamp`、`nonce`、`sign`、`traceId` 等换票参数 SHALL 一并透传

#### Scenario: Tools target misses required embed params
- **WHEN** 目标为 `subPages/tools/**` 但缺少 tools-embed 必需参数
- **THEN** 系统 SHALL 进入明确失败态或回退页
- **AND** 系统 SHALL 不直接落到具体 tools 业务页

### Requirement: Gateway Redirect Contract SHALL Preserve Target Route Fidelity
系统 SHALL 保证中转前后目标路由语义一致，不丢失业务参数。

#### Scenario: Target route includes query parameters
- **WHEN** 外部目标页包含查询参数
- **THEN** 中转页重定向后 SHALL 保留原始查询参数语义
- **AND** 系统 SHALL 对 referer 编码与解码进行一致处理，避免参数错乱

#### Scenario: Target route is invalid or unsafe
- **WHEN** referer 为空、非法或不在允许的 `subPages` 路由范围内
- **THEN** 中转页 SHALL 拒绝跳转到非法路径
- **AND** 系统 SHALL 跳转到安全默认页或登录页作为兜底

### Requirement: Gateway Logic SHALL Be Reusable Across Entry Points
系统 SHALL 提供可复用的中转链接构造与校验机制，避免每个外部入口手写拼接逻辑。

#### Scenario: New external access point is added
- **WHEN** 新增一个外部小程序跳转入口指向 `subPages` 页面
- **THEN** 开发者 SHALL 复用统一的中转链接构造方法
- **AND** 该入口 SHALL 自动满足“先中转后落页”的约束
