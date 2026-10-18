---
title: "Halo Server 集成指南：把数字人接入业务系统"
description: "Halo Server 集成指南：把数字人作为业务系统的 AI 后端，为每个用户分配聊天线程，用 WebSocket 或轮询取回复。"
type: how-to
audience: [developer]
---

# Halo Server 集成指南

这一页面向后台工程师，讲怎样把 Halo 的数字人作为你的业务系统的 AI 后端。典型链路：

```text
最终用户提问 → 你的后台 → Halo（数字人处理）→ 回复
```

你的后台负责用户身份、入口、界面，以及同步或流式的体验；Halo 负责运行数字人（人设、工具、技能和记忆）。两者通过 HTTP API 和 WebSocket 对接。同样的做法也适用于开启了远程访问的 Halo 桌面版。

## 开始之前 {#before-you-start}

- 一台运行中的 [Halo Server](/server/)，以及它的基础地址和访问密码。
- 读过 [HTTP API 概览](/developers/api/)，了解鉴权、响应信封和错误约定。

## 基本约定 {#basics}

### 基础地址 {#base-url}

把基础地址做成配置项，不要写死：

- 直连：`http://<HOST>:8080`
- 经反向代理的路径前缀：`https://<HOST>/<PATH_PREFIX>`

所有 HTTP 接口和 WebSocket 都在基础地址之下，例如发消息是 `<BASE_URL>/api/apps/<APP_ID>/chat/send`，WebSocket 是把 `<BASE_URL>` 的 `http` 换成 `ws` 后再加 `/ws`。

下文的命令用 shell 变量 `$HALO_URL` 表示基础地址，`$HALO_TOKEN` 表示访问密码，设置方法见[快速上手](/developers/quickstart#set-variables)。

### 鉴权 {#auth}

每个 `/api/` 请求都带上访问密码：

```http
Authorization: Bearer <YOUR_ACCESS_PASSWORD>
```

没有“登录换取会话令牌”的流程：`POST /api/remote/login` 只用来校验密码，真正的凭据始终是这个访问密码。

::: danger 访问密码只留在你的后台
访问密码可以完全控制这台 Halo。只在后台服务里使用它，不要下发到浏览器或移动端，也不要写进代码仓库。
:::

### 响应信封 {#envelope}

接口返回 `{ "success": true, "data": … }` 或 `{ "success": false, "error": "…" }`。先判断 `success`，再读取 `data`：很多失败的 HTTP 状态码也是 200。

## 1. 准备数字人 {#digital-human}

一个数字人有固定的人设（`system_prompt`）、可用的工具和技能、记忆与权限，可以同时服务你的所有最终用户。

- **推荐**：在 Halo 界面里[创建数字人](/digital-humans/create)并调试好，再交给业务系统调用。
- **用 API 安装**：调用 [`POST /api/apps/install`](/developers/api/digital-human#post-api-apps-install)，传入完整的 spec。

最小的数字人 spec：

```json
{
  "spaceId": "<SPACE_ID>",
  "spec": {
    "type": "automation",
    "name": "客服助手",
    "version": "1.0.0",
    "author": "example",
    "description": "网店客服，回答订单、物流和退换货问题。",
    "system_prompt": "你是一家网店的客服助手。礼貌、简洁、准确地回答订单、物流和退换货问题。不确定时，请用户提供订单号。"
  }
}
```

返回：

```json
{ "success": true, "data": { "appId": "<APP_ID>" } }
```

之后的调用都要用到数字人的 `appId` 和它所在工作区的 `spaceId`。已有的数字人用 [`GET /api/apps`](/developers/api/digital-human#get-api-apps) 查询，条目里的 `id` 就是 `appId`。

## 2. 为每个最终用户分配聊天线程 {#threads}

同一个数字人服务你的所有最终用户。每个用户用自己的聊天线程，线程之间的上下文互不干扰。线程由 `conversationId` 指定，接受以下形式：

| `conversationId` | 用途 |
|---|---|
| 不传，或 `app-chat:<APP_ID>` | 主线程。所有人共用一个上下文，只适合单用户或演示 |
| `app-chat:<APP_ID>:http:direct:<USER_KEY>` | 你自己命名的线程。`<USER_KEY>` 只能包含字母、数字、`_` 和 `-`，长度 1–128 |
| [`POST /api/apps/:appId/sessions/create`](/developers/api/digital-human#post-api-apps-appid-sessions-create) 返回的 `conversationId` | Halo 新建的线程 |

推荐用第二种：例如用户 12345 的线程是 `app-chat:<APP_ID>:http:direct:user-12345`。同一个用户回来时继续用这个键，上下文就会延续；新用户用新的键。

::: warning 其他形式会被拒绝
直接传 `user-12345` 这类自定义字符串，会返回 `400`，错误信息里列出允许的格式。已绑定到即时通讯聊天的线程也不能通过 API 发消息：API 不会替真人在真实的聊天里说话。
:::

## 3. 发送消息 {#send}

```bash
curl -sX POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<SPACE_ID>","conversationId":"app-chat:<APP_ID>:http:direct:user-12345","message":"我的订单 A1001 到哪了？"}'
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `spaceId` | 是 | 数字人所在的工作区，即它在 `GET /api/apps` 中的 `spaceId` |
| `message` | 是 | 用户消息 |
| `conversationId` | 否 | 聊天线程，见[第 2 步](#threads)；不传时用主线程 |
| `images` | 否 | 图片附件（base64）。整个 JSON 请求体不能超过 100 KB |
| `reasoningEffort` | 否 | 思考强度：`off`、`minimal`、`low`、`medium`、`high`、`xhigh` 或 `max` |

返回：

```json
{ "success": true, "data": { "conversationId": "app-chat:<APP_ID>:http:direct:user-12345" } }
```

`data.conversationId` 是这条消息实际进入的线程。接口在数字人读到消息之前就会返回，回复随后生成，用下一步的方法取回。同一线程还在回复时发来的消息不会另起一个处理过程：它会在当前步骤之后并入正在进行的回复，或等这一轮结束后合并处理。每个线程请一次发一条，等回复完成再发下一条，这样每条回复对应一条消息。

## 4. 获取回复 {#reply}

### 方式 A：WebSocket（推荐） {#websocket}

WebSocket 能拿到逐字生成的回复和处理过程，适合生产环境和流式体验：

1. 连接 `<BASE_URL>` 对应的 `ws(s)://…/ws`，发送 `{ "type": "auth", "payload": { "token": "<YOUR_ACCESS_PASSWORD>" } }`，等到 `auth:success`。
2. 在发消息之前订阅线程：`{ "type": "subscribe", "payload": { "conversationId": "app-chat:<APP_ID>:http:direct:user-12345" } }`。一个连接可以订阅多个线程。
3. 处理事件：用 `agent:message` 拼接回复（规则见[拼接回复文本](/developers/api/websocket#assemble-reply)），`isComplete: true` 的那条就是完整答复；`agent:complete` 表示这一轮结束；`agent:error` 表示出错。
4. 按 `data.conversationId` 把事件分发给对应的用户。所有会话的状态事件（如 `agent:complete`）都会发给每个连接，别的线程的事件要忽略。
5. 断线后重新鉴权，并重新订阅所有线程。

完整协议见 [WebSocket 事件](/developers/api/websocket)。

### 方式 B：轮询 {#polling}

只需要最终答复时，可以轮询两个接口，都传同一个 `conversationId`：

1. 查询是否生成完：

   ```bash
   curl -s "$HALO_URL/api/apps/<APP_ID>/chat/status?conversationId=app-chat:<APP_ID>:http:direct:user-12345" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   返回 `{"success":true,"data":{"isGenerating":false,"conversationId":"…"}}`。间隔逐次加倍（2 秒、4 秒……），直到 `isGenerating` 为 `false`。

2. 读取聊天记录：

   ```bash
   curl -s "$HALO_URL/api/apps/<APP_ID>/chat/messages?conversationId=app-chat:<APP_ID>:http:direct:user-12345" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   返回的列表中，最后一条 `role` 为 `assistant` 的消息的 `content` 就是这一轮的回复。

不传 `conversationId` 时，`chat/status` 报告这个数字人是否有任何线程正在生成，`chat/messages` 读取主线程。

### 两种方式对比 {#compare}

| | WebSocket | 轮询 |
|---|---|---|
| 每个用户独立的线程 | 支持 | 支持（传 `conversationId`） |
| 逐字显示和处理过程 | 支持 | 不支持，只能拿到最终结果 |
| 延迟 | 实时推送 | 取决于轮询间隔 |
| 实现 | 长连接、鉴权、重连和重新订阅 | 简单的请求循环 |

## 线程的生命周期 {#lifecycle}

- **延续**：对同一个 `conversationId` 反复调用 `chat/send`，上下文自动延续。
- **停止生成**：[`POST /api/apps/:appId/chat/stop`](/developers/api/digital-human#post-api-apps-appid-chat-stop)，请求体 `{"conversationId":"…"}` 停止一个线程；`{"all":true}` 停止这个数字人的所有线程。
- **清空历史**：[`POST /api/apps/:appId/chat/clear`](/developers/api/digital-human#post-api-apps-appid-chat-clear)，请求体 `{"spaceId":"<SPACE_ID>","conversationId":"…"}` 清空一个线程；不传 `conversationId` 时清空主线程。
- **删除线程**：[`POST /api/apps/:appId/sessions/delete`](/developers/api/digital-human#post-api-apps-appid-sessions-delete)，请求体 `{"spaceId":"<SPACE_ID>","conversationId":"…"}`。删除后无法恢复。

## 错误处理 {#errors}

| 情况 | 表现 | 处理 |
|---|---|---|
| 访问密码缺失或错误 | HTTP `401`，`"No authorization token"` 或 `"Invalid token"` | 检查 `Authorization` 头和服务端的 `HALO_REMOTE_PASSWORD` |
| 登录或 WebSocket 鉴权被锁定 | HTTP `429`，`"code": "LOCKED"`，带 `Retry-After` | 按 `Retry-After` 退避，排查是谁在用错误密码 |
| 服务还在启动 | HTTP `503` | 冷启动后稍等再试 |
| `conversationId` 格式不对 | HTTP `400`，错误信息列出允许的格式 | 按[第 2 步](#threads)的格式构造 |
| 数字人不存在 | HTTP `404` 或 `"success": false` | 核对 `appId` |
| 请求体过大 | HTTP `413` | 压缩图片，整个 JSON 请求体不超过 100 KB |
| 处理过程中出错 | WebSocket `agent:error`，`data.error`；`errorType` 为 `interrupted` 表示被中断 | 向用户展示降级提示，记录 `errorCode` 便于排查 |

::: tip 把异步调用包成同步
需要“一次调用拿到一句答复”的同步语义时：连接 WebSocket，订阅该用户的线程，调用 `chat/send`，等到这个线程的 `isComplete: true` 的 `agent:message` 或 `agent:error`，再返回结果，并设置超时。完整代码见 [Halo Server 集成示例](/server/examples)。
:::

## 下一步 {#next-steps}

- [Halo Server 集成示例](/server/examples)：完整的 curl 走查、WebSocket 事件流和 Java 封装代码
- [WebSocket 事件](/developers/api/websocket)：全部事件频道
- [API：数字人](/developers/api/digital-human)：与数字人对话相关的全部接口
