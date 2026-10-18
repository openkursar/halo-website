---
title: 从 Claude Code 迁移到 Halo：概念对照与配置沿用
description: 已经在用 Claude Code 或 Codex？这里对照两边的概念，说明怎样用已有的订阅登录、把仓库作为工作区打开、沿用 CLAUDE.md、技能和 MCP，以及和终端里不一样的地方。
type: how-to
audience: [developer]
related: [features/agent-engines, features/code-review, features/spaces, features/skills]
---

# 从 Claude Code / Codex 迁移

迁移技能和 MCP 要在设置里点，Halo 不能替你改设置；进了工作区以后，像在终端里一样直接说就行。

## 概念对照 {#mapping}

| 在 Claude Code 里 | 在 Halo 里 | 说明 |
|---|---|---|
| `cd 项目 && claude` | 用 **自定义文件夹** 新建的工作区 | AI 在这个文件夹里读写，见 [打开你的仓库](#open-repo) |
| 随手在任意目录开 `claude` | **Halo 工作区** | 自带的默认工作区，不用选文件夹 |
| 开几个终端各跑一个 `claude` | 同时开几个会话 | 它们各自在后台运行，见 [同时推进多件事](/features/parallel-work) |
| `claude --resume` | 点开以前的会话接着聊 | 会话自动保存 |
| 项目里的 `CLAUDE.md`、`.claude/settings.json`、`.claude/skills/` | 照样生效 | 默认的 Claude Code 引擎会读取，见 [沿用配置](#carry-over) |
| `~/.claude/` 里的用户级配置 | Halo 自己的 Claude 配置目录 | 默认不读 `~/.claude`；技能和 MCP 可以迁移过来，用户级的 CLAUDE.md、settings.json、命令和子代理不会迁移 |
| `/` 斜杠命令 | 在输入框里输入 `/` | 列出引擎提供的命令和你的技能 |
| `git diff`、`git commit` | **变更** | 看改动、暂存、提交、推送，还能让 AI 评审，见 [变更、代码评审与 Git](/features/code-review) |
| `cron` 加 `claude -p` | 数字人 | 按计划自己运行，见 [数字人概述](/digital-humans/overview) |

## 用已有的订阅登录 {#sign-in}

第一次打开 Halo 时，在「欢迎使用 Halo」里选 **Claude**、**ChatGPT** 或 **GitHub Copilot**，用你已有的账号登录，见 [连接 AI 模型](/getting-started/setup-ai)。

在 macOS 上，还可以让 Halo 自带的 Claude Code CLI 自己登录：打开 **设置 › AI 模型 › OAuth登录 › Claude Code CLI**，在「使用 Claude Code CLI 登录」里点 **在 Halo 终端中运行**，按提示完成登录。Halo 不保存令牌，由 CLI 自己保存和刷新。这种方式只能用在 Claude Code 引擎上。

## 打开你的仓库 {#open-repo}

1. 在对话页左上角点当前工作区的名字，点 **新建工作区**。
2. **本地目录** 选 **自定义文件夹**，点 **浏览**，选你的仓库。
3. 点 **创建**。

对话、设置和记忆放在 Halo 自己的数据文件夹里，不写进这个文件夹；只有装到这个工作区的技能，会写进文件夹里的 `.claude/skills/`。详见 [新建工作区](/features/spaces#create)。

## 沿用配置 {#carry-over}

### 项目里的配置 {#project-config}

默认的 Claude Code 引擎会读取工作区文件夹里的 `CLAUDE.md`、`.claude/settings.json` 和 `.claude/skills/`，不用改动。

### 用户级的技能和 MCP {#user-config}

Halo 默认用自己的 Claude 配置目录，不读 `~/.claude`，这样 Halo 和终端里的 Claude Code 互不影响。想把原来的东西带过来：

1. 打开 **设置 › 高级 › Claude CLI 集成**。
2. 点 **从 Claude CLI 迁移技能**：扫描 `~/.claude/skills/`，每个技能可以选跳过、覆盖，或者重名时改名。
3. 点 **从 Claude CLI 迁移 MCP 服务器**：扫描 `~/.claude.json`，每个服务器可以选跳过或覆盖。Halo 里已经有同名的服务器时，选覆盖也会跳过，不会替换。

迁过来的技能是复制进 Halo 配置目录的，在 [技能](/features/skills) 里显示为「未托管」；迁过来的 MCP 服务器在 [MCP 服务器](/features/mcp) 里管理。

::: warning 不建议直接共用 ~/.claude
**配置目录** 可以改成 **Claude CLI 默认**（`~/.claude`），但它标着高风险：两边会互相改动设置；你在终端版 Claude Code 里配置的 API Key 或接口地址，还会盖过在 Halo 里选的模型。
:::

## 和终端里不一样的地方 {#differences}

- 不会逐个确认工具调用。Halo 始终以 **完全权限模式** 运行：AI 直接运行命令、修改和删除文件，只有它主动提问时才停下来等你。把工作区指向你放心让 AI 改动的文件夹，用 Git 和 **变更** 检查改动。
- 引擎可以换。默认是 Claude Code SDK；**设置 › 高级 › AI Agent 引擎** 里还有几种实验性的引擎（包括 Codex），换完要重启，只对新会话生效。见 [Agent 引擎](/features/agent-engines)。
- 多了可视化：右侧的文件栏和预览、能自己操作网页的 [AI 浏览器](/features/ai-browser)、从手机连回来的 [远程访问](/features/remote-access)。

## Codex 用户 {#codex}

想用 Codex，可以在 **AI Agent 引擎** 里换成 Codex 引擎（实验性）。在 Codex 引擎上，输入框的 `/` 菜单是空的，也不支持钩子和细分的工具权限；跨电脑团队里同事的请求、机器人里访客的消息，都会被拒绝。其他差异见 [Agent 引擎](/features/agent-engines#differences)。

::: done
在新工作区里问「你了解这个项目的哪些约定？」，Halo 的回答提到了 `CLAUDE.md` 里写的内容，就说明配置已经生效。
:::

## 下一步 {#next-steps}

- [变更、代码评审与 Git](/features/code-review)：看改动、提交和让 AI 评审。
- [技能](/features/skills)：管理和编写技能。
- [开发者文档](/developers/)：用 HTTP API 让别的程序调用 Halo。

<!-- public:start -->
想了解 Halo 作为 Claude Code 桌面版的整体介绍，见 [Claude Code 桌面版](/seo/claude-code-desktop)。
<!-- public:end -->
