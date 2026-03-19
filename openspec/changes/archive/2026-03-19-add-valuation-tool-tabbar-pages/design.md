## Context

宝倍估值当前已经形成三个核心用户目标页：估值首页、自选基金、我的持仓，但这三个页面之间仍通过页面内按钮和普通路由跳转互相连接。结果是用户进入任一页后缺少稳定的一层导航，只能依赖“返回”“去首页”“去找基金”等局部动作完成切换，既增加心智负担，也让页面底部同时承担业务动作和全局导航两种职责。

项目已经有一套自定义 tabbar 机制：`pages.config.ts` 打开了自定义 tabbar，`src/layouts/tabbar.vue` 负责渲染，`src/composables/useTabbar.ts` 维护 tab 配置与激活状态。目前这套机制只服务于应用级 `home/about` 两个页面，尚未支持“某个产品域内部拥有一套独立 tabbar 页面组”的场景。本次变更本质上是在现有机制上扩展出“估值工具专属 tabbar”。

## Goals / Non-Goals

**Goals:**
- 让宝倍估值首页、自选基金、我的持仓成为估值工具内的三个一级 tabbar 页面。
- 在三个一级页面底部始终展示同一套 3-tab 导航，并保持当前页高亮。
- 保持搜索页、详情页、编辑页、同步页等二级页面不展示这套 tabbar，避免层级混乱。
- 收敛一级页面中的重复导航入口，让页面内按钮只承载业务动作，不再兼任一级导航。
- 尽量复用现有 `layout: 'tabbar'` 与 `useTabbar` 机制，避免再造一套平行导航系统。

**Non-Goals:**
- 不把搜索页、详情页、同步持仓页、编辑页升级为 tabbar 页面。
- 不改动应用级 `home/about` 的产品结构和视觉表现之外的需求。
- 不在本次设计中引入原生 tabBar 多套配置或新的外部导航依赖。

## Decisions

### Decision: Extend the existing custom tabbar model to support multiple tab groups
继续复用 `layout: 'tabbar'` 和 `src/layouts/tabbar.vue`，但把 `useTabbar` 从“单一全局数组”改成“按场景输出 tab 配置”的模型。估值工具的三个一级页面继续使用同一个 `tabbar` layout，由路由名或页面分组决定实际展示 `app` tabbar 还是 `valuation-tool` tabbar。

Rationale:
- 现有项目已经验证了自定义 tabbar layout 的运行方式，继续沿用能减少页面接入成本。
- 如果重新发明一套“估值工具底栏组件”，会与 `pages.config.ts` 的自定义 tabbar 机制并存，增加维护复杂度。
- 用“tab group”建模后，应用级 tabbar 和估值工具级 tabbar 可以共存，后续若还有子产品也可复用。

Alternatives considered:
- 方案 A：在估值工具三个页面底部手写一个普通固定栏组件。优点是实现快，缺点是会绕开现有 tabbar 生命周期和 `pushTab` 语义，不利于长期维护。
- 方案 B：直接改原生 `pages.config.ts` tabBar list 为估值工具页面。优点是简单，缺点是会破坏当前应用首页的既有 tabbar 结构，影响范围过大。

### Decision: Treat valuation home, watchlist, and portfolio as first-level pages; keep all other valuation pages as second-level pages
仅 `valuation-tool/index.vue`、`valuation-tool/watchlist.vue`、`valuation-tool/holdings.vue` 接入 tabbar layout，并定义稳定的 tab 名称。搜索、详情、同步、编辑、上传、诊断等页面继续使用 default layout，通过普通路由从一级页面进入。

Rationale:
- 用户需求只针对三个核心总览页建立常驻切换。
- 二级任务页如果也展示 tabbar，会让用户误以为自己仍处于首页上下文，容易造成“编辑中切 tab 丢状态”的问题。
- 一级 / 二级边界清晰后，返回策略也更容易统一。

Alternatives considered:
- 把搜索页也纳入 tabbar。这样虽然可达性更高，但搜索是任务型页，不适合作为一级持续停留页面。
- 让详情页继承 tabbar。这样会削弱详情页的沉浸式阅读和底部业务动作栏空间。

### Decision: Replace duplicated page-level primary navigation with tabbar-first navigation
首页现有的“底部去自选/去持仓”导航职责应被 tabbar 接管；保留按钮时只承载业务快捷操作，不再重复提供与 tabbar 等价的一级跳转。自选页和持仓页的空态返回动作，也优先回到估值首页 tab，而不是通过 `replace('/subPages/valuation-tool/index')` 手工跳转。

Rationale:
- 同一页面同时出现“tabbar 导航”和“等价入口按钮”会造成信息重复。
- 一级导航回归 tabbar 后，页面内 CTA 才能聚焦在搜索、同步、编辑等真实任务。

Alternatives considered:
- 保留所有原按钮跳转不动。优点是兼容旧路径，缺点是会让新的 tabbar 价值被稀释，用户仍难以形成稳定心智。

### Decision: Use route-name-based matching for active tab and navigation
估值工具的 tab item 应绑定到稳定的路由名，例如 `valuation-tool-home`、`valuation-tool-watchlist`、`valuation-tool-holdings`，切换时通过 `router.pushTab({ name })` 或等价封装完成。layout 在 mounted / route change 时根据当前 route name 同步 active 状态。

Rationale:
- 现有 app tabbar 已基于 route name 激活，延续同样规则最自然。
- 相比 page path 字符串，route name 在当前项目的 `definePage` 体系里更稳定、可读性更高。

Alternatives considered:
- 以 path 字符串判断当前 tab。可行，但更容易受 query、别名和重构影响。

## Risks / Trade-offs

- [Risk] `useTabbar` 当前是单一全局状态，直接扩展可能影响现有 `home/about` 行为。
  → Mitigation: 明确引入 tab group 概念，并让默认 app tabbar 行为保持兼容；为现有首页 tabbar 做回归验证。

- [Risk] 页面从 `default` layout 切到 `tabbar` layout 后，底部安全区和现有固定操作栏可能互相遮挡。
  → Mitigation: 逐页检查首页、自选、持仓底部留白；只让详情页等二级页面保留业务固定栏。

- [Risk] 用户从二级页面返回一级页面时，tab 激活状态可能不同步。
  → Mitigation: 在 layout 或 `useTabbar` 内基于当前 route name 统一推导 active tab，而不是只依赖点击事件更新。

- [Risk] 首页的底部业务入口移除后，用户可能暂时不适应。
  → Mitigation: 保留首页搜索与热搜等主任务入口，并让 tabbar 标题清晰表达“首页 / 自选 / 持仓”。

- [Trade-off] 继续复用自定义 tabbar 机制，短期实现成本低，但要求我们把当前简单的 `useTabbar` 重构成更通用模型。
  → Mitigation: 在任务拆分中先完成 tabbar 模型升级，再逐页接入，降低改动耦合。
