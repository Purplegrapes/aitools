## Context

当前仓库已经有 `valuation-tool`、`etf`、`tools` 等子包页面模式，但还没有承载红利风向标的独立子模块。`docs/redline-mvp-api-backend.md` 明确了 1 个公共基础接口和 3 个页面状态接口，`docs/design-mockup.html` 则给出了首页、分类详情页、策略对比页的视觉结构，因此这次变更本质上是一个“新子包模块 + 接口契约先行 + mock 优先展示”的实现准备。

约束主要来自三方面：

- 项目要求页面使用 UnoCSS、语义色和 `rpx` 单位，避免零散色值和过大的字号。
- API 层必须遵守 `docs/alova-guidelines.md`，只在 API 模块中创建 Method，在页面中通过 `useRequest` 读取状态。
- 首版必须先按接口定义完成 mock 展示，因此数据模型、归一化逻辑和 mock 响应结构需要与未来真实接口尽量同构，避免二次返工。

## Goals / Non-Goals

**Goals:**

- 新增 `src/subPages/red-dividend` 模块，并形成首页、策略详情页、策略对比页三个核心页面。
- 定义完整的红利风向标领域模型，包括 `categoryCode`、公共 `context`、首页状态、分类详情状态和对比页状态。
- 以 mock 数据先驱动页面，且页面调用方式仍保持真实接口形态，便于后续无缝切换。
- 将设计稿中的推荐卡、分类横向切换、代表资产列表、分红对比卡和环境映射图拆成可复用组件。
- 保持模块内导航和数据流清晰，让首页与详情页共享 `context.categories`，减少静态文案重复。

**Non-Goals:**

- 本次设计不覆盖真实后端联调、缓存优化或线上埋点方案。
- 不在本次变更中扩展到第四类策略或引入复杂图表库。
- 不做模块外入口改造，除非实现阶段发现必须补充一个最小入口页面。
- 不引入新的状态管理库，模块状态优先使用页面级 `useRequest` 与纯函数归一化。

## Decisions

### 1. 使用独立子包目录 `src/subPages/red-dividend` 承载全部页面与模块资源

- 决策：在 `src/subPages/red-dividend` 下按 `index.vue`、`category.vue`、`comparison.vue`、`api/`、`components/`、`mock.ts`、`types.ts`、`utils.ts` 组织模块。
- 原因：这与现有 `valuation-tool`、`tools` 的结构一致，页面、组件、数据契约聚合清晰，便于后续继续扩展。
- 备选方案：
  - 混入 `src/subPages/tools`：会让页面语义混乱，难以沉淀领域模型。
  - 直接放主包 `src/pages`：不符合现有工具模块集中在子包下的组织方式。

### 2. API 模块保持真实接口签名，页面层通过 fallback mock 完成首版展示

- 决策：在 `api/index.ts` 中定义四个 `alovaInstance.Get` Method；页面层用 `useRequest` 读取请求状态，并在 `onError` 或响应缺失时回落到 `mock.ts` 中的标准化数据。
- 原因：这样能同时满足“先按接口定义展示 mock”和“后续切真实接口无需重写页面调用”的要求。
- 备选方案：
  - 页面直接读本地 mock 常量：实现快，但后续切接口时需要整体重构数据获取流程。
  - API 层直接返回 mock Promise：会混淆 Method 边界，不符合现有 alova 规范。

### 3. 以 `context` 为共享静态源，其他页面状态接口只返回动态值

- 决策：首页、详情页、对比页都先读取 `context`，然后分别叠加 `market-view`、`strategies/{categoryCode}`、`strategy-comparison` 的页面态数据；分类名称、标签、封面图、分区名称等优先从 `context` 派生。
- 原因：这正是后端文档定义的“前端拼装原则”，能够减少重复文案并保持多页面一致性。
- 备选方案：
  - 每个页面接口都返回完整展示文案：会造成冗余，且与文档契约不一致。

### 4. 详情页采用“横向分类切换 + 当前分类大卡 + 代表资产列表”的组合结构

- 决策：`category.vue` 使用一个分类 banner、一个分类切换栏、一张指标摘要卡和一个代表资产列表区；切换分类时通过路由更新 `categoryCode`，避免仅做本地 tab 状态。
- 原因：设计稿已经隐含了三个分类之间的平级导航关系，路由化后可直达、可分享、可刷新恢复。
- 备选方案：
  - 单页 tab 内切换不改路由：用户刷新后丢失上下文，也不利于未来外部直链。

### 5. 对比页的环境映射使用静态容器 + 数据驱动节点定位，不引入图表依赖

- 决策：环境映射区域用普通视图节点和绝对定位渲染区块、坐标标签和分类节点，节点位置由 `xValue` / `yValue` 百分比映射。
- 原因：需求只有 3 个点位和 3 个区块，手写布局更稳定，也更符合 uni-app 多端页面的轻量约束。
- 备选方案：
  - 引入图表或 canvas 方案：复杂度过高，且对 MVP 来说没有必要。

### 6. 共享组件优先围绕视觉区块而非接口字段命名

- 决策：组件建议拆为 `MarketSummaryStrip`、`StrategyHeroCard`、`StrategyPosterCard`、`CategoryBannerCard`、`CategorySegmentedTabs`、`DividendMetricCard`、`AssetListCard`、`DividendCompareCard`、`EnvironmentMappingCard`、`ExplanationCard` 等。
- 原因：组件按页面视觉区块抽象，更利于页面拼装和样式复用；字段映射交给页面层或 normalizer 处理。
- 备选方案：
  - 一个接口对应一个大组件：可读性和复用性都较差。

## Risks / Trade-offs

- [真实接口暂未接入] → 保持 Method 签名、响应类型和 mock 结构一致，减少后续切换成本。
- [`context` 与页面态拼装逻辑分散] → 在 `utils.ts` 中集中提供 `findCategoryByCode`、`buildRecommendedStrategies`、`mergeComparisonExplanations` 等纯函数，避免页面里散落拼装。
- [设计稿存在静态色值与项目语义 token 不一致] → 视觉实现以项目 token 为准，只保留设计稿的信息层次与排版节奏。
- [对比页定位布局在小屏设备上易拥挤] → 环境映射文案和节点尺寸保持克制，并通过最小宽度与换行规则保证可读性。
- [模块初始没有真实入口] → 在实现阶段优先保证模块内部页面可独立访问，若需要外部入口再补最小跳转点。

## Migration Plan

- 第一步：新增 OpenSpec capability 与 spec，锁定模块边界、页面要求和 mock 优先策略。
- 第二步：实现时创建 `red-dividend` 目录、类型、mock、API Method 和页面路由骨架。
- 第三步：优先用 mock 数据打通首页、详情页、对比页的展示和跳转，再收敛样式细节。
- 第四步：真实接口可用后，仅替换 fallback 策略或响应映射，不改页面结构和核心组件契约。
- 回滚策略：如果模块实现未完成，只需移除新增 `red-dividend` 路由页面及其入口，不影响现有子包能力。

## Open Questions

- 模块是否需要在现有首页或其他工具页增加显式入口，目前需求没有强制说明，实现时可先保证直达路径可用。
- 真实接口返回是否包裹统一 `ApiEnvelope`，还是直接返回文档中的对象体，需要在接入后端前最终确认。
- 详情页代表资产是否固定展示全部列表还是只展示前几条，设计稿与文档暂未要求分页，首版可直接完整展示。
