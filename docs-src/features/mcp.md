# MCP 服务器

MCP（Model Context Protocol）是 AI 调用外部工具的标准接口协议。通过安装 MCP 服务器，你可以大幅扩展 Halo 的能力边界。

## MCP 是什么

可以把 MCP 理解为 **AI 的工具箱**。每个 MCP 服务器是一个工具提供者，AI 在处理任务时可以随时调用其中的工具，例如：

- 查询数据库
- 读写文件系统
- 调用第三方 API
- 操作浏览器
- 搜索互联网

::: info MCP、Skill、数字人的区别
- **MCP**：AI 能调用的工具接口，类比"员工手里的工具箱"
- **Skill**：封装好的单一能力模板，类比"员工会的一项技能"
- **数字人**：一个完整的 AI 个体，拥有身份、记忆、目标，会使用 MCP 和 Skill
:::

---

## 配置 MCP 服务器

进入 **设置 → MCP 服务器**，点击「添加」。

<!-- 截图占位：screenshot-mcp-settings.png（MCP 设置页） -->

### 支持的连接类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **Command Line (stdio)** | 最常用，本地进程通信 | `npx @anthropic-ai/mcp-server-xxx` |
| **HTTP** | REST API 方式 | 远程服务器接口 |
| **SSE** | 流式连接 | 实时数据推送场景 |

### 示例：安装 Puppeteer MCP

```json
{
  "name": "puppeteer",
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}
```

---

## 推荐 MCP

| MCP | 功能 |
|-----|------|
| `@modelcontextprotocol/server-filesystem` | 文件系统操作 |
| `@modelcontextprotocol/server-github` | GitHub 仓库管理 |
| `@modelcontextprotocol/server-puppeteer` | 无头浏览器自动化 |
| `@modelcontextprotocol/server-postgres` | PostgreSQL 查询 |
| `@modelcontextprotocol/server-brave-search` | Brave 搜索 |

更多 MCP 服务器：[modelcontextprotocol.io/servers](https://modelcontextprotocol.io/servers)

---

## 注意事项

- 安装 stdio 类型的 MCP 需要提前安装对应的运行时（如 `node`、`python`）
- MCP 服务器在 Halo 启动时加载，修改配置后需要重启 Halo 生效
- 部分 MCP 需要 API Key，请在配置时填入对应的环境变量
