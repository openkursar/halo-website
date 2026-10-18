---
title: "Config paths: Halo data, settings and log folders"
description: Config paths for Halo on macOS, Windows and Linux. Where your data, settings and credentials, logs, skills and Claude config live, and how to open each folder.
type: reference
audience: [admin, developer]
related: [advanced/migrate, advanced/security, features/settings]
---

# Where Halo keeps your data

This page lists every folder the Halo 3.0.4 desktop app uses on your computer: the Halo data folder, the app data folder, logs, diagnostic reports, workspaces and memory, skills, and the Claude config directory. Halo keeps things in two places. Your data (settings, conversations, workspaces, Digital Humans) is in the Halo data folder. The runtime environment, such as AI Browser sign-ins and Claude config, is in the app data folder. To move both to a new computer, see [Move Halo to a new computer](/en/advanced/migrate).

## At a glance {#overview}

| What | macOS | Windows | Linux |
|---|---|---|---|
| [Halo data folder](#data-folder) | `~/.halo` | `%USERPROFILE%\.halo` | `~/.halo` |
| [App data folder](#app-data-folder) | `~/Library/Application Support/halo` | `%APPDATA%\halo` | `~/.config/halo` |
| [Logs](#logs) | `~/Library/Logs/halo` | `%APPDATA%\halo\logs` | `~/.config/halo/logs` |
| [Exported diagnostics](#diagnostics) | `~/Downloads/halo-diagnostics-<timestamp>.json` | Downloads folder | Downloads folder |
| [Claude config directory](#claude-config) (default) | `~/Library/Application Support/halo/claude-config` | `%APPDATA%\halo\claude-config` | `~/.config/halo/claude-config` |
| [Global skills](#skills) (default) | `skills/` inside the Claude config directory | Same | Same |

- `%USERPROFILE%` is `C:\Users\<username>` and `%APPDATA%` is `C:\Users\<username>\AppData\Roaming`. You can paste either form into the File Explorer address bar.
- The app data and log folders are named `halo` in lowercase.
- `~/.halo` starts with a dot, so Finder hides it by default. In Finder, press <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>G</kbd> and enter `~/.halo` to open it.

::: info Note
A Halo provided by your company may use different folder names: the data folder is then `~/.<name>`, and the app data and log folders may not be called `halo` either. Trust the folder that **Log Files › Open Folder** actually opens.
:::

## Halo data folder {#data-folder}

The Halo data folder holds your settings, credentials, conversations, workspaces, Digital Humans and knowledge bases. It is `~/.halo` on macOS and Linux, and `%USERPROFILE%\.halo` on Windows.

| Item | What it holds |
|---|---|
| `config.json` | All settings, including credentials such as API keys and tokens |
| `halo.db` | Halo's local database |
| `spaces/` | Halo's data for each workspace, see [Workspace and memory data](#workspaces) |
| `spaces-index.json` | The list of workspaces |
| `temp/` | Data of the **Halo Workspace**: `artifacts/` holds the files the AI makes, `conversations/` the conversations |
| `knowledge-bases/` | [Knowledge base](/en/features/knowledge-base) data |
| `team-work/` | In-between files of [team](/en/digital-humans/collaboration) collaborations |
| `apps/`, `tunnel/`, `codex/` and others | Other runtime data |

- There is no `settings.json`. Settings are in `config.json`. The interface language is the exception: each client keeps its own.
- Stable and preview builds **share** the same data folder.
- Halo has no setting that moves the data folder. To use another location, set [`HALO_DATA_DIR`](#halo-data-dir).
- Uninstalling Halo on Windows keeps your data.
- Unpackaged builds that developers run from source use `~/.halo-dev`, so they don't touch an installed Halo.

::: warning Caution
The public build stores API keys and tokens in **plain text** in `config.json`. The UI only ever shows them as `***`. Don't send this file to anyone, and keep it out of sync folders and code repositories. See [Security, privacy and data flow](/en/advanced/security).
:::

## App data folder {#app-data-folder}

The app data folder holds the Halo desktop app's runtime environment. Its name is `halo` in lowercase.

| System | Location |
|---|---|
| macOS | `~/Library/Application Support/halo` |
| Windows | `%APPDATA%\halo` |
| Linux | `~/.config/halo` |

| Item | What it holds |
|---|---|
| `Partitions/browser/` | Sign-ins and site data of the [AI Browser](/en/features/ai-browser). **Settings › System › Browser data › Clear browser data** removes them. The top-level `Cookies`, `Local Storage` and so on belong to Halo's own window and are not cleared |
| `claude-config/` | The default [Claude config directory](#claude-config), including global skills |
| `git-bash/` | Windows only: the Git Bash that Halo downloads and installs for you |
| `Crashpad/` | Crash dumps, see [Diagnostic and crash reports](#diagnostics) |
| `logs/auth-audit.log` | Here on macOS only, see [Logs](#logs) |

## Logs {#logs}

| System | Log folder |
|---|---|
| macOS | `~/Library/Logs/halo` |
| Windows | `%APPDATA%\halo\logs` |
| Linux | `~/.config/halo/logs` |

| File | Contents | When it is written | Size and retention |
|---|---|---|---|
| `main.log` | Halo's main log | Always; switches to debug level when **Developer Mode** is on | Rotates at 10 MB and keeps 5 numbered archives (`main.1.log` to `main.5.log`) |
| `halo-sdk.log` | Activity of the Halo SDK [engine](/en/features/agent-engines) | Always; debug level in Developer Mode | — |
| `http-raw.log` | Full requests and responses | **Only while Developer Mode is on** | — |
| `auth-audit.log` | [Remote Access](/en/features/remote-access) sign-in events: success, failure, lockout and source IP. The password is never logged | When someone signs in to Remote Access | Rotates at 5 MB. On macOS it is in `~/Library/Application Support/halo/logs`; on Windows and Linux it is in the log folder |

To open the log folder: **Settings › System › Log Files › Open Folder**. <Badge type="info" text="Desktop only" />

::: danger Warning
While Developer Mode is on, `http-raw.log` records full request headers and bodies, including your API keys and conversation content. Before you send logs to anyone, turn off **Settings › Advanced › Developer Mode** and delete `http-raw.log`. When you need to share, prefer the sanitized diagnostic report.
:::

## Diagnostic and crash reports {#diagnostics}

| What | Location | How to get it |
|---|---|---|
| Diagnostic report | `halo-diagnostics-<timestamp>.json` in your Downloads folder (`~/Downloads` on macOS) | **Settings › System › System Diagnostics › Run Diagnostics**, then **Export Report**. Halo shows "Report exported to" with the full path |
| Crash reports | `Crashpad/` in the app data folder | **Settings › System › Crash Reports › Open Folder** |

- The diagnostic report contains no secrets itself. Bearer tokens, JWTs and some `sk-` keys in error messages are masked, but formats such as Anthropic keys (`sk-ant-…`) and OpenAI project keys (`sk-proj-…`) are not; the user name in `/Users` or `/home` paths is removed, in Windows paths it is not. Read it before you send it; see [Logs and diagnostics](/en/troubleshooting/diagnostics#report).
- Crash reports stay on your computer and are never uploaded. The UI says "Crash reports stay on this computer. Open the folder to send them to support when asked."

To use them for troubleshooting, see [Logs and diagnostics](/en/troubleshooting/diagnostics).

## Workspace and memory data {#workspaces}

Halo keeps its own data for every workspace centrally in the Halo data folder, separate from your project folder.

| What | Location |
|---|---|
| A workspace's Halo data (name, color, working directory, preferences, conversations) | `~/.halo/spaces/<WORKSPACE_ID>/.halo/`: `meta.json` holds the workspace details, `conversations/` the conversations |
| Workspace memory | `memory.md` and `memory/` in `~/.halo/spaces/<WORKSPACE_ID>/.halo/` |
| Files, conversations and memory of the **Halo Workspace** | `~/.halo/temp/artifacts/`, `~/.halo/temp/conversations/`, `~/.halo/temp/.halo/` |
| Digital Human memory | `~/.halo/spaces/<WORKSPACE_ID>/.halo/apps/<DIGITAL_HUMAN_ID>/`, see [Where the memory files are](/en/features/memory#files) |

- `<WORKSPACE_ID>` is a random ID, not the workspace name. Don't guess the path; open it with **Show in Folder**.
- When a workspace uses a custom folder, that folder holds only your files and the files the AI changes. Halo writes none of its own data there when it creates the workspace, and workspace memory is not kept there. Workspace skills are the exception, see [Skills](#skills).
- Workspaces created long ago may still have a `.halo/` folder inside the project folder.
- Deleting a workspace that uses a project folder removes only Halo's data (conversation history). Your project files stay. See [Workspaces](/en/features/spaces).

## Skills {#skills}

A skill is a folder that contains `SKILL.md`. Skills live in one of two places, by scope.

| Scope | Location | Who can use it |
|---|---|---|
| Global skill | `<CLAUDE_CONFIG_DIR>/skills/<skill-folder>/` | Every conversation and Digital Human in every workspace |
| Workspace skill | `<project-folder>/.claude/skills/<skill-folder>/` | That workspace only |

- With the default setting, global skills are in `claude-config/skills/` inside the app data folder. If you change the [Claude config directory](#claude-config), global skills move with it.
- When folder names match, the workspace skill takes precedence over the global one.
- Skills you put into these folders by hand are discovered too. A disabled or uninstalled skill is removed from disk.

To add, import and manage skills, see [Skills](/en/features/skills).

## Claude config directory {#claude-config}

The Claude Code engine reads skills, settings and MCP configuration from the Claude config directory, and stores its session transcripts there. The default directory is `claude-config` in the app data folder. It is the equivalent of `~/.claude/` for a standalone Claude Code CLI install.

Choose it in **Settings › Advanced › Claude CLI Integration › Config Directory**. <Badge type="info" text="Desktop only" />

| Option | Directory | Notes |
|---|---|---|
| **Halo Default** (**Recommended**) | `claude-config` in the app data folder | The default. Independent of any Claude CLI you installed separately |
| **Claude CLI Default** | `~/.claude` | Marked **High Risk** and **Not Recommended**; you confirm with **Use Shared Config**. Skills and settings are shared with Claude CLI, so changes there affect Halo. An API key or endpoint configured in the CLI overrides the model you chose in Halo |
| **Custom Path** | A directory you choose | — |

- The panel shows the path currently in effect.
- After **Apply**, Halo shows "Saved. Restart any active conversation to apply." Conversations already running pick up the new directory only after you restart them.
- To reuse skills from an existing Claude CLI without sharing the directory, use **Migrate Skills from Claude CLI** in the same section. Details of each option are in the [Settings reference](/en/features/settings#claude-cli-integration).

## Open these folders from Halo {#open-from-the-app}

These entry points work in the desktop app only. <Badge type="info" text="Desktop only" /> In the remote web client and on Android they don't open a folder.

| To open | Click in Halo |
|---|---|
| Log folder | **Settings › System › Log Files › Open Folder** |
| Crash reports | **Settings › System › Crash Reports › Open Folder** |
| Diagnostic report | **Settings › System › System Diagnostics › Run Diagnostics › Export Report**, then read the path shown |
| A workspace's working directory | On the **Manage workspaces** page, the workspace card's **More › Show in Folder**. For the **Halo Workspace** it opens `~/.halo/temp/artifacts` |
| A Digital Human's memory folder | The Digital Human's **Capabilities and settings › Advanced › App Spec › Memory Files › Reveal in Finder**. The link has this name on Windows and Linux too |
| Claude config directory | **Settings › Advanced › Claude CLI Integration › Config Directory** shows the current path; open that path in your file manager |

Workspace memory has no open button of its own. **Show in Folder** on a workspace card opens the working directory, not the place where the memory is kept.

## Change the data folder with HALO_DATA_DIR {#halo-data-dir}

If you set the environment variable `HALO_DATA_DIR`, Halo uses that folder instead of `~/.halo` as its data folder.

- A leading `~` is expanded to your home folder.
- Logs then go to `<HALO_DATA_DIR>/logs`.
- The app data folder (browser profile, `claude-config` and so on) does not move.
- It is an environment variable only; Halo has no setting for it. Set it before you start Halo.

## Database backups and newer-data protection {#backups}

Before Halo upgrades the database structure, it backs up `halo.db` as `halo.db.<timestamp>.premigrate.bak` in the Halo data folder and keeps the 2 newest backups. If the database is corrupt, Halo renames it with a `.corrupt.<timestamp>` suffix and creates a new one.

Stable and preview builds share the data folder. If a newer version (for example the [preview build](/en/advanced/updates#preview-channel)) has opened your data and you then start an older version, Halo shows the dialog "Data is from a newer version" with "This data cannot be opened":

- To avoid damaging your data, Halo stops starting up and then quits.
- The dialog shows the data directory and both versions. It suggests opening the data with the newer version, or restoring a `.premigrate.bak` backup.
- The buttons are **Open data folder** and **Quit**. The dialog follows your system language.

## Related {#related}

- [Move Halo to a new computer](/en/advanced/migrate): which two folders to take along, and what needs signing in again
- [Security, privacy and data flow](/en/advanced/security): plain-text credentials, logs and Remote Access security
- [Settings reference](/en/features/settings): what every System and Advanced setting does
