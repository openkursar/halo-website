---
title: 配置路径：Halo 的数据、配置、日志和技能放在哪里
description: Halo 的配置路径一览：在 macOS、Windows、Linux 上，数据、设置和凭据、日志、技能、Claude 配置目录各放在哪个文件夹，以及怎样从 Halo 里直接打开。
type: reference
audience: [admin, developer]
related: [advanced/migrate, advanced/security, features/settings]
---

# 数据与配置位置

本页列出 Halo 3.0.4 桌面版在本机用到的每个文件夹：Halo 数据文件夹、应用数据文件夹、日志、诊断报告、工作区和记忆、技能，以及 Claude 配置目录。Halo 的数据分两处存放：你的数据（设置、对话、工作区、数字人）在 Halo 数据文件夹；AI 浏览器的登录状态、Claude 配置等运行环境在应用数据文件夹。换电脑时怎么搬，看 [换电脑迁移](/advanced/migrate)。

## 位置总览 {#overview}

| 内容 | macOS | Windows | Linux |
|---|---|---|---|
| [Halo 数据文件夹](#data-folder) | `~/.halo` | `%USERPROFILE%\.halo` | `~/.halo` |
| [应用数据文件夹](#app-data-folder) | `~/Library/Application Support/halo` | `%APPDATA%\halo` | `~/.config/halo` |
| [日志](#logs) | `~/Library/Logs/halo` | `%APPDATA%\halo\logs` | `~/.config/halo/logs` |
| [导出的诊断报告](#diagnostics) | `~/Downloads/halo-diagnostics-<时间戳>.json` | 「下载」文件夹 | 「下载」文件夹 |
| [Claude 配置目录](#claude-config)（默认） | `~/Library/Application Support/halo/claude-config` | `%APPDATA%\halo\claude-config` | `~/.config/halo/claude-config` |
| [全局技能](#skills)（默认） | Claude 配置目录下的 `skills/` | 同左 | 同左 |

- `%USERPROFILE%` 是 `C:\Users\<用户名>`，`%APPDATA%` 是 `C:\Users\<用户名>\AppData\Roaming`。这两个写法可以直接粘贴到资源管理器的地址栏。
- 应用数据和日志的文件夹名是小写的 `halo`。
- `~/.halo` 以 `.` 开头，在 macOS 访达里默认隐藏。在访达按 <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>G</kbd>，输入 `~/.halo` 就能打开。

::: info 说明
公司提供的 Halo 可能用不同的文件夹名：数据文件夹会是 `~/.<名称>`，应用数据和日志文件夹也可能不叫 `halo`。以 **日志文件 › 打开文件夹** 实际打开的位置为准。
:::

## Halo 数据文件夹 {#data-folder}

Halo 数据文件夹存放你的设置、凭据、对话、工作区、数字人和知识库。macOS 和 Linux 上是 `~/.halo`，Windows 上是 `%USERPROFILE%\.halo`。

| 里面的内容 | 存的是什么 |
|---|---|
| `config.json` | 全部设置，包括 API Key、令牌等凭据 |
| `halo.db` | Halo 的本地数据库 |
| `spaces/` | 每个工作区的 Halo 数据，见 [工作区和记忆的数据](#workspaces) |
| `spaces-index.json` | 工作区列表 |
| `temp/` | **Halo 工作区** 的数据：`artifacts/` 是 AI 做出的文件，`conversations/` 是对话 |
| `knowledge-bases/` | [知识库](/features/knowledge-base) 的数据 |
| `team-work/` | [团队](/digital-humans/collaboration) 协作时的中间文件 |
| `apps/`、`tunnel/`、`codex/` 等 | Halo 运行时的其他数据 |

- 没有 `settings.json`，设置都在 `config.json`。界面语言是例外，它保存在各个客户端自己那里。
- 正式版和预览版**共用**同一个数据文件夹。
- Halo 里没有「移动数据文件夹」的设置。要换位置，用 [`HALO_DATA_DIR`](#halo-data-dir)。
- 在 Windows 上卸载 Halo，数据会保留。
- 开发者从源码直接运行的未打包版本用 `~/.halo-dev`，和安装的 Halo 互不影响。

::: warning 注意
公开发行版把 API Key 和令牌以**明文**存在 `config.json` 里，界面上只显示为 `***`。不要把这个文件发给别人，也不要放进同步盘或代码仓库。详见 [安全、隐私与数据流](/advanced/security)。
:::

## 应用数据文件夹 {#app-data-folder}

应用数据文件夹是 Halo 桌面应用的运行环境，文件夹名是小写的 `halo`。

| 系统 | 位置 |
|---|---|
| macOS | `~/Library/Application Support/halo` |
| Windows | `%APPDATA%\halo` |
| Linux | `~/.config/halo` |

| 里面的内容 | 存的是什么 |
|---|---|
| `Partitions/browser/` | [AI 浏览器](/features/ai-browser) 的登录状态和网站数据。**设置 › 系统 › 浏览器数据 › 清除浏览器数据** 会清掉它们。最外层的 `Cookies`、`Local Storage` 等属于 Halo 自己的窗口，不会被清除 |
| `claude-config/` | 默认的 [Claude 配置目录](#claude-config)，含全局技能 |
| `git-bash/` | 仅 Windows：Halo 自动下载安装的 Git Bash |
| `Crashpad/` | 崩溃转储，见 [诊断报告和崩溃报告](#diagnostics) |
| `logs/auth-audit.log` | 仅 macOS 放在这里，见 [日志](#logs) |

## 日志 {#logs}

| 系统 | 日志文件夹 |
|---|---|
| macOS | `~/Library/Logs/halo` |
| Windows | `%APPDATA%\halo\logs` |
| Linux | `~/.config/halo/logs` |

| 文件 | 内容 | 何时写入 | 大小与保留 |
|---|---|---|---|
| `main.log` | Halo 主日志 | 一直写入；打开 **开发者模式** 后变为调试级别 | 满 10 MB 轮转，保留 5 份编号存档（`main.1.log` 到 `main.5.log`） |
| `halo-sdk.log` | Halo SDK [引擎](/features/agent-engines) 的运行记录 | 一直写入；开发者模式下变为调试级别 | — |
| `http-raw.log` | 完整的请求和响应 | **只在开发者模式打开时**写入 | — |
| `auth-audit.log` | [远程访问](/features/remote-access) 的登录记录：成功、失败、锁定和来源 IP，不记录密码 | 有人登录远程访问时 | 满 5 MB 轮转。macOS 上在 `~/Library/Application Support/halo/logs`，Windows 和 Linux 上就在日志文件夹里 |

打开日志文件夹：**设置 › 系统 › 日志文件 › 打开文件夹**。<Badge type="info" text="仅桌面版" />

::: danger 警告
开发者模式打开期间，`http-raw.log` 会原样记录完整的请求头和请求体，里面有你的 API Key 和对话内容。把日志发给别人之前，先关掉 **设置 › 高级 › 开发者模式**，再删掉 `http-raw.log`。需要分享时，优先用脱敏过的诊断报告。
:::

## 诊断报告和崩溃报告 {#diagnostics}

| 内容 | 位置 | 怎么得到 |
|---|---|---|
| 诊断报告 | 「下载」文件夹里的 `halo-diagnostics-<时间戳>.json`，macOS 上是 `~/Downloads` | **设置 › 系统 › 系统诊断 › 运行诊断**，再点 **导出报告**。界面显示「报告已导出至」和完整路径 |
| 崩溃报告 | 应用数据文件夹里的 `Crashpad/` | **设置 › 系统 › 崩溃报告 › 打开文件夹** |

- 诊断报告不含密钥本身。错误信息里的 Bearer 令牌、JWT 和部分 `sk-` 开头的 Key 会被遮盖，但 Anthropic（`sk-ant-…`）和 OpenAI 项目 Key（`sk-proj-…`）这类格式不会；`/Users` 或 `/home` 路径里的用户名会被隐去，Windows 路径里的不会。发出前先通读一遍，详见[日志与诊断](/troubleshooting/diagnostics#report)。
- 崩溃报告只存在本机，不会上传。界面上的说明是「崩溃报告保存在本机。需要时可打开该文件夹，将其发送给支持团队。」

怎样用它们排查问题，看 [日志与诊断](/troubleshooting/diagnostics)。

## 工作区和记忆的数据 {#workspaces}

每个工作区的 Halo 数据都集中放在 Halo 数据文件夹里，和你的项目文件夹分开。

| 内容 | 位置 |
|---|---|
| 工作区的 Halo 数据（名称、颜色、工作目录、偏好、对话） | `~/.halo/spaces/<工作区 ID>/.halo/`，其中 `meta.json` 是工作区信息，`conversations/` 是对话 |
| 工作区记忆 | `~/.halo/spaces/<工作区 ID>/.halo/memory.md` 和 `memory/` |
| **Halo 工作区** 的文件、对话和记忆 | `~/.halo/temp/artifacts/`、`~/.halo/temp/conversations/`、`~/.halo/temp/.halo/` |
| 数字人记忆 | `~/.halo/spaces/<工作区 ID>/.halo/apps/<数字人 ID>/`，详见 [记忆文件在哪里](/features/memory#files) |

- `<工作区 ID>` 是随机 ID，不是工作区名称。不要猜路径，用 **在文件夹中显示** 打开。
- 工作区关联了自定义文件夹时，那个文件夹里只有你的文件和 AI 改动的文件。Halo 建工作区时不往里写自己的数据，工作区记忆也不放在那里。工作区技能是例外，见 [技能](#skills)。
- 很早以前建的工作区，项目文件夹里可能还留有 `.halo/` 文件夹。
- 删除关联了项目文件夹的工作区，只删 Halo 数据（对话记录），项目文件保留。详见 [工作区](/features/spaces)。

## 技能 {#skills}

技能是一个含 `SKILL.md` 的文件夹，按作用范围放在两个地方。

| 范围 | 位置 | 谁能用 |
|---|---|---|
| 全局技能 | `<Claude 配置目录>/skills/<技能文件夹>/` | 所有工作区的对话和数字人 |
| 工作区技能 | `<项目文件夹>/.claude/skills/<技能文件夹>/` | 只有这个工作区 |

- 默认设置下，全局技能在应用数据文件夹的 `claude-config/skills/`。改了 [Claude 配置目录](#claude-config)，全局技能的位置也跟着变。
- 文件夹名相同时，工作区技能优先于全局技能。
- 手动放进这些文件夹的技能也会被发现。停用或卸载的技能会从磁盘上删除。

怎样添加、导入和管理技能，看 [技能](/features/skills)。

## Claude 配置目录 {#claude-config}

Claude Code 引擎从 Claude 配置目录读取技能、设置和 MCP 配置，它的会话记录也存在这里。默认目录是应用数据文件夹里的 `claude-config`，它相当于独立安装的 Claude Code CLI 的 `~/.claude/`。

在 **设置 › 高级 › Claude CLI 集成 › 配置目录** 里选择。<Badge type="info" text="仅桌面版" />

| 选项 | 目录 | 说明 |
|---|---|---|
| **Halo 默认**（**推荐**） | 应用数据文件夹里的 `claude-config` | 默认值。和你单独安装的 Claude CLI 互不影响 |
| **Claude CLI 默认** | `~/.claude` | 标记 **高风险**、**不推荐**，选择时要在对话框里点 **使用共享配置** 确认。技能和设置与 Claude CLI 共用，CLI 里的改动会影响 Halo；CLI 里配置的 API Key 或地址会盖过你在 Halo 选的模型 |
| **自定义路径** | 你指定的目录 | — |

- 面板上显示当前实际使用的路径。
- 点 **应用** 后显示「已保存。重启任何活跃的对话以应用。」进行中的对话要重新开始，才会用上新目录。
- 想沿用 Claude CLI 里已有的技能，又不想共用目录，用同一分区的 **从 Claude CLI 迁移技能**。各选项的细节见 [设置参考](/features/settings#claude-cli-integration)。

## 在 Halo 里打开这些文件夹 {#open-from-the-app}

下面的入口只在桌面版里有效。<Badge type="info" text="仅桌面版" /> 在远程网页和安卓端点了不会打开文件夹。

| 想打开 | 在 Halo 里点 |
|---|---|
| 日志文件夹 | **设置 › 系统 › 日志文件 › 打开文件夹** |
| 崩溃报告 | **设置 › 系统 › 崩溃报告 › 打开文件夹** |
| 诊断报告 | **设置 › 系统 › 系统诊断 › 运行诊断 › 导出报告**，看显示的路径 |
| 工作区的工作目录 | **管理工作区** 页上工作区卡片的 **更多 › 在文件夹中显示**。**Halo 工作区** 打开的是 `~/.halo/temp/artifacts` |
| 数字人的记忆文件夹 | 数字人的 **能力与设置 › 高级 › 应用规格 › 记忆文件 › 在访达中显示**。这个链接在 Windows 和 Linux 上也叫这个名字 |
| Claude 配置目录 | **设置 › 高级 › Claude CLI 集成 › 配置目录** 显示当前路径，按这个路径在文件管理器里打开 |

工作区记忆没有单独的打开按钮。工作区卡片的 **在文件夹中显示** 打开的是工作目录，不是记忆所在的位置。

## 用 HALO_DATA_DIR 换数据文件夹 {#halo-data-dir}

设置环境变量 `HALO_DATA_DIR` 后，Halo 用它指定的文件夹代替 `~/.halo` 作为数据文件夹。

- 路径开头的 `~` 会展开成你的用户目录。
- 设置后，日志改写到 `<HALO_DATA_DIR>/logs`。
- 应用数据文件夹（浏览器资料、`claude-config` 等）不受影响。
- 只能用环境变量设置，Halo 里没有对应的界面。要在启动 Halo 之前设好。

## 数据库备份和新版本数据保护 {#backups}

需要升级数据库结构时，Halo 会先把 `halo.db` 备份为 `halo.db.<时间戳>.premigrate.bak`，放在 Halo 数据文件夹里，只保留最新的 2 份。数据库损坏时，Halo 会把它改名为带 `.corrupt.<时间戳>` 后缀的文件，再新建一个。

正式版和预览版共用数据文件夹。用较新的版本（例如 [预览版](/advanced/updates#preview-channel)）打开过数据后，再用旧版本启动，Halo 会弹出「数据来自更新的版本」对话框，提示「无法打开本地数据」：

- 为避免损坏数据，Halo 停止启动，随后退出。
- 对话框显示数据目录和版本，建议你用较新的版本打开这份数据，或者恢复一份 `.premigrate.bak` 备份。
- 按钮是 **打开数据目录** 和 **退出**。对话框的语言跟随系统语言。

## 相关页面 {#related}

- [换电脑迁移](/advanced/migrate)：要带走哪两个文件夹，哪些需要重新登录
- [安全、隐私与数据流](/advanced/security)：明文凭据、日志和远程访问的安全说明
- [设置参考](/features/settings)：系统和高级分区里每个设置项的作用
