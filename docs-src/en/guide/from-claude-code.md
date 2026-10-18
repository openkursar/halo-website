---
title: "Coming from Claude Code: concepts and config"
description: "Using Claude Code or Codex? How the concepts map, signing in with your subscription, opening a repo as a workspace, keeping CLAUDE.md, skills and MCP."
type: how-to
audience: [developer]
related: [features/agent-engines, features/code-review, features/spaces, features/skills]
---

# Coming from Claude Code or Codex

Migrating skills and MCP servers happens in Settings, which Halo can't change for you; once you're in a workspace, just talk to it as you would in the terminal.

## How the concepts map {#mapping}

| In Claude Code | In Halo | Notes |
|---|---|---|
| `cd project && claude` | A workspace created with **Custom Folder** | The AI reads and writes in that folder; see [Open your repository](#open-repo) |
| `claude` in any old directory | **Halo Workspace** | The built-in default workspace, no folder to pick |
| Several terminals, one `claude` each | Several conversations at once | Each runs in the background; see [Work on several things at once](/en/features/parallel-work) |
| `claude --resume` | Open an earlier conversation and carry on | Conversations are saved automatically |
| The project's `CLAUDE.md`, `.claude/settings.json`, `.claude/skills/` | Still apply | The default Claude Code engine reads them; see [Keep your configuration](#carry-over) |
| User-level config in `~/.claude/` | Halo's own Claude config directory | `~/.claude` isn't read by default; skills and MCP servers can be migrated, but your user-level CLAUDE.md, settings.json, commands and agents can't |
| `/` slash commands | Type `/` in the message box | Lists the engine's commands and your skills |
| `git diff`, `git commit` | **Changes** | Review, stage, commit and push, and ask the AI for a review; see [Changes, code review and Git](/en/features/code-review) |
| `cron` plus `claude -p` | Digital Humans | They run on a schedule; see [Digital Humans overview](/en/digital-humans/overview) |

## Sign in with your subscription {#sign-in}

The first time you open Halo, choose **Claude**, **ChatGPT** or **GitHub Copilot** in "Welcome to Halo" and sign in with the account you have; see [Connect an AI model](/en/getting-started/setup-ai).

On macOS you can also let the Claude Code CLI bundled with Halo sign itself in: open **Settings › AI Model › OAuth Login › Claude Code CLI**, click **Run in Halo terminal** in "Sign in with Claude Code CLI", and finish the sign-in as prompted. Halo keeps no token; the CLI stores and refreshes its own. This works only with the Claude Code engine.

## Open your repository {#open-repo}

1. At the top left of the conversation page, click the current workspace's name, then **New Workspace**.
2. Under **Local Directory**, choose **Custom Folder**, click **Browse** and pick your repository.
3. Click **Create**.

Conversations, settings and memory live in Halo's own data folder, not in your folder; only skills installed into this workspace are written to the folder's `.claude/skills/`. See [Create a workspace](/en/features/spaces#create).

## Keep your configuration {#carry-over}

### Project configuration {#project-config}

The default Claude Code engine reads `CLAUDE.md`, `.claude/settings.json` and `.claude/skills/` in the workspace folder, unchanged.

### User-level skills and MCP servers {#user-config}

By default Halo uses its own Claude config directory, not `~/.claude`, so Halo and Claude Code in the terminal don't affect each other. To bring your existing setup over:

1. Open **Settings › Advanced › Claude CLI Integration**.
2. Click **Migrate Skills from Claude CLI**: it scans `~/.claude/skills/`, and for each skill you choose to skip, overwrite or rename it if the name is taken.
3. Click **Migrate MCP Servers from Claude CLI**: it scans `~/.claude.json`, and for each server you choose to skip or overwrite. If Halo already has a server with the same name, overwrite skips it too rather than replacing it.

Migrated skills are copied into Halo's config directory and show as "Unmanaged" under [Skills](/en/features/skills); manage migrated MCP servers under [MCP servers](/en/features/mcp).

::: warning Sharing ~/.claude directly isn't recommended
You can set **Config Directory** to **Claude CLI Default** (`~/.claude`), but it's marked high risk: the two will change each other's settings, and an API key or endpoint configured in the terminal Claude Code overrides the model you chose in Halo.
:::

## What's different from the terminal {#differences}

- No per-tool confirmations. Halo always runs in **Full Permission Mode**: the AI runs commands and edits or deletes files directly, and only stops when it asks you a question. Point workspaces at folders you're comfortable letting the AI change, and check changes with Git and **Changes**.
- You can switch engines. The default is the Claude Code SDK; **Settings › Advanced › AI Agent Engine** has a few experimental ones (Codex among them). Switching needs a restart and applies to new conversations only. See [Agent engines](/en/features/agent-engines).
- Everything is visual: the Files panel and previews on the right, an [AI Browser](/en/features/ai-browser) that works in websites itself, and [Remote Access](/en/features/remote-access) from your phone.

## For Codex users {#codex}

To use Codex, switch to the Codex engine (experimental) under **AI Agent Engine**. On the Codex engine, the `/` menu in the message box is empty, and hooks and fine-grained tool permissions aren't supported; requests from colleagues in a team across computers, and messages from guests in a bot chat, are all refused. For other differences, see [Agent engines](/en/features/agent-engines#differences).

::: done
In the new workspace, ask "What conventions do you know about this project?". If Halo's answer mentions what's in your `CLAUDE.md`, your configuration is in effect.
:::

## Next steps {#next-steps}

- [Changes, code review and Git](/en/features/code-review): review changes, commit, and ask the AI for a review.
- [Skills](/en/features/skills): manage and write skills.
- [Developer docs](/en/developers/): call Halo from other programs over its HTTP API.

<!-- public:start -->
For an overview of Halo as a Claude Code desktop app, see [Claude Code GUI](/en/seo/claude-code-desktop).
<!-- public:end -->
