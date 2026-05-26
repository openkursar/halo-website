---
title: "Config Paths"
description: "Location of Halo configuration files on different operating systems."
---
# Config Paths

Halo has two independent sets of configuration paths: **Claude Code configuration** and **Halo's own configuration**. They are stored separately and do not interfere with each other.

## Claude Code Configuration

The Claude Code bundled inside Halo uses an isolated configuration directory, separate from the system-level `~/.claude/`:

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/halo/claude-config/` |
| Windows | `C:\Users\<username>\AppData\Roaming\Halo\claude-config\` |

This path is equivalent to the global `~/.claude/` directory used by the Claude Code CLI. You can place your global `CLAUDE.md`, global Skills, MCP configuration, and more here.

::: warning settings.json priority
If `url` and `key` fields are configured in this directory's `settings.json`, they **will override the API configuration set in Halo's visual interface** and take the highest priority.

Advanced users should be aware of this when making changes, to avoid configuration conflicts.
:::

---

## Halo's Own Configuration

Halo's space data, interface settings, Digital Humans, and other data are stored in:

| Platform | Path |
|----------|------|
| macOS / Linux | `~/.halo/` |
| Windows | `C:\Users\<username>\.halo\` |

Example directory structure:

```
~/.halo/
├── spaces/          # Data for all spaces
├── settings.json    # Interface preferences
└── apps/            # Installed Digital Humans
```

---

## Skills Paths

| Scope | Path |
|-------|------|
| Global Skills (available in all spaces) | `~/Library/Application Support/halo/claude-config/skills/` |
| Project-level Skills (available in that space only) | `<project-directory>/.claude/skills/` |

Each Skill is a folder containing a `SKILL.md` file. See → [Skills](/en/features/skills)

---

## Log Files

When you encounter a crash or unexpected behavior, go to **Settings → System → Open Log Folder** to retrieve log files for troubleshooting or to include in a bug report.
