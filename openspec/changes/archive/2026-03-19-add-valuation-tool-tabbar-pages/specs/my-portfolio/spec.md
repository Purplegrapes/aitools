## ADDED Requirements

### Requirement: My Portfolio SHALL Act As A Valuation Tool Tabbar Page
系统 SHALL 将“我的持仓”定义为 valuation-tool 产品域下的一级 tabbar 页面，并在页面底部持续展示与首页、自选页一致的 3-tab 导航。

#### Scenario: User opens portfolio page directly
- **WHEN** 用户直接进入“我的持仓”页面
- **THEN** 页面底部 SHALL 展示 valuation-tool 专属 tabbar
- **AND** “我的持仓”对应 tab SHALL 处于激活状态
- **AND** 用户 SHALL 能直接通过 tabbar 切换到首页和自选页

#### Scenario: Portfolio page keeps tabbar in empty state
- **WHEN** 用户进入“我的持仓”且当前没有任何持仓记录
- **THEN** 空状态页面 SHALL 继续显示 valuation-tool tabbar
- **AND** 用户无需依赖额外返回按钮也能切换到首页或自选页

#### Scenario: Portfolio page keeps tabbar with holdings data
- **WHEN** 用户进入“我的持仓”且存在至少一条持仓记录
- **THEN** 总览卡、观察建议和持仓列表渲染完成后 SHALL 保持 valuation-tool tabbar 可见
- **AND** 页面底部内容 SHALL 不被 tabbar 遮挡
