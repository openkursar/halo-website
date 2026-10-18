---
title: "MCP 配置参考：字段、传输方式与 JSON 格式"
description: "Halo 中 MCP 服务器的配置参考：配置字段和传输方式，Halo 接受的 JSON 格式，把 MCP 服务器打包分发，以及数字人怎样获得它们。"
type: reference
audience: [developer]
---

# MCP 配置参考

MCP 服务器为 Halo 的 AI 提供额外的工具，来源可以是你电脑上的程序，也可以是网络上的服务器。本页是配置参考：字段、传输方式、Halo 接受的 JSON、把 MCP 服务器打包，以及数字人怎样获得它们。在应用里添加、测试和管理服务器，见 [MCP 服务器](/features/mcp)。

## 配置保存在哪里 {#where}

你添加的每个 MCP 服务器都是一个类型为 `mcp` 的已安装项，可以是全局的，也可以只属于一个工作区，保存在 Halo 的数据库里，而不是 `config.json`。Halo 在每个新会话开始时读取这份列表，所以修改后不需要重启：已经打开的会话从下一条消息起生效。要从 Claude Code 迁移服务器，用 **设置 › 高级 › Claude CLI 集成 › 从 Claude CLI 迁移 MCP 服务器**。

## 字段 {#fields}

服务器的配置就是它 spec 里的 `mcp_server` 对象。**添加MCP服务器** 的 **可视化** 表单字段与它一致，只是没有 `cwd`，`cwd` 只能在 **JSON** 模式里设置：

<!-- generated:spec-fields mcp only=mcp_server -->
_本表由 Halo 3.0.4 的 schema 生成。_

### `mcp_server` {#field-mcp-server}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `transport` | `enum` | 否 | = `"stdio"`; `stdio`, `sse`, `streamable-http` | `stdio` 启动一个本地命令；`sse` 和 `streamable-http` 连接一个服务器地址。 |
| `command` | `string`（非空） | 是 | — | `stdio` 时是要运行的程序，例如 `npx`。`sse` 和 `streamable-http` 时是服务器地址：没有单独的 `url` 字段。 |
| `args` | `string[]` | 否 | — | 命令的参数（`stdio`）。 |
| `env` | `map<string, string>` | 否 | — | 命令的环境变量。数字和布尔值会转成字符串。值按原样保存，不要把密钥放进要分享的包。 |
| `headers` | `map<string, string>` | 否 | — | `sse` 和 `streamable-http` 使用的 HTTP 请求头，例如鉴权头。按原样保存。 |
| `cwd` | `string` | 否 | — | 命令的工作文件夹（`stdio`）。 |
<!-- /generated:spec-fields -->

`env` 和 `headers` 的值按原样保存。远程访问的 API 会以明文返回它们；Halo 自己的助手看到的是打码后的值。

## 传输方式 {#transports}

| 传输方式 | Halo 怎样连接服务器 | 可视化表单中的名称 |
|---|---|---|
| `stdio`（默认） | 在运行 Halo 的电脑上启动 `command`，带上 `args`、`env` 和 `cwd`。程序必须安装在那台电脑上，例如用 `npx` 需要 Node.js | **命令行(stdio)** |
| `streamable-http` | 通过 Streamable HTTP 连接 `command` 中的地址，并发送 `headers` | **HTTP (Streamable)** |
| `sse` | 通过 Server-Sent Events 连接 `command` 中的地址，这是一些服务器仍在用的旧传输方式 | **SSE (Server-Sent Events)** |

没有单独的 `url` 字段：用 `streamable-http` 和 `sse` 时，地址写在 `command` 里。

## Halo 接受的 JSON {#json}

在 **添加MCP服务器** 里，**JSON** 模式接受其他 MCP 客户端使用的格式，你可以把找到的配置原样粘贴进来。

一个服务器，常见格式，本地或远程：

```json
{ "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/docs"] }
```

```json
{ "type": "http", "url": "https://mcp.example.com/mcp", "headers": { "Authorization": "Bearer <YOUR_TOKEN>" } }
```

一次多个服务器：像 Cursor 和 Claude Desktop 那样包在 `mcpServers` 里，或者同样的对象去掉 `mcpServers` 这一层。每个服务器会以自己的名字分别安装：

```json
{
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/docs"] },
    "company-search": { "type": "http", "url": "https://mcp.example.com/mcp" }
  }
}
```

常见格式和 Halo 字段的对应关系：

| 粘贴的内容 | 转换为 |
|---|---|
| `command`、`args`、`env`、`cwd`，没有 `type` 或 `"type": "stdio"` | `transport: stdio`，其余字段不变 |
| `"type": "http"` 或 `"streamable-http"`、`url`、`headers`、`env` | `transport: streamable-http`、`command: <url>`、`headers`、`env` |
| `"type": "sse"`、`url`、`headers`、`env` | `transport: sse`、`command: <url>`、`headers`、`env` |

`type` 不区分大小写，`_` 按 `-` 处理，所以写 `streamable_http` 也可以。Halo 自己的写法（`transport` 加 `command`）同样接受。地址必须是完整的 URL；`env` 和 `headers` 的值可以是字符串、数字或布尔值。

### 名称 {#names}

服务器的名称就是它的 id：显示在卡片上，写在数字人的 `requires.mcps` 里，也会出现在它的工具名中。名称请只用字母、数字和 `. @ / _ -`，并以字母、数字、`_` 或 `@` 开头。Halo 不会检查这一点，但其他字符可能让工具名出错。另外：

- 不要使用 Halo 内置工具的名字，例如 `ai-browser`、`ai-terminal`、`email`、`halo-email`、`web-search`、`ocr`、`halo-docs`、`halo-apps`、`halo-report`、`halo-notify`、`halo-api-ref`、`halo-conversations`、`halo-reminders`、`halo-person-context` 或 `im-file-send`。只要这个内置工具在当前会话或数字人里是打开的，就会取代同名的服务器。
- 工作区服务器可以和全局服务器同名。同名时，在这个工作区里用的是工作区的那个。

## 打包 MCP 服务器 {#package}

MCP 服务器可以写成 `type: mcp` 的 spec 来分发，例如放在公司商店来源里（它的 `mcps.json` 索引），或通过 [`POST /api/apps/install`](/developers/api/digital-human#post-api-apps-install) 安装，`spaceId: null` 表示为所有工作区安装：

```yaml
name: company-search
version: "1.0.0"
author: example
description: 搜索公司知识库。
type: mcp
mcp_server:
  transport: streamable-http
  command: https://mcp.example.com/mcp
```

- 要分享的 spec 里不要写令牌：每个人安装后，在服务器的配置里填写自己的请求头或环境变量。
- 在 Halo 里发布到商店只支持数字人和技能，不支持 MCP 服务器。见[发布到商店](/developers/store-publishing)。
- 企业版构建可以禁止某些命令，安装这样的服务器会以 `MCP_COMMAND_BLOCKED` 失败。它也可以拒绝通过 API 安装或修改 MCP 服务器（`403`）。

## 数字人里的 MCP 服务器 {#digital-humans}

数字人在 `requires.mcps` 里按名称引用已安装的服务器：

```yaml
requires:
  mcps:
    - id: company-search
      reason: 查询内部制度
```

| | 能用哪些服务器 |
|---|---|
| 运行（定时、文件、Webhook、**立即运行**） | 只有 `requires.mcps` 里列出的服务器 |
| 聊天 | 它所在工作区的全部服务器加上全局服务器，标了 `enabled: false` 的除外 |

- `enabled: false` 会保留这一项，但只对这位数字人排除该服务器。
- 声明的服务器没有安装、被关闭、等待登录或连接失败时，运行不会开始，**工作动态** 里会写明是哪个服务器。请在数字人的 **工具与资源** 里安装或打开它，或者在那里把它关掉。在聊天里，这样的服务器只是用不到。
- 在服务器卡片上关掉的工具，在任何地方都不可用，数字人也一样。
- AI 浏览器、终端、邮件等 Halo 内置工具不是 MCP 服务器：数字人通过 [`permissions`](/developers/digital-humans/spec#fields-top) 获得它们，写进 `requires.mcps` 没有作用。

## 相关页面 {#related}

- [MCP 服务器](/features/mcp)：在应用里添加、测试、开关工具和排查问题
- [数字人 spec 参考](/developers/digital-humans/spec)
- [编写技能](/developers/skills)：什么时候用技能更合适
