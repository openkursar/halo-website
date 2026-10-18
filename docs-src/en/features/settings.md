---
title: "Settings reference: every option and its default"
description: Every Halo Settings section, field by field, from AI Model to About. What each option does, its default and range, and which ones are desktop-only.
type: reference
audience: [beginner, office, developer, admin]
related: [features/models, features/remote-access, advanced/security, advanced/updates]
---

# Settings reference

Click **Settings** in the left navigation rail to open Settings. It has 9 sections, in the same order as this page: **AI Model**, **Message Channels**, **App Store**, **Appearance**, **System**, **Advanced**, **Remote Access**, **Recommend Halo** and **About**. This page lists what every option does, its default and its limits in Halo 3.0.4. For step-by-step instructions, follow the link in each row. Options without a **Save** button take effect as soon as you change them.

Halo can't change these general settings for you. You change theme, language, permissions, system behaviour and Remote Access yourself. The one thing it can do is switch the model source or model, and only after you turn on **Operate Halo**. See [what stays manual](/en/features/operate-halo#what-stays-manual).

::: info Note
A Halo provided by your company may show different options. Sign-in methods, message-channel help links, store sources, browser allowed sites, Internet Access and the built-in gateway can all depend on the build. Your screen is the authority.
:::

## Desktop-only settings {#desktop-only}

When you open Settings in a browser (through Remote Access) or in the Android app, the items below are not shown. You can only change them on the computer that runs Halo.

| Item | In the remote web client and the Android app |
|---|---|
| The **System**, **Advanced** and **Remote Access** sections | the whole section is hidden |
| **Appearance › Display Size** | hidden; use the browser's own zoom |
| Claude Code CLI sources in **AI Model** | hidden |
| Other sections (AI Model, Message Channels, App Store, Appearance, Recommend Halo, About) | available; changes are saved to the same Halo |

## AI Model {#ai-model}

**Settings › AI Model** manages every AI source you've connected (an account or an API key) and picks which one new conversations use by default. Each conversation picks its own model in the model card next to the composer. Signing in, API keys, multiple accounts and per-model options are covered in [Models and accounts](/en/features/models).

| Item | What it does | Default | Notes |
|---|---|---|---|
| Source list (radio buttons) | The selected source becomes the global current source | — | A source you just saved becomes current. Delete the current source and the first one left in the list takes over |
| **Provider**, **Auth Type**, **API URL** (expanded card) | Show the source's type and address | — | **API URL** appears on API-key sources only |
| **Edit** / **Delete** | API-key sources: change it, or delete it (confirm with **Confirm Delete**) | — | — |
| **Edit** / **Logout** | Sign-in sources: rename the account and change model settings, or sign out | — | **Logout** has no confirmation step |
| **Remove** | Claude Code CLI source: remove it from Halo | — | The CLI keeps its own login. macOS only; hidden in remote clients |
| **Add AI Provider** | Add an API-key source | — | — |
| **OAuth Login** group | Sign in with an account, such as Claude, ChatGPT or GitHub Copilot | — | Which sign-in methods are listed depends on the build |
| **Preset API** group | Fixed gateways preset by the build; you only enter an API key | not shown | Appears only in builds that preset a gateway |

## Message Channels {#message-channels}

**Settings › Message Channels** sets up the channels that carry messages between people and Digital Humans. The first 3 cards are two-way bots, the last 5 are one-way notifications. You can add several instances of each bot. Text fields save automatically 500 ms after you stop typing. This section works the same in the remote web client and the Android app.

| Card | Direction | What it does | Details |
|---|---|---|---|
| **WeChat Bot** | **Bidirectional** | Personal WeChat, signed in by QR code; direct chats only | No owner/guest permission control: everyone who messages it is treated as the owner |
| **Feishu Bot** | **Bidirectional** | A Feishu or Lark bot, via **Scan to add** or **Manual setup** | [Message channels](/en/digital-humans/channels) |
| **WeCom Intelligent Bot** | **Bidirectional** | A WeCom bot, via **Scan to add** or **Manual setup** | [Message channels](/en/digital-humans/channels) |
| **Email** | **One-way** | Sends mail over SMTP; the same settings power Digital Humans' email capability | [Email](/en/features/email) |
| **WeCom**, **DingTalk**, **Feishu** | **One-way** | Notifications through a self-built WeCom, DingTalk or Feishu app | [Message channels](/en/digital-humans/channels) |
| **Webhook** | **One-way** | Posts notifications as JSON to your URL | [Message channels](/en/digital-humans/channels) |

**Scan to add** from Settings always creates a new Digital Human and binds the bot to it. To give an existing Digital Human a bot, start from that Digital Human instead. See [Message channels](/en/digital-humans/channels).

## App Store {#app-store}

**Settings › App Store** only manages the sources (registries) the Store reads from. It is not the Store itself. You browse and install from **Store** in the navigation rail; see [Store](/en/digital-humans/store). To add a private source, see [Private store](/en/advanced/private-store).

| Item | What it does | Default | Notes |
|---|---|---|---|
| Source list | Each row shows the name, type, URL and a switch | all 5 built-in sources on | Turning one off hides its items in the Store. Things already installed from it keep working |
| **Add Registry** | Enter **Name** and URL, then click **Add** | — | http/https only; must not point to localhost, a private IP or a link-local address |
| **Remove registry** (trash icon) | Deletes a source you added | — | Built-in sources can't be deleted, only switched off |
| **Smithery API key (optional)** | Optional key for the Smithery source | empty | Shown on the Smithery row only |

The Store list refreshes as soon as you make a change.

## Appearance {#appearance}

| Item | What it does | Default | Notes |
|---|---|---|---|
| **Theme** | **Light**, **Dark** or **Follow System** | **Follow System** | Saved in Halo: changing it from a remote client changes the desktop app too |
| **Display Size** | Zoom for the whole interface, 50%–150% in 10% steps | 100% | Desktop only. Also <Shortcut mac="⌘ +" other="Ctrl +" /> to enlarge, <Shortcut mac="⌘ −" other="Ctrl −" /> to shrink, <Shortcut mac="⌘ 0" other="Ctrl 0" /> to reset; **Reset** returns to 100% |
| **Language** | Interface language: Deutsch, English, Español, Français, 日本語, 简体中文, 繁體中文 | follows the system language on first launch, English if there's no match | Saved per device: your phone and computer can use different languages |
| **Send Key** | **Enter** sends (Shift+Enter for a new line), or **Ctrl+Enter** sends (Enter for a new line) | **Enter** | The label says Ctrl on macOS too |

The tray menu, the app menu and some system dialogs are English only and don't follow **Language**.

## System <Badge type="info" text="Desktop only" /> {#system}

**Settings › System** starts with the **Permissions** card, followed by the system settings.

| Item | What it does | Default | Notes |
|---|---|---|---|
| **Permissions** (badge **Full Permission Mode**) | States that the AI runs operations without asking you one by one | **Trust Mode** on | The switch is locked on. See [tool permissions](/en/advanced/security#tool-permissions) |
| **Browser Allowed Sites** | Adds your own sites to the AI Browser's allowlist | not shown | Appears only in some builds. See [AI Browser](/en/features/ai-browser) |
| **Browser data › Clear browser data** | Clears cookies, site storage and cache of the shared browser | — | New in 3.0.4. Signs out of every site, including the ones Digital Humans use. Halo data is kept. Can't be undone |
| **Auto Launch on Startup** | Starts Halo when you log in to the OS | off | Works on macOS and Windows; has no effect on Linux |
| **Task Notifications** ("Notify when a task completes in the background") | An OS notification when a conversation finishes a turn while the Halo window isn't in front | off | Clicking it brings Halo forward. Digital Human notifications don't depend on it; set them in the Digital Human's **Capabilities and settings › Messages & Notifications › System Notifications** |
| **Proxy** | The proxy for Halo's own traffic: model requests, the Store, and the AI engine and MCP processes Halo starts. Update checks and downloads don't use it; they always use the system proxy | empty = system proxy | `http://` and `https://` only. Click **Save** or press <kbd>Enter</kbd>. A SOCKS proxy set in the OS works only while this field is empty |
| **Don't use the proxy for** | Addresses that skip the proxy, comma-separated | empty | New in 3.0. `.example.com` matches subdomains only; add `example.com` for the domain itself. IP ranges such as `10.0.0.0/8` work. Local addresses never use the proxy. Changes apply to conversations started afterwards |
| **Also apply to AI Browser** | Makes the AI Browser use the proxy above | off | Appears only after you enter a proxy URL; when off, the AI Browser uses the system proxy |
| **Browser User-Agent** | Replaces the User-Agent the AI Browser sends | empty = built-in default | Up to 1024 characters. Applies to open pages as soon as you save |
| **Log Files › Open Folder** | Opens the log folder in your file manager | — | `main.log` rotates at 10 MB and keeps 5 archives. Locations: [Where Halo keeps your data](/en/advanced/config-paths) |
| **Crash Reports › Open Folder** | Opens the crash dump folder | — | New in 3.0. Reports stay on this computer and are never uploaded |
| **Restart Halo › Restart** | Restarts the app | — | Asks first, because it interrupts all active conversations and background tasks |
| **System Diagnostics › Run Diagnostics** | A health check that reads "System Healthy" or "Issues Detected" | — | Expand it for system info, health metrics, process and service status, and the 5 latest errors |
| **Recovery Actions**: **Reset AI Engine**, **Restart App** | Kills all AI sessions and restarts the engine, or restarts the whole app | — | Try **Reset AI Engine** first; it fixes most issues |
| **Copy Report** / **Export Report** | Copies the diagnostics text, or saves `halo-diagnostics-<timestamp>.json` to your Downloads folder | — | The report is sanitized: API keys and tokens are masked, and the user name in paths is removed |

For troubleshooting steps, see [Logs and diagnostics](/en/troubleshooting/diagnostics). For proxy setups, see [Model gateway and proxy](/en/advanced/gateway-and-proxy).

## Advanced <Badge type="info" text="Desktop only" /> {#advanced}

The section opens with a banner: "Changes here affect all AI agent behavior. New settings take effect on the next conversation."

### AI Agent Engine {#agent-engine}

| Option | Description | Default | Notes |
|---|---|---|---|
| Claude Code SDK | The official Anthropic Claude Code engine | yes | — |
| Halo SDK | Halo's own engine, light on resources with faster startup | — | <Badge type="warning" text="Experimental" /> |
| Codex SDK | The OpenAI Codex engine, better suited to GPT-family models | — | <Badge type="warning" text="Experimental" /> |
| DeepSeek dsh | The DeepSeek dsh runtime, best with DeepSeek models | — | <Badge type="warning" text="Experimental" />, new in 3.0 |

A change needs a restart. When "Restart required for the engine change to take effect." appears, click **Restart Now**. The new engine applies only to new conversations and new tasks; existing conversations can't switch engines. An engine missing from your build shows **Not included in this build** and can't be selected. How the engines differ: [Agent engines](/en/features/agent-engines).

### Built-in MCP Extensions {#built-in-mcp-extensions}

Click **Built-in MCP Extensions** to expand it. Apart from Digital Humans, these rows show in English in every UI language.

| Item | What it does | Default |
|---|---|---|
| Plan Mode | Step-by-step planning with approval before running | off |
| Git Worktree | Parallel branch work in a separate git worktree | off |
| Scheduled Tasks | The AI engine's own cron tools (Halo has its own schedules) | off |
| Notebook Editing | Edits Jupyter notebook (.ipynb) cells | off |
| **Digital Humans** | Create, manage and schedule Digital Humans from a conversation | on |
| Cross-Conversation Interop | Lets a conversation list, read and message other conversations in the same workspace | on |
| Cross-Conversation Sending | Allows delivering messages to other conversations, not just reading them; only applies while the row above is on | on |

Every extra tool adds tokens to each message. Start a new session or restart Halo for a change to take effect. What these tools do: [built-in tools](/en/features/capabilities#built-in-tools).

### Turn, team and conversation limits {#limits}

| Item | What it does | Default | Range |
|---|---|---|---|
| **Max Turns per Message** | How many tool-call rounds the AI may run for one message | 999 | 10–9999. An old setting of 50 is raised to 999 automatically on upgrade to 3.0 |
| **Digital Team Turn Timeout** | How long one team member's turn may run | 60 minutes | 5–1440 minutes; new in 3.0 |
| **Digital Team Circuit Breaker Limits › Max messages per run** | A team run stops automatically past this many messages | 2000 | 10–5000; new in 3.0 |
| **Digital Team Circuit Breaker Limits › Max chained replies** | Cap on Digital Humans replying back and forth; resets when a person steps in | 8 | 1–100; new in 3.0 |
| **Digital Team Concurrency Limit** | Team member turns running at the same time on this computer | 10 | 1–100; new in 3.0 |
| **Active Conversation Limit** | Conversations kept ready at once; each keeps an AI process in memory | 20 | 2–50; new in 3.0. Beyond the limit, the least recently used pause and resume on their next message. Halved automatically when memory is low |

### Developer Mode {#developer-mode}

**Developer Mode** (badge **Dev**) is off by default. Turning it on starts verbose logging at once: `main.log` switches to debug level and a separate `http-raw.log` is written. It unlocks nothing else. The hint reads "Generates large log files and may affect performance. Disable after troubleshooting."

::: danger Warning
While Developer Mode is on, `http-raw.log` records full request headers and bodies as they are, including your API keys and conversation content. Turn Developer Mode off before you send logs to anyone. To share details, prefer the sanitized **Export Report** in **System Diagnostics**.
:::

### Claude CLI Integration {#claude-cli-integration}

Three expandable panels at the bottom of the section decide where the Claude Code engine reads skills, settings and MCP config from.

| Item | What it does | Default | Notes |
|---|---|---|---|
| **Config Directory › Halo Default** | Halo's own separate config directory | yes (**Recommended**) | Doesn't touch a Claude CLI you installed separately |
| **Config Directory › Claude CLI Default** | Shares `~/.claude` with your standalone Claude CLI | — | Tagged **High Risk** and **Not Recommended**, with a confirmation. An API key or endpoint set in the CLI overrides the model chosen in Halo |
| **Config Directory › Custom Path** | Uses a directory you choose | — | After **Apply**, restart any active conversation for it to take effect |
| **Migrate Skills from Claude CLI** | **Scan** `~/.claude/skills/`, choose **Skip**, **Overwrite** or **Rename (+cc)** per skill, then **Migrate** | — | **Rename (+cc)** appears only when Halo already has a skill with that name |
| **Migrate MCP Servers from Claude CLI** | **Scan** `~/.claude.json`, choose **Skip** or **Overwrite** per server, then **Migrate** | — | — |

## Remote Access <Badge type="info" text="Desktop only" /> {#remote-access}

**Settings › Remote Access** lets a phone, tablet or another computer use this computer's Halo in a browser. Full steps: [Remote Access](/en/features/remote-access).

| Item | What it does | Default | Notes |
|---|---|---|---|
| **Enable Remote Access** | Starts the web server on this computer | off | Shows **Local Address**, **LAN Address**, **Access Password** and **Connected Devices** |
| **Access Password** | The password for signing in from a remote client | auto-generated, 12 characters | A custom password needs 8–64 characters with upper case, lower case and a digit |
| **Internet Access › Start Tunnel** | Gets a permanent public address for this device | off | Needs internet, no account. **Change address** stops the old address at once. Missing in some builds |
| **Scan to Access** | A QR code that opens the public address on a phone | — | Shown only while the tunnel runs; the code holds no password |
| **Federation Gateway** | A relay server so team members on other networks can join | empty (LAN-only teams) | Shown even when Remote Access is off. Restart Halo to apply changes to existing team connections. See [Federation Gateway](/en/advanced/federation-gateway) |

::: danger Warning
Anyone with the access password has full control of this computer's Halo, including reading and writing files and running commands. Internet access is relayed through a tunnel service and Halo's address service; it is not peer-to-peer.
:::

## Recommend Halo {#recommend}

"Like it? Help spread the word"

| Item | What it does |
|---|---|
| **Star on GitHub** | Opens the project page |
| **Copy Link** | Copies the project address |
| **Share to**: **WeChat**, **Xiaohongshu**, **Bilibili** | Opens ready-made share text; click **Copy to Clipboard** and paste it yourself |
| **Share to**: **Weibo**, X (Twitter) | Opens that site's share page |

The share text is in Chinese when the UI language is Chinese, and in English otherwise.

## About {#about}

**Settings › About** is also shown in the remote web client and the Android app. Updates in full: [Updates](/en/advanced/updates).

| Item | What it does | Notes |
|---|---|---|
| **Version** | Shows the version and build time, e.g. `3.0.4 (<build date>-<time>)` | Preview builds show a **Preview channel** badge. There is no channel switch in the UI |
| **Check for updates** | Checks once, right now | The button shows **Checking...**, download progress, then **New version available** or **Already up to date**; on failure **Check failed — tap to retry**. A manual check clears any "Remind me later" |
| **Build** | Shows "Powered by Claude Code" | — |
| **Help**: **Docs**, **Feedback** | Opens the docs site, or GitHub to report an issue | — |

Halo also checks on its own: 5 seconds after launch, then every 60 minutes, and after the computer wakes from sleep. New versions download in the background with no notice while downloading. When one is ready, a single prompt appears:

| Situation | Button in the prompt |
|---|---|
| macOS, Linux, and Windows fast updates | **Restart now** (restarting takes only a few seconds) |
| Windows installer path | **Install now** (Halo closes and the installer takes over) |
| Not now | **Remind me later**: no prompt for this version for 6 hours |
| The publisher marks the update mandatory | No **Remind me later** and no close button |
| Automatic update failed | **Go to download** opens the release page for a manual download |

## Related {#related}

- [Models and accounts](/en/features/models): sign in, API keys, multiple accounts and per-model settings
- [Remote Access](/en/features/remote-access): full steps for using Halo from a phone or another computer
- [Security, privacy and data flow](/en/advanced/security): Full Permission Mode, credential storage and Remote Access risks
- [Updates](/en/advanced/updates): automatic updates, Windows fast updates and mandatory updates
