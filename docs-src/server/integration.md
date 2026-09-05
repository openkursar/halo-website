---
title: "Halo Server 集成指南"
description: "把 Halo Server 作为 AI 智能体后端接入企业业务系统：数字人创建、会话隔离、结果获取（轮询 vs WebSocket）、多用户隔离、鉴权与错误处理。"
---
# 集成指南

本文面向**业务后端工程师**（如 Java 后端），讲解如何把 Halo Server 作为「数字员工」的 AI 智能体后端，接入自己的业务系统。

典型链路：

```
最终用户咨询  →  业务后台(Java)  →  Halo Server(数字人 Agent 处理)  →  返回结果
```

业务后台负责**用户身份、入口、UI 与同步阻塞/流式体验**；Halo Server 负责**运行数字人 Agent**（人格、工具、技能、记忆）。两者通过 HTTP + WebSocket API 对接。

---

## 基础约定

### 服务地址（Base URL）

所有调用都基于一个可配置的 **Base URL**。请把它做成配置项，不要写死。

- 直连：`http://<host>:8080`
- 经反向代理（平台常把服务挂在路径前缀下，如 `/fc-xxxx/`）：`https://<host>/fc-xxxx`

::: warning 路径前缀
当部署在反向代理的路径前缀下时，**所有** HTTP 接口和 WebSocket 都在该前缀之下。例如发送消息的实际路径是
`https://<host>/fc-xxxx/api/apps/<appId>/chat/send`，WebSocket 是
`wss://<host>/fc-xxxx/ws`。把 Base URL 设为 `https://<host>/fc-xxxx`，再拼接 `/api/...` 与 `/ws` 即可。
:::

### 鉴权

Halo Server 使用单一令牌鉴权，令牌即 `HALO_REMOTE_PASSWORD`（默认 `halo123`，生产环境务必改成强随机值，见[配置说明](./configuration.md)）。

所有 `/api/*` 调用都需带上标准 Bearer 头：

```http
Authorization: Bearer <token>
```

可选的登录校验接口（用于在正式调用前验证令牌是否正确）：

```http
POST /api/remote/login
Content-Type: application/json

{ "token": "<token>" }
```

成功返回 `{ "success": true }`。

::: tip 令牌即密码
这里没有「用户名 + 密码换取会话 token」的流程。`/api/remote/login` 只是校验令牌；真正的调用凭据始终是同一个 `<token>`，以 `Authorization: Bearer <token>` 携带。
:::

### 统一响应包络

REST 接口统一返回如下结构：

```json
{ "success": true, "data": { /* ... */ } }
```

失败时：

```json
{ "success": false, "error": "错误描述" }
```

调用方应先判断 `success`，再读取 `data`。

---

## 第一步：创建数字人（App）

「数字人」在 Halo 中对应一个 `type: automation` 的 **App**。它封装了这个智能体的人格（`system_prompt`）、可用工具/技能、记忆、权限等。

创建有两种方式：

1. **管理界面（推荐）**：在 Halo 的应用/数字人界面里创建并调试。这是最直观、最不易出错的方式，适合产品/运营配置好人格后交给业务系统调用。
2. **API 安装**：用 `POST /api/apps/install` 以编程方式安装。

一个最小化的 automation 数字人 spec：

```json
{
  "spaceId": "<spaceId>",
  "spec": {
    "type": "automation",
    "name": "客服助手",
    "version": "1.0.0",
    "author": "acme",
    "description": "电商客服数字员工，回答订单、物流、退换货问题。",
    "system_prompt": "你是 ACME 电商的客服助手。礼貌、简洁、准确地回答用户关于订单、物流、退换货的问题。无法确定时，引导用户提供订单号。",
    "store": {}
  }
}
```

通过 API 安装：

```http
POST /api/apps/install
Authorization: Bearer <token>
Content-Type: application/json

{ "spaceId": "<spaceId>", "spec": { /* 上面的 spec */ } }
```

返回：

```json
{ "success": true, "data": { "appId": "<appId>" } }
```

记下返回的 `appId` —— 后续所有对话调用都基于它。一个数字人（一个 `appId`）= 一种固定人格，服务于所有最终用户。

::: tip 数字人 spec 的完整字段
`system_prompt`、`config_schema`、`subscriptions`、`permissions`、记忆等完整字段，请参考[数字人文档](../digital-humans/overview)。本文聚焦「如何调用一个已创建好的数字人」。
:::

---

## 第二步：为每个最终用户分配 conversationId

这是多用户隔离的核心。

- **同一个数字人**（同一个 `appId`）服务于你的所有最终用户。
- 每个最终用户拥有**业务侧自己的会话标识** `conversationId`，由你定义命名方案，例如 `user-12345`、`order-svc-u12345` 等。
- **不同的 `conversationId` = 相互独立的会话上下文**（各自的对话历史、记忆窗口），但**共用同一个人格**。
- 老用户回来时**复用其 `conversationId`**，即可延续上下文；新用户则**分配一个新的 `conversationId`**。

Halo Server 内部把会话键定为 `app-chat:{appId}`（默认会话）或你传入的自定义 `conversationId`。两个不同的 `conversationId` 落在两个独立的 Agent 会话里，互不串话。

::: warning 默认会话 vs 自定义会话（务必理解）
如果**不传** `conversationId`，所有调用都会落到唯一的**默认会话** `app-chat:{appId}`，所有用户共享一个上下文 —— 这只适合单用户/演示场景。

要做**真正的多用户隔离**，必须为每个用户传入各自的 `conversationId`。但要注意：**REST 的状态查询与历史读取接口只作用于默认会话**（见下文「获取结果」）。因此，使用自定义 `conversationId` 做多用户隔离时，**结果获取应走 WebSocket**（WebSocket 按 `conversationId` 精确订阅）。这是本文最重要的工程约束。
:::

---

## 第三步：发送消息

```http
POST /api/apps/<appId>/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "spaceId": "<spaceId>",
  "conversationId": "user-12345",
  "message": "我的订单 A1001 到哪了？"
}
```

请求体字段：

| 字段 | 必填 | 说明 |
|---|---|---|
| `spaceId` | 是 | 数字人所在空间 ID |
| `message` | 是 | 用户消息文本 |
| `conversationId` | 否 | 业务侧会话标识。不传则落到默认会话 `app-chat:{appId}` |
| `images` | 否 | 多模态图片附件 |
| `thinkingEnabled` | 否 | 是否开启扩展思考 |

立即返回（**注意：这是异步触发，不等待 Agent 跑完**）：

```json
{ "success": true, "data": { "conversationId": "app-chat:<appId>" } }
```

::: warning 返回的 conversationId 是默认值
即使你传入了自定义 `conversationId`，该接口返回的 `data.conversationId` **始终是默认值** `app-chat:{appId}`，并非你传入的值。请**以你自己传入的 `conversationId` 为准**来订阅/查询结果，不要依赖返回值。
:::

发送是**即发即走（fire-and-forget）**：HTTP 立刻返回，Agent 在后台运行。结果通过下一步的两种方式之一获取。

---

## 第四步：获取结果

异步模型是有意为之 —— 业务层在其上**自行组合**同步阻塞或流式 UX。有两种获取方式。

### 方式 A：WebSocket（推荐，支持多用户隔离与流式）

WebSocket 按 `conversationId` 精确投递事件，是多用户隔离场景的**唯一正确选择**，也能拿到 Agent 的思考/工具调用过程，实现打字机式流式。

连接与握手流程：

1. 连接 `wss://<base>/ws`（`<base>` 含路径前缀）。
2. 发送鉴权帧：`{ "type": "auth", "payload": { "token": "<token>" } }`，等待服务端回 `{ "type": "auth:success" }`。鉴权失败会回 `{ "type": "auth:failed" }` 并关闭连接。
3. 订阅会话：`{ "type": "subscribe", "payload": { "conversationId": "user-12345" } }`。
4. 接收事件：服务端推送 `{ "type": "event", "channel": "...", "data": { ... } }`。每个 `data` 都带 `spaceId` 和 `conversationId`，可据此路由到对应用户。
5. 取消订阅：`{ "type": "unsubscribe", "payload": { "conversationId": "user-12345" } }`。
6. 心跳：可发送 `{ "type": "ping" }`，服务端回 `{ "type": "pong" }`。

::: tip 订阅时机
应在**发送消息之前或同时**完成连接、鉴权与订阅，以免错过早期事件。一个连接可订阅多个 `conversationId`，复用单条长连接服务多个用户。
:::

#### 事件通道（channel）

| channel | 含义 | 关键 data 字段 |
|---|---|---|
| `agent:message` | 助手文本。流式增量 + 最终完整文本 | `delta`（流式增量）/ `content` + `isComplete: true`（最终）/ `isNewTextBlock`（新文本块开始） |
| `agent:thought` | 思考块（thinking）或阶段性结果块 | `thought`（含 `type`、`content` 等） |
| `agent:thought-delta` | 思考内容的增量 | `thoughtId`、`delta`、`content` |
| `agent:tool-call` | Agent 发起工具调用 | 工具调用详情 |
| `agent:tool-result` | 工具调用返回 | 工具结果 |
| `agent:complete` | 本轮回复结束 | `tokenUsage` |
| `agent:error` | 出错 | `error`、可选 `errorType`/`errorCode` |
| `agent:compact` | 上下文被压缩 | `trigger`、`preTokens` |
| `agent:session-info` | 会话元信息 | 会话相关字段 |

::: warning 最终回复怎么取
**没有** `agent:result` 这个通道。最终回复文本通过 `agent:message`（`isComplete: true`，其 `content` 即完整回复）下发，紧随其后是 `agent:complete`（携带 `tokenUsage`）标志本轮结束。

获取「一句完整答复」的可靠做法：监听 `agent:message`，取 `isComplete === true` 那一条的 `content`；把 `agent:complete` 当作「本轮结束」信号。若中途需要流式展示，则持续拼接 `agent:message` 的 `delta`。
:::

### 方式 B：轮询（仅适合默认会话）

轮询只用两个 REST 接口：先查是否跑完，再拉取回复。

查状态：

```http
GET /api/apps/<appId>/chat/status
Authorization: Bearer <token>
```

```json
{ "success": true, "data": { "isGenerating": false, "conversationId": "app-chat:<appId>" } }
```

拉取消息（Agent 跑完后）：

```http
GET /api/apps/<appId>/chat/messages
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "data": [
    { "id": "session-msg-1", "role": "user", "content": "我的订单 A1001 到哪了？", "timestamp": "..." },
    { "id": "session-msg-2", "role": "assistant", "content": "您的订单 A1001 正在派送中……", "timestamp": "...", "thoughts": [], "thoughtsSummary": { "count": 0, "types": {} } }
  ]
}
```

消息记录字段：`id`、`role`（`user` / `assistant`）、`content`、`timestamp`，可选 `thoughts[]` 与 `thoughtsSummary`。取最后一条 `role: "assistant"` 的 `content` 即本轮回复。

::: danger 轮询的关键限制
`GET .../chat/status` 与 `GET .../chat/messages` **只作用于默认会话** `app-chat:{appId}`，它们**不接受也不区分 `conversationId`**。

因此：
- 若你**不做多用户隔离**（所有用户共享默认会话），轮询可用。
- 若你**用自定义 `conversationId` 做多用户隔离**，轮询会**串话**（拿到的是默认会话而非该用户的历史）—— 此时**必须走 WebSocket**。
:::

### 两种方式对比

| 维度 | WebSocket | 轮询 |
|---|---|---|
| 多用户隔离 | ✅ 按 `conversationId` 精确投递 | ❌ 仅默认会话 |
| 流式/过程可见 | ✅ 思考、工具、增量文本 | ❌ 只能拿最终历史 |
| 实时性 | ✅ 推送，低延迟 | ⚠️ 取决于轮询间隔 |
| 实现复杂度 | 长连接、重连、鉴权握手 | 简单的请求循环 |
| 适用场景 | 生产、多用户、流式 UX | 单用户/演示，或仅需最终结果的默认会话 |

**建议**：生产环境、多用户、需要流式体验 → WebSocket。仅做单数字人单会话的简单同步问答 → 轮询亦可。

---

## 会话生命周期

- **延续**：对同一 `conversationId` 反复 `chat/send`，上下文自动延续（同一 Agent 会话，内存复用；进程重建后通过保存的 session id 从磁盘恢复历史）。
- **停止生成**：`POST /api/apps/<appId>/chat/stop` 中止该数字人当前正在进行的生成。
- **清空历史**：`POST /api/apps/<appId>/chat/clear`，请求体 `{ "spaceId": "<spaceId>" }`，重置为全新会话（清空默认会话历史）。

---

## 多用户隔离小结

把以上拼起来，多用户隔离的标准姿势是：

1. 创建一个数字人，拿到 `appId`（一种人格服务所有用户）。
2. 为每个最终用户分配业务侧 `conversationId`（如 `user-12345`）。
3. 建立一条 WebSocket 长连接，鉴权后为活跃用户 `subscribe` 各自的 `conversationId`。
4. 用户发消息时，`POST .../chat/send` 带上该用户的 `conversationId` 和 `message`。
5. 通过 WebSocket 事件（按 `data.conversationId` 路由）拿到流式过程与最终 `agent:message`（`isComplete: true`）。
6. 老用户复用 `conversationId` 延续上下文；新用户分配新的。

---

## 错误处理

| 场景 | 表现 | 建议处理 |
|---|---|---|
| 令牌缺失/错误 | HTTP `401`，`{ success:false, error:"..." }` | 检查 `Authorization` 头与 `HALO_REMOTE_PASSWORD` |
| 登录被锁定 | HTTP `429`，`code: "LOCKED"`，带 `Retry-After` | 退避重试，避免暴力尝试令牌 |
| 服务尚未就绪 | HTTP `503`（App Manager/Runtime 未初始化） | 冷启动后稍候重试 |
| App 不存在 | `404` 或 `{ success:false }` | 核对 `appId` |
| Agent 运行出错 | WebSocket `agent:error` 事件，`data.error` | 向用户展示降级提示，可记录 `errorCode` |
| 空响应/被中断 | `agent:error`，`errorType: "interrupted"` | 提示用户重发或继续 |

::: tip 把异步包成同步
业务层若需要「一次 `ask(userId, question)` 调用拿到一句答复」的同步语义，可在内部：连 WS → 订阅该用户会话 → `chat/send` → 等到该 `conversationId` 的 `agent:message(isComplete:true)` 或 `agent:complete` → 返回 `content`，并设置超时与 `agent:error` 兜底。具体代码见[集成示例](./examples.md)。
:::

---

## 下一步

- [集成示例](./examples.md) —— 完整的 curl 走查、WebSocket 示例，以及把异步 API 包成同步 `ask()` 的后端伪代码。
- [配置说明](./configuration.md) —— 令牌、端口、大模型网关等环境变量。
- [数字人文档](../digital-humans/overview) —— 数字人 spec 的完整字段与人格设计。
