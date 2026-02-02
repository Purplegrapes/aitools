---
name: wot-starter-init
description: 从 wot-uni-starter 初始化新的 uni-app 项目并生成配套的 CLAUDE.md 项目配置文件。使用此技能当用户需要：(1) 创建基于 wot-starter 的新项目，(2) 初始化项目的 Claude 配置，(3) 生成项目文档结构。
---

# Wot Starter Init

该技能用于从 [Wot Starter](https://starter.wot-ui.cn) 初始化新的 uni-app 项目，并自动生成配套的 `CLAUDE.md` 配置文件。

## 功能说明

1. **项目初始化**:
   - 从 wot-uni-starter 克隆模板
   - 清理示例代码和文档
   - 配置项目名称和基础信息

2. **CLAUDE.md 生成**:
   - 生成项目概述文档
   - 配置技术栈说明
   - 设置 UI 指南
   - 定义项目规范

## 使用方法

运行初始化脚本：

```bash
node .claude/skills/wot-starter-init/scripts/init.js <project-name> [options]
```

### 参数

| 参数 | 说明 | 必填 |
|------|------|------|
| `project-name` | 项目名称 | 是 |
| `--description` | 项目描述 | 否 |
| `--author` | 作者名称 | 否 |
| `--clean` | 是否清理示例代码 | 否，默认 true |

### 示例

```bash
# 基础用法
node .claude/skills/wot-starter-init/scripts/init.js my-mini-app

# 带描述
node .claude/skills/wot-starter-init/scripts/init.js my-mini-app --description "我的小程序应用"

# 保留示例代码
node .claude/skills/wot-starter-init/scripts/init.js my-mini-app --clean false
```

## 生成的文件结构

```
project-name/
├── CLAUDE.md                 # 项目主配置文件
├── .claude/
│   └── rules/
│       ├── project-info.md   # 项目信息
│       ├── tech-stack.md     # 技术栈说明
│       └── ui-guidelines.md  # UI 指南
├── src/
│   ├── api/                  # API 层 (Alova)
│   ├── components/           # 组件
│   ├── pages/                # 页面
│   ├── store/                # 状态管理 (Pinia)
│   └── uni_modules/          # uni-app 模块
└── ... (wot-starter 其他文件)
```

## 模板变量

CLAUDE.md 模板中支持以下变量：

| 变量 | 说明 |
|------|------|
| `{PROJECT_NAME}` | 项目名称 |
| `{DESCRIPTION}` | 项目描述 |
| `{AUTHOR}` | 作者 |
| `{YEAR}` | 当前年份 |

## 技术栈

生成的项目基于以下技术栈：

- **框架**: uni-app + Vue 3
- **构建**: Vite
- **组件库**: wot-design-uni
- **状态管理**: Pinia
- **路由**: @wot-ui/router
- **请求**: Alova
- **样式**: UnoCSS
- **CI**: uni-mini-ci

## 注意事项

> [!WARNING]
> 该脚本会在当前目录创建新项目文件夹。如果同名文件夹已存在，操作将中止。

> [!NOTE]
> 初始化完成后，请运行 `pnpm install` 安装依赖。
