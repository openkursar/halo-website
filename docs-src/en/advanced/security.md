---
title: "Security and permissions: data and AI access"
description: Security and permissions in Halo — what leaves your computer, how keys are stored, what the AI, IM guests and colleagues may do, and Remote Access risks.
type: explanation
audience: [admin, office]
related: [advanced/config-paths, features/operate-halo, digital-humans/permissions, features/remote-access]
---

# Security, privacy and data flow

Halo runs on your own computer. Conversations, files, memory and keys are stored locally, and Halo has no cloud service that keeps them. What leaves the computer is mainly the conversation content sent to the model provider you chose, plus the connections you turn on yourself. When you use Halo yourself, the AI runs tools without asking each time; for IM guests and colleagues on other computers, Halo applies the limits you set.

This page covers the public build of Halo 3.0.4. A Halo provided by your company may have different settings for credential encryption, browser access, tunnels and more. Your screen is the authority.

## What stays local and what leaves the computer {#data-flow}

The table lists every party Halo connects to on its own. All other data stays on your computer.

| Connects to | When | What is sent | How you control it |
|---|---|---|---|
| The model providers you configure (Claude, ChatGPT, GitHub Copilot, a custom API and so on) | Every conversation and every Digital Human run | The conversation context: your messages, attachment contents, files and tool results the AI reads | Choose the provider in **Settings › AI Model**, see [Models and accounts](/en/features/models). How the content is handled follows that provider's policy |
| Sign-in services (each provider's OAuth sign-in) | When you sign in and when a token refreshes | The authorization data needed to sign in | Sign out of accounts you no longer use in **Settings › AI Model** |
| Store sources (the Digital Human Protocol official source, MCP Official Registry, Smithery, Claude Skills Registry, SkillHub) | When you open the Store; every 6 hours to check installed items for updates | Catalog queries; package downloads when you install | Turn off sources you don't need in **Settings › App Store** |
| The update feed (the project's releases page on GitHub) | 5 s after launch, every 60 minutes, and after the computer wakes | A version check; the installer download when a new version exists | See [Update Halo](/en/advanced/updates) |
| Usage statistics (Google Analytics, Baidu Tongji) | While Halo runs | Usage events such as launch, which page was opened, a message was sent, a Digital Human ran; together with a random install ID created on this computer, plus the version, operating system and similar details. Message events only record that a message was sent, not its text | The public build has no switch in Settings to turn this off |
| The tunnel and Halo's address service | Only after you start the tunnel in **Settings › Remote Access › Internet Access** | All traffic between remote clients and this Halo, relayed through a Cloudflare tunnel; on the first start, a request to Halo's address service for this device's permanent address | **Stop Tunnel**. See [Remote Access](#remote-access) |
| Federation Gateway | Only after you fill in **Federation Gateway** | Traffic of teams across networks; the gateway only relays it | Leave it empty to keep teams on the local network. The public build has no built-in gateway, see [Federation Gateway](/en/advanced/federation-gateway) |
| IM platforms (WeCom, Feishu, WeChat) | When a bot is connected | Messages the bot receives and sends, and files it sends | Disconnect or delete the bot in **Settings › Message Channels** |
| Web search | When the AI searches the web | The search terms, sent to Bing (English) or Baidu (Chinese) by default; Google only when asked for | This is a built-in capability and always available |
| Websites the AI Browser visits | While **Web Control** is on (on by default in new conversations, then your last choice carries over) | Normal web traffic, carrying your sign-ins in the Halo browser | Turn off **Web Control** in the composer under **+ › Capabilities**, see [AI Browser](#browser) |
| MCP servers and mailboxes you add yourself | When they are called | Depends on that server or mail service | Manage them in the Capability library or **Settings › Message Channels** |

A few more points:

- **Crash reports stay on this computer.** Halo does not upload them. If support asks, open **Settings › System › Crash Reports › Open Folder** and send them yourself.
- **Proxy**: **Settings › System › Proxy** applies to Halo's own traffic: model requests, the Store, and the AI and MCP processes Halo starts. Update checks and downloads always use the system proxy. The AI Browser uses the system proxy unless you turn on **Also apply to AI Browser**. See [Gateway and proxy](/en/advanced/gateway-and-proxy).
- **With Remote Access on, this computer accepts connections.** Halo listens on all network interfaces (default port 3456), and any device on the same local network can connect with the access password.

## Where data lives {#data-location}

Halo keeps its data in two folders:

| Folder | What it holds |
|---|---|
| `~/.halo` (Windows: `%USERPROFILE%\.halo`) | `config.json` (settings and credentials), `halo.db`, workspaces, knowledge bases, team work records and more |
| The app data folder (macOS: `~/Library/Application Support/halo`) | The AI Browser's cookies and sign-ins, the AI engine's config directory, crash reports |

For the full paths on each OS, log locations and the `HALO_DATA_DIR` environment variable, see [Config and data paths](/en/advanced/config-paths).

## Keys and credentials {#credentials}

- **The public build stores credentials in plain text.** API keys, sign-in tokens, the Remote Access password and similar secrets are written in plain text to `~/.halo/config.json`; MCP server environment variables and headers, and values entered in a Digital Human's configuration, are also stored in plain text in Halo's data folder. Anyone or any program that can read these files can read them.
- **Secrets in Settings only show as `***`.** Model service API keys and sign-in tokens, message channel secrets and the Remote Access password are masked in the desktop app, the Remote Access web page, the Android app and API responses. **Exception**: MCP server environment variables and headers, values entered in a Digital Human's configuration and a Store source's API key are shown and returned as stored, so remote clients and the HTTP API holding the access password can read them. Content the AI reads through [Operate Halo](/en/features/operate-halo) has all of these masked.
- **Encryption at rest is a build option, and the public build doesn't enable it.** A company build can turn it on, and then credentials are stored encrypted. Older release notes that mention "credentials encrypted locally" do not apply to the public 3.0.4 build.
- **The Claude Code CLI sign-in doesn't store its token in Halo.** With the **Claude Code CLI** sign-in, the CLI stores and refreshes its own credential, and Halo keeps no token.

So protect the data folder as you would a keychain:

- Don't put `~/.halo` in a cloud-sync folder, a shared folder or a public backup.
- Don't send `config.json` to anyone. For troubleshooting, use **Settings › System › System Diagnostics › Export Report** instead: the report contains no secrets itself and masks Bearer tokens, JWTs and some `sk-` keys in error messages, but not formats such as Anthropic keys (`sk-ant-…`) or OpenAI project keys (`sk-proj-…`), so read it before you send it; see [Logs and diagnostics](/en/troubleshooting/diagnostics#report).
- Protect the computer with a sign-in password and don't share your OS account.
- Choosing **Claude CLI Default** under **Settings › Advanced › Claude CLI Integration › Config Directory** shares `~/.claude` with a standalone Claude CLI and is marked **High Risk**. Unless you need it, keep **Halo Default**.

## The AI runs tools without asking each time {#tool-permissions}

When you use Halo yourself, the AI runs commands, edits and deletes files, and calls tools **without asking for your approval first**.

At the top of **Settings › System**, the **Permissions** card shows the badge **Full Permission Mode** and a **Trust Mode** switch ("Automatically execute all operations") that is always on and cannot be turned off. Halo 3.0.4 has no "ask me before each call" mode.

The only thing that makes the AI stop and wait for you is the question card it shows in a conversation: it continues after you answer. Unattended contexts, such as IM chats and scheduled runs, cannot use that card.

These are the limits that do apply:

| Limit | Effect |
|---|---|
| The folder behind a workspace | The AI works mainly inside the workspace. Point workspaces only at folders you're comfortable letting the AI change |
| Composer **+ › Capabilities** | Switches such as **Web Control**, **AI Terminal** and **Operate Halo** decide whether the AI has those tools. The AI cannot turn a switch on itself, see [Capabilities](/en/features/capabilities) |
| **Settings › Advanced › Built-in MCP Extensions** | Turning off a group of built-in tools removes them from the AI |
| Requests not made by you | IM guests and colleagues on other computers are bound by permission settings, see [IM guests](#guests) and [Other computers](#other-computers) |

**Operate Halo** is off by default. When it is on, the AI can change **every** workspace, Digital Human and team in this Halo through Halo's own API, not only the current workspace, and deletions have no confirmation dialog; only actions that cannot be undone come with an instruction for the AI to confirm with you in plain language first. Even with it on, the AI cannot add model sources, change general settings such as permissions or appearance, or touch Remote Access. A few routes do accept secrets (an existing WeChat bot's token, a Store source's API key; the route that edits a model source would also take an API key, but Halo tells the AI not to send one). A key typed into a conversation stays in the conversation history and is sent to your model provider, so enter keys in Settings yourself. See [Operate Halo safety](/en/features/operate-halo#safety).

## What the logs contain {#logs}

| Log | Contents | Note |
|---|---|---|
| Normal log (`main.log`) | Runtime information and errors. Secrets are masked before writing | Rotates at 10 MB, keeps 5 archives |
| Remote Access audit log (`auth-audit.log`) | Remote sign-in successes, failures and lockouts | Never contains the password |
| `http-raw.log` (only while **Developer Mode** is on) | Full headers and bodies of the HTTP requests Halo sends, **including API keys and conversation content**, with nothing masked | Turn Developer Mode off as soon as you're done, and delete this file |

**Developer Mode** is under **Settings › Advanced** and is off by default. Its hint reads "Generates large log files and may affect performance. Disable after troubleshooting." Open the log folder from **Settings › System › Log Files › Open Folder**.

::: warning Don't send http-raw.log as is
This file contains your API keys and full conversations. When someone needs diagnostic information, give them the masked report from **System Diagnostics › Export Report**.
:::

## What IM guests can do {#guests}

Once a Digital Human is connected to a WeCom or Feishu bot, the people who message the bot fall into two groups:

| Role | How Halo decides | What they can do |
|---|---|---|
| Owner | People in the **Owner User IDs** list | The same as you on this computer, with no limits |
| Guest | Everyone else | Only the tools you open to guests |

Key points:

- **Permission Control** is in **Settings › Message Channels › (bot card) › Permissions**. When it is off, the card reads "Everyone has full access": every sender counts as an owner.
- For WeCom and Feishu bots created with **Scan to add a bot**, **Permission Control** is turned on automatically. While the owner list is empty, **the first person to message the bot directly becomes its owner**. Group chats never claim an owner, and an ownerless bot does nothing in a group. So after scanning, send the bot a direct message yourself first.
- In the public build, bots added by hand start with **Permission Control** **off**. If anyone else will message the bot, turn it on.
- With **Guest Access** off, "Guests can only chat and use memory": guests still get replies, they just can't use tools.
- When you turn on **Guest Access** for the first time, only **Read files**, **Find files** and **Search contents** are open, limited to this workspace. Web pages, writing files, running commands and the rest must be opened one by one.
- Guests never get **Operate Halo**, and cannot make the Digital Human push IM messages to other people. When a group's messages from owners and guests are handled together, they run with the guest's permissions.
- **Personal WeChat bots have no Permission Control**: everyone who messages one has owner access. Use it only where you alone will message it, see [Personal WeChat](/en/digital-humans/personal-wechat).

::: info
A Halo provided by your company may turn Permission Control on by default or preset the tools guests may use.
:::

For what each switch does, how to find your own user ID and example setups, see [Owner and guest permissions](/en/digital-humans/permissions).

## Requests from other computers {#other-computers}

In a [team across computers](/en/digital-humans/cross-computer-teams), a colleague's Digital Human, or the colleague in person, can ask your Digital Humans for work. Those requests run **on your computer**, limited by what you set for each member:

- When you invite, join or add a member, Halo asks "What the people you invite can have your digital humans do", with the answers **Read only**, **Read and write files** and **Everything it can normally do**. In 3.0.4 the default is **Read only**.
- You can fine-tune it later in the member's **What others can ask it to do** setting, which uses the same switches as IM guests.
- A request from another computer can always use memory, and its file access is limited to this workspace. Only with everything on can it reach files outside the workspace the way you do.
- **Operate Halo** is never lent to a colleague.
- A member added earlier and never set up separately shows "Not set separately yet: people on other computers can use everything it can do." If you see this, choose a scope for it.
- Your own use, and your own Digital Humans working together, are never limited by these settings.

With a Federation Gateway, the gateway only relays traffic and does not store team content. Halo does not add its own encryption at the gateway layer, though, so a gateway admin who turns on the diagnostic `room.trace` setting gets members' message text in the logs. Use only a gateway you trust and deploy it behind HTTPS / WSS; see [what the gateway sees](/en/advanced/federation-gateway#what-it-sees).

## Risks of Remote Access {#remote-access}

Once **Settings › Remote Access** is on, anyone who has the access password has full control of this Halo. The **Security Warning** in the UI reads: "After enabling remote access, anyone with the password can fully control your computer (read/write files, execute commands)."

| Fact | Detail |
|---|---|
| Password | Auto-generated, 12 characters, or your own, 8–64 characters with upper- and lowercase letters and a digit. It never expires. Changing it signs out every connected client |
| Per-IP lockout | 5 failures within 5 minutes lock that IP for 15 minutes |
| Global lockout | 10 failures within 60 minutes across all IPs lock out every client, you included, for 30 minutes |
| Lockout alert | A desktop system notification. Restarting Halo resets the counters |
| Local network | Uses `http://`, unencrypted. On a public network, use the tunnel's HTTPS address instead |
| Internet Access | Relayed through a Cloudflare tunnel and Halo's address service — **not a peer-to-peer connection**. The QR code holds only the address, not the password |

Turn Remote Access off, or stop the tunnel, when you don't need it. If you suspect the password has leaked, change it at once, and use **Change address** to replace the public address if needed. See [Remote Access safety](/en/features/remote-access#safety).

## AI Browser sign-ins {#browser}

- Every browser page in Halo shares one set of cookies and sign-ins: your tabs, pages the AI opens and Digital Humans' pages alike. Sign in once, and the AI and your Digital Humans can use that site as you.
- Sign in only to sites where you're comfortable letting the AI act for you.
- **Settings › System › Browser data › Clear browser data** signs every site out, including sites your Digital Humans use, and cannot be undone. Halo's own data is kept.
- The public build doesn't restrict which sites the AI Browser can open. An allowlist that limits access exists only in company builds; where such a build allows it, **Browser Allowed Sites** appears under **Settings › System**.

For more, see [AI Browser](/en/features/ai-browser).

## Limits on sending files over IM {#file-send}

In an IM chat, the AI can send reports, images and PDFs back to the chat, but **only files inside the Digital Human's workspace or the system temp folder**.

- Shortcuts (symbolic links) are resolved to their real location before the check.
- Folders closed to a restricted conversation (a guest's, for example) cannot be sent from either.
- The same rule applies to files attached when a Digital Human pushes an IM message on its own.
- The guest tool settings also have a separate **File Send** switch that decides whether guests can have the AI send files.

So don't keep sensitive files in the workspace of a Digital Human behind a public-facing bot.

## Halo Server's default token {#server-token}

If `HALO_REMOTE_PASSWORD` is not set, Halo Server uses the default token `halo123`. Anyone can guess it, and at 7 characters it is too short to sign in from the browser or the Android app. Always set a strong password of 8 or more characters before deploying, see [Server configuration](/en/server/configuration).

## Checklist for admins {#checklist}

- [ ] Workspaces point only at folders you're comfortable letting the AI change.
- [ ] `~/.halo` is not in a cloud-sync folder, a shared folder or a public backup.
- [ ] **Developer Mode** is off, and old `http-raw.log` files are deleted.
- [ ] Every public-facing WeCom and Feishu bot has **Permission Control** on, you are the owner, and guests have only the tools they need.
- [ ] No personal WeChat bot is used where several people will message it.
- [ ] In teams across computers, every member has **What others can ask it to do** set, and none shows "Not set separately yet".
- [ ] **Operate Halo** is off when not needed; new conversations carry over your last choice.
- [ ] Remote Access uses a strong password and is off when not needed; the tunnel is stopped when not in use.
- [ ] The AI Browser is signed in only to the sites it needs.
- [ ] Halo Server has its own `HALO_REMOTE_PASSWORD`.

## Next steps {#next-steps}

- [Owner and guest permissions](/en/digital-humans/permissions): set which tools IM guests may use, switch by switch
- [Operate Halo](/en/features/operate-halo): learn what it can change before you turn it on
- [Config and data paths](/en/advanced/config-paths): find the folders to protect and back up
