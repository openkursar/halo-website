---
title: "Skills - Reusable AI Templates"
description: "Create reusable instruction templates for Halo AI, invoke with /skill-name in any conversation."
---
# Skills

Skills are reusable instruction templates. Define one once, then invoke it in any conversation with `/skill-name`. The AI will automatically load that skill and execute it.

## Where Skills Are Stored

| Location | Description |
|----------|-------------|
| `<project-directory>/.claude/skills/` | Project-level skills — available in that space only |
| `~/Library/Application Support/halo/claude-config/skills/` | Global skills (macOS) |
| `C:\Users\<username>\AppData\Roaming\Halo\claude-config\skills\` | Global skills (Windows) |

---

## File Structure

Create a folder named after the skill inside the `skills` directory, and place a `SKILL.md` file inside it:

```
.claude/
└── skills/
    └── code-commit/        ← Skill name (invoked with /code-commit)
        └── SKILL.md        ← Skill definition file
```

---

## SKILL.md Format

```markdown
---
name: code-commit
description: Automatically invoked when the user asks to commit code, submit code, or push code
---

## Requirements

1. Run `git status` inside the repository to check for changes
2. Generate a meaningful commit message based on the changes
3. Format: `feat/fix/docs: #AI commit# <description>. collaboration and commit by halo`

Example:
git commit -m "feat: #AI commit# integrate user login module. collaboration and commit by halo"
```

---

## How to Use

Use a slash command in the conversation input box:

```
/code-commit
```

Or trigger it with natural language (the AI will automatically match based on the `description` field):

```
Please commit the code
```

---

## Typical Skill Scenarios

| Skill Name | Purpose |
|------------|---------|
| `code-commit` | Standardized Git commits |
| `write-prd` | Generate product requirement documents |
| `code-review` | Code review and suggestions |
| `daily-report` | Automatically summarize daily reports |
| `deploy` | Encapsulate deployment workflows |

---

::: tip
The essence of a Skill is "a work instruction for the AI." The more detailed it is, the more accurately the AI executes it. You can include examples, constraints, and output formats in `SKILL.md`.
:::
