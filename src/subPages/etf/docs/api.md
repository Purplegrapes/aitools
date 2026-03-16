# ETF估值工具 接口说明文档

## 文档说明

- 文档目的：基于当前静态页面，反向整理服务端需要提供给前端调用的接口
- 适用范围：基金估值工具首页市场情绪、热搜榜单、基金搜索、基金详情、独立自选能力
- 接口前缀建议：`/api/v1`
- 返回格式建议：统一使用 `{ code, msg, data }`

---

## 统一响应格式

### 成功响应

```json
{
  "code": 200,
  "msg": "success",
  "data": {}
}
```

### 失败响应

```json
{
  "code": 400,
  "msg": "invalid request",
  "data": null
}
```

---

## 1. 获取市场情绪

### 接口

`GET /api/v1/market/sentiment`

### 用途

用于首页“今日市场情绪”卡片。

### 请求参数

无

### 返回字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `updateTime` | string | 是 | 更新时间 |
| `temperature` | number | 是 | 情绪温度值，建议范围 `0-100` |
| `label` | string | 是 | 前端展示标签，如“偏冷” |
| `level` | string | 是 | 情绪等级，建议值：`freezing / cool / neutral / hot` |
| `description` | string | 是 | 白话解释文案 |

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "updateTime": "2026-03-13 14:05",
    "temperature": 32,
    "label": "偏冷",
    "level": "cool",
    "description": "当前市场情绪整体降温，大部分板块处于回调震荡期，更适合按低吸定投纪律慢慢沉淀筹码。"
  }
}
```

---

## 2. 获取热搜榜单

### 接口

`GET /api/v1/funds/hot-searches`

### 用途

用于首页“热搜榜单”。

### 请求参数

无

### 返回字段

#### data

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `items` | array | 是 | 热搜基金列表 |

#### items[]

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `rank` | number | 是 | 排名 |
| `code` | string | 是 | 基金代码 |
| `name` | string | 是 | 基金名称 |
| `tag` | string | 是 | 一句分类标签，如“宽基稳健” |

### 返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "items": [
      {
        "rank": 1,
        "code": "000300",
        "name": "沪深300ETF联接",
        "tag": "宽基稳健"
      },
      {
        "rank": 2,
        "code": "270042",
        "name": "广发纳斯达克100",
        "tag": "海外科技"
      },
      {
        "rank": 3,
        "code": "009051",
        "name": "易方达中证红利",
        "tag": "防御收息"
      }
    ]
  }
}
```

---

## 3. 搜索基金

### 接口

`GET /api/v1/funds/search`

### 用途

用于搜索框输入基金名称或代码后进行精确匹配，直接返回目标基金信息。

### 请求参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `q` | query | string | 是 | 基金名称或代码，要求精确匹配 |

### 请求示例

```http
GET /api/v1/funds/search?q=110020
```

### 返回字段

#### data

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 基金代码 |
| `name` | string | 是 | 基金名称 |
| `tags` | string[] | 是 | 轻标签，用于结果页展示 |
| `summary` | string | 是 | 一句话白话解释 |

### 成功返回示例

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "code": "110020",
    "name": "易方达沪深300ETF联接A",
    "tags": ["宽基指数", "被动定投", "大盘风格"],
    "summary": "这是一只主要跟着沪深300指数走的基金。"
  }
}
```

### 空结果示例

```json
{
  "code": 200,
  "msg": "success",
  "data": null
}
```

### 说明

- 搜不到结果时建议返回 `200`
- 前端根据 `data = null` 进入“无结果”状态页
- 不建议对搜索无结果返回 `404`

---

## 4. 获取基金结果详情

### 接口

`GET /api/v1/funds/{code}/result`

### 用途

用于基金估值工具详情页 `/subPages/valuation-tool/result` 的主数据展示。

### 路径参数

| 参数 | 位置 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `code` | path | string | 是 | 基金代码 |

### 请求示例

```http
GET /api/v1/funds/110020/result
```

### 返回字段

#### data

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
| `targetAudience` | string | 否 | 适合人群 |
| `disclaimer` | string | 否 | 风险提示 |

### intraday 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | number | 是 | 盘中推算涨跌值 |
| `unit` | string | 是 | 单位，建议 `%` |
| `updateTime` | string | 是 | 更新时间 |
| `source` | string | 是 | 数据来源，建议值：`estimate / realtime / mock` |
| `explanation` | string | 是 | 今日表现解释文案 |

### quickFacts 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `feeRate` | string | 是 | 费率 |
| `feeExplanation` | string | 是 | 费率解释 |
| `maxDrawdown` | string | 是 | 历史最大跌幅 |
| `drawdownExplanation` | string | 是 | 最大跌幅解释 |
| `oneYearReturn` | string | 是 | 近一年表现 |
| `returnExplanation` | string | 是 | 近一年表现解释 |

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
      "feeRate": "0.60%",
      "feeExplanation": "长期持有成本中等",
      "maxDrawdown": "-35.40%",
      "drawdownExplanation": "最差时大概跌过 3 成",
      "oneYearReturn": "+12.50%",
      "returnExplanation": "过去一年整体表现较强"
    },
    "definition": "这是一只主要投资中国核心大盘股的宽基指数基金，它就像是A股的“体温计”，大盘涨它就涨。",
    "targetIndex": "沪深300指数",
    "marketCoverage": "A股核心资产",
    "riskDescription": "会随市场波动，适合重点长期持有。",
    "targetAudience": "适合想配置A股、但不愿花精力挑该买哪个板块的懒人。",
    "disclaimer": "上述结果仅做参考，不作为官方依据构成投资建议"
  }
}
```

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

## 8. 详情页状态约定

当前静态原型中存在以下几种状态页：

- 正常结果
- 无结果
- 缺值
- 加载中

建议统一由 `GET /api/v1/funds/{code}/result` 返回 `status` 控制，而不是为每种状态再拆独立业务接口。

### 8.1 正常结果

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "status": "ok"
  }
}
```

### 8.2 无结果

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

### 8.3 缺值

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

### 8.4 加载中

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

## 9. 前端页面与接口映射关系

### 首页

依赖接口：

- `GET /api/v1/market/sentiment`
- `GET /api/v1/funds/hot-searches`

### 基金搜索页

依赖接口：

- `GET /api/v1/funds/search?q=`

### 基金详情页

依赖接口：

- `GET /api/v1/funds/{code}/result`
- `POST /api/v1/valuation-tool/watchlist`
- `DELETE /api/v1/valuation-tool/watchlist/{code}`
- `GET /api/v1/valuation-tool/watchlist`

### 自选基金列表页

依赖接口：

- `GET /api/v1/valuation-tool/watchlist`
- `DELETE /api/v1/valuation-tool/watchlist/{code}`

---

## 10. 最小可用接口集合

如果先做 MVP，只需要以下 7 个接口：

1. `GET /api/v1/market/sentiment`
2. `GET /api/v1/funds/hot-searches`
3. `GET /api/v1/funds/search?q=`
4. `GET /api/v1/funds/{code}/result`
5. `GET /api/v1/valuation-tool/watchlist`
6. `POST /api/v1/valuation-tool/watchlist`
7. `DELETE /api/v1/valuation-tool/watchlist/{code}`

这 7 个接口足够驱动当前基金估值工具的首页、详情页、自选列表页和自选操作链路。

---

## 11. 备注

- 当前静态页面未体现真实后端 API 调用，本文件为基于页面功能反向设计的服务端接口说明
- 建议后续结合真实数据源再补充：
  - 鉴权方式
  - 缓存策略
  - 错误码明细
  - 接口 SLA
