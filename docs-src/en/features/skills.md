---
title: "Skills: install and use reusable AI skills in Halo"
description: Halo skills are reusable instructions the AI follows. Install them from the Store or add your own, then let the AI pick them or call one with /name.
type: how-to
audience: [office]
related: [features/mcp, features/office-documents, digital-humans/store]
---

# Skills

::: say
> Install the code-commit skill from the store

Halo installs the skill with that name from the Store, into the current workspace by default. To make it available in every workspace, add "install it globally". Once installed, it shows up under **Digital Humans › Capability library › Skills**.

**Prerequisite**: the Store must have a skill with that name. If you are not sure of the name, search **Store › Skill** first.
:::

## What a skill is {#what-is-a-skill}

A Halo skill is a folder with a `SKILL.md` file in it. The file holds the steps, rules and examples the AI follows for one kind of task. Think of it as a work instruction for the AI: you write it once, and the AI does the task the same way every time.

You can use a skill in two ways:

- **The AI picks it**: the AI reads each skill's description and loads a skill by itself when the task calls for it. You don't have to name it.
- **You call it**: type `/command-name` in the composer, for example `/weekly-report`.

A minimal skill looks like this:

```
weekly-report/          ← the folder name is the command: /weekly-report
└── SKILL.md
```

```markdown
---
name: weekly-report
description: Use when the user asks for a weekly report or a summary of this week's work
---

1. Group items under "Done this week", "In progress" and "Next week"
2. Give each item its result and owner
3. List the issues that need someone's help at the end
```

Typical uses for skills:

| Skill | Purpose |
|---|---|
| `weekly-report` | Write the weekly report in a fixed format |
| `meeting-notes` | Turn meeting notes into minutes and action items |
| `write-prd` | Write a product requirements document from your team's template |
| `code-review` | Review code against your team's rules |

::: tip
The more specific `SKILL.md` is, the more accurately the AI works. Include examples, constraints and the output format. Every field, multi-file skills and packaging are covered in [Writing skills](/en/developers/skills).
:::

## Use a skill {#use}

- **Let the AI choose**: just describe the task, for example "Write this week's report". A skill whose description matches is loaded automatically.
- **Call it with `/`**: type `/` in the composer. The menu lists the available skills and the engine's own commands. Use <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to select and <kbd>Esc</kbd> to close.
- **Start from the skill card**: in the skill detail, click **Use**. The composer is filled with `/command-name `; add your request and send.

Whether the `/` menu appears, and what it lists, depends on the current [agent engine](/en/features/agent-engines). Under the Codex engine the menu is empty, but the AI may still pick skills by their description. In a brand-new conversation the menu fills in once the session is ready or the first reply arrives. The full command list is in [Commands and shortcuts](/en/features/commands).

## Where you manage skills {#manage}

Every installed skill is in **Digital Humans › Capability library › Skills**: a card wall covering global skills and every workspace.

| Control | What it does |
|---|---|
| **Search Skills** | Find skills by name and description |
| Scope filter | **All workspaces**, **Global**, or one workspace |
| Source filter | **All sources**, **Store**, **Custom**, **Built in** (includes the Office document skills) |
| Card badges | **Manual**, **Built-in**, **Bundled**, **Store**: where the skill came from |
| Card buttons | Power icon **Enable** / **Disable**; **Reinstall**; **Update to v…** when the Store has a newer version |
| **More** menu | **Open skill folder** (desktop only), **Move to workspace**, **Uninstall** |
| Top buttons | **Manual Add Skill**, **Install from Marketplace** |

Click a card to open the skill detail, which shows the **Skill Instructions** (the rendered `SKILL.md`). Click **Edit** to change them and save. **Save custom copy** saves a copy under a new **Command name**; the original stays unchanged, and the copy no longer receives Store updates. A command name may contain only lowercase letters, numbers and hyphens.

Skills are shared: editing, disabling or uninstalling one affects every conversation and Digital Human in its scope. In the skill detail, Halo asks you to confirm before it saves edits, enables or disables the skill, changes its scope or removes it (for example "Save shared resource changes?"). Uninstalling from the card's **More** menu also asks ("Uninstall this Skill?"). **The power icon on the card doesn't ask**: one click enables or disables the skill right away.

### Disabling or uninstalling deletes the folder {#disable-uninstall}

When you disable or uninstall a skill, Halo deletes its folder from disk, so the AI can no longer load it. Halo keeps its own copy of the skill's content: **Enable** it again, or **Reinstall** it from the **Uninstalled** group, and the folder is written back from that copy.

::: warning
Files you edited by hand inside a skill folder are deleted along with the folder when the skill is disabled or uninstalled. To change a skill that Halo manages, use **Edit** in the skill detail.
:::

### Unmanaged skills {#unmanaged}

Halo also finds and uses skills you put into a skills folder yourself. They appear in the **Unmanaged** group with a single action, **Open folder**. You can't enable, disable or uninstall them here; change the files in the folder instead.

## Install from the Store {#install-from-store}

The Store collects ready-made skills from several sources.

1. Click **Store** in the nav rail and open the **Skill** tab. Or click **Install from Marketplace** in **Digital Humans › Capability library › Skills**, which opens the Store's skill list directly.
2. Search or browse by category, and open a skill's detail. The detail shows the skill's documentation and its dependencies.
3. Click **Add**.
4. Under **Install to**, choose **Global (all workspaces)** or a workspace, then click **Install**. Skills with several files show download progress.
5. The card changes to **Added**, and the detail shows **Use**.

Installing and updating need a network connection; offline, the button reads **Offline**. Installing a skill on its own doesn't install the other skills it declares (see [Skill dependencies](#dependencies)). Browsing, updates and Store sources are covered in [Store](/en/digital-humans/store).

## Add your own skill {#add-skill}

In **Digital Humans › Capability library › Skills**, click **Manual Add Skill** to open the Add Skill dialog. It has three modes:

| Mode | Use it to | What to fill in |
|---|---|---|
| **Visual** | Write a simple skill from scratch | **Skill Name** (required), **Description** (when the AI should use it) and **Instructions**. The command name is derived from the name; click the pencil icon to change it. Allowed characters: `a-z`, `0-9` and `-` |
| **Markdown** | Write the complete `SKILL.md` | The `name` and `description` at the top of the file are required |
| **Import** | Bring in a skill you already have | Drop it in, or click **Browse skill folder...**; see the table below |

What **Import** accepts:

| You import | Requirement |
|---|---|
| **Single .md file** | Treated as a one-file skill and renamed `SKILL.md` |
| **Skill folder** | Must have `SKILL.md` at its root |
| **.zip archive** | Files at the root of the archive or inside one single folder; 10 MB at most |

Finally, under **Install to**, choose **Global (all spaces)**, the Halo Workspace or any workspace (the current workspace is the default), and save. To stop halfway, click **Close and keep draft**; your draft is still there next time.

The Add Skill dialog works in the desktop app and in the web client.

::: tip
You can also describe how you do a task and say "turn this into a skill and install it". Halo writes the `SKILL.md` and installs it.
:::

Coming from Claude Code with skills in `~/.claude/skills/`? Click **Migrate Skills from Claude CLI** under **Settings › Advanced › Claude CLI Integration** to import them in one go. See [Coming from Claude Code or Codex](/en/guide/from-claude-code).

## Global and workspace skills {#scope}

Every skill is either global or belongs to one [workspace](/en/features/spaces).

| | Global skill | Workspace skill |
|---|---|---|
| Who can use it | Conversations and Digital Humans in every workspace | Only conversations and Digital Humans in that workspace |
| The card says | "Available in every workspace" | "Available in this workspace only:" plus the workspace name |
| Where it lives | The `skills` folder in Halo's config directory | `.claude/skills/` in the workspace's working directory |

- **The workspace wins on a name clash**: when a workspace skill and a global skill have the same folder name (which is the command name), that workspace uses its own version. The command name counts, not the display name.
- **Change the scope later**: on the card, open **More › Move to workspace** and pick **Global (all workspaces)** or a workspace.
- The global skills folder follows **Settings › Advanced › Claude CLI Integration › Config Directory**, which defaults to **Halo Default**. Exact paths per operating system are in [Where Halo keeps your data](/en/advanced/config-paths).

## Export a skill {#export}

<Badge type="info" text="Desktop only" />

To send a skill to a colleague, export it as a `.zip`:

1. Open the skill detail and click **Share**.
2. Click **Export** ("Save a package file you can share by hand") and choose where to save it.
3. "Saved to" followed by the file path means the export is done. The archive holds the skill's whole folder, with `SKILL.md` at the root.

Your colleague installs it with **Import** in the [Add Skill dialog](#add-skill). Export is not available in the web client or the Android app. To publish to the Store instead, click **Share to Store** in the same dialog; see [Publishing to the Store](/en/developers/store-publishing).

## Copy an existing skill into a workspace {#copy}

If another workspace has a skill you want here, copy it into the current workspace:

1. Open a Digital Human in the current workspace and go to **Capabilities and settings › Tools & Resources › Available Skills**.
2. Click **Choose existing** to open "Choose an existing skill".
3. Find the skill and click **Copy to this workspace**. The original stays unchanged, and everyone in this workspace can use the copy.

Each row shows its state: **Already available** (this workspace can already use it), **Overridden in this workspace**, **Disabled in shared settings** or **Name already exists**.

## Built-in Office document skills {#office-skills}

Halo ships four global skills, `docx` (Word), `xlsx` (Excel), `pptx` (PowerPoint) and `pdf`, plus the diagnostic `office-runtime-check`. They run in a runtime that comes with Halo, so you don't install Office, Node.js or npm.

- Say "Make me a slide deck" and the AI picks `pptx` by itself. You can also call `/docx`, `/xlsx`, `/pptx` or `/pdf`.
- In the Capability library they carry the **Bundled** badge; set the source filter to **Built in** to see them.
- An uninstalled Office skill stays uninstalled after a restart. Reinstall it from the **Uninstalled** group when you need it.

What they can do and their limits are in [Office documents](/en/features/office-documents).

## How Digital Humans use skills {#digital-humans}

[Digital Humans](/en/digital-humans/overview) can use all skills installed in their workspace and globally. A skill is not private to one Digital Human: the Digital Humans and conversations in a workspace share one set of skills.

A Digital Human's **Capabilities and settings › Tools & Resources › Available Skills** lists the skills it can use. Each row is marked **Global** or **This workspace**, with a note when a workspace version overrides a global one. From here you can also **Choose existing**, add a **New skill**, **Import** one, or open the skill store.

::: warning
Changes made here affect the other Digital Humans and conversations in the same scope. The page says so too: "Skills are inherited from this workspace and global settings. Changes can affect other digital humans in the same scope."
:::

When you install a Digital Human from the Store, the skills it brings are installed first. When you uninstall that Digital Human, the skills it brought are removed with it. All its settings are described in [Capabilities and settings](/en/digital-humans/capabilities).

## Which skills guests can use {#guests}

When you talk to a Digital Human yourself, every available skill works. When someone else reaches it through a WeCom or Feishu bot (a guest), or a teammate on another computer borrows it, skills are allowed one at a time:

1. Open the bot's **Guest Permissions** and turn on **Guest Access**.
2. In the **Skills** group of **Guest Allowed Tools**, turn on only the skills guests should use. All are off by default.

Allowing a skill does not allow what it does. A skill may read its own folder; running commands, changing files or sending email still depend on the other switches on the same page. If a skill pre-approves more tools than those switches allow, it does not run. The Office document skills, for example, must run commands to create files, so guests can't use them by default.

Full guest permissions are in [Owner and guest permissions](/en/digital-humans/permissions); teammates' permissions are in [Teams across computers](/en/digital-humans/cross-computer-teams).

## See the skills a conversation can use {#workspace-resources}

In a conversation, click **Open workspace resources** in the header and switch to the **Skill** tab. It lists every skill this workspace can use: its workspace skills plus the global skills that are not overridden. The list is read-only:

- Each row is marked **Global** or **This workspace**.
- Click a row to open its `SKILL.md` in the canvas.
- Hover and click **Use** to put `/command-name ` in the composer, with the skill's description shown.

With no skills, the tab says "No skills available yet." The rail's other tabs are covered in [Files and the canvas](/en/features/files-and-canvas).

## Skill dependencies {#dependencies}

A skill can declare the [MCP connections](/en/features/mcp) and other skills it needs:

- When you install a Digital Human from the Store, the skills it declares are installed with it; if one of them fails, the whole install is rolled back. Installing a skill on its own doesn't install the other skills it declares; add them yourself. Dependencies of dependencies are not followed.
- MCP connections are not installed for you. In a Digital Human's **Available Skills**, a skill that declares MCP connections shows "Required connections:" with their names; add missing ones in the Capability library.
- When you publish to the Store, Halo checks that the dependencies can be found.

How to declare dependencies is in [Writing skills](/en/developers/skills#dependencies).

## Troubleshooting {#troubleshooting}

### My skill is not in the / menu

- Check that the skill is enabled and that its scope includes this workspace: look for it under **Open workspace resources › Skill**.
- In a new conversation the menu is complete only after the first reply. Click **Use** in the skill detail to put the command straight into the composer.
- Under the Codex engine the `/` menu is always empty. Describe the task instead, or say "use the weekly-report skill".

### "A skill with this name already exists in this scope. Choose another command name, or edit the existing skill from the library."

That scope already has a skill with this command name. Click the pencil icon to pick another command name, or edit the existing skill in the Capability library.

### "Unsupported file type. Drop a .md file, a .zip archive, or a skill folder."

Import accepts only a `.md` file, a `.zip` archive or a folder with `SKILL.md`. An archive can be 10 MB at most.

### I can't find Export or open the skill folder in the web client

Exporting a `.zip` and **Open skill folder** work only in the desktop app. The web client says "Open in the desktop client to reveal a skill folder."

### Halo says the skill was not found in the store

Halo looks the skill up in the Store by name, so the name has to match. Search **Store › Skill** to make sure the skill exists; when you find it, clicking **Add** in its detail is the most direct way to install it.

### A skill is in the Unmanaged group and can't be disabled

You placed that skill in a skills folder by hand, so Halo has no install record for it. Click **Open folder** and delete or change it there.

## Next steps {#next-steps}

- [MCP servers](/en/features/mcp): a skill tells the AI how to work, an MCP server gives it external tools. They are often used together.
- [Office documents](/en/features/office-documents): use the built-in document skills for Word, Excel, PowerPoint and PDF.
- [Store](/en/digital-humans/store): find more ready-made skills and Digital Humans.
