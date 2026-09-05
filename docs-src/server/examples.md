---
title: "Halo Server 集成示例"
description: "端到端可复制示例：客服数字人的完整 curl 走查、WebSocket 流式示例，以及把异步 API 包成同步 ask() 的 Java 后端代码；附合同审查数字员工场景。"
---
# 集成示例

本文给出可直接复制的端到端示例。请先读[集成指南](./integration.md)了解整体链路与约束。

约定占位符：

- `<host>` —— Halo Server 主机
- `<base>` —— Base URL；直连为 `http://<host>:8080`，经反向代理前缀为 `https://<host>/fc-xxxx`
- `<token>` —— 服务访问令牌（即 `HALO_REMOTE_PASSWORD`）
- `<appId>` —— 数字人 App ID
- `<spaceId>` —— 数字人所在空间 ID

---

## 场景一：电商客服数字人

链路：登录校验 → 发送消息（带 conversationId）→ 取结果（轮询 / WebSocket）。

### 1. 校验令牌（可选）

```bash
curl -sS -X POST "<base>/api/remote/login" \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>"}'
# => {"success":true}
```

### 2.（一次性）创建客服数字人

如果你还没有数字人，可用 API 安装一个。**生产中通常在管理界面创建并调好人格**，这里给出 API 形式：

```bash
curl -sS -X POST "<base>/api/apps/install" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
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
      }'
# => {"success":true,"data":{"appId":"<appId>"}}
```

### 3. 发送消息（带最终用户的 conversationId）

为最终用户 `user-12345` 发送一条咨询：

```bash
curl -sS -X POST "<base>/api/apps/<appId>/chat/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "conversationId": "user-12345",
        "message": "我的订单 A1001 到哪了？"
      }'
# => {"success":true,"data":{"conversationId":"app-chat:<appId>"}}
```

::: warning
返回的 `conversationId` 永远是默认值 `app-chat:<appId>`，不是你传入的 `user-12345`。以你自己传入的为准来取结果。
:::

### 4a. 轮询取结果（仅适合默认会话）

> 仅当**不做多用户隔离**（不传 `conversationId`，所有人共享默认会话）时，轮询才正确。下面演示默认会话下的轮询循环。

```bash
# 不带 conversationId 发送，落到默认会话
curl -sS -X POST "<base>/api/apps/<appId>/chat/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","message":"你们的退货政策是怎样的？"}'

# 轮询状态，直到 isGenerating=false
while true; do
  status=$(curl -sS "<base>/api/apps/<appId>/chat/status" \
    -H "Authorization: Bearer <token>" | grep -o '"isGenerating":[a-z]*')
  echo "$status"
  [ "$status" = '"isGenerating":false' ] && break
  sleep 1
done

# 拉取消息，取最后一条 assistant 的 content
curl -sS "<base>/api/apps/<appId>/chat/messages" \
  -H "Authorization: Bearer <token>"
# => {"success":true,"data":[
#      {"id":"session-msg-1","role":"user","content":"你们的退货政策是怎样的？","timestamp":"..."},
#      {"id":"session-msg-2","role":"assistant","content":"我们支持 7 天无理由退货……","timestamp":"...","thoughts":[],"thoughtsSummary":{"count":0,"types":{}}}
#    ]}
```

### 4b. WebSocket 取结果（推荐，支持多用户隔离与流式）

下面用 [`websocat`](https://github.com/vi/websocat) 演示握手与事件；生产中用各语言的 WS 客户端实现同样的帧序列。

```bash
# 与服务建立 WS 连接（注意 ws/wss 与路径前缀）
websocat "<base-as-ws>/ws"
```

依次发送（每行一帧 JSON）：

```json
{"type":"auth","payload":{"token":"<token>"}}
{"type":"subscribe","payload":{"conversationId":"user-12345"}}
```

服务端先回鉴权成功，随后在你 `chat/send` 后推送事件流（节选）：

```json
{"type":"auth:success"}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"","isNewTextBlock":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":"您的订单","isStreaming":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":" A1001 正在派送中……","isStreaming":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"您的订单 A1001 正在派送中，预计明天送达。","isComplete":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:complete","data":{"type":"complete","tokenUsage":{"inputTokens":1234,"outputTokens":56},"spaceId":"<spaceId>","conversationId":"user-12345"}}
```

取结果的逻辑：**累计 `agent:message` 的 `delta` 做流式展示；以 `isComplete:true` 那条的 `content` 为最终答复；收到 `agent:complete` 视为本轮结束。**

> `<base-as-ws>`：把 Base URL 的 `http`→`ws`、`https`→`wss`。例如 `https://<host>/fc-xxxx` → `wss://<host>/fc-xxxx`。

---

## 把异步 API 包成同步 `ask(userId, question)`（Java）

业务系统往往希望一次调用就拿到一句答复。下面的 Java 伪代码用一条 WebSocket 长连接，把 Halo 的异步事件流封装成阻塞的 `ask()`，每个用户用自己的 `conversationId` 实现隔离。

```java
// 依赖：任意 WebSocket 客户端（如 Java-WebSocket）、HTTP 客户端（如 java.net.http）、JSON 库。
public class HaloAgentClient {

  private final String base;      // 例如 https://<host>/fc-xxxx
  private final String token;     // HALO_REMOTE_PASSWORD
  private final String appId;
  private final String spaceId;

  private final HttpClient http = HttpClient.newHttpClient();
  private WebSocket ws;

  // conversationId -> 等待该轮最终答复的 future
  private final Map<String, CompletableFuture<String>> pending = new ConcurrentHashMap<>();

  public HaloAgentClient(String base, String token, String appId, String spaceId) {
    this.base = base; this.token = token; this.appId = appId; this.spaceId = spaceId;
  }

  /** 建立并鉴权 WS 长连接。整个进程生命周期复用一条连接。 */
  public void connect() {
    String wsUrl = base.replaceFirst("^http", "ws") + "/ws";
    this.ws = HttpClient.newHttpClient()
        .newWebSocketBuilder()
        .buildAsync(URI.create(wsUrl), new WebSocket.Listener() {
          @Override public void onOpen(WebSocket webSocket) {
            webSocket.sendText("{\"type\":\"auth\",\"payload\":{\"token\":\"" + token + "\"}}", true);
            webSocket.request(1);
          }
          @Override public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
            handleFrame(data.toString());   // 见下
            webSocket.request(1);
            return null;
          }
        }).join();
  }

  /** 同步问答：发送问题，阻塞直到该用户会话返回最终答复。 */
  public String ask(String userId, String question) throws Exception {
    String conversationId = "user-" + userId;       // 业务侧命名方案
    CompletableFuture<String> future = new CompletableFuture<>();
    pending.put(conversationId, future);

    // 1) 订阅该用户的会话（幂等，重复订阅无副作用）
    ws.sendText("{\"type\":\"subscribe\",\"payload\":{\"conversationId\":\"" + conversationId + "\"}}", true);

    // 2) 异步触发 Agent
    String body = String.format(
        "{\"spaceId\":\"%s\",\"conversationId\":\"%s\",\"message\":%s}",
        spaceId, conversationId, jsonString(question));
    http.send(HttpRequest.newBuilder()
        .uri(URI.create(base + "/api/apps/" + appId + "/chat/send"))
        .header("Authorization", "Bearer " + token)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build(), HttpResponse.BodyHandlers.ofString());

    // 3) 阻塞等待最终答复（带超时兜底）
    try {
      return future.get(60, TimeUnit.SECONDS);
    } finally {
      pending.remove(conversationId);
    }
  }

  /** 处理一帧 WS 消息：按 conversationId 把最终答复/错误投递给对应 future。 */
  private void handleFrame(String json) {
    JsonNode msg = parse(json);
    if (!"event".equals(msg.path("type").asText())) return;

    String channel = msg.path("channel").asText();
    JsonNode d = msg.path("data");
    String conversationId = d.path("conversationId").asText();
    CompletableFuture<String> f = pending.get(conversationId);
    if (f == null) return;

    if ("agent:message".equals(channel) && d.path("isComplete").asBoolean(false)) {
      f.complete(d.path("content").asText());          // 最终答复
    } else if ("agent:error".equals(channel)) {
      f.completeExceptionally(new RuntimeException(d.path("error").asText())); // 出错
    }
    // agent:complete 可作为「本轮结束」二次确认；若已在 isComplete 处 complete 则忽略。
  }
}
```

要点：

- **一条 WS 连接服务所有用户**，按 `conversationId` 多路复用，避免每次问答都重连。
- **最终答复**取 `agent:message` 中 `isComplete:true` 的 `content`；**错误**走 `agent:error`。
- **超时兜底**必不可少（示例用 60s），防止某轮无终止事件时永久阻塞。
- 需要流式 UX 时，在 `handleFrame` 里额外处理 `agent:message` 的 `delta`（`isStreaming:true`），增量推给前端。

---

## 场景二：合同审查数字员工

同一套接口，换一个人格即可得到完全不同的数字员工。合同审查助手的 spec 示例：

```bash
curl -sS -X POST "<base>/api/apps/install" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "spec": {
          "type": "automation",
          "name": "合同审查助手",
          "version": "1.0.0",
          "author": "acme-legal",
          "description": "审阅合同条款，识别风险点并给出修改建议。",
          "system_prompt": "你是企业法务的合同审查助手。逐条审阅用户提交的合同条款，识别对我方不利的风险点（责任、赔付、违约、知识产权、争议解决等），按风险等级（高/中/低）列出，并给出可直接替换的修改建议。引用条款原文。",
          "store": {}
        }
      }'
```

调用方式与客服场景完全一致——按合同/审查任务分配 `conversationId`（例如 `contract-2026-0042`），发送条款文本，再通过 WebSocket 取流式审查结论：

```bash
curl -sS -X POST "<base>/api/apps/<appId>/chat/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "conversationId": "contract-2026-0042",
        "message": "请审查：第 8 条 乙方应在任何情况下对甲方的全部损失承担无限连带责任。"
      }'
```

业务侧用同一个 `HaloAgentClient.ask("contract-2026-0042", clauseText)` 即可拿到同步结论。**人格的差异完全由 `system_prompt` 决定，集成代码零改动。** 这正是「一种数字人 = 一种人格，多会话隔离」模型的价值：业务后端写一次对接，便可承载任意多种数字员工。

---

## 常见问题排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `401 Invalid token` | 令牌错误或未带 Bearer 头 | 核对 `<token>` 与 `Authorization` 头 |
| WS 连上即被关闭 | 鉴权帧未发或令牌错 | 连接后第一帧必须发 `auth`，等到 `auth:success` 再订阅 |
| 收不到任何事件 | 订阅的 `conversationId` 与发送的不一致 | 确保 `subscribe` 与 `chat/send` 用同一个 `conversationId` |
| 轮询拿到别人的历史 | 用自定义 `conversationId` 却走了轮询 | 多用户隔离必须走 WebSocket；轮询只对默认会话有效 |
| `503` | App Manager/Runtime 未就绪（冷启动） | 稍候重试 |

---

## 相关文档

- [集成指南](./integration.md) —— 链路、会话生命周期、两种取结果方式的取舍。
- [配置说明](./configuration.md) —— 令牌、端口、大模型网关。
- [数字人文档](../digital-humans/overview) —— 数字人 spec 与人格设计。
