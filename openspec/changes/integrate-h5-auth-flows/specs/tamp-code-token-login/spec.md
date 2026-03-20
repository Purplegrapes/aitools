## ADDED Requirements

### Requirement: TAMP Redirect Page SHALL Exchange Code For Token Automatically
系统 SHALL 在外部来源进入 TAMP 中转页时优先使用 URL 中的 `code` 调用认证接口换取 `token`，并在成功后写入统一登录态。

#### Scenario: External request contains code
- **WHEN** 用户通过外部链接进入 TAMP 页且 query 中包含 `code`
- **THEN** 系统 SHALL 自动发起一次 `code` 换 token 请求
- **AND** 请求成功后 SHALL 更新本地 token 与登录状态
- **AND** 系统 SHALL 继续执行 referer 跳转而不是停留在中转页

#### Scenario: Both code and token are provided
- **WHEN** 外部链接同时携带 `code` 与 `token`
- **THEN** 系统 SHALL 以 `code` 换 token 结果为准
- **AND** 仅当 `code` 流程失败且可判定不可恢复时，才允许回退到兼容策略

### Requirement: TAMP Redirect Page SHALL Handle Authentication Failure Deterministically
系统 SHALL 在 `code` 换 token 失败时根据来源类型执行确定性的失败分流，避免用户陷入空白或死循环。

#### Scenario: H5 source with loginUrl fails authentication
- **WHEN** 来源为 H5 且 `code` 换 token 请求失败并提供 `loginUrl`
- **THEN** 系统 SHALL 跳转到 `loginUrl`
- **AND** 系统 SHALL 记录失败原因用于排障

#### Scenario: Mini program source fails authentication
- **WHEN** 来源为小程序且认证失败
- **THEN** 系统 SHALL 调用既有外部回跳逻辑返回来源端
- **AND** 系统 SHALL 不继续执行业务 referer 跳转

#### Scenario: Internal or fallback source fails authentication
- **WHEN** 来源为内部访问或无有效外部回跳参数且认证失败
- **THEN** 系统 SHALL 跳转到本地 H5 登录页
- **AND** 登录页 SHALL 保留原始 referer 以便登录后回跳

### Requirement: TAMP Redirect Page SHALL Avoid Duplicate Auth Requests
系统 SHALL 在同一次页面进入生命周期内避免重复提交认证请求。

#### Scenario: Page lifecycle triggers multiple mount/update events
- **WHEN** 中转页在短时间内触发多次执行入口逻辑
- **THEN** 系统 SHALL 仅保留一次有效认证请求
- **AND** 其余重复触发 SHALL 被忽略或复用同一 in-flight 请求结果
