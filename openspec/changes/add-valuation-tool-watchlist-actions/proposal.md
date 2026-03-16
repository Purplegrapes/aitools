## Why

当前 `valuation-tool` 详情页只有内容展示，没有后续操作承接，用户看完基金解释后无法直接加入自选、回到自选列表继续比较，也没有统一的“基金扫雷”入口。现在需要把详情页补成完整的决策链路，并在 `valuation-tool` 内提供独立的自选基金列表页与专属自选接口。

## What Changes

- 在 `valuation-tool` 基金详情页底部新增固定操作栏，包含“加入自选 / 取消自选”“自选列表”“基金扫雷”三个操作入口。
- 在 `valuation-tool` 下新增独立的自选基金列表页，不复用现有 ETF 主工具页的 watchlist tab 和 watchlist 接口。
- 自选基金列表页展示基金名称、代码、是否已自选、当日涨幅，并支持从列表进入基金详情页。
- 基金详情页与自选列表页共享自选状态更新逻辑，保证加入或移除后两端展示一致。
- 为“基金扫雷”按钮定义统一跳转入口，并携带当前基金代码用于后续能力承接。
- 新增 valuation-tool 专属自选接口，至少覆盖自选增删、自选列表查询、当日涨幅支持三类能力。

## Capabilities

### New Capabilities
- `valuation-tool-watchlist-actions`: 为 valuation-tool 详情页增加底部操作栏，并提供独立自选基金列表页、专属自选接口与相关跳转、自选状态更新能力。

### Modified Capabilities

- None.

## Impact

- 受影响代码主要在 `src/subPages/etf/valuation-tool/**`、`src/subPages/etf/api/**`、路由生成文件与首页/详情页跳转逻辑。
- 需要新增 valuation-tool 专属自选接口定义，并接入自选增删、自选列表和当日涨幅相关契约。
- 需要新增 valuation-tool 子路由，以及详情页底部安全区/固定栏布局调整。
