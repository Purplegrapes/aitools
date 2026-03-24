## 1. Auth 网关落位

- [x] 1.1 在 `src/subPages/auth/` 下新增正式的外部认证中转页，并迁移现有 `src/subPages/tamp/index.vue` 的核心入口逻辑。
- [x] 1.2 将来源识别、referer 校验、失败分流、目标页转发等中转工具迁移到 `auth` 侧公共模块，消除新网关对 `tamp/utils` 的反向依赖。
- [x] 1.3 梳理新网关对认证 API 的依赖，优先复用现有 Method，必要时补一个 `auth` 侧再导出层以避免页面直接依赖业务目录。

## 2. 路由与兼容迁移

- [x] 2.1 更新 `src/router/index.ts` 和统一入口构造逻辑，使外部访问默认跳转到新的 `auth` 网关路径。
- [x] 2.2 将 `src/subPages/tamp/index.vue` 改造成兼容别名页，只做查询参数透传和 `router.replace` 到新网关。
- [x] 2.3 复查 `auth/login`、需要登录的业务页面对旧 `/subPages/tamp/index` 路径的显式依赖，并替换为新路径或统一构造函数。

## 3. 行为回归与文档收口

- [x] 3.1 验证小程序外部进入、H5 外部进入、内部未登录跳转、tools 目标二跳四条主链路在新网关下行为不变。
- [x] 3.2 验证旧 `/subPages/tamp/index` 链接仍可成功转发，且不会重复发起认证请求或重复写入登录态。
- [x] 3.3 更新相关接入说明或代码注释，明确后续标准入口为 `auth` 网关，旧 `tamp` 入口仅作迁移期兼容用途。
