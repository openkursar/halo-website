---
title: "WeCom bot advanced: groups, commands, files"
description: "After connecting a WeCom bot: @mention it in groups, control it with /stop and /clear, exchange files, handle long replies, and have it post to groups."
type: how-to
audience: [office]
prerequisites: [digital-humans/wecom-bot]
related: [digital-humans/channels, digital-humans/permissions, digital-humans/notifications, digital-humans/wecom-name-resolution]
---

# WeCom bot: advanced

Most of what this page covers happens in WeCom; the related settings are in Halo under **Settings › Message Channels**.

## Before you start {#before-you-start}

- The bot is connected as in [WeCom Intelligent Bot](/en/digital-humans/wecom-bot), and you're its owner.

## Use it in groups {#groups}

- Add the bot to a group and @mention it when you talk to it. WeCom forwards only messages that @mention the bot; it never sees the others.
- Each group message carries who sent it, so the Digital Human knows who said what.
- By default replies quote your message (**Quote Reply (Group)**). Turning that off sends replies without the quote and also turns off **Streaming**.
- People in the group are owners or guests: guests can by default only chat and use memory, and when messages from owners and guests are handled together, they run with guest permissions. See [Owner and guest permissions](/en/digital-humans/permissions).
- By default a group shows up in Halo as an ID; with [name resolution](/en/digital-humans/wecom-name-resolution) set up, it shows the group name. You can also **Rename** it under the Digital Human's **Capabilities and settings › Messages & Notifications › Reachable Contacts**, for example to "Sales group", and "post it to the sales group" then finds it.

## Commands in the chat {#commands}

| Send | What it does | The bot replies |
|---|---|---|
| `/stop` (or `/halo-stop`, `/halo-cancel`) | Stops what it's doing | Generation stopped. (No active generation to stop. if nothing is running) |
| `/clear` (or `/halo-clear`, `/halo-reset`) | Clears this chat's context and starts over | Context cleared. Starting a fresh conversation. |

- Commands aren't case-sensitive, and in a group they work after an @mention of the bot.
- `/clear` only clears the chat context; the Digital Human's memory and reminders stay.

## Sending more while it's busy {#while-busy}

Messages you send while it's replying aren't lost:

- Ones it can use right away get "✏️ 已加入正在进行的处理" (added to the work in progress), and it sees them in the current round.
- The rest get "✏️ 已收到补充消息" (follow-up received; later ones get "✏️ 又收到补充", more follow-ups received). When the round ends, it first posts "（上一轮回应已结束）" (the previous reply has ended) and then handles them together.

## Images and files {#files}

- It receives text, images, mixed text and images, voice (as WeCom's transcript), files and video. If you quote a message with an image or file and @mention the bot, the quoted image or file comes along too.
- To get a file from it, just ask, for example "Send me the report". Images go out as images, everything else as files.
- Images can be up to 10 MB (larger ones are sent as files) and files up to 20 MB; above that the send fails, and it tries compressing or splitting the file before sending again.
- It can send only files inside its own workspace or the temporary folder.

## Long replies and progress {#long-replies}

- One WeCom message holds about 20,000 bytes. Longer replies are split into several messages numbered like (1/3), up to 10; anything beyond ends with "（内容过长，其余部分请在 Halo 里查看）" (the rest can be read in Halo).
- **Streaming** (off by default): when on, the reply is written into one message as it's produced; in groups, **Quote Reply (Group)** must be on too. WeCom limits one streamed message to 10 minutes; after that the message notes that the task is still running and further progress comes as new messages, at most one every 2 minutes.
- **Processing Notice** (on by default): if there's no reply within 5 seconds, it first sends "已收到，正在处理…" ("Received, working on it…"); with **Streaming** on, the line appears right away inside the reply being written instead of as a separate message.
- Within 24 hours of the person's last message, replies quote the original message; after that, replies and files are sent as plain messages without the quote. In a group with **Quote Reply (Group)** off, replies never quote.

## Have the Digital Human post to groups {#push}

People and groups who have messaged the bot become this Digital Human's contacts, and it can message them on its own; see [Push to contacts](/en/digital-humans/notifications#push-to-contacts).

Common uses:

- **A daily report on schedule**: give the Digital Human a schedule, and write in its **System Prompt** "after each run, post the conclusion to the sales group".
- **Results synced automatically**: turn on **Auto-sync run result** for the group under **Reachable Contacts**, and the final reply goes to the group after each successful run.
- **Another Digital Human posting to the same group**: in that Digital Human's **Reachable Contacts**, click **Add from existing chats**; see [Use another Digital Human's bot](/en/digital-humans/notifications#from-existing-chats).

If the network drops briefly, replies are queued for up to 2 minutes and sent once it's back; a proactive push fails meanwhile (the Digital Human is told the channel is disconnected), and **Auto-sync run result** skips that run.

## Put it to work from your phone {#remote-control}

As the owner, you can have the Digital Human work on the computer running Halo from WeCom at any time: write and run a script, use the browser, tidy files, and send the results back.

::: danger The owner's instructions run with full permissions
The Digital Human runs commands and changes or deletes files directly, without step-by-step confirmation. Do this only in a direct chat, make sure **Permission Control** is on and **Owner User IDs** lists only you, and write what it must not do into its **System Prompt**.
:::

## Troubleshooting {#troubleshooting}

### It doesn't react in a group

1. Make sure you @mentioned the bot.
2. **Reply Scope** isn't **Direct messages only**.
3. The bot has an owner. If not, message it directly first.

For more, see [Bot not replying](/en/troubleshooting/channels).

### Asking for a file gives "File export denied"

The file isn't in its workspace or the temporary folder. Have it save the file into its own workspace first, then send it.

### A reply stopped halfway

Send `/stop`, then send the request again; you can also open the Digital Human's **IM sessions** in Halo to see how far it got.

## Next steps {#next-steps}

- [Owner and guest permissions](/en/digital-humans/permissions): decide what others in a group can have it do.
- [WeCom: show real names](/en/digital-humans/wecom-name-resolution): show contacts' real names instead of IDs.
- [Notifications and proactive push](/en/digital-humans/notifications): more ways to have it send messages.
