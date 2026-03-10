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

### 字体大小规范（uni-app 多端兼容）
- **可以使用 Tailwind 默认字号**: `text-xs` ~ `text-3xl`（最大不超过 36rpx）
- **需要更大字体时使用 `rpx` 单位**: `text-[40rpx]` 等
- **字体上限**: 页面中最大字体不超过 36rpx（除非特殊场景如超大标题）

#### Tailwind 默认字号对照表
| 类名 | 大小 | 适用场景 |
|------|------|----------|
| `text-xs` | 24rpx | 极小文字（标签、注释） |
| `text-sm` | 28rpx | 小文字（辅助信息） |
| `text-base` | 32rpx | 正文（基础字号） |
| `text-lg` | 36rpx | 小标题 |
| `text-xl` | 40rpx | 标题 |
| `text-2xl` | 48rpx | 大标题 |
| `text-3xl` | 60rpx | 特大标题（⚠️ 超过 36rpx 限制） |

### ✅ 正确示例
```vue
<!-- 优先使用 Tailwind 默认字号（≤36rpx） -->
<text class="text-xs">极小文字</text>
<text class="text-sm">辅助信息</text>
<text class="text-base">正文文字</text>
<text class="text-lg font-medium">小标题</text>

<!-- 需要自定义大小时使用 rpx -->
<text class="text-[28rpx]">自定义大小</text>
```

### ❌ 错误示例
```vue
<!-- 避免使用超过 36rpx 的 Tailwind 类名 -->
<text class="text-xl">标题</text>  <!-- 40rpx -->
<text class="text-2xl">大标题</text>  <!-- 48rpx -->

<!-- 避免使用 px 单位，无法响应式适配 -->
<text class="text-[14px]">正文</text>
```

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
