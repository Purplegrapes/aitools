## 1. Module Skeleton

- [x] 1.1 创建 `src/subPages/red-dividend` 目录结构，包括页面、组件、API、类型、mock 和工具函数文件骨架。
- [x] 1.2 为首页、分类详情页、策略对比页补齐路由命名、页面基础 `definePage` 配置和模块内导航路径工具。

## 2. Data Contract and Mock Layer

- [x] 2.1 定义 `categoryCode`、`context`、`market-view`、`strategies/{categoryCode}`、`strategy-comparison` 的 TypeScript 类型。
- [x] 2.2 在 API 模块中新增四个符合文档契约的 alova Method，并保持参数与路径签名可直接切换真实接口。
- [x] 2.3 按接口定义补齐模块 mock 数据与 fallback 响应，覆盖三类策略、首页状态、分类详情状态和对比页状态。
- [x] 2.4 在 `utils.ts` 中实现 `context` 拼装纯函数，包括推荐策略匹配、分类查找、对比页解释合并和非法 `categoryCode` 降级。

## 3. Page Implementation

- [x] 3.1 实现红利风向标首页，展示简介文案、市场摘要、本期推荐、其他策略和进入对比页的 CTA。
- [x] 3.2 实现策略详情页，展示分类头图、标签、分段切换、分红指标摘要和代表资产列表。
- [x] 3.3 实现策略对比页，展示分红对比卡、环境映射区域和当前匹配分类解释卡。
- [x] 3.4 处理页面初始化、切换分类和跳转场景，确保首页、详情页、对比页之间能稳定互通。

## 4. Component and UI Polish

- [x] 4.1 抽离首页所需组件，如市场摘要条、推荐策略卡、其他策略卡和通用 CTA 卡。
- [x] 4.2 抽离详情页与对比页所需组件，如分类头图卡、分类切换栏、指标卡、资产列表卡、环境映射卡和解释卡。
- [x] 4.3 统一模块视觉样式，确保使用项目语义色、`rpx` 尺寸、轻量金融卡片布局，并避免任意值字号与零散色值。

## 5. Resilience and Verification

- [x] 5.1 为三个页面补齐加载态、接口失败 fallback 和非法分类路由降级处理，保证首版 mock 可稳定展示。
- [x] 5.2 自查页面实现是否符合 `docs/redline-mvp-api-backend.md` 的字段契约与前端拼装规则。
- [x] 5.3 运行与本次改动相关的静态检查或最小验证命令，确认 API 调用模式、页面编译和样式规范无明显回归。
