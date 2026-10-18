---
title: "Call the Halo API: quickstart"
description: "Quickstart for the Halo API: turn on Remote Access, get the address and access password, make your first curl request, and stream the reply over WebSocket."
type: tutorial
audience: [developer]
---

# Quickstart: call the Halo API

This page takes you from turning on Remote Access to having Halo work in a new conversation through curl, with its reply streaming into your terminal.

## Before you start {#before-you-start}

- A computer with Halo installed and an AI model set up, or a running [Halo Server](/en/server/).
- A terminal with `curl`.
- Node.js 22 or later for the last steps (it ships a WebSocket client).

## 1. Turn on Remote Access {#enable-remote-access}

Halo desktop offers the API only while Remote Access is on:

1. Open **Settings › Remote Access** and turn on **Enable Remote Access**.
2. Copy the **Local Address**, such as `http://localhost:3456`. To call from another device, copy the **LAN Address** instead.
3. Copy the **Access Password**.

On Halo Server, skip this step: the address is `http://<HOST>:8080` by default, and the access password is the value of the `HALO_REMOTE_PASSWORD` environment variable.

::: danger The access password is an admin password
Whoever has the access password has full control of this Halo. Use it only in your own terminal and on your servers; never share it or commit it to a repository.
:::

## 2. Keep the address and password {#set-variables}

Store the address and password in shell variables; every following command uses them:

```bash
export HALO_URL='http://localhost:3456'
export HALO_TOKEN='<ACCESS_PASSWORD>'
```

Replace `<ACCESS_PASSWORD>` with the password you copied. Use single quotes: a generated password can contain `$`, `!` or `&`, which the shell would rewrite inside double quotes.

## 3. Check that the service is up {#check-status}

This endpoint needs no password:

```bash
curl -s "$HALO_URL/api/remote/status"
```

Output:

```json
{"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

Now list your workspaces with the password:

```bash
curl -s "$HALO_URL/api/spaces" -H "Authorization: Bearer $HALO_TOKEN"
```

Output (shortened):

```json
{"success":true,"data":[{"id":"<SPACE_ID>","name":"…","path":"…"}]}
```

Note the `id` of a workspace. To use the Halo Workspace, its id is always `halo-temp`. A `401` means the password is wrong; check step 2.

## 4. Create a conversation {#create-conversation}

```bash
curl -sX POST "$HALO_URL/api/spaces/<SPACE_ID>/conversations" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"From my script"}'
```

Replace `<SPACE_ID>` with the workspace id from step 3. Output (shortened):

```json
{"success":true,"data":{"id":"<CONVERSATION_ID>","title":"From my script"}}
```

Note the conversation's `id`. The conversation also shows up in Halo's conversation list.

## 5. Get ready to stream the reply {#watch}

Save the script below as `watch.mjs`. It signs in to the WebSocket with the access password, subscribes to the conversation and prints the reply as it is written:

```js
const conversationId = process.argv[2]
const ws = new WebSocket(process.env.HALO_URL.replace(/^http/, 'ws') + '/ws')

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
    console.log('Waiting for Halo…')
    return
  }
  if (msg.type !== 'event' || msg.data.conversationId !== conversationId) return
  if (msg.channel === 'agent:message' && typeof msg.data.delta === 'string') {
    process.stdout.write(msg.data.delta)
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

Run it in the same terminal and leave it waiting:

```bash
node watch.mjs <CONVERSATION_ID>
```

## 6. Give Halo some work {#send-message}

Open a second terminal, run the two `export` lines from step 2 again, then send a message:

```bash
curl -sX POST "$HALO_URL/api/agent/message" \
  -H "Authorization: Bearer $HALO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spaceId":"<SPACE_ID>","conversationId":"<CONVERSATION_ID>","message":"List the files in this workspace and summarize them in three sentences"}'
```

Output:

```json
{"success":true}
```

`success: true` means the work has started; the reply is written afterwards. Switch back to the first terminal and watch it appear.

::: done
When the first terminal prints Halo's reply and ends with `[done]`, you have had Halo finish a task through the API. Open the conversation in Halo and you see the same messages.
:::

## Without the WebSocket {#polling}

If you only need the final result, poll instead:

1. Call `GET /api/agent/generating/<CONVERSATION_ID>` every few seconds, doubling the interval each time (2 s, 4 s, …), until it returns `"data": false`.
2. Read the conversation with `GET /api/spaces/<SPACE_ID>/conversations/<CONVERSATION_ID>`. The last message whose `role` is `assistant` is the reply.

## Next steps {#next-steps}

- [HTTP API overview](/en/developers/api/): base URL, authentication, errors and every endpoint group
- [WebSocket events](/en/developers/api/websocket): every event channel and the rules for assembling a reply
- [API: Digital Humans](/en/developers/api/digital-human): have Digital Humans work for your users
