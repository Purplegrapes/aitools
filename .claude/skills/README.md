# ETF Mini 项目 - Claude Skills 使用手册

本手册介绍项目中所有可用的 Claude Skills，帮助开发者快速了解和使用这些技能提高开发效率。

## 目录

- [概述](#概述)
- [核心开发技能](#核心开发技能)
- [代码质量技能](#代码质量技能)
- [UI/设计技能](#ui设计技能)
- [工具类技能](#工具类技能)

---

## 概述

Claude Skills 是可扩展 Claude AI 能力的模块化包，每个技能都针对特定任务或领域提供了专业化的知识和工作流程。

### 技能列表

| 技能 | 用途 | 触发关键词 |
|------|------|-----------|
| `alova-api-module` | 创建 API 模块和 Mock 数据 | "创建 API"、"Mock 数据" |
| `pinia-store-generator` | 生成 Pinia Store | "创建 Store"、"状态管理" |
| `uni-page-generator` | 生成 uni-app 页面 | "创建页面"、"新建页面" |
| `vue-composable-creator` | 创建 Vue 组合式函数 | "创建 composable"、"封装逻辑" |
| `code-review` | 代码审查和修复 | "代码审查"、"检查代码" |
| `frontend-code-review` | 前端代码审查 | "前端审查"、"审查代码" |
| `frontend-design` | 创建高质量前端界面 | "设计 UI"、"创建页面" |
| `global-feedback` | 全局反馈组件使用指南 | "Toast"、"Message"、"Loading" |
| `wot-router-usage` | 路由使用指南 | "路由"、"导航"、"跳转" |
| `skill-creator` | 创建新技能 | "创建 skill"、"新技能" |
| `wot-starter-init` | 初始化 wot-starter 项目 | "初始化项目"、"创建新项目" |
| `starter-cleaner` | 清理模板项目 | "清理模板"、"移除示例" |

---

## 核心开发技能

### 1. alova-api-module

**用途**: 快速创建 Alova 请求模块和 Mock 数据

**何时使用**:
- 需要添加新的 API 接口
- 需要 Mock 数据进行开发
- 需要配置 API 请求模块

**使用示例**:
```
你: "帮我创建一个用户相关的 API 模块"
Claude: 将自动生成 API 模块、Mock 数据和类型定义
```

**目录结构**:
```
src/api/
├── core/
│   └── instance.ts      # Alova 实例配置
├── mock/
│   ├── modules/         # Mock 模块目录
│   └── mockAdapter.ts   # Mock 适配器
└── modules/            # API 模块
```

---

### 2. pinia-store-generator

**用途**: 创建符合项目规范的 Pinia Store

**何时使用**:
- 需要管理全局状态
- 需要跨组件共享数据
- 需要持久化状态

**使用示例**:
```
你: "创建一个购物车的 Store"
Claude: 将生成 cartStore.ts 和相关类型定义
```

**Store 命名规范**:
- 文件: `{moduleName}Store.ts`
- 函数: `use{ModuleName}Store`
- 类型: `{ModuleName}State`

---

### 3. uni-page-generator

**用途**: 快速生成符合项目规范的 uni-app 页面

**何时使用**:
- 需要创建新页面
- 需要配置页面路由
- 需要设置页面布局

**使用示例**:
```
你: "创建一个详情页"
Claude: 将生成页面文件并配置路由
```

**页面类型**:
- 主包页面 (`src/pages/`) - TabBar 页面
- 分包页面 (`src/subPages/`) - 普通页面
- ECharts 分包 (`src/subEcharts/`) - 图表页面

---

### 4. vue-composable-creator

**用途**: 创建 Vue 3 组合式函数

**何时使用**:
- 需要封装可复用逻辑
- 需要组合多个功能
- 需要简化组件代码

**使用示例**:
```
你: "创建一个处理表单验证的 composable"
Claude: 将生成 useFormValidation.ts
```

**命名规范**:
- 文件: `use{Name}.ts`
- 函数: `use{Name}`

---

### 5. wot-router-usage

**用途**: @wot-ui/router 路由库使用指南

**何时使用**:
- 需要页面跳转
- 需要传递参数
- 需要导航守卫

**核心 API**:
```typescript
const router = useRouter()
const route = useRoute()

// 导航
router.push({ name: 'detail' })
router.back()

// 参数
route.query.id
route.params.id
```

---

## 代码质量技能

### 6. code-review

**用途**: 自动代码审查和修复工具

**检查项目**:
- ❌ SCSS/CSS 模块使用
- ❌ console 语句
- ❌ any 类型
- ❌ 直接 API 调用（未使用 useRequest）
- ❌ 直接使用 uni.showToast
- ❌ 重复函数

**使用方式**:
```
你: "请审查 src/subPages/etf 目录"
Claude: 将扫描问题并自动修复
```

---

### 7. frontend-code-review

**用途**: 前端代码深度审查

**审查维度**:
- 代码质量
- 性能优化
- 业务逻辑

**使用方式**:
```
你: "审查前端代码质量"
Claude: 将生成详细的审查报告
```

---

## UI/设计技能

### 8. frontend-design

**用途**: 创建高质量、独特的前端界面

**设计原则**:
- **避免通用 AI 美学**: 不使用 Inter、Roboto、紫色渐变等
- **大胆的美学方向**: 选择明确的风格并执行
- **精致的细节**: 字体、颜色、动画、布局

**使用方式**:
```
你: "设计一个金融数据仪表盘"
Claude: 将创建独特的视觉设计和代码
```

---

### 9. global-feedback

**用途**: 全局反馈组件使用指南

**可用组件**:
| 组件 | Composable | 用途 |
|------|-----------|------|
| GlobalToast | `useGlobalToast()` | 轻提示 |
| GlobalMessage | `useGlobalMessage()` | 确认弹窗 |
| GlobalLoading | `useGlobalLoading()` | 加载状态 |

**使用示例**:
```typescript
const { success, error } = useGlobalToast()
success('操作成功')
error('操作失败')

const { confirm } = useGlobalMessage()
confirm({ title: '提示', msg: '确定删除？' })

const { show, hide } = useGlobalLoading()
show('加载中...')
hide()
```

---

## 工具类技能

### 10. skill-creator

**用途**: 创建新的 Claude Skill

**技能结构**:
```
skill-name/
├── SKILL.md (必需)
├── scripts/      # 可执行脚本
├── references/   # 参考文档
└── assets/       # 资源文件
```

**创建流程**:
1. 理解技能需求
2. 规划内容结构
3. 初始化技能 (`init_skill.py`)
4. 编辑技能内容
5. 打包技能 (`package_skill.py`)

---

### 11. wot-starter-init

**用途**: 从 wot-uni-starter 初始化新的 uni-app 项目

**何时使用**:
- 需要创建基于 wot-starter 的新项目
- 需要初始化项目的 Claude 配置
- 需要生成项目文档结构

**使用方式**:
```bash
node .claude/skills/wot-starter-init/scripts/init.js <project-name> [options]
```

**参数**:
| 参数 | 说明 | 必填 |
|------|------|------|
| `project-name` | 项目名称 | 是 |
| `--description` | 项目描述 | 否 |
| `--author` | 作者名称 | 否 |
| `--clean` | 是否清理示例代码 | 否，默认 true |

**示例**:
```bash
# 基础用法
node .claude/skills/wot-starter-init/scripts/init.js my-mini-app

# 带描述
node .claude/skills/wot-starter-init/scripts/init.js my-mini-app --description "我的小程序应用"
```

**生成的文件**:
- `CLAUDE.md` - 项目主配置文件
- `.claude/rules/project-info.md` - 项目信息
- `.claude/rules/tech-stack.md` - 技术栈说明
- `.claude/rules/ui-guidelines.md` - UI 指南

---

### 12. starter-cleaner

**用途**: 清理 wot-starter 模板项目

**清理内容**:
- `docs/` - 文档目录
- `src/subPages/` - 示例分包页面
- `src/subEcharts/` - ECharts 示例
- `src/pages.json` - 页面配置
- `pnpm-workspace.yaml` - Monorepo 配置

**使用方式**:
```bash
node .agent/skills/starter-cleaner/scripts/clean.js
```

⚠️ **警告**: 执行破坏性操作，请先提交代码！

---

## 技能使用技巧

### 1. 明确触发词

使用具体的关键词可以更准确地触发对应的技能：

| 触发词示例 | 触发技能 |
|-----------|---------|
| "创建 API"、"Mock 数据" | alova-api-module |
| "代码审查"、"检查代码质量" | code-review |
| "设计页面"、"创建 UI" | frontend-design |
| "创建页面"、"新建路由" | uni-page-generator |
| "路由跳转"、"页面导航" | wot-router-usage |
| "初始化项目"、"创建新项目" | wot-starter-init |

### 2. 组合使用技能

可以在一次对话中组合使用多个技能：

```
你: "帮我创建一个用户列表页面，包含 API 模块和 Store"
Claude: 将依次调用 uni-page-generator、alova-api-module、pinia-store-generator
```

### 3. 查看技能详情

每个技能的 SKILL.md 文件包含完整的使用说明和示例，可以随时查阅：

```bash
# 查看特定技能
cat .claude/skills/{skill-name}/SKILL.md

# 列出所有技能
ls .claude/skills/
```

---

## 常见问题

### Q: 如何知道使用了哪个技能？

A: Claude 会在响应中明确说明正在使用的技能。

### Q: 技能可以自定义吗？

A: 可以，使用 `skill-creator` 技能创建自定义技能。

### Q: 技能修改了代码但我想回滚？

A: 技能执行前建议先提交代码，或使用 `git diff` 查看修改后决定是否接受。

### Q: 多个技能可以同时使用吗？

A: 可以，Claude 会根据任务需要自动组合使用多个技能。

---

## 项目规范参考

技能遵循以下项目规范：

- **样式**: UnoCSS 原子化样式
- **状态管理**: Pinia
- **路由**: @wot-ui/router
- **请求**: Alova + useRequest
- **组件**: wot-design-uni

详细规范请参阅：
- `CLAUDE.md` - 项目概述
- `.claude/rules/ui-guidelines.md` - UI 指南
- `.claude/rules/tech-stack.md` - 技术栈
- `.claude/rules/project-info.md` - 项目信息

---

## 更新日志

| 日期 | 更新内容 |
|------|---------|
| 2025-01-29 | 创建技能使用手册 |
