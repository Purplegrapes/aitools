## Why

当前服务端已提供两类认证能力（H5 手机号+短信验证码登录、通过 `code` 换取 `token`），但客户端尚未在现有工具中打通完整登录链路。并且外部小程序跳转到 `subPages` 的入口缺少统一网关约束，导致登录前置与来源追踪不稳定。尽快集成可消除外部跳入后的手动登录成本，统一登录入口并提升转化与访问连续性。

## What Changes

- 在 TAMP 中转页接入“`code` 换 `token`”自动登录流程，进入中转页后自动同步登录态。
- 将 TAMP 中转页定义为外部小程序访问 `subPages` 的统一入口，外部跳转需先进入中转页再重定向目标页。
- 对 `subPages/tools/**` 目标路径采用“统一先到 TAMP，再二跳 `subPages/tools/entry`”的链路，保持 tools-embed 换票能力兼容。
- 新增 H5 登录页，支持手机号 + 短信验证码登录并写入统一用户登录态。
- 增加登录态写入与跳转衔接规则，确保中转登录与手动登录共享同一套 token 持久化和鉴权状态。
- 补充接口调用、异常提示与回退路径（`code` 失效、验证码错误、登录失败等）。

## Capabilities

### New Capabilities
- `tamp-external-entry-gateway`: 将 TAMP 中转页作为外部小程序进入 `subPages` 的强制前置入口，并负责目标页重定向。
- `tamp-code-token-login`: 在中转页自动完成 `code` 换 `token` 并同步本地登录态，随后按来源规则继续跳转。
- `h5-phone-sms-login`: 提供 H5 手机号短信验证码登录页，完成验证码发送、登录校验与登录态写入。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `src/subPages/tamp/**`（中转页流程与 API 调用）
  - `src/subPages/**` 外部小程序入口触达点（统一改为先到中转页）
  - `src/pages/**` 或 `src/subPages/**` 中新增 H5 登录页与路由配置
  - `src/store/user*`（或现有用户认证状态管理）
  - `src/api/**` 与 `src/subPages/tamp/api/**`（Method 定义与调用）
- Affected APIs:
  - 服务端手机号验证码登录接口
  - 服务端 `code` 换 `token` 接口
- Dependencies/constraints:
  - 继续遵循 Alova `Method` 边界与 `useRequest` 调用规范
  - 需兼容 H5 与现有小程序来源中转逻辑
  - 需与 `docs/tools-embed-integration.md` 中 tools-embed 换票协议保持一致
