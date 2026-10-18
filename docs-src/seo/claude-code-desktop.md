---
title: Claude Code 桌面版：可视化图形界面，也支持 Codex
description: Halo 是开源的 Claude Code 图形界面客户端：不用命令行就能用 Claude Code、Codex 等 Agent 引擎，可用账号登录或自定义 API，还能用手机远程交办。
type: landing
audience: [developer, beginner]
edition: public
related: [guide/from-claude-code, getting-started/install, features/remote-access]
---

# Claude Code 桌面版（图形界面）

Halo 是一款开源的 AI 桌面工作站，默认用 Anthropic 官方的 Claude Code 引擎（Claude Code SDK）工作，也可以换成 OpenAI 的 Codex 等引擎。你在图形界面里对话、看 AI 改了哪些文件、做代码评审，不需要打开终端。Halo 本身免费（MIT 协议），模型费用由你登录的账号或 API 提供商收取。

Halo 不是 Anthropic 或 OpenAI 的官方产品。它把这些引擎放进一个图形界面，再加上工作区、数字人和远程访问。

## 在终端里用和在 Halo 里用 {#cli-vs-halo}

| | 在终端里用 Claude Code / Codex | 在 Halo 里用 |
|---|---|---|
| 引擎 | Claude Code 或 Codex 命令行 | 默认 Claude Code SDK；可在 **设置 › 高级 › AI Agent 引擎** 换成 Codex SDK 等（实验性），见 [Agent 引擎](/features/agent-engines) |
| 操作方式 | 输入命令 | 对话界面，文件、网页和终端在旁边的画布里打开 |
| 看 AI 改了什么 | `git diff` | **变更** 视图：对比改动、暂存、提交，或发起 **快速评审** / **团队评审**，见 [变更与代码评审](/features/code-review) |
| 登录 | 各自的账号或 API Key | Claude、ChatGPT、GitHub Copilot 账号登录，或 **自定义 API**（Anthropic / OpenAI 兼容接口） |
| 同时做几件事 | 多开几个终端 | 多个会话、多个工作区，在 **任务** 面板里集中看进度 |
| 不在电脑前 | — | 远程访问：用手机浏览器或 Android 应用继续 |
| 长期、定时的工作 | — | 数字人按计划自动运行，还能组成团队分工 |

![Halo 输入框的「＋」菜单：添加文件和文件夹，引用会话、与数字人聊天，以及网页控制、团队协作、AI 终端、文字识别、操作 Halo 五个能力开关](/images/features/capabilities/plus-panel.zh.webp)

输入框的 **＋** 里可以按需打开能力：**网页控制** 和 **团队协作** 默认开启，**AI 终端**、**文字识别**、**操作 Halo** 需要时再打开。AI 自己不能打开这些开关，需要时会请你打开。每个开关的作用见 [能力开关](/features/capabilities)。

## 已经在用 Claude Code 命令行 {#already-using-claude-code}

- **技能和 MCP 可以搬过来**：打开 **设置 › 高级 › Claude CLI 集成**，用 **从 Claude CLI 迁移技能** 和 **从 Claude CLI 迁移 MCP 服务器** 导入。
- **项目照旧**：用项目文件夹新建一个工作区，AI 就在这个文件夹里工作。
- 迁移的完整步骤见 [从 Claude Code 迁移](/guide/from-claude-code)。

## 用国内模型 {#domestic-models}

**自定义 API** 内置 26 个提供商，包括 DeepSeek、Kimi、智谱 GLM、阿里云 DashScope（通义千问）、MiniMax 等，也可以填写任意 OpenAI 或 Anthropic 兼容的接口地址。登录和填 Key 的步骤见 [配置 AI 模型](/getting-started/setup-ai)，多账号和按会话切换模型见 [模型与账号](/features/models)。

## 常见问题 {#faq}

### Halo 是 Anthropic 官方的 Claude Code 桌面版吗？

不是。Halo 是独立的开源项目（MIT 协议），默认用 Anthropic 官方的 Claude Code 引擎运行，界面、工作区、数字人和远程访问由 Halo 提供。

### 要先安装 Claude Code 命令行吗？

不用。引擎已经包含在 Halo 里，安装后登录账号或填写 API Key 就能开始。Windows 第一次启动时，Halo 会准备 Git Bash（电脑上已经装了 Git 就直接用），AI 需要它来运行命令。

### 能用 Codex 吗？

能。在 **设置 › 高级 › AI Agent 引擎** 选择 **Codex SDK**（实验性），重启 Halo 后对新会话生效，已有会话不会换引擎。各引擎支持的功能略有不同。如果这一项显示「此构建版本未包含」，说明你使用的版本没有附带这个引擎。

### 能在手机上继续吗？

能。打开 **设置 › 远程访问** 后，用手机浏览器或 Android 应用连到这台电脑，见 [远程访问](/features/remote-access)。

## 下一步 {#next-steps}

- [安装 Halo](/getting-started/install)：macOS、Windows、Linux 的下载与系统要求
- [从 Claude Code 迁移](/guide/from-claude-code)：技能、MCP 和项目怎么带过来
- [Halo 是什么](/guide/what-is-halo)：工作区、数字人和团队的全貌
- [远程访问](/features/remote-access)：在别的设备上继续用 Halo
