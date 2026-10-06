---
title: "AI Terminal - A Real Terminal You Share with the AI"
description: "Halo's AI Terminal is a persistent interactive terminal that you and the AI see and drive together: log in over SSH and hand over to the AI, run other command-line tools, and keep long tasks going."
---
# AI Terminal

The AI Terminal is a persistent, interactive terminal. The AI runs commands in it, you watch the same terminal live in the canvas on the right, and you can type into it at any time to take over.

Unlike the AI's usual one-command-at-a-time execution, a terminal session stays alive: the login, the current directory and running programs all persist. That makes it a good fit for:

- **Logging in to a server, then handing over**: you complete the SSH login yourself (you type the password or passphrase, so it never appears in the conversation), then the AI continues in the same session.
- **Driving other command-line tools**: interactive installers, database shells, other AI CLIs.
- **Long tasks**: builds, deployments and downloads that take a while — the AI can come back later to check the result.

The AI can keep several terminals open at once (up to 12 running at the same time), for example one per machine.

---

## Turning It On

**Let the AI use terminals**: turn on **AI Terminal** in the composer's **+** menu. The AI also asks you to turn it on when it needs a terminal. Once it is on, the AI decides when to open a terminal, type commands and read the output.

**Open a terminal yourself first**: choose **More** at the top → **Open terminal** to open a terminal in the current space's directory. Log in or set things up there, then ask the AI to carry on in that terminal (AI Terminal must be on).

::: info In 2.1.x
In 2.1.x, turn on **Terminal** in the composer's **Tools** menu; the **Open terminal** button is in the file panel on the right.
:::

<!-- Screenshot placeholder: screenshot-ai-terminal.png (a terminal in the canvas and the running-sessions strip above the composer) -->

---

## How It Fits into the App

- **Viewing in the canvas**: when the AI uses a terminal, a card appears in the conversation; click **Open terminal** to open it in the canvas. You can type into it directly, and **Ctrl+C** always reaches the terminal.
- **Running sessions**: terminals the AI is using appear in the running-sessions strip above the composer, where you can open them or **Stop** them.
- **Closing a tab is not the same as ending the process**: when you close the tab of a running terminal the AI has used, Halo asks whether to **Keep running in background** (the AI can keep using it) or **Close completely** (ends the process). A running terminal you opened yourself and the AI never used ends when you close its tab.
- **Lifetime**: switching models, starting a new conversation or collapsing the canvas does not affect a running terminal. All terminals end when Halo quits.
- **Remote access**: when you use Halo through remote access, you can view terminals and type into them as well.
- **Digital humans**: once **AI Terminal** is allowed in a digital human's settings, it can use terminals too. Terminals it opens also show up in the running-sessions strip and can be stopped at any time.

---

## Which Shell It Uses

- **macOS**: your default login shell (usually zsh).
- **Windows**: PowerShell, so that `ssh` is Windows' built-in OpenSSH, which is more stable on virtual desktops and similar network setups.

---

## Notes

::: warning The AI Terminal can run any command
It has the same reach as the AI's usual command execution: the AI can run any command on your computer. When connected to an important server, keep an eye on what the AI is doing, and take over or stop the terminal when needed.
:::

::: info Platform support
The AI Terminal is available on macOS and Windows. The Linux build does not include it yet.
:::
