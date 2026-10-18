---
title: "Conversations that work together: read and ask"
description: In Halo, the AI in one conversation can read other conversations in its workspace, hand a decision over, or ask and wait for a reply. Digital Humans can join.
type: how-to
audience: [office]
since: "3.0"
related: [features/conversations, features/operate-halo, digital-humans/capabilities, features/tasks]
---

# Conversations that work together

::: say
> What did the "Database choice" conversation end up deciding?

Halo finds that conversation in the current workspace, reads through it, and tells you the outcome.

**Prerequisite**: none. In a workspace conversation this works by default, with no capability to turn on.
:::

## Before you start {#before-you-start}

- Both conversations must be in the **same workspace**. The AI can't see or message conversations in other workspaces.
- In an ordinary workspace conversation this is on by default. There's nothing to set up.
- To bring a Digital Human's chats in, first turn on **Conversation Collaboration** for that Digital Human. See [Digital Humans and Conversation Collaboration](#digital-humans).

## Read another conversation {#read}

Mention another conversation, and the AI lists the conversations in this workspace, then opens and reads the one you mean.

- The AI reads only the clean transcript: what was said and what was decided.
- It never reads the other conversation's tool calls or thinking.
- A Digital Human's chats in this workspace are in the list too, if that Digital Human has **Conversation Collaboration** on.
- When the other conversation isn't running, reading is the direct way, because everything is already written down.

Try: "What did the 'Database choice' conversation end up deciding?" The AI answers and names the conversation it read.

## Ask another conversation and wait for its reply {#ask}

When the other conversation is still working, asking it is faster than reading its transcript. It knows its own current state, including things not yet in the transcript.

::: say
> Ask the deployment conversation that's running how it's going.

The AI sends the question to that conversation and waits for an explicit reply. Once the other side answers, you see the answer in the current conversation.
:::

- By default the AI waits up to 120 seconds; the wait can be set from 10 to 300 seconds. To wait longer, just say "wait up to 5 minutes".
- If the other conversation is busy, your question is handled after its current turn.
- If it's idle, it's woken up and continues from its own history.
- If its turn ends without an answer, or the wait times out, the AI tells you plainly that no reply came. It never passes off unrelated text as the answer.

## Hand information over to another conversation {#hand-over}

A handover is one-way: you tell the other conversation something, don't wait for a reply, and carry on.

::: say
> Tell the "Frontend redesign" conversation about this decision.

The AI sends the decision with a one-line summary. The other conversation starts a new turn to deal with it, or waits until its current turn ends if it's busy.
:::

When you need the other side to confirm or answer, [ask and wait for a reply](#ask) instead of handing over.

## Point at the right conversation {#reference}

Saying the conversation's title usually works. When titles are easy to mix up, put a reference to the conversation into your message.

1. In the composer, click **＋**, then under **Context** click **Reference a conversation** ("Let AI read another conversation, or message it directly"). You can also type `@` in the composer.
2. In the **Conversations** group of the menu, pick a conversation. Running conversations are listed first. Each row shows the title, a preview of the last message, the time and a status dot. If you don't see the one you want, keep typing part of its title to filter; up to 20 matching conversations are listed.
3. A conversation reference is inserted. Once sent, it shows as a link in the message; click it to **Open conversation**.
4. Add what you want the AI to do, such as "read the outcome of this conversation" or "pass the following on to it", then send.

- Chats of a Digital Human without **Conversation Collaboration** are dimmed, labelled "Collab not enabled", and can't be picked.
- When the workspace has no other conversations, the **Reference a conversation** row is greyed out with "No other conversations in this space yet".
- If several conversations have the same or similar titles, the AI gets a list of candidates instead of guessing.

## What incoming messages look like {#incoming-messages}

A message from another conversation's AI (or a Digital Human) never appears as if you had said it. It shows as a left-aligned, muted card:

- The heading reads "From @*title*:", followed by the sender's one-line summary and the time.
- The card is collapsed by default. On arrival it opens for a few seconds, then collapses. Expand it to read the full message.
- The footer reads "From conversation" › *title link* · "sent by that conversation's AI".
- If the sending conversation has been deleted, it shows "deleted conversation".
- Messages from a Digital Human's scheduled run are one-way notices, marked "one-way notice from a scheduled run, no reply possible".
- If a message arrives while the AI is writing a reply, it appears as a row in that reply's process timeline.

::: done
A "From @…:" card in the target conversation with "sent by that conversation's AI" in its footer means the message arrived. When you asked a question, the other side's answer showing up in your current conversation means it replied.
:::

## Limits {#limits}

| Item | Limit |
|---|---|
| Scope | The same workspace only. A Digital Human's chats count only if it belongs to this workspace and has **Conversation Collaboration** on |
| What is read | The transcript only, never tool calls or thinking |
| Message length | Up to 32,000 characters per message |
| Wait for a reply | 120 seconds by default, adjustable from 10 to 300 seconds |
| Queued messages | Up to 50 waiting messages per target conversation |
| Sending rate | Up to 20 messages between the same two conversations, and 60 in total from one conversation, per 10 minutes. Going over either starts a 5-minute pause |
| Forwarding chains | Up to 6 automatic hops from one message |
| Loops | Questions that would wait in a circle (A waits on B, B on C, C on A) are refused; a conversation can't message itself |
| Authority | A message from another conversation never counts as your approval. Slash commands inside it do nothing and are treated as plain text |
| Not available in | Team conversations, and a Digital Human's IM chats (WeCom, Feishu and others) |

When a sending limit is hit, the sending conversation shows a centred grey notice in English, such as "This conversation was sending messages to "…" much faster than normal…". It means Halo paused sending for 5 minutes. It clears on its own, and everything else keeps working.

## Digital Humans and Conversation Collaboration {#digital-humans}

Digital Humans don't take part by default. With **Conversation Collaboration** on, a Digital Human can read and message other conversations in its workspace, including other Digital Humans' chats. Its own chats also appear in other conversations' lists and `@` menus.

1. Open **Digital Humans** and pick a Digital Human.
2. Go to **Capabilities and settings › Model & Capabilities** and turn on **Conversation Collaboration**.

The description under the switch reads: "Allow this app to read and send messages to other conversations in this space, including other digital humans. It acts on their chats with their full authority, so enable it only for digital humans you trust."

- Only the Digital Human's owner can change it, and it's set per Digital Human.
- It applies in the Digital Human's ordinary chats and its scheduled runs. It doesn't apply in IM chats, team conversations or turns started by a guest.
- Messages sent from a scheduled run are one-way notices; the other side can't reply.
- A message a Digital Human sends runs in the target conversation with that conversation's own permissions.
- With the switch off, other conversations' AI can no longer reach that Digital Human's chats through conversation collaboration.
- The two [switches in Settings](#settings) apply to Digital Humans as well.

::: warning
Turning **Conversation Collaboration** off doesn't block every path. If a conversation or Digital Human has [Operate Halo](/en/features/operate-halo) on, its AI can still read and message a Digital Human's chats through Halo's API, regardless of this switch. Turn on **Operate Halo** only for conversations and Digital Humans you trust.
:::

For every capability on that tab, see [Capabilities and settings](/en/digital-humans/capabilities).

## The two switches in Settings {#settings}

<Badge type="info" text="Desktop only" />

Two switches in **Settings › Advanced › Built-in MCP Extensions** control conversation collaboration for all of Halo:

| Switch | What it does | Default |
|---|---|---|
| **Cross-Conversation Interop** | Master switch: lets a conversation list, read and message other conversations in the same workspace | On |
| **Cross-Conversation Sending** | Also allows sending messages to other conversations, not just reading them. Applies only when the master switch is on | On |

- With only **Cross-Conversation Sending** off, conversations can still read each other but can't hand over or ask.
- Changes don't affect sessions that are already open. As the page says, "Please start a new session or restart Halo for changes to take effect."

## Troubleshooting {#troubleshooting}

### A Digital Human's chat is dimmed in the `@` menu with "Collab not enabled"

That Digital Human doesn't have **Conversation Collaboration** on. Ask its owner to turn it on in **Digital Humans › Capabilities and settings › Model & Capabilities**.

### "Reference a conversation" is greyed out with "No other conversations in this space yet"

There are no other conversations in this workspace. Conversations can only work together within one workspace, so start the other conversation in this workspace first.

### The AI says it can read other conversations but can't message them

**Cross-Conversation Sending** is off in **Settings › Advanced › Built-in MCP Extensions**. Turn it on, then try again in a new conversation.

### In a Digital Human's chat, the `@` menu has no Conversations group

That Digital Human doesn't have **Conversation Collaboration** on. Once it's on, conversations can be referenced from its chat.

### After asking, the AI says no reply came

The other conversation finished its turn without answering, or the wait timed out (120 seconds by default). Ask the AI to wait longer (up to 300 seconds), or let the other conversation finish and have the AI read its transcript.

### A grey English notice "…much faster than normal…" appears in the sending conversation

A sending limit was hit and Halo paused sending for 5 minutes. This usually means two conversations kept replying to each other. It clears on its own; you don't need to do anything.

### Clicking a conversation link shows "This conversation is no longer available"

The referenced conversation has been deleted.

## Next steps {#next-steps}

- [Conversations](/en/features/conversations): starting conversations, the `@` menu and the cards in a reply.
- [The task panel](/en/features/tasks): with several conversations running, see in one place which are running and which are waiting for you.
- [Let the AI operate Halo](/en/features/operate-halo): before turning on **Operate Halo**, see what the AI can change and which actions have no confirmation.
