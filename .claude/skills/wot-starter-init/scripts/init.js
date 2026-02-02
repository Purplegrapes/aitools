#!/usr/bin/env node
/**
 * Wot Starter Project Initializer
 *
 * Usage:
 *   node init.js <project-name> [options]
 *
 * Options:
 *   --description <desc>  Project description
 *   --author <name>       Author name
 *   --clean <boolean>     Whether to clean example code (default: true)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const params = {
    projectName: null,
    description: '',
    author: '',
    clean: true,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    switch (arg) {
      case '--description':
        params.description = args[++i]
        break
      case '--author':
        params.author = args[++i]
        break
      case '--clean':
        params.clean = args[++i] !== 'false'
        break
      default:
        if (!arg.startsWith('-')) {
          params.projectName = arg
        }
    }
  }

  return params
}

/**
 * Execute a shell command
 */
function exec(command, cwd) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ')
    const proc = spawn(cmd, args, { cwd, shell: true, stdio: 'inherit' })
    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })
  })
}

/**
 * Get template directory (wot-starter)
 */
function getTemplateDir() {
  // In a real implementation, this would clone from GitHub
  // For now, we assume the template is available locally
  // or we provide instructions for manual setup
  const scriptDir = path.dirname(__dirname)
  return path.join(scriptDir, 'assets', 'wot-starter-template')
}

/**
 * Create CLAUDE.md content
 */
function createClaudeMd(params) {
  const year = new Date().getFullYear()

  return `# ${params.projectName}

> ${params.description || '基于 wot-uni-starter 的 uni-app 项目'}

作者: ${params.author || 'Unknown'}
创建时间: ${year}

---
description: 项目基本信息、工作流和常用命令
globs: package.json, src/**/*
alwaysApply: true
---

# 项目信息与工作流

## 🚀 快速开始
- **开发**: \`pnpm dev\` (H5), \`pnpm dev:mp-weixin\` (微信小程序)。
- **构建**: \`pnpm build:h5\`, \`pnpm build:mp-weixin\`。
- **Lint**: \`pnpm lint:fix\`。
- **预览**: \`dist/\` 目录。

## 📂 目录结构概览
- \`src/pages\`: 应用视图 (基于文件的路由)。
- \`src/components\`: 可复用的 UI 组件。
- \`src/store\`: Pinia 状态管理模块。
- \`src/api\`: Alova.js API 定义。
- \`src/uni_modules\`: Uni-app 模块 (包含 wot-design-uni)。

## 🤝 Git 工作流
- **提交**: 符合 Conventional Commits 规范 (\`feat:\`, \`fix:\`, \`chore:\`, \`refactor:\`)。
- **主要工具**: \`commitizen\` (通过 \`pnpm commit\` 使用)。

## 🛠️ 代码生成
- **API**: 使用 \`pnpm alova-gen\` 重新生成 API 定义。
- **Skills**: 使用 \`.claude/skills\` 中的 skill 进行脚手架生成:
    - \`pinia-store-generator\`
    - \`uni-page-generator\`
    - \`alova-api-module\`

---
description: 核心技术栈、架构和代码规范
globs: src/store/**/*, src/api/**/*, src/router/**/*, src/pages/**/*, pages.config.ts, alova.config.ts
alwaysApply: false
---

# 技术栈与架构

## 🏗️ 架构概览
本项目采用分层架构：
- **表现层**: \`src/pages\` (视图) + \`src/components\` (UI 逻辑)
- **状态层**: \`src/store\` (Pinia)
- **数据层**: \`src/api\` (Alova.js)

## 📦 状态管理 (Pinia)
- **库**: Pinia
- **持久化**: 使用 \`src/store/persist.ts\` 进行本地存储。
- **模式**: 详见 \`pinia-store-generator\` skill。
- **规则**: 始终使用 \`defineStore\` 并遵循 \`use{Name}Store\` 的命名规范。
- **Skill**: 使用 **\`pinia-store-generator\`** 快速创建新的 store。

## 🌐 API 层 (Alova.js)
- **库**: Alova.js
- **结构**:
    - \`src/api/core\`: 拦截器和实例配置。
    - \`src/api/apiDefinitions.ts\`: 自动生成的 API 定义。
- **Mock**: 支持在 \`src/api/mock\` 中编写 Mock 数据。
- **Skill**: 使用 **\`alova-api-module\`** 创建新的 API 模块和 Mock 数据。

## 🛣️ 路由
- **库**: \`@wot-ui/router\` (API) + \`vite-plugin-uni-pages\` (文件系统路由)
- **配置**: \`pages.config.ts\` 控制 \`pages.json\` 的生成。
- **导航**: 使用 \`useRouter()\` 进行 push/replace/back 操作。
- **Skill**: 参考 **\`wot-router-usage\`** 了解导航模式和守卫用法。
- **Skill**: 使用 **\`uni-page-generator\`** 创建带路由配置的新页面。

---
description: UI/UX 指南、样式规范和组件使用
globs: **/*.vue, **/*.scss, src/components/**/*, src/uni_modules/**/*, uno.config.ts
alwaysApply: false
---

# UI 与样式指南

## 🎨 样式系统
- **引擎**: UnoCSS (原子化 CSS) 是**首选**的样式方案。
- **配置**: \`uno.config.ts\`。
- **预处理**: SCSS 用于复杂的组件样式（极少需要）。
- **主题**: 通过 \`src/theme.json\` 和 CSS 变量支持亮色/暗色模式切换。

### UnoCSS 约定
- 使用工具类: \`flex\`, \`items-center\`, \`text-primary\`, \`m-4\`.
- 响应式前缀: \`sm:\`, \`md:\` (在移动端优先的 uni-app 中较少使用)。
- 图标: 通过 UnoCSS preset 使用 \`i-carbon-{icon-name}\`。

## 🧩 组件库
- **核心库**: \`wot-design-uni\` (\`wd-\` 前缀)。
- **文档**: [wot-design-uni](https://wot-ui.cn)。
- **自定义组件**: 在 \`src/components\` 中创建。

## 📢 全局反馈
- **Toast/Message**: 请勿直接使用 \`uni.showToast\`。
- **标准**: 使用 \`GlobalToast\`, \`GlobalMessage\`, \`GlobalLoading\` 组件。
- **Skill**: 参考 **\`global-feedback\`** skill 查看使用示例。

## 📱 布局
- **系统**: \`vite-plugin-uni-layouts\`。
- **默认**: \`src/layouts/default.vue\`。
- **TabBar**: \`src/layouts/tabbar.vue\`。
`
}

/**
 * Create project-info.md
 */
function createProjectInfoMd(params) {
  return `# 项目信息与工作流

## 🚀 快速开始
- **开发**: \`pnpm dev\` (H5), \`pnpm dev:mp-weixin\` (微信小程序)。
- **构建**: \`pnpm build:h5\`, \`pnpm build:mp-weixin\`。
- **Lint**: \`pnpm lint:fix\`。
- **预览**: \`dist/\` 目录。

## 📂 目录结构概览
- \`src/pages\`: 应用视图 (基于文件的路由)。
- \`src/components\`: 可复用的 UI 组件。
- \`src/store\`: Pinia 状态管理模块。
- \`src/api\`: Alova.js API 定义。
- \`src/uni_modules\`: Uni-app 模块 (包含 wot-design-uni)。

## 🤝 Git 工作流
- **提交**: 符合 Conventional Commits 规范 (\`feat:\`, \`fix:\`, \`chore:\`, \`refactor:\`)。
- **主要工具**: \`commitizen\` (通过 \`pnpm commit\` 使用)。

## 🛠️ 代码生成
- **API**: 使用 \`pnpm alova-gen\` 重新生成 API 定义。
- **Skills**: 使用 \`.claude/skills\` 中的 skill 进行脚手架生成:
    - \`pinia-store-generator\`
    - \`uni-page-generator\`
    - \`alova-api-module\`
`
}

/**
 * Create tech-stack.md
 */
function createTechStackMd() {
  return `# 技术栈与架构

## 🏗️ 架构概览
本项目采用分层架构：
- **表现层**: \`src/pages\` (视图) + \`src/components\` (UI 逻辑)
- **状态层**: \`src/store\` (Pinia)
- **数据层**: \`src/api\` (Alova.js)

## 📦 状态管理 (Pinia)
- **库**: Pinia
- **持久化**: 使用 \`src/store/persist.ts\` 进行本地存储。
- **模式**: 详见 \`pinia-store-generator\` skill。
- **规则**: 始终使用 \`defineStore\` 并遵循 \`use{Name}Store\` 的命名规范。
- **Skill**: 使用 **\`pinia-store-generator\`** 快速创建新的 store。

## 🌐 API 层 (Alova.js)
- **库**: Alova.js
- **结构**:
    - \`src/api/core\`: 拦截器和实例配置。
    - \`src/api/apiDefinitions.ts\`: 自动生成的 API 定义。
- **Mock**: 支持在 \`src/api/mock\` 中编写 Mock 数据。
- **Skill**: 使用 **\`alova-api-module\`** 创建新的 API 模块和 Mock 数据。

## 🛣️ 路由
- **库**: \`@wot-ui/router\` (API) + \`vite-plugin-uni-pages\` (文件系统路由)
- **配置**: \`pages.config.ts\` 控制 \`pages.json\` 的生成。
- **导航**: 使用 \`useRouter()\` 进行 push/replace/back 操作。
- **Skill**: 参考 **\`wot-router-usage\`** 了解导航模式和守卫用法。
- **Skill**: 使用 **\`uni-page-generator\`** 创建带路由配置的新页面。
`
}

/**
 * Create ui-guidelines.md
 */
function createUiGuidelinesMd() {
  return `# UI 与样式指南

## 🎨 样式系统
- **引擎**: UnoCSS (原子化 CSS) 是**首选**的样式方案。
- **配置**: \`uno.config.ts\`。
- **预处理**: SCSS 用于复杂的组件样式（极少需要）。
- **主题**: 通过 \`src/theme.json\` 和 CSS 变量支持亮色/暗色模式切换。

### UnoCSS 约定
- 使用工具类: \`flex\`, \`items-center\`, \`text-primary\`, \`m-4\`.
- 响应式前缀: \`sm:\`, \`md:\` (在移动端优先的 uni-app 中较少使用)。
- 图标: 通过 UnoCSS preset 使用 \`i-carbon-{icon-name}\`。

## 🧩 组件库
- **核心库**: \`wot-design-uni\` (\`wd-\` 前缀)。
- **文档**: [wot-design-uni](https://wot-ui.cn)。
- **自定义组件**: 在 \`src/components\` 中创建。

## 📢 全局反馈
- **Toast/Message**: 请勿直接使用 \`uni.showToast\`。
- **标准**: 使用 \`GlobalToast\`, \`GlobalMessage\`, \`GlobalLoading\` 组件。
- **Skill**: 参考 **\`global-feedback\`** skill 查看使用示例。

## 📱 布局
- **系统**: \`vite-plugin-uni-layouts\`。
- **默认**: \`src/layouts/default.vue\`。
- **TabBar**: \`src/layouts/tabbar.vue\`。
`
}

/**
 * Main initialization function
 */
async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.projectName) {
    console.error('❌ Error: project-name is required')
    console.log('\nUsage: node init.js <project-name> [options]')
    console.log('\nOptions:')
    console.log('  --description <desc>  Project description')
    console.log('  --author <name>       Author name')
    console.log('  --clean <boolean>     Whether to clean example code (default: true)')
    process.exit(1)
  }

  const projectDir = path.join(process.cwd(), args.projectName)

  // Check if directory already exists
  if (fs.existsSync(projectDir)) {
    console.error(`❌ Error: Directory already exists: ${projectDir}`)
    process.exit(1)
  }

  console.log(`🚀 Initializing project: ${args.projectName}`)
  console.log(`   Location: ${projectDir}`)
  console.log()

  // Create project directory
  fs.mkdirSync(projectDir, { recursive: true })
  console.log('✅ Created project directory')

  // Clone wot-starter template
  console.log('📥 Cloning wot-starter template...')
  try {
    await exec(`git clone --depth=1 https://github.com/wot-ui/wot-starter.git ${args.projectName}`)
    console.log('✅ Cloned template')

    // Remove .git folder
    const gitDir = path.join(projectDir, '.git')
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true })
      console.log('✅ Removed .git folder')
    }

    // Clean example code if requested
    if (args.clean) {
      console.log('🧹 Cleaning example code...')

      const pathsToRemove = [
        'docs',
        'src/subAsyncEcharts',
        'src/subEcharts',
        'src/subPages',
        'src/pages.json',
        'pnpm-workspace.yaml',
      ]

      pathsToRemove.forEach((p) => {
        const fullPath = path.join(projectDir, p)
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true })
        }
      })

      // Update vite.config.ts to remove subPackages references
      const viteConfigPath = path.join(projectDir, 'vite.config.ts')
      if (fs.existsSync(viteConfigPath)) {
        let content = fs.readFileSync(viteConfigPath, 'utf-8')
        content = content.replace(/subPackages:\s*\[[\s\S]*?\]/, 'subPackages: []')
        fs.writeFileSync(viteConfigPath, content, 'utf-8')
      }

      // Update package.json to remove docs scripts
      const packageJsonPath = path.join(projectDir, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        if (pkg.scripts) {
          Object.keys(pkg.scripts).forEach((key) => {
            if (key.startsWith('docs:')) {
              delete pkg.scripts[key]
            }
          })
        }
        // Update project name
        pkg.name = args.projectName
        pkg.description = args.description || ''
        if (args.author) {
          pkg.author = args.author
        }
        fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
      }

      console.log('✅ Cleaned example code')
    }
  }
  catch (error) {
    console.error('❌ Error cloning template:', error.message)
    console.log('\n💡 Tip: You can manually clone the template:')
    console.log(`   git clone --depth=1 https://github.com/wot-ui/wot-starter.git ${args.projectName}`)
    console.log(`   cd ${args.projectName}`)
    console.log('   rm -rf .git')
    process.exit(1)
  }

  // Create .claude directory structure
  console.log('📝 Creating CLAUDE.md and rules...')
  const claudeDir = path.join(projectDir, '.claude')
  const rulesDir = path.join(claudeDir, 'rules')
  fs.mkdirSync(rulesDir, { recursive: true })

  // Write CLAUDE.md
  fs.writeFileSync(path.join(projectDir, 'CLAUDE.md'), createClaudeMd(args), 'utf-8')
  console.log('✅ Created CLAUDE.md')

  // Write rule files
  fs.writeFileSync(path.join(rulesDir, 'project-info.md'), createProjectInfoMd(args), 'utf-8')
  fs.writeFileSync(path.join(rulesDir, 'tech-stack.md'), createTechStackMd(), 'utf-8')
  fs.writeFileSync(path.join(rulesDir, 'ui-guidelines.md'), createUiGuidelinesMd(), 'utf-8')
  console.log('✅ Created .claude/rules/')

  console.log()
  console.log('✅ Project initialized successfully!')
  console.log()
  console.log('Next steps:')
  console.log(`  cd ${args.projectName}`)
  console.log('  pnpm install')
  console.log('  pnpm dev')
  console.log()
  console.log('For more information, see CLAUDE.md')
}

main().catch((error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
