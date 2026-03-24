## ADDED Requirements

### Requirement: External Entry Gateway SHALL Be Owned By Auth Module
系统 SHALL 在 `auth` 子包中提供统一的外部访问认证中转入口，并由该入口承接来源识别、登录态初始化和目标页跳转。

#### Scenario: External mini program targets subPages route
- **WHEN** 外部小程序希望跳转到当前应用内 `subPages/**` 任意页面
- **THEN** 系统 SHALL 将请求导向 `auth` 子包中的中转入口
- **AND** 中转入口 SHALL 使用 `referer` 或等价参数保留目标页信息
- **AND** 中转入口 SHALL 在鉴权成功后继续跳转到目标页

#### Scenario: Internal code path builds a gateway route
- **WHEN** 路由守卫或统一入口构造逻辑为外部访问生成中转链接
- **THEN** 系统 SHALL 默认生成 `auth` 子包中的网关路径
- **AND** 新增调用点 SHALL 不再直接依赖 `/subPages/tamp/index`

### Requirement: Auth Gateway SHALL Preserve Existing Redirect Semantics
系统 SHALL 在网关迁移到 `auth` 后继续保持现有小程序来源识别、`transferH5Ticket` 换 token、失败分流和 referer 直跳行为语义不变。

#### Scenario: Miniapp external request contains required gateway params
- **WHEN** 用户通过小程序外部来源进入 `auth` 网关且 query 中包含 `transferH5Ticket` 与 `referer`
- **THEN** 系统 SHALL 自动发起一次 `transferH5Ticket` 换 token 请求
- **AND** 请求成功后 SHALL 写入统一登录态
- **AND** 系统 SHALL 在换票完成后直接跳转到 `referer` 指向的目标地址

#### Scenario: Miniapp external request misses required gateway params
- **WHEN** 小程序外部来源进入 `auth` 网关但缺少 `transferH5Ticket` 或 `referer`
- **THEN** 系统 SHALL 进入明确失败分流
- **AND** 系统 SHALL 不继续执行业务目标页跳转

#### Scenario: Referer is a full website URL
- **WHEN** 网关接收到的 `referer` 是完整的 `https://` 或 `http://` 网站地址
- **THEN** 系统 SHALL 将其视为最终目标地址
- **AND** 系统 SHALL 不再要求它属于当前项目页面或工具页
