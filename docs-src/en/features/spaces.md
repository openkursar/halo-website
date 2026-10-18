---
title: "Workspaces (Spaces): keep each project separate"
description: A Halo workspace (formerly a Space) keeps one project's folder, conversations, Digital Humans, skills and memory together and apart from other projects.
type: how-to
audience: [office]
related: [features/files-and-canvas, features/memory, digital-humans/overview]
---

# Workspaces

::: say
> Create a workspace called "Annual plan" that uses the folder ~/Documents/Annual plan

Halo creates the workspace, points its working directory at that folder, and tells you when it's ready. You can ask the same way to rename a workspace, change its folder, turn off its workspace memory or delete it.

**Prerequisite**: turn on **Operate Halo** in the message box under **＋ › Capabilities** (off by default). The AI can ask you to turn it on, but can't turn it on itself.
:::

::: warning
With **Operate Halo** on, Halo tells the AI to confirm with you in words before it deletes a workspace, but no confirmation dialog appears and the deletion happens at once. See [Delete a workspace](#delete) for what deleting removes.
:::

## Halo Workspace and your own workspaces {#halo-workspace}

Halo has two kinds of workspace.

| | **Halo Workspace** | Workspaces you create |
|---|---|---|
| Where it comes from | Built in, always there | You create it (or ask Halo to) |
| Where its files live | A fixed place in Halo's data folder | Halo's default location, or a project folder you choose |
| Good for | Quick questions, trying an idea, anything that doesn't need a fixed folder | One project, client or goal |
| Rename, recolor, change folder | No | Yes |
| Delete | No | Yes |
| Card menu | **Show in Folder** only | **Edit** · **Show in Folder** · **Delete** |

The AI can do the same things in both kinds. The only differences are whether the folder is fixed and whether you can change the workspace.

Use one workspace per project. The AI then never edits files in the wrong folder, and quick questions don't clutter the context of ongoing work.

::: tip A workspace is a folder the AI works in directly
The AI can create, edit and delete files in the working directory without asking each time, and it can reach other places on this computer through commands. Back up important files first, or keep them in a Git repository. See [why Halo doesn't ask before each step](/en/advanced/security#tool-permissions).
:::

## What's in a workspace {#whats-in-a-workspace}

Each workspace keeps its own set of the following, so switching workspaces swaps the whole set:

| Item | What it is | Learn more |
|---|---|---|
| Working directory | The folder the AI works in, and the folder the **Files** panel on the right shows | [Files and canvas](/en/features/files-and-canvas) |
| Conversations | This workspace's conversation list, including chats with Digital Humans | [Conversations](/en/features/conversations) |
| Digital Humans | Every Digital Human belongs to one workspace and works in its folder | [Digital Humans overview](/en/digital-humans/overview) |
| Skills | "This workspace" skills work only here; "Global" skills work everywhere. With the same name, this workspace's skill wins | [Skills](/en/features/skills) |
| MCP servers | Global servers plus this workspace's. With the same name, this workspace's server wins | [MCP servers](/en/features/mcp) |
| Knowledge bases | Knowledge bases connected to this workspace load automatically in its new conversations | [Knowledge base](/en/features/knowledge-base) |
| Workspace memory | One memory shared by the ordinary conversations in this workspace | [Memory](/en/features/memory) |
| Canvas tabs | Each workspace has its own set of tabs, swapped when you switch | [Files and canvas](/en/features/files-and-canvas) |

Click the folder button at the top right of the conversation view (**Open workspace resources**) to see the current workspace's **Files** · **Digital Humans** · **Skill** · **MCP** tabs.

### Workspace memory {#workspace-memory}

The ordinary conversations in one workspace share one memory. The AI notes lasting decisions, preferences and know-how, organizes them into topics, and new conversations start with them. Workspace memory is on by default; set it in **Manage workspaces › card ⋮ › Edit › Advanced › Workspace memory**. The Halo Workspace has workspace memory too, on by default, but no settings for it in the app. Tidying memory uses the model and costs tokens. For how to turn it off or tidy it, see [Memory](/en/features/memory).

### A Digital Human's two folders {#digital-human-folders}

A Digital Human uses two different folders:

| Folder | What it holds | Where to find it |
|---|---|---|
| The workspace's working directory | **Files the Digital Human produces**: reports, spreadsheets, downloaded data, work in progress | The **Files** panel on the right, or the workspace under the Digital Human › **Capabilities and settings** › **Advanced** › **App Spec** |
| The memory folder | The Digital Human's **internal state**: `memory.md`, topics, run records and run logs | **Memory Files** in the same place; click **Reveal in Finder** to open it (desktop only; the link has this name on Windows and Linux too) |

The memory folder sits in Halo's data folder, not in your project folder. **Clear Memory** deletes only what's in the memory folder and never touches files in the working directory.

A Digital Human can change workspace: choose **Move to another workspace** from the **More** menu on its card or its page. This changes the workspace where its **new work** starts. Files and history are not moved, and its memory folder stays where it is and keeps working. See [Manage Digital Humans](/en/digital-humans/manage).

## Create a workspace {#create}

1. In the conversation view, click the current workspace's name at the top left to open the workspace list, then click **New Workspace**. Or click **Workspace** at the top left to open the management page, then click **New Workspace**. The **Create Dedicated Workspace** dialog opens.
2. Type a **Name**, for example "Client project".
3. Under **Local Directory**, choose where the files go:
   - **Default Location**: Halo makes a folder inside its own data folder. Good for new work that has no files yet.
   - **Custom Folder**: click **Browse** and pick an existing project folder (you can also make a new folder in the picker). If the name is still empty, it's filled in with the folder's name.
4. Pick an **Icon Color** (6 to choose from).
5. Click **Create**. The new workspace goes to the top of the list and opens.

![The Create Dedicated Workspace dialog with Name, Local Directory (Default Location or Custom Folder) and Icon Color](/images/features/spaces/create-workspace.en.webp)

With **Default Location**, the path shown in the dialog is only a preview. The real folder is named with a random ID, not the workspace name. To find it, use **Show in Folder** on the workspace's card.

With **Custom Folder**, Halo sets that folder as the working directory. Conversations, settings and memory stay in Halo's own data folder, not in this folder. The exception is [skills](/en/features/skills) installed to this workspace: they live in the folder's `.claude/skills/`.

### Drop a folder to create a workspace {#drop-folder}

<Badge type="info" text="Desktop only" />

At the end of **My Workspaces** on the management page there is a dashed **New Workspace** card that says "or drop a project folder here". Drag a folder from Finder or File Explorer onto it and let go when you see "Drop to create a workspace for this folder". The dialog opens with that folder already selected.

Only the first dropped item counts. If you drop a file, you see "Only a folder can become a workspace".

::: done
The new workspace shows at the top left with the name and color you chose, and an empty new conversation. The **Files** panel on the right shows its working directory.
:::

## Switch workspaces {#switch}

- **Workspace list**: click the current workspace's name at the top left of the conversation view (tooltip "Current workspace: … — click to switch") and pick another. The **Halo Workspace** is pinned on top; the rest are sorted by most recent activity. Once you have 4 or more of your own workspaces, **Search workspaces** appears at the top of the list.
- **Shortcut**: press <Shortcut mac="⌘ K" other="Ctrl K" /> and choose **Switch Workspace** to open the same list.
- **Management page**: click **Workspace** at the top left (in a narrow window this label is hidden; use **Manage workspaces** at the bottom of the list instead), then click any card.

Switching doesn't interrupt replies in progress. You can have the AI refactor a module in workspace A, draft a document in workspace B, and gather research in workspace C. When you go back to A, its work has carried on. **Tasks** at the bottom of the left nav rail shows how many are running. For more, see [Work on several things at once](/en/features/parallel-work).

![The Workspace page: the Halo Workspace under Default; under My Workspaces, two workspaces and the dashed New Workspace card](/images/features/spaces/workspaces-page.en.webp)

The management page has three groups: **Default** (the Halo Workspace), **My Workspaces**, and **Disconnected** (only when a workspace is unavailable). Each card shows the name, the working directory path and the last activity. The top of the page has **Search workspaces** and **Refresh**. Drag cards in **My Workspaces** to change their order; dragging is off while you search.

## Rename or recolor a workspace {#edit}

1. Open the management page (click **Workspace** at the top left).
2. Hover over the workspace card, click **⋮** (**More**) at its top right, and choose **Edit**. The **Edit Workspace** dialog opens.
3. Change the **Name** or **Icon Color** and click **Save**. The card and the top left show the new name and color.

The **Halo Workspace** can't be edited. Since 3.0, rename and delete are no longer in the workspace list at the top left; they're in the card's **⋮** menu on the management page.

## Change the working directory {#working-directory}

<Badge type="info" text="Desktop only" />

When the project folder has moved, or you want the workspace to work in a different folder:

1. Choose **Edit** from the card's **⋮** menu on the management page.
2. Next to **Working directory**, click **Change folder** and pick an existing folder.
3. The change applies at once; you don't need **Save**. The dialog shows "Changed. Conversations keep their history; any reply in progress finishes first."

| What happens | What doesn't happen |
|---|---|
| The AI and the **Files** panel use the new folder | No file in either folder is moved or deleted |
| The workspace's Digital Humans work in the new folder too | Conversation history isn't lost; conversations keep their context |

The change is refused when:

- The folder doesn't exist.
- The folder is Halo's own data folder: "Could not change the working directory: That folder holds Halo’s own data. Choose a project folder."
- A reply, a Digital Human run or a background task is still going in the workspace. Wait for it to finish, then try again.

## Delete a workspace {#delete}

1. Choose **Delete** from the card's **⋮** menu on the management page.
2. Read the message in **Delete this workspace?**, then click **Delete**.

::: danger What deleting a workspace removes
- **A workspace in the default location**: the message says "All conversations and files in the workspace will be deleted." The whole folder is **deleted permanently**. It doesn't go to the Trash and can't be recovered.
- **A workspace that points at your own folder**: the message says "Only Halo data (conversation history) will be deleted, your project files will be kept." Only Halo's records go; your project files stay as they are.
- **In both cases, the workspace's Digital Humans are deleted too**, along with their task state. The dialog doesn't mention this. To keep a Digital Human, use **Move to another workspace** first.
:::

Deleting also:

- Closes the workspace's canvas tabs without asking you to save.
- Switches Halo to another workspace if you deleted the current one.

If a reply or task is still running in the workspace, deletion is refused with "This workspace is still running a reply or task. Stop it or wait for it to finish, then delete again."

The **Halo Workspace** can't be deleted. To delete a single file, delete it in the **Files** panel on the right; it goes to the system Trash and can be restored.

## Working directory unavailable and disconnected workspaces {#unavailable}

When a workspace's folder has been moved, deleted, or is on an unplugged external drive, you see one of two things.

**In a conversation**: when you send a message, a red **The working directory is unavailable** card appears in place of the reply, with the old path. Click **Change working directory** and pick a folder that exists now. When you see "The working directory is now …. Send your message again.", send the message again.

**In the workspace list and on the management page**: Halo keeps the workspace instead of dropping it. It shows an unplugged icon and **Unavailable**, and it's grouped under **Disconnected** on the management page. You can't open it or switch to it.

- If the folder is on an external drive, plug the drive back in and the workspace comes back by itself.
- If you don't need it any more, choose **Remove from list** from the card's **⋮** menu. The confirmation says: "Its files stay wherever they are — Halo just stops tracking it here. Reconnecting the drive later will not bring back its conversations under this entry."

## Limits in the web client and Android {#remote-limits}

When you use Halo in a browser or on Android through [Remote Access](/en/features/remote-access), anything that picks a folder has to be done on the computer that runs Halo:

| Action | Web client / Android |
|---|---|
| Create a workspace | **Default Location** only; **Custom Folder** is unavailable and shows "Please select folder in desktop app" |
| Drop a folder on the New Workspace card | Not available |
| **Change folder** / **Change working directory** | Unavailable: "The folder can only be changed in the desktop app." |
| **Show in Folder** on a card | Does nothing |

## Troubleshooting {#troubleshooting}

### I can't find rename or delete in the workspace list

Since 3.0 they're on the management page. Click **Workspace** at the top left and use **Edit** or **Delete** in the card's **⋮** menu.

### Deleting says "This workspace is still running a reply or task"

A conversation in the workspace is still replying, or a Digital Human is running. Stop it or wait for it to finish, then delete again.

### "Change folder" can't be clicked

You're using the web client or Android. Folders can only be changed in the desktop app on the computer that runs Halo.

### Dropping shows "Only a folder can become a workspace"

You dropped a file. Drop the folder that contains it.

### I asked the AI to create a workspace and it asks me to turn on Operate Halo

The AI needs **Operate Halo** to create, change or delete workspaces, and it can't turn that on itself. Turn on **Operate Halo** under **＋ › Capabilities** in the message box, then ask again.

## Next steps {#next-steps}

- [Files and canvas](/en/features/files-and-canvas): view, preview and organize a workspace's files in the right-hand panel.
- [Memory](/en/features/memory): how workspace memory and a Digital Human's memory are written and tidied.
- [Digital Humans overview](/en/digital-humans/overview): put a Digital Human in a workspace to work on a schedule.
