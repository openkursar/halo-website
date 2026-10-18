---
title: "Commands and shortcuts: slash, IM and keyboard"
description: Commands and shortcuts in Halo — the / menu in chat, IM commands that stop or clear a Digital Human's bot chat, and every keyboard shortcut and send key.
type: reference
audience: [beginner, office, developer]
related: [features/conversations, digital-humans/channels, features/code-review]
---

# Commands and shortcuts

Commands live in two places: the **/** menu in the Halo window, and IM commands you send to a Digital Human's bot in WeCom, Feishu or WeChat. The two sets don't mix. You don't need commands for everyday work: tell Halo in plain words what you want. Keyboard shortcuts work only inside the Halo window. Halo has no system-wide global shortcuts.

## Slash commands (Halo window) {#slash-commands}

Type **/** at the start of a message to open a list with two groups, **Skill** and **Built-in**. Pick an entry and Halo puts `/command` plus a space into the box for you to finish and send.

- **Skill**: the [skills](/en/features/skills) you have enabled. Clicking **Use** on a skill also fills in its command and shows its argument hint.
- **Built-in**: the commands the current [agent engine](/en/features/agent-engines) reports. Halo adds no commands of its own to the chat window, and there is no fixed list.

Which commands you see depends on the engine:

| AI Agent Engine | / menu |
|---|---|
| Claude Code SDK (default) | Lists the commands the engine reports, plus your skills |
| Halo SDK <Badge type="warning" text="Experimental" /> | Lists the commands the engine reports, plus your skills |
| Codex SDK, DeepSeek dsh | Report no commands, so no menu appears |

To see what is available right now, type **/** and read the list:

- Matching ignores case, and entries that start with what you typed come first. Eight rows show at a time; scroll for more.
- Use ↑ ↓ to move, <kbd>Enter</kbd> to pick and <kbd>Esc</kbd> to close.
- The menu opens only while the message starts with / and has no space or line break.
- Before a new conversation's first reply, the list may be empty or show every entry as **Built-in**. It updates once the first reply arrives.
- Picking a command while in goal mode leaves goal mode.

Commands such as `/compact` exist only when the engine reports them. A manual compaction shows "Context has been intelligently compressed" in the conversation without a token count; automatic compactions add the count.

IM commands such as `/halo-stop` and `/halo-clear` do nothing in the Halo window:

- To stop a reply, press <kbd>Esc</kbd> or click the square button. See [Stop and continue](/en/features/conversations#stop).
- To clear a Digital Human's chat, click **Clear chat** at the bottom of the conversation, then **Confirm** in "Clear all chat history?".
- An ordinary conversation has no clear. To start over, create a new conversation.

## IM commands (to a Digital Human's bot) {#im-commands}

Send these commands to a Digital Human's bot in WeCom, Feishu or WeChat to make it stop or start over. To connect a bot, see [Message channels](/en/digital-humans/channels).

| What it does | Commands (any one) | Bot reply |
|---|---|---|
| Stop the current reply | `/halo-stop`, `/halo-cancel`, `/stop` | "Generation stopped."; when nothing is running, "No active generation to stop." |
| Clear the context and start a fresh conversation | `/halo-clear`, `/halo-reset`, `/clear` | "Context cleared. Starting a fresh conversation." |

- Commands ignore case and surrounding spaces.
- The bot's replies are in English only.
- In a direct chat, send the command on its own.
- In a group, @mention the bot and put the command **last**, for example `@Ops Assistant /stop`. Bot names with spaces work too. Any text after the command turns it into an ordinary message.
- A WeCom group passes the bot only messages that @mention it, and a Feishu group requires the @mention by default. Personal WeChat supports direct chats only.

### What stop does {#im-stop}

- Interrupts the reply the Digital Human is writing in this chat.
- The chat history and context stay, so your next message carries on from there.

### What clear keeps {#im-clear}

| Cleared | Kept |
|---|---|
| The reply in progress | The Digital Human's [memory](/en/features/memory) |
| This chat's conversation history on the Halo side; the next message starts a fresh conversation | [Reminders](/en/digital-humans/reminders) set in this chat |
| Messages you sent while the bot was busy that it has not handled yet | The chat history inside WeCom, Feishu or WeChat itself |

- Only the chat you send it in is affected (that person's direct chat, or that group). Other chats with the same bot keep their context.
- When a team member answers the bot, `/clear` ends only this chat's current team conversation. Other chats keep theirs.
- To clear all of a Digital Human's conversations at once, use **Clear all conversations** in its **Capabilities and settings › Advanced › Danger zone**. IM chats answered by a team are not included; send `/clear` in those chats.

### Answering a Digital Human's question: just reply, no command {#answer-in-im}

Halo 3.0.4 has no `/answer` command. The "`/answer` plus a number and an option" form taught by older docs no longer works.

When a Digital Human needs your decision, the question arrives in your direct chat with the bot. The message is in Chinese: it starts with 「「name」的任务需要你决定：…」 ("name's task needs your decision"), lists options A, B and so on, and ends with 「直接回复我就行，也可以在 Halo 里回答。」 ("just reply to me, or answer in Halo").

Reply in plain words, such as "B" or "East region, please". The Digital Human picks up the answer and carries on with that work. You can also answer in Halo; see [Answer its questions](/en/digital-humans/manage#answer-questions). For who receives these questions, see [Owner and guest permissions](/en/digital-humans/permissions).

## Keyboard shortcuts {#shortcuts}

These shortcuts work in the Halo window. On Windows and Linux, <kbd>Ctrl</kbd> usually replaces <kbd>⌘</kbd>; exceptions are noted in the tables.

### Search {#shortcuts-search}

| macOS | Windows / Linux | What it does | Where it works |
|---|---|---|---|
| <kbd>⌘</kbd> <kbd>K</kbd> | <kbd>Ctrl</kbd> <kbd>K</kbd> | Open or close the search and command palette: jump to conversations, Digital Humans, tasks and knowledge bases, or search messages | Everywhere |
| <kbd>⌘</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>F</kbd> | Search the current conversation | Desktop app only; the web client leaves this key to the browser |
| <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>F</kbd> | Search the current workspace | Everywhere |

After you open a search result, a highlight bar appears: ↑ for earlier matches, ↓ for more recent ones, <kbd>⌘</kbd> <kbd>K</kbd> / <kbd>Ctrl</kbd> <kbd>K</kbd> to edit the search, <kbd>Esc</kbd> to close. See [Find an earlier conversation](/en/features/conversations#search).

### Canvas and tools {#shortcuts-canvas}

| macOS | Windows / Linux | What it does | Where it works |
|---|---|---|---|
| <kbd>⌘</kbd> <kbd>T</kbd> | <kbd>Ctrl</kbd> <kbd>T</kbd> | Open a new [AI Browser](/en/features/ai-browser) tab in the canvas | Conversation view, even with the canvas closed |
| <kbd>⌘</kbd> <kbd>W</kbd> | <kbd>Ctrl</kbd> <kbd>W</kbd> | Close the current canvas tab | Canvas open |
| <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>W</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>W</kbd> | Close all canvas tabs | Canvas open |
| <kbd>⌃</kbd> <kbd>Tab</kbd> / <kbd>⌃</kbd> <kbd>⇧</kbd> <kbd>Tab</kbd> | <kbd>Ctrl</kbd> <kbd>Tab</kbd> / <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Tab</kbd> | Next / previous canvas tab | Canvas open |
| <kbd>⌘</kbd> <kbd>1</kbd>–<kbd>9</kbd> | <kbd>Ctrl</kbd> <kbd>1</kbd>–<kbd>9</kbd> | Jump to canvas tab 1–9 | Canvas open |
| <kbd>Esc</kbd> | <kbd>Esc</kbd> | Collapse the canvas back to the chat | Canvas open, unless a menu or viewer inside it used the key first |
| <kbd>⌘</kbd> <kbd>S</kbd> | <kbd>Ctrl</kbd> <kbd>S</kbd> | Save | While editing in the canvas code editor or the goal editor |
| <kbd>⌃</kbd> <kbd>C</kbd> | <kbd>Ctrl</kbd> <kbd>C</kbd> | Always goes to the terminal and interrupts the running command; it doesn't copy, even with text selected. To hand output to the AI, select it and click **Add to chat**; see [Share one terminal with the AI](/en/features/ai-terminal#shared-session) | [AI Terminal](/en/features/ai-terminal) tab |
| <kbd>⌃</kbd> <kbd>⇧</kbd> <kbd>G</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>G</kbd> | Open **Changes** | Conversation view; on macOS this is the Control key, not Command |

### Display size <Badge type="info" text="Desktop only" /> {#shortcuts-zoom}

| macOS | Windows / Linux | What it does |
|---|---|---|
| <kbd>⌘</kbd> <kbd>+</kbd> (or <kbd>⌘</kbd> <kbd>=</kbd>) | <kbd>Ctrl</kbd> <kbd>+</kbd> (or <kbd>Ctrl</kbd> <kbd>=</kbd>) | Make the interface bigger |
| <kbd>⌘</kbd> <kbd>−</kbd> | <kbd>Ctrl</kbd> <kbd>−</kbd> | Make the interface smaller |
| <kbd>⌘</kbd> <kbd>0</kbd> | <kbd>Ctrl</kbd> <kbd>0</kbd> | Reset to 100% |

- Range 50%–150% in 10% steps, default 100%. The size survives restarts.
- Stays in sync with the slider in **Settings › Appearance › Display Size**. See [Settings reference](/en/features/settings#appearance).
- The Remote Access web and Android clients don't have this; use the browser's own zoom.

## Composer keys {#composer-keys}

| Key | Default mode (Enter sends) | Ctrl+Enter mode |
|---|---|---|
| <kbd>Enter</kbd> | Send | New line |
| <kbd>Shift</kbd> <kbd>Enter</kbd> | New line | — |
| <kbd>Ctrl</kbd> <kbd>Enter</kbd> | — | Send; on macOS this is the Control key too, and <kbd>⌘</kbd> <kbd>Enter</kbd> does not send |
| <kbd>Esc</kbd> | Stop the current reply ("Stop generation (Esc)") | Same |

- To switch modes, open **Settings › Appearance › Send Key** and choose **Enter** or **Ctrl+Enter**.
- You can send while Halo is working. The send button then reads "Add to queue", and the message reaches Halo right after its current step. See [Keep adding while Halo works](/en/features/conversations#queue).
- <kbd>Esc</kbd> order: with the + panel open, the first press closes the panel; in goal mode, it first leaves goal mode and keeps your text; the next press stops the reply.
- Pressing <kbd>Enter</kbd> while picking a Chinese, Japanese or Korean IME candidate never sends.
- On touch devices narrower than 768 px, <kbd>Enter</kbd> always adds a new line; send with the button.
- Type **/** for the command menu and **@** for the Digital Humans, conversations and files menu. Both use ↑ ↓ to move and <kbd>Esc</kbd> to close.

Keys in **Changes**:

| Key | What it does |
|---|---|
| <kbd>F7</kbd> / <kbd>Shift</kbd> <kbd>F7</kbd> | Next change / previous change |
| <kbd>[</kbd> / <kbd>]</kbd> | Step through items on a detail page |
| <kbd>Esc</kbd> | Close the drawer or detail page |
| <kbd>⌘</kbd> <kbd>↵</kbd> (macOS) / <kbd>Ctrl</kbd> <kbd>Enter</kbd> | Commit from the commit message box |

See [Changes and code review](/en/features/code-review).

## Related {#related}

- [Conversations](/en/features/conversations): how sending, stopping, queueing and the / menu work in a conversation
- [Message channels](/en/digital-humans/channels): connect a Digital Human to WeCom, Feishu or WeChat, where IM commands apply
- [Changes and code review](/en/features/code-review): review and commit once **Changes** is open
