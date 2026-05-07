# 第二章：改造一个数字人

做数字人不是从零开发。

你要做的是：找一个最像的现成数字人 → 改一下 → 跑起来。半小时搞定一个。

这一章给你两个案例 + 两条路。读完你能独立做出 80% 场景的数字人。

---

## 先理解两件事

### 1. 做数字人 = 复制改

任何一个数字人都是从一个模板演化出来的。

你**不需要**坐下来设计字段、查协议规范、写架构文档。你需要：

1. 找一个最接近你需求的现成数字人
2. 让 AI 帮你改成你要的（或者自己手动改）
3. 装到 Halo 测试，跑通就行

### 2. 数字人分两类

| 类型 | 包结构 | 适合做 | 难度 |
|---|---|---|---|
| **纯 prompt 型** | 只有 `spec.yaml` | 公开网站采集、命令行任务、邮件摘要、监控 | 简单 |
| **Halo Browser Action 型** | `spec.yaml` + `skills/` | 操作内部系统、OA、CRM、自动化审批/提单 | 中等 |

::: tip 什么是 Halo Browser Action？

一种**特殊的 Skill**，本质是在 Halo 浏览器里跑的 JS 脚本。

当数字人需要稳定地操作复杂网页（内部 OA、ITSM、CRM 等），AI 直接操作会慢、贵、不稳定。这时把具体操作封装成 JS 脚本——也就是 Halo Browser Action，AI 只负责"什么时候调"，脚本负责"具体怎么做"。

详细模式见 [第三章 3.1](./guide-03-reference.md#_3-1-halo-browser-action-四种模式)。这一章先用案例感受一下。
:::

### 3. 两个案例覆盖两类

| 案例 | 类型 | 适合改造成 |
|---|---|---|
| **HN Daily Brief** | 纯 prompt 型 | 定时摘要、爬公开网站、跑命令行 |
| **OA 审批助手** | Halo Browser Action 型 | 操作内部系统、API 自动化、审批流转 |

下面分别介绍。

---

## 案例一：HN Daily Brief

📦 **下载**：[hn-daily-brief.zip](/downloads/hn-daily-brief.zip)

### 它能干什么

每天定时打开 Hacker News，读前 10 条热门，写成摘要，通过邮件/桌面通知发送。

### 包结构

解压后：

```
hn-daily-brief/
  └── spec.yaml          ← 全部内容只有这一个文件
```

纯 prompt 型——没有 `skills/` 目录，没有 JS 代码。AI 用内置的浏览器能力自己干活。

### 适合改造成什么

任何"读一个公开网站 → 整理 → 推送"的场景：

- 监控某个博客的新文章
- 抓取某个开源项目的 release notes
- 定时整理 Reddit / V2EX / 即刻热门
- 监控招聘网站的新岗位
- 爬取竞品官网的更新

只要不需要登录、不需要复杂的页面操作，纯 prompt 型就够了。

---

### 路 A：让 AI 帮你改（推荐）

这是最快的方式。半小时一个数字人。

**Step 1** — 把 zip 解压到一个文件夹，记住路径，比如：

```
/Users/yourname/Downloads/hn-daily-brief/
```

**Step 2** — 在 Halo 对话里贴下面这段（替换方括号里的内容）：

````
参考这个数字人：/Users/yourname/Downloads/hn-daily-brief/

帮我做一个新数字人：

名称：[你的数字人名字，比如「即刻热门日报」]
描述：[一句话，比如「每天早上整理即刻热门话题，发邮件给我」]

目标网址：[你要抓的网站 URL]

核心功能：
  - [功能 1，越具体越好]
  - [功能 2]
  - [功能 3]

触发频率：[每天早上 9 点 / 每 2 小时一次 / ...]

输出渠道：[邮件 / 桌面通知 / 企微]
````

::: tip 描述要详细

AI 越清楚你要什么，生成质量越高。模糊的描述会让 AI 自由发挥。

❌ "做一个热门话题摘要"
✅ "每天 9 点打开 jike.com，读前 20 条热门，按互动数排序，每条用一句话总结，整体不超过 600 字"
:::

**Step 3** — 等 AI 生成完，让它跑一次：

```
跑一次这个数字人，检查每一步执行情况，报错了自己修。
```

AI 会自测、自修。你在旁边看，偶尔指出"这里逻辑不对"。

**Step 4** — 跑通后告诉 Halo：

```
保存这个数字人，安装到 Halo。
```

完成。

---

### 路 B：自己手动改

适合你已经熟悉了这个模板、或者只想改几个小地方。

打开 `spec.yaml`，按下面这几处改：

**B.1 改顶部信息**

```yaml
name: "HN Daily Brief"          # ← 改成你的数字人名字
description: "Summarizes..."     # ← 一句话描述
author: "openkursar"             # ← 改成你自己
```

**B.2 改触发频率**

```yaml
subscriptions:
  - source:
      type: schedule
      config:
        cron: "0 8 * * *"        # ← 改这里
        # 常用：
        # cron: "0 9 * * *"   每天早上 9 点
        # cron: "0 */2 * * *" 每 2 小时
        # 或者用 every: "1h" "1d" "7d"
```

**B.3 改 system_prompt（最重要）**

`system_prompt` 是给 AI 的工作指令。可以放心改的是每一步的**业务描述**——把"打开 Hacker News"换成你的目标网站，把"前 10 条"换成你需要的条数。

⚠️ **不要改这些地方**：

- 编号步骤的结构（如果原来是 1/2/3/4，保持这种结构，不要改成自然语言段落）
- `call report_to_user(type="run_complete")` 这种工具调用语法（删了不发通知）
- "保持简洁，纯文字"这类输出格式约束（删了输出会很长）

**B.4 改 config_schema**

```yaml
config_schema:
  - key: email                  # ← 字段名
    label: "收件邮箱"            # ← 给用户看的标签
    type: email
    required: true
```

需要让用户填的字段写在这里。比如你要监控的网站如果不固定，可以加一个 `target_url` 字段，让用户安装时填。

**B.5 安装测试**

文件夹拖进 Halo Apps → 导入 → 手动触发一次 → 看运行日志。

---

### HN 案例常见问题

**Q：跑起来 AI 找不到内容**
A：目标网站结构变了，或者你描述的网页结构和实际不符。让 AI 重新看一遍网页结构再改 prompt。

**Q：输出太长**
A：prompt 里加一句"输出不超过 X 字"或者"按 Markdown 列表格式，每条不超过 1 行"。

**Q：每天发的内容差不多没变化**
A：检查是不是漏配 memory，让数字人记住上次发了什么，避免重复。详见 [3.3 memory_schema 设计模式](./guide-03-reference.md#_3-3-memory-schema-设计模式)。

---

## 案例二：OA 审批助手

📦 **下载**：[oa-approval-agent.zip](/downloads/oa-approval-agent.zip)

::: warning 这是脱敏案例

这个案例的 URL、接口路径、字段名都是占位符（`your-oa.example.com` 等），**不能直接跑起来**。你需要：

1. 把它当作模板和参考
2. 替换成自己公司 OA 系统的真实地址
3. 根据自己 OA 的 API 结构调整 Skill 代码

如果你的 OA 系统 API 结构差别很大，建议用路 A 让 AI 重新生成 Skill。
:::

### 它能干什么

每 30 分钟检查公司 OA 待办平台：

- 拉取待审批列表
- 按你配置的关键词规则自动同意/拒绝（可选）
- 把待人工处理的项目整理成报告发给你
- 你可以直接对话："批准第 2 个"、"全部同意"、"拒绝包含 XX 的"

### 包结构

解压后：

```
oa-approval-agent/
  ├── spec.yaml
  └── skills/
      ├── oa-todo-list/         ← 查待审批列表
      │   ├── SKILL.md
      │   └── index.js          ← Halo Browser Action 代码
      ├── oa-approve/           ← 执行审批
      │   ├── SKILL.md
      │   └── index.js
      └── oa-approved-list/     ← 查已审批列表
          ├── SKILL.md
          └── index.js
```

`skills/` 目录里每个子目录就是一个 **Halo Browser Action**。它们是 JS 脚本，由 AI 在合适的时机调用。

### 适合改造成什么

任何"操作内部 Web 系统 + 自动化决策"的场景：

- 公司 OA 自动审批
- ITSM 工单自动分类、自动处理
- 内部数据平台定时取数 + 报表
- 企微/钉钉日报、周报自动收集
- DevOps 平台的发布单自动操作
- 客户关系管理（CRM）的线索分配

---

### 这个数字人为什么需要 Halo Browser Action

你可能问：让 AI 直接打开 OA 网页点按钮不行吗？

理论上行，实际三个问题：

| 问题 | 说明 |
|---|---|
| **慢** | AI 每次都要看一遍页面、推理点哪、再点击。一次审批 30 秒起步。 |
| **贵** | 每次页面快照都消耗大量 token。频繁运行成本极高。 |
| **不稳定** | AI 每次推理路径不同，可能点错、跳过、卡在弹窗上。 |

**解决方法**：把"查列表"、"点同意"、"点拒绝"这些操作封装成 JS 脚本（Halo Browser Action），AI 只负责"什么时候调哪个"。

这样一次审批是几百毫秒，不消耗推理 token，逻辑稳定。

---

### 包里有什么：spec.yaml 关键部分

打开 `spec.yaml`，重点关注这几段：

**1. 声明依赖的 Browser Action**

```yaml
requires:
  skills:
    - id: oa-todo-list           # ← 查待办的 Action
      bundled: true
      files: [SKILL.md, index.js]
    - id: oa-approve             # ← 执行审批的 Action
      bundled: true
      files: [SKILL.md, index.js]
    - id: oa-approved-list       # ← 查已审批的 Action
      bundled: true
      files: [SKILL.md, index.js]
```

**2. system_prompt 编排逻辑**

```yaml
system_prompt: |-
  你是一名 OA 待办审批助手...

  ## 禁止事项
  - 禁止用 browser_click / browser_fill 操作 OA 页面
  - 禁止用 Skill 工具或 Task 工具调用 skill。只能用 browser_run
  - 禁止自己拼接 OA API URL 或直接 fetch 接口

  ## 第一步：建立浏览器会话
  browser_new_page({ url: "https://your-oa.example.com" })

  ## 第二步：获取待审批列表
  browser_run({
    file: ".claude/skills/oa-todo-list/index.js",
    params: { pageSize: 30, withDetail: true }
  })

  ## 第三步：分析与分类
  ...

  ## 第四步：执行自动审批（仅 auto_approve 开启时）
  browser_run({
    file: ".claude/skills/oa-approve/index.js",
    params: { todoId: <id>, action: "approve", memo: "..." }
  })

  ## 第六步：更新记忆并生成报告
  ...
```

::: tip 注意这种写法

- 每一步都是**精确的工具调用语法**（写成 `browser_run({...})`，而不是模糊的"调用查待办脚本"）
- **禁止事项**这一节是 AI 不"自由发挥"的关键。删了它，弱模型会自己拼 URL 直接调 API。
- 每一步都有明确的**错误处理**（success: false → 怎么办）

这是 Halo Browser Action 型数字人的标准 prompt 公式。详细说明见 [3.2 system_prompt 完整公式](./guide-03-reference.md#_3-2-system-prompt-完整公式)。
:::

**3. 配置项**

```yaml
config_schema:
  - key: auto_approve
    label: 自动审批                # ← 是否启用自动审批
    default: "false"
  - key: auto_approve_keywords
    label: 自动同意关键词           # ← 标题含这些词的自动同意
    placeholder: "服务器申请, 权限开通"
  - key: auto_reject_keywords
    label: 自动拒绝关键词           # ← 标题含这些词的自动拒绝
    placeholder: "测试工单, 演示申请"
  - key: max_approvals_per_run
    label: 单次最大审批数
    default: 10                    # ← 防止误操作的安全阀
```

**4. 记忆字段**

```yaml
memory_schema:
  processed_todos:                 # ← 已处理过的 todo ID，防止重复
    type: array
  last_run_at:                     # ← 上次运行时间
    type: date
  stats:                           # ← 累计统计
    type: object
```

**5. 浏览器登录入口**

```yaml
browser_login:
  - url: https://your-oa.example.com
    label: 公司 OA 待办平台
```

声明这个数字人需要用户提前登录 OA。安装后用户点详情页的地球图标，会看到这个入口。

---

### 包里有什么：一个 Halo Browser Action 长什么样

打开 `skills/oa-todo-list/index.js`，看看一个 Browser Action 的真实样子（简化版示例）：

```js
async (params) => {
  const { pageSize = 30, pageIndex = 1, withDetail = false } = params || {}

  try {
    // 调用 OA 的待办接口
    const resp = await fetch(
      `https://your-oa.example.com/api/todo/list?pageSize=${pageSize}&pageIndex=${pageIndex}`,
      {
        method: 'GET',
        credentials: 'include',      // ← 关键：自动带上浏览器登录 cookie
        headers: { 'Accept': 'application/json' }
      }
    )

    if (!resp.ok) {
      return {
        success: false,
        error: `HTTP ${resp.status}：未登录或登录已过期`
      }
    }

    const data = await resp.json()
    const todos = data.list || []

    // 如果要详情，再批量拉详情
    if (withDetail) {
      for (const todo of todos) {
        const detailResp = await fetch(
          `https://your-oa.example.com/api/todo/detail/${todo.id}`,
          { credentials: 'include' }
        )
        if (detailResp.ok) {
          todo.detail = await detailResp.json()
        }
      }
    }

    return {
      success: true,
      todos,
      total: data.total
    }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}
```

几个**不能删**的关键点（详见 [3.1 模式 A：API 代理型](./guide-03-reference.md#_3-1-halo-browser-action-四种模式)）：

| 关键点 | 删了会怎样 |
|---|---|
| `credentials: 'include'` | 请求不带 cookie，OA 返回 401 |
| `try / catch` | 出错时崩溃，AI 不知道发生了什么 |
| `return { success: false, error }` | AI 无法判断成败，会盲目继续 |
| `async (params) => { ... }` 箭头函数形式 | 不是有效的 Browser Action 格式 |

---

### 路 A：让 AI 帮你改（推荐）

**Step 1** — 解压到本地，记住路径：

```
/Users/yourname/Downloads/oa-approval-agent/
```

**Step 2** — 在 Halo 对话里贴：

````
参考这个数字人：/Users/yourname/Downloads/oa-approval-agent/

帮我做一个新数字人：

名称：[你的数字人名字，比如「公司 ITSM 工单助手」]
描述：[一句话，比如「自动处理 ITSM 待办工单」]

目标地址：[目标系统真实 URL，比如 https://itsm.mycompany.com]
（这个系统需要提前登录）

核心功能：
  - 每 [X 分钟/小时] 拉取一次待办列表
  - [按什么规则自动处理：关键词匹配 / 申请人匹配 / 内容包含 / ...]
  - [自动操作：同意 / 拒绝 / 转发 / 备注]
  - 把处理不了的项目整理报告发给我

我已经手动操作过这个系统，发现关键接口如下：
  - 查待办：GET [真实接口路径]
  - 审批：POST [真实接口路径]
  - 查已办：GET [真实接口路径]

或者：

我还不清楚接口，请你先帮我打开网站观察一遍，
找出查待办、操作待办的接口。
````

::: tip 关键提示

- **目标地址说明需要登录**——AI 会自动配置 `browser_login`
- **如果你已经知道接口**就贴出来——AI 直接照着写，质量高
- **如果不知道接口**就让 AI 先去侦察——AI 会用浏览器打开网站，观察 XHR 请求，找出接口

侦察方法详见 [3.4 调试和排错](./guide-03-reference.md#_3-4-调试和排错)。
:::

**Step 3** — 让 AI 自测：

```
你跑一次这个数字人，依次调用每个 Halo Browser Action 测试一下。
如果某个 Action 报错（比如 401、404、字段不对），自己改代码，改完再跑，
直到所有 Action 都能正常返回数据。
```

AI 会自动迭代。常见的修复：

- 报 401 → 提醒你去登录 OA
- 报 404 → URL 拼错了，自己改
- 返回字段不对 → 调整解析逻辑
- 接口结构猜错了 → 让 AI 真正打开网站观察一次

**Step 4** — 测试 prompt 编排：

```
现在用 dry-run 模式跑一次完整流程（auto_approve = false），
看 prompt 里每一步执行是不是符合预期。
```

确认编排没问题后，再考虑要不要开启自动审批。

**Step 5** — 安装：

```
保存这个数字人，安装到 Halo。
```

记得在数字人详情页点地球图标，把目标 OA 登录一次。

---

### 路 B：自己手动改

熟手才走这条。需要改的地方比 HN 案例多。

**B.1 改 spec.yaml 顶部和触发**

和 HN 案例一样改 `name` / `description` / `author` / `subscriptions`。

**B.2 改 browser_login**

```yaml
browser_login:
  - url: https://your-real-oa.com    # ← 改成真实 URL
    label: 你的 OA 系统名
```

**B.3 改 skills/ 目录里的 Action**

这是最关键的一步。每个 Action 文件夹里的 `index.js` 都要改：

```js
// 1. 改 URL
const resp = await fetch(
  `https://your-real-oa.com/api/your-real-endpoint`,  // ← 改
  { ... }
)

// 2. 改请求参数（如果接口要求不同的参数格式）

// 3. 改响应解析（你的接口返回的字段名可能不一样）
const todos = data.list || []   // ← 改成你的字段路径
```

::: warning 一定保留这些

- `credentials: 'include'`
- `try / catch` 错误处理
- `return { success: false, error }` 失败返回格式
- 箭头函数 `async (params) => { ... }` 包裹
:::

**B.4 改 SKILL.md**

每个 Action 目录里还有一个 `SKILL.md`，是给 AI 看的"说明书"——告诉它这个 Action 干什么、参数是什么、返回什么。改成对应你新接口的描述。

**B.5 改 system_prompt**

system_prompt 里有大量"调用 oa-todo-list"、"调用 oa-approve"之类的引用。如果你的 Action 改了名字（比如 oa-todo-list → itsm-ticket-list），prompt 里也要全局替换。

**B.6 改 config_schema 和 memory_schema**

按你的业务需求改字段。比如你的 OA 不是按关键词审批，而是按部门审批，就把 `auto_approve_keywords` 改成 `auto_approve_departments`。

**B.7 安装测试**

```
1. 把改完的文件夹拖进 Halo Apps → 导入
2. 点详情页地球图标 → 登录目标 OA
3. 点「立即运行」手动触发一次
4. 看运行日志，定位问题
```

---

### OA 案例常见问题

**Q：报 401，提示未登录**
A：登录态没装好。点数字人详情页地球图标，进入目标 OA 登录一次。一般每周登录一次就够。

**Q：报 404，接口找不到**
A：URL 拼错了。打开目标 OA，用浏览器开发者工具（F12 → Network 标签）观察自己操作时调用了什么真实接口，改 Action 里的 URL。

**Q：AI 不调你的 Browser Action，自己点页面**
A：`system_prompt` 里的禁止事项被删了，或者步骤写得不够精确。回去检查这两个地方，加回禁止事项，把步骤改成精确的 `browser_run({...})` 语法。

**Q：自动审批审错了**
A：先把 `auto_approve` 关掉只跑汇报模式。等关键词规则调到 100% 准确，再开启自动审批。永远保留 `max_approvals_per_run` 安全阀。

**Q：跑得不稳定，时灵时不灵**
A：用 Qwen 这种弱模型跑一次。如果弱模型也能稳定跑，说明 prompt 写得够好。如果弱模型跑飞了，去补禁止事项。

---

## 还有其他类型的数字人？

这两个案例覆盖了大部分场景。如果你的需求是：

| 场景 | 看哪 |
|---|---|
| **从社交媒体抓数据**（小红书、微博、知乎搜索结果） | [第三章 3.1 模式 B：XHR 拦截型](./guide-03-reference.md#_3-1-halo-browser-action-四种模式) |
| **在网页上发内容**（评论、发帖、私信） | [第三章 3.1 模式 C：DOM 注入型](./guide-03-reference.md#_3-1-halo-browser-action-四种模式) |
| **复杂多步业务流转**（DPMS 类研发流水线） | [第三章 3.1 模式 D：混合型](./guide-03-reference.md#_3-1-halo-browser-action-四种模式) |
| **找不到类似的现成包** | 商店 / [GitHub 仓库](https://github.com/openkursar/digital-human-protocol) |

找到接近的模板，按这一章的方法改即可。

---

## 下一步

- 改完跑不通？卡在某个具体问题？→ [第三章：参考手册](./guide-03-reference.md)
- 想理解 Halo Browser Action 四种模式？→ [3.1 节](./guide-03-reference.md#_3-1-halo-browser-action-四种模式)
- 想看完整的 spec.yaml 字段说明？→ [DHP 协议](./dhp-protocol.md)
