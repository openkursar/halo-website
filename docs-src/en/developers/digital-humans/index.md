---
title: "Building Halo Digital Humans: how they work"
description: "How a Halo Digital Human is put together and runs: its spec, workspace, memory and triggers, what a run sees, and when to ask Halo instead of writing a spec."
type: explanation
audience: [developer]
---

# Building Digital Humans

A Digital Human is an AI member that works on its own: on a schedule, when an event arrives, or when someone messages it. This section is for people who build them by hand. It covers what a Digital Human is made of, what happens when it works, and where to start.

## What a Digital Human is made of {#parts}

| Part | What it holds | More |
|---|---|---|
| Spec | Its instructions (`system_prompt`), triggers, settings form, capabilities and dependencies, in one `spec.yaml` with `type: automation` | [Spec reference](/en/developers/digital-humans/spec) |
| Workspace | Its working directory: the files it reads and writes, and its skills under `.claude/skills/` | [Writing skills](/en/developers/skills) |
| Memory | A `memory.md` file kept in Halo's data folder, not in the working directory, loaded every time it starts working unless its memory is turned off | [Memory](/en/developers/digital-humans/production#memory) |
| Work activity | One record per run: its reports, outputs and questions | [Manage Digital Humans](/en/digital-humans/manage#work-activity) |
| Threads | Its chats: the main thread, threads created through the API, and one per bot chat | [One thread per user](/en/developers/api/recipes#thread-per-user) |

The same spec format, with another `type`, also describes skills (`skill`) and MCP servers (`mcp`), and the same Store protocol distributes all three; their exported files differ (a skill exports as a `.zip`). See [DHP protocol](/en/developers/dhp).

## Runs and chats {#modes}

A Digital Human works in two ways, with the same instructions and memory:

- **Runs** start without anyone talking to it: on a schedule, on a file change or a webhook, or when someone clicks **Run now** or calls its HTTP trigger. A run follows the system prompt, reports with `report_to_user`, and is recorded in **Work activity**.
- **Chats** answer people: in its chat in Halo, through the API, or through a bound WeCom, Feishu or WeChat bot. Reminders it agrees to in a chat come back in that chat.

Two differences matter when you build one:

| | Run | Chat |
|---|---|---|
| MCP servers | Only those listed in `requires.mcps` | Every server of its workspace and the global ones, except those its `requires.mcps` marks `enabled: false` |
| Who it acts for | Its owner | Its owner, or, in a bot chat, someone else held to the bot's [guest permissions](/en/digital-humans/permissions) |

A Digital Human runs on the computer that runs Halo, or on a [Halo Server](/en/server/). Halo must be running for it to work; see [Keep Digital Humans running](/en/digital-humans/keep-running). One Digital Human never runs twice at once: an event that arrives during a run joins that run or the next one.

## What a run sees {#run-context}

When a run starts, the Digital Human gets:

- its `system_prompt`;
- the current values of its settings, by `key`, with defaults filled in;
- its memory file;
- what started it. For a webhook that is the request's `path`, `method`, `body` and `query`; for a file change, the file's path and the kind of change. Request headers and the caller's address are left out.
- its tools:
  - always: `report_to_user`, web search, Halo's own documentation and on-device text recognition (OCR), plus notifications through the channels set up in **Settings › Message Channels**;
  - by permission: AI Browser, terminal, email, IM push, and, when turned on, Operate Halo and Conversation Collaboration;
  - the MCP servers listed in `requires.mcps`;
  - every skill in its workspace and in the global scope.

## Ask Halo, or write the spec {#ask-or-write}

**Ask Halo** when you can describe the job. In a conversation, say what it should do and when; Halo reads its own guide to building Digital Humans, asks about anything it needs, then creates and installs it. You can read and change the result in its **YAML** tab. See [Create a Digital Human](/en/digital-humans/create).

**Write or edit the spec** when:

- the instructions and triggers must be exactly right, for example around actions that can't be undone;
- it relies on browser scripts you ship with it;
- you keep it in version control or generate it from your own tools, and install it by import or with [`POST /api/apps/import-spec`](/en/developers/api/digital-human#post-api-apps-import-spec);
- you distribute it as a package or through a Store.

## Where to go next {#next-steps}

- [Tutorial: build a browser-automation Digital Human](/en/developers/digital-humans/build): adapt a working sample, end to end
- [Digital Human spec reference](/en/developers/digital-humans/spec): every field, and the fields that have no effect
- [Production-grade Digital Humans](/en/developers/digital-humans/production): prompts, memory, browser scripts, logins and safe limits
- [DHP protocol](/en/developers/dhp) and [Publish to the Store](/en/developers/store-publishing): package and share it
- [API: Digital Humans](/en/developers/api/digital-human): install, configure and chat with Digital Humans from your own code
