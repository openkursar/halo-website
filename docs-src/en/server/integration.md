---
title: "Halo Server Integration Guide"
description: "Integrate Halo Server as an AI agent backend for your business system: digital-human creation, conversation isolation, result delivery (polling vs WebSocket), multi-user isolation, auth, and error handling."
---
# Integration Guide

This guide is for **business backend engineers** (e.g. Java developers) who want to use Halo Server as the AI agent backend for a "digital employee" and integrate it into their own systems.

The canonical flow:

```
End-user query  →  Business backend (Java)  →  Halo Server (digital-human agent)  →  Response
```

The business backend owns **user identity, entry points, UI, and the synchronous/streaming experience**; Halo Server runs the **digital-human agent** (its persona, tools, skills, memory). The two communicate over HTTP + WebSocket.

---

## Basics

### Base URL

Every call is relative to a configurable **Base URL**. Make it a config value — never hardcode it.

- Direct: `http://<host>:8080`
- Behind a reverse proxy (platforms often mount the service under a path prefix such as `/fc-xxxx/`): `https://<host>/fc-xxxx`

::: warning Path prefix
When deployed under a reverse-proxy path prefix, **all** HTTP endpoints and the WebSocket live under that prefix. For example, sending a message hits
`https://<host>/fc-xxxx/api/apps/<appId>/chat/send`, and the WebSocket is
`wss://<host>/fc-xxxx/ws`. Set Base URL to `https://<host>/fc-xxxx`, then append `/api/...` and `/ws`.
:::

### Authentication

Halo Server uses a single-token scheme. The token is `HALO_REMOTE_PASSWORD` (default `halo123`; change it to a strong random value in production — see [Configuration](./configuration.md)).

Every `/api/*` call must carry the standard Bearer header:

```http
Authorization: Bearer <token>
```

An optional login endpoint (to verify the token before making real calls):

```http
POST /api/remote/login
Content-Type: application/json

{ "token": "<token>" }
```

Returns `{ "success": true }` on success.

::: tip The token IS the password
There is no "username + password exchanged for a session token" flow. `/api/remote/login` merely validates the token; the actual credential is always the same `<token>`, carried as `Authorization: Bearer <token>`.
:::

### Response envelope

REST endpoints return a uniform shape:

```json
{ "success": true, "data": { /* ... */ } }
```

On failure:

```json
{ "success": false, "error": "description" }
```

Always check `success` before reading `data`.

---

## Step 1: Create a digital human (App)

A "digital human" maps to a `type: automation` **App** in Halo. It encapsulates the agent's persona (`system_prompt`), available tools/skills, memory, and permissions.

Two ways to create one:

1. **Admin UI (recommended)**: create and tune it in Halo's apps/digital-human UI. The least error-prone path — let product/ops configure the persona, then have the business system call it.
2. **API install**: install programmatically via `POST /api/apps/install`.

A minimal automation digital-human spec:

```json
{
  "spaceId": "<spaceId>",
  "spec": {
    "type": "automation",
    "name": "Support Assistant",
    "version": "1.0.0",
    "author": "acme",
    "description": "An e-commerce support digital employee answering order, shipping, and return questions.",
    "system_prompt": "You are ACME's e-commerce support assistant. Answer questions about orders, shipping, and returns politely, concisely, and accurately. When unsure, ask the user for their order number.",
    "store": {}
  }
}
```

Install via API:

```http
POST /api/apps/install
Authorization: Bearer <token>
Content-Type: application/json

{ "spaceId": "<spaceId>", "spec": { /* the spec above */ } }
```

Returns:

```json
{ "success": true, "data": { "appId": "<appId>" } }
```

Record the returned `appId` — all subsequent chat calls use it. One digital human (one `appId`) = one fixed persona that serves all end-users.

::: tip Full spec fields
For the full `system_prompt`, `config_schema`, `subscriptions`, `permissions`, memory, etc., see the [Digital Humans docs](../digital-humans/overview). This guide focuses on **calling an already-created digital human**.
:::

---

## Step 2: Assign each end-user a conversationId

This is the heart of multi-user isolation.

- **One digital human** (one `appId`) serves all your end-users.
- Each end-user gets a **business-side conversation id** `conversationId`, whose naming scheme you define — e.g. `user-12345`, `order-svc-u12345`.
- **Different `conversationId` = independent conversation context** (separate history and memory window) but the **same persona**.
- A returning user **reuses their `conversationId`** to continue the context; a new user gets a **new `conversationId`**.

Internally, Halo Server keys the session as `app-chat:{appId}` (the default conversation) or the custom `conversationId` you pass. Two different `conversationId`s land in two independent agent sessions that never cross-talk.

::: warning Default vs custom conversation (must read)
If you **omit** `conversationId`, every call lands in the single **default conversation** `app-chat:{appId}`, and all users share one context — only suitable for single-user/demo scenarios.

For **true multi-user isolation**, you must pass each user's own `conversationId`. But note: **the REST status and history endpoints only operate on the default conversation** (see "Getting the result" below). Therefore, when using a custom `conversationId` for isolation, **retrieve results over WebSocket** (which subscribes precisely by `conversationId`). This is the single most important engineering constraint in this guide.
:::

---

## Step 3: Send a message

```http
POST /api/apps/<appId>/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "spaceId": "<spaceId>",
  "conversationId": "user-12345",
  "message": "Where is my order A1001?"
}
```

Request body fields:

| Field | Required | Description |
|---|---|---|
| `spaceId` | yes | The space ID the digital human lives in |
| `message` | yes | User message text |
| `conversationId` | no | Business-side conversation id. Omit → default conversation `app-chat:{appId}` |
| `images` | no | Multimodal image attachments |
| `thinkingEnabled` | no | Enable extended thinking |

Returns immediately (**note: this is an async trigger — it does not wait for the agent to finish**):

```json
{ "success": true, "data": { "conversationId": "app-chat:<appId>" } }
```

::: warning The returned conversationId is always the default
Even if you pass a custom `conversationId`, this endpoint's `data.conversationId` is **always the default** `app-chat:{appId}`, not your value. **Use the `conversationId` you passed in** to subscribe/query results — do not rely on the response value.
:::

Sending is **fire-and-forget**: the HTTP call returns instantly and the agent runs in the background. Retrieve the result via one of the two methods below.

---

## Step 4: Getting the result

The async model is intentional — the business layer **composes** synchronous-blocking or streaming UX on top. Two retrieval methods.

### Method A: WebSocket (recommended; supports isolation and streaming)

The WebSocket delivers events scoped precisely by `conversationId`. It is the **only correct choice** for multi-user isolation and also exposes the agent's thinking/tool process for typewriter-style streaming.

Connection and handshake:

1. Connect to `wss://<base>/ws` (`<base>` includes the path prefix).
2. Send the auth frame: `{ "type": "auth", "payload": { "token": "<token>" } }` and wait for `{ "type": "auth:success" }`. On failure the server replies `{ "type": "auth:failed" }` and closes the connection.
3. Subscribe: `{ "type": "subscribe", "payload": { "conversationId": "user-12345" } }`.
4. Receive events: the server pushes `{ "type": "event", "channel": "...", "data": { ... } }`. Every `data` carries `spaceId` and `conversationId`, so you can route to the right user.
5. Unsubscribe: `{ "type": "unsubscribe", "payload": { "conversationId": "user-12345" } }`.
6. Heartbeat: send `{ "type": "ping" }`; the server replies `{ "type": "pong" }`.

::: tip Subscribe early
Connect, authenticate, and subscribe **before or at the same time as** sending the message, so you don't miss early events. A single connection can subscribe to many `conversationId`s — reuse one long-lived connection for many users.
:::

#### Event channels

| channel | Meaning | Key `data` fields |
|---|---|---|
| `agent:message` | Assistant text. Streaming deltas + final full text | `delta` (streaming delta) / `content` + `isComplete: true` (final) / `isNewTextBlock` (new text block start) |
| `agent:thought` | Thinking block, or a stage result block | `thought` (has `type`, `content`, ...) |
| `agent:thought-delta` | Incremental thinking content | `thoughtId`, `delta`, `content` |
| `agent:tool-call` | Agent invokes a tool | tool-call details |
| `agent:tool-result` | Tool returns | tool result |
| `agent:complete` | This reply turn finished | `tokenUsage` |
| `agent:error` | Error | `error`, optional `errorType`/`errorCode` |
| `agent:compact` | Context was compacted | `trigger`, `preTokens` |
| `agent:session-info` | Session metadata | session fields |

::: warning How to get the final reply
There is **no** `agent:result` channel. The final reply text arrives via `agent:message` (`isComplete: true`, whose `content` is the full reply), immediately followed by `agent:complete` (carrying `tokenUsage`) marking the end of the turn.

Reliable way to get "one complete answer": listen to `agent:message`, take the `content` of the one where `isComplete === true`; treat `agent:complete` as the "turn finished" signal. For live streaming, keep appending `agent:message` `delta`s in the meantime.
:::

### Method B: Polling (default conversation only)

Polling uses two REST endpoints: check whether it's done, then fetch the reply.

Check status:

```http
GET /api/apps/<appId>/chat/status
Authorization: Bearer <token>
```

```json
{ "success": true, "data": { "isGenerating": false, "conversationId": "app-chat:<appId>" } }
```

Fetch messages (after the agent finishes):

```http
GET /api/apps/<appId>/chat/messages
Authorization: Bearer <token>
```

```json
{
  "success": true,
  "data": [
    { "id": "session-msg-1", "role": "user", "content": "Where is my order A1001?", "timestamp": "..." },
    { "id": "session-msg-2", "role": "assistant", "content": "Your order A1001 is out for delivery...", "timestamp": "...", "thoughts": [], "thoughtsSummary": { "count": 0, "types": {} } }
  ]
}
```

Message record fields: `id`, `role` (`user` / `assistant`), `content`, `timestamp`, with optional `thoughts[]` and `thoughtsSummary`. Take the `content` of the last `role: "assistant"` record as the reply.

::: danger Critical polling limitation
`GET .../chat/status` and `GET .../chat/messages` **only operate on the default conversation** `app-chat:{appId}`; they **do not accept or distinguish a `conversationId`**.

Therefore:
- If you **don't do multi-user isolation** (all users share the default conversation), polling works.
- If you use a **custom `conversationId` for isolation**, polling will **cross-talk** (you'd read the default conversation, not that user's history) — you **must use WebSocket** instead.
:::

### Comparison

| Dimension | WebSocket | Polling |
|---|---|---|
| Multi-user isolation | ✅ Precise delivery by `conversationId` | ❌ Default conversation only |
| Streaming / process visibility | ✅ Thinking, tools, text deltas | ❌ Only the final history |
| Latency | ✅ Push, low latency | ⚠️ Depends on poll interval |
| Implementation complexity | Long-lived connection, reconnect, auth handshake | Simple request loop |
| Best for | Production, multi-user, streaming UX | Single-user/demo, or final-result-only on the default conversation |

**Recommendation**: production, multi-user, streaming → WebSocket. A simple single-persona single-conversation sync Q&A → polling is fine.

---

## Conversation lifecycle

- **Continuation**: repeatedly `chat/send` to the same `conversationId` and the context continues automatically (same agent session, in-memory reuse; after a process rebuild, history is restored from disk via the saved session id).
- **Stop generation**: `POST /api/apps/<appId>/chat/stop` aborts the digital human's current in-flight generation.
- **Clear history**: `POST /api/apps/<appId>/chat/clear` with body `{ "spaceId": "<spaceId>" }` resets to a fresh conversation (clears the default conversation history).

---

## Multi-user isolation, summarized

Putting it together, the standard pattern for multi-user isolation:

1. Create one digital human, get its `appId` (one persona for all users).
2. Assign each end-user a business-side `conversationId` (e.g. `user-12345`).
3. Open one long-lived WebSocket; after auth, `subscribe` each active user's `conversationId`.
4. When a user sends a message, `POST .../chat/send` with that user's `conversationId` and `message`.
5. Receive the streaming process and final `agent:message` (`isComplete: true`) via WebSocket events, routed by `data.conversationId`.
6. Returning users reuse their `conversationId`; new users get new ones.

---

## Error handling

| Scenario | Symptom | Suggested handling |
|---|---|---|
| Missing/invalid token | HTTP `401`, `{ success:false, error:"..." }` | Check the `Authorization` header and `HALO_REMOTE_PASSWORD` |
| Login locked out | HTTP `429`, `code: "LOCKED"`, with `Retry-After` | Back off and retry; don't brute-force the token |
| Service not ready | HTTP `503` (App Manager/Runtime not initialized) | Retry shortly after cold start |
| App not found | `404` or `{ success:false }` | Verify the `appId` |
| Agent runtime error | WebSocket `agent:error` event, `data.error` | Show a graceful fallback; optionally log `errorCode` |
| Empty/interrupted response | `agent:error`, `errorType: "interrupted"` | Prompt the user to resend or continue |

::: tip Wrapping async into sync
If the business layer needs "one `ask(userId, question)` call that returns one answer", do this internally: connect WS → subscribe the user's conversation → `chat/send` → wait for that `conversationId`'s `agent:message(isComplete:true)` or `agent:complete` → return `content`, with a timeout and `agent:error` fallback. See [Examples](./examples.md) for code.
:::

---

## Next steps

- [Examples](./examples.md) — a full curl walkthrough, a WebSocket example, and backend pseudo-code that wraps the async API into a synchronous `ask()`.
- [Configuration](./configuration.md) — token, port, LLM gateway, and other environment variables.
- [Digital Humans docs](../digital-humans/overview) — full digital-human spec fields and persona design.
