---
title: "Task panel: running work and what needs you"
description: Halo's task panel lists running work, questions waiting for your answer and fresh results from every workspace in one place, so one click takes you back.
type: how-to
audience: [office]
since: "3.0"
related: [features/conversations, digital-humans/manage, digital-humans/keep-running]
---

# The task panel

::: say
> How did the news assistant do on its last run?

Halo checks that Digital Human's status, its last run time and its latest result, then tells you. Teams work too: "How far along is the market research team?" Halo reads the progress of that team's latest run.

**Prerequisite**: the Digital Human or team is in the same workspace as your conversation. To ask another conversation for progress, see [Conversations that work together](/en/features/cross-conversation).
:::

## Open the task panel {#open}

1. Click **Tasks** at the bottom of the nav rail. The number on the icon is the item count; above 99 it shows "99+". The panel opens next to the rail as a 340 px column and pushes the content aside.
2. In a narrow window (the Android app, or a browser window narrower than 640 px), tap **Navigate** in the header, then **Tasks**. The panel slides up from the bottom and takes at most 70% of the screen height.
3. On the home screen of a new conversation, the **Continue recent task** chip also opens the task panel.
4. Read the summary at the top of the panel, for example "Needs you 2 · Running 1".
5. Close it with the × at the top right. When it slides up from the bottom, tapping outside the panel closes it too.

The panel lists items from every workspace, not only the current one. The desktop app, a browser opened through [Remote Access](/en/features/remote-access) and the Android app show the same list, and a change on one updates the others.

With nothing in it, the panel shows "No active tasks" and "Tasks and pinned conversations appear here".

::: info Coming from 2.x
2.x kept pinned conversations inside the conversation list. Since 3.0 they live in the task panel on the nav rail, together with running work.
:::

## The three groups {#groups}

The task panel has three groups: **Needs you**, **Running** and **Pinned**. The number on the nav rail counts every item except those in Pinned.

| Group | What lands in it |
|---|---|
| **Needs you** | The AI asking you a question in a conversation; a Digital Human waiting for you, signed out or failing repeatedly; a team waiting for your decision; a conversation that hit an error; a finished conversation you haven't looked at yet |
| **Running** | Conversations generating a reply; Digital Humans running or queued |
| **Pinned** | Conversations you pinned that have nothing pending |

Items are sorted by urgency: waiting for your answer › error › finished but unseen › running › pinned. Within each level, the most recently updated item comes first.

Each row shows its workspace name at the top right; hovering shows "Workspace: name". A Digital Human that belongs to no workspace shows **Global**. Teams show no workspace name.

### Needs you {#needs-you}

The Needs you group collects everything that is waiting for you:

- **A question in a conversation**: the AI shows a question card and waits for your answer.
- **A Digital Human waiting for you**: the row shows its question, or "Waiting for your input" when there is no question text.
- **A Digital Human signed out**: the row shows "Login expired, needs to sign in again".
- **A Digital Human with an error**: the row shows the latest error, or "Repeated failures, paused" after several failures.
- **A team waiting for your decision**: the row shows "Waiting for your decision". Temporary collaborations don't appear here.
- **A conversation with an error**: a conversation you stopped yourself doesn't count as an error and stays out of this group.
- **Finished but unseen**: the conversation is done, but you haven't opened it yet.

### Running {#running}

The Running group lists conversations generating a reply and Digital Humans at work. A running Digital Human shows its elapsed time as m:ss or h:mm:ss. A queued one shows **Queued**.

### Pinned {#pinned}

The Pinned group holds conversations you pinned that have nothing pending. When a pinned conversation starts running or needs you, it moves to that group for the time being.

To pin or unpin a conversation:

1. Hover over the conversation's row in the task panel.
2. Click **Pin**. The conversation moves into Pinned. Click **Unpin** to take it out again.

The button says **Pin** and the group header says **Pinned**; both mean the same thing. Only regular conversations can be pinned from the task panel. Pin a Digital Human chat from the conversation list instead, see [Conversations](/en/features/conversations).

## Open an item {#open-item}

Click a row in the task panel and Halo takes you back to that piece of work:

| Item | What opens |
|---|---|
| Conversation | That conversation. If it is in another workspace, Halo switches to that workspace first |
| Digital Human chat | Your chat with that Digital Human |
| Digital Human run | That Digital Human's **Work activity** under **Digital Humans › My Digital Humans**. If it is waiting for you, Halo jumps straight to the question; answer it and click **Submit and continue this work** |
| Team | That team's workbench under **Digital Humans › Teams** |

To see every question from your Digital Humans and teams at once, open **Digital Humans › My Digital Humans** and click **Handle all (N)**, which opens "Needs my attention". See [Manage Digital Humans](/en/digital-humans/manage).

## Keep or remove after viewing {#keep-or-remove}

After you open a finished or failed conversation, it stays in the task panel for 60 seconds:

1. The row fades and a 60-second countdown bar runs along its bottom.
2. Hovering shows "Removing soon" with **Keep** and **Remove** buttons.
3. Click **Keep** and the row stays until you click **Remove**.
4. If you click nothing, the row disappears when the countdown ends.

Digital Human runs and teams skip this step: once they are no longer running or waiting for you, they leave the panel right away, with no countdown.

Halo saves finished-but-unseen conversations and the ones you chose to keep. Work that finished while Halo was closed or its window was hidden is still in Needs you after a restart. When a conversation, Digital Human or workspace is deleted, its items go too.

## What the task panel doesn't do {#not-in-panel}

- **No Stop button**: to stop a piece of work, open it and stop it there.
- **No answering in the panel**: open the item and answer in the conversation or the Work activity.
- **Some chats never appear**: chats in Feishu, WeCom and other message channels, conversations between team members, and the knowledge base's question chat.

## Status dots next to conversations {#status-dots}

The dot's colour tells you a conversation's state without opening it:

| Colour | Meaning |
|---|---|
| Blue | Generating a reply |
| Amber | Waiting for your answer |
| Green | Finished, not yet seen |
| Red | Error |
| No dot | Idle |

Status dots appear on each row of the conversation list, in the chat history panel, and in the list you get when you type @ to pick a conversation. When a section of the conversation list is collapsed, its header shows the most urgent colour in that section. When the conversation list is collapsed to avatars, the dot sits on the avatar.

## Task-complete notifications {#notifications}

<Badge type="info" text="Desktop only" />

To know when the AI is done while you work in another app:

1. Open **Settings › System**.
2. Turn on **Task Notifications** ("Notify when a task completes in the background"). It is off by default.
3. Make sure your operating system allows notifications from Halo.

From then on, whenever the Halo window is not in front, your system shows a notification titled "Halo" each time the AI finishes a turn. Nothing pops up while the Halo window is in front.

| Situation | Notification? |
|---|---|
| A turn finishes (including a [code review](/en/features/code-review) conversation running in the background) | Yes |
| The AI is waiting for your answer | No. You only see the amber dot and the Needs you group |
| A Remote Access browser or the Android app | No. Notifications appear only on the computer running Halo |

Clicking the notification brings the Halo window to the front, but it doesn't open the conversation. The notification text is English only: `Task complete: <conversation title>`.

Digital Humans notify you separately, whether **Task Notifications** is on or off. When a Digital Human needs a decision, reports progress or hands over a result: with the Halo window in front, a message pops up inside the app (one per Digital Human, the newest replaces the older); with the window not in front, your system shows a notification that opens that Digital Human's Work activity.

## Work keeps running when the window is closed {#window-closed}

AI replies, Digital Humans and code reviews run in the background, so closing the window doesn't stop them. What happens depends on your system:

<PlatformTabs>
<template #macos>

Click the window's close button and the window hides while Halo stays in the Dock, so work keeps running. Click the Dock icon, choose **Show Halo** from the Halo icon in the menu bar, or open Halo again to bring the window back.

</template>
<template #windows>

Click the window's close button and Halo hides to the system tray, so work keeps running. Click the tray icon or open Halo again to bring the window back.

</template>
<template #linux>

Closing the last window quits Halo, and all work stops with it. To keep work going, minimize the window instead of closing it.

</template>
</PlatformTabs>

When work is running in the background, choosing **Quit Halo** from the tray menu asks you to confirm first. Work that finished while the window was hidden shows up in Needs you when you come back.

To keep Digital Humans available all the time, see [Keep Digital Humans running](/en/digital-humans/keep-running).

::: done
A number appears on **Tasks** in the nav rail, the panel shows items under Needs you or Running, and clicking a row takes you back to that work. The task panel is working.
:::

## Troubleshooting {#troubleshooting}

### Work finished in the background, but no notification arrived

- Check that **Settings › System › Task Notifications** is on. It is off by default.
- No notification appears while the Halo window is in front.
- Check Halo's notification permission in your system settings.
- Remote Access browsers and the Android app don't get these notifications.

### The AI is waiting for my answer, but nothing notified me

That is how Halo works today: there is no system notification when the AI waits for your answer. Watch for the amber dot next to the conversation, or the Needs you group in the task panel. Digital Humans waiting for a decision notify you separately.

### A conversation I opened disappeared from the panel

A finished or failed conversation stays for 60 seconds after you view it. To keep it, hover over the row during the countdown and click **Keep**.

### My Feishu or WeCom chats aren't in the task panel

Chats in message channels, conversations between team members and the knowledge base's question chat never enter the task panel. Check a Digital Human's message-channel work under **Digital Humans › My Digital Humans**.

### The number on the nav rail doesn't match the list

The nav rail number leaves out the conversations in Pinned. It counts only items that need you or are running.

### On Linux, my Digital Humans stopped after I closed the window

On Linux, closing the window quits Halo. Minimize it instead, or see [Keep Digital Humans running](/en/digital-humans/keep-running).

## Next steps {#next-steps}

- [Conversations](/en/features/conversations): create, pin and answer the AI's question cards
- [Manage Digital Humans](/en/digital-humans/manage): answer questions in the Work activity and resume a paused Digital Human
- [Keep Digital Humans running](/en/digital-humans/keep-running): launch at login, sleep and always-on options
