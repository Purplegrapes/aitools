## MODIFIED Requirements

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

### Requirement: My Portfolio SHALL Support Direct Screenshot Selection
系统 SHALL 在用户选择“上传截图”方式后直接唤起系统图片选择能力，并在识别完成后进入确认页。

#### Scenario: User chooses screenshot sync
- **WHEN** 用户在同步方式页点击“上传截图”
- **THEN** 系统 SHALL 直接唤起图片选择或拍照入口
- **AND** 系统 SHALL 在识别完成后进入识别结果确认页
- **AND** 系统 SHALL 不要求用户先进入一个空的上传页再选图

## ADDED Requirements

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
