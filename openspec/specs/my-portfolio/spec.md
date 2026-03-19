## ADDED Requirements

### Requirement: My Portfolio SHALL Provide Guided Empty State
系统 SHALL 在用户尚未录入任何持仓时展示“我的持仓”空状态页，并明确引导用户通过统一的“同步持仓”入口建立第一条持仓记录。

#### Scenario: User opens portfolio without holdings
- **WHEN** 用户进入“我的持仓”且当前没有任何持仓记录
- **THEN** 系统 SHALL 展示页面标题、空状态主文案、副文案和至少一个明确的建仓入口
- **AND** 页面 SHALL 提供“同步持仓”按钮
- **AND** 页面 SHALL 不再同时展示多个新增持仓入口作为主要操作

### Requirement: My Portfolio SHALL Support Lightweight Position Entry
系统 SHALL 提供统一的“同步持仓”入口，并允许用户在同一产品路径下选择手动录入或上传持仓截图自动识别两种方式完成持仓新增。

#### Scenario: User opens my-portfolio entry
- **WHEN** 用户进入“我的持仓”页面
- **THEN** 页面 SHALL 提供单一的“同步持仓”入口
- **AND** 页面 SHALL 不再同时展示多个新增持仓入口作为主要操作

#### Scenario: User opens sync-method page
- **WHEN** 用户点击“同步持仓”
- **THEN** 系统 SHALL 进入独立的方式选择页
- **AND** 页面 SHALL 提供“手动录入”和“上传截图”两种同步方式

#### Scenario: User adds a holding manually
- **WHEN** 用户选择手动录入方式
- **THEN** 页面 SHALL 提供基金名称或代码搜索输入
- **AND** 页面 SHALL 提供“持有金额”和“持有收益”两个必填输入项
- **AND** 页面 SHALL 基于当前净值自动换算底层持仓数据并保存

#### Scenario: User searches a fund while entering position
- **WHEN** 用户在基金输入框中输入基金名称或代码
- **THEN** 系统 SHALL 展示搜索联想结果或等价的候选基金列表
- **AND** 用户选择结果后 SHALL 回填对应基金信息

### Requirement: My Portfolio SHALL Support Direct Screenshot Selection
系统 SHALL 在用户选择“上传截图”方式后直接唤起系统图片选择能力，并在识别完成后进入确认页。

#### Scenario: User chooses screenshot sync
- **WHEN** 用户在同步方式页点击“上传截图”
- **THEN** 系统 SHALL 直接唤起图片选择或拍照入口
- **AND** 系统 SHALL 在识别完成后进入识别结果确认页
- **AND** 系统 SHALL 不要求用户先进入一个空的上传页再选图

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

### Requirement: My Portfolio SHALL Confirm Only Successfully Recognized Holdings
系统 SHALL 在截图识别完成后，仅将识别成功且可直接导入的基金展示在确认页中。

#### Scenario: Recognition returns mixed results
- **WHEN** 系统返回一批截图识别结果，且其中仅部分基金识别成功
- **THEN** 前端 SHALL 过滤掉识别失败、待匹配或待确认的结果
- **AND** 确认页 SHALL 只展示识别成功的基金

#### Scenario: Recognition returns no successful holdings
- **WHEN** 系统未识别出任何可导入的持仓记录
- **THEN** 页面 SHALL 进入空结果或失败状态
- **AND** 页面 SHALL 提供“重新上传”和“转手动录入”的下一步入口

### Requirement: My Portfolio SHALL Present Confirmation As A Simple Table
系统 SHALL 将截图识别确认页设计为简单直观的表格式清单，而不是多张卡片堆叠。

#### Scenario: User reviews recognized holdings
- **WHEN** 用户进入截图识别确认页
- **THEN** 页面 SHALL 以表格式清单展示识别成功的基金
- **AND** 每条记录 SHALL 至少包含基金、持有金额、持有收益和操作
- **AND** 基金名称 SHALL 只读展示
- **AND** 用户 SHALL 能编辑持有金额和持有收益
- **AND** 用户 SHALL 能通过删除操作移除某条记录

### Requirement: My Portfolio SHALL Normalize Manual And OCR Entry To A Shared Save Model
系统 SHALL 将手动录入和截图识别导入统一到相同的最终持仓入库口径，以保证后续持仓展示、收益计算和编辑逻辑复用。

#### Scenario: User confirms OCR import
- **WHEN** 用户确认截图识别结果并执行导入
- **THEN** 系统 SHALL 将确认后的识别结果转换为与手动录入一致的最终持仓保存模型
- **AND** 导入结果 SHALL 与手动录入新增的持仓在后续展示与编辑上保持一致

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
