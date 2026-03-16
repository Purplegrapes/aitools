## ADDED Requirements

### Requirement: Valuation Tool Detail Page SHALL Provide Bottom Actions
The valuation-tool 基金详情页 SHALL 在页面底部提供固定操作栏，包含加入自选、自选列表、基金扫雷三个可点击操作，并在存在安全区时保持正文内容不被遮挡。

#### Scenario: Detail page renders action bar
- **WHEN** 用户进入任一基金详情页且详情数据可展示
- **THEN** 页面底部 SHALL 展示固定操作栏
- **AND** 操作栏 SHALL 包含“加入自选/取消自选”“自选列表”“基金扫雷”三个按钮

#### Scenario: Action bar respects current watchlist state
- **WHEN** 当前基金已在用户自选列表中
- **THEN** “加入自选”按钮 SHALL 切换为“取消自选”或等价的移除状态文案

#### Scenario: Action bar does not cover content
- **WHEN** 用户滚动到详情页底部
- **THEN** 最后一段正文和免责声明 SHALL 完整可见
- **AND** 页面 SHALL 不出现因底部栏导致的内容遮挡

### Requirement: Watchlist Action SHALL Update Valuation Tool State
详情页和自选列表页中的自选操作 SHALL 使用 valuation-tool 专属自选接口，成功后同步反映到当前页面展示。

#### Scenario: Add watchlist from detail page
- **WHEN** 用户在详情页点击“加入自选”且接口返回成功
- **THEN** 当前基金的自选状态 SHALL 立即更新为已加入
- **AND** 页面 SHALL 给出成功反馈

#### Scenario: Remove watchlist from list page
- **WHEN** 用户在自选列表页取消某只基金的自选且接口返回成功
- **THEN** 该基金 SHALL 从已自选状态中移除
- **AND** 列表展示 SHALL 同步刷新

#### Scenario: Dedicated watchlist API boundary
- **WHEN** valuation-tool 执行自选新增、删除或列表查询
- **THEN** 系统 SHALL 调用 valuation-tool 专属自选接口
- **AND** 不得依赖 ETF 主工具页既有的 watchlist 接口完成同类能力

### Requirement: Valuation Tool SHALL Provide Dedicated Watchlist Page
系统 SHALL 在 valuation-tool 下提供独立的自选基金列表页，用于展示当前用户已加入自选的基金，不得直接跳转到 ETF 主工具页的 watchlist tab 代替。

#### Scenario: Navigate from detail page to watchlist page
- **WHEN** 用户在详情页点击“自选列表”
- **THEN** 系统 SHALL 进入 valuation-tool 独立自选基金列表页

#### Scenario: Watchlist page shows empty state
- **WHEN** 用户尚未加入任何自选基金
- **THEN** 自选基金列表页 SHALL 展示空态提示
- **AND** 空态中 SHALL 提供返回首页或继续选基金的操作

### Requirement: Watchlist Page SHALL Show Daily Change
自选基金列表页 SHALL 展示每只基金的名称、代码和当日涨幅，以便用户快速比较当日表现；相关数据 SHALL 由 valuation-tool 新接口直接返回或通过配套接口提供。

#### Scenario: Watchlist page renders daily change
- **WHEN** 自选基金列表页成功获取基金列表与当日涨幅数据
- **THEN** 每个列表项 SHALL 展示基金名称、基金代码和当日涨幅

#### Scenario: Daily change falls back gracefully
- **WHEN** 某只基金的当日涨幅暂时不可用
- **THEN** 对应列表项 SHALL 展示明确的降级状态
- **AND** 其他基金的展示 SHALL 不受影响

#### Scenario: Watchlist API returns required fields
- **WHEN** valuation-tool 自选列表接口返回成功
- **THEN** 返回数据 SHALL 至少包含基金代码、基金名称、当前自选状态和当日涨幅字段

### Requirement: Mine Scan Action SHALL Open a Stable Entry
详情页中的“基金扫雷”按钮 SHALL 打开 valuation-tool 内定义好的扫雷入口，并携带当前基金代码供后续页面继续使用。

#### Scenario: Navigate to mine scan entry
- **WHEN** 用户在详情页点击“基金扫雷”
- **THEN** 系统 SHALL 跳转到 valuation-tool 的扫雷入口页
- **AND** 当前基金代码 SHALL 作为路由参数或等价上下文一并传递
