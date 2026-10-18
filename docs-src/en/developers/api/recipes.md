---
title: "Halo API recipes: Digital Humans and webhooks"
description: "Halo API recipes: chat with a Digital Human, one thread per user, answer its questions, exchange files, chain Digital Humans, start runs by webhook."
type: how-to
audience: [developer]
---

# API recipes

Each recipe here completes one task end to end, using only operations from this reference. Copy the commands, replace the `<PLACEHOLDERS>`, and adapt them to your language.

## Before you start {#before-you-start}

- Set `HALO_URL` and `HALO_TOKEN` as in the [quickstart](/en/developers/quickstart#set-variables), and keep its `watch.mjs` script at hand: it streams any conversation or thread.
- For Halo desktop, keep **Settings › Remote Access** on while you work: the API and webhooks are only served while it is.
- Most recipes need a Digital Human's `id` and `spaceId`. List them:

```bash
curl -s "$HALO_URL/api/apps" -H "Authorization: Bearer $HALO_TOKEN"
```

Output (shortened):

```json
{"success":true,"data":[{"id":"<APP_ID>","spaceId":"<SPACE_ID>","spec":{"name":"Order assistant"},"status":"active"}]}
```

::: warning The response can contain credentials
Each entry includes the Digital Human's configuration values as stored, including any keys entered there. Keep the output out of logs and tickets.
:::

## Ask a Digital Human and stream its answer {#ask-digital-human}

1. In one terminal, watch the Digital Human's main thread. Its key is `app-chat:<APP_ID>`:

   ```bash
   node watch.mjs 'app-chat:<APP_ID>'
   ```

2. In a second terminal, send the message:

   ```bash
   curl -sX POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
     -H "Authorization: Bearer $HALO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"spaceId":"<SPACE_ID>","message":"Which orders are still waiting for payment?"}'
   ```

   Output:

   ```json
   {"success":true,"data":{"conversationId":"app-chat:<APP_ID>"}}
   ```

The call returns as soon as the message is accepted. The reply streams into the first terminal and ends with `[done]`.

Without a WebSocket, poll [`GET /api/apps/:appId/chat/status`](/en/developers/api/digital-human#get-api-apps-appid-chat-status) until `isGenerating` is `false`, waiting 2 seconds and then twice as long each time, and read the last `assistant` message from [`GET /api/apps/:appId/chat/messages`](/en/developers/api/digital-human#get-api-apps-appid-chat-messages).

A message sent while the same thread is still answering doesn't start a second session: it joins the running turn after its current step, or is merged into the next one. Send one message at a time and wait for the reply, so each reply answers one message.

## Give each end user a thread {#thread-per-user}

When your own product forwards its users to a Digital Human, give every user a thread of their own, so their contexts never mix. Name the thread after your user's id:

```text
app-chat:<APP_ID>:http:direct:<USER_KEY>
```

`<USER_KEY>` may contain only letters, digits, `_` and `-`, up to 128 characters, for example `user-12345`. Pass the key as `conversationId` to `chat/send`, `chat/status`, `chat/messages`, and to `subscribe` on the WebSocket:

```bash
curl -sX POST "$HALO_URL/api/apps/<APP_ID>/chat/send" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<SPACE_ID>","conversationId":"app-chat:<APP_ID>:http:direct:user-12345","message":"Where is my order A1001?"}'
```

The same key continues the same conversation the next time the user comes back. Halo keeps up to 500 such threads per Digital Human in its thread list and drops threads idle for 30 days from it, unless someone renamed them in Halo.

Other key forms are refused with `400`, and a thread that belongs to an IM chat cannot be written to through the API. The [integration guide](/en/server/integration#threads) walks through the full pattern, with error handling.

## Answer a Digital Human's question {#answer-question}

During a run (a schedule, a webhook or a manual start), a Digital Human can stop and ask for a decision. The run waits until someone answers, in Halo or through the API.

1. **Notice the question.** Over the WebSocket, every connection receives `app:escalation:new` with `appId`, `entryId`, `question` and `choices`. Without a WebSocket, list recent questions:

   ```bash
   curl -s "$HALO_URL/api/apps/<APP_ID>/activity?type=escalation&limit=5" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   Output (shortened):

   ```json
   {"success":true,"data":[{"id":"<ENTRY_ID>","type":"escalation","content":{"summary":"Refund order A1001?","choices":["Refund","Keep the order"]}}]}
   ```

   A question is still open when its entry has no `userResponse`. When `content.questions` is present, the entry asks several things at once, each with its own `question` and `choices`.

2. **Answer it** with what the person decided:

   ```bash
   curl -sX POST "$HALO_URL/api/apps/<APP_ID>/escalation/<ENTRY_ID>/respond" \
     -H "Authorization: Bearer $HALO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"choice":"Refund","text":"The customer sent the item back"}'
   ```

- `choice` must be exactly one of the offered `choices`. For an answer in the person's own words, send `text` only.
- For an entry with `content.questions`, send `answers`: one `{"choice":…}` or `{"text":…}` per question, in order. Every question needs an answer.
- The first answer wins, whether it comes from Halo or the API, and it cannot be withdrawn. A question that was already answered or has expired returns `"success": false` with the reason.

::: danger Only send a person's real decision
The run continues with whatever you send. Never let a script pick an answer on someone's behalf.
:::

## Hand files to a workspace and read the results {#exchange-files}

A Digital Human works in its workspace folder. You can put text files there and read what it produces:

1. **Write an input file** at the root of the workspace (an existing file of that name is overwritten):

   ```bash
   curl -sX POST "$HALO_URL/api/spaces/<SPACE_ID>/artifacts/file" \
     -H "Authorization: Bearer $HALO_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"parentPath":"","name":"orders.csv","content":"id,amount\nA1001,120\nA1002,80\n"}'
   ```

2. **Ask the Digital Human** to work on it, as in [the first recipe](#ask-digital-human): "Summarize orders.csv into report.md".

3. **Find and read the result.** List the workspace, take the `path` of the file you want, and read it:

   ```bash
   curl -s "$HALO_URL/api/spaces/<SPACE_ID>/artifacts" -H "Authorization: Bearer $HALO_TOKEN"
   curl -s -G "$HALO_URL/api/artifacts/content" --data-urlencode "path=<FILE_PATH>" \
     -H "Authorization: Bearer $HALO_TOKEN"
   ```

   Text comes back in `data.content`. Images, PDFs and other binary files come back base64-encoded, with `"encoding":"base64"`. Files over 10 MB (text) or 50 MB (binary) are refused.

These operations write text only. To hand over a binary file, place it in the workspace folder on the computer running Halo. Paths outside an allowed workspace return `403`.

## Let one Digital Human ask another {#digital-human-to-digital-human}

Sometimes one Digital Human needs another's answer: a "weekly report" Digital Human that asks a "sales data" Digital Human for numbers.

**In the same workspace**, turn on **Conversation Collaboration** for the asking Digital Human (**Digital Humans** › select it › **Capabilities and settings** › **Model & Capabilities**). It can then read and message the other conversations of its workspace, Digital Humans included, and wait up to 5 minutes for a reply. No API call is needed: in its instructions, say whom to ask and when.

**Across workspaces, or when you want it to use the API**, turn on **Operate Halo** for the asking Digital Human in the same place, or declare `permissions: ["halo-api-ref"]` in its spec. Each of its sessions then gets `HALO_API_URL`, `HALO_API_TOKEN` and `HALO_SPACE_ID`, and the reference of the operations it may call. Add instructions like these to its system prompt:

```text
To get this week's sales figures, ask the "Sales data" Digital Human:
1. POST $HALO_API_URL/api/apps/<OTHER_APP_ID>/chat/send with header
   "Authorization: Bearer $HALO_API_TOKEN" and JSON body
   {"spaceId":"<OTHER_SPACE_ID>","conversationId":"app-chat:<OTHER_APP_ID>:http:direct:weekly-report","message":"<your question>"}
2. Poll GET $HALO_API_URL/api/apps/<OTHER_APP_ID>/chat/status?conversationId=<the same key>
   every few seconds until isGenerating is false.
3. Read the last assistant message from
   GET $HALO_API_URL/api/apps/<OTHER_APP_ID>/chat/messages?conversationId=<the same key>
Ask one question at a time.
```

- `HALO_API_TOKEN` is a token Halo issues per workspace, accepted only on this computer and only for the operations the assistant may use. It is not the access password.
- Both permissions are off by default, because they let a Digital Human act well beyond its own task. Turn them on only for Digital Humans you trust.

::: danger Never put the access password in a Digital Human
Do not store the access password in a Digital Human's configuration, instructions or files. Anyone who can read them gets full control of this Halo, and the password travels with every export of the Digital Human.
:::

## Start a Digital Human from another system (webhook) {#webhook}

A Digital Human can run whenever another system posts an event, such as a new order from your shop or a push from your code host.

1. **Declare the webhook** in the Digital Human's spec. Pick a lower-case path that no other Digital Human uses, and a random secret, for example from `openssl rand -hex 32`:

   ```yaml
   subscriptions:
     - source:
         type: webhook
         config:
           path: new-order
           secret: <WEBHOOK_SECRET>
   ```

   Add it when you create the Digital Human, or later with [`PATCH /api/apps/:appId/spec`](/en/developers/api/digital-human#patch-api-apps-appid-spec), sending the complete `subscriptions` list. Each event reaches the run as event data with `path`, `body` and `query`; refer to the body's fields in the system prompt, for example "the order id is in `body.orderId`".

2. **Send events** to `<HALO_URL>/hooks/<path>`. This path takes no access password: each request is signed instead. The signature is the hex HMAC-SHA256 of the raw body, keyed with the secret, sent as `X-Hub-Signature-256: sha256=<hex>`:

   ```bash
   BODY='{"orderId":"A1001","dedupKey":"order-A1001"}'
   SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')
   curl -sX POST "$HALO_URL/hooks/new-order" \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=$SIG" \
     --data-binary "$BODY"
   ```

   Output:

   ```json
   {"ok":true,"received":true}
   ```

   Halo also accepts the bare hex in `X-Signature-256` or `X-Webhook-Signature`. Sign the exact bytes you send: re-serialized JSON does not match.

| Response | Meaning |
|---|---|
| `200` `{"ok":true,"received":true}` | Accepted. The run starts in the background |
| `401` `Invalid webhook signature` | Missing or wrong signature |
| `413` | Body over 256 KB |
| `415` | Not `application/json` |
| `404` `Webhook ingress not available` | Halo's Digital Human runtime is not running yet, for example right after start-up |

- **Duplicates**: events with the same `dedupKey` within 60 seconds run once. Without a `dedupKey`, an identical body to the same path counts as the same event. Give every distinct event its own `dedupKey`.
- **A busy Digital Human** never runs twice at once. An event that arrives during a run is added to that run, or to the next one.
- **Reachability**: the caller must reach `HALO_URL`: the LAN address on the same network, or the **Internet Access** address from **Settings › Remote Access** from anywhere.

::: danger A webhook without a secret is open to anyone
Without `secret`, anyone who can reach the address can start the Digital Human with any content. Always set one. The secret is stored in the Digital Human's spec, so remove it before you export or publish the Digital Human.
:::

## Related {#related}

- [Quickstart](/en/developers/quickstart): variables, a first request and `watch.mjs`
- [WebSocket events](/en/developers/api/websocket): every event and the reply-assembly rules
- [API: Digital Humans](/en/developers/api/digital-human): every operation used above
- [Halo Server integration guide](/en/server/integration): Digital Humans as the AI back end of your product
