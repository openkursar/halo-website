---
title: "Keep Digital Humans running on your computer"
description: "Halo Digital Humans run on your own computer. Set it up so they work on time: closing vs quitting, launch at startup, sleep, notifications and phone access."
type: how-to
audience: [office]
related: [digital-humans/triggers, digital-humans/manage, features/remote-access]
---

# Keep Digital Humans running

Digital Humans work on your own computer; there's no Halo cloud covering for them. "Always on" therefore comes down to two things: the computer is awake, and Halo is running. These are system and Halo settings you change yourself; Halo can't change them for you.

## What it takes {#requirements}

| Condition | Detail |
|---|---|
| The computer is on and not asleep | Halo doesn't stop the computer from sleeping. For Digital Humans to work overnight, turn off automatic sleep in your system settings |
| Halo is running | On macOS and Windows, closing the window is fine; on Linux, closing the window quits Halo |
| Internet access | AI models and the WeCom and Feishu bots need a connection |

Scheduled runs that came due while the computer slept run once when it wakes (even if several were missed). Scheduled runs that came due while Halo was quit are not made up; click **Run now** after opening Halo if you need one. Reminders are different: a reminder that came due while Halo was quit is delivered once the next time Halo opens.

## Closing the window vs quitting Halo {#close-vs-quit}

- **macOS, Windows**: closing the window keeps Halo running in the background, so Digital Humans, schedules and Remote Access keep working. Open Halo again to get the window back.
- **Linux**: closing the window quits Halo and stops all background work. To keep it working, minimize the window instead of closing it.
- **To quit completely**: choose **Quit Halo** in the tray icon menu. If a Digital Human is on duty (it has a schedule or event trigger) or a task is running, Halo warns you first that quitting stops them.

## Launch at startup {#auto-launch}

Open **Settings › System** and turn on **Auto Launch on Startup** ("Automatically run Halo when system starts"). After the computer restarts, your Digital Humans are back on duty by themselves.

This works on macOS and Windows; it has no effect on Linux.

## Get notified when background work finishes {#notifications}

- **Settings › System › Task Notifications**: when on, you're notified when a background task completes (off by default).
- Each Digital Human's own **System Notifications** (under **Capabilities and settings › Messages & Notifications**): **Important** (the default; milestones, questions and outputs), **All** (every run result) or **None**.

When the Halo window is in front, the notice appears inside Halo; otherwise you get a system notification.

## Checking progress when you're away {#away}

- Open Halo from your phone or another computer: see [Remote Access](/en/features/remote-access) and [Halo on your phone](/en/features/mobile).
- Have Digital Humans post results to WeCom, Feishu or WeChat, where their questions also reach you in a direct chat: see [Message channels overview](/en/digital-humans/channels).

## Use one bot on one computer only {#one-computer}

- **WeCom**: if the same bot is enabled in Halo on two computers, the newer connection takes over and the other computer shows "In use on another device" and goes on standby. To switch back, click **Use on this device**.
- **Feishu**: don't connect the same Feishu app on two computers at once, or messages get split randomly between them.

## Need it on 24 hours a day? {#always-on}

If your team has an always-on server, you can deploy Halo Server on it so Digital Humans don't depend on a personal computer. See the [Halo Server quickstart](/en/server/); it suits colleagues with some technical background, or IT.

::: done
After you close the Halo window, your Digital Humans still show **Running** or **Standing by** on the Digital Humans page, and new runs appear on time.
:::

## Troubleshooting {#troubleshooting}

### The overnight runs didn't happen

The computer most likely went to sleep. Turn off automatic sleep in your system settings, or keep the computer awake when you need it. When it wakes, each missed task runs once.

### Digital Humans didn't work after a restart

Check that **Settings › System › Auto Launch on Startup** is on. It has no effect on Linux, where you open Halo by hand.

More cases: [A Digital Human did not run](/en/troubleshooting/digital-humans).

## Next steps {#next-steps}

- [Schedules and triggers](/en/digital-humans/triggers): set when Digital Humans work.
- [Runs and management](/en/digital-humans/manage): see what they did.
