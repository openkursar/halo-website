---
title: "MCP configuration reference: fields and JSON"
description: "Reference for MCP servers in Halo: configuration fields and transports, the JSON formats Halo accepts, packaging a server, and how Digital Humans get them."
type: reference
audience: [developer]
---

# MCP configuration reference

An MCP server gives Halo's AI extra tools, from a program on your computer or from a server on the network. This page is the configuration reference: the fields, the transports, the JSON Halo accepts, MCP servers as packages, and how Digital Humans get them. To add, test and manage servers in the app, see [MCP servers](/en/features/mcp).

## Where a server's configuration lives {#where}

Each MCP server you add is an installed item of type `mcp`, global or for one workspace, kept in Halo's database rather than in `config.json`. Halo reads the list for every new session, so a change needs no restart: a conversation that is already open uses it from its next message. To bring servers over from Claude Code, use **Settings › Advanced › Claude CLI Integration › Migrate MCP Servers from Claude CLI**.

## Fields {#fields}

A server's configuration is the `mcp_server` object of its spec. The **Visual** form in **Add MCP Server** has the same fields except `cwd`, which only the **JSON** mode sets:

<!-- generated:spec-fields mcp only=mcp_server -->
_Generated from the schema of Halo 3.0.4._

### `mcp_server` {#field-mcp-server}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `transport` | `enum` | No | = `"stdio"`; `stdio`, `sse`, `streamable-http` | `stdio` starts a local command; `sse` and `streamable-http` connect to a server URL. |
| `command` | `string` (non-empty) | Yes | — | For `stdio`, the program to run, such as `npx`. For `sse` and `streamable-http`, the server URL: there is no separate `url` field. |
| `args` | `string[]` | No | — | Arguments for the command (`stdio`). |
| `env` | `map<string, string>` | No | — | Environment variables for the command. Numbers and booleans are turned into strings. Values are stored as written, so keep keys out of shared packages. |
| `headers` | `map<string, string>` | No | — | HTTP headers for `sse` and `streamable-http`, such as an authorization header. Stored as written. |
| `cwd` | `string` | No | — | Working folder for the command (`stdio`). |
<!-- /generated:spec-fields -->

Values of `env` and `headers` are stored as written. The Remote Access API returns them in plain text; Halo's own assistant sees them masked.

## Transports {#transports}

| Transport | How Halo reaches the server | In the Visual form |
|---|---|---|
| `stdio` (default) | Starts `command` with `args`, `env` and `cwd` on the computer running Halo. The program must be installed there, for example Node.js for `npx` | **Command line (stdio)** |
| `streamable-http` | Connects to the URL in `command` over Streamable HTTP, sending `headers` | **HTTP (Streamable)** |
| `sse` | Connects to the URL in `command` with Server-Sent Events, an older transport some servers still use | **SSE (Server-Sent Events)** |

There is no separate `url` field: for `streamable-http` and `sse`, the URL goes in `command`.

## JSON Halo accepts {#json}

In **Add MCP Server**, the **JSON** mode takes the formats other MCP clients use, so you can paste a configuration as you found it.

One server in the common format, local or remote:

```json
{ "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/docs"] }
```

```json
{ "type": "http", "url": "https://mcp.example.com/mcp", "headers": { "Authorization": "Bearer <YOUR_TOKEN>" } }
```

Several servers at once, wrapped in `mcpServers` as Cursor and Claude Desktop write them, or the same object without the `mcpServers` key. Each one is installed under its own name:

```json
{
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/docs"] },
    "company-search": { "type": "http", "url": "https://mcp.example.com/mcp" }
  }
}
```

How the common format maps onto Halo's fields:

| Pasted | Becomes |
|---|---|
| `command`, `args`, `env`, `cwd`, with no `type` or `"type": "stdio"` | `transport: stdio` with the same fields |
| `"type": "http"` or `"streamable-http"`, `url`, `headers`, `env` | `transport: streamable-http`, `command: <url>`, `headers`, `env` |
| `"type": "sse"`, `url`, `headers`, `env` | `transport: sse`, `command: <url>`, `headers`, `env` |

`type` is read case-insensitively, with `_` treated as `-`, so `streamable_http` works too. Halo's own form, with `transport` and `command`, is accepted as well. A URL must be a full URL; `env` and `headers` values may be strings, numbers or booleans.

### Names {#names}

A server's name is its id: it appears on its card, in a Digital Human's `requires.mcps`, and in the names of its tools. Use only letters, digits and `. @ / _ -`, starting with a letter, a digit, `_` or `@`. Halo doesn't check this, but other characters can break the tool names. Also:

- Don't use the name of one of Halo's built-in tools, such as `ai-browser`, `ai-terminal`, `email`, `halo-email`, `web-search`, `ocr`, `halo-docs`, `halo-apps`, `halo-report`, `halo-notify`, `halo-api-ref`, `halo-conversations`, `halo-reminders`, `halo-person-context` or `im-file-send`. While that built-in tool is turned on for a conversation or Digital Human, it replaces a server with the same name.
- A workspace server may have the same name as a global one. In that workspace, it then replaces the global one.

## Package an MCP server {#package}

An MCP server can travel as a spec of `type: mcp`, for example in a company Store source (its `mcps.json` index) or through [`POST /api/apps/install`](/en/developers/api/digital-human#post-api-apps-install), where `spaceId: null` installs it for every workspace:

```yaml
name: company-search
version: "1.0.0"
author: example
description: Search the company wiki.
type: mcp
mcp_server:
  transport: streamable-http
  command: https://mcp.example.com/mcp
```

- Leave tokens out of a spec you share: each person adds their own header or variable to the server's configuration after installing it.
- Publishing from Halo covers Digital Humans and skills, not MCP servers. See [Publish to the Store](/en/developers/store-publishing).
- A company build can block some commands; installing such a server fails with `MCP_COMMAND_BLOCKED`. It can also refuse MCP installs and changes made through the API (`403`).

## MCP servers in Digital Humans {#digital-humans}

A Digital Human refers to installed servers by name in `requires.mcps`:

```yaml
requires:
  mcps:
    - id: company-search
      reason: Looks up internal policies
```

| | Which servers it gets |
|---|---|
| Runs (schedule, file, webhook, **Run now**) | Only the servers listed in `requires.mcps` |
| Chats | Every server of its workspace and the global ones, except those listed with `enabled: false` |

- `enabled: false` keeps the entry but leaves that server out for this Digital Human only.
- If a declared server is not installed, turned off, waiting for sign-in or failing, a run doesn't start, and its **Work activity** says which server. Install or turn it on in the Digital Human's **Tools & Resources**, or switch it off there. In a chat, such a server is simply left out.
- Tools switched off on a server's card are left out everywhere, Digital Humans included.
- Halo's built-in tools, such as AI Browser, terminal and email, are not MCP servers: a Digital Human gets them through [`permissions`](/en/developers/digital-humans/spec#fields-top), and listing them in `requires.mcps` has no effect.

## Related {#related}

- [MCP servers](/en/features/mcp): add, test, switch tools and troubleshoot in the app
- [Digital Human spec reference](/en/developers/digital-humans/spec)
- [Writing skills](/en/developers/skills): when a skill is the better fit
