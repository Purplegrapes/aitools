# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---
description: 项目基本信息、工作流和常用命令
globs: package.json, src/**/*
alwaysApply: true
---

# 项目信息与工作流

## 🚀 快速开始
- **开发**: `pnpm dev` (H5), `pnpm dev:mp-weixin` (微信小程序)。
- **构建**: `pnpm build:h5`, `pnpm build:mp-weixin`。
- **Lint**: `pnpm lint:fix`。
- **预览**: `dist/` 目录。

## 📂 目录结构概览
```
src/
├── pages/           # 主包页面（基于文件的路由）
├── subPages/        # 分包页面
│   ├── etf/        # ETF 子包（含 API 模块）
│   └── tamp/       # TAMP 子包（外部认证、店铺管理）
├── components/      # 可复用的 UI 组件
├── store/          # Pinia 状态管理模块
├── api/            # Alova.js 全局 API 定义
├── types/          # TypeScript 类型声明
├── utils/          # 工具函数
└── uni_modules/    # Uni-app 模块（包含 wot-design-uni）
```

## 🤝 Git 工作流
- **提交**: 符合 Conventional Commits 规范 (`feat:`, `fix:`, `chore:`, `refactor:`)。
- **主要工具**: `commitizen` (通过 `pnpm commit` 使用)。

## 🛠️ 代码生成
- **API**: 使用 `pnpm alova-gen` 重新生成 API 定义。
- **Skills**: 使用 `.agent/skills` 中的 skill 进行脚手架生成:
    - `pinia-store-generator` - 创建 Pinia Store
    - `uni-page-generator` - 创建 uni-app 页面
    - `alova-api-module` - 创建 Alova API 模块

---
description: 核心技术栈、架构和代码规范
globs: src/store/**/*, src/api/**/*, src/router/**/*, src/pages/**/*, src/subPages/**/*, pages.config.ts, alova.config.ts
alwaysApply: false
---

# 技术栈与架构

## 🏗️ 架构概览
本项目采用分层架构：
- **表现层**: `src/pages` / `src/subPages` (视图) + `src/components` (UI 逻辑)
- **状态层**: `src/store` (Pinia)
- **数据层**: `src/api` (Alova.js) + 子包独立 API 模块

## 📦 状态管理 (Pinia)
- **库**: Pinia
- **核心 Stores**:
    - `userStore` - 用户信息和认证状态
    - `tampStore` - TAMP 外部来源信息（source, appId, token）
- **持久化**: 使用 `src/store/persist.ts` 进行本地存储
- **规则**: 始终使用 `defineStore` 并遵循 `use{Name}Store` 的命名规范
- **Skill**: 使用 **`pinia-store-generator`** 快速创建新的 store

## 🌐 API 层 (Alova.js)
- **库**: Alova.js
- **全局 API**: `src/api/core/instance.ts` - 拦截器和实例配置
- **子包独立 API**: 各子包可维护独立的 API 模块
    - `src/subPages/etf/api` - ETF 相关 API（含 userApi）
    - `src/subPages/tamp/api` - TAMP 认证和店铺 API
- **使用 useRequest**: 组件中使用 `useRequest` 调用 API，自动处理 loading/error/data
- **Skill**: 使用 **`alova-api-module`** 创建新的 API 模块

## 🛣️ 路由
- **库**: `@wot-ui/router` (API) + `vite-plugin-uni-pages` (文件系统路由)
- **配置**: `pages.config.ts` 控制 `pages.json` 的生成
- **导航**: 使用 `useRouter()` 进行 push/replace/back 操作
- **Skill**: 参考 **`wot-router-usage`** 了解导航模式和守卫用法
- **Skill**: 使用 **`uni-page-generator`** 创建带路由配置的新页面

## 🔐 外部认证流程 (TAMP)
TAMP 子包处理小程序/H5 外部跳转认证：

### 访问流程
1. **外部跳入**: 小程序/H5 带参数跳转到 TAMP 中转页
2. **中转处理**: `/subPages/tamp/index` 处理认证，获取 token
3. **参数说明**:
    - `from=miniapp` - 小程序来源
    - `from=h5` - H5 来源
    - `token` - 认证 token（URL 编码）
    - `referer` - 跳转目标页面
    - `appId` - 目标小程序 ID（小程序来源时）
4. **状态存储**: `tampStore` 存储来源信息（source, appId）
5. **跳转**: 认证成功后跳转到 `referer` 指定的页面

### 返回逻辑
根据 `tampStore` 中的来源信息判断返回方式：
- **小程序来源**: 调用 `wx.miniProgram.navigateTo` 跳转到指定 `appId` 的小程序
- **H5 来源**: 返回本地首页或指定的 loginUrl
- **内部访问**: 直接返回本地首页

---
description: UI/UX 指南、样式规范和组件使用
globs: **/*.vue, **/*.scss, src/components/**/*, src/uni_modules/**/*, uno.config.ts
alwaysApply: false
---

# UI 与样式指南

## 🎨 样式系统
- **引擎**: UnoCSS (原子化 CSS) 是**首选**的样式方案
- **配置**: `uno.config.ts`
- **预处理**: SCSS 用于复杂的组件样式（极少需要）
- **主题**: 通过 `src/theme.json` 和 CSS 变量支持亮色/暗色模式切换

### UnoCSS 约定
- 使用工具类: `flex`, `items-center`, `text-primary`, `m-4`
- 响应式前缀: `sm:`, `md:` (在移动端优先的 uni-app 中较少使用)
- 图标: 通过 UnoCSS preset 使用 `i-carbon-{icon-name}`
- 字体大小: 优先使用 UnoCSS 内置语义化字号，如 `text-xs`, `text-sm`, `text-base`, `text-lg`
- 字体上限: 移动端页面常规内容默认控制在 `text-lg` 及以下；只有关键金额、主标题等极少数场景才允许提升到 `text-xl` 或 `text-2xl`
- 禁止任意值字号: 业务页面不要使用 `text-[xxrpx]`、`text-[xxpx]` 这类任意值字号
- 颜色来源: 文本色、背景色、边框色优先使用 `uno.config.ts` 中定义的语义 token，如 `text-primary`, `text-secondary`, `bg-page`, `bg-surface`, `text-danger`
- 禁止零散色值: 业务页面尽量不要直接写 `#xxxxxx`、`rgb()` 等颜色值；新增颜色先沉淀到 `uno.config.ts`
- 单位规范: 业务样式不要再出现 `px` 单位；自定义尺寸统一使用 `rpx`
- `rpx` 使用原则: `rpx` 只用于间距、圆角、阴影、定位、组件尺寸等移动端尺寸表达，并且要以保守视觉为准，优先复用已有间距等级，避免单页出现过大留白或过密排版
- **类名顺序**: 运行 `pnpm lint:fix` 自动排序 UnoCSS 类名

### 常用模式
```vue
<!-- 布局 -->
<view class="flex flex-col items-center justify-center gap-4" />

<!-- 颜色 -->
<text class="text-secondary text-sm" />

<!-- 间距 -->
<view class="p-4 mb-4" />

<!-- 圆角和阴影 -->
<view class="rounded-2xl shadow-sm" />

<!-- 页面底色与卡片 -->
<view class="bg-page p-4">
  <view class="bg-surface rounded-2xl p-4" />
</view>
```

## 🧩 组件库
- **核心库**: `wot-design-uni` (`wd-` 前缀)
- **文档**: [wot-design-uni](https://wot-ui.cn)
- **自定义组件**: 在 `src/components` 中创建

## 📢 全局反馈
- **Toast/Message**: 请勿直接使用 `uni.showToast`
- **标准**: 使用 `GlobalToast`, `GlobalMessage`, `GlobalLoading` 组件
- **Skill**: 参考 **`global-feedback`** skill 查看使用示例

## 📱 布局
- **系统**: `vite-plugin-uni-layouts`
- **默认**: `src/layouts/default.vue`
- **TabBar**: `src/layouts/tabbar.vue`
