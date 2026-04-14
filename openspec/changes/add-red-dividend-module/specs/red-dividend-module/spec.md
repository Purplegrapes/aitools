## ADDED Requirements

### Requirement: Red Dividend module SHALL Provide a Dedicated Home Page
系统 SHALL 提供红利风向标首页，并基于公共 `context` 与首页状态接口展示当前市场判断、本期推荐策略、其他策略和进入对比页的明确入口。

#### Scenario: User opens red dividend home page
- **WHEN** 用户进入红利风向标首页
- **THEN** 系统 SHALL 展示顶部简介文案与当前市场摘要
- **AND** 系统 SHALL 根据 `matchedCategoryCode` 渲染唯一的“本期推荐”策略卡
- **AND** 系统 SHALL 将其余分类展示为“其他策略”列表
- **AND** 页面 SHALL 提供进入策略对比页的 CTA

#### Scenario: Home page derives recommendation from context and market view
- **WHEN** 首页同时取得 `context.categories` 与 `market-view.matchedCategoryCode`
- **THEN** 系统 SHALL 使用 `matchedCategoryCode` 在 `categories` 中匹配推荐策略
- **AND** 系统 SHALL 从 `categories` 中排除当前推荐项后生成其他策略列表
- **AND** 系统 SHALL 不依赖未在接口文档中声明的冗余字段

#### Scenario: Home page data is unavailable
- **WHEN** 首页请求失败或未返回可用数据
- **THEN** 系统 SHALL 使用与接口结构一致的 mock / fallback 数据继续完成页面展示
- **AND** 页面 SHALL 保持首页、分类页和对比页的导航可用

### Requirement: Red Dividend module SHALL Support Category Detail Navigation
系统 SHALL 提供按 `categoryCode` 路由的策略详情页，并展示当前分类头图、分类标签、分红指标摘要和代表资产列表。

#### Scenario: User opens a category detail page
- **WHEN** 用户进入某个合法 `categoryCode` 的策略详情页
- **THEN** 系统 SHALL 展示该分类的名称、分类描述、标签和当前匹配标识（如适用）
- **AND** 页面 SHALL 展示“投入 10 万，一年分红预估”指标区
- **AND** 页面 SHALL 展示策略属性、波动感受、适配环境三个摘要属性
- **AND** 页面 SHALL 展示该分类的代表资产列表

#### Scenario: User switches between categories
- **WHEN** 用户在详情页点击其他分类标签或分段切换项
- **THEN** 系统 SHALL 跳转到对应 `categoryCode` 的详情页路由
- **AND** 页面 SHALL 使用相同的布局结构渲染目标分类内容

#### Scenario: Category code is invalid or missing
- **WHEN** 用户访问未知的 `categoryCode`
- **THEN** 系统 SHALL 回退到默认合法分类或给出稳定的降级处理
- **AND** 页面 SHALL 不出现空白页或运行时错误

### Requirement: Red Dividend module SHALL Provide Strategy Comparison View
系统 SHALL 提供策略对比页，并同时展示三类策略的分红对比、环境映射和当前匹配分类解释。

#### Scenario: User opens comparison page
- **WHEN** 用户进入策略对比页
- **THEN** 系统 SHALL 展示三类策略的分红预估对比区
- **AND** 页面 SHALL 展示环境映射坐标区域与当前匹配分类高亮
- **AND** 页面 SHALL 展示当前分类的解释摘要与原因点列表

#### Scenario: Comparison page uses context to enrich comparison data
- **WHEN** 对比页取得 `strategy-comparison` 与 `context.categories`
- **THEN** 系统 SHALL 使用 `categoryCode` 将分类名称补齐到分红对比项和映射节点
- **AND** 页面 SHALL 只以 `matchedCategoryCode` 作为当前高亮分类来源

#### Scenario: User reads the current matched explanation
- **WHEN** 对比页存在 `matchedCategoryCode`
- **THEN** 系统 SHALL 优先展示该分类对应的解释摘要
- **AND** 页面 SHALL 以解释性语言展示原因点
- **AND** 页面 SHALL 不输出买卖建议或收益承诺式表述

### Requirement: Red Dividend module SHALL Use Mock-First Contract-Aligned Data Flow
系统 SHALL 在真实接口未接入前，先以符合接口定义的 mock 数据驱动页面，同时保持 API 模块、类型定义和页面调用方式与正式接口契约一致。

#### Scenario: Page requests module data
- **WHEN** 首页、详情页或对比页初始化
- **THEN** 页面 SHALL 通过 API 模块创建的 Method 发起数据请求
- **AND** 页面 SHALL 通过 `useRequest` 或等价项目规范方式读取 `loading`、`error` 与 `data`

#### Scenario: Mock data is used as fallback
- **WHEN** 真实接口暂未接入、请求失败或环境中没有可用响应
- **THEN** 系统 SHALL 使用本地 mock 数据补足页面所需内容
- **AND** mock 数据结构 SHALL 与文档中的接口字段保持一致
- **AND** 后续切换真实接口时 SHALL 不需要重写页面核心视图结构

### Requirement: Red Dividend module SHALL Follow Project Mobile UI Rules
系统 SHALL 按项目现有移动端规范实现红利风向标页面，保证页面在 H5 与小程序环境下保持一致的轻量金融阅读体验。

#### Scenario: Mobile page layout is rendered
- **WHEN** 用户在移动端访问首页、详情页或对比页
- **THEN** 页面 SHALL 使用浅色背景、卡片式布局、`rpx` 尺寸和项目语义色 token
- **AND** 页面 SHALL 保持清晰的主次信息层级
- **AND** 页面 SHALL 不依赖大字号、零散色值或桌面端表格式布局

#### Scenario: Important values are emphasized
- **WHEN** 页面展示推荐策略、分红预估、环境映射与解释文案
- **THEN** 系统 SHALL 优先突出当前市场判断、推荐分类、关键指标和解释结论
- **AND** 次级说明文案 SHALL 保持可见但弱化处理
