---
title: "Notifications and proactive push: send results out"
description: "Let Halo Digital Humans send results out on their own: to people and groups who messaged their bot, or via email, WeCom, DingTalk, Feishu and webhooks."
type: how-to
audience: [office]
prerequisites: [digital-humans/channels]
related: [digital-humans/channels, digital-humans/capabilities, digital-humans/permissions, features/email]
---

# Notifications and proactive push

::: say
> Post this weekly report summary to "Marketing group".

Say it in the Digital Human's own chat, and it pushes the message to that group; in Halo's **IM sessions**, the message is labelled "Sent proactively". **Prerequisite**: the group is in its **Reachable Contacts**; see [Push to contacts](#push-to-contacts).
:::

## Two ways to send things out {#two-ways}

| | Push to contacts | One-way notification channels |
|---|---|---|
| Who receives it | People and groups who have messaged the Digital Human's bot | The recipients set up for email, a WeCom app, DingTalk, a Feishu app or a webhook |
| Can they reply | Yes, and the Digital Human handles the reply | No |
| Where it's set up | The Digital Human's **Capabilities and settings › Messages & Notifications** | The one-way cards in the lower part of **Settings › Message Channels** |
| What it needs | **IM Push** (on by default) | At least one notification channel enabled |

Either way, the Digital Human decides when to send what. To have it send at a fixed point, put that in its **System Prompt**, for example "After each run, post the conclusion to the marketing group".

## Push to contacts {#push-to-contacts}

1. Connect a bot to the Digital Human first; see [Message channels overview](/en/digital-humans/channels).
2. Have the person or group message the bot once (in a group, @mention it). They then appear automatically under the Digital Human's **Capabilities and settings › Messages & Notifications › Reachable Contacts**.
3. **Rename** the contact to something easy to recognize, such as "Marketing group". Say "post it to the marketing group", and it knows which one you mean.
4. Ask for it in the Digital Human's chat, or put it in its job description.

A few rules:

- It doesn't "push" into the chat you're talking in; that chat gets the reply anyway.
- Files it sends must come from its workspace or the temporary folder.
- By default, a bot's guests can't have it message other people; see [Owner and guest permissions](/en/digital-humans/permissions#guest-limits).
- After Halo restarts, a WeChat contact must message first before it can send to them again.

### Sync each run's result automatically {#auto-sync}

Turn on **Auto-sync run result** for a contact under **Reachable Contacts**, and after each successful run the final reply is sent to that contact, labelled "Sent proactively · result of a run" in **IM sessions**. It's off by default.

### Use another Digital Human's bot {#from-existing-chats}

**Add from existing chats** lets this Digital Human post into chats another Digital Human's bot knows; they're marked "Added from other bots". Replies from those chats still go to the original Digital Human. To stop, click **Stop pushing to this chat**.

## One-way notification channels {#one-way-channels}

In the lower part of **Settings › Message Channels**, each card has an **Enabled** switch, its fields and a **Test** button (the channel must be enabled to test). Set a channel up once and every Digital Human can use it.

| Channel | Fields | Notes |
|---|---|---|
| **Email** | **SMTP Host**, **SMTP Port**, **Use SSL/TLS**, **Username**, **Password**, **Default Recipient** | The password is usually your mailbox's app password or authorization code. **Test** only checks the login and sends no mail. See [Email and calendar](/en/features/email) |
| **WeCom** (a WeCom app) | **Corp ID**, **Agent ID**, **Secret**; optional **Default User ID**, **Default Party ID** | Without a **Default User ID**, it goes to everyone in the company, even if a **Default Party ID** is set |
| **DingTalk** | **App Key**, **App Secret**, **Agent ID**; optional **Robot Code**, **Default Chat ID** | With a Default Chat ID it posts to that group; otherwise it sends a work notification to everyone |
| **Feishu** (a Feishu app) | **App ID**, **App Secret**, plus **Default Chat ID** or **Default User ID** | At least one recipient is required; if both are set, it goes to the **Default Chat ID** |
| **Webhook** | **URL**; optional **Method**, **Headers (JSON)**, **HMAC Secret** | Sends the title and body as JSON; with a secret, requests carry an `X-Halo-Signature` signature. **Test** sends a real request |

**Test** for WeCom, DingTalk and Feishu only checks that the credentials can get a token; it doesn't check the recipients.

::: warning DingTalk and WeCom go to everyone by default
Without a **Default Chat ID** on DingTalk, or a **Default User ID** on WeCom (even with a party set), notifications go to everyone in the company. Fill in the recipients before a Digital Human sends anything.
:::

## Desktop notifications {#desktop}

- Each Digital Human's **Messages & Notifications › System Notifications**: **Important** (the default: milestones, questions and outputs), **All** (every run result) or **None**.
- When the window isn't in front, Halo shows a system notification; when it is, an in-app notice.
- Whether ordinary conversations notify you when they finish in the background is set under **Settings › System › Task Notifications**, off by default.

::: done
The contact received the Digital Human's message; in Halo's **IM sessions**, the message is labelled "Sent proactively".
:::

## Troubleshooting {#troubleshooting}

### It says it can't find "Marketing group"

The group isn't in **Reachable Contacts** yet. Have someone in the group @mention the bot once, then rename the contact to something easy to recognize.

### The channel test passed, but nothing arrived

The WeCom, DingTalk and Feishu tests only check the credentials, not the recipients. Check the **Default User ID** and **Default Chat ID**. The email test doesn't send mail either; ask the Digital Human to send one to try it.

## Next steps {#next-steps}

- [Message channels overview](/en/digital-humans/channels): connect a bot.
- [Capabilities and settings](/en/digital-humans/capabilities#capabilities): turn **IM Push** and **Email** on or off.
