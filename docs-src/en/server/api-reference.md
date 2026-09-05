---
title: "HTTP API Reference"
description: "Complete reference for the Halo Server Remote Access HTTP API: auth, digital-human (App) lifecycle and chat, generic agent and conversations, config and health. Every endpoint verified against source, with curl examples."
---
# HTTP API Reference

This page is the complete reference for the **Remote Access HTTP API** exposed by **Halo Server** (the headless server edition). Third-party business systems (for example a Java backend powering a customer-service "digital employee") integrate Halo as an AI agent backend through this API.

> **Transport model (important):** this API is **asynchronous and event-driven** by design.
> There is **no** synchronous "ask → get answer" endpoint. When you send a message to an agent / digital human, the endpoint returns an **acknowledgement (ack)** immediately; the AI's thoughts and final result are delivered over **WebSocket events**, or fetched by polling the status endpoints. See [WebSocket Event Protocol](./websocket.md).

All paths are relative to the deployment root. If the service is mounted under a reverse-proxy path prefix (e.g. `/fc-xxxx/`), prepend that prefix to every path below — e.g. `https://host/fc-xxxx/api/apps`.

---

## Authentication

### What the credential is

The caller credential is Halo's remote-access **service token** (the "remote access password"). It is carried as a standard Bearer token on every API request:

```
Authorization: Bearer <token>
```

The token is held by the server (stored in config `remoteAccess.password`). It is either a 12-character strong random string generated when remote access is first enabled, or a custom password set by the user. In a Server (headless) deployment, it is conventionally supplied via the `HALO_REMOTE_PASSWORD` environment variable (see [Configuration](./configuration.md)).

> The Bearer token works **without** calling the login endpoint first. The login endpoint (`/api/remote/login`) exists only for the browser UI login flow. Machine-to-machine integrations simply send `Authorization: Bearer <token>` on every request.

Auth is enforced by the `/api/*` middleware. The following paths are public (no token required):

- `POST /api/remote/login`
- `GET  /api/remote/status`
- `GET  /api/security/policy`

Every other `/api/*` endpoint returns `401` without a valid token.

---

### POST /api/remote/login

Validate an access token. **Used only by the browser UI login flow**; machine integrations can skip this and use the Bearer header directly.

| Field   | Type   | Required | Description         |
| ------- | ------ | -------- | ------------------- |
| `token` | string | yes      | The service token   |

**Response**

- `200` → `{ "success": true }`
- `401` → `{ "success": false, "error": "Invalid token" }`
- `429` → `{ "success": false, "error": "Too many failed attempts. Try again later.", "code": "LOCKED" }`, with a `Retry-After` header (seconds)

The login endpoint applies per-source-IP rate limiting and lockout: repeated failures trigger a temporary lock during which `429` is returned.

```bash
curl -X POST https://host/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<token>"}'
```

---

### GET /api/remote/status

Public health probe, no auth required.

**Response**

```json
{
  "success": true,
  "data": { "active": true, "clients": 0, "version": "1.0.0" }
}
```

- `clients`: current number of WebSocket connections.
- `version`: the remote-access protocol version (fixed `1.0.0`; this is NOT the app version — see `GET /api/system/version`).

```bash
curl https://host/api/remote/status
```

---

## Digital-human (App) lifecycle and chat

A "digital human" is internally an **App** (automation app / agent). This is the **commercial core**: each digital human has its own persona (system prompt), config, memory, and conversations.

### Common response convention

Unless noted otherwise, endpoints return `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }`.

App services initialize lazily. Early in process startup, if the App Manager / Runtime is not yet ready, the relevant endpoints return `503`:

```json
{ "success": false, "error": "App Manager is not yet initialized. Please try again shortly." }
```

---

### GET /api/apps

List all installed Apps.

**Query parameters**

| Param     | Type   | Required | Description                                                       |
| --------- | ------ | -------- | ----------------------------------------------------------------- |
| `spaceId` | string | no       | Filter by space                                                   |
| `status`  | string | no       | Filter by status (e.g. `active`, `paused`). When omitted, `uninstalled` apps are excluded |

**Response**: `data` is an array of App objects.

```bash
curl https://host/api/apps \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/apps/install

Install an App (digital human / automation app).

| Field        | Type           | Required | Description                                                  |
| ------------ | -------------- | -------- | ----------------------------------------------------------- |
| `spec`       | object         | yes      | App spec object (`AppSpec`)                                  |
| `spaceId`    | string \| null | no       | Target space. `null` = global install (MCP/Skill available across spaces) |
| `userConfig` | object         | no       | User config (matching the spec's `config_schema`)           |

**Response**: on success `{ "success": true, "data": { "appId": "..." } }`.

**Status codes**

- `400`: missing `spec` or invalid `spaceId` type
- `403`: remote install of MCP-command apps is blocked (`code: "MCP_COMMAND_BLOCKED"`)
- `409`: already installed (`code: "ALREADY_INSTALLED"`)
- `503`: not initialized (`code: "NOT_INITIALIZED"`)

> HTTP install semantics: only automation-type Apps are activated after install (`activateNonAutomation: false`).

```bash
curl -X POST https://host/api/apps/install \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","spec":{ /* AppSpec */ },"userConfig":{}}'
```

---

### GET /api/apps/:appId

Get a single App.

```bash
curl https://host/api/apps/<appId> \
  -H "Authorization: Bearer <token>"
```

---

### DELETE /api/apps/:appId

Uninstall (soft-delete) an App. Deactivates it in the Runtime first, then marks it uninstalled.

**Query parameters**

| Param   | Type   | Required | Description                |
| ------- | ------ | -------- | -------------------------- |
| `purge` | string | no       | `true` to also purge data  |

```bash
curl -X DELETE "https://host/api/apps/<appId>?purge=true" \
  -H "Authorization: Bearer <token>"
```

---

### POST /api/apps/:appId/config

Update an App's user config (matching the spec's `config_schema`). The request body is the config object (full replacement).

```bash
curl -X POST https://host/api/apps/<appId>/config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"someKey":"someValue"}'
```

---

### POST /api/apps/:appId/trigger

Manually trigger one run (for automation-type Apps). **Async**: returns a trigger result summary in `data` (including `outcome`); the actual execution surfaces via Activity / WebSocket.

```bash
curl -X POST https://host/api/apps/<appId>/trigger \
  -H "Authorization: Bearer <token>"
```

---

### App chat (core)

Digital-human chat is the core interaction for commercial integration. Chat is **asynchronous and streaming**: `chat/send` returns an ack immediately, the AI's thoughts and reply are pushed over WebSocket (subscribe to the matching `conversationId`), and messages are persisted for replay.

Each digital human has a **default conversation** whose `conversationId` is `app-chat:{appId}`.

#### POST /api/apps/:appId/chat/send

Send a message to a digital human's AI agent. **Async**: returns immediately, generation runs in the background, results stream over WebSocket.

The request body is spread through to the underlying layer (`{ ...req.body, appId }`), so the following fields are supported:

| Field             | Type    | Required | Description                                                                          |
| ----------------- | ------- | -------- | ------------------------------------------------------------------------------------ |
| `spaceId`         | string  | yes      | The space the App lives in (required by the underlying executor)                     |
| `message`         | string  | yes      | User message text                                                                    |
| `images`          | array   | no       | Multimodal image attachments                                                         |
| `thinkingEnabled` | boolean | no       | Enable extended thinking                                                             |
| `conversationId`  | string  | no       | Custom conversation ID for an **isolated, per-end-user conversation under the same digital-human persona** (see note below) |

**Response**

```json
{ "success": true, "data": { "conversationId": "app-chat:<appId>" } }
```

> **About `conversationId` isolation (important detail):**
> The underlying `sendAppChatMessage` uses `request.conversationId ?? "app-chat:{appId}"` as the conversation/session-isolation key. So you **can** pass a distinct `conversationId` per end-user (e.g. `app-chat:<appId>:user-123`) to get isolated conversation context and history under the **same digital-human persona**.
> **Note:** this endpoint's response body **always** echoes the default `app-chat:{appId}`, and does **not** echo your custom value. To subscribe to WebSocket events for a custom conversation, use the `conversationId` you passed in — not the one returned in the response.

```bash
curl -X POST https://host/api/apps/<appId>/chat/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","message":"Hello","conversationId":"app-chat:<appId>:user-123"}'
```

#### GET /api/apps/:appId/chat/status

Get the digital human's current chat status.

**Response**

```json
{ "success": true, "data": { "isGenerating": false, "conversationId": "app-chat:<appId>" } }
```

> `conversationId` is always the default value; `isGenerating` reflects whether **any** session of this digital human (including custom and IM sessions) is currently generating.

```bash
curl https://host/api/apps/<appId>/chat/status \
  -H "Authorization: Bearer <token>"
```

#### POST /api/apps/:appId/chat/stop

Stop all active chat generations for this digital human (default + custom/IM sessions). Returns `{ "success": true }`.

```bash
curl -X POST https://host/api/apps/<appId>/chat/stop \
  -H "Authorization: Bearer <token>"
```

#### GET /api/apps/:appId/chat/messages

Load the persisted message history of the digital human's default conversation.

| Behavior      | Description                                          |
| ------------- | --------------------------------------------------- |
| App not found | `404`                                               |
| No space path | returns `{ "success": true, "data": [] }`           |

> Only the **default conversation** (`app-chat:{appId}`, storage runId `chat`) messages are returned. History of custom `conversationId`s is not included here.

```bash
curl https://host/api/apps/<appId>/chat/messages \
  -H "Authorization: Bearer <token>"
```

#### POST /api/apps/:appId/chat/clear

Clear the digital human's default conversation history and reset to a fresh session.

| Field     | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| `spaceId` | string | yes      | Used to resolve the storage path (body) |

```bash
curl -X POST https://host/api/apps/<appId>/chat/clear \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>"}'
```

#### POST /api/apps/:appId/chat/restart

Restart all chat sessions for this digital human — closes the underlying subprocesses so the next message reloads the system prompt and config. **Conversation history is preserved** (restored via the saved sessionId).

**Response**: `{ "success": true, "data": { "sessionsClosed": <number> } }`

```bash
curl -X POST https://host/api/apps/<appId>/chat/restart \
  -H "Authorization: Bearer <token>"
```

#### GET /api/apps/:appId/chat/session-state

Get the default conversation's session state (for recovery after refresh).

**Response**

```json
{ "success": true, "data": { "isActive": false, "thoughts": [], "spaceId": "<spaceId>" } }
```

---

### App state and activity (automation runs)

#### GET /api/apps/:appId/state

Get the real-time automation App state (`AutomationAppState`).

```bash
curl https://host/api/apps/<appId>/state \
  -H "Authorization: Bearer <token>"
```

#### GET /api/apps/:appId/activity

Get the App's activity entries.

| Param    | Type   | Required | Description                  |
| -------- | ------ | -------- | ---------------------------- |
| `limit`  | number | no       | Max number of entries        |
| `before` | number | no       | Timestamp cursor (before this) |

```bash
curl "https://host/api/apps/<appId>/activity?limit=50" \
  -H "Authorization: Bearer <token>"
```

#### POST /api/apps/:appId/escalation/:entryId/respond

Respond to an escalation request.

| Field    | Type   | Required | Description       |
| -------- | ------ | -------- | ----------------- |
| `choice` | string | no       | Option identifier |
| `text`   | string | no       | Free-text reply   |

```bash
curl -X POST https://host/api/apps/<appId>/escalation/<entryId>/respond \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"choice":"approve"}'
```

---

### Other App management endpoints

The following endpoints also exist (all require Bearer auth) for fuller lifecycle management:

| Method + Path                                        | Purpose                                       |
| ---------------------------------------------------- | --------------------------------------------- |
| `POST /api/apps/:appId/reinstall`                    | Reinstall a previously uninstalled App        |
| `DELETE /api/apps/:appId/permanent`                  | Permanently delete an App and all its data (built-in apps protected) |
| `POST /api/apps/:appId/move-space`                   | Move an App to a different space (or global)  |
| `POST /api/apps/:appId/clear-memory`                 | Delete all memory files for an App            |
| `POST /api/apps/:appId/pause`                        | Pause an App                                  |
| `POST /api/apps/:appId/resume`                       | Resume an App                                 |
| `POST /api/apps/:appId/frequency`                    | Update subscription frequency (`subscriptionId`, `frequency`) |
| `PATCH /api/apps/:appId/spec`                        | Update spec (JSON Merge Patch)                |
| `PATCH /api/apps/:appId/overrides`                   | Update user overrides (JSON Merge Patch, `null` deletes a key) |
| `POST /api/apps/:appId/permissions/grant`            | Grant a permission                            |
| `POST /api/apps/:appId/permissions/revoke`           | Revoke a permission                           |
| `POST /api/apps/:appId/upgrade-strategy`             | Set upgrade strategy (`auto`/`notify`/`manual`) |
| `GET  /api/apps/:appId/export-spec`                  | Export spec as YAML                           |
| `POST /api/apps/import-spec`                          | Install from YAML                             |
| `POST /api/apps/:appId/runs/:runId/continue`         | Continue a run that failed on premature stop  |
| `POST /api/apps/:appId/runs/:runId/inject`           | Inject user text into an active run (`text`)  |
| `GET  /api/apps/:appId/runs/:runId/session`          | Read a run's session messages ("View process")|
| `GET  /api/apps/:appId/chat/session-state`           | Default conversation session state            |
| `GET  /api/apps/:appId/im-chat/messages`             | Read IM channel session messages              |
| `POST /api/apps/:appId/im-chat/clear`                | Clear an IM session                           |

---

## Generic agent and conversations

Besides "digital humans", Halo Server also exposes a **generic agent** interface that drives a conversation directly within a space. It is likewise **asynchronous and streaming**: after sending a message, subscribe to the conversation's WebSocket events.

### POST /api/agent/message

Send a message to the generic agent. **Async**: returns `{ "success": true }` as an ack; the AI output streams over WebSocket to that `conversationId`.

| Field             | Type    | Required | Description                       |
| ----------------- | ------- | -------- | --------------------------------- |
| `spaceId`         | string  | yes      | Space ID                          |
| `conversationId`  | string  | yes      | Conversation ID (use the same one to subscribe to WS events) |
| `message`         | string  | yes      | User message                      |
| `resumeSessionId` | string  | no       | Resume a specific SDK session     |
| `images`          | array   | no       | Multimodal images                 |
| `thinkingEnabled` | boolean | no       | Extended thinking                 |
| `aiBrowserEnabled`| boolean | no       | Enable AI Browser tools           |

```bash
curl -X POST https://host/api/agent/message \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<spaceId>","conversationId":"<convId>","message":"Hello"}'
```

### POST /api/agent/stop

Stop generation for a conversation (or all).

| Field            | Type   | Required | Description     |
| ---------------- | ------ | -------- | --------------- |
| `conversationId` | string | no       | Conversation ID |

### POST /api/agent/approve · POST /api/agent/reject

Approve / reject a tool call.

| Field            | Type   | Required | Description     |
| ---------------- | ------ | -------- | --------------- |
| `conversationId` | string | yes      | Conversation ID |

> In the current implementation, permissions are **auto-allowed by default**, so these two endpoints are no-ops and always return `{ "success": true }`.

### POST /api/agent/answer-question

Answer an `AskUserQuestion` raised by the agent.

| Field            | Type   | Required | Description                       |
| ---------------- | ------ | -------- | --------------------------------- |
| `conversationId` | string | yes      | Conversation ID                   |
| `id`             | string | yes      | Question ID                       |
| `answers`        | object | yes      | Answer map (field → value)        |

If no pending question matches that `id`, returns `{ "success": false, "error": "No pending question found for id: ..." }`.

### GET /api/agent/session/:conversationId

Get conversation state (for recovery after refresh). Returns `{ "success": true, "data": <SessionState> }`.

### GET /api/agent/generating/:conversationId

Check whether a conversation is currently generating. Returns `{ "success": true, "data": <boolean> }`.

```bash
curl https://host/api/agent/generating/<convId> \
  -H "Authorization: Bearer <token>"
```

### GET /api/agent/sessions

List the conversationIds of all active sessions. Returns `{ "success": true, "data": ["<convId>", ...] }`.

### Other agent endpoints

| Method + Path                          | Purpose                       |
| -------------------------------------- | ----------------------------- |
| `POST /api/agent/test-mcp`             | Test MCP server connections   |
| `GET  /api/agent/engine-capabilities`  | Query current engine capabilities |

---

### Spaces and conversation storage

A conversation's **persisted record** is managed via space-scoped endpoints. These are **synchronous** read/write endpoints (they operate on storage directly and do not trigger AI generation).

| Method + Path                                                           | Purpose                    |
| ----------------------------------------------------------------------- | -------------------------- |
| `GET  /api/spaces`                                                       | List all spaces            |
| `POST /api/spaces`                                                       | Create a space (`name`/`icon`/`customPath`) |
| `GET  /api/spaces/:spaceId`                                              | Get a space                |
| `PUT  /api/spaces/:spaceId`                                              | Update a space             |
| `DELETE /api/spaces/:spaceId`                                            | Delete a space             |
| `GET  /api/spaces/default-path`                                          | Get the default spaces dir |
| `GET  /api/spaces/halo`                                                  | Get the Halo temp space    |
| `GET  /api/spaces/:spaceId/conversations`                               | List conversations         |
| `POST /api/spaces/:spaceId/conversations`                               | Create a conversation (`title`) |
| `GET  /api/spaces/:spaceId/conversations/:conversationId`               | Get a conversation         |
| `PUT  /api/spaces/:spaceId/conversations/:conversationId`               | Update a conversation      |
| `DELETE /api/spaces/:spaceId/conversations/:conversationId`             | Delete a conversation      |
| `POST /api/spaces/:spaceId/conversations/:conversationId/messages`      | Append a message           |
| `PUT  /api/spaces/:spaceId/conversations/:conversationId/messages/last` | Update the last message    |
| `GET  /api/spaces/:spaceId/conversations/:conversationId/messages/:messageId/thoughts` | Get a message's thoughts |
| `POST /api/spaces/:spaceId/conversations/:conversationId/star`          | Toggle star (`starred`)    |

```bash
# Create a conversation
curl -X POST https://host/api/spaces/<spaceId>/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"New conversation"}'
```

> **Integration tip:** `POST /api/agent/message` only drives AI generation and streams over WebSocket; it does **not** create a conversation record for you. The typical flow is: `POST .../conversations` to create a conversation and obtain a `conversationId`, subscribe over WebSocket, then `POST /api/agent/message` to send the message.

---

## Config and health

### GET /api/config

Get the service config. Returns `{ "success": true, "data": <Config> }`.

```bash
curl https://host/api/config \
  -H "Authorization: Bearer <token>"
```

### POST /api/config

Write the service config (the request body is the config object).

> Remote calls are policy-gated: changes touching MCP commands or the browser allowlist may be rejected (`403`, `code: "MCP_COMMAND_BLOCKED"` etc.).

### Other config endpoints

| Method + Path                          | Purpose                       |
| -------------------------------------- | ----------------------------- |
| `POST /api/config/validate`            | Validate API credentials (`apiKey`/`apiUrl`/`provider`/`model`) |
| `POST /api/config/fetch-models`        | Fetch available model list (`apiKey`/`apiUrl`) |
| `POST /api/config/refresh-ai-sources`  | Refresh all AI source configs |
| `GET  /api/security/policy`            | Public security-policy slice (no auth) |

### GET /api/system/version

Get the app version.

**Response**

```json
{ "success": true, "data": "x.y.z" }
```

```bash
curl https://host/api/system/version \
  -H "Authorization: Bearer <token>"
```

### Other system endpoints

| Method + Path                  | Purpose                            |
| ------------------------------ | ---------------------------------- |
| `GET  /api/auth/providers`     | List enabled auth providers (read-only) |
| `POST /api/analytics/report`   | Report a telemetry event (`event`/`properties`, fire-and-forget) |

---

## Errors and status-code convention

- Business failures typically return HTTP `200` with `{ "success": false, "error": "..." }` (many handlers `res.json` directly in their catch block without changing the status code).
- Auth failure: `401`.
- Rate-limit lockout: `429` (with `Retry-After`).
- Service not ready: `503`.
- Install-related semantic statuses: `400` (params), `403` (MCP blocked), `409` (already installed), `422` (validation failed), `404` (not found).

When integrating, **always check both the HTTP status code and the `success` field** in the response body.

---

## Related pages

- [WebSocket Event Protocol](./websocket.md) — how to receive the AI's streamed thoughts and results.
- [Configuration](./configuration.md) — environment variables (including the service token).
