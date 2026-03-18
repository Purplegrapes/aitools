## Why

宝倍估值当前已经有“我的持仓”模块，但新增持仓路径仍然分散：手动录入和上传入口心智不统一，上传流程也停留在占位态。现在需要把持仓新增整理成一个更清晰的“同步持仓”能力，让用户先选择同步方式，再进入各自独立的录入流程。

## What Changes

- 将“我的持仓”页入口统一为单一的“同步持仓”按钮，不再同时暴露多个底部操作入口。
- 新增独立的“同步持仓”页面，用户在这里选择“手动录入”或“上传截图”。
- 保留独立的手动录入页，继续使用“基金 + 持有金额 + 持有收益”输入模型。
- 上传截图时在同步方式页直接唤起系统选图，识别完成后再进入待确认列表页。
- 识别结果确认页改为简洁表格式展示，只保留识别成功的基金，并支持删除与确认导入。
- 手动录入与截图识别继续统一到相同的最终持仓入库口径。

## Capabilities

### Modified Capabilities

- `my-portfolio`: 持仓新增能力从“添加持仓内切换双入口”调整为“我的持仓 -> 同步持仓 -> 选择方式 -> 独立录入/识别确认”。

## Impact

- Affected specs: `openspec/specs/my-portfolio/spec.md`
- Affected pages: `src/subPages/valuation-tool/holdings.vue`, `src/subPages/valuation-tool/holdings-sync.vue`, `src/subPages/valuation-tool/holdings-add.vue`, `src/subPages/valuation-tool/holdings-upload.vue`
- Affected components: `src/subPages/valuation-tool/components/EmptyPortfolioState.vue`, `src/subPages/valuation-tool/components/UploadPositionCard.vue`
- Affected logic: position save normalization, OCR recognition session handoff, confirmation list rendering
- Affected APIs: screenshot recognition / confirmation import endpoints remain required
