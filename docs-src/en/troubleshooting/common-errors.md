---
title: "Common errors: what Halo error messages mean"
description: "Look up the exact message you see in Halo: interrupted replies, model errors and rate limits, context limits, images, Windows, Digital Humans, bots and teams."
type: reference
audience: [all]
related: [troubleshooting/api-errors, troubleshooting/install, troubleshooting/channels, troubleshooting/digital-humans]
---

# Error messages

Search this page for the message you see with <kbd>⌘</kbd> <kbd>F</kbd> / <kbd>Ctrl</kbd> <kbd>F</kbd>. If it isn't here, copy the exact text to Halo and ask about it.

## In a conversation {#conversation}

| Message | Meaning | What to do |
|---|---|---|
| "Model response interrupted" | The reply didn't finish normally | Click **Continue** and Halo carries on |
| "Model response interrupted" with "Reached the maximum turn limit. Send a message to continue." | One message used up its step limit | Send a message to continue; if it happens a lot, raise **Settings › Advanced › Max Turns per Message** |
| "Something went wrong" | This turn failed | The red box says why. For the full error, find the failed step in the thought process above the reply: click **Copy** (tooltip "Copy error message") and send it to Halo or support; for a long error, click **Expand full error** to read it all |
| "Approaching context limit", "Context will be automatically compressed soon" | The conversation is nearing what the model can hold | Nothing to do; Halo compresses it automatically. If you've moved on to a new topic, start a new conversation |
| "Context has been intelligently compressed" | Earlier content was condensed into a summary | Normal. Repeat any important requirement if needed |
| "OAuth token expired or invalid. Please login again." | Your account sign-in expired | Sign in again as in [Connect an AI model](/en/getting-started/setup-ai#troubleshooting) |

## The model service failed (retries automatically) {#retry}

When a model request fails and Halo is about to retry, a countdown card appears in the reply with "Attempt N of M" and a **Stop** button. Its title says why:

| Card title | Meaning | What to do |
|---|---|---|
| "Could not reach the model service" | The model service can't be reached | Check your network and proxy |
| "The model service is overloaded" | The provider is too busy | Let it retry, or send again later |
| "The model service is limiting requests" | Too many requests, or your quota is used up | Wait a little; if it keeps happening, change your plan or model |
| "The model service rejected the credentials" | The key or sign-in isn't valid | Check the key under **Settings › AI Model**, or sign in again |
| "The model provider reported a billing problem" | The account is unpaid or out of credit | Top up in the provider's console |
| "The model service returned an error", "The model request failed" | Something else went wrong | Read the status code and text on the card, and see [Model API error codes](/en/troubleshooting/api-errors) |

## Connecting a model or fetching its model list {#model-setup}

| Message | Meaning | What to do |
|---|---|---|
| "Invalid API Key or no permission" | The key is wrong, or lacks access to that model | Copy the key again; check that your account can use the model |
| "Endpoint not found, check the URL" | The API URL is wrong | Check the address in the provider's documentation |
| "Rate limited or out of quota" | Rate limited, or quota used up | Try again later, or top up |
| "Request timed out, check the server or proxy" | The server is slow or the proxy has a problem | Check your proxy settings and try again later |
| "Cannot reach server, check network or proxy" | It can't connect | Check the network, the proxy and the API URL |
| "Failed to fetch models" | Another reason | Read the provider's explanation after the colon |

**Test connection** results are in English, such as "Invalid API key", "Rate limited - try again later" and "Cannot connect to API server - check URL"; they mean the same as the table above. See [Get an API key](/en/getting-started/api-keys).

## Images and attachments {#attachments}

| Message | Meaning | What to do |
|---|---|---|
| "Image too large (…), max 20MB" | One image is over 20 MB | Compress or crop it, then send again |
| "Unsupported image format: …" | Only JPEG, PNG, GIF and WebP are supported | Convert it to one of those |
| "Current model has no vision — images will be read via local OCR (text only)" | The current model can't see images, so Halo passes it only the text in them | To have it understand the picture itself, switch to a model that can see images |
| "N item(s) could not be attached: not a file or folder on this computer" | What you dropped isn't a file on this computer | Save it to the computer first, then attach it |

## Windows command environment {#windows}

| Message | Meaning | What to do |
|---|---|---|
| "Command execution environment is not installed, AI cannot run system commands" | Git Bash is missing, so the AI can't run commands | Click **Install now**; see [Install and launch problems](/en/troubleshooting/install#git-bash) |
| "Initialization failed" | Installing Git Bash on first launch failed | See [It says "Initialization failed"](/en/troubleshooting/install#git-bash-failed) |

## Digital Humans {#digital-humans}

| Message | Meaning | What to do |
|---|---|---|
| "Not started" | A connection it needs isn't ready | See [A run shows "Not started"](/en/troubleshooting/digital-humans#not-started) |
| "Stopped itself after repeated failures" | 5 runs in a row failed, so its automatic tasks stopped | Fix the cause, then click **Resume work** |
| "An independent execution is already running" | The previous run hasn't finished | Wait for it, or click **Stop this execution** |
| "The holiday calendar does not cover today, so this scheduled run was skipped. Run it manually if needed." | The holiday calendar didn't download today's date | Click **Run now** if you need it |
| "Remote Access is off. Enable it to trigger this over HTTP from other devices." | The HTTP trigger needs Remote Access | Turn on **Settings › Remote Access › Enable Remote Access** |

## Bots {#bots}

| Message | Meaning | What to do |
|---|---|---|
| "⚠️ This bot has no owner yet, so it cannot execute tasks." | Permission Control is on but there's no owner | Message the bot directly once; see [Owner and guest permissions](/en/digital-humans/permissions#auto-claim) |
| "⚠️ This bot only responds in group chats. Please contact the bot administrator for access." | **Reply Scope** is **Group chats only** | @mention it in a group, or change the scope |
| "⚠️ This bot only responds to direct messages." | **Reply Scope** is **Direct messages only** | Message it directly, or change the scope |
| "This bot is already in use by another instance. Each bot can only be bound to one digital human." | The same bot was connected twice | Use the existing entry |
| "Connected · no messages received yet" (Feishu) | Connected, but nothing has arrived | See [Feishu: no messages arrive](/en/troubleshooting/channels#feishu-no-messages) |
| "File export denied: … Only files within the current space or temporary directory can be sent." | The file isn't in the Digital Human's workspace | Put the file in its workspace first |

More in [Bot not replying](/en/troubleshooting/channels).

## Teams {#teams}

| Message | Meaning | What to do |
|---|---|---|
| "Add at least one member, or let AI build the team" | The new team has no members | Add a Digital Human, or click **Let AI build the team from the goal** |
| "Turn on Remote Access in Settings so others can join this team." | Invites need Remote Access or a Federation Gateway | See [Teams across computers](/en/digital-humans/cross-computer-teams#federation-gateway) |
| "Could not join the team. Check the link and that the person who invited you is online." | The inviter's computer can't be reached | See [Teams across computers](/en/digital-humans/cross-computer-teams#troubleshooting) |
| "This invite is no longer valid — it may have expired, been revoked, or the team was closed. Ask for a new invite link." | The link no longer works | Ask the inviter for a new link |
| "This team requires everyone to update Halo to the latest version" | Versions don't match | Click **Check for updates** |
| "‹member› did not receive this message. ‹owner›'s computer is offline right now; …" | The receiving member's computer is offline | Resend once it's back online, or assign the work to another member |
| "This message was not delivered." | The receiving member is no longer in the team | Assign the work to another member |

## Halo is stuck or keeps failing {#stuck}

After repeated errors, Halo resets its AI engine by itself; if that doesn't help, it shows "Halo is having trouble" with **Restart App** and **Try to Fix**.

You can also do it yourself: open **Settings › System › System Diagnostics**, click **Run Diagnostics**, then **Reset AI Engine**; if that fails, click **Restart App**. See [Reset the AI engine or restart](/en/troubleshooting/diagnostics#recover). When you ask someone for help, click **Copy Report** or **Export Report**. The report doesn't contain the key itself. In error messages, Bearer tokens, JWTs and some keys starting with `sk-` are masked, but formats such as Anthropic (`sk-ant-…`) and OpenAI project keys (`sk-proj-…`) are not; user names in macOS and Linux paths are hidden, but not in Windows paths. Read it through before sending and delete any key you see.

## Next steps {#next-steps}

- [Model API error codes](/en/troubleshooting/api-errors): what status codes like 401 and 429 mean.
- [Help center](/en/troubleshooting/): find troubleshooting pages by problem type.
