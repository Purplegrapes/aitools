# 外部跳转认证系统设计文档

## 更新说明

- 当前实现采用单 Token 方案，不再使用 refresh/access token。
- 本文档已清理双 Token/刷新相关内容，仅保留单 Token 适用的说明。

**日期**: 2026-02-04
**版本**: 1.0
**状态**: 设计阶段

---

## 1. 概述

本文档描述了一个支持外部跳转的认证系统，允许用户从外部微信小程序或H5页面跳转到当前项目，并在token失效后自动跳转回对应的登录页。系统采用**单Token机制**（Token）和**临时授权码**（Authorization Code）方案，确保安全性和用户体验。

### 1.1 设计目标

- 支持从外部小程序/H5跳转到项目内页面
- 实现安全的跨端认证（避免token在URL中传递）
- 登录失效时智能跳转回外部来源
- 保持原有内部访问流程不变

### 1.2 核心特性

- **临时授权码**: 小程序跳转H5时通过code换取token
- **来源追踪**: 持久化存储外部来源信息
- **双模式共存**: 内部访问和外部跳入两种模式互不影响

---

## 2. 架构设计

### 2.1 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    外部跳转认证系统架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  来源检测模块    │  │  单Token管理    │  │  认证拦截器     │ │
│  │ SourceDetector  │  │   UserStore     │  │ AuthInterceptor │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                     │                     │          │
│           └─────────────────────┴─────────────────────┘          │
│                                 │                                │
│                          ┌─────────────┐                         │
│                          │ 外部跳转处理 │                         │
│                          │ExternalRedirect│                       │
│                          └─────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心模块

#### 2.2.1 来源检测模块 (SourceDetector)

负责识别用户进入项目的来源，结合两种检测方式：

- **URL参数检测**: 解析微信标准的来源参数（`from`, `code`, `appId` 等）
- **环境检测**: 引入微信JSSDK，通过 `wx.miniProgram.getEnv()` 判断环境

#### 2.2.2 单Token状态管理 (UserStore)

基于Pinia的持久化Store，存储单Token信息：

```typescript
interface TokenState {
  token: string
}

interface ExternalSource {
  source: 'miniprogram' | 'h5' | 'internal'
  appId?: string
  loginUrl?: string
  targetPath?: string
  timestamp: number
}
```

#### 2.2.3 外部跳转处理器 (ExternalRedirectHandler)

当 token 失效或未登录时，处理外部跳转逻辑。

---

## 3. 认证流程

### 3.1 跨端认证流程

```
┌─────────────────────────────────────────────────────────────────┐
│                     跨端认证流程                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  【小程序 → H5】                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 小程序生成临时code（5分钟有效，一次性）                │   │
│  │ 2. URL: https://.../target?code=xxx&from=miniapp        │   │
│  │ 3. H5获取code，调用后端换取token                          │   │
│  │ 4. 后端验证code有效，返回token                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  【H5 → 小程序】                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. H5通过同域cookie已登录                                │   │
│  │ 2. URL: pages/target?from=h5                            │   │
│  │ 3. 小程序通过web-view的cookie或session获取登录状态        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  【Token失效时跳转】                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 小程序来源 → 跳回小程序登录页（携带目标路径参数）           │   │
│  │ H5来源 → 跳回H5登录页（携带目标路径参数）                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 单Token失效处理流程

- API 返回 401/403 时，清除本地 token 与用户信息
- 根据外部来源信息跳转回对应登录入口

---

## 4. URL参数规范

### 4.1 从小程序跳转到H5

```
https://your-domain.com/pages/target?code=AUTH_CODE&from=miniapp&appId=wx123456
```

| 参数 | 说明 |
|------|------|
| `code` | 临时授权码，5分钟有效，一次性使用 |
| `from` | 固定值 `miniapp`，标识来源 |
| `appId` | 外部小程序的appId |

### 4.2 从H5跳转到小程序

```
pages/target?from=h5&sessionId=xxx
```

| 参数 | 说明 |
|------|------|
| `from` | 固定值 `h5`，标识来源 |
| `sessionId` | 会话标识，用于验证登录状态 |

---

## 5. 双模式共存

### 5.1 两种认证模式

**内部访问模式**（原有流程，保持不变）：
- 用户直接访问项目
- 使用 `wechatLogin()` / `accountLogin()` 登录
- Token失效 → 跳转项目内登录页
- 不记录外部来源信息

**外部跳入模式**（新增流程）：
- 从外部小程序/H5跳入
- URL携带 code 或 session 参数
- 使用 `tokenByCode()` / `tokenBySession()` 换取token
- Token失效 → 跳转回外部登录页
- 记录外部来源信息（持久化）

### 5.2 模式检测

```typescript
export function detectAccessMode(query: Record<string, any>): {
  mode: 'internal' | 'external'
  source: 'miniprogram' | 'h5' | null
} {
  if (query.code && query.from === 'miniapp') {
    return { mode: 'external', source: 'miniprogram' }
  }

  if (query.sessionId && query.from === 'h5') {
    return { mode: 'external', source: 'h5' }
  }

  return { mode: 'internal', source: null }
}
```

### 5.3 流程对比

| 场景 | 检测方式 | Token获取 | 401处理 | 登录页 |
|------|----------|-----------|---------|--------|
| 直接访问(H5) | 无特殊参数 | wechatLogin | 跳转内部login | /pages/login |
| 直接访问(小程序) | 无特殊参数 | wechatLogin | 跳转内部login | /pages/login |
| 小程序跳入H5 | code+from=miniapp | tokenByCode | 跳回小程序 | 外部小程序页 |
| H5跳入小程序 | sessionId+from=h5 | tokenBySession | 跳回H5 | 外部H5页 |

---

## 6. API接口设计

### 6.1 新增接口

```typescript
/**
 * 通过code换取token（小程序跳转H5场景）
 */
export function tokenByCode(params: {
  code: string
  appId?: string
}) {
  return alovaInstance.Post('/api/v1/auth/token-by-code', params)
}

/**
 * 验证session获取token（H5跳转小程序场景）
 */
export function tokenBySession(params: {
  sessionId: string
}) {
  return alovaInstance.Post('/api/v1/auth/token-by-session', params)
}

/**
 * 刷新token
 */
}) {
  return alovaInstance.Post('/api/v1/auth/refresh', params)
}
```

---

## 7. 文件结构

### 7.1 新建文件

```
src/
├── api/
│   └── modules/
│       └── auth.ts               # 新建：外部认证相关接口
├── store/
│   └── externalSourceStore.ts    # 新建：外部来源管理
└── utils/
    ├── externalRedirect.ts       # 新建：外部跳转处理
    └── sourceDetector.ts         # 新建：来源检测工具
```

### 7.2 修改文件

```
src/
├── api/
│   └── core/
│       ├── handlers.ts           # 修改：添加双token刷新逻辑
│       └── instance.ts           # 修改：添加刷新锁机制
├── store/
├── router/
│   └── guards.ts                 # 修改：添加认证守卫
└── App.vue                       # 修改：应用启动时初始化
```

---

## 8. 错误处理

### 8.1 边界情况处理

| 场景 | 处理方式 |
|------|----------|
| code无效或过期 | 清除来源，跳转外部登录 |
| 网络错误时刷新token失败 | 提示用户重试，不跳转 |
| 多个请求同时401 | 请求队列化，只刷新一次 |
| 用户手动清除来源 | 下次401时按内部访问处理 |

---

## 9. 实现检查清单

- [ ] 创建 `src/api/modules/auth.ts` - 外部认证接口
- [ ] 创建 `src/store/externalSourceStore.ts` - 外部来源管理
- [ ] 创建 `src/utils/externalRedirect.ts` - 外部跳转处理
- [ ] 创建 `src/utils/sourceDetector.ts` - 来源检测工具
- [ ] 修改 `src/api/core/instance.ts` - 添加刷新锁机制
- [ ] 修改 `src/api/core/handlers.ts` - 添加双token刷新逻辑
- [ ] 修改 `src/App.vue` - 添加启动初始化逻辑
- [ ] 引入微信JSSDK（如需要）
- [ ] 测试内部访问模式
- [ ] 测试小程序→H5跳转
- [ ] 测试H5→小程序跳转
- [ ] 测试token刷新流程
- [ ] 测试登录失效跳转

---

**文档结束**
