---
title: "Move Halo to a new computer with your data"
description: "Move Halo to a new computer: the two folders to copy, why paths must match, what to sign in to again, and how to move one Digital Human as a package."
type: how-to
audience: [admin, office]
related: [advanced/config-paths, advanced/security, digital-humans/manage]
---

# Move Halo to a new computer

Halo has no "export everything" button, but all of its data lives in two folders. Copy them as described below and Halo on the new computer is the same as before: workspaces, conversations, Digital Humans, teams, knowledge bases, skills, MCP servers and settings all come along.

Copying folders happens outside Halo, so Halo can't do this step for you.

## What to copy {#what-to-copy}

| Folder | What's in it | macOS | Windows | Linux |
|---|---|---|---|---|
| **Halo data folder** | Settings and credentials (`config.json`), workspaces and conversations, Digital Humans, teams, knowledge bases | `~/.halo` | `%USERPROFILE%\.halo` | `~/.halo` |
| **App data folder** | AI Browser data, the AI engine's conversation records, global skills, Git Bash on Windows | `~/Library/Application Support/halo` | `%APPDATA%\halo` | `~/.config/halo` |

- **Copy both folders.** With only the Halo data folder, old conversations are still listed, but when you continue one the AI starts from a fresh context.
- **Copy project folders too.** If some workspaces point at your own project folders (outside `.halo`), bring those folders along. Where to put them: [Keep the same paths](#same-paths).
- **If you use the Claude CLI default config directory**: when **Settings › Advanced › Claude CLI Integration › Config Directory** is set to the Claude CLI default (`~/.claude`), the AI engine's conversation records and global skills live in `~/.claude`. Copy that folder as well.
- **If you moved the data folder**: if you set the environment variable `HALO_DATA_DIR` to keep the Halo data folder somewhere else, copy that folder and set the same variable on the new computer.
- A company build of Halo may use a data folder name other than `.halo`. Use the folders that actually exist on your computer. Full details: [Where Halo keeps your data](/en/advanced/config-paths).

::: warning The copied files contain plain-text secrets
The public build stores API keys, email passwords and IM bot credentials in plain text in `config.json` (see [Keys and credentials](/en/advanced/security#credentials)). Move the folders over an external drive or your local network, never through a public cloud folder or a code repository, and delete any transfer copies afterwards.
:::

## Steps {#steps}

### On the old computer

1. Quit Halo. On macOS and Windows, closing the window only hides Halo to the tray; it keeps running. On macOS, click the Halo icon in the menu bar; on Windows, right-click the Halo icon in the tray. Choose **Quit Halo**. If background tasks are running, Halo asks you to confirm first.
2. Make sure Halo has fully closed, then copy [the folders above](#what-to-copy). Copying while Halo is open can catch half-written files.

On Linux, closing the window quits Halo. Some desktop environments don't show the tray icon at all; that's expected.

### On the new computer

1. Install Halo, the same version as the old computer or newer. If it opens after installation, quit it first.
2. Put both folders in the same locations on the new computer, replacing the freshly created ones.
3. Put project folders at the same paths as on the old computer.
4. Open Halo and check that **Settings › AI Model**, your workspaces, Digital Humans and knowledge bases are all there.
5. Go through [What to sign in to again](#sign-in-again).

::: done
Open a workspace, see your old conversations, send a message in one of them: if the AI remembers what you discussed before, the move worked.
:::

## Keep the same paths {#same-paths}

Halo records the full path of every workspace, both those inside the Halo data folder and those that point at project folders. So:

- **Use the same operating system and the same user name** on the new computer, so your home folder path doesn't change.
- **Put project folders back at their original paths.** If a project was at `~/code/app`, put it at `~/code/app` on the new computer too.

When a project folder can't go back to its old path, its workspace shows as **Unavailable**, or the chat shows a **The working directory is unavailable** card. Point the workspace at the new location in one of two ways:

- On the workspace card's **⋮** menu, choose **Edit**, then click **Change folder** next to **Working directory** and pick the folder's new location. Conversations keep their history and context.
- On the **The working directory is unavailable** card in the chat, click **Change working directory**, pick the new location, then send your message again.

Both only work in the desktop app. Details: [Working directory unavailable and disconnected workspaces](/en/features/spaces#unavailable).

## What to sign in to again {#sign-in-again}

Most settings travel with `config.json`. Check these items on the new computer.

| Item | After the move | What to do |
|---|---|---|
| **Websites you signed in to in the AI Browser** | The sign-ins may not carry over | Sign in again once in Halo's browser, see [AI Browser](/en/features/ai-browser) |
| **Claude Code CLI sign-in** (macOS only) | The credential is in the macOS Keychain, not in the copied folders | In **Settings › AI Model**, remove that source and sign in again from **OAuth Login › Claude Code CLI**, see [Models and accounts](/en/features/models) |
| **WeCom Intelligent Bot** | One bot works on only one device at a time. While the old computer still runs, the card on the new one may show **Standby** and "In use on another device" | Quit Halo on the old computer, or take over in **Settings › Message Channels** on the new one with **Use on this device**; the old computer switches to standby |
| **Feishu Bot** | A bot connected from two computers at once has its messages split at random between them | Run it on the new computer only |
| **Remote Access fixed address** | The fixed address tied to this device's identity is stored in `config.json` and moves to the new computer | Don't turn on **Remote Access** on the old computer again, see [Remote Access](/en/features/remote-access) |
| **Teams across computers** | The identity this computer uses in teams is stored in the Halo data folder and moves with it | Don't run the same data on both computers at once, see [Teams across computers](/en/digital-humans/cross-computer-teams) |
| **Other AI sources, email, IM bot credentials** | They come along | If one reports invalid credentials, enter them again or sign in again in its settings |

## What about the old computer {#old-computer}

Once the new computer is working, don't run the same data on both computers at once. Bots, the Remote Access address and the team identity would conflict, for the reasons in [What to sign in to again](#sign-in-again).

When everything works on the new computer, you can uninstall Halo from the old one. Uninstalling doesn't delete the data folders. If you no longer need them, delete [the two folders](#what-to-copy) by hand; they contain plain-text secrets.

## Move just one Digital Human {#one-digital-human}

If you don't need to move everything, export one Digital Human as a package (a `.dhpkg` file) and import it on the other computer.

**Export** (old computer) <Badge type="info" text="Desktop only" />

1. Click **Digital Humans** in the left rail and open the Digital Human.
2. Click **More › Share** at the top right, then click **Export** in the dialog.
3. Choose where to save. "Saved to …" means it's done; the file is named like `short-name-version.dhpkg`, where the short name comes from the Digital Human's name (lower-cased; Chinese is turned into pinyin).

**Import** (new computer)

1. Open **Digital Humans › My Digital Humans**, click **Create Digital Human** and switch to **Import**.
2. Drop the file in or click to choose it. Accepted: a `.dhpkg`, `.zip` or `.yaml` file, or a folder; archives up to 10 MB.
3. Choose the workspace to install it in and confirm. **Installation complete** means it's done; **Partially installed** means some skills didn't install.

A package contains the Digital Human's definition and the skills it ships with. It doesn't contain conversations, memory, knowledge base contents or IM bot bindings. After importing, reconnect bots and choose the knowledge bases to use on the new computer.

::: tip Changing workspaces on the same computer needs no export
To have a Digital Human work in another workspace on the same computer, open it, click **More › Move to another workspace** and pick the new workspace in **Change default workspace**, see [Runs and management](/en/digital-humans/manage). With [Operate Halo](/en/features/operate-halo) on, you can also just tell Halo "Move the news assistant to another workspace".
:::

## Troubleshooting {#troubleshooting}

### Halo says "Data is from a newer version" when it opens

The Halo on the new computer is older than the one on the old computer, so it can't open this data. It shows this message and quits. Update Halo on the new computer to the same version or newer, then open it again.

### A workspace shows as "Unavailable"

Its folder isn't at the original path. Put the project folder back at that path, or use **Edit › Change folder** to point at the new location, see [Keep the same paths](#same-paths). If you changed user names, the Halo data folder's own path changed too; switching back to the same user name is the easiest fix.

### The AI doesn't remember earlier context when you continue an old conversation

Only the Halo data folder was copied, not the app data folder (or `~/.claude`). Quit Halo, copy the [app data folder](#what-to-copy) as well, then open Halo again.

### The WeCom bot shows "Standby"

Halo is still running on the old computer and holds the bot. Quit Halo there, or click **Use on this device** on the card on the new computer.

### Importing says "Archive is … MB, over the 10 MB limit."

**Create Digital Human › Import** only accepts archives up to 10 MB. This package is over the limit and can't be imported there.

### Importing says a Digital Human with the same name already exists

The target workspace already has a Digital Human with that name ("A digital human with the same name already exists in this workspace."). Uninstall the existing one first, or import into another workspace.

## Next steps {#next-steps}

- [Where Halo keeps your data](/en/advanced/config-paths): what each folder holds and where the logs are.
- [Security, privacy and data flow](/en/advanced/security): how to look after the copied secrets.
- [Runs and management](/en/digital-humans/manage): more on exporting, importing and moving Digital Humans.
