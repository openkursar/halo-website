---
title: "Files and the canvas: preview and edit your files"
description: Manage workspace files in Halo's resources rail, preview and edit code, Markdown, tables, images and PDFs in the canvas, and read the NEW/MOD badges.
type: how-to
audience: [office]
related: [features/spaces, features/office-documents, features/code-review]
---

# Files and the canvas

::: say
> Merge the three CSV files in the reports folder into one table

Halo reads the three files, writes the merged table into the current workspace folder and names the file in its reply. The new file appears in the **Files** list on the right; click it to view it in the canvas.

**Prerequisite**: none.
:::

## Open the workspace resources rail {#resources-rail}

The workspace resources rail sits to the right of the conversation. It lists the files, Digital Humans, skills and MCP servers of the current [workspace](/en/features/spaces).

1. In the conversation header, click the folder button **Open workspace resources**. The rail opens on the right. Click it again (**Close workspace resources**) or click the rail's `›` to collapse it.
2. Switch between the four tabs at the top of the rail:

| Tab | What it shows | What a click does |
|---|---|---|
| **Files** | A live file tree of the workspace folder | Previews the file in the canvas, see [Files list](#files-tab) |
| **Digital Humans** | The Digital Humans in this workspace and their status (read-only) | Opens its page; on hover, **Chat** starts a new conversation with it. See [Digital Humans overview](/en/digital-humans/overview) |
| **Skill** | Skills you can use here, marked **This workspace** or **Global** | Opens the skill's instructions in the canvas; on hover, **Use** puts `/skill-name` in the composer. See [Skills](/en/features/skills) |
| **MCP** | MCP servers in effect in this workspace, with their scope | Opens its details on the Digital Humans page; no management here. See [MCP servers](/en/features/mcp) |

How the rail behaves:

- It starts collapsed. It opens by itself when the AI writes or edits a file with its file tools in the conversation you are watching.
- Open or closed is remembered per workspace.
- Drag the rail's edge to change its width: 200–400 px, default 300 px. The width is remembered.
- The rail steps aside, without changing your setting, while the active canvas tab has its own file list (such as **Changes**) or when the canvas would get narrower than 480 px. It also collapses in canvas fullscreen and comes back afterwards.

## Manage files in the Files list {#files-tab}

The **Files** tab shows the workspace's working directory; for the Halo Workspace it shows that workspace's own folder. When files change on disk, the list updates by itself.

| To do this | Do this |
|---|---|
| Preview a file | Click it. It opens in the [canvas](#canvas) on the right |
| Open with the system app | Double-click it, see [Preview or open with the system app](#open-externally) |
| Create a file or folder | Click **New File** / **New Folder** on the right of the toolbar, or right-click a folder and choose the same command to create it inside |
| Rename | Right-click › **Rename**, or select and press <kbd>F2</kbd> |
| Delete | Right-click › **Delete**, or select and press <kbd>Delete</kbd> / <kbd>Backspace</kbd>; multi-select works. The **Move to Trash** dialog says "You can restore this file from the Trash." |
| Move | Drag a row onto the target folder |
| Copy the path | Right-click › **Copy relative path** |
| Find it in Finder or Explorer | Right-click › **Show in Folder** <Badge type="info" text="Desktop only" /> |
| Open the whole workspace folder | Click **Open folder** on the left of the toolbar <Badge type="info" text="Desktop only" /> |
| Hand it to the AI | Drag the file from the list into the composer to insert a reference to it |
| Check again | Click **Refresh file tree** |

- Deleted files go to the system Trash (Recycle Bin on Windows), so you can restore them. Deleting from the web client or your phone uses the Trash of the computer that runs Halo.
- Names can't contain `\ / : * ? " < > |`, can't be `.` or `..`, and can't match an existing name. On Windows they also can't end in a dot or space or use reserved names such as `CON`, `PRN`, `AUX`, `NUL`, `COM1`–`COM9` and `LPT1`–`LPT9`.
- You can't drag a folder into itself; Halo shows "Cannot move a folder into itself".
- An empty folder shows "No files".

### NEW / MOD badges {#badges}

A small badge after a file name shows which files the AI touched in the current conversation:

| Badge | Meaning |
|---|---|
| **NEW** | The AI wrote the whole file with its file tools, usually a new file |
| **MOD** | The AI edited the file with its file tools |

The badges cover only what the AI did with its file tools in the **current conversation**; another conversation shows different badges. They are not Git status. Files the AI produces by running commands or scripts get no badge, for example Word, Excel and PowerPoint files made by the document skills. Those files still appear in the list, just without a badge, and they don't make the rail open by itself.

### Hidden and dimmed files {#hidden-files}

The list hides only version-control folders: `.git`, `.hg`, `.svn`, `CVS` and `.bzr`. Everything else is shown, including `node_modules`, `build`, `dist`, dot-files and `.halo`. Dot-files and common dependency and build folders are dimmed.

## Preview or open with the system app {#open-externally}

Click a file to preview it in the canvas; double-click to open it with the system's default app (the list's hint reads "Click to preview · double-click to open with system").

- The types the canvas can preview are listed under [Viewers](#viewers).
- Files the canvas can't preview go straight to the system app on a single click: archives, audio and video, fonts, executables, databases, disk images, and the older `.doc`, `.ppt`, `.odt`, `.ods` and `.odp` formats.
- For a file already open in the canvas, click **Open in external application** in the viewer toolbar to continue in the system app.

**Open in external application** and double-click opening exist only in the desktop app <Badge type="info" text="Desktop only" />. The web client and phones download the file instead, see [Web and phone differences](#remote).

## The canvas {#canvas}

The canvas is the tabbed area to the right of the conversation. It shows files, web pages, terminals, teams, goals and changes. It opens when you click a file in the list, a file link in a reply or a skill, or when you open a browser or terminal. With no tabs it shows "No files open".

### Tabs {#tabs}

- Drag tabs to reorder them. Close one with ×, a middle-click or <Shortcut mac="⌘ W" other="Ctrl W" />.
- Click **+** (**New Tab (⌘T)**) to open a browser tab at the browser homepage.
- Opening a file that is already open switches to its tab.
- A tab with unsaved edits shows a small dot.
- Up to 30 tabs stay open at once. Beyond that, the least recently used tabs close automatically with a message such as "Closed 2 least recently used tabs". Tabs with unsaved edits, the active tab and terminals are never closed automatically.
- Each workspace keeps its own set of tabs. Switching workspaces swaps the whole set; unsaved edits and running terminals survive and are there when you switch back.

Right-click a tab for the system menu <Badge type="info" text="Desktop only" />: **Close**, **Close Others**, **Close to the Right**, **Copy Path** and **Refresh** (the last two for file tabs only). These labels are English in every UI language.

### Collapse, fullscreen and width {#layout}

The canvas has three buttons at the top right:

| Button | What it does |
|---|---|
| **Enter fullscreen** / **Exit fullscreen** | Maximizes the window and hides the conversation, header and rail; a round **Return to conversation** button on the left exits fullscreen |
| **Close canvas (clears all tabs)** | Closes the canvas and all its tabs |
| **Collapse canvas** | Goes back to the conversation and keeps the tabs; <kbd>Esc</kbd> does the same. An **Expand canvas** handle stays at the edge and shows the tab count |

While the canvas is open, drag the divider between conversation and canvas to set the conversation width: 320–800 px, default 420 px, remembered per workspace.

::: warning
When you close a tab, close all with <Shortcut mac="⌘ ⇧ W" other="Ctrl Shift W" />, or click **Close canvas (clears all tabs)**, Halo does **not** warn you about unsaved edits. They are lost. Only Goal tabs ask first; closing a terminal tab the AI used on its own also asks. Save before you close.
:::

## Keyboard shortcuts {#shortcuts}

| Shortcut | What it does | When it works |
|---|---|---|
| <Shortcut mac="⌘ T" other="Ctrl T" /> | Open a new browser tab | Anywhere in the conversation view, even with the canvas closed |
| <Shortcut mac="⌘ W" other="Ctrl W" /> | Close the current tab | Canvas open |
| <Shortcut mac="⌘ ⇧ W" other="Ctrl Shift W" /> | Close all tabs | Canvas open |
| <Shortcut mac="⌃ Tab" other="Ctrl Tab" /> / add <kbd>Shift</kbd> | Next / previous tab | Canvas open |
| <Shortcut mac="⌘ 1–9" other="Ctrl 1–9" /> | Go to tab 1–9 | Canvas open |
| <kbd>Esc</kbd> | Collapse the canvas back to the conversation | Canvas open, not editing a file |
| <Shortcut mac="⌘ S" other="Ctrl S" /> | Save the file you are editing | While editing |
| <kbd>Esc</kbd> | Cancel editing and discard this round of edits | While editing |

App-wide shortcuts are in [Commands and shortcuts](/en/features/commands).

## Viewers {#viewers}

The canvas picks a viewer from the file extension. For an unknown extension it checks the content: text opens in the text viewer, binary goes to the system app.

| File | What you can do in the canvas | Editable |
|---|---|---|
| Code, text, JSON | Syntax highlighting, line numbers, folding, find; **Copy code**; **Open in external application** | Yes. Click **Edit file** |
| Markdown | Switch **Preview** / **Source**; **Copy** | Yes. Click **Edit** to open the editor |
| HTML | Sandboxed **Preview** / source; **Browser mode** renders it fully in a built-in browser tab (desktop); **Open in external browser** | No |
| Images (png, jpg, jpeg, gif, webp, svg, ico, bmp) | **Zoom in** / **Zoom out** (10 %–500 %), wheel zoom, drag to pan, **Fit to window**, **Reset**, **Download** | No |
| CSV (`.csv`) | **Table view** / **Source view**; **Copy** | No |
| Excel (`.xlsx`, `.xls`) | A table with sheet tabs at the bottom; at most 20,000 rows × 256 columns per sheet | No |
| Word (`.docx`) | Page layout | No |
| PDF | The desktop app uses the built-in PDF reader; the web client and phones get page buttons, 25 %–400 % zoom and **Fit width** | No |
| PowerPoint (`.pptx`) | Not rendered; shows "Presentation preview is not supported yet" | No. Open it with the system app or download it |

Details for Office documents and PDF are in [Office documents](/en/features/office-documents#preview).

The canvas also has tabs that aren't files:

| Tab | See |
|---|---|
| Browser | [AI Browser](/en/features/ai-browser) |
| Terminal | [AI Terminal](/en/features/ai-terminal) |
| Team | [Digital Human teams](/en/digital-humans/collaboration) |
| Goal | [Set a goal for a conversation](/en/features/conversations#goal) |
| Changes | [Changes, code review and Git](/en/features/code-review) |

Preview size limits:

| Type | Limit |
|---|---|
| Text files | 10 MB |
| `.xlsx`, `.xls`, `.docx`, `.pptx`, `.pdf` | 25 MB |
| Images and other binary files | 50 MB |

HTML previews run sandboxed and can't send data to outside sites. In the desktop app, an HTML file inside a workspace can load relative files from its own folder (never dot-files) and scripts and styles over https. Files outside every workspace, files in the home or root folder, and every preview in the web client or on phones use a stricter preview that shows relative images only.

## Edit and save a file {#edit-a-file}

You can edit code, text, JSON and Markdown right in the canvas. Only tabs backed by a real file on disk are editable.

1. Click the file in the Files list. It opens in the canvas.
2. Click **Edit file** (for Markdown, **Edit**). The toolbar shows **Editing**.
3. Make your changes. A small dot on the tab shows there are unsaved edits.
4. Click **Save (⌘S)** or press <Shortcut mac="⌘ S" other="Ctrl S" />. The dot disappears and the file is written to disk.

To drop this round of edits, click **Cancel (Esc)** or press <kbd>Esc</kbd>. The edits are discarded without a prompt.

Closing a tab that shows the dot doesn't ask you to save: unsaved edits are lost. See the warning under [Collapse, fullscreen and width](#layout).

You can also select lines of a saved file and reference them in the composer so the AI works on just those lines, see [Reference part of a reply](/en/features/conversations#references).

::: done
When the dot on the tab disappears, the file is saved. Open it in the system app and you'll see your changes.
:::

## When a file changes on disk {#disk-changes}

When the AI or another program changes a file that is open in the canvas:

- The tab has **no** unsaved edits: the content reloads in place, with nothing for you to do.
- The tab **has** unsaved edits: a bar reads "This file changed on disk while you were editing it." Choose one:
  - **Load disk version**: drop your edits and show the new content from disk.
  - **Keep my edits**: keep your version; saving later overwrites the file on disk.

Updates reach the file list and the canvas in about 0.5 seconds, at most 2 seconds.

## File links in replies {#file-links}

Files the AI mentions in a reply can be opened directly:

- A file path in inline code, or a Markdown file named in the text, becomes a link when that file really exists in the workspace. Click it to open the file in the canvas.
- A mention written as `path:line` (for example `src/app.ts:42`) opens the file at that line.
- Hover over a table in a reply and an **Open in canvas** button appears at its top right. Click it to open the table as a "Table" tab in the canvas, which helps with wide tables.

When the AI wrote or edited files with its file tools, the reply ends with "Changed 3 files", the added and removed line counts and **View changes**. Click **View changes** to open a read-only changes view of that reply in the canvas; it doesn't need Git. Only edits made with file tools are counted; files changed by commands or scripts aren't. Details: [View changes under a reply](/en/features/code-review#reply-changes).

## Web and phone differences {#remote}

When you use Halo in a browser through [Remote Access](/en/features/remote-access), or [on your phone](/en/features/mobile), file operations act on the computer that runs Halo, with these differences:

| Feature | In the web client and on phones |
|---|---|
| **Show in Folder**, **Open folder** | Not available; the left of the toolbar shows "Please open folder in client" |
| **Open in external application**, double-click to open | Not available; files the canvas can't preview download on click ("Click to download file") |
| Office documents and PDF | Always have a **Download** button in the Files list |
| Tab right-click menu | Not available |
| PDF | Uses the built-in page-by-page reader |
| HTML preview | Always the stricter sandboxed preview |
| Browser tabs | Show "Browser features are only available in the desktop client" |
| New, rename, move, delete, save | All work; deleted files go to that computer's Trash |

On screens narrower than 640 px (all phones), the rail isn't docked on the right. Tap the small tab on the right edge of the screen to slide it in, and tap × to close it. The canvas covers the whole screen; tap **Return to conversation** to go back.

## Troubleshooting {#troubleshooting}

### A file the AI made has no NEW badge

The AI most likely produced it by running a script (Office documents, for example) rather than with its file tools, so there is no badge and the rail doesn't open by itself. The file is in the list; look for the name given in the reply. See [NEW / MOD badges](#badges).

### Changes inside node_modules and similar folders don't show up

`.halo`, version-control folders and dependency or cache folders such as `node_modules`, `.next`, `.cache` and `__pycache__` aren't watched live. Click **Refresh file tree** or switch back to the Halo window and they update. If the workspace folder is a disk root (such as `/` or `C:\`), nothing updates automatically; point the workspace at a specific project folder instead, see [Change the working directory](/en/features/spaces#working-directory).

### My edits were gone after I closed a tab

Halo doesn't warn about unsaved edits when you close a tab or the canvas. Next time, press <Shortcut mac="⌘ S" other="Ctrl S" /> first and watch for the dot on the tab.

### Tabs closed by themselves

More than 30 tabs were open, so Halo closed the least recently used ones and showed "Closed … least recently used tabs". Open the file again.

### The resources rail disappeared

The rail steps aside while the active canvas tab has its own file list, such as **Changes**, or when the window is so narrow that the canvas would drop below 480 px. Switch tabs, collapse the canvas or widen the window and it returns. It also collapses in fullscreen.

### The canvas shows "Large file, still loading..." or "Could not load the viewer. Reopen the file to try again."

The first means the file is large; wait a moment. The second means the viewer failed; close the tab and open the file again from the list. Files above the [preview size limits](#viewers) aren't previewed; double-click to open them with the system app.

## Next steps {#next-steps}

- [Office documents](/en/features/office-documents): have Halo make Word, Excel and PowerPoint files and view them in the canvas.
- [Changes, code review and Git](/en/features/code-review): see line by line what the AI changed, then stage and commit.
- [Workspaces](/en/features/spaces): change the working directory or create a workspace, which decides the folder the Files list shows.
