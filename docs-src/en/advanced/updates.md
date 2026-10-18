---
title: "Update Halo: automatic updates and manual checks"
description: Halo downloads new versions in the background and shows one prompt to finish. Check manually, and learn about Windows fast updates and mandatory updates.
type: how-to
audience: [admin, beginner]
related: [getting-started/install, advanced/deployment, advanced/config-paths]
---

# Updating Halo

Halo's AI can't update Halo for you, because there is no way for it to update itself. Use the steps below.

## Automatic updates {#automatic}

While Halo is open, it checks for new versions on its own. You don't need to do anything.

| When Halo checks | Notes |
|---|---|
| 5 seconds after launch | Every time you open Halo |
| Every 60 minutes | For as long as Halo is open |
| 3 seconds after the computer wakes from sleep | Right after sleep ends |
| Between two automatic checks | At least 5 minutes apart |

1. When Halo finds a new version, it downloads it in the background. Nothing pops up while it checks or downloads, so you can keep working.
2. Once the update is downloaded and ready, a prompt appears in a corner of the screen and stays there. Its title is "New version Halo X.Y.Z available" (X.Y.Z is the new version number). The body lists what changed in that version, or shows a fixed line when there are no release notes.
3. Click the main button on the prompt to finish the update. The button depends on your system:

| System | Main button | Body when there are no release notes | What happens |
|---|---|---|---|
| macOS | **Restart now** | "Restarting takes only a few seconds" | Halo quits and reopens as the new version |
| Linux | **Restart now** | "Restarting takes only a few seconds" | Same as macOS |
| Windows (fast update) | **Restart now** | "Restarting takes only a few seconds" | See [Windows fast updates](#windows-staged) |
| Windows (installer) | **Install now** | "Halo will close and the installer will guide you through it" | Halo closes; follow the installer |

4. Not a good moment? Click **Remind me later**. Halo won't prompt you about this version for 6 hours. After that, the next check shows the prompt again.

- A downloaded update is also installed when you quit Halo. The one exception is the Windows fast update, which only applies when you click **Restart now**.
- Updating keeps your data: workspaces, conversation history and Digital Humans stay where they are. To see where they live, read [Where Halo keeps your data](/en/advanced/config-paths).
- The update channel is fixed in the installer. **Settings** has no switch to change it. Public stable releases get their updates from GitHub Releases.

::: info
A Halo provided by your company may get its updates from your company's own address.
:::

## Mandatory updates {#mandatory}

The publisher can mark a version as mandatory, usually one that fixes an important problem. The publisher sets this in the update information; you can't turn it on or off.

A mandatory update prompt differs from a normal one in three ways:

- No **Remind me later** button
- No close button (×)
- An extra line at the end: "This update is required and cannot be postponed"

If you clicked **Remind me later** for that version before, it no longer counts. The prompt stays until you click **Restart now** or **Install now**. Quitting Halo also installs the downloaded update, except with the Windows fast update.

## Check for updates manually {#check-manually}

To find out right away whether there's a new version, without waiting for the next automatic check:

1. Open [**Settings**](/en/features/settings) and find **About**.
2. The **Version** row shows the version number and build time, for example `3.0.4 (2026-10-17-1530)`.
3. Click **Check for updates** on the right of that row. The button text follows the progress:

| Button shows | Meaning |
|---|---|
| **Check for updates** | Not started yet. Click it to check |
| "Checking..." | Looking for a new version. The button can't be clicked for now |
| "Downloading X.Y.Z… N%" | A new version was found and is downloading in the background. N is the progress |
| "Preparing X.Y.Z…" | Windows fast update only: the new version is being unpacked in the background |
| "New version available: X.Y.Z" | The update is ready, and the update prompt appears too. If the prompt says it couldn't update automatically, see [Troubleshooting](#failures) |
| "Already up to date" | You're on the latest version |
| "Check failed — tap to retry" | This check didn't work. Click it to try again |

Checking in **Settings › About** clears an earlier **Remind me later** and ignores the five-minute gap between checks. If the update is already downloaded, the prompt appears again.

On macOS you can also check from the menu: choose **Halo › Check for Updates...** in the menu bar. A menu check doesn't clear **Remind me later**, so no prompt appears while it's snoozed. On Windows and Linux, use **Check for updates** in **Settings › About**.

::: done
When you see "Already up to date", or the "New version Halo X.Y.Z available" prompt appears, the check is done.
:::

## Windows fast updates {#windows-staged}

Since 3.0, Halo on Windows downloads and prepares the next version in the background. When you click **Restart now**, no installer window appears.

- **Prepared in the background**: after downloading, Halo unpacks the new version inside its installation folder. **Settings › About** shows "Preparing X.Y.Z…" meanwhile. You can keep using Halo.
- **Done in seconds**: when you click **Restart now**, Halo quits, a small helper swaps the program files, and Halo opens again. From the click to the new window took about 8–12 seconds in testing. The installation folder stays the same, and the desktop shortcut and uninstaller keep working.
- **Automatic rollback**: if the new version doesn't start properly, Halo switches back to the previous version and opens it again. That version is skipped from then on: Halo shows "Already up to date" until a newer release comes out.
- **Interruptions are handled**: if the swap is interrupted (for example by a power cut), Halo finishes the job the next time it opens.
- **Verified packages**: update packages are signed, and Halo won't use one that fails the check.
- **Stable channel only**: in the public build, fast updates cover the stable channel. Preview builds keep using the installer.

Whenever the fast update isn't completely sure it can succeed, it quietly switches to the installer instead of showing an error. Examples: the helper is missing, the signature check fails, disk space is short, or the update information can't be reached. The prompt then shows **Install now**; follow the installer to finish.

::: info
Upgrading from Halo 2.x to 3.0 still uses the installer (**Install now**) this one time, because 2.x has no fast update. Updates after you're on 3.0 use the fast update.
:::

## Updates on macOS and Linux {#macos-linux}

- **macOS**: Halo downloads the new version's `.zip` package in the background. Click **Restart now**, and a few seconds later the new version opens.
- **Linux**: Halo is a single `.AppImage` file, and it updates that file itself. The update takes effect when you click **Restart now**.

On both systems, an update that is downloaded but not yet applied is installed when you quit Halo.

## Preview channel {#preview-channel}

If **Settings › About** shows a **Preview channel** badge next to the version, you're running a preview build. A preview build receives updates from the preview channel and doesn't get stable-channel prompts. On Windows, preview builds update with the installer.

Preview and stable builds **share one data folder** (`~/.halo` by default), so your workspaces, conversations and Digital Humans are there whichever one you open. That comes with two limits:

- **You can't run both at once.** If one is open and you start the other, you'll see "Another version is already running", with instructions for quitting the running copy (it may be in the tray).
- **You can't simply go back to an older version.** A newer version may have upgraded the data format. If you then open the data with an older version, a dialog "Data is from a newer version" appears and Halo stops starting, to avoid damaging your data. The dialog has **Open data folder** and **Quit** buttons, and its language follows your system. Open the data with the newer version instead, or restore one of the backups Halo makes before upgrading the data (file names ending in `.premigrate.bak`; the 2 newest are kept).

For the data folder location and the backup files, read [Where Halo keeps your data](/en/advanced/config-paths).

## Staying on 2.x on older systems {#older-systems}

Halo 3.0 no longer supports some older systems. On those computers, keep using the matching 2.x version:

| System | 3.0 requires | If your computer doesn't meet it |
|---|---|---|
| macOS | macOS 12 or later (Apple silicon or Intel) | Below macOS 12, keep using Halo 2.x |
| Linux | 64-bit (x64), glibc 2.34 or later, such as Ubuntu 22.04, Debian 12 or newer | With glibc below 2.34, keep using Halo 2.1.15 |
| Windows | Windows 10 or later, 64-bit (x64) only | There is no Windows ARM build |

For the full requirements, read [Install Halo](/en/getting-started/install#before-you-start).

<!-- public:start -->
The last 2.x version is 2.1.15. Its installers are on the [Halo 2.1.15 release page on GitHub](https://github.com/openkursar/hello-halo/releases/tag/v2.1.15).

::: tip Using Halo 2.x?
The 2.x interface differs from what these pages describe. The 2.x docs are kept in the [2.x docs source on GitHub](https://github.com/openkursar/halo-website/tree/4dbb7d7bc3bc68ce22d1db53e5422e41790e690a/docs-src).
:::
<!-- public:end -->

## Troubleshooting {#troubleshooting}

### "Could not update automatically — you can download this version manually" {#failures}

This warning prompt appears when the new version couldn't be downloaded or prepared in the background. Its title is still "New version Halo X.Y.Z available".

1. Click **Go to download** to open the download page for that version.
2. Download the package for your system and install it over the current one, following [Install Halo](/en/getting-started/install). Your data is kept.

To deal with it later, click **Remind me later**. Mandatory updates don't have that button.

### Check for updates shows "Check failed — tap to retry"

The check didn't succeed, most often because the network can't reach the update address. Make sure you're online, then click it to try again.

Update checks and downloads only use the system proxy; the proxy in **Settings › System › Proxy** doesn't apply to them. If your company network needs a proxy to reach the internet, set it in the operating system; see [Model gateway and proxy](/en/advanced/gateway-and-proxy).

### Others already have the new version, but I keep seeing "Already up to date"

- On Windows, if a version didn't start properly after a fast update, Halo rolled back to the previous version and skips that version until a newer release comes out. When the next version is released, Halo prompts you as usual.
- You, or the other person, are on the preview channel. The two channels receive different versions; see [Preview channel](#preview-channel).
- Your system is below the 3.0 requirements; see [Staying on 2.x on older systems](#older-systems).

### Halo says "Data is from a newer version" when it opens

You opened this data with a newer version (a preview build, for example) and have now gone back to an older one. Open it with the newer version; see [Preview channel](#preview-channel).

## Next steps {#next-steps}

- [Install Halo](/en/getting-started/install): download manually, install over the current version, or set up a new computer.
- [Deploy to many computers](/en/advanced/deployment): check the installers and first-launch requirements before rolling Halo out.
- [Where Halo keeps your data](/en/advanced/config-paths): find the data folder before you back it up.
