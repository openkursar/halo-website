---
title: "Halo Server Integration Examples"
description: "End-to-end copy-pasteable examples: a full curl walkthrough of the customer-service flow, a streaming WebSocket example, and Java backend code that wraps the async API into a synchronous ask(); plus a contract-review digital-employee scenario."
---
# Integration Examples

This page provides copy-pasteable end-to-end examples. Read the [Integration Guide](./integration.md) first for the overall flow and constraints.

Placeholders:

- `<host>` — the Halo Server host
- `<base>` — Base URL; direct `http://<host>:8080`, or behind a proxy prefix `https://<host>/fc-xxxx`
- `<token>` — the access token (i.e. `HALO_REMOTE_PASSWORD`)
- `<appId>` — the digital-human App ID
- `<spaceId>` — the space ID the digital human lives in

---

## Scenario 1: E-commerce customer-service digital human

Flow: validate token → send message (with conversationId) → get the result (polling / WebSocket).

### 1. Validate the token (optional)

```bash
curl -sS -X POST "<base>/api/remote/login" \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>"}'
# => {"success":true}
```

### 2. (One-time) Create the customer-service digital human

If you don't have a digital human yet, install one via API. **In production you typically create and tune the persona in the admin UI**; here is the API form:

```bash
curl -sS -X POST "<base>/api/apps/install" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "spec": {
          "type": "automation",
          "name": "Support Assistant",
          "version": "1.0.0",
          "author": "acme",
          "description": "An e-commerce support digital employee answering order, shipping, and return questions.",
          "system_prompt": "You are ACME'\''s e-commerce support assistant. Answer questions about orders, shipping, and returns politely, concisely, and accurately. When unsure, ask the user for their order number.",
          "store": {}
        }
      }'
# => {"success":true,"data":{"appId":"<appId>"}}
```

### 3. Send a message (with the end-user's conversationId)

Send a query for end-user `user-12345`:

```bash
curl -sS -X POST "<base>/api/apps/<appId>/chat/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "conversationId": "user-12345",
        "message": "Where is my order A1001?"
      }'
# => {"success":true,"data":{"conversationId":"app-chat:<appId>"}}
```

::: warning
The returned `conversationId` is always the default `app-chat:<appId>`, not the `user-12345` you passed. Use your own value to retrieve results.
:::

### 4a. Get the result by polling (default conversation only)

> Polling is correct only when you **don't do multi-user isolation** (omit `conversationId`, everyone shares the default conversation). The loop below demonstrates polling on the default conversation.

```bash
# Send without conversationId → lands in the default conversation
curl -sS -X POST "<base>/api/apps/<appId>/chat/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","message":"What is your return policy?"}'

# Poll status until isGenerating=false
while true; do
  status=$(curl -sS "<base>/api/apps/<appId>/chat/status" \
    -H "Authorization: Bearer <token>" | grep -o '"isGenerating":[a-z]*')
  echo "$status"
  [ "$status" = '"isGenerating":false' ] && break
  sleep 1
done

# Fetch messages; take the last assistant content
curl -sS "<base>/api/apps/<appId>/chat/messages" \
  -H "Authorization: Bearer <token>"
# => {"success":true,"data":[
#      {"id":"session-msg-1","role":"user","content":"What is your return policy?","timestamp":"..."},
#      {"id":"session-msg-2","role":"assistant","content":"We offer 7-day no-questions-asked returns...","timestamp":"...","thoughts":[],"thoughtsSummary":{"count":0,"types":{}}}
#    ]}
```

### 4b. Get the result over WebSocket (recommended; isolation + streaming)

Below uses [`websocat`](https://github.com/vi/websocat) to show the handshake and events; in production, implement the same frame sequence with your language's WS client.

```bash
# Open a WS connection (note ws/wss and the path prefix)
websocat "<base-as-ws>/ws"
```

Send these frames in order (one JSON frame per line):

```json
{"type":"auth","payload":{"token":"<token>"}}
{"type":"subscribe","payload":{"conversationId":"user-12345"}}
```

The server first confirms auth, then — after your `chat/send` — pushes the event stream (excerpt):

```json
{"type":"auth:success"}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"","isNewTextBlock":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":"Your order","isStreaming":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":" A1001 is out for delivery...","isStreaming":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"Your order A1001 is out for delivery and should arrive tomorrow.","isComplete":true,"spaceId":"<spaceId>","conversationId":"user-12345"}}
{"type":"event","channel":"agent:complete","data":{"type":"complete","tokenUsage":{"inputTokens":1234,"outputTokens":56},"spaceId":"<spaceId>","conversationId":"user-12345"}}
```

Retrieval logic: **accumulate `agent:message` `delta`s for streaming display; take the `content` of the `isComplete:true` message as the final reply; treat `agent:complete` as the end of the turn.**

> `<base-as-ws>`: map the Base URL `http`→`ws`, `https`→`wss`. E.g. `https://<host>/fc-xxxx` → `wss://<host>/fc-xxxx`.

---

## Wrapping the async API into a synchronous `ask(userId, question)` (Java)

Business systems often want a single call that returns a single answer. The Java pseudo-code below uses one long-lived WebSocket to wrap Halo's async event stream into a blocking `ask()`, isolating each user via their own `conversationId`.

```java
// Deps: any WebSocket client (e.g. Java-WebSocket), an HTTP client (e.g. java.net.http), a JSON library.
public class HaloAgentClient {

  private final String base;      // e.g. https://<host>/fc-xxxx
  private final String token;     // HALO_REMOTE_PASSWORD
  private final String appId;
  private final String spaceId;

  private final HttpClient http = HttpClient.newHttpClient();
  private WebSocket ws;

  // conversationId -> future awaiting that turn's final reply
  private final Map<String, CompletableFuture<String>> pending = new ConcurrentHashMap<>();

  public HaloAgentClient(String base, String token, String appId, String spaceId) {
    this.base = base; this.token = token; this.appId = appId; this.spaceId = spaceId;
  }

  /** Establish and authenticate the long-lived WS. Reuse one connection for the process lifetime. */
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
            handleFrame(data.toString());   // see below
            webSocket.request(1);
            return null;
          }
        }).join();
  }

  /** Synchronous Q&A: send the question, block until the user's conversation returns a final reply. */
  public String ask(String userId, String question) throws Exception {
    String conversationId = "user-" + userId;       // your naming scheme
    CompletableFuture<String> future = new CompletableFuture<>();
    pending.put(conversationId, future);

    // 1) Subscribe the user's conversation (idempotent; re-subscribing has no side effects)
    ws.sendText("{\"type\":\"subscribe\",\"payload\":{\"conversationId\":\"" + conversationId + "\"}}", true);

    // 2) Trigger the agent asynchronously
    String body = String.format(
        "{\"spaceId\":\"%s\",\"conversationId\":\"%s\",\"message\":%s}",
        spaceId, conversationId, jsonString(question));
    http.send(HttpRequest.newBuilder()
        .uri(URI.create(base + "/api/apps/" + appId + "/chat/send"))
        .header("Authorization", "Bearer " + token)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build(), HttpResponse.BodyHandlers.ofString());

    // 3) Block for the final reply (with a timeout fallback)
    try {
      return future.get(60, TimeUnit.SECONDS);
    } finally {
      pending.remove(conversationId);
    }
  }

  /** Handle one WS frame: route final reply/error to the right future by conversationId. */
  private void handleFrame(String json) {
    JsonNode msg = parse(json);
    if (!"event".equals(msg.path("type").asText())) return;

    String channel = msg.path("channel").asText();
    JsonNode d = msg.path("data");
    String conversationId = d.path("conversationId").asText();
    CompletableFuture<String> f = pending.get(conversationId);
    if (f == null) return;

    if ("agent:message".equals(channel) && d.path("isComplete").asBoolean(false)) {
      f.complete(d.path("content").asText());          // final reply
    } else if ("agent:error".equals(channel)) {
      f.completeExceptionally(new RuntimeException(d.path("error").asText())); // error
    }
    // agent:complete can serve as a secondary "turn finished" confirmation;
    // ignore it if already completed at isComplete.
  }
}
```

Key points:

- **One WS connection serves all users**, multiplexed by `conversationId` — no reconnecting per question.
- **Final reply** = the `content` of the `agent:message` with `isComplete:true`; **errors** arrive via `agent:error`.
- A **timeout fallback** is essential (60s here) to avoid blocking forever if a turn produces no terminal event.
- For streaming UX, additionally handle `agent:message` `delta`s (`isStreaming:true`) in `handleFrame` and push them incrementally to the frontend.

---

## Scenario 2: Contract-review digital employee

The same API, a different persona, yields an entirely different digital employee. A contract-review assistant spec:

```bash
curl -sS -X POST "<base>/api/apps/install" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "spec": {
          "type": "automation",
          "name": "Contract Review Assistant",
          "version": "1.0.0",
          "author": "acme-legal",
          "description": "Reviews contract clauses, flags risks, and proposes edits.",
          "system_prompt": "You are a corporate legal contract-review assistant. Review each clause the user submits, identify risks unfavorable to our side (liability, indemnity, breach, IP, dispute resolution, etc.), list them by severity (high/medium/low), and propose drop-in replacement wording. Quote the original clause text.",
          "store": {}
        }
      }'
```

The call pattern is identical to the support scenario — assign a `conversationId` per contract/review task (e.g. `contract-2026-0042`), send the clause text, and stream the review verdict over WebSocket:

```bash
curl -sS -X POST "<base>/api/apps/<appId>/chat/send" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<spaceId>",
        "conversationId": "contract-2026-0042",
        "message": "Review: Clause 8 - The Supplier shall under all circumstances bear unlimited joint liability for all losses of the Buyer."
      }'
```

The business side gets a synchronous verdict via the same `HaloAgentClient.ask("contract-2026-0042", clauseText)`. **The persona difference is entirely driven by `system_prompt`; the integration code is unchanged.** This is the value of the "one digital human = one persona, many isolated conversations" model: write the backend integration once, and it carries any number of digital employees.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 Invalid token` | Wrong token or missing Bearer header | Verify `<token>` and the `Authorization` header |
| WS closes right after connecting | Auth frame not sent, or wrong token | The first frame must be `auth`; wait for `auth:success` before subscribing |
| No events received | Subscribed `conversationId` differs from the sent one | Ensure `subscribe` and `chat/send` use the same `conversationId` |
| Polling returns someone else's history | Used a custom `conversationId` but polled | Multi-user isolation must use WebSocket; polling is default-conversation only |
| `503` | App Manager/Runtime not ready (cold start) | Retry shortly |

---

## Related docs

- [Integration Guide](./integration.md) — flow, conversation lifecycle, polling vs WebSocket trade-offs.
- [Configuration](./configuration.md) — token, port, LLM gateway.
- [Digital Humans docs](../digital-humans/overview) — digital-human spec and persona design.
