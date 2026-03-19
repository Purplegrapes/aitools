## ADDED Requirements

### Requirement: My Portfolio SHALL Provide Guided Empty State
系统 SHALL 在用户尚未录入任何持仓时展示“我的持仓”空状态页，并明确引导用户通过手动添加或上传持仓建立第一条持仓记录。

#### Scenario: User opens portfolio without holdings
- **WHEN** 用户进入“我的持仓”且当前没有任何持仓记录
- **THEN** 系统 SHALL 展示页面标题、空状态主文案、副文案和至少一个明确的建仓入口
- **AND** 页面 SHALL 提供“手动添加”按钮
- **AND** 页面 MAY 提供“上传持仓”按钮或等价预留入口

### Requirement: My Portfolio SHALL Support Lightweight Position Entry
系统 SHALL 提供轻量的添加持仓页，允许用户通过搜索基金、填写持有份额和成本净值快速录入一条持仓。

#### Scenario: User adds a holding manually
- **WHEN** 用户进入添加持仓页
- **THEN** 页面 SHALL 提供基金名称或代码搜索输入
- **AND** 页面 SHALL 提供持有份额和成本净值两个必填输入项
- **AND** 页面 SHALL 提供保存操作

#### Scenario: User searches a fund while entering position
- **WHEN** 用户在基金输入框中输入基金名称或代码
- **THEN** 系统 SHALL 展示搜索联想结果或等价的候选基金列表
- **AND** 用户选择结果后 SHALL 回填对应基金信息

### Requirement: My Portfolio SHALL Summarize Portfolio Performance
系统 SHALL 提供持仓总览页，并在页面首屏展示用户组合的累计收益、累计收益率、今日盈亏（盘中参考）、当前持仓金额和持仓基金数。

#### Scenario: User opens portfolio with holdings
- **WHEN** 用户进入“我的持仓”且存在至少一条持仓
- **THEN** 页面首屏 SHALL 展示累计收益和累计收益率
- **AND** 页面 SHALL 展示今日盈亏（盘中参考）
- **AND** 页面 SHALL 展示当前总市值和持仓基金数

#### Scenario: User judges overall gain or loss quickly
- **WHEN** 持仓总览页渲染完成
- **THEN** 用户 SHALL 能在不滚动或仅极小滚动的情况下看出组合当前整体赚亏状态

### Requirement: My Portfolio SHALL Provide Portfolio Insight
系统 SHALL 在持仓总览页中提供一张轻量观察建议卡，用解释性文案帮助用户理解当前组合表现，但不得构成明确买卖建议。

#### Scenario: Portfolio has a clear performance driver
- **WHEN** 系统能够识别贡献最大、拖累最大或更值得关注的基金
- **THEN** 页面 SHALL 展示轻量总结文案说明当前组合的主要变化来源
- **AND** 文案 SHALL 使用克制、解释型语言

#### Scenario: Portfolio insight is rendered
- **WHEN** 持仓总览页显示观察建议模块
- **THEN** 模块 SHALL 更像建议卡或总结卡
- **AND** 模块 SHALL 不出现“建议买入”“建议卖出”或收益承诺类表述

### Requirement: My Portfolio SHALL Show Each Holding Clearly
系统 SHALL 以便于移动端扫读的卡片式持仓列表展示每只基金的名称、当前估值、累计收益、累计收益率、今日盈亏、今日涨跌幅和状态标签。

#### Scenario: User scans holdings list
- **WHEN** 持仓总览页展示多只基金
- **THEN** 每张持仓卡 SHALL 展示基金名称和关键收益指标
- **AND** 用户 SHALL 能快速区分表现偏强、震荡或偏弱的基金

#### Scenario: User identifies strongest and weakest holdings
- **WHEN** 多只持仓基金同时展示
- **THEN** 用户 SHALL 能通过收益和状态信息快速识别表现最好和最弱的基金

### Requirement: My Portfolio SHALL Support Editing and Deletion
系统 SHALL 提供编辑持仓能力，允许用户修改持有份额和成本净值，并提供明确区分的删除操作。

#### Scenario: User edits an existing position
- **WHEN** 用户打开某条持仓的编辑页或编辑弹层
- **THEN** 系统 SHALL 允许修改持有份额和成本净值
- **AND** 页面 SHALL 提供保存修改操作

#### Scenario: User deletes a holding
- **WHEN** 用户在编辑页或编辑弹层中选择删除持仓
- **THEN** 系统 SHALL 将删除操作以危险动作样式与常规保存操作区分开

### Requirement: My Portfolio SHALL Reserve Upload Flow
系统 SHALL 提供上传持仓入口页或入口卡，说明支持的文件类型和导入价值；若首版未实现完整上传能力，页面 SHALL 以预留态稳定展示。

#### Scenario: User opens upload page
- **WHEN** 用户点击“上传持仓”
- **THEN** 页面 SHALL 展示 Excel / CSV 支持说明
- **AND** 页面 SHALL 展示文件选择入口或预留态说明

### Requirement: My Portfolio SHALL Provide Loading and Data Unavailable States
系统 SHALL 为持仓模块提供与正式页面结构对应的骨架屏，并在估值暂不可用时展示局部缺失态，而不是让用户误以为整页异常。

#### Scenario: Portfolio data is loading
- **WHEN** 我的持仓总览页尚未完成数据请求
- **THEN** 页面 SHALL 展示顶部总览卡、观察建议卡和持仓列表对应的骨架结构

#### Scenario: Real-time valuation data is unavailable
- **WHEN** 当前暂无实时估值数据
- **THEN** 页面 SHALL 继续展示已知持仓和累计收益信息
- **AND** 今日盈亏及实时估值相关区域 SHALL 展示明确的数据缺失提示
- **AND** 页面 SHALL 不使用整页报错替代缺失态

### Requirement: My Portfolio SHALL Follow Light-Finance Mobile Design Rules
系统 SHALL 采用面向普通基金投资者的轻金融视觉风格，并遵守项目的移动端字号、间距、圆角和语义色规范。

#### Scenario: High-fidelity screens are defined
- **WHEN** 输出“我的持仓”模块设计稿和组件规范
- **THEN** 页面 SHALL 使用浅色或轻中性色背景、蓝色信任色和有限度的红绿色收益提示
- **AND** 字号、间距、圆角和控件尺寸 SHALL 优先使用 rpx
- **AND** 页面 SHALL 更像“我的基金助手”而不是交易终端或财务系统
