## Why

当前 ETF / 基金工具已经能帮助用户理解单只基金和自选表现，但还缺少一个面向普通基金用户的“我的持仓”视角。用户需要在进入页面后的几秒内知道自己整体是赚是亏、今天大概赚了还是亏了，以及当前最值得继续关注哪只基金。

## What Changes

- 新增“我的持仓”模块，覆盖空状态、添加持仓、持仓总览、编辑持仓、上传持仓预留、骨架屏和数据缺失态。
- 在持仓总览页提供累计收益、累计收益率、今日盈亏（盘中参考）、当前总市值、持仓基金数等核心摘要，并附带轻量观察建议。
- 提供手动添加、编辑、删除持仓的基础流程，并为上传持仓保留首版入口和占位页。
- 为持仓列表沉淀适合移动端的高保真组件规范，包括总览卡、观察建议卡、单只基金卡、空状态、表单、底部操作栏和数据缺失卡。
- 修改估值工具首页入口体验，使“我的持仓”作为稳定入口之一出现在首页底部操作区。

## Capabilities

### New Capabilities
- `my-portfolio`: 面向普通基金用户的轻量持仓收益查看模块，覆盖持仓录入、收益总览、观察建议、状态页和组件规范。

### Modified Capabilities
- `etf-valuation-tool`: 首页 requirement 需要增加“我的持仓”入口，使用户可以从估值工具首页直接进入持仓模块。

## Impact

- 影响 `src/subPages/valuation-tool` 下的页面路由、页面布局、底部入口和新增持仓子页面。
- 需要新增持仓数据模型、录入/编辑交互、组合摘要计算和估值缺失降级规则。
- 需要补充或预留持仓相关 API / mock / docs，包括基金搜索联想、持仓保存、上传入口说明和组合收益聚合字段。
- 影响移动端 UI 组件体系，需要沉淀可复用的 PortfolioSummaryCard、PositionInsightCard、PositionFundCard、AddPositionForm、EditPositionSheet、UploadPositionCard、DataUnavailableCard、SkeletonBlock、BottomActionBar 等样式规范。
