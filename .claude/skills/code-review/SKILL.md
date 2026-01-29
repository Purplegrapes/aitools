---
name: code-review
description: 自动代码审查和修复工具，用于 Vue 3 + TypeScript + UnoCSS 项目。当审查 .vue、.ts 文件时使用此技能，检查 SCSS 使用、console 语句、缺失的 useRequest 模式、重复函数和未定义处理等问题。
---

# 代码审查技能

## 概述

本技能根据 CLAUDE.md 中定义的项目标准，对 Vue 3 + TypeScript + UnoCSS 项目执行自动化代码审查和修复。识别违规项，自动修复常见问题，并生成详细报告。

## 使用时机

- 审查 Vue 3 单文件组件 (.vue) 的项目标准违规项
- 审查 TypeScript 文件 (.ts) 的最佳实践
- 提交代码前确保代码质量
- 集成到 CI/CD 流程中

## 项目标准

### 样式系统 (UnoCSS)
- ✅ 仅使用 UnoCSS 工具类：`flex`、`items-center`、`p-4`、`text-sm` 等
- ✅ 语义化字体大小：`text-xs`、`text-sm`、`text-base`、`text-lg`、`text-xl`
- ✅ UnoCSS 工具类顺序：位置 → 布局 → 盒模型 → 视觉 → 排版
- ❌ 禁止在 Vue 文件中使用 SCSS/CSS 模块

### 数据获取 (Alova)
- ✅ 始终使用 `useRequest` composable 进行 API 调用
- ✅ 使用 `.onError()` 和 `.onSuccess()` 进行错误处理
- ❌ 禁止在没有 useRequest 的情况下直接调用 API

### 代码质量
- ❌ 生产代码中禁止 `console.error` / `console.log`
- ✅ 使用正确的 TypeScript 类型，尽可能避免 `any`
- ✅ 导入共享函数而不是重复代码
- ✅ 在模板中处理 null/undefined 值

### Vue 3 最佳实践
- ✅ 使用带有 `<script setup>` 的 Composition API
- ✅ 使用 `definePage()` 设置页面元数据
- ✅ 使用自动导入的 composables (useRouter、useRoute 等)

### 全局反馈组件
- ❌ 禁止直接使用 `uni.showToast`
- ✅ 使用 `GlobalToast`、`GlobalMessage`、`GlobalLoading` 组件

### 路由
- ✅ 使用 `@wot-ui/router` 的 `useRouter()` 进行导航
- ✅ 文件系统路由 (vite-plugin-uni-pages)

## 问题检测模式

### Console 语句
```bash
# 搜索 console 语句
grep -rn "console\.\(log\|error\|warn\|info\)" src/
```

### SCSS 使用
```bash
# 搜索 <style lang="scss">
grep -rn '<style lang="scss">' src/
```

### 直接 API 调用（未使用 useRequest）
```bash
# 搜索直接 Apis 调用（应该使用 useRequest）
grep -rn "Apis\." src/ | grep -v "useRequest"
```

### Any 类型
```bash
# 搜索显式 any 类型
grep -rn ": any" src/
```

### 直接使用 uni.showToast
```bash
# 搜索直接使用 uni.showToast
grep -rn "uni\.showToast" src/
```

## 常见修复模式

### 1. 移除 Console 语句
```typescript
// 修复前
onError((error) => {
  console.error(error)
})

// 修复后
onError((error) => {
  // 静默错误处理 - 错误由 Alova 记录
})
```

### 2. 将 SCSS 转换为 UnoCSS
```vue
<!-- 修复前 -->
<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  padding: 12rpx;
  font-size: 14px;
}
</style>

<!-- 修复后 -->
<template>
  <view class="flex items-center p-12rpx text-sm">
</template>
```

### 3. 使用 useRequest 进行 API 调用
```typescript
// 修复前
async function fetchData() {
  const res = await Apis.etf.getData()
  return res.data
}

// 修复后
const { data, loading } = useRequest(() => Apis.etf.getData(), {
  immediate: true,
})
```

### 4. 处理未定义值
```vue
<!-- 修复前 -->
<text>{{ formatAssets(item.value) }}</text>

<!-- 修复后 -->
<text>{{ formatAssets(item.value ?? '--') }}</text>
```

### 5. 使用全局反馈组件
```typescript
// 修复前
uni.showToast({
  title: '操作成功',
  icon: 'success',
})

// 修复后
const GlobalToast = useGlobalToast()
GlobalToast.success('操作成功')
```

### 6. 字体大小标准化
```vue
<!-- 修复前 -->
<text class="text-12">小字</text>
<text class="text-14">正常字</text>
<text class="text-16">大字</text>

<!-- 修复后 -->
<text class="text-xs">小字</text>
<text class="text-sm">正常字</text>
<text class="text-base">大字</text>
```

## 报告格式

每个审查文件的输出：

```
📋 代码审查报告

📁 src/subPages/etf/index.vue
   问题数: 2
   ✓ [已修复] 第139行: 发现 console.error → 已移除
   ⚠️ [已修复] 第433行: 使用 SCSS → 已转换为 UnoCSS

📁 src/subPages/etf/detail.config.ts
   问题数: 1
   ✓ [已修复] 第58行: formatAssets 函数重复 → 已从 data.ts 导入

✨ 总结: 发现 3 个问题，已自动修复 3 个，需手动修复 0 个
```

## 工作流程

1. **扫描**: 使用 Grep 模式识别潜在问题
2. **读取**: 读取文件以确认问题和上下文
3. **修复**: 使用 Edit 工具应用修复（安全、确定性更改）
4. **报告**: 生成发现和修复的详细报告
5. **确认**: 对有风险的重大更改请求用户确认（重构、破坏性更改）

## 安全修复标准

无需确认即可自动修复：
- 移除 console 语句
- 将 SCSS 转换为 UnoCSS（直接转换）
- 添加 undefined/null 检查
- 导入现有函数而不是重复

需要用户确认：
- 大型重构
- 组件结构更改
- 破坏性 API 更改
- 逻辑修改

## 使用示例

```
用户: "根据项目标准审查 ETF 页面"

Claude:
1. 正在扫描 src/subPages/etf/ 中的问题...
2. 发现 4 个潜在问题
3. 读取文件以确认...
4. 应用修复...
   - ✓ 已移除 index.vue:139 中的 console.error
   - ✓ 已将 index.vue 中的 SCSS 转换为 UnoCSS
   - ✓ 已修复 detail.config.ts 中的重复 formatAssets 函数
   - ✓ 已在 detail.vue 中添加 undefined 检查
5. 生成报告...

📋 代码审查报告
[详细报告输出]
```

## 资源

### 参考文件
- `CLAUDE.md` - 完整的项目标准和指南
- `.claude/rules/ui-guidelines.md` - UI 和样式指南
- `.claude/rules/tech-stack.md` - 技术栈和架构
- `.claude/rules/project-info.md` - 项目信息和工作流

### 相关技能
- `global-feedback` - 全局反馈组件使用指南
- `alova-api-module` - 创建 Alova 请求模块
- `pinia-store-generator` - 创建 Pinia Store
- `uni-page-generator` - 创建 uni-app 页面
