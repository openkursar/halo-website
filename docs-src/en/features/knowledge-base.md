---
title: "Knowledge Base - Let the AI Answer from Your Documents"
description: "Put PDFs, Office documents, images, Markdown and other files into a Halo knowledge base; the AI reads them when answering and lists its sources. Watched folders keep learning new and changed files."
---
# Knowledge Base

A knowledge base is a set of documents you hand to Halo. Halo extracts their text on your machine, and in a conversation the AI looks things up in those documents before answering, then lists the sources it used under the reply.

## Supported Files

| Type | Formats |
|---|---|
| Text | Markdown, TXT, reStructuredText, Org, CSV, TSV, HTML |
| Documents | PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx) |
| Images | PNG, JPG, WebP, BMP, TIFF, GIF — their text is read with on-device OCR |

Source code, configuration files and logs are not accepted. When you import a folder, `.git`, `node_modules`, build output and similar directories are skipped automatically.

---

## Create a Knowledge Base

1. Open **Knowledge Base** in the left navigation.
2. Click **New knowledge base** and give it a name. You can also connect it to some spaces at this step (optional).
3. On the **Files** tab, drop in files or folders, or click **Browse files** / **Browse folder**. Folders are imported together with their subfolders.
4. Click **Learn N new file(s)**. Once a file shows **Learned**, it is ready to use.

"Learning" only extracts text locally — no model is called — so a few dozen files usually take seconds. Files with no readable text (a scanned PDF, an image without text) are marked **Skipped — no readable text** and can be cleaned up in one click.

<!-- Screenshot placeholder: screenshot-knowledge-files.png (the knowledge base Files tab) -->

---

## Use It in Conversations

There are several ways to let the AI use a knowledge base:

- **This conversation**: click the **Knowledge** button in the composer toolbar and check the knowledge bases to load.
- **New conversations in a space**: in the **Knowledge** menu, check "Always enable in this workspace", or connect the knowledge base to that space on its **Settings** tab.
- **All new conversations**: turn on **Default knowledge base** on its **Settings** tab.
- **Digital humans**: check the knowledge bases to use in the digital human's settings.
- **Ask directly**: use **Ask this knowledge base** on its **Chat** tab; answers come only from that knowledge base.

When answering, the AI searches and reads the relevant documents. The **Sources** under the reply list the files it read; click one to open it.

---

## Watched Folders

On the **Settings** tab, click **Add folder**. Halo keeps learning new and changed files in that folder — handy for a document folder you update often.

- A watched folder can hold at most 500 learnable files. A folder over that limit cannot be added, and a watched folder that later grows past it is skipped until it drops back under.
- A whole drive (such as `C:\` or `/`) cannot be watched.
- A folder that cannot be watched (for example, because it was moved) is shown as **Unavailable**.

---

## Settings and Maintenance

- **Keep learning**: turning it off pauses the knowledge base. A paused knowledge base stops learning new files and is not used by conversations or digital humans until you turn it back on.
- **Re-index documents**: re-extracts all text from the source files; useful after you changed them.
- **Delete knowledge base**: removes the file copies and extracted text Halo keeps. The original files on your computer, including those in watched folders, are not touched.

Knowledge bases are stored in Halo's data directory on your machine (by default `.halo/knowledge-bases` under your home folder).

---

## Notes

::: warning Images and scans yield text only
Images are read with OCR, which recovers text but not charts or layout. Scanned PDFs have no text layer, so their content cannot be extracted yet.
:::

::: tip Keep it focused
A knowledge base works best with the documents you actually want the AI to consult. Dropping in a whole project folder or lots of unrelated files makes the useful parts harder to find.
:::
