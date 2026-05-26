---
title: "配置路径"
description: "Halo 各类配置文件的存放位置说明。"
---
# 配置路径

Halo 有两套独立的配置路径：**Claude Code 配置**和 **Halo 自身配置**，分开存放，互不干扰。

## Claude Code 配置

Halo 内置的 Claude Code 使用隔离的配置目录，不与系统级的 `~/.claude/` 共享：

| 平台 | 路径 |
|------|------|
| macOS | `~/Library/Application Support/halo/claude-config/` |
| Windows | `C:\Users\<用户名>\AppData\Roaming\Halo\claude-config\` |

此路径等价于 Claude Code CLI 全局的 `~/.claude/`。你可以在这里放置全局的 `CLAUDE.md`、全局 Skills、MCP 配置等。

::: warning settings.json 优先级
如果在此目录的 `settings.json` 中配置了 `url` 和 `key` 字段，**将覆盖 Halo 可视化界面中的 API 配置**，且优先级最高。

高级用户修改时请注意这一点，避免产生配置冲突。
:::

---

## Halo 自身配置

Halo 的空间数据、界面设置、数字人等数据存放在：

| 平台 | 路径 |
|------|------|
| macOS / Linux | `~/.halo/` |
| Windows | `C:\Users\<用户名>\.halo\` |

目录结构示例：

```
~/.halo/
├── spaces/          # 所有空间的数据
├── settings.json    # 界面偏好设置
└── apps/            # 已安装的数字人
```

---

## Skills 路径

| 作用域 | 路径 |
|--------|------|
| 全局 Skills（所有空间可用） | `~/Library/Application Support/halo/claude-config/skills/` |
| 项目级 Skills（仅该空间可用） | `<项目目录>/.claude/skills/` |

每个 Skill 是一个文件夹，内含 `SKILL.md`。详见 → [Skills 技能](/features/skills)

---

## 日志文件

遇到崩溃或异常时，可前往 **设置 → 系统 → 打开日志文件夹** 获取日志文件，用于排查问题或提交 Bug 报告。
