## Why

当前宝倍估值首页、自选基金、我的持仓分别通过页面内按钮和普通跳转互相连接，用户一旦进入任一页面，就失去了稳定的一层导航，来回切换成本高。随着自选和持仓已经成为估值工具的核心入口，现在需要把这三个页面升级为同一产品域下的常驻 tabbar 页面，形成更稳定的一层信息架构。

## What Changes

- 将宝倍估值首页、自选基金、我的持仓定义为估值工具内的三个一级 tabbar 页面，并在三个页面底部持续展示统一 tabbar。
- 调整三个页面之间的导航方式，一级页面之间通过 tab 切换，避免依赖页面内临时按钮或普通路由跳转返回主页面。
- 明确二级页面边界，搜索页、详情页、编辑页、同步页等非一级页面不展示该 tabbar，并能从 tabbar 页面稳定进入和返回。
- 复用或扩展现有自定义 tabbar 机制，使估值工具拥有独立于应用主首页 tabbar 的导航配置与激活状态。
- 梳理首页底部操作区与自选/持仓入口的职责，避免与新 tabbar 产生重复导航。

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `etf-valuation-tool`: 将宝倍估值首页升级为估值工具 tabbar 体系中的一级页面，并要求首页与同域一级页面共享常驻 tabbar 导航。
- `my-portfolio`: 将“我的持仓”升级为估值工具 tabbar 体系中的一级页面，并要求用户在持仓页可通过常驻 tabbar 切换回首页与自选页。
- `valuation-tool-watchlist-actions`: 将自选基金页升级为估值工具 tabbar 体系中的一级页面，并要求页面在一级导航语境下持续可达。

## Impact

- Affected code: `pages.config.ts`, `src/layouts/tabbar.vue`, `src/composables/useTabbar.ts`, `src/subPages/valuation-tool/index.vue`, `src/subPages/valuation-tool/watchlist.vue`, `src/subPages/valuation-tool/holdings.vue`, 以及相关导航工具函数和次级页面跳转逻辑。
- Affected UX: 宝倍估值产品内的一层导航结构、底部操作区职责、一级页面切换方式。
- Dependencies: 依赖现有自定义 tabbar layout 机制支持多套 tabbar 配置或估值工具专属 tab 定义。
