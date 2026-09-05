---
title: "WebSocket 事件协议"
description: "Halo Server 的 WebSocket 实时事件协议：连接握手、鉴权、订阅会话、事件信封，以及承载 AI 流式思考与结果的 agent:* 频道。"
---
# WebSocket 事件协议

Halo Server 的 API 是**异步、事件驱动**的。当你通过 HTTP 向 Agent 或数字人发送消息后，AI 的**思考过程**与**最终结果**不会同步返回，而是通过 **WebSocket** 实时推送。本页说明这套实时协议。

> 桌面版/远程版前端本身就是这套 API 的客户端。下文描述的协议与 Halo 前端使用的完全一致，可直接作为参考实现。

---

## 连接

WebSocket 端点挂在固定路径 `/ws` 上，相对于服务的部署根：

```
wss://<host>/ws
```

若服务部署在反向代理路径前缀下（如 `/fc-xxxx/`），WebSocket 路径**相对于部署根**，即：

```
wss://<host>/fc-xxxx/ws
```

> 前端按「应用被挂载的目录」推导基址（`new URL('.', document.baseURI)`），把 `http`→`ws` / `https`→`wss` 后追加 `/ws`，从而自动保留反向代理前缀。集成方应采用相同策略。

连接建立后**尚未鉴权**——必须先完成鉴权握手，才能订阅和接收事件。

---

## 消息格式

所有消息都是 JSON 文本帧。客户端发往服务端的消息形如：

```json
{ "type": "<type>", "payload": { ... } }
```

服务端发往客户端的消息形如下文各节所示。

---

## 鉴权握手

连接打开后，客户端**第一步**发送 `auth` 消息，携带与 HTTP 相同的服务访问令牌：

```json
{ "type": "auth", "payload": { "token": "<token>" } }
```

服务端响应：

- 成功：
  ```json
  { "type": "auth:success" }
  ```
- 失败：
  ```json
  { "type": "auth:failed", "error": "Invalid token" }
  ```
  随后服务端会**主动关闭**连接（约 100ms 后）。

> WebSocket 鉴权使用**消息内令牌**，而不是 HTTP 的 `Authorization` 头。令牌值与 HTTP Bearer 完全相同（即服务访问令牌）。
> 未鉴权的连接若发送 `subscribe`，会收到 `{ "type": "error", "error": "Not authenticated" }`。

---

## 订阅会话

事件是**按会话（conversation）**派发的。鉴权成功后，订阅你关心的 `conversationId`：

```json
{ "type": "subscribe", "payload": { "conversationId": "<conversationId>" } }
```

取消订阅：

```json
{ "type": "unsubscribe", "payload": { "conversationId": "<conversationId>" } }
```

**应订阅哪个 `conversationId`？**

- **通用 Agent**：使用你调用 `POST /api/agent/message` 时所用的 `conversationId`。
- **数字人默认对话**：使用 `app-chat:{appId}`。
- **数字人按终端用户隔离的对话**：使用你在 `POST /api/apps/:appId/chat/send` 请求体中传入的那个自定义 `conversationId`（**不是**该端点响应里回显的默认值）。

> 订阅是连接级状态。客户端断线重连后需**重新发送 `auth` 与所有 `subscribe`**（Halo 前端在重连后会自动重订阅之前的全部会话）。

---

## 事件信封

服务端推送的实时事件统一采用如下信封：

```json
{
  "type": "event",
  "channel": "<channel>",
  "data": { ... }
}
```

- `channel`：事件频道名（见下表）。
- `data`：事件负载。**对话级事件的 `data` 中始终包含 `spaceId` 与 `conversationId`**（服务端在转发前注入），客户端据此把事件归并到正确的会话。

只有**已鉴权**且**已订阅对应 `conversationId`** 的客户端，才会收到该会话的对话级事件。

---

## agent:* 频道（流式思考与结果）

承载 AI 流式输出的频道均以 `agent:` 开头。这些是对话级事件——按 `data.conversationId` 路由。数字人对话与通用 Agent 共用同一套频道。

| 频道                    | 含义                                       |
| ----------------------- | ------------------------------------------ |
| `agent:turn-start`      | 一轮生成开始                               |
| `agent:session-info`    | 会话信息（如捕获到的 SDK sessionId）       |
| `agent:thought`         | 一条完整的思考 / 中间步骤                  |
| `agent:thought-delta`   | 思考的增量 token（流式）                   |
| `agent:message`         | 助手消息内容                               |
| `agent:tool-call`       | AI 发起一次工具调用                        |
| `agent:tool-result`     | 工具调用返回结果                           |
| `agent:mcp-status`      | MCP 服务器状态变化（见下方说明：全局广播）  |
| `agent:compact`         | 上下文压缩事件                             |
| `agent:ask-question`    | AI 抛出 `AskUserQuestion`，等待作答        |
| `agent:complete`        | 本轮生成完成                               |
| `agent:error`           | 生成过程中出错                             |

> **关于 `agent:mcp-status`**：与其它 `agent:*` 频道不同，该频道以**全局广播**形式推送给所有已鉴权客户端（其 `data` 不含 `conversationId`，也不按订阅过滤）。上表中其余 `agent:*` 频道均为会话级（按 `data.conversationId` 路由）。

> **最简集成流程**：发送 `POST /api/agent/message`（或 `chat/send`）拿到 ack → 监听 `agent:thought` / `agent:message` 渲染过程 → 收到 `agent:complete` 视为结束 → 收到 `agent:ask-question` 时用 `POST /api/agent/answer-question` 作答 → 收到 `agent:error` 做错误处理。

### App / 全局广播频道

部分事件面向**所有已鉴权客户端**广播（不限会话，`data` 不要求含 `conversationId`）。数字人生命周期相关的频道有：

| 频道                       | 含义                     |
| -------------------------- | ------------------------ |
| `app:status_changed`       | App 状态变化             |
| `app:activity_entry:new`   | 新增一条活动记录         |
| `app:escalation:new`       | 新的升级（escalation）请求 |
| `app:deleted`              | App 被永久删除           |

---

## 心跳

客户端可发送：

```json
{ "type": "ping" }
```

服务端回应：

```json
{ "type": "pong" }
```

---

## 完整示例（伪代码）

```js
const ws = new WebSocket("wss://host/fc-xxxx/ws")

ws.onopen = () => {
  // 1. 鉴权
  ws.send(JSON.stringify({ type: "auth", payload: { token: "<token>" } }))
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)

  if (msg.type === "auth:success") {
    // 2. 订阅目标会话
    ws.send(JSON.stringify({
      type: "subscribe",
      payload: { conversationId: "app-chat:<appId>" }
    }))
    // 3. 触发一次对话（通过 HTTP）
    //    POST /api/apps/<appId>/chat/send { spaceId, message }
  }

  if (msg.type === "event") {
    switch (msg.channel) {
      case "agent:thought":   /* 渲染思考 */ break
      case "agent:message":   /* 渲染回复 */ break
      case "agent:complete":  /* 本轮结束 */ break
      case "agent:error":     /* 错误处理 */ break
    }
  }
}
```

---

## 相关页面

- [HTTP API 参考](./api-reference.md) —— 触发生成与读取状态的 HTTP 端点。
