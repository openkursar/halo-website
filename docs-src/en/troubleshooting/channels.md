---
title: "Bot not replying: WeCom, Feishu and WeChat bots"
description: "When a Halo bot in WeCom, Feishu or WeChat doesn't reply, check in order: Halo running, connection, the bound Digital Human, Reply Scope, @mentions, owner."
type: how-to
audience: [office]
related: [digital-humans/channels, digital-humans/wecom-bot, digital-humans/feishu-bot, digital-humans/permissions]
---

# Bot not replying

::: say
> My WeCom bot stopped replying. Can you check what's wrong?

Halo works through the official troubleshooting guide and asks you what you see, step by step. With **Operate Halo** on (**＋ › Capabilities** in the message box), it can also check the bot's connection status itself and reconnect it if needed.
:::

## First: did "已收到，正在处理…" arrive? {#processing-notice}

The **Processing Notice** is on by default: if the Digital Human hasn't replied within 5 seconds, the bot first sends "已收到，正在处理…" ("Received, working on it…").

- **You got it**: the message reached the Digital Human and it's working. Give it a moment; if nothing follows, see [The message arrived but there's no reply](#no-answer).
- **You didn't**: the message never reached Halo. Start from [step 1](#halo-running).

With **Streaming** on, the line appears right away inside the reply being written (WeCom shows "ℹ️ 已收到，正在处理…"). With the **Processing Notice** off and Streaming off, it isn't sent.

## 1. Halo is running and the computer is awake {#halo-running}

Bots stay connected to the chat app through Halo. While Halo is closed, the computer sleeps or the network is down, the bot receives nothing. See [Keep Digital Humans running](/en/digital-humans/keep-running).

**Pause automatic tasks** doesn't affect bots: a paused Digital Human still answers chat messages.

## 2. The bot is connected {#status}

Open **Settings › Message Channels** and check the bot's status:

| Status | Meaning | What to do |
|---|---|---|
| **Connected** (green dot) | The connection works | Keep checking below |
| **Disconnected** | It can't connect | Click **⋮ › Reconnect** at the top right of the bot; for one set up by hand, check the Bot ID and Secret, or the App ID and App Secret |
| **Standby** (WeCom) | The same bot is in use on another computer | To use it here, click **Use on this device** |
| **Disabled** | The bot is switched off | Turn on the switch at the top right of the bot; for a WeChat bot, click **Connect WeChat** and scan again |
| **Not connected** (WeChat) | Most likely the WeChat sign-in expired | Click **Connect WeChat** and scan again |
| **Connected · no messages received yet** (Feishu) | Connected, but no message has arrived | See [Feishu: no messages arrive](#feishu-no-messages) |

If a company network or proxy blocks WeCom's or Feishu's servers, the bot can't connect either; ask your network administrator.

## 3. The bot is bound to a Digital Human {#binding}

Expand the bot and check **Backend**:

- A Digital Human (or team member) must be picked. If it says "Binding unavailable", the previous Digital Human is gone; pick another.
- Global Digital Humans (with no workspace) can't take a bot; pick one that lives in a workspace.
- If the backend is a team member, that member must be on this computer and still in the team.

## 4. Reply Scope and @mentions {#scope}

- With **Reply Scope** set to **Group chats only**, direct messages are declined with "⚠️ This bot only responds in group chats. Please contact the bot administrator for access."; with **Direct messages only**, group messages get "⚠️ This bot only responds to direct messages.".
- In groups, @mention the bot. WeCom forwards only messages that @mention it; Feishu's **Require @mention in groups** is on by default.
- WeChat bots don't work in groups.

## 5. The bot has an owner {#owner}

With **Permission Control** on and no owner yet, the bot does nothing in groups and only says "⚠️ This bot has no owner yet, so it cannot execute tasks." (at most once every 10 minutes per group). Message the bot directly once and you become its owner. See [Owner and guest permissions](/en/digital-humans/permissions).

## The message arrived but there's no reply {#no-answer}

1. Open the Digital Human, switch to the **IM sessions** tab, find the contact, and check whether the message and a reply are in the conversation.
2. If it's been replying for a long time without finishing, click **Stop generation**, then resend from the chat app; you can also send `/stop` in the chat.
3. If it replies "The model returned an empty response. Please send your message again.", resend.
4. If the Digital Human's AI model has a problem (an invalid key, used-up quota), it can't reply either. Chat with it in Halo to see, and look up the error in [Error messages](/en/troubleshooting/common-errors).

## WeCom {#wecom}

- One bot can be connected on only one computer at a time. When another computer takes it over, this one shows **Standby**; see [The same bot on two computers](/en/digital-humans/wecom-bot#standby).
- "This bot is already in use by another instance. Each bot can only be bound to one digital human.": the bot is already connected through another entry; use that one, or delete it first.
- More in [WeCom Intelligent Bot](/en/digital-humans/wecom-bot#troubleshooting).

## Feishu {#feishu}

### No messages arrive {#feishu-no-messages}

When the card says "Connected · no messages received yet":

- The app may still be waiting for your company administrator's approval; it receives messages only after that.
- The person messaging it may be outside the app's availability.
- Send it a direct message in Feishu to check; the note disappears as soon as one arrives.

### Other cases {#feishu-other}

- Your computer shows "Feishu bot cannot connect": check the **App ID** and **App Secret**, and that the app is published.
- If the same Feishu app is connected on two computers, messages are split between them at random. Use each app on one computer only.
- To receive group messages that don't @mention it, give the app the "all group messages" permission in the Feishu developer console, then turn off **Require @mention in groups**.

More in [Feishu Bot](/en/digital-humans/feishu-bot#troubleshooting).

## WeChat {#wechat}

- It shows **Not connected**: click **Connect WeChat** and scan again.
- After Halo restarts, messages the Digital Human sends to someone don't arrive: ask that person to message the bot first.

More in [WeChat Bot](/en/digital-humans/personal-wechat#troubleshooting).

::: done
You message the bot from the chat app and it replies; the conversation shows up in the Digital Human's **IM sessions**.
:::

## Next steps {#next-steps}

- [Message channels overview](/en/digital-humans/channels): how the bots differ and how to use them.
- [A Digital Human did not run](/en/troubleshooting/digital-humans): when a scheduled run didn't start on time.
