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
- `src/pages`: 应用视图 (基于文件的路由)。
- `src/components`: 可复用的 UI 组件。
- `src/store`: Pinia 状态管理模块。
- `src/api`: Alova.js API 定义。
- `src/uni_modules`: Uni-app 模块 (包含 wot-design-uni)。

## 🤝 Git 工作流
- **提交**: 符合 Conventional Commits 规范 (`feat:`, `fix:`, `chore:`, `refactor:`)。
- **主要工具**: `commitizen` (通过 `pnpm commit` 使用)。

## 🛠️ 代码生成
- **API**: 使用 `pnpm alova-gen` 重新生成 API 定义。
- **Skills**: 使用 `.agent/skills` 中的 skill 进行脚手架生成:
    - `pinia-store-generator`
    - `uni-page-generator`
    - `alova-api-module`

---
description: 核心技术栈、架构和代码规范
globs: src/store/**/*, src/api/**/*, src/router/**/*, src/pages/**/*, pages.config.ts, alova.config.ts
alwaysApply: false
---

# 技术栈与架构

## 🏗️ 架构概览
本项目采用分层架构：
- **表现层**: `src/pages` (视图) + `src/components` (UI 逻辑)
- **状态层**: `src/store` (Pinia)
- **数据层**: `src/api` (Alova.js)

## 📦 状态管理 (Pinia)
- **库**: Pinia
- **持久化**: 使用 `src/store/persist.ts` 进行本地存储。
- **模式**: 详见 `pinia-store-generator` skill。
- **规则**: 始终使用 `defineStore` 并遵循 `use{Name}Store` 的命名规范。
- **Skill**: 使用 **`pinia-store-generator`** 快速创建新的 store。

## 🌐 API 层 (Alova.js)
- **库**: Alova.js
- **结构**:
    - `src/api/core`: 拦截器和实例配置。
    - `src/api/apiDefinitions.ts`: 自动生成的 API 定义。
- **Mock**: 支持在 `src/api/mock` 中编写 Mock 数据。
- **Skill**: 使用 **`alova-api-module`** 创建新的 API 模块和 Mock 数据。

## 🛣️ 路由
- **库**: `@wot-ui/router` (API) + `vite-plugin-uni-pages` (文件系统路由)
- **配置**: `pages.config.ts` 控制 `pages.json` 的生成。
- **导航**: 使用 `useRouter()` 进行 push/replace/back 操作。
- **Skill**: 参考 **`wot-router-usage`** 了解导航模式和守卫用法。
- **Skill**: 使用 **`uni-page-generator`** 创建带路由配置的新页面。

---
description: UI/UX 指南、样式规范和组件使用
globs: **/*.vue, **/*.scss, src/components/**/*, src/uni_modules/**/*, uno.config.ts
alwaysApply: false
---

# UI 与样式指南

## 🎨 样式系统
- **引擎**: UnoCSS (原子化 CSS) 是**首选**的样式方案。
- **配置**: `uno.config.ts`。
- **预处理**: SCSS 用于复杂的组件样式（极少需要）。
- **主题**: 通过 `src/theme.json` 和 CSS 变量支持亮色/暗色模式切换。

### UnoCSS 约定
- 使用工具类: `flex`, `items-center`, `text-primary`, `m-4`.
- 响应式前缀: `sm:`, `md:` (在移动端优先的 uni-app 中较少使用)。
- 图标: 通过 UnoCSS preset 使用 `i-carbon-{icon-name}`。

## 🧩 组件库
- **核心库**: `wot-design-uni` (`wd-` 前缀)。
- **文档**: [wot-design-uni](https://wot-ui.cn).
- **自定义组件**: 在 `src/components` 中创建。

## 📢 全局反馈
- **Toast/Message**: 请勿直接使用 `uni.showToast`。
- **标准**: 使用 `GlobalToast`, `GlobalMessage`, `GlobalLoading` 组件。
- **Skill**: 参考 **`global-feedback`** skill 查看使用示例。

## 📱 布局
- **系统**: `vite-plugin-uni-layouts`。
- **默认**: `src/layouts/default.vue`。
- **TabBar**: `src/layouts/tabbar.vue`。
