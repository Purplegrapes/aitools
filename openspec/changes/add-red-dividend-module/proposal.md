## Why

`docs/redline-mvp-api-backend.md` 和 `docs/design-mockup.html` 已经给出了红利风向标 MVP 的接口边界和页面草图，但仓库里还没有对应的 `red-dividend` 目录、路由页面和数据承载层。当前需要先把这组能力按项目规范落成可演示的模块，保证前端可以基于既定接口契约先用 mock 数据完成页面展示和交互串联，再平滑切到真实接口。

## What Changes

- 新增 `src/subPages/red-dividend` 模块，承载红利风向标首页、策略详情页和策略对比页。
- 基于文档定义补齐 `context`、`market-view`、`strategies/{categoryCode}`、`strategy-comparison` 四个接口对应的前端类型、Method 定义、mock 数据和数据归一化逻辑。
- 按设计稿实现首页推荐卡/其他策略卡、分类详情页指标与代表资产、对比页分红对比与环境映射三组核心页面结构。
- 增加模块内共享组件、路由辅助和本地文案常量，保证页面遵守项目现有 UnoCSS、语义色、rpx 和 `useRequest` 规范。
- 首版默认使用符合接口定义的 mock 数据驱动 UI 展示，并保留后续切换真实接口的清晰边界。

## Capabilities

### New Capabilities
- `red-dividend-module`: 提供红利风向标 MVP 模块，覆盖首页、分类详情页、策略对比页以及基于接口契约的 mock 数据展示能力。

### Modified Capabilities
- None.

## Impact

- 影响 `src/subPages` 下新增 `red-dividend` 目录的页面、组件、类型、mock、API 和工具函数组织方式。
- 需要补充页面路由与导航路径，使用户可以在模块内部完成首页、分类详情和对比页跳转。
- 需要新增面向 `categoryCode` 的领域模型、接口响应归一化规则和 mock 数据源。
- 需要在实现阶段遵守 `docs/alova-guidelines.md` 中的 Method / `useRequest` 约束，避免后续切换真实接口时重构调用方式。
