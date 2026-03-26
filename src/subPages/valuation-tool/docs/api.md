# 基金估值与我的持仓 接口说明文档

## 文档说明

- 文档目的：基于当前静态页面，反向整理服务端需要提供给前端调用的接口
- 适用范围：基金估值工具首页市场情绪、热搜榜单、基金搜索、基金详情、独立自选能力、我的持仓模块
- 当前估值服务地址：`https://etf-insight.betalpha.com`
- 返回格式建议：估值服务当前使用 `{ code, data, message }`，前端如需统一可在接口层做适配

---

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 失败响应

```json
{
  "code": 400,
  "message": "invalid request",
  "data": null
}
```

---

## 1. 获取市场情绪

### 接口

`GET /api/market-pulse/sentiment`

### 用途

用于首页“今日市场情绪”卡片。

### 请求参数

无

### 返回字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `score` | number | 是 | 市场情绪分值，建议范围 `0-100` |
| `updatedAt` | string | 是 | 更新时间 |

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "score": 32,
    "updatedAt": "2026-03-13T14:05:00"
  }
}
```

### 前端展示说明

- 首页当前展示的 `temperature / label / level / description` 为前端根据 `score` 映射生成
- 当前服务端并未直接返回“偏冷 / 偏热”这类展示文案

---

## 2. 获取热搜榜单

### 接口

`GET /api/market-pulse/hot-funds`

### 用途

用于首页“热搜榜单”。

### 请求参数

无

### 返回字段

#### data

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `dataDate` | string | 是 | 榜单日期 |
| `items` | array | 是 | 热搜基金列表 |

#### items[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `rank` | number | 是 | 排名 |
| `code` | string | 是 | 基金代码 |
| `name` | string | 否 | 基金名称 |
| `yield` | number | 是 | 收益值 |

### 返回示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "dataDate": "2026-03-13",
    "items": [
      {
        "rank": 1,
        "code": "000300",
        "name": "沪深300ETF联接",
        "yield": 2.35
      },
      {
        "rank": 2,
        "code": "270042",
        "name": "广发纳斯达克100",
        "yield": 1.82
      },
      {
        "rank": 3,
        "code": "009051",
        "name": "易方达中证红利",
        "yield": 1.26
      }
    ]
  }
}
```

### 前端展示说明

- 首页当前展示的 `tag` 为前端根据 `yield` 格式化生成
- 当 `name` 为空时，前端会降级显示为 `基金 {code}`

---

## 3. 搜索基金

### 接口

`POST /api/funds/search`

### 用途

用于搜索框输入基金名称或代码后返回基金候选列表。该接口当前已在估值服务中上线。

### 请求参数

#### body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | string | 是 | 基金名称或代码关键字 |

### 请求示例

```json
{
  "keyword": "110020"
}
```

### 返回字段

#### data[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 基金代码 |
| `name` | string | 是 | 基金名称 |
| `channel` | string | 否 | 渠道信息，如 `支付宝`、`天天基金` |
| `subCategoryName` | string | 否 | 基金子分类 ID，供前端或聚合层做分类映射 |

### 成功返回示例

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "code": "110020",
      "name": "易方达沪深300ETF联接A",
      "channel": "天天基金",
      "subCategoryName": "broad-index"
    }
  ]
}
```

### 空结果示例

```json
{
  "code": 200,
  "message": "success",
  "data": []
}
```

### 说明

- 当前接口返回的是候选列表，不是单条精确命中结果
- 估值工具结果页需要的 `tags / summary / todayTag` 当前不由该接口直接提供，需由前端本地映射或后续聚合服务补足
- 搜不到结果时当前口径为 `data: []`

---

## 4. 获取基金基础详情

### 接口

`GET /api/funds/{code}`

### 用途

用于获取基金基础详情。该接口当前已在估值服务中上线，但返回字段还不足以直接覆盖估值工具结果页完整展示。

### 路径参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `code` | path | string | 是 | 基金代码 |

### 请求示例

```http
GET /api/funds/110020
```

### 返回字段

#### data

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 基金代码 |
| `name` | string | 是 | 基金名称 |
| `benchmark` | string | 否 | 业绩比较基准 |
| `channel` | string | 否 | 渠道信息 |
| `foundDate` | string | 否 | 成立日期 |
| `subCategoryName` | string | 否 | 基金子分类 ID |

### 成功返回示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "code": "110020",
    "name": "易方达沪深300ETF联接A",
    "benchmark": "沪深300指数收益率*95%+活期存款利率(税后)*5%",
    "channel": "天天基金",
    "foundDate": "2012-08-21",
    "subCategoryName": "broad-index"
  }
}
```

### 当前可支撑的前端能力

- 结果页顶部基础身份信息：基金名称、基金代码
- 基金分类映射：通过 `subCategoryName` 反推标签或类型
- 白话定义、跟踪方向等基础文案：可结合 `benchmark` 和本地规则生成

### 当前缺失的结果页字段

以下字段仍不在当前已上线详情接口中，需要由前端二次拼装或后续聚合服务提供：

| 字段 | 说明 |
| --- | --- |
| `status` | 结果页状态控制，如 `ok / not_found / missing_value / loading` |
| `intraday` | 今日估值或盘中表现参考 |
| `quickFacts` | 近一年表现、历史最大跌幅、费率等指标 |
| `definition` | 白话解释 |
| `targetIndex` | 主要跟踪 |
| `marketCoverage` | 覆盖方向 |
| `riskDescription` | 风险说明 |
| `disclaimer` | 风险提示 |
| `reasonList` | “为什么今天会这样”类解释 |

### 说明

- 当前 `GET /api/funds/{code}` 更适合作为结果页的基础资料接口
- 若要直接支撑现有 [result.vue](/Users/apple/betalpha/beta-mini/src/subPages/valuation-tool/result.vue) 的完整渲染，仍需额外聚合实时估值、规则文案和指标因子数据

---

## 5. 目标结果页聚合接口（仍为目标设计）

### 接口

`GET /api/v1/funds/{code}/result`

### 用途

这是估值工具结果页的目标聚合接口定义。当前服务端尚未按这个 contract 上线，前端仍需基于基础详情接口和其他数据源做拼装。

### 目标字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | string | 是 | 结果状态：`ok / not_found / missing_value / loading` |
| `code` | string | 否 | 基金代码，`status=ok` 时返回 |
| `name` | string | 否 | 基金名称 |
| `tags` | string[] | 否 | 顶部标签 |
| `intraday` | object | 否 | 今日表现参考 |
| `quickFacts` | object | 否 | 快速看懂这只基金 |
| `definition` | string | 否 | 白话定义 |
| `targetIndex` | string | 否 | 主要跟踪 |
| `marketCoverage` | string | 否 | 覆盖方向 |
| `riskDescription` | string | 否 | 风险说明 |
| `disclaimer` | string | 否 | 风险提示 |

### 正常返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "ok",
    "code": "110020",
    "name": "易方达沪深300ETF联接A",
    "tags": ["宽基指数", "被动定投", "大盘风格"],
    "intraday": {
      "value": 1.26,
      "unit": "%",
      "updateTime": "2026-03-13 14:05",
      "source": "estimate",
      "explanation": "大金融发力带领沪深300走强，本基金盘中紧跟上涨。"
    },
    "quickFacts": {
      "oneYearPerformance": "12.80%",
      "maxDrawdown": "-35.40%",
      "feeRate": "0.60%"
    },
    "definition": "这是一只主要投资中国核心大盘股的宽基指数基金，它就像是A股的“体温计”，大盘涨它就涨。",
    "targetIndex": "沪深300指数",
    "marketCoverage": "A股核心资产",
    "riskDescription": "会随市场波动，适合重点长期持有。",
    "disclaimer": "上述结果仅做参考，不作为官方依据构成投资建议"
  }
}
```

### 说明

- `quickFacts` 当前页面按 3 行轻列表展示，展示顺序建议固定为：`oneYearPerformance`、`maxDrawdown`、`feeRate`
- `quickFacts` 的“评价结论”由前端按 [factor.md](./factor.md) 中的区间规则自动计算，接口只需要提供原始值字段
- `quickFacts` 各字段均可选返回；缺省时前端会降级显示为 `--` 和“暂无结论”

---

## 5. 获取基金估值工具自选基金列表

### 接口

`GET /api/v1/valuation-tool/watchlist`

### 用途

用于基金估值工具独立“自选基金”列表页 `/subPages/valuation-tool/watchlist`。

### 请求参数

无

### 返回字段

#### data

推荐使用对象包裹列表，便于后续扩展分页或统计信息。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | array | 是 | 自选基金列表 |

#### items[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 基金代码 |
| `name` | string | 是 | 基金名称 |
| `watchlisted` | boolean | 是 | 是否已自选 |
| `dailyChange` | number \| null | 是 | 当日涨幅，单位 `%`，暂无数据时返回 `null` |
| `updateTime` | string | 否 | 当日涨幅更新时间 |

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "items": [
      {
        "code": "110020",
        "name": "易方达沪深300ETF联接A",
        "watchlisted": true,
        "dailyChange": 1.26,
        "updateTime": "2026-03-16 14:05"
      },
      {
        "code": "270042",
        "name": "广发纳斯达克100ETF联接",
        "watchlisted": true,
        "dailyChange": -0.84,
        "updateTime": "2026-03-16 14:05"
      }
    ]
  }
}
```

### 说明

- 这是基金估值工具专属自选接口，不复用 ETF 主工具页既有 watchlist 接口
- `dailyChange` 为列表页核心展示字段，新接口需要直接支持
- 当某只基金暂无当日涨幅时，建议返回 `null`，前端进入降级展示

---

## 6. 新增基金估值工具自选基金

### 接口

`POST /api/v1/valuation-tool/watchlist`

### 用途

用于基金详情页“加入自选”操作。

### 请求参数

#### body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 基金代码 |
| `name` | string | 否 | 基金名称，便于服务端落库或校验 |
| `dailyChange` | number \| null | 否 | 当前页面已拿到的当日涨幅，可选透传 |
| `updateTime` | string | 否 | 当前页面展示所用更新时间，可选透传 |

### 请求示例

```json
{
  "code": "110020",
  "name": "易方达沪深300ETF联接A",
  "dailyChange": 1.26,
  "updateTime": "2026-03-16 14:05"
}
```

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "success": true,
    "code": "110020",
    "watchlisted": true
  }
}
```

### 说明

- 若该基金已在基金估值工具自选列表中，建议返回幂等成功
- 返回体中建议显式返回 `watchlisted=true`，方便前端立即切换按钮态

---

## 7. 删除基金估值工具自选基金

### 接口

`DELETE /api/v1/valuation-tool/watchlist/{code}`

### 用途

用于基金详情页“取消自选”和自选列表页移除操作。

### 路径参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `code` | path | string | 是 | 基金代码 |

### 请求示例

```http
DELETE /api/v1/valuation-tool/watchlist/110020
```

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "success": true,
    "code": "110020",
    "watchlisted": false
  }
}
```

### 说明

- 建议删除接口同样保持幂等：目标不存在时也可返回成功
- 返回体中建议显式返回 `watchlisted=false`，便于前端同步状态

---

## 8. 获取我的持仓列表

### 接口

`GET /api/v1/valuation-tool/holdings`

### 用途

用于“我的持仓”页获取当前持仓列表、组合总览和轻量提示。

### 请求参数

无

### 返回字段

#### data

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `summary` | object | 是 | 持仓总览 |
| `insight` | object | 是 | 组合提示 |
| `items` | array | 是 | 持仓基金列表 |

#### summary

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `totalProfit` | number | 是 | 累计收益 |
| `totalProfitRate` | number \| null | 是 | 累计收益率，单位 `%` |
| `todayProfit` | number \| null | 是 | 今日盈亏（参考） |
| `totalAmount` | number | 是 | 当前持有金额 |
| `holdingCount` | number | 是 | 持仓基金数 |

#### insight

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 提示标题 |
| `description` | string | 是 | 一句话解释型结论 |

#### items[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 持仓记录 ID |
| `code` | string | 是 | 基金代码 |
| `name` | string | 是 | 基金名称 |
| `currentAmount` | number | 是 | 当前持有金额 |
| `cumulativeProfit` | number | 是 | 当前累计收益 |
| `cumulativeProfitRate` | number \| null | 是 | 当前累计收益率，单位 `%` |
| `todayProfit` | number \| null | 是 | 今日盈亏（参考） |
| `dailyChangeRate` | number \| null | 是 | 今日涨跌幅，单位 `%` |
| `currentNav` | number \| null | 是 | 当前估值 |
| `updateTime` | string | 否 | 数据更新时间 |

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "summary": {
      "totalProfit": 3800,
      "totalProfitRate": 7.6,
      "todayProfit": 420,
      "totalAmount": 53800,
      "holdingCount": 4
    },
    "insight": {
      "title": "组合观察",
      "description": "今天你的收益主要来自科技方向，组合整体偏强。"
    },
    "items": [
      {
        "id": "110020-1",
        "code": "110020",
        "name": "易方达沪深300ETF联接A",
        "currentAmount": 13820.5,
        "cumulativeProfit": 720.35,
        "cumulativeProfitRate": 5.36,
        "todayProfit": 96.2,
        "dailyChangeRate": 1.26,
        "currentNav": 1.1824,
        "updateTime": "2026-03-17 14:05"
      }
    ]
  }
}
```

### 说明

- 总览、提示和持仓列表建议由一个接口统一返回，减少前端拼装复杂度
- `todayProfit`、`dailyChangeRate`、`currentNav` 允许返回 `null`，前端进入“估值暂不可用”降级展示

---

## 9. 新增持仓

### 接口

`POST /api/v1/valuation-tool/holdings`

### 用途

用于“添加持仓”页新增一条持仓记录。

### 请求参数

#### body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 基金代码 |
| `name` | string | 否 | 基金名称，便于校验和落库 |
| `holdingAmount` | number | 是 | 当前持有金额 |
| `holdingProfit` | number | 是 | 当前持有收益，亏损时允许负数 |

### 请求示例

```json
{
  "code": "110020",
  "name": "易方达沪深300ETF联接A",
  "holdingAmount": 13820.5,
  "holdingProfit": 720.35
}
```

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": "110020-1",
    "code": "110020",
    "name": "易方达沪深300ETF联接A",
    "holdingAmount": 13820.5,
    "holdingProfit": 720.35
  }
}
```

### 说明

- 前端输入模型已统一成 `holdingAmount + holdingProfit`
- 服务端可根据基金当前估值换算底层份额和成本信息，也可以仅保存结果型字段

---

## 10. 修改持仓

### 接口

`PUT /api/v1/valuation-tool/holdings/{id}`

### 用途

用于“修改持仓”页更新当前基金的持有金额和持有收益。

### 路径参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | path | string | 是 | 持仓记录 ID |

### 请求参数

#### body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `holdingAmount` | number | 是 | 当前持有金额 |
| `holdingProfit` | number | 是 | 当前持有收益，亏损时允许负数 |

### 请求示例

```json
{
  "holdingAmount": 15200.0,
  "holdingProfit": 860.0
}
```

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "success": true,
    "id": "110020-1"
  }
}
```

### 说明

- 修改页不允许切换基金本身，因此接口只更新金额和收益两个字段
- 若当前估值暂不可用，建议返回明确错误信息，提示前端暂不可保存

---

## 11. 删除持仓

### 接口

`DELETE /api/v1/valuation-tool/holdings/{id}`

### 用途

用于“修改持仓”页删除当前持仓记录。

### 路径参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `id` | path | string | 是 | 持仓记录 ID |

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "success": true,
    "id": "110020-1"
  }
}
```

### 说明

- 建议删除接口保持幂等
- 删除成功后前端会返回“我的持仓”页并刷新总览

---

## 12. 持仓截图识别与确认导入接口

### 12.1 识别持仓截图

#### 接口

`POST /api/v1/valuation-tool/holdings/recognize`

#### 用途

用于“同步持仓 -> 上传截图”流程。用户选择一张或多张截图后，服务端识别基金、持有金额和持有收益，返回前端确认草稿。

#### 请求参数

建议使用 `multipart/form-data`。

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `files` | form-data | file[] | 是 | 持仓截图文件，建议最多 6 张 |

#### 返回字段

##### data

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | array | 是 | 识别结果草稿列表 |

##### items[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 草稿 ID |
| `sourceImage` | string | 是 | 来源截图名称 |
| `name` | string | 是 | 识别出的基金名称 |
| `code` | string | 否 | 识别或匹配出的基金代码 |
| `holdingAmount` | string | 是 | 当前持有金额 |
| `holdingProfit` | string | 是 | 当前累计收益 |
| `status` | string | 是 | 草稿状态，当前前端仅将 `ready` 项带入确认页 |
| `issue` | string | 否 | 当前草稿的问题说明，用于失败提示或日志记录 |

#### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "items": [
      {
        "id": "ocr-1",
        "sourceImage": "holding-1.png",
        "name": "易方达沪深300ETF联接A",
        "code": "110020",
        "holdingAmount": "18234.56",
        "holdingProfit": "1268.90",
        "status": "ready",
        "issue": ""
      },
      {
        "id": "ocr-2",
        "sourceImage": "holding-2.png",
        "name": "华安黄金ETF联接A",
        "code": "000216",
        "holdingAmount": "9480.00",
        "holdingProfit": "523.20",
        "status": "ready",
        "issue": ""
      }
    ]
  }
}
```

### 12.2 确认导入识别结果

#### 接口

`POST /api/v1/valuation-tool/holdings/recognize/confirm`

#### 用途

用于用户在确认页调整金额、收益或删除记录后，将可导入的截图草稿批量转成正式持仓记录。

#### 请求参数

##### body

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | array | 是 | 用户确认后的可导入项 |

##### items[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 草稿 ID |
| `code` | string | 是 | 确认后的基金代码 |
| `name` | string | 是 | 确认后的基金名称 |
| `holdingAmount` | string | 是 | 当前持有金额 |
| `holdingProfit` | string | 是 | 当前累计收益 |

#### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "importedCount": 2
  }
}
```

### 当前版本说明

- 截图识别结果不会直接入库，前端必须进入确认导入步骤
- 当前前端会先过滤非 `ready` 项，只将识别成功的基金带入确认页
- 确认页仅允许编辑持有金额、持有收益和删除记录，基金名称与代码只读
- 如果后端 OCR 能力尚未接入，前端可先通过 mock/stub 打通识别与确认链路

---

## 13. 详情页状态约定

当前静态原型中存在以下几种状态页：

- 正常结果
- 无结果
- 缺值
- 加载中

建议统一由 `GET /api/v1/funds/{code}/result` 返回 `status` 控制，而不是为每种状态再拆独立业务接口。

### 13.1 正常结果

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "ok"
  }
}
```

### 13.2 无结果

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "not_found"
  }
}
```

前端处理建议：
- 进入“抱歉，系统里还没这只基金”页面

### 13.3 缺值

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "missing_value"
  }
}
```

前端处理建议：
- 展示“该基金部分关键数据暂缺”状态页

### 13.4 加载中

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "loading"
  }
}
```

前端处理建议：
- 展示结果生成中/估算中页面

---

## 14. 前端页面与接口映射关系

### 首页

依赖接口：

- `GET /api/v1/market/sentiment`
- `GET /api/v1/funds/hot-searches`

### 基金搜索页

依赖接口：

- `POST /api/funds/search`

### 基金详情页

依赖接口：

- `GET /api/funds/{code}` 作为基础资料接口
- `GET /api/v1/funds/{code}/result` 作为目标聚合接口（当前未上线）
- `POST /api/v1/valuation-tool/watchlist`
- `DELETE /api/v1/valuation-tool/watchlist/{code}`
- `GET /api/v1/valuation-tool/watchlist`

### 自选基金列表页

依赖接口：

- `GET /api/v1/valuation-tool/watchlist`
- `DELETE /api/v1/valuation-tool/watchlist/{code}`

### 我的持仓页

依赖接口：

- `GET /api/v1/valuation-tool/holdings`

### 同步持仓页

依赖接口：

- `POST /api/v1/valuation-tool/holdings/recognize`

### 手动录入页

依赖接口：

- `POST /api/funds/search`
- `POST /api/v1/valuation-tool/holdings`

### 修改持仓页

依赖接口：

- `GET /api/v1/valuation-tool/holdings`
- `PUT /api/v1/valuation-tool/holdings/{id}`
- `DELETE /api/v1/valuation-tool/holdings/{id}`

### 持仓确认页

依赖接口：

- `POST /api/v1/valuation-tool/holdings/recognize`
- `POST /api/v1/valuation-tool/holdings/recognize/confirm`

---

## 15. 最小可用接口集合

如果先做当前 MVP，建议至少提供以下 13 个接口：

1. `GET /api/v1/market/sentiment`
2. `GET /api/v1/funds/hot-searches`
3. `POST /api/funds/search`
4. `GET /api/funds/{code}`
5. `GET /api/v1/valuation-tool/watchlist`
6. `POST /api/v1/valuation-tool/watchlist`
7. `DELETE /api/v1/valuation-tool/watchlist/{code}`
8. `GET /api/v1/valuation-tool/holdings`
9. `POST /api/v1/valuation-tool/holdings`
10. `PUT /api/v1/valuation-tool/holdings/{id}`
11. `DELETE /api/v1/valuation-tool/holdings/{id}`
12. `POST /api/v1/valuation-tool/holdings/recognize`
13. `POST /api/v1/valuation-tool/holdings/recognize/confirm`

这 13 个接口中，`POST /api/funds/search` 与 `GET /api/funds/{code}` 已经由当前估值服务提供，足够先打通搜索和基础详情资料；若要完整驱动当前基金估值工具结果页，还需要后续补上聚合型结果接口或由前端继续拼装缺失字段。

---

## 16. 备注

- 当前静态页面未体现真实后端 API 调用，本文件为基于页面功能反向设计的服务端接口说明
- 建议后续结合真实数据源再补充：
  - 鉴权方式
  - 缓存策略
  - 错误码明细
  - 接口 SLA
