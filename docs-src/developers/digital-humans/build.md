---
title: "教程：做一个浏览器自动化数字人"
description: "教程：把 Halo 的 OA 审批示例改造成一位在你登录的网页系统里工作的数字人，用到随包浏览器脚本、记忆和安全的默认设置。"
type: tutorial
audience: [developer]
---

# 教程：做一个浏览器自动化数字人

在这篇教程里，你会把一个示例改造成一位在你登录的网页系统里工作的数字人。示例是一个办公系统的审批助手：每 30 分钟列出你的待审批事项，处理符合规则的，其余的整理成报告。过程中你会接触到生产级数字人的每个部分：spec、随包的浏览器脚本、记忆、登录，以及安全的默认设置。

## 开始之前 {#before-you-start}

- 已经设置好 AI 模型的 Halo。
- 一个你在浏览器里登录使用的网页系统，例如审批、工单或 CRM 系统，并且可以用浏览器的开发者工具查看它的页面。
- 想自己动手改脚本的话，需要一点 JavaScript 基础。也可以让 Halo 替你改。

## 1. 下载示例 {#download}

下载 [oa-approval-agent.zip](/downloads/oa-approval-agent.zip)，解压到你的工作区文件夹里：

```text
oa-approval-agent/
├── spec.yaml                 数字人本身
├── README.md
└── skills/
    ├── oa-todo-list/         脚本：列出待审批事项
    ├── oa-approve/           脚本：同意或拒绝一项
    └── oa-approved-list/     脚本：列出已审批事项，用于核对
```

::: warning 示例不能直接运行
其中的地址、接口路径和字段名都是占位符，例如 `your-oa.example.com`。第 4 步会把它们换成你的系统的。
:::

## 2. 读懂 spec {#spec}

打开 `spec.yaml`，重点看五部分：

- **`requires.skills`** 把三个脚本声明为随包技能，它们会和数字人一起安装到它工作区的 `.claude/skills/` 下，提示词里 `browser_run` 调用的就是这些路径。
- **`system_prompt`** 是一套操作流程：先列出禁止事项，再列出编号步骤。每一步都写明确切的调用，例如 `browser_run({ file: ".claude/skills/oa-todo-list/index.js", params: { pageSize: 30 } })`，以及失败时怎么办。最后一步用 `report_to_user` 汇报。
- **`config_schema`** 是设置表单。`auto_approve` 是默认 `false` 的 `boolean`，所以在你打开它之前，数字人只汇报、不操作。`max_approvals_per_run` 限制一次运行最多处理多少项。
- **`memory_schema`** 记录 `processed_todos`，保证同一项不会被处理两次，还记录上次运行时间和累计数量。
- **`browser_login`** 写明系统的地址，Halo 会请你在那里登录。

每个字段的说明见 [spec 参考](/developers/digital-humans/spec)。

## 3. 读懂一个浏览器脚本 {#script}

打开 `skills/oa-todo-list/index.js`。它是一个 `async (params) => { … }` 函数，在已登录的页面里运行：

```js
async (params) => {
  const { pageSize = 30 } = params || {}
  try {
    const resp = await fetch(`https://your-oa.example.com/api/todo/list?pageSize=${pageSize}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!resp.ok) {
      return { success: false, status: resp.status, error: resp.status === 401 ? 'not logged in' : `HTTP ${resp.status}` }
    }
    const data = await resp.json()
    return { success: true, todos: data.list ?? [] }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
```

脚本用你登录后的会话调用系统自己的接口，而且从不抛出异常：每种结果都以 `{ success, … }` 返回，提示词就能分清「未登录」和其他失败。这里是文件的简化版；完整规则见[浏览器脚本](/developers/digital-humans/production#browser-scripts)。

## 4. 改造成你的系统 {#adapt}

先找出你的系统发出的请求：在浏览器里登录它，打开开发者工具的 **Network**（网络）面板，筛选 **Fetch/XHR**，然后同意或拒绝一项。记下每个请求的地址、方法、请求体和响应里的字段。

然后用下面两种方式之一改造这个包：

- **让 Halo 来改。** 在这个工作区的会话里说：「把 oa-approval-agent 文件夹里的数字人改造成适配我们 `<YOUR_SYSTEM_URL>` 的审批系统。待办列表来自 `<LIST_REQUEST>`，审批一项会发送 `<APPROVE_REQUEST>`。修改三个脚本、`browser_login` 和 `system_prompt` 第一步里的地址，spec 的其余部分保持不变。」
- **自己动手改。** 在每个 `index.js` 里替换基础地址、接口路径和字段名。在 `spec.yaml` 里设置 `browser_login[].url`，以及 `system_prompt` 第一步里的地址。

如果某个操作需要页面上的令牌，比如表单字段里的 CSRF 令牌，就让脚本在调用接口之前先从页面读出它。

## 5. 导入并登录 {#import}

1. 在 Halo 里打开 **数字人**，点 **创建数字人**，选择 **导入**，把 `oa-approval-agent` 文件夹（或它的 `.zip`）拖进去。导入会把随包脚本和数字人一起安装。
2. 打开新的数字人，进入 **能力与设置**，填写关键词设置。**自动审批**（`auto_approve`）保持关闭。
3. 在数字人的 **工作动态** 上方，点你的系统对应的 **打开并登录** 完成登录。

## 6. 测试 {#test}

1. 在数字人页面点 **立即运行**。
2. 打开 **工作动态**，查看这次运行的报告。`auto_approve` 关闭时它只给建议：报告列出它打算同意和拒绝的事项，你的系统里不会有任何改动。
3. 报告说未登录时，用 **打开并登录** 重新登录。脚本失败时，错误信息就在报告里，按[开发和调试脚本](/developers/digital-humans/production#script-debugging)排查。
4. 几份报告都和你自己的判断一致后，把关键词收窄到少量安全的范围，再打开 **自动审批**。

::: done
现在这位数字人每 30 分钟自动检查一次你的系统，只处理符合规则的事项，每次最多 `max_approvals_per_run` 项，其余的整理成报告交给你。
:::

## 7. 分享 {#share}

在桌面版的数字人页面点 **⋮ › 分享 › 导出**，得到 `.dhpkg` 包；也可以提交到商店，审核通过后上架，见[发布到商店](/developers/store-publishing)。分享到公司以外之前，先删掉公司的地址和名称。

## 排查问题 {#troubleshooting}

| 现象 | 怎么做 |
|---|---|
| 报告说 OA 登录已过期（HTTP 401） | 用 **打开并登录** 重新登录。会话会在系统那边过期 |
| `Path not allowed` | 脚本不在工作区或它的 `.claude/skills/` 文件夹里。请用 **创建数字人 › 导入** 安装这个包，技能才会放进工作区 |
| 数字人不自己运行 | 检查 `subscriptions`（示例按 `every: "30m"` 运行），并确认它没有被暂停。它还有未回答的提问时（比如请你重新登录），定时运行也会被跳过：在 **工作动态** 里回答它 |
| 同一项被处理了两次 | 最后一步必须在汇报之前把处理过的 id 写进记忆 |

## 下一步 {#next-steps}

- [生产级数字人](/developers/digital-humans/production)：经得起考验的提示词、记忆和脚本
- [数字人 spec 参考](/developers/digital-humans/spec)：全部字段
- [DHP 协议](/developers/dhp)：数字人包的结构
