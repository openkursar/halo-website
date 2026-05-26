---
title: "MCP Servers - Extend AI Capabilities"
description: "Install MCP (Model Context Protocol) servers to extend Halo AI agent's capabilities with external tools."
---
# MCP Servers

MCP (Model Context Protocol) is the standard interface protocol for AI to call external tools. By installing MCP servers, you can greatly expand the boundaries of what Halo can do.

## What Is MCP

Think of MCP as **the AI's toolbox**. Each MCP server is a tool provider. The AI can call tools from it at any time while handling tasks — for example:

- Querying a database
- Reading and writing the file system
- Calling third-party APIs
- Operating a browser
- Searching the internet

::: info The difference between MCP, Skills, and Digital Humans
- **MCP**: Tool interfaces the AI can call — think of it as "the toolbox in an employee's hands"
- **Skills**: Packaged, single-purpose capability templates — think of it as "a skill the employee knows"
- **Digital Humans**: A complete AI individual with an identity, memory, and goals, capable of using MCP and Skills
:::

---

## Configure MCP Servers

Go to **Apps → My Apps** and click the "Manual Add SKILL/MCP" button at the bottom of the sidebar, then select **MCP Server**.

Two editing modes are supported:
- **Visual form**: Fill in name, transport type, command/URL, arguments, and environment variables step by step
- **JSON mode**: Paste a config directly from Cursor or Claude Desktop

<!-- Screenshot placeholder: screenshot-mcp-add.png (Add MCP dialog) -->

### Supported Connection Types

| Type | Description | Example |
|------|-------------|---------|
| **Command Line (stdio)** | Most common — local process communication | `npx @anthropic-ai/mcp-server-xxx` |
| **SSE (Server-Sent Events)** | Streaming connection | Real-time data push scenarios |
| **HTTP (Streamable)** | Streamable HTTP interface | Remote server endpoint |

### Example: Installing the Puppeteer MCP

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}
```

---

## Recommended MCPs

| MCP | Functionality |
|-----|---------------|
| `@modelcontextprotocol/server-filesystem` | File system operations |
| `@modelcontextprotocol/server-github` | GitHub repository management |
| `@modelcontextprotocol/server-puppeteer` | Headless browser automation |
| `@modelcontextprotocol/server-postgres` | PostgreSQL queries |
| `@modelcontextprotocol/server-brave-search` | Brave Search |

More MCP servers: [modelcontextprotocol.io/servers](https://modelcontextprotocol.io/servers)

---

## Notes

- Installing stdio-type MCPs requires the corresponding runtime to be installed first (e.g., `node`, `python`)
- MCP servers are loaded when Halo starts; configuration changes require a Halo restart to take effect
- Some MCPs require an API key — provide it via the corresponding environment variable in the configuration
