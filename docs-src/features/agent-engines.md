---
title: Agent 引擎：切换 Claude Code、Codex 等引擎
description: Halo 的 Agent 引擎负责驱动 AI 干活：默认用 Claude Code SDK，也可以换成实验性的 Halo SDK、Codex SDK 或 DeepSeek dsh。这里说明怎么切换、各引擎有什么不同。
type: explanation
audience: [developer]
related: [features/models, features/settings, guide/from-claude-code]
---

# Agent 引擎

## 引擎是什么 {#what-is-an-engine}

Agent 引擎是 Halo 里驱动 AI 工作的那段程序。它把你的消息交给模型，执行模型要用的工具（读写文件、运行命令、调用 MCP 服务器），再把结果交回模型，一轮一轮做下去，直到任务完成。

引擎和模型是两回事。模型在 **设置 › AI 模型** 和输入框的模型卡片里选，见 [模型与账号](/features/models)。Halo 自带一个本地转换层，每个引擎都能用 OpenAI 兼容、Anthropic 兼容、ChatGPT、Copilot 等来源，所以换引擎一般不需要换账号（Claude Code CLI 登录的来源除外，见下文）。

大多数人不需要动引擎。默认的 Claude Code SDK 支持本页列出的除「目标」以外的全部功能。

<!-- public:start -->
想在图形界面里同时用 Claude Code 和 Codex？见 [Claude Code 桌面版](/seo/claude-code-desktop)。
<!-- public:end -->

## 可选的引擎 {#engines}

**设置 › 高级 › AI Agent 引擎** 里有四个引擎。下表的说明摘自设置里的原文。

| 引擎 | 设置里的说明 | 状态 | 额外要求 |
|---|---|---|---|
| Claude Code SDK | 官方 Anthropic Claude Code 驱动，适用于各种尖端模型 | 默认 | 无 |
| Halo SDK | Halo 官方 Agent 引擎，资源消耗少、启动更快，针对开源模型优化 | <Badge type="warning" text="实验性" /> | 无 |
| Codex SDK | 官方 OpenAI 提供 Codex SDK，更适用于 GPT 系列模型 | <Badge type="warning" text="实验性" /> | 无 |
| DeepSeek dsh | 由开源 DeepSeek dsh 运行时提供支持，其上游仍在不断变化且尚未稳定，最好与 DeepSeek 模型搭配使用 | <Badge type="warning" text="实验性" />，3.0 新增 | 无 |

某个引擎没有打包进你装的 Halo 时，它会变灰、不能选，旁边显示 **此构建版本未包含**，下面附一行英文原因。

## 切换引擎 {#switch}

切换引擎要你自己在设置里操作。Halo 不能替你切换引擎，即使打开了 [操作 Halo](/features/operate-halo) 也不行。

**AI Agent 引擎** 在 **设置 › 高级** 里，这一分区只在桌面版有 <Badge type="info" text="仅桌面版" />。远程访问的网页端和手机端看不到它。

1. 打开 **设置 › 高级**，找到 **AI Agent 引擎**（标着 **实验性功能**）。
2. 选一个引擎。选择会立刻保存，下方出现「需要重启才能使引擎更改生效。」。
3. 点 **立即重启**，在「重启 Halo？」对话框里确认。Halo 重启后，新引擎生效。

切换后要注意三点：

- 新引擎只用于之后的**新对话和新任务**。已有的对话不能换引擎，会一直用创建时的引擎。
- 不是默认引擎的对话，在会话列表里标题旁有一个小标签：**Halo**（Halo SDK）、**Codex** 或 **DSH**（DeepSeek dsh）。鼠标悬停会显示「此对话运行于 Codex 引擎。」这样的提示。默认引擎的对话没有标签。
- 如果之前选的引擎在当前安装里不可用，Halo 会改用另一个引擎启动，并提示「所选引擎不包含在此构建版本中，因此 Halo 正在其他引擎上运行。」你的选择仍然保留，可以重新安装完整的安装包，或者在下方换一个可用的引擎。

## 各引擎有什么不同 {#differences}

下表只列出在 Halo 3.0.4 里确认过的差别。表里没列的功能，不代表在实验性引擎上一定能用。

| 功能 | Claude Code SDK | Halo SDK | Codex SDK | DeepSeek dsh |
|---|---|---|---|---|
| 给会话设定 [目标](/features/conversations#goal) | 不支持 | **支持**（只有这个引擎） | 不支持 | 不支持 |
| [Claude Code CLI 登录](/features/models#claude-code-cli)的来源 | **支持**（只有这个引擎，且仅 macOS） | 不支持 | 不支持 | 不支持 |
| 输入框里的「/」菜单 | 列出引擎命令和技能 | 列出引擎命令和技能 | 不显示 | 不显示 |
| [记忆](/features/memory)的写入保护 | 有 | 有 | 没有 | 没有 |
| 其他电脑上的同事、受限的访客让你的数字人干活 | 可以 | 可以 | 拒绝，不会开始 | 拒绝，不会开始 |
| IM 会话里的 **在客户端中继续** | 有 | 有 | 隐藏 | 隐藏 |
| 停止回复 | 只停当前回复 | 只停当前回复 | 只停当前回复 | 结束整个引擎会话 |

逐项说明：

- **目标**：只在工作区的会话里可用，数字人的会话里没有。
- **Claude Code CLI 登录**：用其他引擎时，这类来源的回合会直接失败，提示要换回 Claude Code 引擎。
- **「/」菜单**：Codex SDK 和 DeepSeek dsh 不向 Halo 报告任何命令，所以输入「/」不会弹出菜单。菜单用法见 [用 / 调出命令和技能](/features/conversations#slash-menu)。
- **记忆写入保护**：Claude Code SDK 和 Halo SDK 会给记忆文件的写入加锁，并守住只读范围。Codex SDK 和 DeepSeek dsh 没有这层保护，记忆仍然能用，只是靠 AI 按指示小心修改。
- **别人的请求**：Codex SDK 和 DeepSeek dsh 没法把别人的请求限制在你允许的范围内，也记不下它做了什么，所以 Halo 直接不开始这类请求，提示 `Switch Halo's agent engine to Claude Code to let teammates put your digital humans to work.` 想让同事使用你的数字人，换回默认引擎。权限怎么设见 [跨电脑团队](/digital-humans/cross-computer-teams) 和 [主人与访客权限](/digital-humans/permissions)。
- **在客户端中继续**：把数字人的 IM 会话复制成桌面上的新对话。Codex SDK 和 DeepSeek dsh 不能复制引擎会话，所以没有这个按钮。
- **停止**：DeepSeek dsh 没有中途取消的办法，点停止会结束它的整个会话，而不是只打断当前回复。
- **AI 提问卡片**：DeepSeek dsh 没有提问卡片，AI 不能停下来问你选择题。
- **单独关掉 MCP 工具**：用 DeepSeek dsh 时，MCP 设置里会提示「DSH 引擎无法单独排除 MCP 工具：在此处关闭的工具在其对话中仍可用。」要停用就关掉整个 MCP 服务器，见 [MCP 服务器](/features/mcp)。
- **深度思考**：每个引擎只接受自己支持的级别，Halo 会就近换算，例如 Codex SDK 把「关闭」按「低」处理。换算表见 [深度思考](/features/models#deep-thinking)。

MCP 服务器、图片输入和上下文自动压缩，四个引擎都支持。

## 什么时候换引擎 {#when-to-switch}

| 我想… | 用这个 |
|---|---|
| 正常使用，不想折腾 | 保持 **Claude Code SDK**（默认） |
| 用 Claude Code CLI 登录的账号 | 必须用 **Claude Code SDK** |
| 让其他电脑上的同事或受限的访客使用我的数字人 | **Claude Code SDK** 或 **Halo SDK** |
| 给会话设定目标，让 AI 按完成条件一直做下去 | **Halo SDK** |
| 主要用 GPT 系列模型，想试试 OpenAI 的引擎 | **Codex SDK**，注意上表里它缺的功能 |
| 主要用 DeepSeek 模型，愿意试新东西 | **DeepSeek dsh** |

三个实验性引擎都可能有尚未修复的问题。遇到奇怪的行为，先换回 Claude Code SDK、重启，再新建一个对话试试。

## 从 Claude Code 来的用户 {#claude-code-compatibility}

默认的 Claude Code SDK 引擎会读取工作区里的 `CLAUDE.md` 和 `.claude/` 设置，以及 Claude 配置目录里的用户级设置（**设置 › 高级 › Claude CLI 集成 › 配置目录**，默认是 Halo 自己的目录，不是 `~/.claude`）。迁移步骤见 [从 Claude Code 迁移到 Halo](/guide/from-claude-code)。

## 下一步 {#next-steps}

- [模型与账号](/features/models)：引擎定了以后，选具体用哪个模型、深度思考调到多少
- [设置参考](/features/settings#agent-engine)：**高级** 分区里其他选项的说明
- [从 Claude Code 迁移到 Halo](/guide/from-claude-code)：把技能、MCP 服务器和习惯带过来
