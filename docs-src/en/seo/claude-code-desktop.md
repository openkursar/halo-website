---
title: Claude Code GUI and Codex GUI in one app
description: "Halo is an open-source GUI for Claude Code and Codex: no terminal, sign in with your account or any compatible API, and follow up from your phone."
type: landing
audience: [developer, beginner]
edition: public
related: [guide/from-claude-code, getting-started/install, features/remote-access]
---

# Claude Code GUI

Halo is an open-source desktop AI workstation. By default it runs on Anthropic's official Claude Code engine (Claude Code SDK), and you can switch it to OpenAI's Codex and other engines. You chat, see which files the AI changed and review code in a graphical app, with no terminal. Halo itself is free (MIT license); model usage is billed by the account or API provider you connect.

Halo is not an official Anthropic or OpenAI product. It puts these engines in a graphical app and adds workspaces, Digital Humans and Remote Access.

## In a terminal vs in Halo {#cli-vs-halo}

| | Claude Code / Codex in a terminal | In Halo |
|---|---|---|
| Engine | the Claude Code or Codex CLI | Claude Code SDK by default; switch to Codex SDK and others in **Settings › Advanced › AI Agent Engine** (experimental); see [Agent engines](/en/features/agent-engines) |
| How you work | typed commands | a chat, with files, web pages and terminals opening in the canvas next to it |
| Seeing what the AI changed | `git diff` | the **Changes** view: compare, stage and commit, or start a **Quick review** / **Team review**; see [Changes, code review and Git](/en/features/code-review) |
| Sign-in | each tool's own account or API key | Claude, ChatGPT or GitHub Copilot sign-in, or **Custom API** (any Anthropic- or OpenAI-compatible endpoint) |
| Several things at once | several terminals | several conversations and workspaces, with progress in the **Tasks** panel |
| Away from your computer | — | Remote Access from a phone browser or the Android app |
| Recurring work | — | Digital Humans that run on a schedule and work together in teams |

![The + menu of the Halo message box: Files and folders, Reference a conversation, Chat with a digital human, and five capability switches: Web Control, Team Collaboration, AI Terminal, Text Recognition and Operate Halo](/images/features/capabilities/plus-panel.en.webp)

The **+** button in the message box turns capabilities on per conversation. **Web Control** and **Team Collaboration** are on by default; turn on **AI Terminal**, **Text Recognition** or **Operate Halo** when you need them. The AI can't switch these on itself; it asks you. See [Capabilities](/en/features/capabilities) for what each one does.

## Already using the Claude Code CLI {#already-using-claude-code}

- **Bring your skills and MCP servers**: open **Settings › Advanced › Claude CLI Integration** and use **Migrate Skills from Claude CLI** and **Migrate MCP Servers from Claude CLI**.
- **Keep your projects**: create a workspace from the project folder, and the AI works in that folder.
- For the full steps, see [Coming from Claude Code](/en/guide/from-claude-code).

## Use other model providers {#domestic-models}

**Custom API** lists 26 built-in providers, including DeepSeek, Kimi, Zhipu GLM, Alibaba Cloud DashScope (Qwen) and MiniMax, and accepts any OpenAI- or Anthropic-compatible endpoint. See [Connect an AI model](/en/getting-started/setup-ai) for the steps, and [Models and accounts](/en/features/models) for several accounts and per-conversation models.

## FAQ {#faq}

### Is Halo Anthropic's official Claude Code desktop app?

No. Halo is an independent open-source project (MIT license). It runs on Anthropic's official Claude Code engine by default; the app, workspaces, Digital Humans and Remote Access come from Halo.

### Do I need to install the Claude Code CLI first?

No. The engine ships with Halo: install it, then sign in or add an API key. On Windows, the first launch sets up Git Bash (or uses Git if it is already installed), which the AI needs to run commands.

### Can I use Codex?

Yes. In **Settings › Advanced › AI Agent Engine**, choose **Codex SDK** (experimental) and restart Halo. The engine applies to new conversations; existing ones keep theirs, and engines differ slightly in what they support. If the option says "Not included in this build", your build does not ship that engine.

### Can I continue from my phone?

Yes. Turn on **Settings › Remote Access**, then connect to your computer from a phone browser or the Android app. See [Remote Access](/en/features/remote-access).

## Next steps {#next-steps}

- [Install Halo](/en/getting-started/install): downloads and system requirements for macOS, Windows and Linux
- [Coming from Claude Code](/en/guide/from-claude-code): how your skills, MCP servers and projects come along
- [What is Halo](/en/guide/what-is-halo): workspaces, Digital Humans and teams at a glance
- [Remote Access](/en/features/remote-access): use Halo from another device
