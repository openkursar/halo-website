---
title: "Changes view: diffs, AI code review and Git"
description: Use Halo's Changes view to read the Git diffs in your workspace, run a quick or team AI code review, then stage, commit and push.
type: how-to
audience: [developer]
since: "3.0"
related: [features/spaces, features/agent-engines, guide/from-claude-code]
---

# Changes, code review and Git

::: say
> Commit the changes you just made and push them

Halo runs git with its own shell in the workspace: it checks what changed, writes a commit message, commits, pushes to the remote and tells you the commit id.

**Prerequisite**: the workspace folder is a Git repository, and Git on this computer can already push to that remote (for example, you have pushed once from a terminal).
:::

An AI review is started with a button in **Changes**. Halo can't start a review for you from a conversation.

## Before you start {#before-you-start}

- A [workspace](/en/features/spaces) linked to a project folder, where the folder itself or a folder directly inside it is a Git repository.
- Git 2.23 or newer. See [Install Git](#git).
- For AI review, a working AI model. See [Models and accounts](/en/features/models).

## Open Changes {#open-changes}

1. In the conversation view, click **⋯ More › Changes** in the header ("Review, stage and commit Git changes"). Or press <Shortcut mac="⌃ ⇧ G" other="Ctrl Shift G" />. On macOS this is the Control key, not Command.
2. In a narrow window or the Android app, tap **More** in the header, then **Changes**.
3. A Changes tab opens in the canvas. Its top bar shows the repository name and the current branch.

Changes has three pages, switched at the top of the tab:

| Page | What it is for |
|---|---|
| **Changes** | File list, diffs, staging and committing |
| **Overview & review** (with an "AI" badge) | Change statistics, changes by folder, and [AI review](#ai-review) |
| **Graph** | A read-only commit history. See [Graph](#graph) |

Each workspace has one Changes tab. It reloads when you open or revisit the tab, when the Halo window comes back to the front, and when you click **Refresh**. If files change while you look at it, a bar says "New changes in N files". Click **Refresh** to update or **Dismiss** to ignore it. Halo doesn't poll in the background and doesn't run Git at startup.

Clicking a review task card in a conversation also opens Changes. Changes works in a browser opened through [Remote Access](/en/features/remote-access) and in the Android app too. Git runs on the computer that runs Halo.

![The Changes view: a side-by-side diff in the middle; on the right, the grouped file list (staged changes and changes) and the commit box with its commit button](/images/features/code-review/changes-view.en.webp)

Without a workspace, **Changes** is not in the menu. To see only the files the AI edited in one reply, use [View changes](#reply-changes) under that reply. It needs no Git.

## Which repositories it finds {#repositories}

Halo looks for Git repositories in two places: the workspace folder itself, and the folders directly inside it.

- A folder with a `.git` counts as a repository. A `.git` file (worktrees, submodules) counts too.
- Folders starting with `.` and symlinked folders are skipped. At most 1,000 subfolders are checked.
- Deeper repositories are not found. To see one, point the workspace at that folder.

With more than one repository, the repository name in the top bar becomes a picker titled "Repositories in this space". Each entry shows its branch and relative path. The workspace folder comes first, the rest by name.

The current branch shows next to the repository name. With a detached HEAD it shows "Detached at `<commit>`"; in a repository with no commits, "No commits yet". You can't switch branches in Changes.

## Choose what to compare {#compare}

Click the compare scope in the top bar ("Compare: …") to choose which changes you see:

| Option | Compares | Notes |
|---|---|---|
| **Uncommitted changes** | HEAD with the working tree, untracked files included | The default |
| **Staged changes** | HEAD with the staging area | — |
| **Since last review** | The files when the last AI review started with now | Disabled until a review exists, with the hint "Run a review first" |
| **Compare with branch…** | From where the current branch forked from the chosen one, up to now | Pick from **Branches** or **Remote branches**. The picker notes "Compared from where it forked" |
| **Compare with commit…** | The chosen commit with the working tree | Pick from **Tags** or **Recent commits** |

- **Compare with branch…** and **Compare with commit…** are disabled before the first commit.
- The picker has search, lists up to 60 choices and shortens commit ids to 7 characters.
- After you pick a branch or commit, the scope reads "Compared with `<branch or commit>`".
- Clicking a commit in the [Graph](#graph) adds a scope, "Commit `<sha>`": that commit against its first parent.

With nothing to show, Changes says "No changes", "Nothing staged", "No changes since the last review", "No differences from `<branch or commit>`" or "Empty commit".

## File list {#file-list}

In the **Uncommitted changes** scope, files are grouped as **Conflicts**, **Staged changes** and **Changes**. Other scopes have a single **Changes** group.

- The **Conflicts** group notes "Resolve these in a terminal, or ask the AI to." You can't edit conflicts in Changes.
- Switch between **Tree** and **List**. Tree is the default.
- Type a path in "Filter files (e.g. src/**)". Click **Clear filter** to reset.
- **Hide generated** is on by default. It hides lockfiles, minified files, snapshots and files marked `linguist-generated` in `.gitattributes`. The list shows "N generated files hidden"; click **Show** to see them.
- The list shows at most 5,000 files. Beyond that it says "Showing the first N files".
- Drag the file list edge to resize it; double-click to reset. On a narrow canvas the list moves into a **File list** drawer.

Your choices for side by side, collapsing, list width, tree view and hiding generated files are saved on this device.

## Read diffs {#diffs}

Diffs show as a scrolling stack of file cards. The toolbar has:

| Control | What it does |
|---|---|
| **Previous change** / **Next change** | Jump between changes. Keys: <kbd>Shift</kbd> <kbd>F7</kbd> / <kbd>F7</kbd> |
| **Side by side** | On by default. Below 640 px of canvas width it switches to inline, with the tip "Side by side needs a wider canvas" |
| **Collapse unchanged regions** | On by default |
| **Collapse all files** / **Expand all files** | Fold or unfold every card at once |

Diffs are read-only. To edit a file, click **Open in editor**. The file opens in an editor tab in the canvas.

Select text in a diff to **Add to chat**. The reference carries the file, the side and the compare scope. See [references in conversations](/en/features/conversations#references).

Limits for large files:

| Case | What you see |
|---|---|
| One side larger than 2 MiB | "Too large to show (size)" |
| Binary file | "Binary file" and its size |
| 1,500 or more changed lines, or a generated file | "Large diff · N lines". Click **Load diff** to show it |
| A very large diff overall | "Large diff · Showing one file at a time" |

## Stage, unstage and discard {#stage-and-discard}

1. Hover a file row. Unstaged files have **Stage** and **Discard**; staged files have **Unstage**.
2. For a whole group, click **Stage all** or **Unstage all** on the group header. Diff cards also have **Stage file** / **Unstage file**.
3. Staging and unstaging apply at once, without confirmation.

Conflicted files can't be staged, unstaged or discarded. Changes stages whole files only: there is no hunk or line staging.

**Discard** always asks first:

- A tracked file: "Discard changes to `<name>`?" with "This can't be undone in Halo." Only working-tree changes are discarded; the staged part is kept.
- An untracked new file: "Move `<name>` to the Trash?" (Windows: "…to the Recycle Bin?") with "Git has no copy of this new file. You can restore it from the Trash." The file goes to the system trash. It is never deleted outright.

::: warning Caution
Discarding changes to a tracked file can't be undone in Halo. If you're unsure, commit first or make a copy.
:::

## Commit and push {#commit-and-push}

The commit box sits under the file list. It shows the current branch name, but you can't switch branches here.

1. Stage the files to commit.
2. Write a message in "Commit message (<Shortcut mac="⌘ ↵" other="Ctrl Enter" /> to commit)". Changes doesn't generate commit messages for you.
3. Click **Commit N staged files**, or press <Shortcut mac="⌘ ↵" other="Ctrl Enter" />. With nothing staged the button hints "Stage files to commit"; with no message, "Enter a commit message".
4. To push right after committing, click the ▾ (**More commit options**) next to the main button and choose **Commit and push**.
5. To change the last commit, choose **Amend last commit** in the same menu. It keeps the old message if the box is empty. It is disabled before the first commit.

Commits run the repository's commit hooks. If a hook rejects the commit, you see "A commit hook rejected the commit." Click **Show output** to see why.

When the branch has an upstream, push runs `git push`. Without one, it pushes to `origin` (or the only remote) and sets the upstream. If the commit succeeds but the push fails, you see "Committed `<commit>`, but the push failed". The commit is kept.

A commit may take up to 5 minutes; a push or pull up to 3 minutes.

## Sync and publish a branch {#sync}

The button next to the branch name shows ↑ahead ↓behind commit counts. The counts come from the last fetch; hovering shows "Counts are from the last fetch. Click to pull and push."

When you click it, Halo:

1. Runs `git pull --ff-only`. It only fast-forwards; it never merges or rebases.
2. Pushes, if you have local commits to push.

It runs as soon as you click, without confirmation. When done you see "Synced with `<upstream>`".

When the branch has no upstream yet, the button reads **Publish branch**. Clicking it pushes the branch to the remote and sets the upstream. When done you see "Published `<branch>`".

If it can't fast-forward (both sides have new commits), sync stops. Merge in a terminal, or ask the AI in a conversation to do it.

## Graph {#graph}

Since 3.0.4, Changes has a third page, **Graph**: a read-only commit history with one lane per branch line. It loads 300 commits at a time and more as you scroll.

- Use **All branches** to choose which branches to show.
- Type in "Filter by author (Enter)" or "Search commit messages (Enter)" and press <kbd>Enter</kbd>.
- Click a commit. The **Changes** page shows that commit against its first parent, the scope becomes "Commit `<sha>`", and the commit box shows the commit's subject.

There is no checkout or reset in the Graph.

## AI review {#ai-review}

An AI review reads the changes in the current compare scope and the code around them, then writes a report. It starts a new review conversation in this workspace and runs in the background: your current conversation is untouched, and the new one is not selected.

1. In Changes, choose a [compare scope](#compare), such as **Uncommitted changes**.
2. Switch to **Overview & review** and find the **AI review** card ("Starts a new review conversation in this space").
3. Click **Quick review** or **Team review**. The review starts at once, with no further confirmation.
4. The card shows progress and notes "You can leave this page". To cancel, click **Stop**.
5. When the review finishes, the report shows in the card.

| | Quick review | Team review |
|---|---|---|
| Who reviews | One agent reads the changes and the code around them, then writes a report | Three agents review architecture, regressions, and performance & prompts separately, then challenge each other's findings |
| Usual time | 1–3 min | 5–15 min |
| Token use | — | About 4–6× a quick review |
| Project rules | Reads rule files such as `AGENTS.md` and `CLAUDE.md` first | Same |

::: warning Caution
A team review starts 3 sub-agents and uses about 4–6× the tokens. Reviews use the workspace's usual model and account, billed by your account or API provider.
:::

During a review the AI stays read-only: no edits, no builds, no Git writes. Repository content is treated as material, never as instructions to the AI. You can't review an empty scope ("No changes to review"). Beyond 400 changed files, the rest is summarized by folder. When team review can't run, the card says "Team review isn't available right now". If the team tools fail mid-review, it falls back to a single reviewer and the report says so.

### Read the review report {#review-report}

The report is written in the UI language, in five fixed sections: **Conclusion**, **Must fix**, **Needs your decision**, **Suggestions** and **Structure summary**. Each finding cites `path:line`; the link opens that file's diff page.

Card actions:

| Action | What it does |
|---|---|
| **Open conversation** | Opens the review conversation. You can keep going, for example "Fix the must-fix items" |
| **Add full report to chat** | Adds the whole report to the composer as a reference |
| **Review again** ▾ | Runs another review: "Quick review · one agent" or "Team review · 3 sub-agents, more tokens" |

The card also shows the time, duration and token count. If files change after the review, the card says "Based on the changes at `<time>`. N files have changed since."

- Each review takes a snapshot of the files when it starts, and **Since last review** compares with it. Snapshots are unreferenced Git objects, so `git gc` can prune them (after about two weeks by default). The scope then says "The last review's snapshot is no longer available".
- Halo keeps only the latest review per repository. If you delete the review conversation, the card says "The review conversation was deleted".
- The review conversation is an ordinary conversation titled "Review · `<scope>` · N files". It shows in the conversation list and the [Tasks panel](/en/features/tasks). Its first message is a review task card; click it to return to the Changes overview.
- The report is not posted as inline comments on the diff.

## View changes under a reply {#reply-changes}

When the AI edits files with its file tools in a reply, the reply shows "Changed N files · +added −deleted · View changes" underneath.

1. Click **View changes**. A read-only tab opens in the canvas, titled "Reply `<time>`", with the header "N files edited in this reply · Read-only".
2. Each edit shows as a diff fragment; a whole-file write shows the full text written.
3. Click **Go to reply** to return to the reply, or **Open file** / **Open in editor** to view the file.

This view needs no Git and has no repository, compare scope, staging or commit. It notes "Only edits made with file tools are shown. Changes made by commands aren't included." To see files the AI changed with shell commands, use [Changes](#open-changes).

## Install Git {#git}

Changes needs Git 2.23 or newer. Halo looks for Git the first time it needs it, not at startup. If it isn't found, Halo looks again at most every 60 seconds.

<PlatformTabs>
<template #macos>

Halo looks for `git` on PATH, then in `/opt/homebrew/bin`, `/usr/local/bin` and `/usr/bin`.

On a Mac without the Xcode Command Line Tools, `/usr/bin/git` can't run, and Changes shows "Git can't run on this computer". Run this in Terminal, then click **Try again**:

```bash
xcode-select --install
```

</template>
<template #windows>

Halo looks for `git.exe` on PATH, then the portable Git that Halo installs, then next to a Git Bash you pointed Halo at, then the standard Program Files and LocalAppData installs.

With no Git found, Changes shows "Git isn't installed". In the desktop app, click **Install Git**: Halo downloads its portable Git, shows progress and retries when done. The button is not offered through Remote Access; install Git on the computer that runs Halo. For Git Bash setup, see [Install Halo](/en/getting-started/install#git-bash).

</template>
<template #linux>

Halo looks for `git` on PATH, then in common locations such as `/usr/local/bin` and `/usr/bin`. With no Git found, Changes shows "Git isn't installed". Install Git with your package manager, then click **Try again**.

</template>
</PlatformTabs>

Halo never opens a password, SSH or GPG prompt. Network Git operations run in the background and never wait for input. Before pushing, push once from a terminal for this repository so Git stores your credentials.

When Halo reads a repository on its own, it never runs programs named by the repository's config (filters, fsmonitor, external diff, textconv). Writes you click run the way Git normally does, including hooks, LFS and credential helpers.

::: done
Changes lists your changed files, and committed files leave "Uncommitted changes"; the AI review card shows a report with "Conclusion" and "Must fix". When you see this, Changes and AI review are working.
:::

## Troubleshooting {#troubleshooting}

### This space isn't a Git repository

Halo looks only in the workspace folder and the folders directly inside it. Make sure the repository is in one of those, not deeper, and not in a folder starting with `.` or a symlink. If needed, point the [workspace](/en/features/spaces) at the repository folder.

### Git isn't installed

Follow [Install Git](#git) for your system. On the Windows desktop app, click **Install Git**.

### Git can't run on this computer

The Mac is missing the Xcode Command Line Tools. Run `xcode-select --install` in Terminal, then click **Try again**.

### Git needs you to sign in. Push once from a terminal, then try again.

Halo never enters Git credentials for you. Run `git push` once for this repository in a terminal, sign in when asked, then try again in Changes.

### Git doesn't know who you are yet

Set your committer details in a terminal, then commit:

```bash
git config --global user.name "zhangsan"
git config --global user.email "zhangsan@example.com"
```

### Can't fast-forward. Merge in a terminal, or ask the AI to.

Both your branch and the remote have new commits, and sync only fast-forwards. Merge or rebase in a terminal, or ask the AI in a conversation, then sync again.

### The remote has commits you don't have yet. Sync first, then push.

Click the sync button next to the branch to pull first, then commit and push.

### Pulling would overwrite your uncommitted changes

Commit or discard those changes first, then sync, or handle it in a terminal.

### You're not on a branch, so there's nothing to push

HEAD is detached. Switch to a branch in a terminal, or ask the AI to. Changes can't switch branches.

### Another Git process is using this repository

A terminal or another tool is working on the repository. Wait for it to finish, then try again.

### Git took too long to respond. Try again.

A commit took over 5 minutes, or a push or pull over 3 minutes. Check your network and commit hooks, then try again.

### "Since last review" is disabled

No AI review has run yet, or `git gc` pruned the last review's snapshot. Run a review again.

### The AI changed files, but View changes under the reply doesn't show them

The reply view shows only edits made with file tools, not changes made by commands. Open **⋯ More › Changes** to see every change in the repository.

## Next steps {#next-steps}

- [Coming from Claude Code or Codex](/en/guide/from-claude-code): use your existing subscription, `CLAUDE.md` and skills to code in Halo
- [Agent engines](/en/features/agent-engines): choose Claude Code, Codex or another engine for coding work
- [Workspaces](/en/features/spaces): point a workspace at your project folder
