## Why

当前项目已经有 `auth` 网关与兼容别名规范，但 H5 场景下仍缺少独立、可用的手机号+短信验证码登录页。用户在 token 失效或首次访问需要登录态的页面时，没有稳定的本地 H5 登录入口，导致登录恢复成本高，也让现有鉴权链路在 H5 场景下不完整。

## What Changes

- 新增 H5 登录页，支持手机号 + 短信验证码登录并写入统一用户登录态。
- 统一 H5 手动登录与现有认证链路的登录态写入契约，确保登录后页面鉴权行为一致。
- 补充验证码发送、登录失败提示、回跳逻辑与联调说明，覆盖 H5 登录关键路径。

## Capabilities

### New Capabilities
- `h5-phone-sms-login`: 提供 H5 手机号短信验证码登录页，完成验证码发送、登录校验与登录态写入。

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `src/subPages/auth/**`（H5 登录页、认证 API 与登录态写入逻辑）
  - 需要登录态的 H5 页面守卫与回跳链路
  - `src/store/user*`（或现有用户认证状态管理）
- Affected APIs:
  - 服务端手机号验证码登录接口
  - 服务端验证码发送接口
- Dependencies/constraints:
  - 继续遵循 Alova `Method` 边界与 `useRequest` 调用规范
  - 需与现有 `auth` 网关共用统一登录态契约，避免 H5 登录与自动登录行为分叉

## Integration Notes

- 接口字段假设：
  - 发送验证码接口使用 `{ phone }`
  - 验证码校验接口使用 `{ phone, code }`
  - 验证码校验成功后返回授权码，再通过 `/auth-api/oauth/token` 交换正式 token
- 联调注意事项：
  - 若验证码校验接口直接返回 token，则需要在实现中调整授权码交换步骤
  - 若 `user/me` 不返回，登录成功仍应以 token 写入成功为准，但需要记录缺失基础资料的联调问题
  - `referer` 继续只允许内部路径，联调时不要传完整外部 URL
