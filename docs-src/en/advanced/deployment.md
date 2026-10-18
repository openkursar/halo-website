---
title: Deploy Halo to many computers and set defaults
description: "Roll Halo out to a team's computers: requirements and installers, Git Bash on Windows, what users see on first launch, and what you can set in advance."
type: how-to
audience: [admin]
platforms: [macos, windows, linux]
related: [getting-started/install, advanced/updates, advanced/security, server/]
---

# Deploy to many computers

Handing out installers and setting environment variables happen outside Halo, so Halo can't help with this.

## Before you start {#before-you-start}

- Each computer is installed the same way as in [Install Halo](/en/getting-started/install). This page adds what admins need on top: requirements, how the installers behave, and what you can decide in advance.
- Go through [Before you roll out](#before-rollout) first. Halo's AI runs tools without asking each time, and the people using it should know that.
- For one Halo shared by several people, or a server without a desktop, see [Halo Server](#halo-server).

## Requirements {#requirements}

| Platform | Requirement | Notes |
|---|---|---|
| macOS | macOS 12 or later, Apple silicon and Intel | Older Macs stay on Halo 2.x |
| Windows | Windows 10 or later, x64 only | No ARM64 build |
| Linux | x64, glibc 2.34 or later (such as Ubuntu 22.04, Debian 12 or newer) | AppImage only, no `.deb` / `.rpm`; older systems stay on 2.1.15 |
| Android | Android 7.0 or later | A remote client only: it connects to a Halo running on a computer and runs no AI itself |
| iOS | — | No iOS app |

How the desktop app differs per platform:

| | macOS | Windows | Linux |
|---|---|---|---|
| Closing the window | Hides it; Halo keeps running | Hides it to the tray; Halo keeps running | **Quits**; background work stops |
| AI Terminal | Yes | Yes | No |
| Auto Launch on Startup | Works | Works | Has no effect |
| Shell the AI uses for commands | The system's own shell | Git Bash (bundled, see [below](#windows-git-bash)) | The system's own shell |

## Installers {#installers}

| Platform | File | Signing | How it installs |
|---|---|---|---|
| macOS | `.dmg` and `.zip`, each for arm64 (Apple silicon) and x64 (Intel) | The official build is Apple Developer ID signed and notarized | Drag Halo into the Applications folder |
| Windows | `Halo-Setup-<version>.exe` (NSIS installer) | **Not signed** | An installer wizard with a UI, per-user; you can change the install folder |
| Linux | `Halo-<version>.AppImage` | — | Make it executable, then run it |

Replace `<version>` with the actual version, for example `3.0.4`.

Things to plan for:

- **Windows warns about the installer.** It isn't signed, so the first run shows SmartScreen's "Windows protected your PC"; click **More info › Run anyway**. Company antivirus or endpoint tools may block it too, so allow-list the Halo installer and install folder in advance.
- **Windows installs per user.** It installs for the signed-in Windows account only. Other accounts on the same computer install it themselves.
- **Installing over a running Halo closes it.** Before it starts, the Windows installer force-closes the current user's running Halo and its child processes, so running conversations and Digital Humans are interrupted. Install when people aren't in the middle of work.
- **Uninstalling keeps data.** The Windows uninstaller doesn't delete user data; after reinstalling, workspaces, conversations and Digital Humans are still there. See [Where Halo keeps your data](/en/advanced/config-paths).
- **No silent-install switch.** Halo doesn't provide or document command-line options for silent or unattended installs. This page doesn't recommend any unverified installer flags.
- **No Gatekeeper workaround on macOS.** The official build is notarized, so it opens with only the usual "downloaded from the internet" prompt. Only self-built or unknown copies show "cannot verify the developer".

## Command environment on Windows {#windows-git-bash}

On Windows the AI needs Git Bash to run commands such as git, npm or pip. On first launch Halo looks for one in this order:

1. The `bash.exe` that the `CLAUDE_CODE_GIT_BASH_PATH` environment variable points to
2. Halo's own installed copy
3. An installed Git for Windows (in `Program Files`, `Program Files (x86)` or the user's `Programs` folder)
4. The bash next to a `git.exe` found on `PATH`

If none is found, Halo first shows "First-time setup required", with **Auto download and install** (marked "Recommended") selected:

- The installer already contains a portable Git (PortableGit), so this step unpacks it locally and needs no internet. Halo falls back to download mirrors only if that bundled copy is missing.
- If someone chooses **Skip, install manually later**, Halo enters "Limited functionality mode": the AI can chat but can't run system commands. A banner "Command execution environment is not installed, AI cannot run system commands" stays at the top of the conversation view, and **Install now** installs it later.

If your computers already have Git for Windows installed, Halo uses it and nobody sees this screen. For the screens themselves, see [Install Halo › Windows: set up the command environment](/en/getting-started/install#git-bash).

## What each user sees on first launch {#first-run}

Every user on every computer goes through the same steps the first time. Halo has no way to skip them on the user's behalf:

1. **Only on Windows, when no Git Bash is found**: "First-time setup required" (see the previous section).
2. **"Let's set things up"**: choose **Language** and **Theme**, then click **Continue**. The language follows the system language by default, and the theme defaults to **Follow System**.
3. **"Welcome to Halo" › "Select a method to start"**: the recommended sign-in is at the top, followed by the other sign-ins under **Or choose another method** and **Custom API**. People can also click **Skip for now** ("Configure your AI later in Settings") to go straight to Home and set up a model later in **Settings › AI Model**. After skipping, this wizard doesn't come back on the next launch.
4. Home opens. A fresh install of the official build also creates a starter Digital Human, 「Halo AI 数字人模板」 (its name is in Chinese in every language), in the **Halo Workspace**. It appears under **Digital Humans › My Digital Humans**. It has no triggers, and people can rename it, edit it, bind it to a bot or uninstall it.

For the sign-in options and how to choose, see [Connect an AI model](/en/getting-started/setup-ai). If your company has one model gateway, have people choose **Custom API** in step 3 and enter the gateway address and key; see [Model gateway and proxy](/en/advanced/gateway-and-proxy).

::: info
A Halo provided by your company may show different sign-in options.
:::

## What you can set in advance {#pre-configure}

### Official build {#official-build}

With Halo downloaded from the official site, only the following can be set at deployment time. Everything else each user sets inside Halo:

| What to decide | How | Notes |
|---|---|---|
| Where the data folder is | Set the `HALO_DATA_DIR` environment variable before Halo starts | The default is `.halo` in the user's home folder. With it set, data and logs (a `logs` subfolder) go to that folder, and `~` expands to the home folder. The app data folder (AI Browser sign-ins, the default Claude config directory, Git Bash on Windows) stays in the system default location; see [Where Halo keeps your data](/en/advanced/config-paths#app-data-folder). There's no UI for it, and Halo can't move the data folder. Give each user their own folder; don't share one between people |
| Which Git Bash Windows uses | Preinstall Git for Windows, or set `CLAUDE_CODE_GIT_BASH_PATH` to a `bash.exe` | Once found, "First-time setup required" doesn't appear |
| Network proxy | Use the system proxy settings | When **Settings › System › Proxy** is empty, Halo uses the system proxy (PAC included). For a manual proxy and bypass list, see [Model gateway and proxy](/en/advanced/gateway-and-proxy) |

Halo doesn't provide a configuration file or policy template for admins to push out.

### Company builds of Halo {#company-builds}

::: info Company builds
A company can build its own version of Halo and set the items below at build time. They're decided when the build is made: users can't see or change the underlying settings in Halo, and Halo from the official site includes none of these presets.
:::

| What can be preset | What users see |
|---|---|
| Sign-in options | Only the sign-ins the company chose appear on first launch and in **Settings › AI Model** |
| Preset model services | A "Preset API" group in **Settings › AI Model** with the gateway address fixed; users only enter a key |
| IM bot permission defaults | New bots start with **Permission Control** on, and the tools guests may use by default are set by the company |
| AI Browser site policy | Only allow or block certain sites and set a homepage; where allowed, **Settings › System** shows "Browser Allowed Sites" so users can add their own |
| Store sources | Sources in **Settings › App Store** can be replaced by the company's own store, hidden or locked on or off; see [Private store](/en/advanced/private-store) |
| Update source | Updates come from the company's own address |
| Credential encryption | API keys and tokens are encrypted before they're saved. The official build doesn't encrypt them; they're stored in plain text in `~/.halo/config.json` |
| Limits on remote access and extensions | Turn off internet access for Remote Access; block installing MCP servers over a remote connection; block specific MCP launch commands |
| Built-in gateway and Digital Humans | Prefill a [Federation Gateway](/en/advanced/federation-gateway) address, or ship Digital Humans with the installer |
| Data folder name | Use a different folder name (for example `~/.halo-<NAME>`) so the data stays separate from the official build's |

## Updates after deployment {#updates}

- Halo checks for new versions and downloads them in the background: 5 seconds after launch, then every 60 minutes, and also when the computer wakes up. When one is ready, a prompt appears and people click **Restart now** (**Install now** when Windows uses the installer).
- The official build gets stable updates from the GitHub releases page. There's no update-channel switch in the UI.
- From 3.0, Windows prepares updates in the background and a restart finishes in seconds; if the new version fails to start, it rolls back automatically. Upgrading from 2.x to 3.0 still runs the installer this one time.
- Updates the publisher marks as required can't be postponed.

For the full picture, see [Updating Halo](/en/advanced/updates).

## Before you roll out {#before-rollout}

Before handing Halo to people, make sure these points are clear:

- The AI runs commands, edits and deletes files **without asking each time**. Point workspaces only at folders people are comfortable letting the AI change.
- The official build stores API keys and tokens in plain text in `~/.halo/config.json` (shown as `***` everywhere in the UI). Keep that folder out of cloud drives and public backups.
- With **Developer Mode** on, `http-raw.log` records full requests, keys included. Turn it off after troubleshooting.
- Anyone with a Remote Access password has full control of the Halo on that computer.

To go through it item by item, see [Security, privacy and data flow › Checklist for admins](/en/advanced/security#checklist).

## Shared or server deployment {#halo-server}

To let several people use one Halo from a browser or the Android app, or to use Digital Humans as a backend service, use [Halo Server](/en/server/): the same Halo running without a window in a Linux x64 container, configured with environment variables. Halo Server connects to models through **Custom API** only, has no automatic updates, and doesn't show the **System**, **Advanced** or **Remote Access** settings.

## Troubleshooting {#troubleshooting}

### Windows blocks the installer or Halo

Halo's Windows installer isn't signed. When SmartScreen appears, click **More info › Run anyway**. If company antivirus quarantines it, ask your security team to allow-list the installer and Halo's install folder, then install again.

### Every Windows computer shows "First-time setup required"

That computer has no Git Bash Halo can find. Keep **Auto download and install**: it unpacks the copy inside the installer and needs no internet. To avoid the screen entirely, preinstall Git for Windows or set `CLAUDE_CODE_GIT_BASH_PATH`.

### "Another version is already running"

Only one Halo can run on the same data, and the stable and preview builds share one data folder. Quit the other Halo as the message explains (it may be in the tray), then open it again.

### "Data is from a newer version"

A newer version of Halo has already opened the data on this computer, so the older version refuses to start rather than damage it. Install the newer version again. When deploying, give every computer the same or a newer version; don't downgrade.

## Next steps {#next-steps}

- [Security, privacy and data flow](/en/advanced/security): walk your security team through the data flow and permissions before rollout
- [Updating Halo](/en/advanced/updates): how updates work per platform, and required updates
- [Halo Server quickstart](/en/server/): deployment for shared use or machines without a desktop
