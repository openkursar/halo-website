---
title: "Digital Human reminders: one-off or repeating"
description: "Ask a Halo Digital Human in its chat to remind you, and it reminds you in that chat on time. Reminders set in WeCom, Feishu or WeChat come back there."
type: how-to
audience: [beginner, office]
related: [digital-humans/triggers, digital-humans/manage, digital-humans/channels]
---

# Reminders

::: say
> Remind me to hand in the weekly report at 9 tomorrow morning.

> Remind me to write my daily report at 5:30 pm every weekday.

Say these in a Digital Human's own chat. The Digital Human tells you when the reminder is set for; when the time comes, it picks up again in the same chat, for example to tell you the weekly report is due.
:::

## Before you start {#before-you-start}

- Reminders can only be set in a Digital Human's chat. If you ask in an ordinary Halo conversation, it asks you to go to a Digital Human.
- A fresh Halo already has a Digital Human named "Halo AI 数字人模板" in the **Halo Workspace**; you can use it for reminders right away.

## Steps {#steps}

1. Open a Digital Human's chat, any of these ways:
   - in the **Conversation** list, click it in the **Digital Humans** group;
   - in the message box, click **＋**, choose **Chat with a digital human**, then pick it;
   - on the **Digital Humans** page, hover over its card and click the chat icon.
2. Say the time and what to remind you of in plain words: once ("in an hour", "at 9 tomorrow") or repeating ("every day at 9", "every weekday at 5:30 pm").
3. When the Digital Human replies with the reminder time, it's set.

You can do the same while chatting with the Digital Human in WeCom, Feishu or WeChat; the reminder then comes back to that chat.

::: done
The Digital Human replied with the reminder time, and the reminder is listed under its **Capabilities and settings › Trigger › Reminders**.
:::

## See and cancel reminders {#manage}

- Open the Digital Human, switch to **Capabilities and settings**, and find **Reminders** under **Trigger**. Each one shows what it says, when, which chat it was set in, and who asked. Click **Cancel this reminder** to delete it.
- Or ask in the chat where you set it: "Which reminders have I set?", "Cancel tomorrow's reminder."

![The Reminders list in a Digital Human's Trigger settings: one reminder at 08:30 on Mondays, showing the next time and the main chat, with a cancel button on the right](/images/digital-humans/reminders/reminders-list.en.webp)

## Rules and limits {#limits}

| Item | Detail |
|---|---|
| Time | This computer's local time; up to one year ahead |
| Repeats | At least 5 minutes apart |
| How many | Up to 20 per chat and 100 per Digital Human |
| Pause automatic tasks | Doesn't affect reminders; they still come |
| Clearing chat history | Reminders stay; deleting the chat or uninstalling the Digital Human deletes them |
| Halo not running | If Halo was closed or the computer slept when a reminder came due, it comes once Halo is open again |
| Guests | Guests of a bot can't set reminders |

## Troubleshooting {#troubleshooting}

### You said "remind me" and it told you to find a Digital Human

You asked in an ordinary Halo conversation. Open a Digital Human's chat as described above and ask again.

### A reminder didn't arrive

First make sure Halo is running and the computer is awake. For a reminder set in WeCom or Feishu, if the bot wasn't connected then, or that chat is no longer within the bot's reply scope, that reminder isn't delivered.

## Next steps {#next-steps}

- [Schedules and triggers](/en/digital-humans/triggers): for regular work (not just reminding you), use a schedule.
- [Keep Digital Humans running](/en/digital-humans/keep-running): reminders arrive on time only while the computer is on and Halo is running.
