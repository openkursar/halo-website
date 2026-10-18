---
title: "Halo Server integration guide: AI agent back end"
description: "Halo Server integration guide: use Digital Humans as your AI back end, give each user a chat thread, and get replies by WebSocket or polling."
type: how-to
audience: [developer]
---

# Halo Server integration guide

This page is for back-end engineers. It shows how to use Halo's Digital Humans as the AI back end of your system. The typical flow:

```text
End user asks → your back end → Halo (a Digital Human works on it) → reply
```

Your back end owns user identity, the entry point, the interface and the synchronous or streaming experience; Halo runs the Digital Human (persona, tools, skills and memory). The two talk over the HTTP API and the WebSocket. The same approach works with Halo desktop when Remote Access is on.

## Before you start {#before-you-start}

- A running [Halo Server](/en/server/), with its base URL and access password.
- The [HTTP API overview](/en/developers/api/), for authentication, the response envelope and error conventions.

## Basics {#basics}

### Base URL {#base-url}

Make the base URL a configuration value; never hard-code it:

- Direct: `http://<HOST>:8080`
- Behind a reverse proxy path prefix: `https://<HOST>/<PATH_PREFIX>`

Every HTTP endpoint and the WebSocket live under the base URL: sending a message is `<BASE_URL>/api/apps/<APP_ID>/chat/send`, and the WebSocket is `<BASE_URL>` with `http` replaced by `ws`, plus `/ws`.

The commands below use the shell variables `$HALO_URL` for the base URL and `$HALO_TOKEN` for the access password; the [quickstart](/en/developers/quickstart#set-variables) shows how to set them.

### Authentication {#auth}

Every `/api/` request carries the access password:

```http
Authorization: Bearer <YOUR_ACCESS_PASSWORD>
```

There is no "log in for a session token" flow: `POST /api/remote/login` only checks a password, and the credential is always the access password itself.

::: danger Keep the access password in your back end
The access password grants full control of this Halo. Use it only inside your back-end services; never send it to browsers or mobile apps, and never commit it to a repository.
:::

### Response envelope {#envelope}

Endpoints answer `{ "success": true, "data": … }` or `{ "success": false, "error": "…" }`. Check `success` before reading `data`: many failures also come back with HTTP 200.

## 1. Prepare a Digital Human {#digital-human}

A Digital Human has a fixed persona (`system_prompt`), tools and skills, memory and permissions, and can serve all your end users at once.

- **Recommended**: [create the Digital Human](/en/digital-humans/create) in Halo and fine-tune it there, then call it from your system.
- **Install through the API**: call [`POST /api/apps/install`](/en/developers/api/digital-human#post-api-apps-install) with a full spec.

A minimal Digital Human spec:

```json
{
  "spaceId": "<SPACE_ID>",
  "spec": {
    "type": "automation",
    "name": "Support assistant",
    "version": "1.0.0",
    "author": "example",
    "description": "Answers questions about orders, shipping and returns for an online shop.",
    "system_prompt": "You are the support assistant of an online shop. Answer questions about orders, shipping and returns politely, briefly and accurately. When unsure, ask for the order number."
  }
}
```

Response:

```json
{ "success": true, "data": { "appId": "<APP_ID>" } }
```

Every later call needs the Digital Human's `appId` and the `spaceId` of its workspace. For existing Digital Humans, use [`GET /api/apps`](/en/developers/api/digital-human#get-api-apps); an entry's `id` is the `appId`.

## 2. Give each end user a chat thread {#threads}

One Digital Human serves all your end users. Each user gets a chat thread of their own, so their contexts never mix. The thread is chosen with `conversationId`, which accepts these forms:

| `conversationId` | Use |
|---|---|
| Left out, or `app-chat:<APP_ID>` | The main thread. Everyone shares one context, so use it only for a single user or a demo |
| `app-chat:<APP_ID>:http:direct:<USER_KEY>` | A thread you name. `<USER_KEY>` may contain only letters, digits, `_` and `-`, 1–128 characters |
| The `conversationId` returned by [`POST /api/apps/:appId/sessions/create`](/en/developers/api/digital-human#post-api-apps-appid-sessions-create) | A new thread created by Halo |

The second form is the one to use: user 12345's thread is `app-chat:<APP_ID>:http:direct:user-12345`. When the user comes back, keep using the same key and the context continues; a new user gets a new key.

::: warning Other forms are refused
A bare custom string such as `user-12345` returns `400`, with the accepted forms in the error message. A thread bound to an IM chat cannot be written to through the API either: the API never speaks for a person in a real chat.
:::

## 3. Send a message {#send}

```bash
curl -sX POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<SPACE_ID>","conversationId":"app-chat:<APP_ID>:http:direct:user-12345","message":"Where is my order A1001?"}'
```

| Field | Required | Description |
|---|---|---|
| `spaceId` | Yes | The Digital Human's workspace: its `spaceId` in `GET /api/apps` |
| `message` | Yes | The user's message |
| `conversationId` | No | The chat thread, see [step 2](#threads); the main thread when left out |
| `images` | No | Image attachments (base64). The whole JSON body must stay under 100 KB |
| `reasoningEffort` | No | How hard the model thinks: `off`, `minimal`, `low`, `medium`, `high`, `xhigh` or `max` |

Response:

```json
{ "success": true, "data": { "conversationId": "app-chat:<APP_ID>:http:direct:user-12345" } }
```

`data.conversationId` is the thread the message went to. The call returns before the Digital Human has read the message; the reply is written afterwards, and you fetch it as described in the next step. A message sent while the same thread is still answering doesn't start a second session: it joins the running turn after its current step, or is merged into the next one. Send one message at a time per thread and wait for the reply, so each reply answers one message.

## 4. Get the reply {#reply}

### Option A: WebSocket (recommended) {#websocket}

The WebSocket delivers the reply as it is written, together with the work behind it, which suits production and streaming interfaces:

1. Connect to the `ws(s)://…/ws` address of your `<BASE_URL>`, send `{ "type": "auth", "payload": { "token": "<YOUR_ACCESS_PASSWORD>" } }` and wait for `auth:success`.
2. Subscribe to the thread before sending the message: `{ "type": "subscribe", "payload": { "conversationId": "app-chat:<APP_ID>:http:direct:user-12345" } }`. One connection can subscribe to many threads.
3. Handle events: assemble the reply from `agent:message` (rules in [assembling the reply](/en/developers/api/websocket#assemble-reply)); the event with `isComplete: true` holds the complete answer; `agent:complete` ends the turn; `agent:error` reports a failure.
4. Route events to users by `data.conversationId`. Status events of every conversation, such as `agent:complete`, reach every connection, so ignore the threads that are not yours.
5. After a disconnect, authenticate and subscribe to every thread again.

The full protocol is in [WebSocket events](/en/developers/api/websocket).

### Option B: polling {#polling}

If you only need the final answer, poll two endpoints, passing the same `conversationId` to both:

1. Check whether the reply is done:

   ```bash
   curl -s "$HALO_URL/api/apps/<APP_ID>/chat/status?conversationId=app-chat:<APP_ID>:http:direct:user-12345" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   It returns `{"success":true,"data":{"isGenerating":false,"conversationId":"…"}}`. Double the interval each time (2 s, 4 s, …) until `isGenerating` is `false`.

2. Read the transcript:

   ```bash
   curl -s "$HALO_URL/api/apps/<APP_ID>/chat/messages?conversationId=app-chat:<APP_ID>:http:direct:user-12345" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   In the returned list, the `content` of the last message whose `role` is `assistant` is the reply.

Without `conversationId`, `chat/status` reports whether any thread of the Digital Human is generating, and `chat/messages` reads the main thread.

### Comparing the two {#compare}

| | WebSocket | Polling |
|---|---|---|
| A thread per user | Yes | Yes (pass `conversationId`) |
| Text as it is written, and the work behind it | Yes | No, only the final result |
| Latency | Pushed in real time | Depends on the polling interval |
| Implementation | Long-lived connection, authentication, reconnecting and resubscribing | A simple request loop |

## Thread lifecycle {#lifecycle}

- **Continue**: calling `chat/send` again with the same `conversationId` continues the context.
- **Stop a reply**: [`POST /api/apps/:appId/chat/stop`](/en/developers/api/digital-human#post-api-apps-appid-chat-stop) with `{"conversationId":"…"}` stops one thread; `{"all":true}` stops every thread of the Digital Human.
- **Clear the history**: [`POST /api/apps/:appId/chat/clear`](/en/developers/api/digital-human#post-api-apps-appid-chat-clear) with `{"spaceId":"<SPACE_ID>","conversationId":"…"}` clears one thread; without `conversationId` it clears the main thread.
- **Delete a thread**: [`POST /api/apps/:appId/sessions/delete`](/en/developers/api/digital-human#post-api-apps-appid-sessions-delete) with `{"spaceId":"<SPACE_ID>","conversationId":"…"}`. This cannot be undone.

## Error handling {#errors}

| Situation | What you see | What to do |
|---|---|---|
| Access password missing or wrong | HTTP `401`, `"No authorization token"` or `"Invalid token"` | Check the `Authorization` header and the server's `HALO_REMOTE_PASSWORD` |
| Sign-in or WebSocket authentication locked | HTTP `429`, `"code": "LOCKED"`, with `Retry-After` | Back off for `Retry-After`, and find who is using a wrong password |
| The service is still starting | HTTP `503` | Wait a moment after a cold start and retry |
| Malformed `conversationId` | HTTP `400`, the message lists the accepted forms | Build it as in [step 2](#threads) |
| The Digital Human does not exist | HTTP `404` or `"success": false` | Check the `appId` |
| Request body too large | HTTP `413` | Shrink images; the whole JSON body must stay under 100 KB |
| Processing fails | WebSocket `agent:error` with `data.error`; `errorType` `interrupted` means it was interrupted | Show the user a fallback message, and log `errorCode` for troubleshooting |

::: tip Wrapping the asynchronous API as a synchronous call
For "one call, one answer" semantics: connect the WebSocket, subscribe to the user's thread, call `chat/send`, wait for that thread's `agent:message` with `isComplete: true` or an `agent:error`, then return the result, with a timeout. Full code is in [Halo Server integration examples](/en/server/examples).
:::

## Next steps {#next-steps}

- [Halo Server integration examples](/en/server/examples): a complete curl walkthrough, a WebSocket event stream and Java wrapper code
- [WebSocket events](/en/developers/api/websocket): every event channel
- [API: Digital Humans](/en/developers/api/digital-human): every endpoint for chatting with Digital Humans
