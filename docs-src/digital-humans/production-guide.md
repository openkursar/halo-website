# 制作生产级数字人

> 本文面向有一定技术背景的用户。帮助你从"能跑通 demo"升级到"可以稳定运行的生产级数字人"。借助 AI，即使没有编程经验也能完成大部分操作。

---

## 为什么 AI 浏览器不够用

很多人第一次创建数字人时，会让 AI 浏览器去操作页面——点击、填表、截图。这在探索阶段没问题，但在生产环境会遇到三个无法回避的问题：

| 问题 | 说明 |
|------|------|
| **token 消耗巨大** | 每次 DOM 快照都要消耗大量 token，频繁运行成本极高 |
| **响应慢** | 每个操作步骤都依赖 AI 实时推理，整体延迟高 |
| **不确定性高** | AI 每次推理路径不同，同样的操作结果可能不一致 |

**结论：AI 浏览器只适合一次性操作或探索阶段。** 生产环境中，AI 不能直接操作页面——所有重复性操作必须封装进 Skill 脚本，由脚本确定性执行。脚本内部用 API 调用还是 DOM 操作都可以，关键是 AI 不参与逐步推理。

---

## 正确架构：AI 编排，Skill 执行

生产级数字人的核心原则只有一句话：

> **AI 负责编排，Skill 负责执行。**

AI 的工作是：读取配置 → 调用 Skill A → 读结果 → 决定下一步 → 调用 Skill B。所有复杂的浏览器交互（DOM 操作、XHR 拦截、表单提交）都封装在确定性的 Skill 脚本中，AI 不直接碰页面。

```
AI 数字人
├── system_prompt    → 编排逻辑（编号步骤 + 精确工具调用）
├── Skill 脚本       → 确定性执行（XHR 拦截、API 调用）
└── memory_schema    → 状态持久化（已处理记录、上次运行时间）
```

---

## 制作流程：四个阶段

### 第一阶段：侦察

在写任何代码之前，先用 AI 浏览器交互式了解目标平台。

**要搞清楚的事情：**
- 完整的操作路径（搜索 → 列表 → 详情 → 动作）
- 哪些页面需要登录，哪些不需要
- 每个用户操作背后调用了哪个 API 接口（用 `browser_console` 观察 XHR 请求）
- 平台是否有 CSRF Token、Session Token 或频率限制

::: warning URL Token 陷阱
部分平台要求 URL 中携带 Session 级别的安全 Token。直接拼接 `/item/{id}` 访问会被 302 跳转到首页。如果 AI 浏览器点击跳转正常、但直接访问 URL 失败，就是这个原因——Skill 必须捕获并传递这些 Token。
:::

### 第二阶段：Skill 开发

Skill 是封装好的确定性脚本，每个 Skill 负责一个具体操作。

**数据采集优先走 XHR 拦截，而非 DOM 抓取：**

```js
// 推荐：拦截平台自身 API 响应，直接拿结构化 JSON
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this.__captured_url = url
  return origOpen.call(this, method, url, ...rest)
}
// 触发平台 UI 动作 → 收集拦截到的 API 响应
```

**执行操作可以用封装的 DOM 操作：**

对于点击按钮、提交表单等动作，Skill 脚本内部直接操作 DOM 完全没问题。脚本是确定性的 JavaScript，不依赖 AI 实时推理，三个问题都不存在。

```js
// Skill 脚本内部封装点击、填表等操作 —— 这是可以的
document.querySelector('[data-testid="submit-btn"]').click()
```

AI 只需调用一次 `browser_run`，不参与任何 DOM 决策。

**Skill 返回的链接必须包含安全 Token：**

```js
// 正确：完整链接，含 Token
link: `${baseUrl}/${item.id}?token=${encodeURIComponent(item.security_token)}`

// 错误：裸链接，会被拦截
link: `${baseUrl}/${item.id}`
```

**每个 Skill 脚本必须满足：**
1. 是单个 `async (params) => { ... }` 箭头函数
2. 返回 JSON 可序列化的结果
3. 失败时返回 `{ success: false, error: "..." }`，不抛出异常
4. 在 `finally` 块中清理所有拦截器

### 第三阶段：Spec 设计（system_prompt）

system_prompt 是数字人的"工作手册"。针对弱模型的核心规则：

1. **编号步骤，不用段落。** 每一步 = 一次工具调用。
2. **写出精确调用语法。** 写 `browser_run({ file: "...", params: {...} })`，不要写"调用搜索 Skill"（模糊）。
3. **显式列出禁止项。** 弱模型会自由发挥，必须逐一禁止：
   - 禁止自己拼接 URL
   - 禁止用 Skill / Task 工具调用浏览器 Skill（必须用 `browser_run`）
   - 禁止用 `browser_click` / `browser_fill` 操作 Skill 已处理的输入框
4. **首次导航用 `browser_new_page`。** 自动化运行启动时没有活跃页面。
5. **每步独立错误处理。** 失败时明确说明：跳过 / 停止 / 报告。

**system_prompt 结构模板：**

```
你是...（一句话角色描述）
严格按照下面的步骤执行，不要跳步，不要自由发挥。

## 禁止事项
- 禁止...（逐条列出）

## 配置
从 User Configuration（JSON）读取。缺失项使用默认值：
- key: 默认值

## 第一步：（操作名称）
1. 调用：browser_new_page({ url: "..." })
2. 等待页面加载
3. 检查返回值：失败 → 停止；成功 → 继续

## 第二步：...

## 最后一步：更新记忆并报告
```

### 第四阶段：测试

**用最弱的目标模型（如 Qwen）运行，验证零自由发挥。** 如果弱模型都能严格按步骤执行，强模型更不会出问题。

---

## 用 AI 辅助创建生产级数字人

你不需要从零手写 spec。在 Halo 对话中使用下面的提示词，AI 会自动理解提示工程的设计要求，并和你讨论细节：

```
生成一个 [名称] 数字人，背景是：[背景描述]
数字人的主要功能是：[功能描述]
目标：[目标]

可参考下面的经典设计案例：
- 小红书互动数字人：https://github.com/openkursar/digital-human-protocol/tree/main/packages/digital-humans/xiaohongshu-ai-engager
- 会议室预订数字人：https://github.com/openkursar/digital-human-protocol/tree/main/packages/digital-humans/meeting-room-booker

进行提示工程优化，参考 Halo 内置的浏览器自动化设计手册的设计思路。
有任何细节和我讨论。
生成一个高质量、100% 完整的数字人。
```

::: tip
使用 Claude Sonnet 或更强的模型生成，质量更高。AI 会主动询问你平台的 API 细节、登录方式、操作频率等关键信息，不要跳过这些讨论。
:::

---

## 标杆案例解析

下面是两个完整的生产级数字人案例，包含全部源码，可以直接参考或复制。

---

### 案例一：小红书 AI 互动数字人

定期搜索指定关键词下的笔记，用 AI 生成个性化评论并发布。

**核心设计要点：**

- **搜索 Skill**：拦截小红书搜索 API 的 XHR 响应，返回含完整安全 Token 的帖子链接
- **评论 Skill**：通过 `execCommand` + Vue 内部机制注入文字，而非模拟键盘输入
- **去重机制**：`memory_schema` 中的 `commented_posts` 记录已评论帖子 ID，避免重复操作
- **禁止项**：明确禁止 AI 自己拼接 `/explore/{id}` 格式的 URL（会被平台拦截）

::: details spec.yaml（点击展开）
<<< @/examples/xiaohongshu-ai-engager/spec.yaml
:::

::: details Skill：搜索帖子 xhs-search — XHR 拦截 + Pinia store 触发搜索
<<< @/examples/xiaohongshu-ai-engager/skills/xhs-search/index.js
:::

::: details Skill：发表评论 xhs-comment — execCommand 注入 + XHR 拦截确认
<<< @/examples/xiaohongshu-ai-engager/skills/xhs-comment/index.js
:::

---

### 案例二：会议室自动预订数字人

典型的企业内网自动化案例。**完全走 API 接口**，没有任何 DOM 操作。每天自动预订 14 天窗口内的会议室，按楼层优先级查找，支持预检查和结果验证。

::: info
以下源码中的 URL 和公司名称已脱敏处理，实际使用时替换为你自己的内网地址即可。
:::

**核心设计要点：**

- **五个 Skill**，各负责一个 API 操作：查用户信息、查会议室、预订、查已有预订、取消预订
- **memory_schema** 持久化已预订日期，避免重复预订
- **system_prompt** 严格禁止所有 DOM 操作，AI 只做编排

::: details spec.yaml（点击展开）
<<< @/examples/meeting-room-booker/spec.yaml
:::

::: details Skill：获取用户信息 meeting-get-user-info
<<< @/examples/meeting-room-booker/skills/meeting-get-user-info/index.js
:::

::: details Skill：查询可用会议室 meeting-get-rooms
<<< @/examples/meeting-room-booker/skills/meeting-get-rooms/index.js
:::

::: details Skill：执行预订 meeting-book-room
<<< @/examples/meeting-room-booker/skills/meeting-book-room/index.js
:::

::: details Skill：查询已有预订 meeting-get-my-bookings
<<< @/examples/meeting-room-booker/skills/meeting-get-my-bookings/index.js
:::

::: details Skill：取消预订 meeting-cancel-booking
<<< @/examples/meeting-room-booker/skills/meeting-cancel-booking/index.js
:::

---

## 反模式（来自真实失败案例）

| 反模式 | 发生了什么 | 修复方案 |
|--------|-----------|---------|
| 裸 URL 导航 | 平台要求 URL 含 Session Token，直接访问 `/item/{id}` 被 302 跳转到首页 | Skill 返回含 Token 的完整 URL；Spec 明确写"使用 item.link" |
| 模糊的 Skill 调用 | AI 用了 `Skill("xxx")` 工具而非 `browser_run`，导致找不到 Task ID | Spec 明确写 `browser_run({ file: "..." })`，并禁止使用 Skill / Task 工具 |
| 用 DOM 操作输入表单 | AI 用 `browser_click` + `browser_fill` 操作评论框，与框架响应式产生竞态条件 | 专用 Skill 内部完整处理"输入 → 提交 → 确认"全流程 |
| Skill 失败后尝试补救 | AI 额外截图 + 点击"确认"，反而造成更多问题 | Spec 规定："success: false → 跳过，禁止任何补救操作" |
| 登录状态误判 | 数据采集 API 无需登录可用，但操作 API 需要登录；Skill 误报 `logged_in: true` | 单独检查登录状态，不能从只读访问推断登录状态 |
| 首次导航未创建新页面 | AI 调用 `browser_navigate` 时没有活跃页面 → 报错 | Spec 规定：第一步使用 `browser_new_page` |

---

## 上线前检查清单

- [ ] 所有平台交互都在 Skill 脚本中，不在 AI 提示词里
- [ ] Skill 返回完整数据，链接中包含安全 Token
- [ ] Spec 使用编号步骤，包含精确的 `browser_run` 调用语法
- [ ] Spec 有 `## 禁止事项` 章节，逐条列出禁止行为
- [ ] Spec 使用 `browser_new_page` 进行首次导航
- [ ] 每个步骤都有明确的失败处理（跳过 / 停止 / 报告）
- [ ] `memory_schema` 覆盖去重字段和 `last_run_time`
- [ ] 用最弱的目标模型（如 Qwen）测试通过——零自由发挥
