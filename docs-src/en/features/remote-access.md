---
title: "Remote Access: use Halo from a phone or another PC"
description: Turn on Remote Access in the Halo desktop app to use this computer's Halo from a phone or another computer, on the same network or over the internet.
type: how-to
audience: [office]
related: [features/mobile, advanced/security, server/]
---

# Remote Access

Remote Access settings are not open to the AI, so Halo can't turn it on or change it for you. Follow the steps below on the computer yourself.

## Before you start {#before-you-start}

- **Desktop app only** <Badge type="info" text="Desktop only" />: you set up Remote Access in the Halo desktop app on macOS, Windows or Linux. Halo opened in a browser or the Android app doesn't have this setting.
- **The computer stays on and Halo keeps running**: other devices connect to the Halo on this computer. If the computer is off or asleep, or Halo has quit, Remote Access stops. On macOS and Windows, closing the window leaves Halo running in the background; on Linux, closing the window quits Halo. To keep it available, see [Keep Digital Humans running](/en/digital-humans/keep-running).
- **No account needed**: neither LAN access nor internet access needs a Halo sign-in.

Pick the way that fits where you are:

| I want to… | Use this |
|---|---|
| Check progress on my phone during a meeting, on the same Wi-Fi as the computer | [LAN access](#lan) |
| Keep using my office computer's Halo from home or on a trip | [Internet access](#internet-access) |
| Use Halo on an Android phone every day and get notified in the background | [Android app](#android) |

## Turn on Remote Access {#turn-on}

1. Click **Settings** at the bottom of the nav rail, then **Remote Access** on the left.
2. Read the **Security Warning** at the top: "After enabling remote access, anyone with the password can fully control your computer (read/write files, execute commands)."
3. Turn on **Enable Remote Access** ("Allow access to Halo from other devices"). **Local Address**, **LAN Address** and **Access Password** appear below it.

![Remote Access in Settings: Enable Remote Access is on, with Local Address, LAN Address, Access Password and Internet Access below](/images/features/remote-access/remote-settings.en.webp)

::: done
When you see **Local Address** and **Access Password**, Remote Access is on.
:::

Halo remembers this switch. After Halo restarts, Remote Access turns itself back on, and so does internet access if it was running.

When devices are connected, the page shows **Connected Devices** with a count. The count includes every open connection, including other team computers and login pages where no one has entered the password yet, so it is not a list of phones. There is no button to disconnect one device; to sign every device out, [change the access password](#password).

Some features also need Remote Access on: a Digital Human's HTTP trigger (see [Schedules and triggers](/en/digital-humans/triggers)) and inviting other computers to a team (see [Teams across computers](/en/digital-humans/cross-computer-teams)). When it is off you'll see "Turn on Remote Access in Settings so others can join this team."

## LAN access {#lan}

When a phone, tablet or another computer is on the same network as this computer, it can open Halo at the LAN address.

1. On the computer, find **LAN Address** in **Settings › Remote Access**, for example `http://192.168.1.100:3456`, and click **Copy** next to it.
2. Open the address in a browser on the other device. You'll see the login page "Halo Remote Access" (in English).
3. Enter the [access password](#password) in the field (placeholder "Access Code") and click **Connect**. After "Connected! Loading...", Halo opens with the same conversations and workspaces.

About the addresses:

| Item | Details |
|---|---|
| Local Address | `http://localhost:<port>`; opens only on this computer |
| LAN Address | `http://<LAN IP>:<port>`; one address is shown, and none if no LAN IP is found |
| Port | `3456` by default, saved in Halo's configuration. If the port is busy, Halo moves to the next free port and remembers it. There is no port setting in the UI |
| QR code | The LAN address has no QR code; type or copy the address |
| Encryption | The LAN address uses `http://`, so traffic is not encrypted; use it only on networks you trust |

If your phone is on mobile data rather than the same Wi-Fi, the LAN address won't open. Use [internet access](#internet-access) instead.

## Internet access {#internet-access}

When you are away from the computer, internet access gives it a public HTTPS address that opens from any network.

1. In **Settings › Remote Access › Internet Access**, click **Start Tunnel**. The button shows **Connecting...** and the page says "Your address is ready — establishing the connection, usually a few seconds."
2. Once connected, you see **Permanent Address** and "This address is permanently bound to this device and restores automatically after restarts." Click **Copy** and send the address to your phone.
3. A **Scan to Access** QR code appears below ("Scan with your phone to open your address — works on any network"). Scan it with your phone, or open the permanent address in a browser.
4. On the English login page, enter the [access password](#password) and click **Connect**.

::: done
If you open the permanent address from another network (for example, your phone on mobile data), sign in and see the computer's conversations, internet access works.
:::

### Permanent and temporary addresses {#permanent-address}

- The **Permanent Address** is bound to this device. It stays the same when Halo restarts and when you stop and start the tunnel, so you can bookmark it.
- The first time you start the tunnel, Halo asks its address service for the permanent address, which needs an internet connection.
- If it can't get one, Halo starts a temporary **Public Address** instead and explains why in an amber notice:

| Notice | Meaning |
|---|---|
| "Temporary address — the issuing service was unreachable, so this link changes on every restart. It will switch back to your permanent address automatically next time." | The address service couldn't be reached |
| "Temporary address — your network reached today's limit for permanent-address requests. This is a product limit, not an error. Your permanent address will be restored automatically after the limit resets (within 24 hours)." | Your network used up today's requests |
| "Temporary address — this device identity was rejected by the address service." | The address service didn't accept this device |

A temporary address changes on every start, so check that you send your phone the address shown right now.

### Change address {#change-address}

If the address has leaked, or you want to retire the old one:

1. Under **Internet Access**, click **Change address**.
2. Read the notice ("The current address stops working immediately and cannot be reclaimed") and click **Confirm and change address**.

The old address stops working at once and the new permanent address is shown; if the tunnel is off, the new address is issued at the next **Start Tunnel**. Each network can change addresses only a limited number of times per day. After that you'll see "Your network reached today's limit for address changes. Try again after the limit resets (within 24 hours)." Remember to update bookmarks and any integration that used the old address.

### How internet access traffic flows {#how-it-works}

Internet access is not peer-to-peer. Traffic goes through the Cloudflare tunnel service to your computer, and Halo's address service assigns the permanent address. The public address uses HTTPS. The QR code holds only the address, not the password, so you still enter the access password after scanning.

::: info
A Halo provided by your company may not have an **Internet Access** block: some company builds turn this feature off, and then **Scan to Access** doesn't appear either. LAN access still works.
:::

## Access password {#password}

The access password is the one key shared by every remote device: browser login, the Android app and the HTTP API all use it.

- **Generated for you**: the first time you turn on Remote Access, Halo creates a 12-character password with upper-case letters, lower-case letters, digits and symbols.
- **Stays valid**: the password doesn't expire. It stays the same when Halo restarts and when you turn Remote Access off and on, so signed-in devices don't need to re-enter it.
- **View and copy**: next to **Access Password**, click **Show** / **Hide** and **Copy**. Copy it and paste it on the phone to avoid case mistakes.

### Set your own password {#custom-password}

1. Next to **Access Password**, click **Edit**.
2. Enter a new password (placeholder "8-64 chars, mixed case + digit") and click **Save**.

| Rule | Requirement |
|---|---|
| Length | 8–64 characters |
| Must include | at least one upper-case letter, one lower-case letter and one digit |
| Symbols | allowed, not required |

Below 8 characters, **Save** can't be clicked; if a character type is missing, Halo says which, for example "Password must include: digit". After you save, every signed-in device is signed out and needs the new password. There is no "regenerate" button; to change the password, use **Edit**.

### Too many failed logins lock sign-in {#lockout}

To stop password guessing, Halo pauses sign-in after too many failures:

| Scope | Trigger | Locked for |
|---|---|---|
| One IP address | 5 failures within 5 minutes | that IP, 15 minutes |
| All devices together | 10 failures within 1 hour | every device, 30 minutes, including you |

During a lockout the computer shows a system notification "Remote access locked" or "Remote access: suspicious activity". The login page shows only "Invalid code" while locked. A successful login clears the count for that IP only; restarting Halo clears all counts.

## What remote devices can do {#remote-clients}

A browser or the Android app opens the same Halo: the same conversations, workspaces, Digital Humans and knowledge bases, and the AI keeps working on this computer. A message you send from your phone shows up on the computer at the same time. Several devices can sign in at once and all see the same content.

Some things only work in the desktop app on the computer:

| On a remote device | What happens |
|---|---|
| Settings | No **System**, **Advanced** or **Remote Access** (which includes **Federation Gateway**) |
| New workspace | You can't pick a folder on the computer; you see "Please select folder in desktop app" |
| Attachments | The composer item is **Files**: it uploads from the current device into the workspace, up to 100 MB per file. Folders can't be uploaded, and you can't point to a local path on the computer |
| Workspace files | Clicking a file downloads it to the current device instead of opening it in a system app |
| AI Browser | No **Open browser**, and you can't watch the browser; the AI can still use the [AI Browser](/en/features/ai-browser) on the computer |
| Knowledge base | You can't add files or watched folders |
| Teams | You can't join someone else's team |

If the connection drops, a "Reconnecting..." banner appears at the top, and Halo catches up on what you missed once it is back. For details on phones, see [Halo on your phone](/en/features/mobile).

Developers can call Halo's HTTP API with the same address and access password; see [HTTP API overview](/en/developers/api/).

## Android app {#android}

Besides a phone browser, you can install the Halo Android app. On first launch, choose **Connect to your desktop**, fill in **Server address** (the LAN address or the permanent address) or tap **Scan QR Code**, then enter the computer's access password in **Access code** (placeholder "PIN or password") and tap **Continue**. The app saves several computers, stays connected in the background and notifies you when a task finishes. There is no iOS app. To install and use it, see [Halo on your phone](/en/features/mobile).

## Federation Gateway {#federation-gateway}

**Settings › Remote Access** also has a **Federation Gateway** field. It takes the address of a relay server, so colleagues' computers on other networks can join your Digital Human team. Leave it empty if your team works only on the local network. When you need it and how to deploy one: [Deploy the Federation Gateway](/en/advanced/federation-gateway).

## Turn off Remote Access {#stop}

- **Internet access only**: under **Internet Access**, click **Stop Tunnel**. The public address stops opening right away, while LAN access keeps working. The permanent address is kept, so the next **Start Tunnel** brings back the same address.
- **Everything**: turn off **Enable Remote Access**. Halo stops serving other devices, the tunnel stops too, every remote device disconnects, and nothing turns back on after a restart. The access password is kept and reused when you turn it on again.
- **Quit Halo**: Remote Access stops with it. If the switch is on, it comes back the next time Halo starts.

## Safety {#safety}

::: danger
Anyone with the address and the access password has full control of the Halo on this computer: they can read and change your conversations and files, and have the AI run commands on this computer. Send the password only to your own devices.
:::

- **Use a strong password**: keep the generated 12-character password, or set a long one you don't use anywhere else.
- **Turn internet access off when you don't need it**: click **Stop Tunnel**, and start it again when needed; the permanent address stays the same.
- **If you suspect a leak**: first [change the access password](#custom-password) to sign every device out; if needed, [change the address](#change-address) too.
- **The LAN is not encrypted**: the LAN address uses `http://`. On public Wi-Fi, use the HTTPS address from internet access instead.
- **The password is stored on this computer**: the open-source build saves the access password in plain text in Halo's configuration file, readable by anyone who can sign in to this computer. See [Security, privacy and data flow](/en/advanced/security).

## Troubleshooting {#troubleshooting}

### My phone can't open the LAN address

1. Check that the computer is on and awake, Halo is running, and **Enable Remote Access** is on.
2. Check that the phone is on the same Wi-Fi as the computer, not on mobile data.
3. Copy the **LAN Address** again: if the port was busy, Halo moved to another port and the old address no longer works.
4. If it still fails, check whether the computer's firewall blocks Halo, or use [internet access](#internet-access).

### The login page keeps saying "Invalid code"

- The password is case-sensitive. Click **Copy** on the computer and paste it into the login page.
- After too many failures, sign-in is [locked](#lockout), and the page still says "Invalid code". Wait 15 minutes (30 minutes if every device is locked) and try again, or restart Halo on the computer.
- With fewer than 8 characters, the login page says "Please enter access code".

### A signed-in device suddenly returns to the login page

The access password was changed. The browser goes back to the login page and the Android app goes back to its device list; sign in with the new password.

### I see a temporary address instead of the permanent one

Read the reason in the amber notice and compare it with [Permanent and temporary addresses](#permanent-address). Once the address service is back or the limit resets, the next start switches back to the permanent address.

### "Tunnel connection failed" appears

1. Check that the computer can reach the internet.
2. Click **Stop Tunnel**, wait a few seconds, then click **Start Tunnel**.
3. If it keeps failing, your company network may block the tunnel connection; ask your IT team. LAN access is not affected.

### There is no "Internet Access" in Settings

Your Halo comes from your company, which turned internet access off. Use LAN access, or ask your IT team.

### "Stored access credential could not be decoded and has been cleared"

Halo has turned Remote Access off and cleared the old password. Turn **Enable Remote Access** on again; Halo creates a new password, and you sign in again on each device with it.

## Next steps {#next-steps}

- [Halo on your phone](/en/features/mobile): install the Android app and learn the phone layout and notifications.
- [Security, privacy and data flow](/en/advanced/security): see which services Halo connects to and where your data lives.
- [Halo Server quickstart](/en/server/): run Halo as an always-on service without the desktop app.
