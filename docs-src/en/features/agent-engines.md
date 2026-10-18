---
title: "Agent engines: Claude Code, Codex and more"
description: "Halo's agent engine drives the AI's work: Claude Code SDK by default, or the experimental Halo SDK, Codex SDK or DeepSeek dsh. How to switch and what differs."
type: explanation
audience: [developer]
related: [features/models, features/settings, guide/from-claude-code]
---

# Agent engines

## What an agent engine is {#what-is-an-engine}

The agent engine is the part of Halo that runs the AI's work. It hands your message to the model, runs the tools the model asks for (reading and writing files, running commands, calling MCP servers), passes the results back, and repeats until the task is done.

The engine and the model are separate choices. You pick the model in **Settings › AI Model** and in the composer's model card; see [Models and accounts](/en/features/models). Halo includes a local translation layer, so every engine can use OpenAI-compatible, Anthropic-compatible, ChatGPT, Copilot and other sources. Switching engines usually doesn't mean switching accounts (Claude Code CLI sign-in is the exception, see below).

Most people never need to touch the engine. The default Claude Code SDK supports every feature on this page except Goal.

<!-- public:start -->
Want Claude Code and Codex side by side in a graphical app? See [Claude Code GUI](/en/seo/claude-code-desktop).
<!-- public:end -->

## The engines {#engines}

**Settings › Advanced › AI Agent Engine** lists four engines. The descriptions below are quoted from Settings.

| Engine | Description in Settings | Status | Extra requirement |
|---|---|---|---|
| Claude Code SDK | Powered by the official Anthropic Claude Code engine. Works with a wide range of frontier models. | Default | None |
| Halo SDK | The official Halo agent engine. Lightweight on resources, faster startup, optimized for open-source models. | <Badge type="warning" text="Experimental" /> | None |
| Codex SDK | Powered by the official OpenAI Codex SDK. Better suited for GPT-family models. | <Badge type="warning" text="Experimental" /> | None |
| DeepSeek dsh | Powered by the open-source DeepSeek dsh runtime, which upstream is still changing and has not stabilized. Best used with DeepSeek models. | <Badge type="warning" text="Experimental" />, new in 3.0 | None |

An engine that isn't packaged in your copy of Halo is greyed out and can't be selected. It shows **Not included in this build**, with a one-line reason in English below.

## Switch engines {#switch}

You switch engines yourself in Settings. Halo can't switch the engine for you, even with [Operate Halo](/en/features/operate-halo) on.

**AI Agent Engine** lives in **Settings › Advanced**, which exists only in the desktop app <Badge type="info" text="Desktop only" />. Remote Access web and mobile clients don't show it.

1. Open **Settings › Advanced** and find **AI Agent Engine** (marked **Experimental**).
2. Choose an engine. The choice is saved right away, and "Restart required for the engine change to take effect." appears below.
3. Click **Restart Now** and confirm in the "Restart Halo?" dialog. After the restart, the new engine is in use.

Three things to know after switching:

- The new engine applies only to **new conversations and new tasks**. Existing conversations can't switch engines; each keeps the engine it was created with.
- A conversation that doesn't run on the default engine shows a small tag next to its title in the conversation list: **Halo** (Halo SDK), **Codex** or **DSH** (DeepSeek dsh). Hover it to see a tooltip such as "This conversation runs on the Codex engine." Conversations on the default engine have no tag.
- If the engine you chose isn't available in your installation, Halo starts on another engine and shows "The selected engine is not included in this build, so Halo is running on another engine." Your choice is kept. Reinstall a complete package, or pick an available engine below the message.

## What differs per engine {#differences}

The table lists only the differences confirmed in Halo 3.0.4. A feature that isn't listed isn't guaranteed to work on the experimental engines.

| Feature | Claude Code SDK | Halo SDK | Codex SDK | DeepSeek dsh |
|---|---|---|---|---|
| Set a [goal](/en/features/conversations#goal) for a conversation | No | **Yes** (only this engine) | No | No |
| Sources signed in with [Claude Code CLI](/en/features/models#claude-code-cli) | **Yes** (only this engine, macOS only) | No | No | No |
| The "/" menu in the composer | Lists engine commands and skills | Lists engine commands and skills | Not shown | Not shown |
| Write guard for [memory](/en/features/memory) | Yes | Yes | No | No |
| Colleagues on other computers or restricted guests putting your Digital Humans to work | Works | Works | Refused, never starts | Refused, never starts |
| **Continue in client** for IM sessions | Yes | Yes | Hidden | Hidden |
| Stopping a reply | Stops the current reply | Stops the current reply | Stops the current reply | Ends the whole engine session |

Item by item:

- **Goal**: available in workspace conversations only, not in Digital Human chats.
- **Claude Code CLI sign-in**: on any other engine, turns that use this kind of source fail with a message asking you to switch back to the Claude Code engine.
- **The "/" menu**: Codex SDK and DeepSeek dsh report no commands to Halo, so typing "/" opens no menu. How the menu works: [Commands and skills with /](/en/features/conversations#slash-menu).
- **Memory write guard**: Claude Code SDK and Halo SDK lock writes to memory files and enforce the read-only boundary. Codex SDK and DeepSeek dsh have no such guard. Memory still works, but it relies on the AI following its instructions to edit carefully.
- **Other people's requests**: Codex SDK and DeepSeek dsh can't hold someone else's request to what you allowed, and can't keep a record of what it did, so Halo doesn't start such requests. The message reads `Switch Halo's agent engine to Claude Code to let teammates put your digital humans to work.` To let colleagues use your Digital Humans, switch back to the default engine. Permissions are set in [Teams across computers](/en/digital-humans/cross-computer-teams) and [Owner and guest permissions](/en/digital-humans/permissions).
- **Continue in client**: copies a Digital Human's IM session into a new desktop conversation. Codex SDK and DeepSeek dsh can't copy an engine session, so the button isn't there.
- **Stop**: DeepSeek dsh has no way to cancel mid-reply. Stop ends its whole session instead of interrupting the current reply.
- **AI question card**: DeepSeek dsh has no question card, so the AI can't pause to ask you multiple-choice questions.
- **Turning off single MCP tools**: with DeepSeek dsh, the MCP settings warn "The DSH engine cannot leave out single MCP tools: tools turned off here stay available in its conversations." To keep a tool away, turn off the whole MCP server; see [MCP servers](/en/features/mcp).
- **Deep Thinking**: each engine accepts only the levels it supports, and Halo maps the rest to the nearest one. For example, Codex SDK runs "Off" as "Low". The full mapping is in [Deep Thinking](/en/features/models#deep-thinking).

All four engines support MCP servers, image input and automatic context compaction.

## When to switch {#when-to-switch}

| I want to… | Use |
|---|---|
| Work normally without fuss | Keep **Claude Code SDK** (default) |
| Use an account signed in with Claude Code CLI | **Claude Code SDK** is required |
| Let colleagues on other computers, or restricted guests, use my Digital Humans | **Claude Code SDK** or **Halo SDK** |
| Give a conversation a goal and have the AI keep going until the done-when criteria are met | **Halo SDK** |
| Mostly use GPT-family models and try OpenAI's engine | **Codex SDK**, minding what it lacks in the table above |
| Mostly use DeepSeek models and try something new | **DeepSeek dsh** |

The three experimental engines may still have unfixed issues. If something behaves oddly, switch back to Claude Code SDK, restart, and try again in a new conversation.

## Coming from Claude Code {#claude-code-compatibility}

The default Claude Code SDK engine reads `CLAUDE.md` and `.claude/` settings in your workspace, plus user-level settings from the Claude config directory (**Settings › Advanced › Claude CLI Integration › Config Directory**; by default Halo's own directory, not `~/.claude`). Migration steps: [Coming from Claude Code](/en/guide/from-claude-code).

## Next steps {#next-steps}

- [Models and accounts](/en/features/models): with the engine settled, choose the model and the Deep Thinking level
- [Settings reference](/en/features/settings#agent-engine): the other options in the **Advanced** section
- [Coming from Claude Code](/en/guide/from-claude-code): bring your skills, MCP servers and habits over
