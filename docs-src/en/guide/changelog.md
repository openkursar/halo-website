---
title: "Changelog: what's new in each Halo release"
description: "Halo changelog: new features, improvements and fixes in each release, newest first, taken from Halo's release notes."
type: reference
audience: [beginner, office, developer, admin]
outline: [2, 2]
editLink: false
generated: true
---

# Changelog

The release notes of every Halo version, newest first. Each entry describes the release as it shipped; features may have changed since, so the feature pages describe how things work today. For security as it stands now, such as how credentials are stored, see [Security, privacy and data flow](/en/advanced/security).

<!-- public:start -->
To hear about new versions, subscribe to the [RSS feed](/en/feed.xml).
<!-- public:end -->

## 3.0.4 · 2026-10-17 {#v3-0-4}

Halo 3.0: Digital human teams · New home and interface · Feishu bot · Everyday assistant and reminders · Conversations that work together and operate Halo · Evolving memory · Office documents · Multiple accounts and model choice

- Digital human teams: several digital humans can divide the work, talk to each other and share results. Form a team for the task at hand or save it as a standing team, and invite colleagues to collaborate from their own computers with their own digital humans.
- New home and interface: entry points for conversations, digital humans, knowledge bases and the store are reorganized, the main chat experience is unified, and running tasks and pending questions are gathered in one place.
- Feishu bot: new two-way Feishu integration — hand work to a digital human from Feishu, or reach the collaborating team behind a team member.
- Everyday assistant and reminders: set one-off or recurring reminders for meetings, breaks, events and more right in a digital human's chat, without creating a digital human for a passing reminder.
- Conversations that work together, and the AI operating Halo: the AI can consult other conversations in the same space, hand over information and ask how things are going, and can take care of some management of conversations, spaces and digital humans for you.
- Evolving memory: chats in the same space share the memory they build up; a digital human's memory is organized into current state, history and topics, and can be tidied automatically or by hand.
- Office documents: built-in document skills and runtime, so making Word, Excel, PowerPoint and PDF files no longer starts with installing dependencies.
- Multiple accounts and model choice: keep several ChatGPT, Claude and other accounts side by side through Halo's sign-in options, name them and switch between them; models and thinking effort are easier to adjust.
- Faster Windows updates: from 3.0 on, new versions download and get ready in the background, and a restart finishes the update — no installer to download and run. This upgrade from 2.x still uses the installer.
- System requirements: macOS 12 or later on Mac, and older Macs stay on 2.x; Linux needs glibc 2.34 or later (for example Ubuntu 22.04, Debian 12 and newer), so keep 2.1.15 on older Linux systems.

## 2.1.15 · 2026-09-10 {#v2-1-15}

AI can now operate Halo itself · App Store revamped · Mandatory update & auto-update fixes · Claude Code CLI sign-in added · AI Browser/Canvas stability fixes

- Self-operating API: the agent can now operate Halo itself through a scoped loopback API (e.g. changing settings, managing sessions), enabling a new "AI drives Halo" interaction mode
- Mandatory update: added an unskippable update prompt for critical releases; fixed macOS auto-update hanging on quit when minimized to the tray; repaired the internal auto-update channel end to end
- App Store: publish digital humans and skills to the store in one click, republish to update what you already installed, export skills as a .zip package, detect unresolvable skill dependencies before publishing, and offline installs now queue and retry; the store list refreshes automatically when you switch back to it instead of showing stale content
- Models and sign-in: added Claude Code CLI sign-in (the bundled CLI keeps its own credential, Halo stores none); set reasoning effort per model; provider-supplied model capabilities now persist; new AI sources default to OpenAI-compatible instead of Anthropic
- AI Browser and Canvas: fixed BrowserView throttling scope so canvas/AI Browser no longer goes permanently blank after a hide/show cycle; the file tree no longer hides real build/dist directories
- WeCom: media messages (images, etc.) now flow both ways; slash commands work after an @mention in group chats; the bot can resolve and show sender names; acknowledgement replies are now consistent across streaming and non-streaming channels
- Knowledge base and OCR: digital humans can bind a knowledge base directly; fixed watched folders freezing on large file counts or disk-root paths; non-vision models now fall back to local OCR for images
- Stability: fixed a scheduler concurrency issue that could stall job dispatch, fixed handling of oversized images, fixed model override persistence across multiple accounts on the same provider, and conversation auto-titling no longer overwrites a user's manual rename

## 2.1.13 · 2026-07-30 {#v2-1-13}

Knowledge base · AI terminal · Multi-session digital humans · Display scaling · OCR, plus fixes

- Knowledge base: import files, folders, PDFs and Office documents; Halo organises them into searchable knowledge and cites sources inline in chat. Watched folders update automatically, one click clears and relearns, and it all works in the remote web client too
- AI terminal: the built-in terminal now runs in its own process, so a hang or crash no longer affects the main window. Entry point moved to the right-hand workspace
- Digital humans: hold several conversations at once and hand a task back to the desktop client to continue; configure capabilities, MCP servers and skills per app; stopping a running IM session no longer loses its history
- Remote access: long-lived tunnels with a fixed address, a headless server mode, automatic arbitration across multiple devices, and a relaxed access-code policy
- Display scaling: adjustable from 50% to 150% in Settings, with Cmd/Ctrl plus, minus and 0 shortcuts, persisted across restarts
- Models and sign-in: GLM coding plan login, Atlas Cloud as a built-in source, per-model vision override, quota usage shown directly on the source, and a simplified first-run setup
- OCR: read text straight out of screenshots and scanned documents
- Also: customisable browser User-Agent, refresh and auto-reload for Canvas file tabs, MCP connection probing and multi-server import, optional quote bubbles for WeCom group replies, and encrypted local credential storage
- Fixes: usage reporting and max_tokens forwarding for OpenAI-compatible endpoints, console windows popping up from Windows background processes, stale image-viewer cache, and the create-space dialog submitting early during Chinese IME input

## 2.1.12 · 2026-06-29 {#v2-1-12}

**App Store**: Share your skills and digital humans to the store in one click, browse, install, and upgrade others' creations, with docs viewable right on the detail page.

**Latest Models**: Added Claude Sonnet 5 (with 1M context), Claude Fable 5, Claude Opus 4.8, and LiteLLM gateway support.

**Smarter Digital Humans**: Message a running or finished task directly to follow up; results are auto-pushed to subscribed WeCom contacts.

**Mobile & Security**: Fully refined mobile UI, customizable browser allowlist, and hardened security for remote access and app installs.

## 2.1.4 {#v2-1-4}

AI-Autonomous Push Digital humans can now decide when to notify and who to notify based on their prompt instructions, no longer relying on fixed rules. IM Push requires enabling in app settings.

Visual Schedule Picker New visual schedule editor with quick presets and precise cron configuration — no more hand-writing YAML expressions.

AI Browser Download AI browser now supports file downloads — both direct URL and click-triggered, saved silently without dialogs.

Developer Mode New Developer Mode in Settings for verbose diagnostic logging to help troubleshoot issues.

DeepSeek V4 Models Added DeepSeek V4 Flash and V4 Pro models. Legacy V3 / R1 marked accordingly.

IM Contact Management Rename contacts, copy info, and remove stale sessions — helps AI match your natural language instructions.

DeepSeek V4 Thinking Fix Fixed reasoning content not being properly injected in thinking mode.

File Export Security Prevents AI from sending files outside the workspace via IM, enhancing security.

## 2.1.3 · 2026-04-12 {#v2-1-3}

**Personal WeChat Integration**: Scan a QR code to connect Halo with your personal WeChat — chat with Halo directly without switching apps.

**Custom Model Context Window**: Manually configure the context window size for each model, no longer constrained by defaults.

**Email MCP Integration** *(Manual activation required)*: Connect your work email to send, receive, and manage calendar events directly within Halo.

**Enterprise Security Controls**: High-privilege tools (Bash, file write, edit) are disabled for guest bots by default and require explicit admin authorization, reducing accidental exposure.

**Streaming Toggle**: Enable or disable streaming output to suit your network conditions and workflow preferences.

**Browser URL Shortcut**: A new URL input shortcut in the digital human browser lets you navigate directly without switching to the space interface.

**New `/halo-clear` Command**: Instantly clear the current conversation context. The `halo-` prefix avoids conflicts with Claude Code built-in commands.

**Private Chat Silent Mode**: Configure specific private chats to skip auto-reply for more granular control over your messaging channels.

**Quick Space Folder Access**: Streamlined space and memory area navigation — open the corresponding folder in one click with fewer steps.

**Bug Fixes**: Various known issues resolved for improved overall stability.

## 2.1.1 · 2026-04-10 {#v2-1-1}

- SkillHub query optimization: proxy-first merge strategy + skill group proxy sources for more reliable skill loading
- Optional @hello-halo/agent-sdk runtime loading: lighter builds for users who don't rely on the SDK
- Halo SDK stability improvements: GLM streaming fix, dynamic MCP management, multi-turn session robustness
- Windows installer upgrade fix: smoother in-place updates

## 2.1.0 · 2026-04-10 {#v2-1-0}

- SkillHub marketplace: 33,000+ community skills available for one-click install via Settings → Skill Marketplace
- Halo SDK engine: in-process agent execution engine, no subprocess overhead, faster response and lower resource usage
- SkillHub query optimization: proxy-first merge strategy + skill group proxy sources for more reliable skill loading
- Optional @hello-halo/agent-sdk runtime loading: lighter builds for users who don't rely on the SDK

<!-- public:start -->
Older versions are listed in [GitHub Releases](https://github.com/openkursar/hello-halo/releases).
<!-- public:end -->
