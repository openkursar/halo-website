---
title: "Halo API 实用示例：数字人对话、提问与 Webhook"
description: "Halo API 实用示例：和数字人对话、为每位用户分配线程、回答数字人的提问、交换文件、让数字人互相调用，以及用 Webhook 触发运行。"
type: how-to
audience: [developer]
---

# API 实用示例

这里的每个示例都完整地做完一件事，只用到本参考收录的操作。复制命令，替换其中的 `<占位符>`，再按你用的语言改写即可。

## 开始之前 {#before-you-start}

- 按[快速上手](/developers/quickstart#set-variables)设置好 `HALO_URL` 和 `HALO_TOKEN`，并准备好其中的 `watch.mjs` 脚本：它能流式显示任何会话或线程。
- 使用 Halo 桌面版时，操作期间保持 **设置 › 远程访问** 开启：API 和 Webhook 只在开启时提供。
- 大多数示例需要数字人的 `id` 和 `spaceId`，先列出来：

```bash
curl -s "$HALO_URL/api/apps" -H "Authorization: Bearer $HALO_TOKEN"
```

输出（节选）：

```json
{"success":true,"data":[{"id":"<APP_ID>","spaceId":"<SPACE_ID>","spec":{"name":"订单助手"},"status":"active"}]}
```

::: warning 响应里可能有密钥
每一项都带着数字人配置里保存的值，包括填在那里的密钥。不要把输出写进日志或工单。
:::

## 向数字人提问并流式接收回答 {#ask-digital-human}

1. 在一个终端里监听数字人的主线程，它的标识是 `app-chat:<APP_ID>`：

   ```bash
   node watch.mjs 'app-chat:<APP_ID>'
   ```

2. 在另一个终端里发送消息：

   ```bash
   curl -sX POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
     -H "Authorization: Bearer $HALO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"spaceId":"<SPACE_ID>","message":"还有哪些订单在等待付款？"}'
   ```

   输出：

   ```json
   {"success":true,"data":{"conversationId":"app-chat:<APP_ID>"}}
   ```

消息被接收后调用立即返回。回复会流式出现在第一个终端里，以 `[done]` 结束。

不用 WebSocket 时，轮询 [`GET /api/apps/:appId/chat/status`](/developers/api/digital-human#get-api-apps-appid-chat-status)，直到 `isGenerating` 为 `false`：先等 2 秒，之后每次等待时间加倍。然后从 [`GET /api/apps/:appId/chat/messages`](/developers/api/digital-human#get-api-apps-appid-chat-messages) 读取最后一条 `assistant` 消息。

同一线程还在回复时发来的消息不会另起一个处理过程：它会在当前步骤之后并入正在进行的回复，或等这一轮结束后合并处理。请一次发一条，等回复完成再发下一条，这样每条回复对应一条消息。

## 为每位用户分配线程 {#thread-per-user}

你的产品把用户转给数字人时，给每位用户一个单独的线程，他们的上下文就不会混在一起。用你那边的用户 ID 命名线程：

```text
app-chat:<APP_ID>:http:direct:<USER_KEY>
```

`<USER_KEY>` 只能包含字母、数字、`_` 和 `-`，最长 128 个字符，例如 `user-12345`。把这个标识作为 `conversationId` 传给 `chat/send`、`chat/status`、`chat/messages`，以及 WebSocket 的 `subscribe`：

```bash
curl -sX POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<SPACE_ID>","conversationId":"app-chat:<APP_ID>:http:direct:user-12345","message":"我的订单 A1001 到哪了？"}'
```

用户下次再来时，用同一个标识就能接着之前的对话。每位数字人的线程列表最多保留 500 个这样的线程，闲置 30 天的线程会从列表中移除，在 Halo 里改过名的除外。

其他形式的标识会返回 `400`；属于 IM 聊天的线程不能通过 API 写入。完整做法和错误处理见[集成指南](/server/integration#threads)。

## 回答数字人的提问 {#answer-question}

运行期间（定时、Webhook 或手动启动），数字人可能停下来请人做决定。运行会一直等到有人回答，在 Halo 里或通过 API 都可以。

1. **发现提问。** 每个 WebSocket 连接都会收到 `app:escalation:new`，带有 `appId`、`entryId`、`question` 和 `choices`。不用 WebSocket 时，列出最近的提问：

   ```bash
   curl -s "$HALO_URL/api/apps/<APP_ID>/activity?type=escalation&limit=5" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   输出（节选）：

   ```json
   {"success":true,"data":[{"id":"<ENTRY_ID>","type":"escalation","content":{"summary":"是否给订单 A1001 退款？","choices":["退款","保留订单"]}}]}
   ```

   条目里没有 `userResponse`，说明这个提问还没有人回答。有 `content.questions` 时，这一条同时问了几件事，每件都有自己的 `question` 和 `choices`。

2. **按对方的决定回答：**

   ```bash
   curl -sX POST "$HALO_URL/api/apps/<APP_ID>/escalation/<ENTRY_ID>/respond" \
     -H "Authorization: Bearer $HALO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"choice":"退款","text":"客户已经退回了商品"}'
   ```

- `choice` 必须与给出的某个 `choices` 完全一致。对方用自己的话回答时，只发 `text`。
- 条目带有 `content.questions` 时，发送 `answers`：按顺序每个问题一个 `{"choice":…}` 或 `{"text":…}`，每个问题都要回答。
- 第一个回答生效，不论来自 Halo 还是 API，而且无法撤回。已经回答过或已过期的提问会返回 `"success": false` 和原因。

::: danger 只发送真人做出的决定
运行会按你发送的内容继续。不要让脚本替别人挑选答案。
:::

## 把文件交给工作区并读取结果 {#exchange-files}

数字人在它的工作区文件夹里工作。你可以把文本文件放进去，再读取它产出的文件：

1. **写入输入文件**，放在工作区根目录（同名文件会被覆盖）：

   ```bash
   curl -sX POST "$HALO_URL/api/spaces/<SPACE_ID>/artifacts/file" \
     -H "Authorization: Bearer $HALO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"parentPath":"","name":"orders.csv","content":"id,amount\nA1001,120\nA1002,80\n"}'
   ```

2. **请数字人处理**，做法同[第一个示例](#ask-digital-human)，比如「把 orders.csv 汇总成 report.md」。

3. **找到并读取结果。** 列出工作区的文件，取出目标文件的 `path`，再读取：

   ```bash
   curl -s "$HALO_URL/api/spaces/<SPACE_ID>/artifacts" -H "Authorization: Bearer $HALO_TOKEN"
   curl -s -G "$HALO_URL/api/artifacts/content" --data-urlencode "path=<FILE_PATH>" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   文本在 `data.content` 里返回。图片、PDF 等二进制文件以 base64 编码返回，并带 `"encoding":"base64"`。超过 10 MB 的文本文件或 50 MB 的二进制文件会被拒绝。

这些操作只能写入文本。要交付二进制文件，请直接放进运行 Halo 的电脑上的工作区文件夹。路径超出允许的工作区会返回 `403`。

## 让一个数字人向另一个提问 {#digital-human-to-digital-human}

有时一个数字人需要另一个的答案，比如「周报」数字人要向「销售数据」数字人要数字。

**在同一个工作区里**，给提问的数字人打开 **对话协作**（**数字人** › 选中它 › **能力与设置** › **模型与能力**）。打开后它可以读取并给本工作区的其他会话发消息，包括其他数字人，并最多等待 5 分钟的回复。不需要调用 API：在它的指令里写清楚找谁、什么时候问。

**跨工作区，或想让它通过 API 调用时**，在同一个地方为提问的数字人打开 **操作 Halo**，或在它的 spec 里声明 `permissions: ["halo-api-ref"]`。之后它的每次会话都会得到 `HALO_API_URL`、`HALO_API_TOKEN` 和 `HALO_SPACE_ID`，以及它可以调用的操作说明。在它的系统提示词里加上类似这样的指令：

```text
需要本周销售数据时，向「销售数据」数字人提问：
1. POST $HALO_API_URL/api/apps/<OTHER_APP_ID>/chat/send，请求头
   "Authorization: Bearer $HALO_API_TOKEN"，JSON 请求体
   {"spaceId":"<OTHER_SPACE_ID>","conversationId":"app-chat:<OTHER_APP_ID>:http:direct:weekly-report","message":"<你的问题>"}
2. 每隔几秒轮询 GET $HALO_API_URL/api/apps/<OTHER_APP_ID>/chat/status?conversationId=<同一个标识>，
   直到 isGenerating 为 false。
3. 从 GET $HALO_API_URL/api/apps/<OTHER_APP_ID>/chat/messages?conversationId=<同一个标识>
   读取最后一条 assistant 消息。
一次只问一个问题。
```

- `HALO_API_TOKEN` 是 Halo 按工作区签发的令牌，只在这台电脑上有效，也只能调用助手可用的操作。它不是访问密码。
- 这两项权限默认都关闭，因为它们让数字人能做的事远超它自己的任务。只给你信任的数字人打开。

::: danger 不要把访问密码放进数字人
不要把访问密码存进数字人的配置、指令或文件。能读到它们的人就能完全控制这台 Halo，而且每次导出数字人，密码都会跟着一起带走。
:::

## 让其他系统启动数字人（Webhook） {#webhook}

其他系统推送事件时，数字人可以随之运行，比如商城来了新订单，或者代码平台推送了提交。

1. **在数字人的 spec 里声明 Webhook。** 选一个其他数字人没用过的小写路径，再生成一个随机密钥，例如用 `openssl rand -hex 32`：

   ```yaml
   subscriptions:
     - source:
         type: webhook
         config:
           path: new-order
           secret: <WEBHOOK_SECRET>
   ```

   创建数字人时就写进去，或者之后用 [`PATCH /api/apps/:appId/spec`](/developers/api/digital-human#patch-api-apps-appid-spec) 加上，发送完整的 `subscriptions` 列表。每个事件都会作为事件数据交给运行，包含 `path`、`body` 和 `query`；在系统提示词里引用请求体的字段即可，例如「订单号在 `body.orderId`」。

2. **把事件发到** `<HALO_URL>/hooks/<path>`。这个路径不使用访问密码，而是对每个请求签名：签名是用密钥对原始请求体计算的 HMAC-SHA256 十六进制值，放在 `X-Hub-Signature-256: sha256=<hex>` 中发送：

   ```bash
   BODY='{"orderId":"A1001","dedupKey":"order-A1001"}'
   SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')
   curl -sX POST "$HALO_URL/hooks/new-order" \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=$SIG" \
     --data-binary "$BODY"
   ```

   输出：

   ```json
   {"ok":true,"received":true}
   ```

   Halo 也接受放在 `X-Signature-256` 或 `X-Webhook-Signature` 中的十六进制值（不带前缀）。要对实际发送的字节签名：重新序列化后的 JSON 对不上签名。

| 响应 | 含义 |
|---|---|
| `200` `{"ok":true,"received":true}` | 已接收，运行在后台开始 |
| `401` `Invalid webhook signature` | 签名缺失或错误 |
| `413` | 请求体超过 256 KB |
| `415` | 不是 `application/json` |
| `404` `Webhook ingress not available` | Halo 的数字人运行环境尚未就绪，例如刚刚启动时 |

- **重复事件**：60 秒内 `dedupKey` 相同的事件只运行一次。没有 `dedupKey` 时，发到同一路径的相同请求体视为同一个事件。请给每个不同的事件一个自己的 `dedupKey`。
- **数字人正忙**：同一个数字人不会同时运行两次。运行期间到达的事件会交给这次运行，或者并入下一次运行。
- **能否访问到**：调用方必须能访问 `HALO_URL`：同一网络内用局域网地址，任何地方都能用 **设置 › 远程访问** 中的 **互联网访问** 地址。

::: danger 没有密钥的 Webhook 谁都能调用
不设置 `secret` 时，任何能访问到这个地址的人都能用任意内容启动数字人。务必设置密钥。密钥保存在数字人的 spec 里，导出或发布数字人之前请先删掉。
:::

## 相关页面 {#related}

- [快速上手](/developers/quickstart)：设置变量、发出第一个请求、`watch.mjs`
- [WebSocket 事件](/developers/api/websocket)：全部事件和拼接回复的规则
- [API：数字人](/developers/api/digital-human)：上面用到的全部操作
- [Halo Server 集成指南](/server/integration)：把数字人作为你的产品的 AI 后端
