# Skills 技能

Skills 是可复用的指令模板。定义一次，之后在任何对话中用 `/技能名` 快速调用，AI 会自动加载该技能并执行。

## Skills 存放位置

| 位置 | 说明 |
|------|------|
| `<项目目录>/.claude/skills/` | 项目级技能，仅该空间可用 |
| `~/Library/Application Support/halo/claude-config/skills/` | 全局技能（macOS） |
| `C:\Users\<用户名>\AppData\Roaming\Halo\claude-config\skills\` | 全局技能（Windows） |

---

## 文件结构

在 `skills` 目录下创建一个以技能名命名的文件夹，文件夹内放 `SKILL.md`：

```
.claude/
└── skills/
    └── code-commit/        ← 技能名（调用时用 /code-commit）
        └── SKILL.md        ← 技能定义文件
```

---

## SKILL.md 格式

```markdown
---
name: code-commit
description: 当用户要求提交代码、commit、推送代码时，自动调用该技能
---

## 要求

1. 在仓库内执行 `git status` 查看变更
2. 根据变更内容生成合理的 commit 描述
3. 格式：`feat/fix/docs: #AI commit# <描述>. collaboration and commit by halo`

示例：
git commit -m "feat: #AI commit# 接入用户登录模块. collaboration and commit by halo"
```

---

## 使用方式

在对话输入框中使用斜杠命令：

```
/code-commit
```

或者用自然语言触发（AI 会根据 `description` 字段自动匹配）：

```
帮我提交代码
```

---

## 典型 Skills 场景

| 技能名 | 用途 |
|--------|------|
| `code-commit` | 规范化的 Git 提交 |
| `write-prd` | 生成产品需求文档 |
| `code-review` | 代码审查与建议 |
| `daily-report` | 自动汇总日报 |
| `deploy` | 部署流程封装 |

---

::: tip
Skills 的本质是「给 AI 的工作说明书」。写得越详细，AI 执行得越准确。可以在 SKILL.md 中包含示例、约束条件、输出格式等。
:::
