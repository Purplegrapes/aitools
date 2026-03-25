# TAMP 独立 H5 单 Token 技术方案（V1）

## 1. 目标
- 将 TAMP 作为**独立 H5 项目**管理，但与主域名项目共存。
- 支持：
  - 小程序 WebView 跳转
  - H5 跳转
- 支持 **Token 传递与登录态落地**。
- 401/403 时**根据来源跳回对应登录页**。

---

## 2. 当前实现概览（基于 tamp 目录）
- **正式入口中转页**：`src/subPages/auth/gateway.vue`
  - 解析 query
  - 通过 `detectAccessMode` 判断来源
  - 使用 `transferH5Ticket` 完成换 token
  - 成功后跳转到 `referrer`
- **兼容别名页**：`src/subPages/tamp/index.vue`
  - 仅透传 query
  - `router.replace` 到 `auth` 网关
- **来源检测**：`src/subPages/auth/utils/sourceDetector.ts`
- **外部回跳工具**：`src/subPages/auth/utils/externalRedirect.ts`
- **401/403 处理**：`src/api/core/handlers.ts` 当前仅 logout + toast（未对接外部回跳）

---

## 3. 推荐前端方案（单 Token）

### 3.1 入口 URL 规范
- 小程序 → H5（WebView）
  - `https://主域名/tamp?from=miniapp&token=xxx&referrer=/subPages/tamp/demo`
- H5 → H5（外部来源）
  - `https://主域名/tamp?from=h5&token=xxx&referrer=/subPages/tamp/demo&loginUrl=...`

### 3.2 Token 落地
- `auth/gateway.vue`：
  - 读取 `transferH5Ticket` 并换取登录态
  - 记录 `source/loginUrl/shopId` 到 `tampStore`
  - 成功后清理敏感 query
  - `router.replace(referrer)`
- `tamp/index.vue`：
  - 仅保留兼容转发，不再执行认证或写入登录态

### 3.3 401/403 处理
- `src/api/core/handlers.ts`：
  - 401/403 → `logout()`
  - 读取 `tampStore` 外部来源 → `handleExternalRedirect(source, loginUrl)`

---

## 4. 服务端必须支持的事项

### 4.1 Token 签发与校验
- 提供登录态 Token（单 Token）。
- Token 可被 H5 API 与小程序 WebView API 访问校验。
- 401/403 统一返回标准错误码，保证前端识别触发回跳。

### 4.2 小程序 → H5 Token 传递
- 小程序端获取 Token。
- 拼接到 WebView URL。
- 建议：Token 短时有效或携带签名，避免 URL 泄露风险。

### 4.3 H5 → H5 Token 传递
- 外部 H5 登录后跳转时，将 Token 作为 URL 参数传递。

### 4.4 Weixin JSSDK 鉴权（必须）
- 服务端提供 JSSDK 鉴权接口，返回：
  - `appId`
  - `timestamp`
  - `nonceStr`
  - `signature`
- 允许的签名域名需在微信公众平台配置。
- 前端在 H5 内调用：
  - `wx.config({...})`
  - `wx.ready(...)`
  - `wx.miniProgram.getEnv(...)`
  - `wx.miniProgram.redirectTo(...)`（回跳时使用）

### 4.5 来源回跳支持
- 服务端需提供**小程序登录页路径** / **H5 登录页 URL**。
- 401/403 回跳时，前端可携带 `referrer` 作为回跳参数。

---

## 5. TODO 清单（与当前实现差距）
1. 评估何时下线旧 `/subPages/tamp/index` 兼容别名。
2. 为新 `auth` 网关补充更多端到端回归验证。
3. 继续清理历史设计文档里对旧 `tamp` 入口的描述。

---

## 6. 运维部署方案（同镜像 + NGINX）
- 构建产物结构：
  - `/usr/share/nginx/html/main` 主项目
  - `/usr/share/nginx/html/tamp` TAMP 项目

**NGINX 示例：**
```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    root /usr/share/nginx/html/main;
    try_files $uri $uri/ /index.html;
  }

  location /tamp/ {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /tamp/index.html;
  }

  location /api/ {
    proxy_pass http://backend-main;
  }

  location /app-api/ {
    proxy_pass http://backend-tamp;
  }
}
```
