---
title: "Install and launch problems: fixes for Halo"
description: "When Halo won't install, open or get past first launch: system requirements, Mac and Windows security prompts, Windows first-time setup, Linux AppImage, logs."
type: how-to
audience: [beginner]
related: [getting-started/install, getting-started/setup-ai, troubleshooting/common-errors]
---

# Install and launch problems

You can't ask Halo for help before it's installed and running, so work through the cases below.

## System requirements {#requirements}

| System | Requirement | If yours is older |
|---|---|---|
| macOS | macOS 12 or later, Apple silicon or Intel | Older Macs stay on Halo 2.x |
| Windows | 64-bit (x64) | There's no ARM build |
| Linux | 64-bit (x64), glibc 2.34 or later (for example Ubuntu 22.04, Debian 12) | Systems with an older glibc stay on 2.1.15 |

## Mac says Halo "can't be opened" or the developer "can't be verified" {#macos-blocked}

Halo from the official site is notarized by Apple, so you only see the usual "downloaded from the Internet" check; click **Open**. If you see "can't be opened" or "can't be verified", the copy most likely came from somewhere else or was built from source. If you trust the file:

1. Open **System Settings › Privacy & Security**.
2. Scroll to the message about Halo, click **Open Anyway**, and enter your password if asked.
3. Open Halo again.

## Windows says "Windows protected your PC" {#smartscreen}

The Windows installer isn't code-signed, so SmartScreen steps in. Click **More info**, then **Run anyway**.

## Windows shows "First-time setup required" on first launch {#git-bash}

Halo uses Git Bash to run commands (such as git, npm or pip). If none is found, this page appears on first launch:

- Choose **Auto download and install** (recommended) and click **Continue**. Git Bash is bundled in the installer, so no internet is needed; once it says "Initialization complete", Halo opens.
- **Skip, install manually later** works too, but the AI can't run system commands; it can only chat and write files.

### It says "Initialization failed" {#git-bash-failed}

1. Click **Retry** first.
2. If that fails, click **Download and install manually**, download and install Git for Windows from the page that opens, then reopen Halo; it finds Git by itself.
3. To get started anyway, click **Skip, use with limited functionality**.

### After skipping {#git-bash-skipped}

Halo runs in "Limited functionality mode", and the workspace page shows "Command execution environment is not installed, AI cannot run system commands" at the top. Click **Install now** whenever you like; a Git you install yourself later is picked up automatically too.

## Linux: the AppImage won't open {#linux}

- There's only an x64 AppImage; no deb or rpm.
- After downloading, make the file executable: run `chmod +x Halo-*.AppImage` in a terminal, or tick "Allow executing file as program" in the file's properties, then double-click it.
- If it quits right after opening, check that your glibc meets the [system requirements](#requirements).
- On Linux, closing the window quits Halo, and Digital Humans' scheduled tasks stop too.

## Nothing happens when you open it, or there's no window {#no-window}

- On macOS and Windows, Halo keeps running in the background after you close the window. Opening Halo again brings the window back; on Windows you can also click the Halo icon in the system tray.
- To restart it completely, choose **Quit Halo** in the tray icon menu, then open it again.
- If that doesn't help, restart the computer and try again.

## It keeps showing "Welcome to Halo" {#stuck-on-welcome}

Until an AI model is connected (and unless you clicked **Skip for now**), Halo comes back here each time it opens. Connect one as in [Connect an AI model](/en/getting-started/setup-ai), or click **Skip for now** to look around first.

## Where the logs are {#logs}

When you ask someone for help, logs help a lot. In Halo, open **Settings › System › Log Files** and click **Open Folder**. If Halo won't open, look for `main.log` in these folders:

| System | Log folder |
|---|---|
| macOS | `~/Library/Logs/halo` |
| Windows | `%APPDATA%\halo\logs` |
| Linux | `~/.config/halo/logs` |

Before you send a log, skim it for anything you'd rather not share. For more about logs, see [Logs and diagnostics](/en/troubleshooting/diagnostics#logs).

::: done
When Halo opens to "Welcome to Halo" or "What do you want to do today?", installation and launch are fine.
:::

## Next steps {#next-steps}

- [Install Halo](/en/getting-started/install): the full installation steps.
- [Error messages](/en/troubleshooting/common-errors): look up a message you see.
