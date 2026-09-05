---
title: "HTTP API 参考"
description: "Halo Server 远程访问 HTTP API 的完整参考：鉴权、数字人（App）生命周期与对话、通用 Agent 与会话、配置与健康检查。每个端点均按源码核对，附 curl 示例。"
---
# HTTP API 参考

本页是 **Halo Server**（无头服务端版本）对外暴露的 **Remote Access HTTP API** 的完整参考。第三方业务系统（例如一个驱动客服「数字员工」的 Java 后端）通过这套 API 把 Halo 作为 AI 智能体后端集成进来。

> **传输模型（重要）**：本 API 在设计上是**异步、事件驱动**的。
> 没有同步的「提问 → 立即拿到回答」端点。你向 Agent / 数字人发送消息后，端点立即返回一个**确认（ack）**，AI 的思考过程与最终结果通过 **WebSocket 事件**推送，或通过轮询状态端点获取。详见 [WebSocket 事件协议](./websocket.md)。

所有路径都相对于服务的部署根。若服务挂在反向代理路径前缀下（如 `/fc-xxxx/`），请把前缀加到下面所有路径之前，例如 `https://host/fc-xxxx/api/apps`。

---

## 鉴权

### 凭据是什么

调用方凭据是 Halo 远程访问的**服务访问令牌**（即「远程访问密码」）。它以标准 Bearer 形式携带在每个 API 请求中：

```
Authorization: Bearer <token>
```

该令牌由服务端持有（保存在配置 `remoteAccess.password`）。它可以是服务首次启用远程访问时自动生成的 12 位强随机串，也可以是用户设置的自定义密码。在 Server（无头）部署中，约定通过环境变量 `HALO_REMOTE_PASSWORD` 提供（详见 [配置说明](./configuration.md)）。

> Bearer 令牌**无需**先调用登录端点即可使用。登录端点（`/api/remote/login`）只服务于浏览器 UI 的登录流程。机器对机器的集成只需在每个请求上带 `Authorization: Bearer <token>`。

鉴权由 `/api/*` 的中间件统一把守。下列路径是公开的，无需令牌：

- `POST /api/remote/login`
- `GET  /api/remote/status`
- `GET  /api/security/policy`

其余 `/api/*` 端点缺少有效令牌一律返回 `401`。

---

### POST /api/remote/login

校验访问令牌。**仅用于浏览器 UI 登录流程**；机器集成可跳过此步，直接用 Bearer 头。

| 字段    | 类型   | 必填 | 说明           |
| ------- | ------ | ---- | -------------- |
| `token` | string | 是   | 服务访问令牌   |

**响应**

- `200` → `{ "success": true }`
- `401` → `{ "success": false, "error": "Invalid token" }`
- `429` → `{ "success": false, "error": "Too many failed attempts. Try again later.", "code": "LOCKED" }`，并带 `Retry-After` 响应头（秒）

登录端点带有按来源 IP 的限流与锁定机制：连续失败会触发临时锁定，期间返回 `429`。

```bash
curl -X POST https://host/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>"}'
```

---

### GET /api/remote/status

公开健康探针，无需鉴权。

**响应**

```json
{
  "success": true,
  "data": { "active": true, "clients": 0, "version": "1.0.0" }
}
```

- `clients`：当前 WebSocket 连接数。
- `version`：远程访问协议版本（固定 `1.0.0`，非应用版本，应用版本见 `GET /api/system/version`）。

```bash
curl https://host/api/remote/status
```

---

## 数字人（App）生命周期与对话

「数字人」在系统内部即一个 **App**（自动化应用 / 智能体）。这是商业集成的**核心**：每个数字人拥有自己的人格（system prompt）、配置、记忆与对话。

### 通用响应约定

除特别说明外，所有端点返回 `{ "success": true, "data": ... }` 或 `{ "success": false, "error": "..." }`。

App 服务采用懒初始化。在进程启动早期，若 App Manager / Runtime 尚未就绪，相关端点返回 `503`：

```json
{ "success": false, "error": "App Manager is not yet initialized. Please try again shortly." }
```

---

### GET /api/apps

列出所有已安装的 App。

**查询参数**

| 参数      | 类型   | 必填 | 说明                                                         |
| --------- | ------ | ---- | ------------------------------------------------------------ |
| `spaceId` | string | 否   | 按空间过滤                                                   |
| `status`  | string | 否   | 按状态过滤（如 `active`、`paused`）。不传时默认排除 `uninstalled` |

**响应**：`data` 为 App 对象数组。

```bash
curl https://host/api/apps \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/apps/install

安装一个 App（数字人 / 自动化应用）。

| 字段         | 类型              | 必填 | 说明                                                       |
| ------------ | ----------------- | ---- | ---------------------------------------------------------- |
| `spec`       | object            | 是   | App 规格对象（`AppSpec`）                                  |
| `spaceId`    | string \| null    | 否   | 安装到的空间。`null` 表示全局安装（MCP/Skill 跨空间可用）  |
| `userConfig` | object            | 否   | 用户配置（对应 spec 的 `config_schema`）                   |

**响应**：成功返回 `{ "success": true, "data": { "appId": "..." } }`。

**状态码**

- `400`：缺少 `spec` 或 `spaceId` 类型非法
- `403`：远程禁止安装 MCP 命令类应用（`code: "MCP_COMMAND_BLOCKED"`）
- `409`：已安装（`code: "ALREADY_INSTALLED"`）
- `503`：服务未初始化（`code: "NOT_INITIALIZED"`）

> HTTP 安装语义：仅自动化类 App 会在安装后被激活（`activateNonAutomation: false`）。

```bash
curl -X POST https://host/api/apps/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","spec":{ /* AppSpec */ },"userConfig":{}}'
```

---

### GET /api/apps/:appId

获取单个 App。

```bash
curl https://host/api/apps/<appId> \
  -H "Authorization: Bearer <token>"
```

---

### DELETE /api/apps/:appId

卸载（软删除）一个 App。会先在 Runtime 中停用，再标记卸载。

**查询参数**

| 参数    | 类型   | 必填 | 说明                          |
| ------- | ------ | ---- | ----------------------------- |
| `purge` | string | 否   | `true` 时一并清除数据         |

```bash
curl -X DELETE "https://host/api/apps/<appId>?purge=true" \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/apps/:appId/config

更新 App 的用户配置（对应 spec 的 `config_schema`）。请求体即配置对象（整体替换）。

```bash
curl -X POST https://host/api/apps/<appId>/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"someKey":"someValue"}'
```

---

### POST /api/apps/:appId/trigger

手动触发一次运行（用于自动化类 App）。**异步**：返回触发结果摘要 `data`（含 `outcome`），实际执行过程通过 Activity / WebSocket 体现。

```bash
curl -X POST https://host/api/apps/<appId>/trigger \
  -H "Authorization: Bearer <token>"
```

---

### App 对话（核心）

数字人对话是商业集成的核心交互方式。对话是**异步流式**的：`chat/send` 立即返回 ack，AI 的思考与回复通过 WebSocket 推送（订阅对应 `conversationId`），并持久化为可回放的消息记录。

每个数字人有一个**默认对话**，其 `conversationId` 为 `app-chat:{appId}`。

#### POST /api/apps/:appId/chat/send

向数字人的 AI 智能体发送一条消息。**异步**：发送后立即返回，生成在后台进行，结果经 WebSocket 推送。

请求体被原样透传给底层（`{ ...req.body, appId }`），因此支持以下字段：

| 字段              | 类型              | 必填 | 说明                                                                                   |
| ----------------- | ----------------- | ---- | -------------------------------------------------------------------------------------- |
| `spaceId`         | string            | 是   | App 所在空间（底层执行必需）                                                            |
| `message`         | string            | 是   | 用户消息文本                                                                            |
| `images`          | array             | 否   | 多模态图片附件                                                                          |
| `thinkingEnabled` | boolean           | 否   | 开启扩展思考                                                                            |
| `conversationId`  | string            | 否   | 自定义会话 ID，实现**同一数字人下、按终端用户隔离的独立对话**（见下方说明）             |

**响应**

```json
{ "success": true, "data": { "conversationId": "app-chat:<appId>" } }
```

> **关于 `conversationId` 隔离（重要细节）**：
> 底层 `sendAppChatMessage` 取 `request.conversationId ?? "app-chat:{appId}"` 作为会话/会话隔离键。因此你**可以**为每个终端用户传入不同的 `conversationId`（例如 `app-chat:<appId>:user-123`），从而在**同一个数字人人格**下获得相互隔离的对话上下文与历史。
> **注意**：本端点的响应体里 `conversationId` 字段**始终**回显默认值 `app-chat:{appId}`，**不会**回显你传入的自定义值。要订阅自定义会话的 WebSocket 事件，请使用你自己传入的那个 `conversationId`，而不是响应里的值。

```bash
curl -X POST https://host/api/apps/<appId>/chat/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","message":"你好","conversationId":"app-chat:<appId>:user-123"}'
```

#### GET /api/apps/:appId/chat/status

查询数字人对话当前状态。

**响应**

```json
{ "success": true, "data": { "isGenerating": false, "conversationId": "app-chat:<appId>" } }
```

> `conversationId` 始终为默认值；`isGenerating` 反映该数字人的**任意**会话（含自定义会话与 IM 会话）是否正在生成。

```bash
curl https://host/api/apps/<appId>/chat/status \
  -H "Authorization: Bearer <token>"
```

#### POST /api/apps/:appId/chat/stop

停止该数字人下所有活跃的对话生成（默认会话 + 自定义/IM 会话）。返回 `{ "success": true }`。

```bash
curl -X POST https://host/api/apps/<appId>/chat/stop \
  -H "Authorization: Bearer <token>"
```

#### GET /api/apps/:appId/chat/messages

读取该数字人默认对话的持久化消息历史。

| 行为     | 说明                                                            |
| -------- | --------------------------------------------------------------- |
| App 不存在 | `404`                                                           |
| 无空间路径 | 返回 `{ "success": true, "data": [] }`                          |

> 仅返回**默认对话**（`app-chat:{appId}`，存储 runId `chat`）的消息。自定义 `conversationId` 的历史不在此返回。

```bash
curl https://host/api/apps/<appId>/chat/messages \
  -H "Authorization: Bearer <token>"
```

#### POST /api/apps/:appId/chat/clear

清空数字人默认对话历史并重置为全新会话。

| 字段      | 类型   | 必填 | 说明                       |
| --------- | ------ | ---- | -------------------------- |
| `spaceId` | string | 是   | 用于定位存储路径（请求体） |

```bash
curl -X POST https://host/api/apps/<appId>/chat/clear \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>"}'
```

#### POST /api/apps/:appId/chat/restart

重启该数字人的所有对话会话——关闭底层子进程，使下一条消息重新加载 system prompt 与配置。**对话历史保留**（通过保存的 sessionId 恢复）。

**响应**：`{ "success": true, "data": { "sessionsClosed": <number> } }`

```bash
curl -X POST https://host/api/apps/<appId>/chat/restart \
  -H "Authorization: Bearer <token>"
```

#### GET /api/apps/:appId/chat/session-state

获取默认对话的会话状态（用于刷新后恢复）。

**响应**

```json
{ "success": true, "data": { "isActive": false, "thoughts": [], "spaceId": "<spaceId>" } }
```

---

### App 状态与活动（自动化运行）

#### GET /api/apps/:appId/state

获取实时的自动化 App 状态（`AutomationAppState`）。

```bash
curl https://host/api/apps/<appId>/state \
  -H "Authorization: Bearer <token>"
```

#### GET /api/apps/:appId/activity

获取 App 的活动记录条目。

| 参数     | 类型   | 必填 | 说明                       |
| -------- | ------ | ---- | -------------------------- |
| `limit`  | number | 否   | 返回条数上限               |
| `before` | number | 否   | 时间戳游标（早于该时间）   |

```bash
curl "https://host/api/apps/<appId>/activity?limit=50" \
  -H "Authorization: Bearer <token>"
```

#### POST /api/apps/:appId/escalation/:entryId/respond

回应一条升级（escalation）请求。

| 字段     | 类型   | 必填 | 说明           |
| -------- | ------ | ---- | -------------- |
| `choice` | string | 否   | 选项标识       |
| `text`   | string | 否   | 自由文本回应   |

```bash
curl -X POST https://host/api/apps/<appId>/escalation/<entryId>/respond \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"choice":"approve"}'
```

---

### 其它 App 管理端点

下列端点同样存在（均需 Bearer 鉴权），用于更完整的生命周期管理：

| 方法 + 路径                                          | 用途                                       |
| ---------------------------------------------------- | ------------------------------------------ |
| `POST /api/apps/:appId/reinstall`                    | 重新安装此前已卸载的 App                   |
| `DELETE /api/apps/:appId/permanent`                  | 永久删除 App 及其全部数据（内置 App 受保护）|
| `POST /api/apps/:appId/move-space`                   | 把 App 迁移到其它空间（或全局）            |
| `POST /api/apps/:appId/clear-memory`                 | 删除 App 的全部记忆文件                    |
| `POST /api/apps/:appId/pause`                        | 暂停 App                                   |
| `POST /api/apps/:appId/resume`                       | 恢复 App                                   |
| `POST /api/apps/:appId/frequency`                    | 更新订阅频率（`subscriptionId`、`frequency`）|
| `PATCH /api/apps/:appId/spec`                        | 更新 spec（JSON Merge Patch）              |
| `PATCH /api/apps/:appId/overrides`                   | 更新用户覆盖项（JSON Merge Patch，`null` 删除键）|
| `POST /api/apps/:appId/permissions/grant`            | 授予权限                                   |
| `POST /api/apps/:appId/permissions/revoke`           | 撤销权限                                   |
| `POST /api/apps/:appId/upgrade-strategy`             | 设置升级策略（`auto`/`notify`/`manual`）   |
| `GET  /api/apps/:appId/export-spec`                  | 导出 spec 为 YAML                          |
| `POST /api/apps/import-spec`                          | 从 YAML 安装                               |
| `POST /api/apps/:appId/runs/:runId/continue`         | 续跑因过早停止而失败的运行                 |
| `POST /api/apps/:appId/runs/:runId/inject`           | 向活跃运行注入用户文本（`text`）           |
| `GET  /api/apps/:appId/runs/:runId/session`          | 读取某次运行的会话消息（「查看过程」）     |
| `GET  /api/apps/:appId/chat/session-state`           | 默认对话会话状态                           |
| `GET  /api/apps/:appId/im-chat/messages`             | 读取 IM 渠道会话消息                       |
| `POST /api/apps/:appId/im-chat/clear`                | 清空某个 IM 会话                           |

---

## 通用 Agent 与会话

除了「数字人」外，Halo Server 还暴露一套**通用 Agent**接口，可在某个空间内直接驱动一个会话（conversation）。同样是**异步流式**：发送消息后通过 WebSocket 订阅会话事件。

### POST /api/agent/message

向通用 Agent 发送一条消息。**异步**：返回 `{ "success": true }` 作为 ack，AI 输出经 WebSocket 推送到该 `conversationId`。

| 字段              | 类型    | 必填 | 说明                         |
| ----------------- | ------- | ---- | ---------------------------- |
| `spaceId`         | string  | 是   | 空间 ID                      |
| `conversationId`  | string  | 是   | 会话 ID（订阅 WS 事件用同一个）|
| `message`         | string  | 是   | 用户消息                     |
| `resumeSessionId` | string  | 否   | 恢复指定 SDK 会话            |
| `images`          | array   | 否   | 多模态图片                   |
| `thinkingEnabled` | boolean | 否   | 扩展思考                     |
| `aiBrowserEnabled`| boolean | 否   | 启用 AI 浏览器工具           |

```bash
curl -X POST https://host/api/agent/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","conversationId":"<convId>","message":"你好"}'
```

### POST /api/agent/stop

停止指定会话（或全部）的生成。

| 字段             | 类型   | 必填 | 说明     |
| ---------------- | ------ | ---- | -------- |
| `conversationId` | string | 否   | 会话 ID  |

### POST /api/agent/approve · POST /api/agent/reject

工具调用的批准 / 拒绝。

| 字段             | 类型   | 必填 | 说明     |
| ---------------- | ------ | ---- | -------- |
| `conversationId` | string | 是   | 会话 ID  |

> 当前实现中权限**默认全部自动放行**，因此这两个端点为 no-op，恒返回 `{ "success": true }`。

### POST /api/agent/answer-question

回答 Agent 抛出的 `AskUserQuestion`。

| 字段             | 类型   | 必填 | 说明                    |
| ---------------- | ------ | ---- | ----------------------- |
| `conversationId` | string | 是   | 会话 ID                 |
| `id`             | string | 是   | 问题 ID                 |
| `answers`        | object | 是   | 答案映射（字段→取值）   |

未找到该 `id` 对应的待答问题时返回 `{ "success": false, "error": "No pending question found for id: ..." }`。

### GET /api/agent/session/:conversationId

获取会话状态（刷新后恢复用）。返回 `{ "success": true, "data": <SessionState> }`。

### GET /api/agent/generating/:conversationId

查询会话是否正在生成。返回 `{ "success": true, "data": <boolean> }`。

```bash
curl https://host/api/agent/generating/<convId> \
  -H "Authorization: Bearer <token>"
```

### GET /api/agent/sessions

列出所有活跃会话的 conversationId。返回 `{ "success": true, "data": ["<convId>", ...] }`。

### 其它 Agent 端点

| 方法 + 路径                          | 用途                              |
| ------------------------------------ | --------------------------------- |
| `POST /api/agent/test-mcp`           | 测试 MCP 服务器连接               |
| `GET  /api/agent/engine-capabilities`| 查询当前引擎能力                  |

---

### 空间与会话存储

会话（conversation）的**持久化记录**通过空间下的端点管理。这些是**同步**的读写端点（直接操作存储，不触发 AI 生成）。

| 方法 + 路径                                                              | 用途                       |
| ----------------------------------------------------------------------- | -------------------------- |
| `GET  /api/spaces`                                                       | 列出所有空间               |
| `POST /api/spaces`                                                       | 创建空间（`name`/`icon`/`customPath`）|
| `GET  /api/spaces/:spaceId`                                              | 获取空间                   |
| `PUT  /api/spaces/:spaceId`                                              | 更新空间                   |
| `DELETE /api/spaces/:spaceId`                                            | 删除空间                   |
| `GET  /api/spaces/default-path`                                          | 获取默认空间目录           |
| `GET  /api/spaces/halo`                                                  | 获取 Halo 临时空间         |
| `GET  /api/spaces/:spaceId/conversations`                               | 列出会话                   |
| `POST /api/spaces/:spaceId/conversations`                               | 创建会话（`title`）        |
| `GET  /api/spaces/:spaceId/conversations/:conversationId`               | 获取会话                   |
| `PUT  /api/spaces/:spaceId/conversations/:conversationId`               | 更新会话                   |
| `DELETE /api/spaces/:spaceId/conversations/:conversationId`             | 删除会话                   |
| `POST /api/spaces/:spaceId/conversations/:conversationId/messages`      | 追加一条消息               |
| `PUT  /api/spaces/:spaceId/conversations/:conversationId/messages/last` | 更新最后一条消息           |
| `GET  /api/spaces/:spaceId/conversations/:conversationId/messages/:messageId/thoughts` | 获取消息的思考记录 |
| `POST /api/spaces/:spaceId/conversations/:conversationId/star`          | 切换收藏（`starred`）      |

```bash
# 创建一个会话
curl -X POST https://host/api/spaces/<spaceId>/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"新对话"}'
```

> **集成提示**：`POST /api/agent/message` 只负责驱动 AI 生成并通过 WebSocket 推流；它**不会**替你创建会话记录。典型流程是：先 `POST .../conversations` 建立会话拿到 `conversationId`，订阅 WebSocket，再 `POST /api/agent/message` 发送消息。

---

## 配置与健康检查

### GET /api/config

获取服务配置。返回 `{ "success": true, "data": <Config> }`。

```bash
curl https://host/api/config \
  -H "Authorization: Bearer <token>"
```

### POST /api/config

写入服务配置（请求体即配置对象）。

> 远程调用受策略约束：涉及 MCP 命令、或浏览器允许列表的修改可能被拒（`403`，`code: "MCP_COMMAND_BLOCKED"` 等）。

### 其它配置端点

| 方法 + 路径                          | 用途                              |
| ------------------------------------ | --------------------------------- |
| `POST /api/config/validate`          | 校验 API 凭据（`apiKey`/`apiUrl`/`provider`/`model`）|
| `POST /api/config/fetch-models`      | 拉取可用模型列表（`apiKey`/`apiUrl`）|
| `POST /api/config/refresh-ai-sources`| 刷新所有 AI 源配置                |
| `GET  /api/security/policy`          | 公开的安全策略切片（无需鉴权）    |

### GET /api/system/version

获取应用版本号。

**响应**

```json
{ "success": true, "data": "x.y.z" }
```

```bash
curl https://host/api/system/version \
  -H "Authorization: Bearer <token>"
```

### 其它系统端点

| 方法 + 路径                  | 用途                            |
| ---------------------------- | ------------------------------- |
| `GET  /api/auth/providers`   | 列出启用的认证提供方（只读）    |
| `POST /api/analytics/report` | 上报遥测事件（`event`/`properties`，fire-and-forget）|

---

## 错误与状态码约定

- 业务失败通常返回 HTTP `200` 且 `{ "success": false, "error": "..." }`（许多处理器在 catch 中直接 `res.json`，不改状态码）。
- 鉴权失败：`401`。
- 限流锁定：`429`（带 `Retry-After`）。
- 服务未就绪：`503`。
- 安装类语义化状态：`400`（参数）、`403`（MCP 被禁）、`409`（已安装）、`422`（校验失败）、`404`（未找到）。

集成时**务必同时检查 HTTP 状态码与响应体的 `success` 字段**。

---

## 相关页面

- [WebSocket 事件协议](./websocket.md) —— 如何接收 AI 的流式思考与结果。
- [配置说明](./configuration.md) —— 环境变量（含服务访问令牌）。
