---
title: "Move Halo to a New Computer"
description: "Move Halo to a new computer: which two folders to copy and what you need to sign in to again. To take a single digital human, export it as a package and import it."
---
# Move Halo to a New Computer

Halo has no separate "export everything" feature, but all of its data lives in two folders. Copy them as described below and Halo on the new computer is the same as before: spaces, conversations, digital humans, knowledge bases, skills, MCP servers and settings all come along.

## 1. Quit Halo on the Old Computer

Click the Halo icon in the system tray (the menu bar on macOS) and choose **Quit Halo**. Make sure Halo has fully closed before copying, so you do not copy half-written files.

---

## 2. Copy These Two Folders

| | macOS | Windows | Linux |
|---|---|---|---|
| **Halo data** (settings, spaces and conversations, digital humans, knowledge bases) | `~/.halo/` | `C:\Users\<username>\.halo\` | `~/.halo/` |
| **App data** (global skills, the AI engine's conversation records, built-in browser data) | `~/Library/Application Support/halo/` | `C:\Users\<username>\AppData\Roaming\Halo\` | `~/.config/halo/` |

Copy both folders: with only the Halo data folder, old conversations are still there, but when you continue one the AI starts from a fresh context.

Also: if some spaces use your own project folders as their working directory (outside `.halo`), copy those folders too.

::: tip Branded and enterprise builds
A branded build may use different folder names (for example `.halo-enterprise`). Use the folders that actually exist on your computer.
:::

::: warning The copied files contain secrets
The Halo data folder holds the API keys, email password and IM bot credentials you entered. Keep the copy safe, delete any transfer copies afterwards, and never put them in a public cloud folder or repository.
:::

---

## 3. Put Them Back on the New Computer

1. Install Halo (the same version or newer). If it opened after installation, quit it first.
2. Place both folders in the same locations on the new computer, replacing the freshly created ones.
3. Put project folders at the **same paths** as on the old computer.
4. Open Halo and check that your AI models, spaces, digital humans and knowledge bases are all there.

::: warning Use the same operating system and user name
Halo records the full path of every space. Use the same operating system and the same user name on the new computer (so your home folder path does not change), and put project folders back at their original paths; otherwise those spaces show as unavailable.
:::

---

## 4. What You Need to Sign In to Again

- **Websites you signed in to in the built-in browser**: browser sign-ins are tied to the computer, so sign in again once in Halo's browser.
- **Claude Code CLI sign-in (macOS)**: its credentials are kept in the system keychain; sign in again under Settings → AI Model.
- Other AI sources, email and IM bot settings come along. If one reports that its credentials are invalid on the new computer, enter them again or sign in again in its settings.

---

## 5. What About the Old Computer

Once the new computer is working, **do not run the same setup on both computers at the same time**:

- A WeCom bot works on only one computer at a time; a Feishu bot connected from two computers has its messages split at random between them.
- The permanent remote-access address moves to the new computer with your settings, so do not turn on remote access on the old one.

When everything works on the new computer, you can uninstall Halo from the old one. Uninstalling does not delete the data folders; delete the two folders above by hand if you no longer need them.

---

## Taking Just One Digital Human

If you do not need to move everything, export a single digital human as a package:

1. On the old computer, open the digital human and choose **More** (top right) → **Share** → **Export** to save a `.dhpkg` file.
2. On the new computer, go to **My Digital Humans**, click **Create Digital Human** → **Import**, and choose the file.

The package contains the digital human's definition and the skills it ships with. It does not contain conversations, memory, knowledge base contents or IM channel bindings — reconnect IM channels and check the knowledge bases to use on the new computer.
