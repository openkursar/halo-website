---
title: "Writing skills for Halo: SKILL.md reference"
description: "Write skills for Halo: the SKILL.md format and its fields, companion files and scripts, where Halo finds skills and how it names them, testing, and packaging."
type: reference
audience: [developer]
---

# Writing skills

A skill is a folder whose `SKILL.md` tells the AI how to do one kind of task: the steps, the rules, the output format. This page is for writing them: the file format, companion files and scripts, how Halo finds and names skills, testing, and packaging. To install and use skills, see [Skills](/en/features/skills).

## The folder {#folder}

```text
weekly-report/
├── SKILL.md            required: frontmatter and instructions
├── template.md         optional: files SKILL.md refers to
└── scripts/
    └── collect.js
```

- The skill's `name` is its command, and Halo names the folder after it: this skill runs as `/weekly-report`.
- Halo stores every file of a skill as UTF-8 text. Images and other binary files don't survive installing, exporting or publishing, so keep them out of the folder.
- The AI reads `SKILL.md` when it uses the skill, and usually opens the other files only when `SKILL.md` sends it there. Refer to them by their path inside the folder, and say when to read or run each one.

## SKILL.md {#skill-md}

```markdown
---
name: weekly-report
description: Use when the user asks for a weekly report or a summary of this week's work. Writes it in the team's format from the week's notes.
---

# Weekly report

1. Read this week's notes in `notes/` of the workspace.
2. Group the items under "Done", "In progress" and "Next week", using `template.md`.
3. Give each item its result and owner. List blockers last.
```

The frontmatter between the `---` lines follows the Claude Code skill format:

| Field | What it does |
|---|---|
| `name` | The command and folder name. Use lower-case letters, digits and `-`: in the folder name, characters other than letters, digits, `-` and `_`, such as spaces, become `_`. A name with non-ASCII characters, such as Chinese, is turned into an ASCII command name (`周报` becomes `zhou-bao`), and the original is kept as the display name |
| `description` | When to use the skill. The AI decides from this text alone whether to load it, so name the situations and requests it covers, not just the topic |
| `argument-hint` | Hint for the command's argument, such as `[issue-number]`. A Claude Code field: Halo 3.0.4's **/** menu doesn't show it |
| `user-invocable` | `false` keeps it out of the **/** menu; the AI can still load it. Halo adds `user-invocable: true` when the field is missing |
| `disable-model-invocation` | `true` stops the AI from loading it by itself: only typing the command runs it |
| `allowed-tools` | Tools the skill may use without asking, such as `Read, Grep, Glob`; an inline YAML list `[A, B]` is turned into that form. When a bot guest or a teammate drives the turn, a skill doesn't load if this list goes beyond what they are allowed, or if it runs hooks or a sub-agent they aren't allowed |
| `model` | Model to use while the skill runs |
| `context`, `agent` | `context: fork` runs the skill in a sub-agent; `agent` names the sub-agent type |
| `hooks` | Commands the engine runs at points of the skill's lifecycle |

The engine Halo runs reads these fields. With the Codex and DeepSeek engines, the **/** menu is not shown; see [Agent engines](/en/features/agent-engines).

### Write a description the AI acts on {#description}

- Start with when to use it: "Use when the user asks for…", "Use for files that…".
- Name the words people actually use for the task, in the languages they use.
- Keep one skill to one kind of task. Two tasks that need different steps make two skills.
- Put rules and examples in the body, not in the description.

## Scripts {#scripts}

A skill can carry scripts for the AI to run:

- **Command-line scripts** (Node.js, Python, shell) run on the computer running Halo, so the program they need must be installed there. Say in `SKILL.md` exactly which command to run and what to do with its output.
- **Browser scripts** run inside a web page through `browser_run`. Their format, timeouts and debugging are in [Browser scripts](/en/developers/digital-humans/production#browser-scripts). `browser_run` only runs files inside the workspace (its `.claude/skills/` included), or in a `.claude/skills/` folder above the workspace or in your home folder. With Halo's default configuration folder, a global skill is in none of these, so install a skill with browser scripts into the workspace that uses it.

## Where Halo finds skills {#discovery}

| Scope | Folder |
|---|---|
| Workspace | `.claude/skills/<name>/SKILL.md` in the workspace folder |
| Global | `skills/<name>/SKILL.md` in Halo's Claude configuration folder: by default `claude-config` in Halo's app data folder, `~/.claude` when **Settings › Advanced › Claude CLI Integration** points at Claude CLI's folder, or the folder you set with **Custom Path** there |

- A folder without `SKILL.md` is ignored.
- When a workspace skill and a global skill have the same folder name, the workspace one is used there.
- Every conversation and Digital Human in a workspace can use all of that workspace's skills and all global ones.

Exact paths per operating system are in [Where Halo keeps your data](/en/advanced/config-paths).

## Test a skill {#test}

1. Install it in a test workspace: in the **Capability library** under **Skills**, click **Manual Add Skill** and import the folder.
2. Type `/` and the command to run it, and check the result.
3. Ask for the task in your own words, without naming the skill, to check that the description makes the AI pick it.
4. For a Digital Human, check that its **Capabilities and settings › Tools & Resources › Available Skills** lists the skill.

## Package and share {#package}

- **Export** (desktop app): a skill exports as a `.zip` of its files with `SKILL.md` at the root. See [Export a skill](/en/features/skills#export).
- **Import** accepts a single `.md` file, a folder, or a `.zip` of up to 10 MB with the files at its root or inside one folder.
- **Publish** it to a Store: see [Publish to the Store](/en/developers/store-publishing).
- **Ship it with a Digital Human**: put it under `skills/<id>/` in the package and list it in the Digital Human's `requires.skills` with `bundled: true` and its `files`. Use the same name for the folder, the `name` in `SKILL.md` and the `id`. See [DHP protocol](/en/developers/dhp#package).

As a spec, a skill is an item of `type: skill`. These fields matter when you install one through the API or serve one from a Store source:

<!-- generated:spec-fields skill only=type,name,description,version,author,skill_content,skill_files -->
_Generated from the schema of Halo 3.0.4._

### Top-level fields {#fields-top}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `name` | `string` (non-empty) | Yes | — | The name people see. For a skill it is also the folder name and the slash command, so a non-ASCII skill name is turned into an ASCII command name and the original is kept in `display_name`. |
| `version` | `string` (version) | Yes | — | Your version of the package, such as `1.0.0`. A Store update must carry a higher version. |
| `author` | `string` | No | — | Who made it. Optional for a skill. When published, it becomes the namespace of the Store address, `<author>/<name>`. |
| `description` | `string` (non-empty) | Yes | — | One or two sentences on what it does, shown in lists and the Store. |
| `type` | `literal` | Yes | `skill` | Kind of package: `automation` (a Digital Human), `mcp`, `skill`, or `extension` (reserved). |
| `skill_content` | `string` | No | — | The whole `SKILL.md` of a one-file skill. |
| `skill_files` | `map<string, string>` | No | — | Every file of the skill, keyed by its path in the skill folder. Its `SKILL.md` wins over `skill_content`. |
<!-- /generated:spec-fields -->

### Dependencies {#dependencies}

A skill's dependencies are part of its spec, not of `SKILL.md`: `requires.mcps` and `requires.skills`, as in a Digital Human's spec. Set them in the skill's `spec.yaml` in a Store source, or in the spec you install through the API.

- Installing a skill on its own doesn't install the skills it declares, and MCP connections are never installed for you.
- A Digital Human's **Available Skills** shows the MCP connections a skill declares as "Required connections".

## Related {#related}

- [Skills](/en/features/skills): install, use, scope and guests
- [Production-grade Digital Humans](/en/developers/digital-humans/production): skills with browser scripts in practice
- [MCP configuration reference](/en/developers/mcp): when the AI needs a tool rather than instructions
