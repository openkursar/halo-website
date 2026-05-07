# 从 Claude Code 迁移到 Halo

如果你已经是 Claude Code（CC）用户，这页文档是你最快的上手路径。

**一句话定位：Halo = Claude Code + 可视化界面。** 底层是同一套 Agent 引擎，你在 CC 里积累的所有知识——CLAUDE.md、MCP 配置、自定义命令、Hooks——在 Halo 里全部有效，只是交互方式从终端变成了 GUI。

::: warning 最常见的误解：Halo 不是云服务
Halo **没有后台服务器**，是纯本地桌面应用。它把 Claude Code + Node.js + npm 打包成了一个安装包，CC 就运行在你自己的电脑上。你的代码、Skills、MCP 配置、对话记录全部在本地，不经过任何第三方服务器。

企业微信机器人等"远程"功能，也是连接到你本地运行的 Halo，不是连到云端。
:::

---

## 核心概念对照表

| Claude Code 概念 | Halo 对应概念 | 说明 |
|---|---|---|
| `cd /my-project && claude` | **专属空间** | 绑定目录，AI 在该目录中读写文件 |
| 在 home 目录下直接 `claude` | **Halo 默认空间（临时空间）** | 无绑定目录，适合临时问答 |
| 开多个终端标签，各自运行 `claude` | **多个并行空间** | Halo 原生支持，后台同时推进 |
| 单次 `claude` session | **一次对话** | Halo 自动保存，无需 `--resume` |
| `.claude/skills/my-skill/` | **Skills（技能）** | 目录结构和调用方式完全相同 |
| `CLAUDE.md` | **CLAUDE.md（不变）** | Halo 读取同一个文件 |
| MCP 配置 JSON | **MCP 配置面板** | 格式完全相同，改成 GUI 填写 |
| `claude` + cron job | **数字人** | CC 定时任务的产品化 + 可视化 |
| `~/.claude/` | `~/Library/.../halo/claude-config/` | Claude 配置层，路径不同，格式相同 |

---

## 逐一对照

### 空间 = `cd /path && claude`

这是最核心的类比。

在 CC 里，你每次工作都要先 `cd` 进项目目录，再启动 `claude`。这个"在某个目录下运行的 claude 实例"，就是 Halo 的**专属空间**。

```bash
# Claude Code 的工作方式
cd ~/projects/my-app
claude
# → AI 的工作目录是 ~/projects/my-app
```

Halo 的对应操作：点击左侧栏 **「+」**，选择「关联项目文件夹」，选择 `~/projects/my-app`。之后在这个空间里的所有对话，AI 的工作目录就是这个文件夹。

**Halo 默认空间（临时空间）**对应的是你随手在任意目录（比如 home）运行 `claude` 做快速问答，没有明确绑定目录的场景。

**并行多个空间**对应的是你开多个终端标签，在不同目录各自运行 `claude`。Halo 里所有空间的任务在后台独立执行，你可以来回切换——这在 CC 里需要你手动管理多个终端窗口。

---

### CLAUDE.md 和 `.claude/` 目录完全复用

Halo 直接读取专属空间绑定目录下的 `CLAUDE.md` 和 `.claude/` 文件夹。你已有的项目配置无需任何修改，打开空间就生效。

这包括：
- `CLAUDE.md`（项目级系统提示）
- `.claude/settings.json`（权限配置）
- `.claude/skills/`（技能，见下文）
- Hooks 配置

---

### Skills（技能）完全一致

CC 和 Halo 都使用 `.claude/skills/` 存放技能，格式和调用方式完全相同，无需任何迁移。

两种调用方式都支持：斜杠命令 `/skill-name`，或者直接用自然语言描述需求让 AI 自动匹配。Halo 更推荐后者——聊着天就把技能触发了，不用记命令名。

```markdown
---
name: code-commit
description: 当用户要求提交代码、commit、推送代码时，自动调用该技能
---

## 要求
...
```

全局 Skills（不绑定项目）的存放路径：
- macOS：`~/Library/Application Support/halo/claude-config/skills/`
- Windows：`C:\Users\<用户名>\AppData\Roaming\Halo\claude-config\skills\`

---

### MCP 配置：外层结构略有不同

CC 的 MCP 配置带有 `mcpServers` 外层包裹，服务器名称作为 key：

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

Halo 在 GUI 里单独填写服务器名称，JSON 只需粘贴内层配置：

```json
{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}
```

从 CC 迁移时，把 `mcpServers` 下每个服务器的内层对象单独粘贴到 Halo 的 JSON 模式中，名称填到界面的名称字段里即可。

---

### 数字人 = CC 定时任务的产品化 + 可视化

数字人本质就是把 CC 里"写脚本 + cron + 手动管理"这套流程，做成了开箱即用的产品。CC 里如果你想让 AI 定期自动执行任务，通常的做法是写一个 shell 脚本配合 cron：

```bash
# 每天早上 9 点跑一次
0 9 * * * claude --print "帮我汇总今日要处理的邮件" >> ~/daily.log
```

这很快会遇到几个问题：没有跨次运行的记忆、没有输出渠道（只能写文件）、触发方式只有 cron、排查问题要翻日志。

**数字人**解决这些问题：

| CC + cron | 数字人 |
|---|---|
| 无跨次记忆 | 持久化 `memory.md`，跨天记住上下文 |
| 只能写文件 | 推送到企业微信、飞书、钉钉、邮件 |
| 只有定时触发 | 还支持 Webhook、文件变化、网页监控 |
| 无运行历史 | 每次运行有完整对话回放 |
| 手动写 shell 脚本 | 用自然语言描述，Halo 自动创建 |

数字人的"system prompt"就是 CC 里你传给 `--system-prompt` 的内容，"工作区目录"就是它绑定的 `pwd`。

---

### 配置路径对应关系

| Claude Code 路径 | Halo 对应路径 |
|---|---|
| `~/.claude/` | `~/Library/Application Support/halo/claude-config/`（macOS） |
| `~/.claude/settings.json` | `~/Library/Application Support/halo/claude-config/settings.json` |
| `~/.claude/commands/`（全局命令） | `.../halo/claude-config/skills/`（全局技能） |
| 项目 `.claude/` | 不变，Halo 直接读取 |

Halo 自身的状态（空间记录、对话历史）存在 `~/.halo/`，与 Claude 配置层分开管理。

---

## 你不需要学的东西

Halo 没有改变 CC 的 Agent 模型，以下内容**原样保留**，不需要重新学习：

- Agent 的工具调用方式（Bash、Read、Write、Edit、Grep、Glob……）
- Hooks 机制（`PreToolUse`、`PostToolUse` 等）
- 权限模型（`allowedTools`、`deny` 等）
- `CLAUDE.md` 的写法
- MCP 协议本身

---

## 迁移检查清单

- [ ] 把已有项目目录关联为专属空间
- [ ] 确认 `CLAUDE.md` 和 `.claude/` 正常加载（在对话里问 AI "你了解这个项目的哪些约定？"）
- [ ] 把 CC 里的 MCP 配置迁移到 Halo 的 MCP 配置面板
- [ ] 确认 `.claude/skills/` 里的技能在 Halo 中正常调用
- [ ] 如果有长期定时任务，考虑用数字人替代 cron 脚本

---

::: tip
如果你在 CC 里已经有一套顺手的 `CLAUDE.md` 和工作流，**直接打开那个目录作为 Halo 专属空间，99% 的内容立即生效**，无需任何迁移工作。
:::
