---
title: "编写技能：SKILL.md 格式、脚本与打包"
description: "为 Halo 编写技能：SKILL.md 的格式和字段，配套文件与脚本，Halo 在哪里找到技能、怎样命名，以及测试和打包分享。"
type: reference
audience: [developer]
---

# 编写技能

技能是一个文件夹，里面的 `SKILL.md` 告诉 AI 怎样做某一类任务：步骤、规则和输出格式。本页写给编写技能的人：文件格式、配套文件和脚本、Halo 怎样找到和命名技能、测试，以及打包分享。安装和使用技能，见[技能](/features/skills)。

## 文件夹 {#folder}

```text
weekly-report/
├── SKILL.md            必需：头部信息和指令
├── template.md         可选：SKILL.md 引用的文件
└── scripts/
    └── collect.js
```

- 技能的 `name` 就是命令，Halo 也按它给文件夹命名：这个技能用 `/weekly-report` 调用。
- Halo 把技能的每个文件都按 UTF-8 文本保存。图片等二进制文件在安装、导出或发布后会损坏，所以不要放进技能文件夹。
- AI 使用技能时会读 `SKILL.md`，其他文件通常只在 `SKILL.md` 指引时才打开。请按文件在文件夹里的路径引用它们，并说明什么时候读、什么时候运行。

## SKILL.md {#skill-md}

```markdown
---
name: weekly-report
description: 用户要写周报或总结本周工作时使用。根据本周的笔记，按团队的格式写周报。
---

# 周报

1. 读取工作区 `notes/` 里本周的笔记。
2. 按 `template.md`，把事项分到「已完成」「进行中」「下周计划」三组。
3. 每项写明结果和负责人，最后列出需要协助的问题。
```

两行 `---` 之间的头部信息遵循 Claude Code 技能格式：

| 字段 | 作用 |
|---|---|
| `name` | 命令名和文件夹名。请用小写字母、数字和 `-`：文件夹名里，字母、数字、`-` 和 `_` 以外的字符（例如空格）会变成 `_`。含非 ASCII 字符（例如中文）的名字会被转换成 ASCII 命令名（`周报` 变成 `zhou-bao`），原名保留为显示名称 |
| `description` | 什么时候使用这个技能。AI 只凭这段文字决定要不要载入它，所以要写清适用的场景和请求，而不只是主题 |
| `argument-hint` | 命令参数的提示，例如 `[issue-number]`。这是 Claude Code 的字段：Halo 3.0.4 的 **/** 菜单不显示它 |
| `user-invocable` | 设为 `false` 时不出现在 **/** 菜单里，AI 仍可以自行载入。没写这个字段时，Halo 会补上 `user-invocable: true` |
| `disable-model-invocation` | 设为 `true` 时 AI 不会自行载入，只有输入命令才会运行 |
| `allowed-tools` | 技能可以不经询问直接使用的工具，例如 `Read, Grep, Glob`；行内的 YAML 列表 `[A, B]` 会被转成这种写法。由机器人访客或同事发起的对话中，如果这个列表超出他们的权限，或者技能会运行他们无权使用的 hooks 或子代理，技能就不会载入 |
| `model` | 技能运行时使用的模型 |
| `context`、`agent` | `context: fork` 让技能在子代理中运行；`agent` 指定子代理的类型 |
| `hooks` | 引擎在技能生命周期的特定时刻运行的命令 |

这些字段由 Halo 运行的引擎读取。使用 Codex 和 DeepSeek 引擎时，不显示 **/** 菜单，见 [Agent 引擎](/features/agent-engines)。

### 写一段能让 AI 用起来的 description {#description}

- 先写什么时候用：「用户要……时使用」「处理……文件时使用」。
- 写出大家描述这类任务时真正会用的词，用他们会用的语言。
- 一个技能只做一类任务。步骤不同的两类任务，就写成两个技能。
- 规则和示例写在正文里，不要写在 description 里。

## 脚本 {#scripts}

技能可以带上让 AI 运行的脚本：

- **命令行脚本**（Node.js、Python、Shell）在运行 Halo 的电脑上执行，所以它需要的程序必须装在那台电脑上。在 `SKILL.md` 里写清要运行的确切命令，以及怎样处理输出。
- **浏览器脚本** 通过 `browser_run` 在网页里运行，格式、超时和调试见[浏览器脚本](/developers/digital-humans/production#browser-scripts)。`browser_run` 只运行工作区里（包括它的 `.claude/skills/`）、工作区上级文件夹的 `.claude/skills/`，或你个人主目录下 `.claude/skills/` 里的文件。使用 Halo 默认的配置文件夹时，全局技能不在这些位置，所以带浏览器脚本的技能请安装到使用它的工作区。

## Halo 在哪里找技能 {#discovery}

| 范围 | 文件夹 |
|---|---|
| 工作区 | 工作区文件夹里的 `.claude/skills/<name>/SKILL.md` |
| 全局 | Halo 的 Claude 配置文件夹里的 `skills/<name>/SKILL.md`：默认是 Halo 应用数据文件夹里的 `claude-config`；在 **设置 › 高级 › Claude CLI 集成** 里改用 Claude CLI 的文件夹时是 `~/.claude`，用 **自定义路径** 时是你设置的文件夹 |

- 没有 `SKILL.md` 的文件夹会被忽略。
- 工作区技能和全局技能的文件夹名相同时，那个工作区用工作区里的版本。
- 一个工作区里的会话和数字人，都能使用这个工作区的全部技能和全部全局技能。

各操作系统的具体路径见[配置路径](/advanced/config-paths)。

## 测试技能 {#test}

1. 把它安装到一个测试用的工作区：在 **能力库** 的 **技能** 下点 **手动添加技能**，导入这个文件夹。
2. 输入 `/` 加命令名运行它，检查结果。
3. 不提技能名，用自己的话说出这个任务，检查 description 能否让 AI 选中它。
4. 给数字人用的技能，检查数字人的 **能力与设置 › 工具与资源 › 可用技能** 里有没有它。

## 打包与分享 {#package}

- **导出**（仅桌面版）：技能导出为一个 `.zip`，包含它的全部文件，`SKILL.md` 在根目录。见[导出技能](/features/skills#export)。
- **导入** 接受单个 `.md` 文件、文件夹，或不超过 10 MB 的 `.zip`（文件在根目录或在唯一一个文件夹里）。
- **发布** 到商店：见[发布到商店](/developers/store-publishing)。
- **随数字人一起分发**：把它放在包内的 `skills/<id>/` 下，并在数字人的 `requires.skills` 里写上 `bundled: true` 和它的 `files`。文件夹名、`SKILL.md` 里的 `name` 和 `id` 请用同一个名字。见 [DHP 协议](/developers/dhp#package)。

写成 spec 时，技能是一个 `type: skill` 的条目。通过 API 安装，或在商店来源里提供技能时，用到这些字段：

<!-- generated:spec-fields skill only=type,name,description,version,author,skill_content,skill_files -->
_本表由 Halo 3.0.4 的 schema 生成。_

### 顶层字段 {#fields-top}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `name` | `string`（非空） | 是 | — | 大家看到的名字。对技能来说它也是文件夹名和斜杠命令，所以非 ASCII 的技能名会被转成 ASCII 命令名，原名保存在 `display_name`。 |
| `version` | `string`（版本号） | 是 | — | 这个包的版本，例如 `1.0.0`。发布到商店的新版本必须更高。 |
| `author` | `string` | 否 | — | 作者。技能可以不写。发布后它会成为商店地址的命名空间：`<author>/<name>`。 |
| `description` | `string`（非空） | 是 | — | 用一两句话说明它做什么，显示在列表和商店里。 |
| `type` | `literal` | 是 | `skill` | 包的类型：`automation`（数字人）、`mcp`、`skill`，或保留的 `extension`。 |
| `skill_content` | `string` | 否 | — | 单文件技能的完整 `SKILL.md` 内容。 |
| `skill_files` | `map<string, string>` | 否 | — | 技能的全部文件，按它在技能文件夹中的路径区分。其中的 `SKILL.md` 优先于 `skill_content`。 |
<!-- /generated:spec-fields -->

### 依赖 {#dependencies}

技能的依赖写在它的 spec 里，而不是 `SKILL.md` 里：和数字人的 spec 一样，用 `requires.mcps` 和 `requires.skills`。请在商店来源里技能的 `spec.yaml` 中，或在通过 API 安装的 spec 中设置。

- 单独安装一个技能时，不会安装它声明的其他技能；MCP 连接也从不会自动安装。
- 数字人的 **可用技能** 会把技能声明的 MCP 连接显示为「所需连接」。

## 相关页面 {#related}

- [技能](/features/skills)：安装、使用、范围和访客
- [生产级数字人](/developers/digital-humans/production)：带浏览器脚本的技能实践
- [MCP 配置参考](/developers/mcp)：AI 需要的是工具而不是指令时
