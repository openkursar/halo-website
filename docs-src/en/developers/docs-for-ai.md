---
title: "Docs for AI tools: llms.txt and Markdown pages"
description: "Docs for AI tools: where Halo publishes llms.txt, full-text bundles and a Markdown copy of every page, and how Halo's own assistant reads its guides."
type: reference
audience: [developer]
related: [features/operate-halo, developers/api/]
---

# Docs for AI tools

These files are built from the same source as the pages on this site and are regenerated every time the docs are published, so they always match the pages you see. All paths below are relative to this documentation site.

## The files {#files}

| File | Path | Contents |
|---|---|---|
| Chinese index | `/docs/llms.txt` | One line per page: title, Markdown URL and a one-sentence summary. It opens with instructions for AI assistants. |
| English index | `/docs/en/llms.txt` | The same, for the English pages. |
| Chinese full text | `/docs/llms-full.txt` | The Markdown of every Chinese page, in sidebar order. |
| English full text | `/docs/en/llms-full.txt` | The same, for the English pages. |
| One page as Markdown | Replace `.html` at the end of a page URL with `.md` | For example, `/docs/en/features/memory.html` becomes `/docs/en/features/memory.md`. A folder page that ends in `/` becomes `index.md`, for example `/docs/en/getting-started/index.md`. |
| Halo assistant guides | `/docs/ai-guides/index.md` | The guides Halo's built-in AI reads, in English, starting from this index. |

The full-text files leave out the docs home and the pages under "Use cases & comparisons". The Markdown version of the docs home is the llms.txt of the same language.

<!-- public:start -->
On the public site, paths start with `https://hello-halo.cc/docs/`, for example `https://hello-halo.cc/docs/en/llms.txt`. The site root `https://hello-halo.cc/llms.txt` is a short product summary that links to both indexes and both full-text files.
<!-- public:end -->

## What a Markdown page contains {#markdown-pages}

Each Markdown file starts with a block of YAML metadata, followed by the text.

| Field | Meaning |
|---|---|
| `title` | Page title |
| `description` | One-sentence summary, the same as the line under the page title |
| `type` | Page type: `tutorial`, `how-to`, `reference`, `explanation`, or `hub` for a section home |
| `audience` | Intended readers: `beginner`, `office` (office users), `developer`, `admin` |
| `since` | The version a feature first appeared in, only where it matters |
| `platforms` | The platforms a feature is limited to, when it is not available everywhere |
| `prerequisites`, `related` | Pages to read first and related pages, as page paths |
| `lang` | `zh-CN` or `en` |
| `last_updated` | When the page was last changed |
| `source` | The Halo version the docs describe |

<!-- public:start -->
Files on the public site also have a `canonical` field with the full URL of the matching page.
<!-- public:end -->

The text matches the page, with a few changes for plain text:

- The summary line under the page title becomes the first paragraph after the title.
- Links to other pages point at those pages (`.html`).
- "Just tell Halo" blocks, "Done" blocks and callouts stay as `::: say`, `::: done` and `::: tip` blocks, so both readers and programs can recognize them.
- Content that switches by platform gets one small heading per platform, such as `#### macOS`.
- Screenshots stay as image links. Comments in the page source never appear in the Markdown version.

## Copy page {#copy-page}

Every docs page has **Copy page** at the top right. It copies the page's Markdown version to the clipboard, ready to paste into any AI assistant. The **More** menu next to it also has:

- **View as Markdown**: opens the page's Markdown version in a new tab.
- **Ask in Halo**: copies the start of a question about the page's topic. Paste it into Halo's message box and finish your question.

<!-- public:start -->
On the public site, the **More** menu also has **Open in ChatGPT** and **Open in Claude**. They start a new conversation on that site and ask it to read the page's Markdown version first.
<!-- public:end -->

## How Halo's own AI reads the docs {#halo-assistant}

Before Halo's AI answers a question about Halo itself, it reads the official "Halo assistant guides" instead of answering from memory. The guides are English documents written for the AI and live under `/docs/ai-guides/` on this site, starting from `index.md`. They explain how each feature works, the order in which to troubleshoot, and which steps you must do yourself in the app.

- **Where it can read them**: in any conversation, Digital Human chat and scheduled run, Halo can read the guides with its built-in docs tool. The tool can only read `.md` files under `/docs/ai-guides/`.
- **Current content**: the tool reads from the documentation site live. A guide read again within 10 minutes is served from the earlier read.
- **Offline**: when the documentation site cannot be reached, the tool reads the copy of the guides that ships with the app. That copy is a snapshot from when your Halo version was released and may be older than the site; the tool then notes that the content came from the offline copy.
- **Company builds of Halo** can point it at the company's own documentation site (`officialContent.baseUrl` in `product.json`).

### Docs mirror {#agent-mirror}

Each time the docs are published, plain-text copies of the pages on this site are written under `/docs/ai-guides/docs/`, where Halo's AI can read them with the same tool:

- The entry point is `docs/index.md`. Chinese pages are under `docs/zh/`, English pages under `docs/en/`.
- In the copies, links to other pages point into the mirror and screenshots are replaced by their descriptions, so the AI can keep reading.
- The generated HTTP API reference is not mirrored. With **Operate Halo** on, Halo's AI calls those operations through its own API manual.
- The mirror exists only on the documentation site, not in the offline copy that ships with the app.

## Pointing other AI tools at Halo's docs {#other-ai-tools}

- **For one specific question**: give an AI that can read web pages the Markdown URL of the relevant page, or click **Copy page** on that page and paste it in.
- **To give an AI an overview of the product**: give it the llms.txt URL. It can pick the pages it needs from the index.
- **To read all the docs at once**: give it the llms-full.txt URL. The full text is long, so use a tool that handles long documents.

## Related pages {#related}

- [Let the AI operate Halo](/en/features/operate-halo): what the AI can change for you once Operate Halo is on.
- [HTTP API overview](/en/developers/api/): call Halo from your own scripts and services.
