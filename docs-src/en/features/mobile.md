---
title: "Halo on your phone: Android app and phone browser"
description: "Connect the Halo Android app or your phone's browser to Halo on your computer: check progress, send messages and answer Digital Humans on the go."
type: how-to
audience: [beginner]
platforms: [android, web]
prerequisites: [features/remote-access]
related: [features/remote-access, server/, features/conversations]
---

# Halo on your phone

Phone connections and Remote Access settings are not open to the AI, so Halo can't turn on Remote Access or add a device for you. Follow the steps below yourself.

There are two ways to use Halo on a phone:

| I want to… | Use this |
|---|---|
| Use an Android phone every day, keep several computers saved and get notified while the app is in the background | [Android app](#android-app) |
| Skip installing an app, or I have an iPhone | [Phone browser](#phone-browser) |

Both open the same Halo that runs on your computer: the same conversations, workspaces, Digital Humans and knowledge bases. The phone is a remote control. The AI does not run on the phone; model calls, file changes and commands all happen on the computer.

## Before you start {#before-you-start}

- **Remote Access is on on the computer**: in the Halo desktop app, open **Settings › Remote Access › Enable Remote Access**. See [Turn on Remote Access](/en/features/remote-access#turn-on). The phone has no such setting.
- **The computer stays on and Halo keeps running**: if the computer is off or asleep, or Halo has quit, the phone can't connect. On macOS and Windows, closing the window leaves Halo running in the background; on Linux, closing the window quits Halo. To keep it available, see [Keep Digital Humans running](/en/digital-humans/keep-running).
- **The phone can reach the computer**: on the same Wi-Fi, use the **LAN Address**. On another network, first turn on [internet access](/en/features/remote-access#internet-access) on the computer and use the **Permanent Address**.
- **Have the access password ready**: on the computer, open **Settings › Remote Access › Access Password**, click **Copy** and send it to your phone. The password is case-sensitive, so pasting is safer than typing.

You can also connect to a [Halo Server](/en/server/) the same way. See [Connect several computers](#several-computers).

## Android app {#android-app}

The Android app suits everyday use on a phone: it saves several computers, stays connected in the background and notifies you when work finishes.

| Item | Details |
|---|---|
| Requirement | Android 7.0 or later |
| Package | an `.apk` file that you install on the phone by hand |
| What it does | connects to the Halo on your computer or to a Halo Server; it runs no AI itself |

<!-- public:start -->
The installer is in the [download section of the Halo website](https://hello-halo.cc/#download); pick the Android one. For file names for every system, see [Install Halo](/en/getting-started/install#download).
<!-- public:end -->

### Connect to your computer {#connect}

1. Open the app. The first time, it shows **Connect to your desktop**.
2. In **Server address**, enter the address shown on the computer, for example `192.168.1.100:3456` (the field's own example). You find it in **Settings › Remote Access** on the computer: the **LAN Address** on the same Wi-Fi, the **Permanent Address** elsewhere. If you leave out `http://`, the app adds it.
3. Tap **Connect**. The app checks that Halo is running at that address, waiting up to 10 seconds.
4. The second step, **Access code** (placeholder "PIN or password"), wants the computer's **Access Password**. Paste it and tap **Continue**. **Continue** stays disabled below 8 characters.
5. Once the code is accepted, the app opens Halo with the computer's conversations.

If the address was wrong, tap **Change** next to it in the second step and enter it again.

**Scan a QR code instead of typing the address**: while the computer has [internet access](/en/features/remote-access#internet-access) running, **Settings › Remote Access** shows a **Scan to Access** QR code. In step 2, tap **Scan QR Code** and, as the app says, "Point your camera at the QR code on your desktop Halo". The address is filled in for you; then enter the access code as usual. The app asks for camera permission the first time.

- The LAN address has no QR code; type it.
- The QR code holds only the address, not the password, so you still enter the access code.

::: done
The app opens Halo and shows the conversations already on the computer. Next time you open the app, it connects to this computer by itself.
:::

### Background connection and notifications {#notifications}

- **Stays connected in the background**: after you log in, the app keeps a low-priority notification, "Halo · Connected to desktop", in the notification bar. It keeps the connection alive in the background and restarts itself if Android stops it. The connection ends only when you switch to another computer.
- **Notification permission**: the app asks for it on first run. Allow it.
- **When it notifies**: only while the app is in the background. It does not interrupt you while it is open.

| Notification | When it appears |
|---|---|
| "Task Complete" · "Your AI task has finished." | an AI reply finishes on this computer |
| "App Complete" · "A digital human has finished running." | a Digital Human finishes a run |
| "Action Required" + the question, or "A digital human needs your input." | a Digital Human has a question for you |

"Task Complete" covers every conversation on that computer, not only the one open on your phone. So you also get it for work started on the computer or by a Digital Human.

Halo uses no push service; the app sends these notifications itself. If Android still stops the app, notifications don't arrive. When you open the app again, it catches up on what you missed.

### More about the Android app

- **Back button**: on Settings, Digital Humans, the knowledge base and similar pages, it goes back to the workspace; on the add-device screen, it goes back to the device list. It never exits the app.
- **The connection is not encrypted on the LAN**: the LAN address uses `http://`. On public Wi-Fi or away from the office, use the HTTPS permanent address from internet access.
- **The app keeps passwords on the phone**: each computer's access password is saved on this phone. Before you hand the phone to someone else, remove those computers from the [device list](#several-computers).

## Connect several computers {#several-computers}

The app can save several computers or Halo Servers and switch between them.

1. Inside Halo, tap the monitor icon at the top right (on wider screens the current computer's name shows next to it). You're back at **My Devices** ("Select a device to connect").
2. Each computer shows **Online** or **Offline**. Tap an **Online** one to switch to it.
3. To add one, tap **Add Device**, and on **Add a new device** enter the address and access code as in [Connect to your computer](#connect).

About the device list:

| Item | Details |
|---|---|
| Name | taken from the address's host name (for example `192.168.1.100`); it can't be renamed |
| Adding the same address again | doesn't add a second entry; it only updates the saved access password |
| Remove | swipe the card left, tap the delete button that appears, then **Remove** in "Remove this device?" |
| The computer's access password changed | the app returns to **My Devices**; add the computer again with the new password |

**Connect to a Halo Server**: a [Halo Server](/en/server/) is Halo running without a window in a Linux container. When adding the device, enter its address (default port `8080`, for example `http://example.com:8080`) and, as the access code, the `HALO_REMOTE_PASSWORD` set at deployment. That password needs at least 8 characters, or the app can't log in. To deploy one, see the [Halo Server quickstart](/en/server/).

## Phone browser {#phone-browser}

If you'd rather not install the app, or you use an iPhone, open Halo in your phone's browser.

1. In the phone's browser, open the address shown on the computer: the **LAN Address** on the same Wi-Fi (for example `http://192.168.1.100:3456`); elsewhere the **Permanent Address**, or scan the **Scan to Access** QR code with the phone camera.
2. An English login page, "Halo Remote Access", appears.
3. In the field (placeholder "Access Code"), enter the computer's **Access Password** and tap **Connect**.
4. After "Connected! Loading...", Halo opens.

::: done
Halo appears in the browser with the computer's conversations. The browser remembers the login, so next time the same address opens without the password.
:::

How the phone browser differs from the Android app:

| | Android app | Phone browser |
|---|---|---|
| Several computers | a **My Devices** list | one address per computer; bookmark them |
| Connect by QR code | **Scan QR Code** inside the app | scan with the phone camera to open the address |
| Stays connected in the background | yes | no; reconnects when you return to the browser |
| System notifications | yes, while the app is in the background | no |

The "Halo Remote Access" login page is English only; that is expected. After the computer's access password changes, the browser returns to this page; log in with the new password.

## The phone layout {#narrow-layout}

In the Android app, or in a phone browser narrower than 640 pixels, Halo switches to a narrow layout. The desktop app's window never uses this layout.

- **Navigate**: the left rail becomes a **Navigate** button at the top. It opens a bottom sheet with **Conversation**, **Digital Humans**, **Knowledge Base**, **Store**, **Tasks** and **Settings**.
- **Conversation history**: the conversation list moves into the **Conversation history** button at the top, where you switch, pin, rename or delete conversations. The **Workspace** button next to it switches workspaces. For using conversations, see [Conversations](/en/features/conversations).
- **More**: the top-right buttons move into **More**, which opens a bottom sheet:

| Item | Details |
|---|---|
| **Model** | shows the current model; tap to switch. In a Digital Human's chat it opens that Digital Human's model settings |
| **Search** | searches conversations, files, tasks, knowledge bases and Digital Humans |
| **Settings** | opens Settings; some sections are desktop-only, see [What only the computer can do](#desktop-only) |
| **Open terminal** | opens a terminal in the current workspace; commands run on the computer. Shown only when the computer runs macOS or Windows and a workspace is open |
| **Changes** | reviews and commits the current workspace's Git changes; Git runs on the computer. Needs an open workspace |

**Open browser** is in the desktop app's **More** menu, but never appears on a phone; see the next section.

When you open a file or [Changes](/en/features/code-review) on a phone, the canvas fills the screen; tap **Return to conversation** to go back to the chat. While the AI is replying, you can keep sending messages with more information; you don't have to wait for it to finish.

## What only the computer can do {#desktop-only}

You can't do the following in the Android app or a phone browser. Use the Halo desktop app on the computer <Badge type="info" text="Desktop only" />:

| On the phone | What happens |
|---|---|
| **Settings › System**, **Advanced**, **Remote Access** | these three sections are hidden, including the **Federation Gateway** field inside **Remote Access**. The **Task Notifications** switch in **System** exists only on the computer |
| **Settings › Appearance** | no **Display Size** |
| **Settings › AI Model** | no Claude Code CLI sign-in; accounts that sign in through a web page offer only **Manual login** (copy the link, paste the code) |
| New workspace | **Custom Folder** is unavailable and shows "Please select folder in desktop app"; changing a workspace's folder shows "The folder can only be changed in the desktop app." |
| Attachments | you can't pick files or folders on the computer, only upload from the phone; see [Upload files from the phone](#uploads) |
| Opening workspace files | tapping a file downloads it to the phone; there is no **Show in Folder**, and files can't open in the computer's apps |
| AI Browser | no **Open browser**; browser tabs show "Browser features are only available in the desktop client". The AI can still use the [AI Browser](/en/features/ai-browser) on the computer, but you can't stop its live browsing session from the phone |
| Knowledge base | you can't add files ("Adding files requires the desktop app.") or use **Add folder** for **Watched folders**; browsing, asking and deleting work |
| Skills | no `.zip` export, and skill folders can't be opened ("Open in the desktop client to reveal a skill folder.") |
| Teams across computers | you can't join someone else's team: "Joining a team is only available in the desktop app." |
| A Digital Human's HTTP trigger | shows "Open the desktop app to view and copy the HTTP trigger command." |
| Remaining quota | the quota ring next to the composer is not shown |

System notifications for finished tasks: **Task Notifications** on the computer only pops up on the computer. Phone notifications come from the [Android app](#notifications) itself and don't depend on that switch.

## Upload files from the phone {#uploads}

On a phone, the attachment item under the composer's **＋** is **Files** ("Upload from this device into the workspace; images go to the AI directly"), not the desktop's "Files and folders".

1. Open a workspace first. Without one, you see "Open a workspace to attach files".
2. Tap **＋ › Files** in the composer and pick files on the phone.
3. The files are uploaded into this workspace's folder on the computer, then attached for the AI. While uploading you see "Uploading 1 file(s)…", and **Send** stays disabled until it finishes.

| Rule | Details |
|---|---|
| File size | up to 100 MB per file; larger files are not uploaded |
| Folders | can't be uploaded: "only files can be uploaded from this device" |
| Images | go to the AI directly; see [Image input](/en/features/image-input) |
| Same name | if the workspace already has a file with that name, a free name is picked |
| Paths on the computer | you can't attach a local path on the computer from the phone; to use a file already on the computer, tell the AI its name or location in your message |

## iOS {#ios}

Halo 3.0.4 has no iOS app, and there is none in the App Store. On an iPhone or iPad, use the [phone browser](#phone-browser).

- The browser offers the same features as the Android app, without the background connection and system notifications, which only the Android app has.
- Developers can build an iOS version from source themselves.

## Troubleshooting {#troubleshooting}

### The app says "Cannot connect to server. Check the address and make sure Halo is running."

1. Check that the computer is on and not asleep, Halo is running, and **Enable Remote Access** is on.
2. With the LAN address, check that the phone is on the same Wi-Fi as the computer, not on mobile data. On another network, use the permanent address from [internet access](/en/features/remote-access#internet-access).
3. Copy the address again on the computer: if the port was busy, Halo moved to another port, and the old address no longer works.
4. If it still fails, check whether the computer's firewall blocks Halo.

### The app says "Server is not responding correctly" or "Invalid URL format"

The address is not a Halo, or its format is wrong. Compare it with the address in **Settings › Remote Access** on the computer and make sure the IP and port match, for example `192.168.1.100:3456`.

### "Invalid access code", or Continue stays disabled

- The access code is the computer's **Access Password**, not a separate PIN. Click **Copy** on the computer and paste it, so the case is right.
- **Continue** stays disabled below 8 characters. For a Halo Server, set `HALO_REMOTE_PASSWORD` to at least 8 characters.
- Too many failures lock sign-in: 5 failures from one IP within 5 minutes lock that IP for 15 minutes; 10 failures from all devices within an hour lock everyone out for 30 minutes. While locked, even the right password fails. Wait for the lock to end, or restart Halo on the computer. See [Too many failed logins lock sign-in](/en/features/remote-access#lockout).

### "Camera access denied or not available" after tapping Scan QR Code

Allow Halo to use the camera in Android's system settings and try again, or type the address.

### I can't find the QR code on the computer

**Scan to Access** shows only while the **Internet Access** tunnel is running; the LAN address has no QR code. On the same Wi-Fi, type the **LAN Address**.

### "Reconnecting..." appears at the top

The connection between the phone and the computer dropped. Halo reconnects by itself, waiting from 1 second up to 30 seconds between tries, and reconnects at once when you bring the app or browser back to the front. Once connected, replies that finished while you were away and questions waiting for you appear. If it never reconnects, follow "Cannot connect to server" above.

### The app went back to My Devices, or the browser went back to the login page

The access password on the computer changed, and every device has to log in again. In the app, use **Add Device** again with the new password.

### No notifications arrive

- Check that Halo may send notifications in Android's settings.
- Notifications come only while the app is in the background; the phone browser sends no system notifications.
- If Android stopped the app, no notifications arrive; open the app to catch up.

## Next steps {#next-steps}

- [Remote Access](/en/features/remote-access): turn on Remote Access and internet access on the computer, and manage the access password and safety.
- [Halo Server quickstart](/en/server/): when you need a Halo that's always on without a desktop, deploy it as a service and connect your phone to it.
- [Conversations](/en/features/conversations): how to send messages, answer questions and switch conversations.
