---
title: "WebSocket 事件协议：实时接收 Halo 的进度"
description: "Halo WebSocket 事件参考：连接与鉴权、订阅会话、哪些事件发给谁、事件信封，以及全部事件频道和终端实时流。"
type: reference
audience: [developer]
---

# WebSocket 事件

Halo 通过 WebSocket 实时推送进度：正在生成的回复、思考与工具调用、等待回答的问题，以及数字人、团队、文件和终端的变化。HTTP API 负责发起操作，WebSocket 负责告诉你接下来发生了什么。Halo 的网页版和安卓客户端用的就是这套协议。

## 连接 {#connect}

WebSocket 和 HTTP API 在同一个地址和端口上，路径是 `/ws`：

```text
ws://<HOST>:<PORT>/ws
```

把 [HTTP API 的基础地址](/developers/api/#base-url) 中的 `http` 换成 `ws`（`https` 换成 `wss`），再加上 `/ws`。如果服务挂在反向代理的路径前缀下，前缀要保留，例如 `wss://<HOST>/<PATH_PREFIX>/ws`。桌面版只有在开启 **启用远程访问** 时才接受连接。

## 鉴权 {#auth}

连接建立后还没有鉴权。第一条消息发送访问密码：

```json
{ "type": "auth", "payload": { "token": "<ACCESS_PASSWORD>" } }
```

成功时收到：

```json
{ "type": "auth:success" }
```

失败时收到下面这条消息，约 100 毫秒后服务端关闭连接：

```json
{ "type": "auth:failed", "error": "Invalid token" }
```

- 密码放在消息里，不放在请求头里；它和 HTTP 请求用的是同一个访问密码。
- 鉴权失败与 HTTP 登录共用[锁定规则](/developers/api/#lockout)：同一 IP 连续失败会被暂时锁定，锁定期间的鉴权一律失败。
- 鉴权之前发送 `subscribe` 或终端消息，会收到 `{ "type": "error", "error": "Not authenticated" }`。
- 修改访问密码后，请重启 Halo，已经建立的连接才会断开。

## 消息格式 {#messages}

双方都发送 JSON 文本帧。客户端发出的消息形如 `{ "type": "…", "payload": { … } }`：

| `type` | `payload` | 作用 |
|---|---|---|
| `auth` | `{ "token": "<ACCESS_PASSWORD>" }` | 鉴权，必须是第一条消息 |
| `subscribe` | `{ "conversationId": "…" }` | 接收这个会话的全部事件 |
| `unsubscribe` | `{ "conversationId": "…" }` | 停止接收这个会话的详细事件 |
| `ping` | — | 服务端回复 `{ "type": "pong" }` |
| `terminal-input` | `{ "sessionId": "…", "data": "…" }` | 向终端会话发送按键，见[终端实时流](#terminal) |
| `terminal-resize` | `{ "sessionId": "…", "cols": 120, "rows": 32 }` | 调整终端大小 |
| `terminal-attach` | `{ "sessionId": "…" }` | 作为终端的查看者参与流量控制 |
| `terminal-detach` | `{ "sessionId": "…" }` | 退出流量控制 |
| `terminal-ack` | `{ "sessionId": "…", "charCount": 4096 }` | 确认已经渲染的字符数 |

服务端发出的消息有 `auth:success`、`auth:failed`、`error`、`pong` 和 `event` 五种。无法解析的消息和未知类型会被忽略。

跨电脑组队时，Halo 实例之间也走这个连接，但用的是团队邀请凭据和另外的消息类型（`auth:challenge`、`federation`）。用访问密码登录的客户端收不到这些消息，本页也不涉及。

## 哪些事件发给谁 {#delivery}

每个已鉴权的连接收到的事件分三类：

1. **订阅了的会话**：这个会话的全部事件，包括逐字生成的回复、思考和工具调用。
2. **所有会话的状态事件**：`agent:turn-start`、`agent:complete`、`agent:error`、`agent:ask-question`、`agent:goal-updated` 不需要订阅就会发给每个连接，便于显示“谁在运行、谁在等回答”。处理时按 `data.conversationId` 过滤。
3. **全局事件**：数字人、团队、文件、终端、通知等变化，发给每个连接。

订阅属于连接本身。断线重连后，要重新发送 `auth` 和每个 `subscribe`。

`conversationId` 用哪个：

- 与 Halo 助手的会话：会话的 ID，即调用 [`POST /api/agent/message`](/developers/api/conversation#post-api-agent-message) 时用的 `conversationId`。
- 与数字人的聊天：聊天线程的键。主线程是 `app-chat:<appId>`；其他线程用 [`POST /api/apps/:appId/chat/send`](/developers/api/digital-human#post-api-apps-appid-chat-send) 返回的 `conversationId`。

## 事件信封 {#envelope}

服务端推送的每个事件都是：

```json
{ "type": "event", "channel": "agent:message", "data": { } }
```

会话事件的 `data` 里总带有 `spaceId` 和 `conversationId`，可以据此把事件归到对应的会话和用户。

::: warning 事件内容可能很敏感
事件会带上文件路径、工具的输入输出、终端里打印的内容和通道配置。只在可信的服务端处理它们，不要原样转发给最终用户的浏览器。
:::

## 会话事件 {#conversation-events}

| 频道 | 何时发送 | `data` 中的主要字段 |
|---|---|---|
| `agent:turn-start` | 一轮任务开始 | `type: "turn-start"` |
| `agent:message` | 回复文本：新文本块开始、逐段增量、文本块结束、整轮最终回复 | `delta`、`content`、`isStreaming`、`isNewTextBlock`、`isComplete`，见[拼接回复文本](#assemble-reply) |
| `agent:thought` | 一个思考块或工具调用块开始，或一条完整的中间步骤 | `thought`：`id`、`type`（`thinking`、`text`、`tool_use`、`tool_result`、`system`、`result`、`error`）、`content`、`timestamp`，以及可选的 `toolName`、`toolInput`、`toolOutput`、`isError` |
| `agent:thought-delta` | 思考内容的增量，或某个思考块、工具输入、工具结果完成 | `thoughtId`，以及 `delta`，或 `content` 加 `isComplete`，或 `toolInput`、`toolResult` |
| `agent:tool-call` | 一次工具调用的参数已完整 | `id`、`name`、`status: "running"`、`input` |
| `agent:tool-result` | 工具调用返回 | `toolId`、`result`（字符串）、`isError` |
| `agent:ask-question` | 这一轮停下来向用户提问 | `id`、`questions`：每个问题有 `question`、`header`、`options`（`label`、`description`）和 `multiSelect` |
| `agent:complete` | 一轮结束，无论完成、失败还是被停止 | `duration`（毫秒），可选 `tokenUsage`：`inputTokens`、`outputTokens`、`cacheReadTokens`、`cacheCreationTokens`、`totalCostUsd`、`contextWindow` |
| `agent:error` | 出错 | `error`，可选 `errorCode`；`errorType` 为 `interrupted` 表示被中断，为 `working_dir_unavailable` 表示工作目录不可用（附 `workDirIssue`） |
| `agent:session-info` | 会话初始化 | `slashCommands`、`skills`、`agents`（都是字符串数组） |
| `agent:compact` | 上下文被压缩 | `trigger`（`manual` 或 `auto`）、`preTokens` |
| `agent:goal-updated` | 会话目标被设置或更新 | `goal`（`objective`、`doneWhen`、`status` 等，或 `null`）、`source`、`seenByModel` |
| `agent:api-retry` | 模型接口出错后开始重试，以及重试结束 | `retry`：`attempt`、`maxRetries`、`delayMs`、`errorStatus`、`errorKind`；结束时为 `null` |
| `agent:input-arrived` | 用户或即时通讯消息被记录进会话 | `messages`、`live` |
| `agent:input-stopped` | 停止操作作废了尚未处理的输入 | `messages` |
| `toolsets:changed` | 会话的某项能力被打开或关闭 | `toolsetId`、`action`（`open` 或 `close`）、`openedBy`、`open`（当前打开的能力） |
| `toolsets:requested` | AI 请用户打开某项能力 | `toolsetId`、`displayName` |

### 拼接回复文本 {#assemble-reply}

`agent:message` 按以下规则组成一轮的回复：

1. 带 `delta` 的事件：把 `delta` 追加到当前文本。
2. 不带 `delta` 的事件：用 `content` 替换当前文本。`isNewTextBlock: true` 的事件 `content` 为空，表示新的文本块开始。
3. `isComplete: true` 的事件：`content` 就是这一轮的完整回复。
4. 随后的 `agent:complete` 表示这一轮结束。

一轮回复的典型事件序列（省略了 `spaceId` 和 `conversationId`）：

```json
{"type":"event","channel":"agent:message","data":{"type":"message","content":"","isComplete":false,"isStreaming":false,"isNewTextBlock":true}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":"这个工作区里有","isComplete":false,"isStreaming":true}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":" 3 个文件……","isComplete":false,"isStreaming":true}}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"这个工作区里有 3 个文件……","isComplete":true}}
{"type":"event","channel":"agent:complete","data":{"type":"complete","duration":8421}}
```

只需要最终答复时，取 `isComplete: true` 那条的 `content`；需要打字机效果时，按规则 1 和 2 实时更新显示。

## 全局事件 {#global-events}

### 数字人 {#digital-human-events}

| 频道 | 何时发送 | `data` 中的主要字段 |
|---|---|---|
| `app:status_changed` | 数字人的运行状态变化 | `appId`、`state`（`status`、`runningCount`、`nextRunAtMs`、`lastError` 等） |
| `app:list_changed` | 数字人被安装或卸载 | `appId`、`change`（`installed` 或 `uninstalled`） |
| `app:deleted` | 数字人被永久删除 | `appId` |
| `app:activity_entry:new` | 新增或更新一条活动记录 | `appId`、`entry`（`id`、`runId`、`type`、`ts`、`content`） |
| `app:escalation:new` | 数字人在运行中提出问题，等人回答 | `appId`、`entryId`、`question`、`choices`；团队场景还有 `teamId`、`epochId` |
| `app:escalation:resolved` | 问题已被回答 | `appId`、`entryId`、`response`（`choice`、`text`、`answers`） |
| `app:im-session-updated` | 数字人的某个聊天线程有新消息或变化 | `appId`、`channel`、`chatId`、`chatType`、`instanceId`、`lastMessage`（截取前 50 个字符） |

### 团队 {#team-events}

| 频道 | 何时发送 | `data` 中的主要字段 |
|---|---|---|
| `team:updated` | 团队、成员或运行状态变化 | `teamId`，以及 `team`、`changed`、`liveStatus`、`removed` 等 |
| `team:blackboard` | 看板新增任务、发现或活动 | `teamId`、`epochId`、`kind`（`task`、`finding`、`activity`） |
| `team:message` | 成员之间发了一条消息（只含元数据，不含正文） | `teamId`、`epochId`、`fromAppId`、`toAppId`、`messageId`、`ts` |
| `team:presence` | 跨电脑团队中电脑的在线状态变化 | `teamId`、`nodes` |
| `team:office-status` | 跨电脑团队暂停、恢复或需要更新等 | `teamId`、`kind` |
| `team:member-history` | 某位成员的聊天记录有更新，客户端应重新读取 | `teamId`、`appId`、`epochId` |

### 文件、知识库与系统 {#other-events}

| 频道 | 何时发送 | `data` 中的主要字段 |
|---|---|---|
| `artifact:tree-update` | 工作区文件树的某些目录有变化 | `spaceId`、`updatedDirs` |
| `artifact:changed-batch` | 一批文件被新建、修改或删除 | `spaceId`、`changes`（`type`、`path`、`relativePath`） |
| `tlon:ingest-progress` | 知识库索引进度 | `kbId`、`total`、`completed`、`phase`、`current`、`errors` |
| `tlon:stats-updated` | 知识库统计更新 | `kbId`、`stats` |
| `task:state_changed` | 任务面板的数据变化，没有负载，请重新读取 | — |
| `notification:toast` | Halo 显示一条通知 | `title`、`body`、`variant`、`duration`，以及相关的 `appId`、`teamId` 等 |
| `agent:mcp-status` | MCP 服务器状态变化 | `servers`（`name`、`status`、`tools`、`error` 等）、`timestamp` |
| `ai-sources:catalog-changed` | 模型来源的模型列表变化 | `sourceIds` |
| `credential:decrypt-failed` | 有凭据无法解密，需要用户重新填写 | `failures`（`path`、`label`），不含密文 |
| `im-channels:instance-updated` | 消息通道的配置被更新 | `instanceId`、`instance`（完整的通道配置） |
| `app:memory-pressure` | 内存压力级别变化 | `level`（`normal`、`low`、`critical`） |
| `ai-browser:active-view-changed` | AI 浏览器当前显示的页面变化 | `conversationId`、`spaceId`、`viewId`、`url`、`title` |
| `ai-browser:view-gone` | AI 浏览器的一个页面被关闭 | `viewId` |
| `ai-browser:conversation-released` | 某个会话释放了它的 AI 浏览器 | `conversationId` |

## 终端实时流 {#terminal}

终端会话的输出用 `terminal:data` 事件推送给每个连接：`data` 里有 `sessionId` 和一段原始终端输出（含 ANSI 转义序列）。`terminal:lifecycle` 报告会话的创建、退出、标题变化和移除，`data` 里有 `sessionId`、`type` 和 `info`。终端只在 macOS 和 Windows 上提供。

- **输入**：发送 `terminal-input`，`data` 是原始按键，`\r` 表示回车。它和 [`POST /api/terminal/input`](/developers/api/terminal#post-api-terminal-input) 效果相同，但每次按键不用发一个 HTTP 请求。
- **调整大小**：发送 `terminal-resize`，`cols` 和 `rows` 是正整数。
- **流量控制**：发送 `terminal-attach` 后，这个连接成为该会话的查看者，必须在渲染输出后用 `terminal-ack` 报告已经渲染的字符数。查看者积压的未确认输出太多时，终端会暂停输出，直到最慢的查看者跟上。不需要流量控制时不要发送 `terminal-attach`；用完后发送 `terminal-detach`。连接断开时会自动退出。
- **补齐历史**：连接之前已经输出的内容用 [`POST /api/terminal/replay`](/developers/api/terminal#post-api-terminal-replay) 读取。

终端输出可能包含 shell 里打印的任何内容，包括密钥。

## 心跳与重连 {#keepalive}

- 服务端每 15 秒发送一次 WebSocket 协议层的 ping，没有回应 pong 的连接会被断开。常见的 WebSocket 客户端会自动回应。
- 应用层可以发送 `{ "type": "ping" }`，服务端回复 `{ "type": "pong" }`。
- 断线后用退避间隔重连（Halo 网页版从 1 秒开始，每次加倍，最长 30 秒），然后重新鉴权并重新订阅。

## 完整示例 {#example}

下面的 Node.js 脚本（Node.js 22 及以上自带 WebSocket）鉴权、订阅一个会话，并实时打印回复：

```js
const conversationId = process.argv[2]
const ws = new WebSocket(process.env.HALO_URL.replace(/^http/, 'ws') + '/ws')
let text = ''

ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', payload: { token: process.env.HALO_TOKEN } }))
}

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data)
  if (msg.type === 'auth:failed') {
    console.error('Access password rejected')
    process.exit(1)
  }
  if (msg.type === 'auth:success') {
    ws.send(JSON.stringify({ type: 'subscribe', payload: { conversationId } }))
    return
  }
  if (msg.type !== 'event' || msg.data.conversationId !== conversationId) return

  if (msg.channel === 'agent:message') {
    if (typeof msg.data.delta === 'string') {
      text += msg.data.delta
      process.stdout.write(msg.data.delta)
    } else {
      text = msg.data.content ?? ''
    }
  }
  if (msg.channel === 'agent:complete') {
    console.log('\n[done]')
    ws.close()
  }
  if (msg.channel === 'agent:error') {
    console.error('\n[error]', msg.data.error)
    ws.close()
  }
}
```

运行前按[快速上手](/developers/quickstart)设置 `HALO_URL` 和 `HALO_TOKEN`，再执行 `node watch.mjs <CONVERSATION_ID>`。

## 相关页面 {#related}

- [HTTP API 概览](/developers/api/)：基础地址、鉴权和错误约定
- [快速上手](/developers/quickstart)：从开启远程访问到实时收到第一条回复
- [API：会话](/developers/api/conversation)：发起和停止任务
