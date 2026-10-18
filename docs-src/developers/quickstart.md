---
title: "调用 Halo API：快速上手"
description: "调用 Halo API 的快速上手：打开远程访问，拿到地址和访问密码，用 curl 发出第一个请求，再通过 WebSocket 实时接收回复。"
type: tutorial
audience: [developer]
---

# 快速上手：调用 Halo API

跟着这一页，从打开远程访问开始，用 curl 让 Halo 在一个新会话里干活，并在终端里实时看到它的回复。

## 开始之前 {#before-you-start}

- 一台装好 Halo 并配置了 AI 模型的电脑，或者一台运行中的 [Halo Server](/server/)。
- 一个能运行 `curl` 的终端。
- 最后一步用到 Node.js 22 或更高版本（自带 WebSocket 客户端）。

## 1. 打开远程访问 {#enable-remote-access}

Halo 桌面版只有在开启远程访问后才提供 API：

1. 打开 **设置 › 远程访问**，开启 **启用远程访问**。
2. 复制 **本地地址**，例如 `http://localhost:3456`。要从另一台设备调用，就复制 **局域网地址**。
3. 复制 **访问密码**。

使用 Halo Server 时跳过这一步：地址默认是 `http://<HOST>:8080`，访问密码是环境变量 `HALO_REMOTE_PASSWORD` 的值。

::: danger 访问密码就是管理员密码
拿到访问密码的人可以完全控制这台 Halo。只在自己的终端和服务端使用它，不要发给别人，也不要写进代码仓库。
:::

## 2. 保存地址和密码 {#set-variables}

把地址和密码存进 shell 变量，后面的命令都会用到：

```bash
export HALO_URL='http://localhost:3456'
export HALO_TOKEN='<ACCESS_PASSWORD>'
```

`<ACCESS_PASSWORD>` 换成上一步复制的访问密码。请用单引号：自动生成的密码可能含有 `$`、`!`、`&` 等字符，双引号会让 shell 改写它们。

## 3. 确认服务在线 {#check-status}

这个接口不需要密码：

```bash
curl -s "$HALO_URL/api/remote/status"
```

输出：

```json
{"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

再带上密码，列出你的工作区：

```bash
curl -s "$HALO_URL/api/spaces" -H "Authorization: Bearer $HALO_TOKEN"
```

输出（节选）：

```json
{"success":true,"data":[{"id":"<SPACE_ID>","name":"…","path":"…"}]}
```

记下一个工作区的 `id`。想用 Halo 工作区时，它的 ID 固定是 `halo-temp`。收到 `401` 说明密码不对，回到第 2 步检查。

## 4. 新建一个会话 {#create-conversation}

```bash
curl -sX POST "$HALO_URL/api/spaces/<SPACE_ID>/conversations" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"来自脚本"}'
```

`<SPACE_ID>` 换成第 3 步记下的工作区 ID。输出（节选）：

```json
{"success":true,"data":{"id":"<CONVERSATION_ID>","title":"来自脚本"}}
```

记下会话的 `id`。这个会话也会出现在 Halo 的会话列表里。

## 5. 准备实时接收回复 {#watch}

把下面的脚本保存为 `watch.mjs`。它用访问密码登录 WebSocket，订阅这个会话，并把回复逐字打印出来：

```js
const conversationId = process.argv[2]
const ws = new WebSocket(process.env.HALO_URL.replace(/^http/, 'ws') + '/ws')

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
    console.log('Waiting for Halo…')
    return
  }
  if (msg.type !== 'event' || msg.data.conversationId !== conversationId) return
  if (msg.channel === 'agent:message' && typeof msg.data.delta === 'string') {
    process.stdout.write(msg.data.delta)
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

在同一个终端里运行它，让它保持等待：

```bash
node watch.mjs <CONVERSATION_ID>
```

## 6. 让 Halo 开始工作 {#send-message}

打开第二个终端，同样执行第 2 步的两条 `export`，然后发消息：

```bash
curl -sX POST "$HALO_URL/api/agent/message" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<SPACE_ID>","conversationId":"<CONVERSATION_ID>","message":"列出这个工作区里的文件，用三句话概括它们"}'
```

输出：

```json
{"success":true}
```

`success: true` 表示任务已经开始，回复随后才生成。切回第一个终端，看回复逐字出现。

::: done
第一个终端打印出 Halo 的回复，最后一行是 `[done]`，就说明你已经通过 API 让 Halo 完成了一项任务。在 Halo 里打开这个会话，能看到同样的消息。
:::

## 不用 WebSocket 也可以 {#polling}

只需要最终结果时，可以轮询：

1. 每隔几秒查询一次 `GET /api/agent/generating/<CONVERSATION_ID>`，间隔逐次加倍（2 秒、4 秒……），直到返回 `"data": false`。
2. 用 `GET /api/spaces/<SPACE_ID>/conversations/<CONVERSATION_ID>` 读取会话，最后一条 `role` 为 `assistant` 的消息就是回复。

## 下一步 {#next-steps}

- [HTTP API 概览](/developers/api/)：基础地址、鉴权、错误约定和全部接口分组
- [WebSocket 事件](/developers/api/websocket)：每个事件频道和拼接回复的规则
- [API：数字人](/developers/api/digital-human)：让数字人为你的用户工作
