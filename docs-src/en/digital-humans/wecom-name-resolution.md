---
title: "WeCom: show real names instead of anonymized IDs"
description: "WeCom hides who messages a bot, so Halo contacts show only IDs. Authorize the Message capability in WeCom and paste the link into Halo to show real names."
type: how-to
audience: [office]
prerequisites: [digital-humans/wecom-bot]
related: [digital-humans/wecom-bot, digital-humans/wecom-bot-features, digital-humans/channels]
---

# WeCom: show real names

You authorize this yourself in the WeCom client; Halo can't do it for you. It's optional: without it, sending, receiving and the Digital Human's replies all work, and contacts just show as IDs.

## Why you see IDs {#why}

When a newly created WeCom Intelligent Bot receives a message, it doesn't get the sender's name, only an anonymous ID, and Halo can only show that. To show real names, give the bot the "Message" capability in WeCom as a separate authorization. It's unrelated to the bot's **Bot ID** and **Secret**.

While it isn't set up and some direct-chat contact still shows as an ID, the Digital Human's **IM sessions** and **Reachable Contacts** show "Contacts show raw IDs because WeCom anonymizes senders for this bot…", and **Learn how** opens this page.

## Step 1: authorize in WeCom {#authorize}

Follow the path in the WeCom client: "Workspace → Intelligent Bot → this bot → Permissions → authorize "Message"". Then copy the link it gives you; it looks like `https://qyapi.weixin.qq.com/mcp/v2/bot/msg?apikey=…`.

::: warning The link works like a password
Anyone with this link can act as this bot: read its conversations and recent chat history, download files from messages, and send messages. Keep it like a password: don't post it in a group, and don't put it in documents or code repositories.
:::

The exact menus on the WeCom side are WeCom's to define.

## Step 2: paste it into Halo {#paste}

1. Open **Settings › Message Channels** and expand the WeCom bot.
2. Under **Connection**, find **Name Resolution URL** (marked **Optional**) and paste the link. The box hides its content; click the eye icon ("Show") on the right to see it.
3. It saves automatically; no restart needed.

## Check that it works {#check}

The status appears under **Name Resolution URL**:

| Status | Meaning |
|---|---|
| "Saved — will take effect on the next incoming message" | It's filled in, but no new message has triggered a lookup yet |
| "Active — sender names are being resolved" | It's working |
| "Authorization expired (valid 7 days) — re-copy the link from WeCom and paste it here" | The authorization expired; see [The authorization lasts 7 days](#expiry) |
| "Last attempt failed — will retry automatically" | A temporary network or WeCom error; Halo tries again when the next message arrives (at least 30 seconds later) |

Lookups run in the background and apply to the **next** message from the same person, so after setting it up, wait for them to send another message before the name appears.

::: done
The status reads "Active — sender names are being resolved", and real names appear in **IM sessions** and **Reachable Contacts**.
:::

## What gets resolved {#what-resolves}

- Direct-chat contacts: their names.
- Groups: the group name.
- Individual speakers in a group: WeCom doesn't provide these, so they stay IDs.
- WeCom returns only the most recent 20 or so conversations at a time. Someone you haven't heard from in a while may not resolve until they message again and return to the recent list.

A name you gave a contact yourself (**Rename**) always wins and is never overwritten by a resolved name.

## The authorization lasts 7 days {#expiry}

The authorization is valid for 7 days from when you grant it. After that:

- The status changes to "Authorization expired (valid 7 days)…", and **IM sessions** shows a notice too; **How to re-authorize** brings you back to this page.
- Names already resolved are kept; new contacts show IDs.
- Authorize again in WeCom and paste the new link into **Name Resolution URL**.

## Troubleshooting {#troubleshooting}

### The link is in, but contacts still show IDs

Wait for the person to send another message: lookups only run when a message arrives. If it still doesn't work, check whether the status says the authorization expired, or whether the contact is outside the 20 or so most recent conversations.

### A colleague in a group still shows as an ID

WeCom doesn't provide names for individual speakers in groups. To find someone's user ID, have them message the bot directly and ask "What is my user ID?".

## Next steps {#next-steps}

- [WeCom Intelligent Bot](/en/digital-humans/wecom-bot): connecting it and reply settings.
- [WeCom bot: advanced](/en/digital-humans/wecom-bot-features): groups, commands, files and posting to groups.
