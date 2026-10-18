---
title: "Knowledge Base: AI answers from your documents"
description: Put PDFs, Office files, images and text into a Halo knowledge base, and the AI reads them before answering and cites sources. Learning is local and token-free.
type: how-to
audience: [office]
related: [features/memory, features/conversations, digital-humans/capabilities]
---

# Knowledge Base

::: say
> Create a knowledge base called "Product docs" and set ~/Documents/Product docs as a watched folder

Halo creates the knowledge base, sets the folder as a watched folder and starts learning it. You can follow up with "How far along is the learning?"

**Prerequisite**: turn on **Operate Halo** under **＋ › Capabilities** in the message box. It is off by default. The AI can ask you to turn it on, but it can't turn it on itself.
:::

## Open the Knowledge Base page {#open}

Click **Knowledge Base** in the left navigation rail. In a narrow window or on a phone, find **Knowledge Base** in the **Navigate** sheet.

Each knowledge base is a card, most recently edited first. The last, dashed card is **New knowledge base**. A card shows the document count, learning progress, size and how many Digital Humans use it. Hover over a card to see its pause button and the **More** menu (**Set as default**, **Delete**).

Click a card to open its detail page. It has three tabs, **Chat · Files · Settings**, and opens on **Files**.

## Create a knowledge base {#create}

1. On the Knowledge Base page, click **New knowledge base** (with no knowledge bases yet, the button is also in the middle of the page).
2. Enter a **Name**, such as "Product docs".
3. If you like, pick workspaces under **Connect to workspaces (optional)**. **New conversations** in those workspaces load this knowledge base automatically.
4. Click **Create**. The detail page opens, still empty.

Creating a knowledge base and learning files need no AI model. You can change the description, the default knowledge base and watched folders later on the **Settings** tab.

![The Knowledge Base page with no knowledge bases yet, showing "Build your first knowledge base" and the New knowledge base button](/images/features/knowledge-base/empty-state.en.webp)

## Add files and folders {#add-files}

<Badge type="info" text="Desktop only" />

1. Open the knowledge base and switch to the **Files** tab.
2. Drop files or folders on the "Drop files or folders here" area, or click **Browse files** / **Browse folder**.
3. Learning starts on its own. The progress card above shows "Learning…" and the current file, then "Done learning".

Added files are **copied** into the knowledge base. If you later edit the original, the copy in the knowledge base doesn't change. For documents you keep updating, use a [watched folder](#watched-folders).

Adding files works only in the desktop app. In the web page and Android app opened through [Remote Access](/en/features/remote-access), this area shows "Adding files requires the desktop app."

### Supported files {#supported-files}

| Type | Extensions | What is read |
|---|---|---|
| Text | `.md` `.markdown` `.txt` `.text` `.rst` `.org` `.csv` `.tsv` `.html` `.htm` | The full text |
| PDF | `.pdf` | The text layer. Scanned PDFs have no text layer, so nothing is read |
| Word | `.docx` | Paragraph text |
| PowerPoint | `.pptx` | Slide text, in slide order |
| Excel | `.xlsx` | Text in cells. Numbers and formulas are not extracted |
| Images | `.png` `.jpg` `.jpeg` `.webp` `.bmp` `.tif` `.tiff` `.gif` | Text found by on-device text recognition (English and Simplified Chinese) |

Unsupported files are skipped with the message "Skipped N unsupported file(s)". These include legacy `.doc` `.ppt` `.xls`, source code, JSON / YAML / XML configuration and logs. The message doesn't list images, but images are supported.

Office lock files (`~$*`, `.~lock.*`), `.DS_Store`, `Thumbs.db` and `desktop.ini` are always ignored.

### Folder import rules {#folder-import}

- Subfolders come along, and the folder structure is kept.
- `.git` `.svn` `.hg` `node_modules` `.venv` `__pycache__` `dist` `build` `.next` `target` `vendor` `coverage` `.idea` `.vscode` `.cache` `.gradle` are skipped, and symbolic links are not followed.
- A file with the same name and the same content is not copied twice. A file with the same name but different content is renamed `name-2.ext`, `name-3.ext`. Files with different names are each copied, even if their content is the same.
- There is no size limit per file and no limit on the number of files. One import walks at most 20,000 directory entries, though. Anything past that is not imported, and no message is shown.

## How learning works {#how-learning-works}

When Halo "learns" a file, it extracts the file's text on your computer and adds it to a document map (each document's name and a one-line synopsis). No model is called, nothing is embedded and no tokens are used, so it works offline. A few dozen files usually take seconds.

To answer a question, the AI reads the document map, searches the extracted text, opens the relevant documents and then replies. That is why a knowledge base works best with the documents you actually want the AI to consult. A small, focused set makes the useful parts easier to find.

| Step | Uses a model | Costs tokens |
|---|---|---|
| Create, add files, learn, re-index | No | No |
| [Ask](#ask) in the knowledge base | The current default model | Like a normal conversation |
| [Load into a conversation](#use-in-conversation) | That conversation's model | A few extra input tokens each turn |

More details:

- Images are read with on-device text recognition and are not uploaded. Only text is recovered; charts and layout are not understood.
- Text encoding is detected automatically: UTF-8, UTF-16, GBK, Big5, Shift_JIS and Windows-1252.
- Files are processed one at a time. A file is learned again only when its content changes.
- One file that fails doesn't fail the whole knowledge base. Each time Halo starts, it finishes any files not yet learned.

## Files list {#files-list}

The **Files** tab lists every source, including files in watched folders, in three groups:

| Group | Meaning |
|---|---|
| **Not yet learned** | Waiting to be learned, or failed and waiting to retry |
| **Learned** | Ready to use. Click one to open it in the canvas |
| **Skipped — no readable text** | No text could be read. Collapsed by default. **Clean up N** removes only the knowledge base's copies |

The reason appears under the file, for example "No text layer — looks like a scan", "No text found in this image", "No readable text found" or "Couldn't read this file".

When files are waiting, a **Learn N new file(s)** button appears. Click it to start learning by hand.

To remove files, click the trash icon next to a file, or click **Select files**, check files or a whole group, then click **Remove selected**. Removing permanently deletes the knowledge base's copy. Your original file on disk is not touched. Files from a watched folder can't be removed here; they show "From a watched folder — manage it in Settings".

## Watched folders {#watched-folders}

<Badge type="info" text="Desktop only" />

A watched folder is not copied. Halo learns its documents in place, and new or changed files are learned again automatically. Use one for a folder of documents you keep updating.

1. Open the knowledge base and switch to the **Settings** tab.
2. Under **Watched folders**, click **Add folder** and pick a folder.
3. The folder appears in the list, its files appear on the **Files** tab, and learning starts.

| Limit | Value | Message when exceeded |
|---|---|---|
| Supported files per folder | 500 at most | "Folder has too many files (…). Watched folders are limited to 500 files." |
| Directory entries per scan | 20,000 at most | "This folder is too large to watch. Watched folders are meant for a small set of documents." |
| A whole disk | Not allowed (such as `/`, `C:\`, a disk under `/Volumes/`) | "A whole disk cannot be watched. Pick a documents folder instead." |

Pick a small documents folder. Your whole home folder will almost always go past 20,000 entries. Dependency, version-control and cache folders such as `node_modules` and `.git` are ignored.

If a folder grows past a limit after you add it, learning pauses for that folder and its files drop out of the list and counts. It resumes once the folder is back under the limit. The top of the detail page then shows "N watched folder(s) not learning"; click it to jump to Settings.

If the folder can't be found (an unplugged drive or an unmounted network share, for example), it shows as **Unavailable**. Reconnect it and click **Retry**. Halo also looks again every time it starts.

Clicking the X on a folder row only stops watching. The folder and its files are not touched. Text already extracted stays until the next [re-index](#re-index).

The remote web page and Android app don't show **Add folder**, but you can view and remove existing watched folders there.

## Pause a knowledge base {#pause}

Turn off **Keep learning** under **Settings › Learning**, or click the pause button on the card. The knowledge base becomes **Paused**:

- Watching stops, and newly copied files are not learned automatically. The **Learn N new file(s)** button still works.
- Conversations and Digital Humans stop using it from their next message or run. Turn it back on and they use it again, with no need to reload it.
- The knowledge base's own **Chat** tab can still answer from it.

When you turn **Keep learning** back on, Halo resumes watching and checks once for what changed while it was paused.

## Default knowledge base {#default}

The default knowledge base is loaded automatically into **every new conversation in every workspace**. There is at most one. Newly installed Digital Humans get it too.

Set it in any of these places:

- Turn on **Default knowledge base** under **Settings › Learning**
- **More › Set as default** on the card
- The star in the message box's **Knowledge** menu

Setting a new default clears the old one. The card menu can only set the default; to clear it, use the Settings switch or the star. Existing conversations are not changed.

## Re-index documents {#re-index}

**Settings › Learning › Re-index documents › Re-index** wipes the extracted text and learned status, then extracts everything again from the knowledge base's copies and watched folders. The sources are kept, and it is usually quick. You can't re-index while learning is running.

Re-indexing reads the knowledge base's own copies, so it won't pick up edits you made to the original of an added file. To update an added file, add the new version again. Watched folders already learn changes on their own.

## Delete a knowledge base {#delete}

At the bottom of **Settings**, click **Delete knowledge base › Delete**, or use **More › Delete** on the card.

::: danger Deleting can't be undone
Deleting permanently removes the knowledge base's copied files, extracted text and document map. Your originals elsewhere on the computer and the files in watched folders are not touched.
:::

## Ask a knowledge base {#ask}

To ask questions of one knowledge base only, click **Ask** at the top of the detail page, or switch to the **Chat** tab. Type in "Ask a question…" and press <kbd>Enter</kbd> to send (<kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line). While it works you'll see "Searching the knowledge base…" and "Writing the answer…". [Sources](#sources) appear under the answer.

This chat is **temporary**:

- It never appears in the conversation list, search or the task panel.
- It survives switching tabs, but it is deleted when you click **Clear chat**, leave this knowledge base or go to another page.
- It uses the current default model and costs tokens like a normal conversation, so [connect a model](/en/features/models) first.
- It doesn't use workspace memory.

To keep the answers, or to use several knowledge bases at once, [load them into a normal conversation](#use-in-conversation).

## Sources {#sources}

**Sources** under an answer list the documents the AI actually opened this time, each once. Click one to open it in the canvas: an added file opens the knowledge base's copy, and a watched-folder file opens the original.

Sources appear on the **Chat** tab and in normal conversations. In normal conversations they are saved with the message. Documents whose original no longer exists are not listed.

## Use a knowledge base in a conversation {#use-in-conversation}

::: say
> From the contract template in the knowledge base, list the payment terms for me

First load the knowledge base that holds the contract template with the **Knowledge** button in the message box, then send this. Halo finds the template in the knowledge base, reads it and lists the terms, with **Sources** under the answer.
:::

1. In the conversation's message box, click **Knowledge** next to **＋** (tooltip "Load knowledge bases into this conversation").
2. In the "Load knowledge bases" menu, click a knowledge base to load or unload it for **this conversation**. The number on the button is how many are loaded.
3. Send your next message. Changes take effect from the next message.

![The Knowledge menu in the composer: the loaded knowledge base "Product docs" is ticked, with a pin and a star on its right and Manage knowledge bases below](/images/features/knowledge-base/knowledge-menu.en.webp)

Each row in the menu has two more icons:

| Icon | What it does | Applies to |
|---|---|---|
| Pin | Always enable in this workspace (applies to new conversations); the row shows **Workspace** | New conversations in this workspace |
| Star | Makes it the [default knowledge base](#default); the row shows **Default** | New conversations in every workspace |

The pin is the same setting as **Settings › Connected workspaces** on the knowledge base and **Connect to workspaces (optional)** when you create one. A new conversation starts with its workspace's connected knowledge bases plus the default one. After that, each conversation keeps its own set. With no knowledge bases yet, the menu shows "No knowledge yet" and **Add knowledge**. **Manage knowledge bases** at the bottom opens the Knowledge Base page.

::: warning Loaded knowledge bases cost a few tokens every turn
Each loaded knowledge base adds its document map to every turn of the conversation (up to 200 documents, at most 24,000 characters per knowledge base), even when the turn doesn't use it. Unload the ones you don't need.
:::

A few notes:

- Paused knowledge bases are skipped; a knowledge base that is still learning brings only the documents it has finished.
- The model must support tool use (searching and reading files). No particular provider is needed.
- The **Knowledge** button is hidden while the AI is replying and in Digital Human chats. For a Digital Human, [attach knowledge bases in its own settings](#digital-humans).

::: done
When **Sources** listing documents from the knowledge base appear under the answer, the AI has used the knowledge base.
:::

## Attach a knowledge base to a Digital Human {#digital-humans}

1. Open **Digital Humans** and select a Digital Human.
2. Go to **Capabilities and settings › Tools & Resources › Knowledge**.
3. Click a knowledge base row to check or uncheck it. The hint reads "The digital human can reference documents from the checked knowledge bases."

The Digital Human can then read those knowledge bases in every run and chat. Changes apply from the next run or message, with no restart. When a Digital Human is installed, it gets its workspace's connected knowledge bases plus the default one. For its other settings, see [Capabilities and settings](/en/digital-humans/capabilities).

Under **Settings › Connected workspaces**, a knowledge base also lists the Digital Humans that use it. Click a name to open that Digital Human.

## Let the AI manage knowledge bases {#operate-halo}

With [Operate Halo](/en/features/operate-halo) on, the AI can create, rename and pause knowledge bases, set the default, connect workspaces or Digital Humans, add files by path, set watched folders, start learning, re-index and delete. The same rules and limits apply as in the UI, such as the 500-file limit for watched folders.

This is also the only way to add files to a knowledge base from Remote Access or on Halo Server: tell the AI where the files or folder are on the computer that runs Halo.

## Remote Access and Halo Server {#remote}

| Where | You can | You can't |
|---|---|---|
| Remote web page, Android app | Browse, create, rename, pause, set the default, connect workspaces, remove copied files, re-index, delete, ask, open sources, use the message box's **Knowledge** button | Add files (shows "Adding files requires the desktop app."), add watched folders |
| [Halo Server](/en/server/) | Learning and watching run as usual | Add files in the browser UI |

To add files in either case, use [Operate Halo](#operate-halo) with paths on the server.

## Where the data lives {#storage}

Knowledge bases are stored locally in Halo's data folder, `~/.halo/knowledge-bases/`. Watched folders stay where they are. For the folders on each OS, see [Where Halo keeps your data](/en/advanced/config-paths).

## Knowledge base vs. memory {#memory-vs-knowledge-base}

A knowledge base holds documents **you** collect; [memory](/en/features/memory#memory-vs-knowledge-base) holds decisions, preferences and lessons **the AI** writes down for itself as it works.

## Troubleshooting {#troubleshooting}

### "Skipped N unsupported file(s)"

The file type is not in [Supported files](#supported-files). Save legacy `.doc` `.ppt` `.xls` files as `.docx` `.pptx` `.xlsx` first. Source code and configuration files are not taken into a knowledge base; for code, let the AI read it in a [workspace](/en/features/spaces).

### A file shows "No text layer — looks like a scan"

It's a scanned PDF with no text to extract, and Halo doesn't run text recognition on PDF pages. Export the pages as images and add those instead; images are read with on-device text recognition.

### A file stays in "Not yet learned"

- Is the knowledge base **Paused**? New files aren't learned automatically while paused. Click **Learn N new file(s)**, or turn **Keep learning** back on.
- A file with a text extension whose content looks binary is never learned and stays in this group.

### I edited the original, but answers use the old content

Added files are copies and don't follow the original, and re-indexing doesn't change that. Add the new version again, or make that folder a [watched folder](#watched-folders).

### A watched folder shows "Unavailable"

The drive or network location the folder is on isn't connected. Connect it and click **Retry**. If you still see "The folder is still unavailable", check whether the folder was moved or renamed.

### The AI didn't use the knowledge base

- Check the number on the **Knowledge** button to confirm it's loaded in **this** conversation. Connecting a workspace and setting the default only affect new conversations.
- Make sure the knowledge base isn't paused and its files show **Learned**.
- Loading or unloading takes effect from the next message.
- Say "from the knowledge base…" in your question so the AI knows to look there.

## Next steps {#next-steps}

- [Memory](/en/features/memory): let Halo remember your preferences and decisions, alongside your knowledge bases
- [Conversations](/en/features/conversations): follow up, reference replies and organize the conversation list
- [Capabilities and settings](/en/digital-humans/capabilities): give a Digital Human knowledge bases, skills and tools
