# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **uni-app ETF mini-program** built on the Wot Starter template (based on vitesse-uni-app). It uses Vue 3 + TypeScript + Vite and supports multiple platforms (H5, WeChat Mini Program, Alipay, etc.).

**Tech Stack**: Vue 3 (Composition API), Vite, TypeScript, Pinia, UnoCSS, Wot Design Uni, Alova, @wot-ui/router, ECharts

## Common Commands

```bash
# Development (H5 by default)
pnpm dev                  # H5 development server with Vite proxy
pnpm dev:mp-weixin        # WeChat Mini Program
pnpm dev:mp-alipay        # Alipay Mini Program
pnpm dev:h5:ssr           # H5 with SSR

# Build for production
pnpm build                # H5 production build
pnpm build:mp-weixin      # WeChat Mini Program production
pnpm build:h5:staging     # H5 staging build
pnpm build:h5:production  # H5 production build

# Code quality
pnpm lint                 # Run ESLint
pnpm lint:fix             # Fix ESLint issues automatically
pnpm type-check           # Run TypeScript type checking

# API generation (from OpenAPI spec)
pnpm alova-gen            # Generate API methods from OpenAPI/Swagger spec

# Testing (if configured)
pnpm test                 # Run tests
```

## Architecture Overview

### File-Based Routing with SubPackages

Pages are automatically routed based on file structure:

- **Main pages**: `src/pages/` - Generates routes like `/pages/index`
- **Sub-packages**: `src/subPages/` - Generates routes like `/subPages/etf/index`
- **Echarts sub-package**: `src/subEcharts/` - Chart demo pages
- **Async echarts sub-package**: `src/subAsyncEcharts/` - Async-loaded charts

Route configuration is in `src/pages.json` (auto-generated from `pages.config.ts`). Use `definePage()` in component `<script setup>` to set page metadata (name, layout, style).

### Layout System

Layouts are in `src/layouts/`. Specify layout in page component:
```vue
<script setup>
definePage({
  layout: 'tabbar'  // Uses src/layouts/tabbar.vue
})
</script>
```

Available layouts: `default`, `tabbar`

### Auto-Import System

**Components** (from `src/components/`, `src/business/`) and **composables** (from `src/composables/`) are auto-imported via `unplugin-auto-import` and `@uni-helper/vite-plugin-uni-components`.

Wot Design Uni components (prefix: `wd-`) and uni-echarts components are also auto-imported.

**No need to manually import**:
- Vue APIs (ref, computed, reactive, etc.)
- VueUse composables
- Pinia APIs (defineStore, store functions)
- uni-app lifecycle (onLaunch, onShow, etc.)
- Router APIs (useRouter, useRoute)
- Wot Design composables (useToast, useMessage, useNotify)
- Alova composables (useRequest, usePagination)
- All files from `src/composables/`, `src/store/`, `src/utils/`, `src/api/`

### API Layer (Alova)

**Architecture**: `alovaInstance` → `beforeRequest hook` → `uniapp adapter` → `mock adapter (optional)` → `response handlers` → `API modules`

**Key files**:
- `src/api/core/instance.ts` - Main Alova instance with hooks
- `src/api/core/handlers.ts` - Response/error handlers (401/403 redirects)
- `src/api/core/middleware.ts` - Delay loading and global loading middleware
- `src/api/mock/` - Mock adapter with simulated network delay

**Base URL**:
- H5: Empty (uses Vite proxy to `https://cngz.yhlsd.com`)
- Other platforms: `VITE_API_BASE_URL` environment variable

**Adding new API endpoints**: Create functions in `src/api/modules/` using the pattern:
```typescript
export function functionName(params) {
  return alovaInstance.Method(url, params)
}
```

### Theme System (Dual Mode)

**1. System Theme** (`useTheme()`): Lightweight, follows system theme only
**2. Manual Theme** (`useManualTheme()`): Full control with light/dark toggle + theme color selection

Theme colors are defined via CSS variables and `theme.json` for native platform styling.

### Conditional Compilation

Use uni-app conditional compilation for platform-specific code:
```typescript
// #ifdef H5
// H5-only code
// #endif

// #ifdef MP-WEIXIN
// WeChat Mini Program only
// #endif

// #ifndef H5
// All platforms EXCEPT H5
// #endif
```

### Root Component (uni-ku)

This project uses `uni-ku/root` which replaces traditional `App.vue` with `App.ku.vue`. Global providers and components are defined here, not in App.vue.

## Key Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config, plugins, proxy, auto-imports |
| `pages.config.ts` | Page routing, tab bar, global styles |
| `manifest.config.ts` | Platform-specific app configuration |
| `uno.config.ts` | Atomic CSS engine configuration |
| `alova.config.ts` | OpenAPI-to-API generator settings |
| `src/theme.json` | Native theme colors for light/dark modes |

## State Management (Pinia)

Stores are in `src/store/`. All stores except `temp` are automatically persisted via `uni.setStorageSync()`.

Key stores:
- `useUserStore` - User authentication and data
- `useManualThemeStore` - Manual theme control
- `useThemeStore` - System theme (auto-detect)
- Global UI stores: toast, message, loading

## Environment Variables

- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Variables: `VITE_API_BASE_URL`, `VITE_ENV_NAME`

## Platform-Specific Notes

**WeChat Mini Program (MP-WEIXIN)**:
- Privacy popup appears on first launch (`src/components/PrivacyPopup.vue`)
- Dark mode enabled via `theme.json`
- SubPackages optimization enabled

**H5**:
- Vite proxy handles `/api` and `/djapi` endpoints
- Full router functionality available
