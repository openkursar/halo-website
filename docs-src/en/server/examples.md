---
title: "Halo Server integration examples: curl and Java"
description: "Halo Server integration examples: a curl walkthrough for a support Digital Human, a WebSocket event stream and a Java ask() wrapper."
type: how-to
audience: [developer]
---

# Halo Server integration examples

This page has end-to-end examples you can copy. The overall flow and its constraints are in the [Halo Server integration guide](/en/server/integration).

Placeholders used below:

- `$HALO_URL`, `$HALO_TOKEN`: the base URL and access password, set as in the [quickstart](/en/developers/quickstart#set-variables). The base URL is `http://<HOST>:8080` for a direct connection, or `https://<HOST>/<PATH_PREFIX>` behind a reverse proxy.
- `<APP_ID>`: the Digital Human's id.
- `<SPACE_ID>`: the id of the Digital Human's workspace.

## Case 1: a support Digital Human for an online shop {#support}

The flow: check the password → install the Digital Human → send a message in the user's own thread → get the reply.

### 1. Check the access password {#check-password}

```bash
curl -s -X POST "$HALO_URL/api/remote/login" \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$HALO_TOKEN\"}"
```

Output:

```json
{"success":true}
```

### 2. Install the support Digital Human (once) {#install}

In production you usually create and fine-tune the Digital Human in Halo. Installing it through the API looks like this:

```bash
curl -s -X POST "$HALO_URL/api/apps/install" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "spec": {
          "type": "automation",
          "name": "Support assistant",
          "version": "1.0.0",
          "author": "example",
          "description": "Answers questions about orders, shipping and returns for an online shop.",
          "system_prompt": "You are the support assistant of an online shop. Answer questions about orders, shipping and returns politely, briefly and accurately. When unsure, ask for the order number."
        }
      }'
```

Output:

```json
{"success":true,"data":{"appId":"<APP_ID>"}}
```

### 3. A user sends a message {#send}

User 12345's thread key is `app-chat:<APP_ID>:http:direct:user-12345`:

```bash
curl -s -X POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "conversationId": "app-chat:<APP_ID>:http:direct:user-12345",
        "message": "Where is my order A1001?"
      }'
```

Output:

```json
{"success":true,"data":{"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
```

### 4a. Get the reply by polling {#polling}

```bash
THREAD='app-chat:<APP_ID>:http:direct:user-12345'

# Wait until this thread stops generating, doubling the interval each time
delay=2
until curl -s "$HALO_URL/api/apps/<APP_ID>/chat/status?conversationId=$THREAD" \
    -H "Authorization: Bearer $HALO_TOKEN" | grep -q '"isGenerating":false'; do
  sleep "$delay"
  delay=$((delay * 2))
done

# Read the transcript; the last assistant message is the reply
curl -s "$HALO_URL/api/apps/<APP_ID>/chat/messages?conversationId=$THREAD" \
  -H "Authorization: Bearer $HALO_TOKEN"
```

Output (shortened):

```json
{"success":true,"data":[
  {"id":"…","role":"user","content":"Where is my order A1001?","timestamp":"…"},
  {"id":"…","role":"assistant","content":"Your order A1001 is out for delivery…","timestamp":"…"}
]}
```

### 4b. Get the reply over the WebSocket {#websocket}

With any WebSocket client (the command-line tool `websocat`, for example), connect to `ws://<HOST>:8080/ws`, send these two frames, and then call `chat/send` from step 3:

```json
{"type":"auth","payload":{"token":"<YOUR_ACCESS_PASSWORD>"}}
{"type":"subscribe","payload":{"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
```

The server confirms the sign-in, then streams events (shortened, `spaceId` left out):

```json
{"type":"auth:success"}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"","isComplete":false,"isStreaming":false,"isNewTextBlock":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":"Your order","isComplete":false,"isStreaming":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":" A1001 is out for delivery…","isComplete":false,"isStreaming":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"Your order A1001 is out for delivery and should arrive tomorrow.","isComplete":true,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
{"type":"event","channel":"agent:complete","data":{"type":"complete","duration":6120,"conversationId":"app-chat:<APP_ID>:http:direct:user-12345"}}
```

Append each `delta` for a typewriter display; the `content` of the event with `isComplete: true` is the final answer; `agent:complete` ends the turn. The rules are in [assembling the reply](/en/developers/api/websocket#assemble-reply).

## Wrapping the async API as a synchronous ask() in Java {#java}

Business systems often want one call that returns one answer. This Java example wraps the event stream into a blocking `ask()` over a single long-lived WebSocket, with a thread per user:

```java
// Needs java.net.http (HttpClient, WebSocket) and any JSON library (Jackson's JsonNode here).
public class HaloAgentClient {

  private final String base;      // for example https://<HOST>/<PATH_PREFIX>
  private final String token;     // the access password, read from configuration or a secret store
  private final String appId;
  private final String spaceId;

  private final HttpClient http = HttpClient.newHttpClient();
  private WebSocket ws;

  // thread key -> future waiting for the final answer of the turn
  private final Map<String, CompletableFuture<String>> pending = new ConcurrentHashMap<>();

  public HaloAgentClient(String base, String token, String appId, String spaceId) {
    this.base = base; this.token = token; this.appId = appId; this.spaceId = spaceId;
  }

  /** Opens and authenticates one WebSocket for the whole process. Reconnect and resubscribe after a drop. */
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

  /** Synchronous question and answer: sends the question and blocks until the user's thread returns the final answer. */
  public String ask(String userId, String question) throws Exception {
    String thread = "app-chat:" + appId + ":http:direct:user-" + userId; // userId: letters, digits, _ and - only
    CompletableFuture<String> future = new CompletableFuture<>();
    pending.put(thread, future);

    // 1) Subscribe to the thread (subscribing twice is harmless)
    ws.sendText("{\"type\":\"subscribe\",\"payload\":{\"conversationId\":" + jsonString(thread) + "}}", true);

    // 2) Send the message; Halo works on it in the background
    String body = "{\"spaceId\":" + jsonString(spaceId)
        + ",\"conversationId\":" + jsonString(thread)
        + ",\"message\":" + jsonString(question) + "}";
    http.send(HttpRequest.newBuilder()
        .uri(URI.create(base + "/api/apps/" + appId + "/chat/send"))
        .header("Authorization", "Bearer " + token)
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(body))
        .build(), HttpResponse.BodyHandlers.ofString());

    // 3) Wait for the final answer, with a timeout
    try {
      return future.get(120, TimeUnit.SECONDS);
    } finally {
      pending.remove(thread);
    }
  }

  /** Hands the final answer or error of a thread to its future. */
  private void handleFrame(String json) {
    JsonNode msg = parse(json);
    if (!"event".equals(msg.path("type").asText())) return;

    String channel = msg.path("channel").asText();
    JsonNode d = msg.path("data");
    CompletableFuture<String> f = pending.get(d.path("conversationId").asText());
    if (f == null) return; // status events of other threads arrive too; ignore them

    if ("agent:message".equals(channel) && d.path("isComplete").asBoolean(false)) {
      f.complete(d.path("content").asText());
    } else if ("agent:error".equals(channel)) {
      f.completeExceptionally(new RuntimeException(d.path("error").asText()));
    }
  }
}
```

Implement `jsonString()` (string escaping) and `parse()` with your JSON library.

Key points:

- **One connection serves every user**: events are routed by thread key, so you never reconnect per question.
- **The final answer** is the `content` of the `agent:message` with `isComplete: true`; **errors** arrive as `agent:error`.
- **Always set a timeout**, so a turn without an end event can never block forever.
- **Ask one question at a time per user**: do not send the next message in a thread before the previous turn ends.
- For a typewriter display, push each `delta` to the front end from `handleFrame`.

## Case 2: a contract review Digital Human {#contract-review}

The same endpoints with a different persona give you a different Digital Human. The spec of a contract review assistant:

```bash
curl -s -X POST "$HALO_URL/api/apps/install" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "spec": {
          "type": "automation",
          "name": "Contract reviewer",
          "version": "1.0.0",
          "author": "example",
          "description": "Reviews contract clauses, flags risks and proposes changes.",
          "system_prompt": "You are the contract review assistant of a legal team. Review each clause the user submits, find the risks for our side (liability, compensation, breach, intellectual property, dispute resolution and similar), list them as high, medium or low, quote the original clause, and propose replacement wording."
        }
      }'
```

Call it exactly like the support case: give each review its own thread, such as `app-chat:<APP_ID>:http:direct:contract-2026-0042`, send the clause text, and get the findings over the WebSocket:

```bash
curl -s -X POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "spaceId": "<SPACE_ID>",
        "conversationId": "app-chat:<APP_ID>:http:direct:contract-2026-0042",
        "message": "Please review: clause 8, the supplier shall be jointly and without limit liable for all losses of the buyer under any circumstances."
      }'
```

The difference in persona comes entirely from `system_prompt`; the integration code stays the same. Write the integration once and it can host any number of Digital Humans.

## Troubleshooting {#troubleshooting}

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 Invalid token` | Wrong access password, or no Bearer header | Check `$HALO_TOKEN` and the `Authorization` header |
| `400 Invalid conversationId` | Malformed thread key, such as a bare `user-12345` | Use `app-chat:<APP_ID>:http:direct:<USER_KEY>` |
| The WebSocket closes right after connecting | No `auth` first, or a wrong password | Send `auth` as the first frame and subscribe after `auth:success` |
| No reply arrives for a thread | The subscribed key differs from the one used to send | Use the same `conversationId` for `subscribe` and `chat/send` |
| `503` | The service is still starting | Wait a moment after a cold start and retry |

## Related {#related}

- [Halo Server integration guide](/en/server/integration): threads, the two ways to get replies, and error handling
- [WebSocket events](/en/developers/api/websocket): every event channel
- [Halo Server configuration](/en/server/configuration): access password, port and LLM gateway
