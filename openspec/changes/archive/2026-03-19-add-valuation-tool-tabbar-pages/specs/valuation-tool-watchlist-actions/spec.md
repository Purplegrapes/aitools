## MODIFIED Requirements

### Requirement: Valuation Tool SHALL Provide Dedicated Watchlist Page
系统 SHALL 在 valuation-tool 下提供独立的自选基金列表页，并将该页面定义为 valuation-tool 产品域中的一级 tabbar 页面，不得直接跳转到 ETF 主工具页的 watchlist tab 代替。

#### Scenario: Navigate to watchlist from another valuation-tool first-level page
- **WHEN** 用户从估值首页或我的持仓通过 valuation-tool tabbar 进入自选页
- **THEN** 系统 SHALL 显示 valuation-tool 独立自选基金列表页
- **AND** 自选页对应 tab SHALL 处于激活状态

#### Scenario: Watchlist page shows empty state
- **WHEN** 用户尚未加入任何自选基金
- **THEN** 自选基金列表页 SHALL 展示空态提示
- **AND** 空态中 SHALL 保留 valuation-tool tabbar
- **AND** 用户 SHALL 能通过 tabbar 返回首页或切换到持仓页

## ADDED Requirements

### Requirement: Watchlist Page SHALL Persist Valuation Tool Tabbar
自选基金列表页 SHALL 持续展示与估值首页、我的持仓一致的 valuation-tool tabbar，并在不同数据状态下保持导航可用。

#### Scenario: Watchlist page renders with data
- **WHEN** 自选基金列表页成功获取基金列表
- **THEN** 页面底部 SHALL 持续显示 valuation-tool tabbar
- **AND** tabbar SHALL 不遮挡最后一个列表项或页面操作区

#### Scenario: Watchlist page renders with error
- **WHEN** 自选基金列表页请求失败或进入降级状态
- **THEN** 页面 SHALL 继续显示 valuation-tool tabbar
- **AND** 用户 SHALL 仍可切换到首页或持仓页，而不需要先返回上一级页面
