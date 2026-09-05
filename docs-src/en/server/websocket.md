---
title: "WebSocket Event Protocol"
description: "Halo Server's real-time WebSocket event protocol: connection handshake, authentication, conversation subscription, the event envelope, and the agent:* channels that carry streamed AI thoughts and results."
---
# WebSocket Event Protocol

Halo Server's API is **asynchronous and event-driven**. After you send a message to an agent or digital human over HTTP, the AI's **thoughts** and **final result** are not returned synchronously — they are pushed in real time over **WebSocket**. This page describes that real-time protocol.

> The desktop / remote frontend is itself a client of this same API. The protocol described below is exactly what the Halo frontend uses, so it doubles as a reference implementation.

---

## Connecting

The WebSocket endpoint is mounted at the fixed path `/ws`, relative to the deployment root:

```
wss://<host>/ws
```

If the service is deployed under a reverse-proxy path prefix (e.g. `/fc-xxxx/`), the WebSocket path is **relative to the deployment root**:

```
wss://<host>/fc-xxxx/ws
```

> The frontend derives the base from the directory the app is mounted under (`new URL('.', document.baseURI)`), converts `http`→`ws` / `https`→`wss`, then appends `/ws`, thereby preserving the reverse-proxy prefix automatically. Integrators should do the same.

A freshly opened connection is **not yet authenticated** — you must complete the auth handshake before you can subscribe and receive events.

---

## Message format

All messages are JSON text frames. Client → server messages look like:

```json
{ "type": "<type>", "payload": { ... } }
```

Server → client messages are shown in each section below.

---

## Authentication handshake

Once the connection opens, the client's **first step** is to send an `auth` message carrying the same service token used for HTTP:

```json
{ "type": "auth", "payload": { "token": "<token>" } }
```

The server replies:

- Success:
  ```json
  { "type": "auth:success" }
  ```
- Failure:
  ```json
  { "type": "auth:failed", "error": "Invalid token" }
  ```
  The server then **closes** the connection (after ~100ms).

> WebSocket auth uses an **in-message token**, not the HTTP `Authorization` header. The token value is identical to the HTTP Bearer (i.e. the service token).
> An unauthenticated connection that sends `subscribe` receives `{ "type": "error", "error": "Not authenticated" }`.

---

## Subscribing to a conversation

Events are dispatched **per conversation**. After authenticating, subscribe to the `conversationId` you care about:

```json
{ "type": "subscribe", "payload": { "conversationId": "<conversationId>" } }
```

Unsubscribe:

```json
{ "type": "unsubscribe", "payload": { "conversationId": "<conversationId>" } }
```

**Which `conversationId` should you subscribe to?**

- **Generic agent**: the `conversationId` you used when calling `POST /api/agent/message`.
- **Digital-human default conversation**: `app-chat:{appId}`.
- **Digital-human per-end-user isolated conversation**: the custom `conversationId` you passed in the `POST /api/apps/:appId/chat/send` request body (**not** the default value echoed in that endpoint's response).

> Subscriptions are connection-level state. After a reconnect, the client must **re-send `auth` and all `subscribe` messages** (the Halo frontend automatically re-subscribes to all previously subscribed conversations after reconnecting).

---

## Event envelope

Real-time events pushed by the server use this uniform envelope:

```json
{
  "type": "event",
  "channel": "<channel>",
  "data": { ... }
}
```

- `channel`: the event channel name (see tables below).
- `data`: the event payload. For conversation-scoped events, **`data` always includes `spaceId` and `conversationId`** (injected by the server before forwarding), so the client can route events to the right conversation.

Only clients that are **authenticated** and **subscribed to the matching `conversationId`** receive that conversation's scoped events.

---

## agent:* channels (streamed thoughts and results)

The channels carrying the AI's streamed output all begin with `agent:`. These are conversation-scoped events — routed by `data.conversationId`. Digital-human chat and the generic agent share the same channel set.

| Channel                 | Meaning                                    |
| ----------------------- | ------------------------------------------ |
| `agent:turn-start`      | A generation turn started                  |
| `agent:session-info`    | Session info (e.g. captured SDK sessionId) |
| `agent:thought`         | A complete thought / intermediate step     |
| `agent:thought-delta`   | Incremental thought tokens (streaming)     |
| `agent:message`         | Assistant message content                  |
| `agent:tool-call`       | The AI invoked a tool                      |
| `agent:tool-result`     | A tool call returned a result              |
| `agent:mcp-status`      | MCP server status change (see note: global broadcast) |
| `agent:compact`         | Context compaction event                   |
| `agent:ask-question`    | The AI raised an `AskUserQuestion`, awaiting an answer |
| `agent:complete`        | The turn completed                         |
| `agent:error`           | An error occurred during generation        |

> **Note on `agent:mcp-status`:** unlike the other `agent:*` channels, this one is emitted as a **global broadcast** to all authenticated clients (it does not carry a `conversationId` and is not subscription-filtered). All other `agent:*` channels above are conversation-scoped.

> **Minimal integration flow:** send `POST /api/agent/message` (or `chat/send`) to get the ack → listen for `agent:thought` / `agent:message` to render progress → treat `agent:complete` as the end → answer `agent:ask-question` via `POST /api/agent/answer-question` → handle `agent:error`.

### App / global broadcast channels

Some events are broadcast to **all authenticated clients** (not conversation-scoped; `data` is not required to carry a `conversationId`). The digital-human lifecycle channels are:

| Channel                    | Meaning                  |
| -------------------------- | ------------------------ |
| `app:status_changed`       | App status changed       |
| `app:activity_entry:new`   | A new activity entry     |
| `app:escalation:new`       | A new escalation request |
| `app:deleted`              | An App was permanently deleted |

---

## Heartbeat

The client may send:

```json
{ "type": "ping" }
```

The server replies:

```json
{ "type": "pong" }
```

---

## Full example (pseudocode)

```js
const ws = new WebSocket("wss://host/fc-xxxx/ws")

ws.onopen = () => {
  // 1. Authenticate
  ws.send(JSON.stringify({ type: "auth", payload: { token: "<token>" } }))
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)

  if (msg.type === "auth:success") {
    // 2. Subscribe to the target conversation
    ws.send(JSON.stringify({
      type: "subscribe",
      payload: { conversationId: "app-chat:<appId>" }
    }))
    // 3. Trigger a chat turn (over HTTP)
    //    POST /api/apps/<appId>/chat/send { spaceId, message }
  }

  if (msg.type === "event") {
    switch (msg.channel) {
      case "agent:thought":   /* render thought */ break
      case "agent:message":   /* render reply */   break
      case "agent:complete":  /* turn finished */  break
      case "agent:error":     /* handle error */   break
    }
  }
}
```

---

## Related pages

- [HTTP API Reference](./api-reference.md) — the HTTP endpoints that trigger generation and read status.
