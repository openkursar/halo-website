---
title: "Halo Server 集成示例：curl、WebSocket 与 Java"
description: "Halo Server 集成示例：客服数字人的 curl 走查、WebSocket 事件流，以及把异步 API 包成同步 ask() 的 Java 代码。"
type: how-to
audience: [developer]
---

# Halo Server 集成示例

这一页给出可以直接复制的端到端示例。整体链路和约束见 [Halo Server 集成指南](/server/integration)。

示例中的占位符：

- `$HALO_URL`、`$HALO_TOKEN`：基础地址和访问密码，设置方法见[快速上手](/developers/quickstart#set-variables)。直连时基础地址是 `http://<HOST>:8080`，经反向代理时是 `https://<HOST>/<PATH_PREFIX>`。
- `<APP_ID>`：数字人的 ID。
- `<SPACE_ID>`：数字人所在工作区的 ID。

## 场景一：网店客服数字人 {#support}

链路：校验密码 → 安装数字人 → 用用户自己的线程发消息 → 取回复。

### 1. 校验访问密码 {#check-password}

```bash
curl -s -X POST "$HALO_URL/api/remote/login" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$HALO_TOKEN\"}"
```

输出：

```json
{"success":true}
```

### 2. 安装客服数字人（一次性） {#install}

生产中通常在 Halo 界面里创建并调试好数字人。用 API 安装的写法：

```bash
curl -s -X POST "$HALO_URL/api/apps/install" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "spec": {
          "type": "automation",
          "name": "客服助手",
          "version": "1.0.0",
          "author": "example",
          "description": "网店客服，回答订单、物流和退换货问题。",
          "system_prompt": "你是一家网店的客服助手。礼貌、简洁、准确地回答订单、物流和退换货问题。不确定时，请用户提供订单号。"
        }
      }'
```

输出：

```json
{"success":true,"data":{"appId":"<APP_ID>"}}
```

### 3. 用户发来一条消息 {#send}

用户 12345 的线程键是 `app-chat:<APP_ID>:http:direct:user-12345`：

```bash
curl -s -X POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "conversationId": "app-chat:<APP_ID>:http:direct:user-12345",
        "message": "我的订单 A1001 到哪了？"
      }'
```

输出：

```json
{"success":true,"data":{"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
```

### 4a. 轮询取回复 {#polling}

```bash
THREAD='app-chat:<APP_ID>:http:direct:user-12345'

# 等到这个线程不再生成，间隔逐次加倍
delay=2
until curl -s "$HALO_URL/api/apps/<APP_ID>/chat/status?conversationId=$THREAD" \
    -H "Authorization: Bearer $HALO_TOKEN" | grep -q '"isGenerating":false'; do
  sleep "$delay"
  delay=$((delay * 2))
done

# 读取聊天记录，最后一条 assistant 消息就是回复
curl -s "$HALO_URL/api/apps/<APP_ID>/chat/messages?conversationId=$THREAD" \
  -H "Authorization: Bearer $HALO_TOKEN"
```

输出（节选）：

```json
{"success":true,"data":[
  {"id":"…","role":"user","content":"我的订单 A1001 到哪了？","timestamp":"…"},
  {"id":"…","role":"assistant","content":"你的订单 A1001 正在派送中……","timestamp":"…"}
]}
```

### 4b. 用 WebSocket 取回复 {#websocket}

用任意 WebSocket 客户端（例如命令行工具 `websocat`）连接 `ws://<HOST>:8080/ws`，依次发送下面两帧，然后再调用第 3 步的 `chat/send`：

```json
{"type":"auth","payload":{"token":"<YOUR_ACCESS_PASSWORD>"}}
{"type":"subscribe","payload":{"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
```

服务端先回复鉴权成功，随后推送事件流（节选，省略了 `spaceId`）：

```json
{"type":"auth:success"}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"","isComplete":false,"isStreaming":false,"isNewTextBlock":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":"你的订单","isComplete":false,"isStreaming":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":" A1001 正在派送中……","isComplete":false,"isStreaming":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"你的订单 A1001 正在派送中，预计明天送达。","isComplete":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:complete","data":{"type":"complete","duration":6120,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
```

拼接 `delta` 做逐字显示；`isComplete: true` 那条的 `content` 是最终答复；`agent:complete` 表示这一轮结束。规则详见[拼接回复文本](/developers/api/websocket#assemble-reply)。

## 把异步 API 包成同步的 ask()（Java） {#java}

业务系统常常希望一次调用就拿到一句答复。下面的 Java 示例用一条 WebSocket 长连接，把事件流封装成阻塞的 `ask()`，每个用户用自己的线程：

```java
// 依赖：java.net.http（HttpClient、WebSocket）和任意 JSON 库（这里用 Jackson 的 JsonNode）。
public class HaloAgentClient {

  private final String base;      // 例如 https://<HOST>/<PATH_PREFIX>
  private final String token;     // 访问密码，从配置或密钥管理中读取
  private final String appId;
  private final String spaceId;

  private final HttpClient http = HttpClient.newHttpClient();
  private WebSocket ws;

  // 线程键 -> 等待这一轮最终答复的 future
  private final Map<String, CompletableFuture<String>> pending = new ConcurrentHashMap<>();

  public HaloAgentClient(String base, String token, String appId, String spaceId) {
    this.base = base; this.token = token; this.appId = appId; this.spaceId = spaceId;
  }

  /** 建立并鉴权 WebSocket 长连接，整个进程复用一条连接。断线后重连并重新订阅。 */
  public void connect() {
    String wsUrl = base.replaceFirst("^http", "ws") + "/ws";
    this.ws = http.newWebSocketBuilder()
        .buildAsync(URI.create(wsUrl), new WebSocket.Listener() {
          @Override public void onOpen(WebSocket webSocket) {
            webSocket.sendText("{\"type\":\"auth\",\"payload\":{\"token\":" + jsonString(token) + "}}", true);
            webSocket.request(1);
          }
          @Override public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {
            handleFrame(data.toString());
            webSocket.request(1);
            return null;
          }
        }).join();
  }

  /** 同步问答：发出问题，阻塞到这个用户的线程返回最终答复。 */
  public String ask(String userId, String question) throws Exception {
    String thread = "app-chat:" + appId + ":http:direct:user-" + userId; // userId 只含字母、数字、_ 和 -
    CompletableFuture<String> future = new CompletableFuture<>();
    pending.put(thread, future);

    // 1) 订阅这个线程（重复订阅没有副作用）
    ws.sendText("{\"type\":\"subscribe\",\"payload\":{\"conversationId\":" + jsonString(thread) + "}}", true);

    // 2) 发出消息，Halo 在后台处理
    String body = "{\"spaceId\":" + jsonString(spaceId)
        + ",\"conversationId\":" + jsonString(thread)
        + ",\"message\":" + jsonString(question) + "}";
    http.send(HttpRequest.newBuilder()
        .uri(URI.create(base + "/api/apps/" + appId + "/chat/send"))
        .header("Authorization", "Bearer " + token)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build(), HttpResponse.BodyHandlers.ofString());

    // 3) 等待最终答复，设置超时
    try {
      return future.get(120, TimeUnit.SECONDS);
    } finally {
      pending.remove(thread);
    }
  }

  /** 按线程键把最终答复或错误交给对应的 future。 */
  private void handleFrame(String json) {
    JsonNode msg = parse(json);
    if (!"event".equals(msg.path("type").asText())) return;

    String channel = msg.path("channel").asText();
    JsonNode d = msg.path("data");
    CompletableFuture<String> f = pending.get(d.path("conversationId").asText());
    if (f == null) return; // 其他线程的状态事件也会到达，忽略即可

    if ("agent:message".equals(channel) && d.path("isComplete").asBoolean(false)) {
      f.complete(d.path("content").asText());
    } else if ("agent:error".equals(channel)) {
      f.completeExceptionally(new RuntimeException(d.path("error").asText()));
    }
  }
}
```

`jsonString()` 和 `parse()` 分别用你的 JSON 库实现字符串转义和解析。

要点：

- **一条连接服务所有用户**，按线程键分发事件，不需要每次问答都重连。
- **最终答复**取 `isComplete: true` 的 `agent:message` 的 `content`；**错误**看 `agent:error`。
- **一定要设超时**，避免某一轮没有结束事件时永远阻塞。
- **同一个用户串行提问**：上一轮结束前不要在同一个线程里发下一条。
- 需要逐字显示时，在 `handleFrame` 里把 `delta` 增量推给前端。

## 场景二：合同审查数字人 {#contract-review}

同一套接口换一个人设，就是另一种数字人。合同审查助手的 spec：

```bash
curl -s -X POST "$HALO_URL/api/apps/install" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "spec": {
          "type": "automation",
          "name": "合同审查助手",
          "version": "1.0.0",
          "author": "example",
          "description": "审阅合同条款，识别风险点并给出修改建议。",
          "system_prompt": "你是法务部门的合同审查助手。逐条审阅用户提交的合同条款，找出对我方不利的风险点（责任、赔付、违约、知识产权、争议解决等），按高、中、低列出，并给出可以直接替换的修改建议，引用条款原文。"
        }
      }'
```

调用方式和客服场景一样：按审查任务分配线程，例如 `app-chat:<APP_ID>:http:direct:contract-2026-0042`，发送条款文本，再通过 WebSocket 取回审查结论：

```bash
curl -s -X POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "conversationId": "app-chat:<APP_ID>:http:direct:contract-2026-0042",
        "message": "请审查：第 8 条 乙方应在任何情况下对甲方的全部损失承担无限连带责任。"
      }'
```

人设的差别完全由 `system_prompt` 决定，对接代码不用改：后台写一次对接，就能承载任意多种数字人。

## 常见问题 {#troubleshooting}

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `401 Invalid token` | 访问密码错误，或没有带 Bearer 头 | 核对 `$HALO_TOKEN` 和 `Authorization` 头 |
| `400 Invalid conversationId` | 线程键格式不对，例如直接传了 `user-12345` | 用 `app-chat:<APP_ID>:http:direct:<USER_KEY>` |
| WebSocket 连上就被关闭 | 没有先发 `auth`，或密码错误 | 连接后第一帧发 `auth`，收到 `auth:success` 再订阅 |
| 收不到某个线程的回复 | 订阅的线程键和发送时用的不一致 | `subscribe` 和 `chat/send` 用同一个 `conversationId` |
| `503` | 服务还在启动 | 冷启动后稍等再试 |

## 相关页面 {#related}

- [Halo Server 集成指南](/server/integration)：线程、两种取回复方式和错误处理
- [WebSocket 事件](/developers/api/websocket)：全部事件频道
- [Halo Server 配置](/server/configuration)：访问密码、端口和大模型网关
