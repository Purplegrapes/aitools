# 红利风向标 MVP 接口文档（后端精简版）

## 1. 目标

本版只给后端实现使用，强调：

- 接口最小集合
- 必要字段
- 前端拼装原则

当前采用：

- 1 个公共基础接口
- 3 个页面状态接口

---

## 2. 接口清单

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/redline/context` | `GET` | 公共基础数据 |
| `/api/redline/market-view` | `GET` | 首页市场判断数据 |
| `/api/redline/strategies/{categoryCode}` | `GET` | 策略详情页数据 |
| `/api/redline/strategy-comparison` | `GET` | 策略对比页数据 |

---

## 3. 枚举

### 3.1 categoryCode

```json
[
  "CORE_DIVIDEND",
  "BOND_LIKE_DIVIDEND",
  "CYCLICAL_DIVIDEND"
]
```

---

## 4. 公共基础接口

### 4.1 `GET /api/redline/context`

返回多个页面公用的数据：

- 首页顶部说明
- 三类策略基础信息
- 通用 CTA
- 环境映射静态配置

### 响应示例

```json
{
  "brief": {
    "title": "投资红利并非死守，而是在收息的同时，攻守自如。",
    "summary": "顺着宏观环境切换红利角色，用更轻松的方式理解当下更适合关注哪一类。",
    "strategyCore": "衰退期持“债”，复苏期持“核心”，通胀期持“资源”。"
  },
  "categories": [
    {
      "categoryCode": "CORE_DIVIDEND",
      "categoryName": "价值红利",
      "shortTag": "核心",
      "homeTagLabel": "推荐关注",
      "coverImage": "https://static.example.com/redline/core-dividend-cover.png",
      "description": "以核心红利为中枢品牌护城河及优质现金流，长期持仓的压舱石。",
      "categoryDesc": "长期底仓 · 均衡配置",
      "tags": ["底仓", "稳定", "长期"]
    },
    {
      "categoryCode": "BOND_LIKE_DIVIDEND",
      "categoryName": "类债红利",
      "shortTag": "类债",
      "homeTagLabel": "类债",
      "coverImage": "https://static.example.com/redline/bond-like-dividend-cover.png",
      "description": "经营极稳如水电，利率下行时的避风港。",
      "categoryDesc": "防御优先 · 稳定收息",
      "tags": ["低波", "稳健", "防御"]
    },
    {
      "categoryCode": "CYCLICAL_DIVIDEND",
      "categoryName": "周期红利",
      "shortTag": "周期",
      "homeTagLabel": "周期",
      "coverImage": "https://static.example.com/redline/cyclical-dividend-cover.png",
      "description": "煤炭石油等稀缺资源，通胀回升时的进攻器。",
      "categoryDesc": "景气驱动 · 分红弹性",
      "tags": ["周期", "景气", "弹性"]
    }
  ],
  "mappingConfig": {
    "title": "环境映射",
    "tag": "当前适配",
    "xAxis": {
      "label": "增长预期",
      "leftText": "增长偏弱",
      "rightText": "增长回升"
    },
    "yAxis": {
      "label": "风险偏好",
      "bottomText": "风险偏好弱",
      "topText": "风险偏好强"
    },
    "zones": [
      {
        "zoneName": "防御区",
        "categoryCode": "BOND_LIKE_DIVIDEND"
      },
      {
        "zoneName": "平衡区",
        "categoryCode": "CORE_DIVIDEND"
      },
      {
        "zoneName": "弹性区",
        "categoryCode": "CYCLICAL_DIVIDEND"
      }
    ]
  }
}
```

### 后端要求

- `categories` 固定返回 3 条
- `categoryCode` 全局唯一，供其他接口引用
- `coverImage` 供首页策略卡和分类头图复用
- `context` 接口建议可缓存

---

## 5. 首页接口

### 5.1 `GET /api/redline/market-view`

只返回首页当前状态。

### 响应示例

```json
{
  "summary": "增长修复中，风险偏好温和",
  "matchedCategoryCode": "CORE_DIVIDEND"
}
```

### 后端要求

- `summary` 用于首页顶部说明当前市场情况
- `matchedCategoryCode` 表示当前市场匹配的策略分类
- `matchedCategoryCode` 必须属于 `categories`

### 前端拼装方式

- 本期推荐卡：使用 `matchedCategoryCode` 去 `context.categories` 中匹配
- 其他策略卡：从 `context.categories` 中排除 `matchedCategoryCode` 后得到

---

## 6. 资产列表页接口

### 6.1 `GET /api/redline/strategies/{categoryCode}`

返回当前分类页专属数据。

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `categoryCode` | string | 是 | 策略分类编码 |

### 响应示例

```json
{
  "categoryCode": "CORE_DIVIDEND",
  "metric": {
    "annualDividendAmountBy100k": 5000,
    "attributes": [
      {
        "label": "策略属性",
        "value": "均衡底仓"
      },
      {
        "label": "波动感受",
        "value": "中低"
      },
      {
        "label": "适配环境",
        "value": "平衡"
      }
    ]
  },
  "assetList": [
    {
      "assetId": "asset_001",
      "assetName": "央企红利精选",
      "tags": ["底仓", "稳定现金流"],
      "annualDividendAmountBy100k": 4800
    },
    {
      "assetId": "asset_002",
      "assetName": "沪深高股息篮子",
      "tags": ["均衡", "长期配置"],
      "annualDividendAmountBy100k": 5100
    }
  ]
}
```

### 后端要求

- `categoryCode` 必须合法
- `assetList` 当前不需要描述字段
- `annualDividendAmountBy100k` 返回整数即可

---

## 7. 对比页接口

### 7.1 `GET /api/redline/strategy-comparison`

返回对比页当前状态。

### 响应示例

```json
{
  "dividendCompare": {
    "items": [
      {
        "categoryCode": "CORE_DIVIDEND",
        "annualDividendAmountBy100k": 5000,
        "dividendYield": 5
      },
      {
        "categoryCode": "BOND_LIKE_DIVIDEND",
        "annualDividendAmountBy100k": 4000,
        "dividendYield": 4
      },
      {
        "categoryCode": "CYCLICAL_DIVIDEND",
        "annualDividendAmountBy100k": 7000,
        "dividendYield": 7
      }
    ]
  },
  "mapping": {
    "nodes": [
      {
        "categoryCode": "BOND_LIKE_DIVIDEND",
        "xValue": 0.18,
        "yValue": 0.26
      },
      {
        "categoryCode": "CORE_DIVIDEND",
        "xValue": 0.5,
        "yValue": 0.5
      },
      {
        "categoryCode": "CYCLICAL_DIVIDEND",
        "xValue": 0.82,
        "yValue": 0.76
      }
    ],
    "matchedCategoryCode": "CORE_DIVIDEND"
  },
  "explanations": [
    {
      "categoryCode": "CORE_DIVIDEND",
      "summary": "当前市场下，更适合作为兼顾分红稳定性与底仓属性的优先关注方向。",
      "reasonPoints": [
        "增长修复中，风险偏好温和。",
        "相比类债红利更有收益弹性。",
        "相比周期红利，波动和回撤更可控。"
      ]
    },
    {
      "categoryCode": "BOND_LIKE_DIVIDEND",
      "summary": "当风险偏好偏弱、市场更重视稳定收息时，类债红利更适合作为防御型方向。",
      "reasonPoints": [
        "盈利与分红稳定性更强。",
        "利率下行阶段更容易体现配置价值。",
        "适合更重视回撤控制的环境。"
      ]
    },
    {
      "categoryCode": "CYCLICAL_DIVIDEND",
      "summary": "当增长预期明显回升、风险偏好持续改善时，周期红利更容易体现盈利与分红弹性。",
      "reasonPoints": [
        "增长回升，景气方向更受关注。",
        "周期资源品的盈利弹性更强。",
        "适合对波动容忍度更高的阶段。"
      ]
    }
  ]
}
```

### 后端要求

- `dividendCompare.items` 固定返回 3 条
- 分类名称由前端从 `context.categories` 补齐
- 分红区标题由前端本地文案维护，不由服务端返回
- 当前高亮分类只保留一个来源：`matchedCategoryCode`
- `mapping.nodes` 只需要返回坐标
- 分类解释直接随 `strategy-comparison` 返回，不再拆单独接口

---

## 8. 前后端约定

### 8.1 前端复用规则

- 页面标题、策略名称、标签、CTA 文案尽量从 `context` 获取
- 页面接口只负责返回当前页面状态和数值

### 8.2 后端实现建议

- `context` 可缓存
- 页面接口返回尽量稳定，避免重复塞入静态文案
- 若后续增加第四类策略，优先扩展 `context.categories` 和相关页面状态字段
