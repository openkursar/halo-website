---
title: "MCP servers: connect external tools to Halo"
description: Connect MCP servers in Halo's Capability library. Add one by hand or paste JSON for several, test the connection, switch tools, and choose who gets them.
type: how-to
audience: [developer, office]
related: [features/skills, features/capabilities, developers/mcp]
---

# MCP servers

::: say
> Install a GitHub MCP server from the Store.

Halo searches the Store's MCP entries, picks one and installs it for you. Its tools are available from your next message. If the server needs a token, add it in the server's details afterwards and test the connection.

**Prerequisite**: turn on **Operate Halo** in the composer under **+ › Capabilities**.
:::

The AI can only install MCP servers from the Store. To connect your own server from a command or a URL, add it by hand with the steps below. The AI can't do that part for you.

## What is MCP {#what-is-mcp}

MCP (Model Context Protocol) is an open standard that lets an AI call tools provided by outside programs in one consistent way. An MCP server is a tool provider: it might query a database, read and write tickets in some system, or call a third-party API. Once you connect an MCP server to Halo, the AI can call its tools in your conversations.

| Name | What it is | Think of it as |
|---|---|---|
| MCP server | A set of outside tools the AI can call | The toolbox in an employee's hands |
| [Skill](/en/features/skills) | A written method and instructions, called as a `/command` or picked by the AI | A skill the employee knows |
| [Digital Human](/en/digital-humans/overview) | An AI colleague with an identity, memory and work, who uses MCP servers and skills | The employee |

Web search, Halo docs lookup and Digital Human management are also built into Halo as MCP tools. They are not MCP servers you add: they don't appear under **MCP connections** and need no setup. See [Tools you get without a switch](/en/features/capabilities#built-in-tools).

For every config field and format, see the [MCP configuration reference](/en/developers/mcp).

## Before you start {#before-you-start}

- MCP servers are managed under **Digital Humans › Capability library › MCP connections**. The 2.x "My MCP" entry (called "My Apps" in earlier versions) is gone.
- Command-line (stdio) servers are started by Halo on the computer that runs Halo, so the command must be installed there first. For example, `npx` needs Node.js and `uvx` needs uv.
- A command-line server added through [Remote Access](/en/features/remote-access) also starts on the computer that runs Halo.
- Halo warns: "MCP servers are injected into the Agent as system tools. An unstable MCP server will affect Agent reliability. Only proceed if you know what you are doing." Connect only servers you trust and that run reliably.

## Add an MCP server by hand {#add}

1. Open **Digital Humans › Capability library**, switch to **MCP connections** and click **Manual Add MCP**. The **Add MCP Server** window opens in **Visual** mode.
2. Under **Install to**, choose the scope: **Global (all spaces)** (the default) or a workspace. See [Global or workspace](#scope) for the difference.
3. Enter a **Name**, such as `my-mcp-server`.
4. Under **Transport**, choose how to connect (see the table below), then fill in the matching fields.
5. Click **Create connection**. The window shows "Connections saved." and "Test connectivity separately. A saved configuration does not guarantee that a task can use it."
6. Click **Test connection** next to the server. **Connected** means Halo can reach it. Click **Done** to close the window.

| Transport (as shown) | Use it for | Fields to fill in |
|---|---|---|
| **Command line (stdio)** | A server that runs on this computer; the most common kind | **Command** (such as `npx`), **Arguments** (one per row; **Add argument** adds a row), **Environment Variables** |
| **SSE (Server-Sent Events)** | A server you reach by URL over SSE | **URL**, **Headers**, **Environment Variables** |
| **HTTP (Streamable)** | A server you reach by URL over streamable HTTP | **URL**, **Headers**, **Environment Variables** |

- **Environment Variables** and **Headers** take `KEY=VALUE`, one per line. Secrets such as API keys usually go in an environment variable, for example `API_KEY=<YOUR_TOKEN>`.
- For URL servers, the sign-in token goes in **Headers**, for example `Authorization=Bearer <YOUR_TOKEN>`.

::: done Done
The server's card appears under **MCP connections** with a status such as "Connected · 5 tools". From your next message, conversations in that scope can use its tools. No Halo restart is needed.
:::

## Paste JSON to import several at once {#import-json}

If you already set up MCP servers in Cursor or Claude Desktop, paste their config to install several at once.

1. In the **Add MCP Server** window, switch to **JSON** at the top.
2. Paste the config into **Configuration (JSON)**. You can keep the outer `mcpServers` wrapper; Halo handles it.
3. When you paste more than one server, the window shows "2 servers detected — each will be installed under its own name." and the button becomes **Install 2 servers**. Click it.
4. On the done screen, click **Test connection** for each server.

Three shapes are accepted: a single server config, `{"name": {...}}`, or a full `{"mcpServers": {...}}`. For example:

```json
{
  "mcpServers": {
    "notes": {
      "command": "npx",
      "args": ["-y", "@example/notes-mcp"],
      "env": { "NOTES_TOKEN": "<YOUR_TOKEN>" }
    },
    "tickets": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer <YOUR_TOKEN>" }
    }
  }
}
```

Replace `<YOUR_TOKEN>` with your own token. A URL server needs both `type` (`http` or `sse`) and `url`. Each server is installed under its key, here `notes` and `tickets`.

When you switch between **Visual** and **JSON**, what you've filled in carries over.

## Test the connection and read its status {#test}

**Test connection** really connects to the server and fetches its tool list. It uses no model tokens and waits at most 15 seconds. Halo also runs it automatically after you install, enable or change a server.

Status on the card and in the details:

| Status (as shown) | Meaning | What to do |
|---|---|---|
| Connected · N tools | Connected; N tools found | Nothing |
| Not yet tested | Not tested yet | Click **Test connection** |
| Connection failed | Halo can't reach the server | See [Troubleshooting](#troubleshooting) |
| Needs login | The server rejected the credentials | Update the token in the configuration and test again |
| Retrying on next message | The server connects, but the last session couldn't use it | Halo has cleared the leftover state; your next message picks it up again |
| MCP server globally disabled | You turned it off on its card | Click the power icon to enable it when needed |
| Not installed | A Digital Human declares it, but it isn't installed in that scope | Install it, or remove it from the Digital Human's dependencies |

Click a card to open its details: transport, command or URL, arguments, headers and the tools it offers. Until tools are loaded, the details say "No tools loaded yet — use "Test connection" to fetch the tool list."

## Switch single tools on or off {#tool-switches}

You don't have to give the AI every tool a server offers. Open the server's details. Under **Tools provided by this server**, each tool has its own switch:

- A count such as "5 of 8 tools on" sits next to the heading.
- **Turn all on** and **Turn all off** switch every tool at once.
- The note says: "Tools turned off are left out of every conversation and digital human run. Conversations already open use the change from their next message."

::: warning Caution
With the DSH engine, single-tool switches have no effect, and the panel warns: "The DSH engine cannot leave out single MCP tools: tools turned off here stay available in its conversations." To keep a tool away from the AI completely, disable the whole server or use another engine. See [Agent engines](/en/features/agent-engines).
:::

## Global or workspace: who gets it {#scope}

Each MCP server is installed in a scope, and the scope decides which conversations get it:

| **Install to** | Card tooltip | Who can use it |
|---|---|---|
| **Global (all spaces)** | "Available in every workspace" | Conversations in every workspace |
| A workspace | "Available in this workspace only: workspace name" | Only conversations in that workspace |

- Every conversation in a workspace gets every enabled global MCP server plus that workspace's MCP servers, except servers you disable and tools you switch off. You don't turn them on in the conversation.
- If a global server and a workspace server share a name, the workspace one wins. When you create a global connection from a Digital Human's **MCP Tools** and the workspace already has a connection with that name, Halo stops it with "A workspace connection with this name would override the global connection. Choose a different name or use the existing connection."
- Digital Humans follow a different rule. The UI says: "Chat inherits connections from its workspace except explicitly disabled ones. Independent tasks use declared connections." See [MCP for Digital Humans](#digital-humans).
- After you add, edit, enable or disable a server, conversations that are already open use the change from their next message. No Halo restart is needed.

### Manage connected servers {#manage}

Under **MCP connections**, use "Search MCP servers or tools", or filter by **Scope** (All workspaces, Global or one workspace) and by source (**Store**, **Custom**, **Built in**). On each card:

- **Test connection**, the power icon (**Enable** / **Disable**) and **Reinstall**.
- The **More** menu has **Edit configuration**, **Move to workspace** and **Uninstall**.
- When Digital Humans declare the server, the card shows "Declared by 2 digital humans". Uninstalling warns how many Digital Humans depend on it; they lose access to its tools.

MCP servers are shared: a change affects every conversation and Digital Human in that scope, so Halo asks "Save shared resource changes?" before saving an edit. Uninstalled servers move to the **Uninstalled** group, where you can reinstall them later.

### See which MCP servers a conversation can use {#resources-rail}

In a conversation, click "Open workspace resources" and switch to the **MCP** tab. It lists the MCP servers in effect for this workspace (global plus this workspace). The list is read-only; clicking a row opens that server's details in the Capability library. When there are none, it says "No MCP servers available yet." The rail's other tabs are covered in [Files and the canvas](/en/features/files-and-canvas).

## Install from the Store {#from-the-store}

The **Store**'s **MCP** tab lets you browse MCP servers, but you can't install them from the Store page: the detail button is a disabled **Coming Soon**, with the tooltip "MCP store install is coming soon. Use Manual Add to configure MCP servers." **Install from Marketplace** on an empty **MCP connections** wall opens that same Store page.

To install an MCP server from the Store, use one of these:

- **From a Digital Human**: open **Digital Humans › My Digital Humans**, choose a Digital Human, go to **Capabilities and settings › Tools & Resources › MCP Tools** and click **Browse MCP store**. Find the entry with "Search store" and install it. It goes into that Digital Human's workspace and is added as one of its dependencies.
- **Ask the AI**: turn on **Operate Halo** under **+ › Capabilities**, then say "Install a GitHub MCP server from the Store". See [Just tell Halo](#say-it) at the top of this page.

::: info Note
A Halo provided by your company may restrict MCP servers: a command blocked by its security policy is refused with `This MCP server command is blocked by security policy.`, and some builds don't allow installing MCP servers from a remote client.
:::

For browsing and updating Store items, see [Store](/en/digital-humans/store).

## MCP for Digital Humans {#digital-humans}

Which MCP servers a Digital Human gets depends on how it works:

| Situation | MCP servers it can use |
|---|---|
| Chatting with the Digital Human | All connections of its workspace, except ones you disable for it |
| Running on its own (schedules, triggers and so on) | Only its declared dependencies |

That's why the add window notes "Digital humans must be enabled separately." To give a Digital Human a server for its own runs, add it as a dependency:

1. Open **Digital Humans › My Digital Humans**, choose a Digital Human and go to **Capabilities and settings › Tools & Resources › MCP Tools**.
2. Use **Add dependency** to pick a server already installed in this workspace, or install a new one with **Browse MCP store**, **New connection** or **Import JSON**. A new one is added as a dependency automatically.
3. Each dependency has a switch (**Enable for this digital human** / **Disable for this digital human**). "The switch only affects this digital human — it never changes the MCP server itself."
4. Click **Test connection** to confirm it works. To change the server's own config, click **Shared connection settings**.

When a dependency is missing, Halo tells you:

- A dependency declared but not installed in this workspace shows "This dependency is declared but not installed in this workspace. Runs will be missing its tools until it is installed."
- For a globally disabled server, **Why disabled?** explains that this Digital Human won't get its tools at run time.
- When a dependency can't be used, the run may show **Not started** with the reason, such as "notes: not installed", next to **Open Tools & Resources**.

Digital Humans installed from the Store may come with MCP dependencies. Every setting is described in [Capabilities and settings](/en/digital-humans/capabilities).

## Import from Claude CLI {#claude-cli}

<Badge type="info" text="Desktop only" />

If you already set up MCP servers in the Claude Code CLI, bring them over:

1. Open **Settings › Advanced › Claude CLI Integration**. Under **Migrate MCP Servers from Claude CLI**, click **Scan**. Halo reads the servers in `~/.claude.json`.
2. Servers that already exist in Halo are marked "Already exists in Halo". Halo keeps its existing configuration for them; choosing **Overwrite** doesn't replace it. To use the CLI's configuration instead, uninstall the existing server in the Capability library first, then migrate.
3. Click **Migrate**. The imported servers appear under **MCP connections** as global connections.
4. Click **Test connection** on each to confirm.

For the config directory and other options, see the [Settings reference](/en/features/settings#claude-cli-integration).

## Troubleshooting {#troubleshooting}

### The card says "Connection failed"

- Command-line server: make sure the command works on the computer that runs Halo. For example, `npx` needs Node.js. Then check **Arguments** and **Environment Variables** for typos.
- URL server: make sure the **URL** is reachable and the **Transport** matches the server (SSE or HTTP (Streamable)).
- After fixing the config, click **Test connection** again.

### The card says "Needs login"

The server rejected the token. The details say "Authentication was rejected by the MCP server. Update the token in the configuration below, then test again." Update the token in **Headers** or **Environment Variables** under **Edit configuration**, save, and test again.

### Pasting JSON shows `command must be a non-empty string`

Usually a URL server is missing `type`. Add `"type": "http"` or `"type": "sse"` next to its `url`.

### The server is connected, but the AI can't use its tools

- Check that the conversation's workspace is in the server's scope. See [Global or workspace](#scope).
- Check that the tools aren't switched off. See [Switch single tools on or off](#tool-switches).
- A server named like one of Halo's built-in tools (for example `web-search`) is replaced by the built-in one. Add it again under another name.
- A Digital Human running on its own uses only its declared dependencies. See [MCP for Digital Humans](#digital-humans).

### The AI still uses a tool I switched off

You may be on the DSH engine, which can't leave out single MCP tools. Disable the whole server or switch engines.

## Next steps {#next-steps}

- [Skills](/en/features/skills): give the AI a fixed way of working; some skills need a matching MCP server first
- [Capabilities](/en/features/capabilities): tell Halo's own capabilities apart from the MCP servers you connect
- [MCP configuration reference](/en/developers/mcp): every config field, transport and how Digital Humans declare dependencies
