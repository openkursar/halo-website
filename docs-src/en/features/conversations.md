---
title: "Conversations: manage, steer and reference replies"
description: Create, pin, rename and delete conversations in Halo, choose the send key, add to or stop a running reply, read a reply, quote passages and set a goal.
type: how-to
audience: [beginner]
related: [features/image-input, features/models, features/capabilities, features/tasks]
---

# Conversations

::: say
> Rename this conversation to "Q3 review", then delete last week's test conversation.

Halo renames it and deletes the other one, and the list on the left updates. The delete is not confirmed and cannot be undone.

**Prerequisite**: turn on **Operate Halo** under **+ › Capabilities** in the composer (off by default). Halo can ask you to turn it on, but it can't turn it on itself.
:::

A conversation is the running record of one piece of work. Halo bases every reply on what was said in the current conversation, so give separate tasks separate conversations: if you discuss an email and then an annual report in the same one, the two topics tend to blur.

## Start a new conversation {#new-conversation}

1. Click **Conversation** in the left rail, then **New** at the top of the conversation list. Or press <Shortcut mac="⌘ K" other="Ctrl K" /> and choose **New Conversation** under **Quick actions**.
2. "What do you want to do today?" appears with the composer and a few buttons such as **Generate code** and **Analyze document**. A button only fills the composer with a sentence; it doesn't send it.
3. Type what you want done and press <kbd>Enter</kbd>.

A new conversation is titled with the date and time. Once you send the first message, its first 50 characters become the title, unless you've already renamed it.

## Organize the conversation list {#conversation-list}

The conversation list sits on the left of the conversation view, in three collapsible sections:

| Section | What's in it |
|---|---|
| **Pinned** | Conversations you pinned |
| **Digital Humans** | Conversations with this workspace's Digital Humans, grouped by Digital Human |
| **Conversations** | Your direct conversations with Halo |

Hover over a row and two buttons appear on its right:

- **Pin** / **Unpin**: pin the conversation, or unpin it.
- **More** › **Rename**: rename it in place. <kbd>Enter</kbd> saves, <kbd>Esc</kbd> cancels.
- **More** › **Delete**: delete the conversation.

::: danger Deleting a workspace conversation is not confirmed and cannot be undone
After you click **Delete**, a workspace conversation is gone at once and can't be recovered. A Digital Human's conversation asks "Delete this conversation?" first, and its default conversation offers **Clear chat** instead, also with a confirmation.
:::

The small dot in front of each row shows its state without opening it:

| Dot | Meaning |
|---|---|
| Blue | Generating |
| Amber | Waiting for your answer or decision |
| Green | Finished, not yet seen |
| Red | Error |
| No dot | Idle |

Conversations that are running or waiting for you, across all workspaces, are also gathered in the [task panel](/en/features/tasks).

A conversation that doesn't run on the default engine shows a small tag next to its title, such as "Halo" or "Codex". Once a conversation exists, its engine is fixed.

Drag the list's right edge to make it wider or narrower. While the canvas is open, the list shrinks to a strip of small icons; hover one to see its name. On phones and narrow screens, the list is behind the **Conversation history** button in the header.

## Find an earlier conversation {#search}

The conversation list has no search box. To find an earlier conversation, or a sentence in one, use global search:

1. Press <Shortcut mac="⌘ K" other="Ctrl K" />, or click the **Search** icon on the right of the header.
2. Type a keyword. The top of the results jumps straight to matching conversations, Digital Humans, tasks and knowledge bases.
3. To search message text, pick a scope: **Current conversation**, **Current workspace** or **All workspaces**.
4. Click a result. Halo jumps to that message and highlights the matches. Use ↑ (earlier) and ↓ (more recent) on the floating bar to step through results, and <kbd>Esc</kbd> to close it.

| Shortcut | Searches |
|---|---|
| <Shortcut mac="⌘ K" other="Ctrl K" /> | Opens or closes global search |
| <Shortcut mac="⌘ F" other="Ctrl F" /> | The current conversation (desktop app only; in a browser the browser keeps it) |
| <Shortcut mac="⌘ ⇧ F" other="Ctrl Shift F" /> | The current workspace |

## Send messages and choose the send key {#send-key}

By default, <kbd>Enter</kbd> sends and <kbd>Shift</kbd> + <kbd>Enter</kbd> starts a new line. To swap them, open **Settings › Appearance › Send Key** and choose **Ctrl+Enter**: <kbd>Enter</kbd> then adds a line and <kbd>Ctrl</kbd> + <kbd>Enter</kbd> sends.

- On macOS, Ctrl+Enter mode really means the <kbd>Control</kbd> key. <kbd>⌘</kbd> + <kbd>Enter</kbd> doesn't send from the composer.
- On touch devices narrower than 768 px, <kbd>Enter</kbd> always adds a line; send with the button.
- Pressing <kbd>Enter</kbd> while picking a Chinese, Japanese or Korean input-method candidate never sends.
- Unsent drafts are kept per conversation, so they're still there when you come back from another one. They aren't kept after you quit Halo.
- If a send fails, the text, images and references go back into the composer.

Next to the composer you'll also find these, each with its own page:

- **+** ("Add files, context and capabilities"): attach files and images, see [Files and images](/en/features/image-input); turn on switches such as Web Control or Operate Halo, see [Capabilities](/en/features/capabilities).
- **Knowledge**: load knowledge bases into this conversation, see [Knowledge Base](/en/features/knowledge-base).
- The model name left of Send: change this conversation's model and set **Deep Thinking**, see [Models and accounts](/en/features/models).

## Keep adding while Halo works {#queue}

You can keep typing and sending while Halo works. You don't have to wait for the reply to finish. The Send button reads "Add to queue" during this time.

1. Write your addition, such as "make the headings dark blue", and send it.
2. The message appears under the running reply, marked **Queued**.
3. Halo reads it as soon as it finishes its current step. The mark changes to **Appended**, and Halo carries on with the new instruction.

- A queued message can carry text and references, but not images.
- A queued message can't be edited or withdrawn.
- If you press Stop before Halo reads it, the message is marked **Stopped, not handled** and never runs.

## Stop and continue {#stop}

- **Stop**: click the square button next to Send ("Stop generation (Esc)"), or press <kbd>Esc</kbd> in the composer. The running reply and any queued messages stop.
- **Continue**: if a reply breaks off unexpectedly, a "Model response interrupted" card appears. Click **Continue** and Halo picks up where it left off (it sends the message `continue`).

<kbd>Esc</kbd> works in order: if the + panel is open, the first press closes it; in goal mode, the first press leaves goal mode; the next press stops the reply.

The card's text may be in English, for example "Stopped by user." when you stopped after some text was written, or "Reached the maximum turn limit. Send a message to continue." when the step limit was hit; send another message to go on. The limit is **Settings › Advanced › Max Turns per Message**: default 999, range 10–9999.

## Answer Halo's questions {#question-card}

When Halo needs a decision from you, such as which style to use or who to send something to, it pauses and shows a question card at the bottom of the reply, with 1–4 questions. The thought-process header reads "Waiting for user response...", and the conversation's dot in the list turns amber.

1. For each question, pick one or more options. If none fits, click "Other..." and type your own answer.
2. Once every question is answered, click "Submit". The card disappears and Halo carries on.

The card is English-only for now, in every UI language. Halo doesn't ask you to approve each tool it runs; the question card is the only thing that makes it stop and wait for you.

## Point at Digital Humans, files and conversations with @ {#mentions}

Type **@** at the start or after a space to open a menu with three groups:

| Group | Picking an entry |
|---|---|
| **Digital humans** | Hands this message to that Digital Human and starts a new conversation with it (see [Chat with a Digital Human](#digital-human-chat)) |
| **Conversations** | Inserts a link to that conversation, which Halo then reads (see [Conversations that work together](/en/features/cross-conversation)) |
| **Files** | Inserts the path of that file or folder in the workspace |

- A bare @ shows 4 rows per group; keep typing to filter ("Type to see more").
- Use ↑ ↓ to move, <kbd>Enter</kbd> or <kbd>Tab</kbd> to pick, <kbd>Esc</kbd> to close.
- While Halo works, the **Digital humans** group is hidden; you can still reference files and conversations.
- **Reference a conversation** and **Chat with a digital human** under **+ › Context** open the same menu.

## Commands and skills with / {#slash-menu}

Type **/** at the start of a message to list the available commands: **Skill** entries first, then **Built-in** commands. Picking one puts it in the composer for you to finish and send.

- The list comes from the current AI engine and your enabled skills; Halo adds no commands of its own in the chat window. The Codex and DeepSeek engines report no commands, so no menu appears.
- Halo commands such as `/halo-stop` and `/halo-clear` work only in message channels such as WeCom and Feishu; see [Commands and shortcuts](/en/features/commands).

## Read a reply {#reading-replies}

Every reply can be unfolded to show what Halo did:

| What you see | What it is |
|---|---|
| The collapsible thought process above the reply | Halo's thinking, the tools it called and their results. While running, the header names the current action; afterwards it shows "Already thought" and the time taken. With more than 8 steps you can switch to **Full view** |
| **Show tool result** on a step | Opens that step's result: code, search hits, a file list or web content, with a **Copy** button |
| **Task plan** | The checklist Halo writes for bigger tasks, with completed, in-progress and pending counts. Only the latest plan is shown, and you can't tick items yourself |
| A grey number at the bottom right of the reply (such as 12K) | The context size the model saw for this reply. Hover to see "Token usage": Used / limit, Input, Output and more |
| "Context has been intelligently compressed" | The conversation got long, so the engine summarized older context to make room. The earlier messages stay in the transcript for you to scroll back to |
| A retry card, such as "Could not reach the model service" or "The model service is limiting requests" | A model request failed and Halo is counting down to retry, showing which attempt this is. **Stop** on the card gives up |
| A red "Something went wrong" | The reply failed. Look up the exact message in [Error messages](/en/troubleshooting/common-errors) |

- The token tooltip warns "Approaching context limit" at 80 % and "Context will be automatically compressed soon" at 95 %.
- A workspace file path in a reply, such as `src/app.ts:12`, can be clicked to open the file in the canvas at that line. Tables can be opened with **Open in canvas**.
- **Copy message** at the bottom right of a reply copies its raw Markdown. It's the only action on a message: sent messages can't be edited, resent or regenerated. To ask differently, send another message.
- Your own long messages fold; click **Show all** to expand. When you've scrolled up, **Back to latest** takes you to the bottom.

## Reference passages in a reply {#references}

To have Halo work on one specific passage, you don't need to copy and paste it. Point at it instead:

1. Select text in a **finished** reply, or in the canvas: a file, a preview, a diff or terminal output.
2. Two buttons appear next to the selection:
   - **Comment**: write what you want done with this passage ("Comment for the AI…", up to 4,000 characters) and press <kbd>Enter</kbd> to add it.
   - **Add to chat**: reference the passage without a note.
3. References appear as chips above the text box, such as "3 comments" or "2 selections". Open a chip to review it, or click × to remove the whole group (you can undo).
4. Add a few words if you like, then send. A message can also be references only, with no text.

- A message can carry up to 50 references; attached files and folders count too.
- References are numbered in the order you add them, and Halo receives them in that order.
- Long excerpts are shortened: 2,000 characters for files and diffs, 20,000 for terminal output and chat passages.
- In a sent message, click a reference to jump back to its source; Halo tells you if the source has changed.
- Only replies in the main chat can be selected, not the team view or run details.

## Set a goal for a conversation {#goal}

<Badge type="warning" text="Experimental" /> Goals work only with the **Halo SDK** engine. Choose it in **Settings › Advanced › AI Agent Engine**, where it's marked "Experimental". Switching needs a restart and applies to new conversations. See [Agent engines](/en/features/agent-engines).

With a goal set, Halo keeps working toward it, and context compaction never loses it.

1. Click **+** in the composer and choose **Set a goal** under **Context**. The composer enters goal mode and shows a **Goal** chip.
2. Describe the outcome you want. Lines starting with `-`, `*`, `1.` or `[ ]` become "done when" criteria; the other lines are the goal itself.
3. Press <kbd>Enter</kbd> ("Set goal and start").

A goal bar appears above the composer showing "Pursuing goal", "Goal achieved" or "Goal abandoned", where you can edit the goal, start a **New goal** or **Clear goal**. Halo may also update, complete or abandon the goal itself. A message you send while Halo works updates the running goal instead of joining the queue.

Press <kbd>Esc</kbd>, or Backspace in an empty box, to leave goal mode and keep what you typed. Digital Human conversations have no goal.

## Chat with a Digital Human {#digital-human-chat}

You can hand a piece of work to one of your Digital Humans right from the conversation view:

1. Type **@** in the composer and pick a Digital Human, or click **+ › Context › Chat with a digital human**.
2. A chip with its name appears at the left of the composer (hover to see "Chatting with …"), and Halo opens a new conversation with it. Your messages now go to that Digital Human.
3. To switch, click the chip and pick someone else. To go back to Halo, click the × next to it ("Switch back to Halo"). You can't switch while a reply is running.

Picking someone with @ or the chip always starts a new conversation. To continue an earlier one, click it in the **Digital Humans** section of the conversation list; the **+** next to each Digital Human there starts a new conversation with it.

How a Digital Human's conversation differs from an ordinary one:

| | Ordinary conversation | Digital Human conversation |
|---|---|---|
| **Capabilities** switches in +, the **Knowledge** button, **Goal** | Yes | No; the Digital Human's tools and knowledge bases are set in its own settings |
| **Conversations** group in @ | Yes | Only if that Digital Human has **Conversation Collaboration** on |
| Replies signed by | Halo | The Digital Human's name |
| Clearing the history | Delete the conversation | **Clear chat** at the bottom of the transcript, after a confirmation |
| Messages it sends on its own | — | Marked "Sent proactively" |

Reminders are set only in a Digital Human's conversation: tell it "Remind me to hand in the weekly report at 9 tomorrow morning." Ordinary conversations have no reminders. See [Reminders](/en/digital-humans/reminders).

::: done
Your new conversation shows up in the list on the left with your first message as its title, and anything you added while Halo worked is marked "Appended", which means Halo has read it.
:::

## Troubleshooting {#troubleshooting}

### I deleted a conversation by mistake

A deleted workspace conversation can't be recovered. Pin the conversations that matter so they sit in **Pinned**, away from the rest.

### I can't find an earlier conversation in the list

The list has no search. Press <Shortcut mac="⌘ K" other="Ctrl K" /> and search message text in **All workspaces**. The conversation may also be in another workspace; see [Workspaces](/en/features/spaces).

### ⌘ Enter doesn't send on my Mac

Ctrl+Enter mode means <kbd>Control</kbd> + <kbd>Enter</kbd>. You can also switch back to **Enter** in **Settings › Appearance › Send Key**.

### Esc doesn't stop the reply

<kbd>Esc</kbd> works only while the cursor is in the composer. With the + panel open or in goal mode, the first <kbd>Esc</kbd> closes the panel or leaves goal mode, and the second one stops. You can also click the stop button.

### Typing / shows no menu

There's no command menu on the Codex or DeepSeek engine. Also, / must be the first character of the message, with no space after it.

### There's no "Set a goal" under +

The current engine isn't Halo SDK, or you're in a Digital Human's conversation. See [Set a goal for a conversation](#goal).

### I can't add an image to a queued message

Additions sent while Halo works carry only text and references. Wait for the reply to finish, or stop it, then send the image.

### Selecting text in a reply shows no Comment button

You can't reference a reply until it has finished, so wait for it to end. Content in the team view and in run details can't be referenced either.

## Next steps {#next-steps}

- [The task panel](/en/features/tasks): with several conversations open, see in one place which are running and which are waiting for you.
- [Conversations that work together](/en/features/cross-conversation): have one conversation ask another for progress, or hand it a conclusion.
- [Models and accounts](/en/features/models): change a conversation's model and set Deep Thinking.
