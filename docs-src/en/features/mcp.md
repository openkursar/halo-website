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

Go to **Settings → MCP Servers** and click "Add."

<!-- Screenshot placeholder: screenshot-mcp-settings.png (MCP settings page) -->

### Supported Connection Types

| Type | Description | Example |
|------|-------------|---------|
| **Command Line (stdio)** | Most common — local process communication | `npx @anthropic-ai/mcp-server-xxx` |
| **HTTP** | REST API style | Remote server endpoint |
| **SSE** | Streaming connection | Real-time data push scenarios |

### Example: Installing the Puppeteer MCP

```json
{
  "name": "puppeteer",
  "type": "stdio",
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
