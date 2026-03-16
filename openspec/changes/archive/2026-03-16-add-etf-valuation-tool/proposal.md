## Why

`src/subPages/etf/docs/prd.md` 已经定义了一套面向基金小白的 ETF 估值工具产品形态，但当前 `subPages/etf` 代码仍以专业化估值表为主，和文档目标不一致。现在需要把文档中的首页、搜索结果页、结果详情页落实为可实现的变更方案，并按参考站点还原移动端体验，给后续 `/opsx:apply` 一个清晰的实施边界。

## What Changes

- 在 `subPages/etf` 下新增一套面向新手用户的 ETF 估值工具页面流，覆盖首页、搜索结果页、结果详情页。
- 基于 `src/subPages/etf/docs/api.md` 规划独立 API 模块、请求类型和页面状态映射。
- 约束 UI 还原方向，以 `https://eagle-lake-83678538.paico.site` 为视觉基线，保持轻量、浅色、卡片式移动端设计。
- 明确和现有 ETF 估值表的关系：新工具作为新增能力接入，不改写现有专业页主流程。
- 补充降级、空态、加载态和免责声明等面向新手场景的规范。

## Capabilities

### New Capabilities
- `etf-valuation-tool`: 提供 ETF 估值工具的首页、搜索结果页、详情页、状态页、数据请求与参考站点还原规则。

### Modified Capabilities
- None.

## Impact

- Affected code: `src/subPages/etf` 页面路由、组件拆分、API 模块、类型定义、可能的 mock/占位数据。
- Affected APIs: `GET /api/v1/market/sentiment`、`GET /api/v1/funds/hot-searches`、`GET /api/v1/funds/search`、`GET /api/v1/funds/{code}/result`。
- Affected UX: ETF 子包新增一条新手工具链路，视觉风格与当前深色估值表并存。
- Dependencies: 继续使用项目既有 Vue 3 + `script setup` + Pinia + Alova + Wot Design Uni + UnoCSS，不引入新依赖。
