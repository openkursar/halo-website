---
title: "生产级数字人制作指南：提示词、记忆与浏览器脚本"
description: "让 Halo 数字人稳定地无人值守运行：按步骤写系统提示词，用记忆避免重复，用浏览器脚本自动化网站，处理登录，并给不可撤销的操作设限。"
type: how-to
audience: [developer]
---

# 生产级数字人

一个在演示里跑通的数字人，每天早上自己运行时仍可能出问题。本页汇总让它稳定运行的做法：哪里交给 AI 判断、哪里交给脚本执行，怎么写指令和记忆，怎么用浏览器脚本自动化网站，以及上线前要检查什么。

## 原则：AI 做判断，脚本做执行 {#principle}

让 AI 在网站上一步步点击，探索阶段没问题，放到每天的运行里就撑不住：

- **成本**：每一步都要重新读取页面快照，消耗大量 token。
- **速度**：每一步都要等模型推理。
- **稳定性**：模型每次可能走不同的路径。

所以要分工。AI 读取配置和记忆、决定做什么、调用脚本、读结果、再决定下一步。所有重复、精确的操作，比如调用网站的接口、填写表单、提取表格，都放进每次做法都一样的脚本里：

```text
数字人
├── system_prompt   → 计划：编号步骤和确切的工具调用
├── 浏览器脚本       → 重复性操作，放在技能文件夹里
└── memory_schema   → 两次运行之间要记住的内容
```

## 把系统提示词写成操作流程 {#system-prompt}

系统提示词是数字人了解要做什么的唯一来源。每次都用同样的结构：

1. **角色**：用一句话说明它负责什么。
2. **配置**：它用到 `config_schema` 里的哪些设置、怎么用。每次运行都会拿到当前的值。
3. **禁止事项**：绝不能做的事，以及哪些事要先等人决定。
4. **编号步骤**：每一步写明调用哪个工具或脚本、传什么参数，以及每种结果怎么处理。
5. **最后一步**：更新记忆，然后用 `report_to_user` 汇报。

`report_to_user` 是一次运行告诉用户发生了什么的方式。请有意识地选择类型：

| 类型 | 用于 |
|---|---|
| `run_complete` | 运行结束，不需要用户做什么。出错时也用它，说清哪里出了问题 |
| `run_skipped` | 这次没有要做的事 |
| `milestone` | 发生了重要的事，运行继续 |
| `escalation` | 需要人来决定。运行会等待回答 |
| `output` | 产出了文件或报告，说明放在哪里 |

桌面通知按数字人的 **消息与通知 › 系统通知** 级别发送，默认只在里程碑、提问和产出时通知。外部通知（邮件、企业微信、飞书、钉钉、Webhook）由 AI 决定何时发送，经由 **设置 › 消息通道** 里配置的通道发出。想让它一定发送，就把它写成一个步骤，例如「订单被拒绝时，通知销售通道」。

## 记住做过的事 {#memory}

每位数字人都有自己的记忆文件，每次运行开始时载入。用 `memory_schema` 描述要记什么；这些描述是给 AI 的指引，不会被校验：

```yaml
memory_schema:
  processed_ids:
    type: array
    description: 已经处理过的条目 id，遇到就跳过；只保留最近 500 个。
  last_run_at:
    type: date
    description: 上次运行结束的时间。
  consecutive_failures:
    type: number
    description: 连续失败的次数。成功一次后归零。
```

- **避免重复**：用已处理 id 的列表（简单，但要限制长度），或者用「上次看到的时间」（紧凑，但要求条目有可靠的时间字段）。
- **记录失败次数**，连续失败几次后就提问，而不是每天悄悄失败。
- 把「更新记忆」单独作为一个编号步骤，放在汇报之前，这样中途失败的运行不会记下没做完的事。

用户可以查看这个文件，也可以在数字人页面用 **清除记忆** 清空。清空不会影响工作区里的文件。

## 浏览器脚本（`browser_run`） {#browser-scripts}

浏览器脚本是一个 JavaScript 文件，数字人用 `browser_run` 工具在 Halo 内置浏览器的页面里运行它。重复的网页任务靠它变得又快又稳定。

### 什么时候该写脚本 {#when-to-script}

- 同样的步骤会反复执行，每天一次或者每个条目一次。
- 任务需要真正的流程控制：遍历数量不定的行、按页面内容分支、重试。
- 你希望一次调用就完成读取、计算并返回结构化数据，而不是让 AI 去读页面快照。

只做一次的简单操作，用交互工具（`browser_navigate`、`browser_snapshot`、`browser_click`、`browser_fill`）更简单，而且每一步之后都会重新检查页面。

### 文件格式 {#script-format}

```js
async (params) => {
  const rows = document.querySelectorAll(params.rowSelector)
  return Array.from(rows).map((row) => row.innerText.trim())
}
```

- 文件里只有一个箭头函数，写成 `async`。Halo 会用你的 `params` 调用它。不要自己调用它，右花括号 `}` 之后也不要再写任何内容。
- `params` 是一个 JSON 对象，不能携带页面快照里的元素：请传选择器或文字，在脚本里自己找到元素。
- 脚本在页面里运行，和浏览器开发者工具控制台里的代码一样：可以用 `document`、`window`、`fetch` 和页面自己的 cookie，不能用 `require`、`import` 和 Node.js 模块。
- 返回普通的 JSON。DOM 元素和函数会变成 `{}`。抛出的错误会以 `Script execution failed: <message>` 返回。
- 返回清楚的结构，例如 `{ success: true, items: [...] }` 或 `{ success: false, error: "not logged in" }`，这样提示词可以写明每种情况怎么处理。

脚本可以用 `fetch` 调用网站自己的接口；因为在页面里运行，请求会带上用户登录后的会话。网站没有可用的接口时，就直接读写页面（DOM）。

### 文件放在哪里 {#script-location}

`browser_run` 的参数是 `{ file, params, timeout }`，只运行以下位置的文件：

- 数字人所在工作区文件夹里的任何位置，包括它的 `.claude/skills/<技能>/` 文件夹（为这个工作区安装的技能就放在这里）；
- 工作区上级文件夹里的 `.claude/skills/`，或者你个人主目录下的 `.claude/skills/`。

其他位置的文件都会被拒绝，提示 `Path not allowed`。使用 Halo 默认的配置文件夹时，为所有工作区安装的技能也在此列。`file` 用相对路径时从工作区文件夹算起，而且文件名必须以 `.js` 结尾。

要让脚本随数字人一起分发，就把它们放进一个技能，并声明为随包附带，这样它会被安装到同一个工作区：

```yaml
requires:
  skills:
    - id: order-tools
      bundled: true
      files: [SKILL.md, list-orders.js, approve-order.js]
```

在包里，这些文件放在 `skills/order-tools/` 下。见 [DHP 协议](/developers/dhp)。技能在工作区里的文件夹以它 `SKILL.md` 中的 `name` 命名，所以 `name`、`skills/` 下的文件夹名和 `requires.skills` 里的 `id` 请用同一个小写英文名：提示词就是按这个路径调用脚本的。

### 超时 {#script-timeout}

`timeout` 以毫秒为单位：默认 60000，最小 1000，最大 120000。它只限制工具等待多久。超时之后脚本仍在页面里继续运行，所以请给脚本里自己的 `fetch` 设置超时；万一卡住，下一步之前先重新打开页面。

### 开发和调试脚本 {#script-debugging}

1. 先在打开的页面上用一次性的 `browser_evaluate` 调用把逻辑跑通。它的运行方式相同，只是不用来回读写文件。
2. 把跑通的函数体保存成允许位置下的 `.js` 文件。
3. 用一小组安全的 `params` 调用 `browser_run`，把结果和第 1 步对比。
4. 只有写成文件后才失败时，检查格式：漏了 `async`、`}` 后面还有内容，或者 `params` 的键名对不上。
5. 报错信息说明不了原因时，立即运行 `browser_inspect`，不要先跳转页面：`target: "console"` 显示页面记录的错误，`target: "network"` 配合 `resourceTypes: ["fetch", "xhr"]` 显示请求和响应。

## 需要登录的网站 {#login}

- 在 `browser_login` 里声明每个网站。Halo 会在数字人的 **工作动态** 上方显示提示和 **打开并登录** 按钮，**能力与设置** 里的 **所需登录** 也会列出这些网站。用户在那里登录，数字人永远拿不到密码。
- 这台电脑上，所有数字人和主对话共用同一个浏览器配置。在任何地方登录，大家都能用；在任何地方退出，大家都会退出。**设置 › 系统 › 清除浏览器数据** 会一次退出所有网站。
- Halo 不会检查用户是否真的登录了，也无法知道网站何时结束了会话。请让脚本识别登录页并返回 `{ success: false, error: "not logged in" }`，并让提示词在这种情况下提问，而不是反复重试。
- 有些网站会把会话和浏览器类型绑定。数字人切换到移动版视图（`device: "h5"`）后登录失效的话，请在它实际运行的视图里重新登录。
- 登录状态不会跟着换电脑：把 Halo 搬到新电脑后，要在那里重新登录。

## 给不可撤销的操作加上保护 {#safety}

对于会审批、预订、发送、付款或删除的数字人：

- 在 `config_schema` 里加一个开关，例如 `auto_approve`（`boolean`，默认 `false`）。开关关闭时，提示词只报告它打算做什么。
- 在提示词里列出禁止事项，配置没有允许的事一律要用 `escalation` 提问。
- 用 `max_actions_per_run` 这样的设置限制每次运行的操作数量。
- 过期的回答会造成损害时，设置 `escalation.timeout_hours`。不设置时，提问会一直等到有人回答。
- `escalation.enabled` 没有效果，数字人随时都可以提问。它能自主做多少，完全取决于提示词允许多少。

## 测试和观察 {#testing}

- 在数字人页面点 **立即运行**，然后在 **工作动态** 里查看这次运行：每次运行都会列出它的汇报和提问。
- 想通过 API 查看一次运行的每一步，用 [`GET /api/apps/:appId/runs/:runId/session`](/developers/api/digital-human#get-api-apps-appid-runs-runid-session)。
- 先打开「只报告」开关运行几次，对照你自己会怎么做来检查结果，再让它真正执行。

## 上线前检查 {#checklist}

- [ ] 提示词的每一步都写明了工具或脚本，并处理了失败。
- [ ] 重复的网页操作是随包技能里的脚本，而不是一步步点击。
- [ ] 记忆能防止重复，并在汇报之前更新。
- [ ] 需要登录的网站都写进了 `browser_login`，脚本能识别会话过期。
- [ ] 不可撤销的操作放在默认关闭的开关后面，并限制了每次运行的数量。
- [ ] 触发方式已经设置：`schedule`、带 `path` 的 `file`，或带 `secret` 的 `webhook`。见 [spec 参考](/developers/digital-humans/spec#field-subscriptions)。
- [ ] spec、设置默认值和随包的文件里都没有 API Key、密码或 webhook secret。发布前的检查只在系统提示词里找几种常见的密钥格式（见[发布预检](/developers/store-publishing#preflight)），别指望它兜底；导出不做任何检查。

## 相关页面 {#related}

- [数字人 spec 参考](/developers/digital-humans/spec)
- [教程：做一个浏览器自动化数字人](/developers/digital-humans/build)
- [编写技能](/developers/skills)
- [AI 浏览器](/features/ai-browser)：用户视角下的内置浏览器
