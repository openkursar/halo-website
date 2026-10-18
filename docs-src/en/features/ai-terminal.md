---
title: "AI Terminal: a real terminal you share with the AI"
description: Halo's AI Terminal is a real terminal you and the AI share. Log in over SSH and hand over, run long jobs or drive REPLs. On macOS and Windows.
type: how-to
audience: [developer]
platforms: [macos, windows]
related: [features/capabilities, features/ai-browser, getting-started/install]
---

# AI Terminal

::: say
> SSH into the test server and check the logs

If **AI Terminal** is off, the AI asks you in one line to turn it on, and Halo opens the composer's **+** panel with that switch highlighted. Turn it on and send another message. The AI then opens a terminal, and you watch every command it types in the canvas on the right. If a password is needed, you type it into the terminal yourself.

**Prerequisite**: turn on **AI Terminal** under the composer's **+ › Capabilities** (off by default). The AI can only ask; it can't turn the switch on itself.
:::

## Before you start {#before-you-start}

::: warning Caution
The AI Terminal is available on macOS and Windows only. The Linux version has no AI Terminal: there's no such switch under **+ › Capabilities**, and the **More** menu has no **Open terminal**.
:::

The AI Terminal isn't how the AI usually runs commands. The AI can always run one-off commands such as `git status` or `npm install` with its own command tool, with no switch to turn on.

The AI Terminal is for work that has to stay open: the login, the current directory and running programs all persist. It suits SSH, database shells and REPLs such as Python, interactive installers, other AI command-line tools, and long builds or deployments.

| I want to… | Use |
|---|---|
| Have the AI run a command and look at the result | Just ask; no switch needed |
| Log in to a server, then let the AI carry on | AI Terminal; see [Log in to a server, then hand over](#ssh) |
| Run something that takes a while and check back later | AI Terminal; see [Run long tasks](#long-tasks) |
| Work step by step in a REPL or an interactive tool | AI Terminal |

## Turn on AI Terminal {#turn-on}

1. In the conversation composer, click **+** (tooltip "Add files, context and capabilities").
2. In the **Capabilities** group, find **AI Terminal**, described as "Interactive terminal you share with AI: SSH, other CLIs, long tasks".
3. Turn it on. It applies from your next message. From then on the AI decides when to open a terminal, type commands and read the output.

- The switch belongs to each conversation. New conversations use the set of switches you last flipped. The other switches are on [Capabilities](/en/features/capabilities).
- In a chat with a Digital Human, the **+** panel has no capability switches. A Digital Human has its own switch: **Capabilities and settings › Model & Capabilities › AI Terminal** ("Allow this app to run shell commands and interactive terminals"), on by default. See [Digital Human capabilities and settings](/en/digital-humans/capabilities).
- Guests who reach a Digital Human through WeCom, Feishu or another chat app can't use terminals unless you allow it in [Permission Control](/en/digital-humans/permissions).

::: info In 2.1.x
In 2.1.x, turn on **Terminal** in the composer's **Tools** menu; the **Open terminal** button is in the file panel on the right.
:::

## Open a terminal yourself {#open-terminal}

To log in or set things up yourself before handing over to the AI, open a terminal yourself:

1. In the conversation header, click **⋯ More › Open terminal** ("Current workspace directory"). In a narrow window, the same item is in the overflow menu.
2. The terminal opens in the canvas on the right, starting in the current workspace's folder.
3. Type commands as usual. Once **AI Terminal** is on, the AI can carry on in this terminal.

After the AI uses a terminal, a terminal card appears in the conversation, showing "Started a terminal session", the command it typed or "Read terminal output". Click **Open terminal** on the card to open that terminal in the canvas.

## Share one terminal with the AI {#shared-session}

The AI Terminal is a real terminal, not a log of commands. You and the AI see the same screen, and both of you can type into it.

- **Take over at any time**: just type in the terminal in the canvas. <kbd>Ctrl</kbd> <kbd>C</kbd> always goes to the terminal, so you can interrupt the running command.
- **See who's typing**: while the AI is typing, the terminal gets a highlighted border.
- **Hand output to the AI**: select some output in the terminal and click **Add to chat**. It goes into the composer as a reference; see [Reference part of a reply](/en/features/conversations#references).
- **Current workspace only**: the AI can see and drive only the terminals of the current workspace, including the ones you opened.
- **Limit**: up to 12 terminals can run at once. The AI can open several, for example one per machine.
- **Look**: the terminal follows Halo's light or dark theme as you switch. The light theme uses darkened colors so yellow and similar text stays readable. The font is 13 px, with 10,000 lines of scrollback.
- **Reopen**: close the canvas or switch tabs, and when you come back the terminal replays its recent output, colors included.

### What the AI can do with a terminal {#ai-tools}

| AI action | What it means |
|---|---|
| Open a terminal | Optionally with a start folder and a title; by default in the current workspace's folder |
| List terminals | See this workspace's terminals, who opened each, and how long each has been idle |
| Type and wait | Presses Enter for you and reads the output once it settles |
| Read output | Reads new output, the current screen, or the history |
| Search the history | Finds text such as an error in the output history |
| Wait for some text | For example "build finished"; up to 10 minutes per wait |
| Close a terminal | Ends that terminal's process |

Each read gives the AI at most 2,000 lines or 50 KB of output. Halo injects nothing into your shell prompt.

::: danger Warning
The AI can run any command in the terminal, and nothing asks you to confirm each one; see [Tool permissions](/en/advanced/security#tool-permissions). On an important server, keep an eye on what the AI does. Take over in the terminal or stop it from the active sessions when needed.
:::

## Log in to a server, then hand over {#ssh}

1. Turn on **AI Terminal**, then ask the AI to open a terminal, or open one yourself with **⋯ More › Open terminal**.
2. Log in yourself in the terminal with `ssh`, for example `ssh deploy@example.com`. You type the password or key passphrase into the terminal, so it never appears in the conversation.
3. When the server's prompt appears, tell the AI in the conversation what to do next, for example "Check the latest error logs in the terminal I just logged in to". The AI carries on in the same terminal.

- For several machines, open one terminal per machine.
- Don't paste passwords into the conversation for the AI to type.
- On Windows the terminal opens PowerShell by default, so `ssh` is Windows' built-in OpenSSH. Nothing else is needed.

## Run long tasks {#long-tasks}

Builds, deployments, downloads and other slow jobs can run in the AI Terminal:

1. Ask the AI to start the job in a terminal, for example "Run a full build in the terminal and tell me the result when it's done".
2. The AI waits for some output to appear, or comes back to read the output later. Meanwhile you can keep adding to the conversation.
3. When the job ends, the AI reads the result and tells you.

Running terminals the AI has used appear in the active-sessions strip above the composer, showing the terminal's title or a count such as "2 sessions running". Click it for the **Active sessions** list, where each row has **Open** and **Stop**. Before stopping, Halo asks "Stop this session?" with "The running process will be terminated."

How long terminals run:

| When you… | The terminal |
|---|---|
| Switch models, collapse the canvas or move to another conversation | Keeps running |
| Switch to another workspace | Keeps running; its tab stays parked and is there when you return |
| Quit or restart Halo | All terminals end and aren't restored |

## Close a terminal tab {#close-tab}

Closing a tab and ending the process are separate. When you close a terminal tab with its ×, a middle-click, <Shortcut mac="⌘ W" other="Ctrl W" /> or the context menu:

| Terminal | On closing the tab |
|---|---|
| Already ended | The tab just closes |
| Opened by you, never used by the AI, still running | The terminal ends with the tab |
| Used by the AI (opened by the AI, or yours after the AI drove it), still running | Halo asks "This terminal has been used by AI" with "Keeping it in the background lets the AI keep using it; closing completely ends the process." |

In that prompt, choose:

- **Keep running in background**: the tab closes and the process keeps running. The AI can still use it, and you can reopen it from the active sessions.
- **Close completely**: ends the process.
- **Cancel**: does nothing.

Closing all tabs at once or removing a workspace doesn't ask: your own terminals end, and terminals the AI has used keep running in the active sessions.

## Terminals run in a separate process {#separate-process}

All terminals run in their own background process, not in the process of Halo's main window.

- If a shell starts slowly or hangs (for example while antivirus software scans it), the Halo window doesn't freeze with it.
- That background process starts the first time you use a terminal, so it doesn't slow down Halo's start.
- When a command floods output, Halo paces the screen updates so the interface keeps up.
- If that process crashes, every running terminal ends. Their tabs show "Session ended (output no longer available)" and are read-only. The next terminal you open starts a fresh process; the old terminals aren't revived.

## Platforms and shells {#platforms}

| Platform | AI Terminal | Default shell |
|---|---|---|
| macOS | Yes | Your default login shell (usually zsh), with your prompt and aliases loaded; `/bin/bash` if none is set |
| Windows | Yes | PowerShell |
| Linux | No | — |

- **Windows doesn't need Git Bash**: the AI Terminal opens PowerShell by default and works without Git Bash. Git Bash is what the Claude Code engine uses for its own commands and has nothing to do with the AI Terminal. To install it, see [Install Halo › Set up the command environment](/en/getting-started/install#git-bash).
- **Remote Access and phones**: when you use Halo through [Remote Access](/en/features/remote-access) or the Android app, you can open terminals and type into them too, as long as the computer running Halo is a Mac or Windows PC. On screens narrower than 640 px, a key bar appears under the terminal: Esc, Tab, Ctrl+C and the arrow keys.
- **Digital Humans**: a Digital Human's **AI Terminal** switch also works only on macOS and Windows.

::: done Done
A terminal shows in the canvas, its border lights up while the AI types, and a "Started a terminal session" card appears in the conversation. The AI Terminal is working.
:::

## Troubleshooting {#troubleshooting}

### AI Terminal isn't in the composer's +

- You're on the Linux version, which has no AI Terminal.
- You're chatting with a Digital Human. Its switch is under its **Capabilities and settings › Model & Capabilities**.

### The AI says it needs a terminal, but the switch is on

The switch applies from the next message. After turning it on, send another message, such as "It's on, go ahead".

### The AI says the terminal limit is reached

At most 12 terminals can run at once; opening another fails with `Terminal session limit reached (12). Close a session first.` **Stop** terminals you don't need in the **Active sessions** above the composer, or close tabs of terminals you opened yourself, then open a new one.

### The terminal shows "Session ended (output no longer available)"

Halo was restarted, or the terminals' background process crashed, so the old terminal has ended. Open a new one with **⋯ More › Open terminal**, or ask the AI to open one.

### The terminal keeps running after I closed its tab

The AI has used that terminal, and you chose **Keep running in background**. Click **Stop** for it in **Active sessions** to end it.

### Does the AI Terminal work on Windows without Git Bash?

Yes. The AI Terminal uses PowerShell by default. Without Git Bash, only the Claude Code engine's own commands are affected; see [Install Halo › Set up the command environment](/en/getting-started/install#git-bash).

## Next steps {#next-steps}

- [Capabilities](/en/features/capabilities): see the other per-conversation switches, their defaults and when changes apply
- [AI Browser](/en/features/ai-browser): hand web work to the AI; you share the same page in the same way
- [Remote Access](/en/features/remote-access): watch and use terminals from a browser or your phone when you're away from the computer
