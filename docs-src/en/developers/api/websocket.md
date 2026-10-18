---
title: "WebSocket event protocol: follow Halo in real time"
description: "Halo WebSocket events: connect and authenticate, subscribe to conversations, who receives what, and every event channel, terminal stream included."
type: reference
audience: [developer]
---

# WebSocket events

Halo pushes progress over a WebSocket as it happens: the reply as it is written, thinking and tool calls, questions waiting for an answer, and changes to Digital Humans, teams, files and terminals. The HTTP API starts things; the WebSocket tells you what happened next. Halo's web app and Android app use the same protocol.

## Connect {#connect}

The WebSocket shares the address and port of the HTTP API, at the path `/ws`:

```text
ws://<HOST>:<PORT>/ws
```

Take the [HTTP API base URL](/en/developers/api/#base-url), replace `http` with `ws` (or `https` with `wss`) and append `/ws`. Behind a reverse proxy path prefix, keep the prefix: `wss://<HOST>/<PATH_PREFIX>/ws`. On the desktop, connections are accepted only while **Enable Remote Access** is on.

## Authenticate {#auth}

A new connection is not authenticated yet. Send the access password as the first message:

```json
{ "type": "auth", "payload": { "token": "<ACCESS_PASSWORD>" } }
```

On success you receive:

```json
{ "type": "auth:success" }
```

On failure you receive the message below, and the server closes the connection about 100 ms later:

```json
{ "type": "auth:failed", "error": "Invalid token" }
```

- The password travels in the message, not in a header. It is the same access password the HTTP requests use.
- Failed sign-ins share the [lockout rules](/en/developers/api/#lockout) with the HTTP login: repeated failures from one IP lock it out for a while, and every sign-in during the lockout fails.
- `subscribe` or terminal messages sent before authenticating get `{ "type": "error", "error": "Not authenticated" }`.
- After changing the access password, restart Halo so connections that are already open are closed.

## Message format {#messages}

Both sides send JSON text frames. Messages from the client look like `{ "type": "…", "payload": { … } }`:

| `type` | `payload` | Purpose |
|---|---|---|
| `auth` | `{ "token": "<ACCESS_PASSWORD>" }` | Authenticate; must be the first message |
| `subscribe` | `{ "conversationId": "…" }` | Receive every event of this conversation |
| `unsubscribe` | `{ "conversationId": "…" }` | Stop receiving this conversation's detailed events |
| `ping` | — | The server answers `{ "type": "pong" }` |
| `terminal-input` | `{ "sessionId": "…", "data": "…" }` | Send keystrokes to a terminal session; see [terminal streaming](#terminal) |
| `terminal-resize` | `{ "sessionId": "…", "cols": 120, "rows": 32 }` | Resize a terminal |
| `terminal-attach` | `{ "sessionId": "…" }` | Take part in a terminal's flow control as a viewer |
| `terminal-detach` | `{ "sessionId": "…" }` | Leave flow control |
| `terminal-ack` | `{ "sessionId": "…", "charCount": 4096 }` | Report how many characters you have rendered |

The server sends five kinds of message: `auth:success`, `auth:failed`, `error`, `pong` and `event`. Messages that are not valid JSON, and unknown types, are ignored.

Halo instances that share a team across computers use the same socket with team invite credentials and extra message types (`auth:challenge`, `federation`). A client signed in with the access password never receives those, and this page does not cover them.

## Who receives which events {#delivery}

Every authenticated connection receives three kinds of events:

1. **Conversations it subscribed to**: every event of the conversation, including the reply as it is written, thinking and tool calls.
2. **Status events of all conversations**: `agent:turn-start`, `agent:complete`, `agent:error`, `agent:ask-question` and `agent:goal-updated` reach every connection without subscribing, so a client can show what is running and what is waiting for an answer. Filter them by `data.conversationId`.
3. **Global events**: changes to Digital Humans, teams, files, terminals, notifications and more, sent to every connection.

Subscriptions belong to the connection. After reconnecting, send `auth` and every `subscribe` again.

Which `conversationId` to use:

- For a conversation with Halo's assistant: the conversation's id, the `conversationId` you passed to [`POST /api/agent/message`](/en/developers/api/conversation#post-api-agent-message).
- For a chat with a Digital Human: the thread key. The main thread is `app-chat:<appId>`; for any other thread use the `conversationId` returned by [`POST /api/apps/:appId/chat/send`](/en/developers/api/digital-human#post-api-apps-appid-chat-send).

## Event envelope {#envelope}

Every event the server pushes looks like this:

```json
{ "type": "event", "channel": "agent:message", "data": { } }
```

The `data` of a conversation event always carries `spaceId` and `conversationId`, so you can route it to the right conversation and user.

::: warning Events can be sensitive
Events carry file paths, tool inputs and outputs, whatever was printed in a terminal, and channel configuration. Handle them on a trusted server and do not forward them as they are to end users' browsers.
:::

## Conversation events {#conversation-events}

| Channel | When | Main fields in `data` |
|---|---|---|
| `agent:turn-start` | A turn starts | `type: "turn-start"` |
| `agent:message` | Reply text: a new text block, streamed chunks, the end of a block, the final reply of the turn | `delta`, `content`, `isStreaming`, `isNewTextBlock`, `isComplete`; see [assembling the reply](#assemble-reply) |
| `agent:thought` | A thinking or tool block starts, or an intermediate step completes | `thought`: `id`, `type` (`thinking`, `text`, `tool_use`, `tool_result`, `system`, `result`, `error`), `content`, `timestamp`, and optionally `toolName`, `toolInput`, `toolOutput`, `isError` |
| `agent:thought-delta` | A chunk of thinking, or a thinking block, tool input or tool result completes | `thoughtId`, plus `delta`, or `content` with `isComplete`, or `toolInput` or `toolResult` |
| `agent:tool-call` | A tool call's arguments are complete | `id`, `name`, `status: "running"`, `input` |
| `agent:tool-result` | A tool call returns | `toolId`, `result` (string), `isError` |
| `agent:ask-question` | The turn stops to ask the user something | `id`, `questions`: each has `question`, `header`, `options` (`label`, `description`) and `multiSelect` |
| `agent:complete` | The turn ends: finished, failed or stopped | `duration` (ms), optional `tokenUsage`: `inputTokens`, `outputTokens`, `cacheReadTokens`, `cacheCreationTokens`, `totalCostUsd`, `contextWindow` |
| `agent:error` | Something failed | `error`, optional `errorCode`; `errorType` is `interrupted` for an interruption, or `working_dir_unavailable` when the working folder is missing (with `workDirIssue`) |
| `agent:session-info` | The session initializes | `slashCommands`, `skills`, `agents` (string arrays) |
| `agent:compact` | The context is compacted | `trigger` (`manual` or `auto`), `preTokens` |
| `agent:goal-updated` | The conversation's goal is set or updated | `goal` (`objective`, `doneWhen`, `status` and more, or `null`), `source`, `seenByModel` |
| `agent:api-retry` | A model call is retried after an error, and again when retrying ends | `retry`: `attempt`, `maxRetries`, `delayMs`, `errorStatus`, `errorKind`; `null` when it ends |
| `agent:input-arrived` | User or IM input is recorded in the conversation | `messages`, `live` |
| `agent:input-stopped` | A stop voided input that was not handled yet | `messages` |
| `toolsets:changed` | A capability of the conversation is opened or closed | `toolsetId`, `action` (`open` or `close`), `openedBy`, `open` (the capabilities now open) |
| `toolsets:requested` | The AI asks the user to open a capability | `toolsetId`, `displayName` |

### Assembling the reply {#assemble-reply}

Build a turn's reply from `agent:message` events with these rules:

1. An event with `delta`: append `delta` to the current text.
2. An event without `delta`: replace the current text with `content`. An event with `isNewTextBlock: true` has an empty `content` and starts a new text block.
3. An event with `isComplete: true`: its `content` is the complete reply of the turn.
4. The `agent:complete` that follows ends the turn.

A typical sequence for one reply (`spaceId` and `conversationId` left out):

```json
{"type":"event","channel":"agent:message","data":{"type":"message","content":"","isComplete":false,"isStreaming":false,"isNewTextBlock":true}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":"This workspace holds","isComplete":false,"isStreaming":true}}
{"type":"event","channel":"agent:message","data":{"type":"message","delta":" 3 files…","isComplete":false,"isStreaming":true}}
{"type":"event","channel":"agent:message","data":{"type":"message","content":"This workspace holds 3 files…","isComplete":true}}
{"type":"event","channel":"agent:complete","data":{"type":"complete","duration":8421}}
```

If you only need the final answer, take the `content` of the event with `isComplete: true`. For a typewriter effect, update the display with rules 1 and 2 as events arrive.

## Global events {#global-events}

### Digital Humans {#digital-human-events}

| Channel | When | Main fields in `data` |
|---|---|---|
| `app:status_changed` | A Digital Human's run state changes | `appId`, `state` (`status`, `runningCount`, `nextRunAtMs`, `lastError` and more) |
| `app:list_changed` | A Digital Human is installed or uninstalled | `appId`, `change` (`installed` or `uninstalled`) |
| `app:deleted` | A Digital Human is deleted permanently | `appId` |
| `app:activity_entry:new` | An activity entry is added or updated | `appId`, `entry` (`id`, `runId`, `type`, `ts`, `content`) |
| `app:escalation:new` | A Digital Human asks a question during a run and waits for an answer | `appId`, `entryId`, `question`, `choices`; in a team also `teamId`, `epochId` |
| `app:escalation:resolved` | The question has been answered | `appId`, `entryId`, `response` (`choice`, `text`, `answers`) |
| `app:im-session-updated` | A chat thread of a Digital Human has a new message or changed | `appId`, `channel`, `chatId`, `chatType`, `instanceId`, `lastMessage` (first 50 characters) |

### Teams {#team-events}

| Channel | When | Main fields in `data` |
|---|---|---|
| `team:updated` | A team, its members or its run state changed | `teamId`, plus `team`, `changed`, `liveStatus`, `removed` and more |
| `team:blackboard` | A task, finding or activity is added to the board | `teamId`, `epochId`, `kind` (`task`, `finding`, `activity`) |
| `team:message` | Members exchanged a message (metadata only, no body) | `teamId`, `epochId`, `fromAppId`, `toAppId`, `messageId`, `ts` |
| `team:presence` | Computers of a team across computers come online or go offline | `teamId`, `nodes` |
| `team:office-status` | A team across computers paused, resumed, needs an update and similar | `teamId`, `kind` |
| `team:member-history` | A member's transcript grew; read it again | `teamId`, `appId`, `epochId` |

### Files, knowledge bases and system {#other-events}

| Channel | When | Main fields in `data` |
|---|---|---|
| `artifact:tree-update` | Folders in a workspace's file tree changed | `spaceId`, `updatedDirs` |
| `artifact:changed-batch` | A batch of files was created, changed or deleted | `spaceId`, `changes` (`type`, `path`, `relativePath`) |
| `tlon:ingest-progress` | Indexing progress of a knowledge base | `kbId`, `total`, `completed`, `phase`, `current`, `errors` |
| `tlon:stats-updated` | A knowledge base's statistics changed | `kbId`, `stats` |
| `task:state_changed` | The task panel's data changed; no payload, read it again | — |
| `notification:toast` | Halo shows a notification | `title`, `body`, `variant`, `duration`, and related ids such as `appId` or `teamId` |
| `agent:mcp-status` | The status of MCP servers changed | `servers` (`name`, `status`, `tools`, `error` and more), `timestamp` |
| `ai-sources:catalog-changed` | The model list of model sources changed | `sourceIds` |
| `credential:decrypt-failed` | Some credentials could not be decrypted and must be entered again | `failures` (`path`, `label`), never ciphertext |
| `im-channels:instance-updated` | A message channel's configuration was updated | `instanceId`, `instance` (the full channel configuration) |
| `app:memory-pressure` | The memory pressure level changed | `level` (`normal`, `low`, `critical`) |
| `ai-browser:active-view-changed` | The page the AI Browser shows changed | `conversationId`, `spaceId`, `viewId`, `url`, `title` |
| `ai-browser:view-gone` | An AI Browser page closed | `viewId` |
| `ai-browser:conversation-released` | A conversation released its AI Browser | `conversationId` |

## Terminal streaming {#terminal}

Terminal output reaches every connection as `terminal:data` events: `data` holds the `sessionId` and a chunk of raw terminal output, ANSI escape codes included. `terminal:lifecycle` reports a session being created, exiting, changing its title or being removed, with `sessionId`, `type` and `info`. The terminal is available on macOS and Windows only.

- **Input**: send `terminal-input`; `data` is raw keystrokes and `\r` is Enter. It does the same as [`POST /api/terminal/input`](/en/developers/api/terminal#post-api-terminal-input) without an HTTP request per keystroke.
- **Resize**: send `terminal-resize` with positive integers `cols` and `rows`.
- **Flow control**: after `terminal-attach`, the connection is a viewer of that session and must report what it has rendered with `terminal-ack`. When a viewer's unacknowledged backlog grows too large, the terminal pauses its output until the slowest viewer catches up. Do not send `terminal-attach` if you do not need flow control, and send `terminal-detach` when you are done. A closed connection detaches automatically.
- **Catch up**: read the output produced before you connected with [`POST /api/terminal/replay`](/en/developers/api/terminal#post-api-terminal-replay).

Terminal output can contain anything printed in the shell, secrets included.

## Keepalive and reconnecting {#keepalive}

- Every 15 seconds the server sends a WebSocket protocol ping and disconnects clients that do not answer with a pong. Common WebSocket clients answer automatically.
- At the application level you can send `{ "type": "ping" }`; the server answers `{ "type": "pong" }`.
- After a disconnect, reconnect with backoff (Halo's web app starts at 1 second and doubles up to 30 seconds), then authenticate and subscribe again.

## Complete example {#example}

This Node.js script (Node.js 22 or later ships a WebSocket client) authenticates, subscribes to one conversation and prints the reply as it arrives:

```js
const conversationId = process.argv[2]
const ws = new WebSocket(process.env.HALO_URL.replace(/^http/, 'ws') + '/ws')
let text = ''

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
    return
  }
  if (msg.type !== 'event' || msg.data.conversationId !== conversationId) return

  if (msg.channel === 'agent:message') {
    if (typeof msg.data.delta === 'string') {
      text += msg.data.delta
      process.stdout.write(msg.data.delta)
    } else {
      text = msg.data.content ?? ''
    }
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

Set `HALO_URL` and `HALO_TOKEN` as in the [quickstart](/en/developers/quickstart), then run `node watch.mjs <CONVERSATION_ID>`.

## Related {#related}

- [HTTP API overview](/en/developers/api/): base URL, authentication and error conventions
- [Quickstart](/en/developers/quickstart): from turning on Remote Access to your first streamed reply
- [API: Conversations](/en/developers/api/conversation): start and stop work
