# Spaces

A Space is the fundamental isolation unit for tasks in Halo. Each space has its own independent conversation history, file context, and AI state — completely separate from one another.

## Two Types of Spaces

### Halo Space (Temporary Space)

No folder binding required — open one instantly. Best for:

- Quick Q&A and brainstorming
- Rapidly testing an idea
- Tasks that don't need a fixed project directory

Conversation history is preserved, and the AI has full Agent capabilities — identical permissions to a Dedicated Space. The only difference is that there is no bound directory; the AI uses the current working directory as its base for file operations.

---

### Dedicated Space

Linked to a local directory. The AI can directly read, write, and edit files inside that directory. Best for:

- Code development projects
- Collections of files that need ongoing maintenance
- Any scenario where AI needs to operate on local files

::: tip
Think of each space as "a folder the AI can freely operate in" — it can create, delete, and edit any file within it.
:::

---

## Creating a Space

1. Click the **"+"** button in the left sidebar
2. Choose "Temporary Space" or "Link a project folder"
3. If linking, select the local directory

Spaces are stored by default under `~/.halo/spaces/`.

---

## Deleting a Space

When you delete a Dedicated Space, **only Halo's own data is deleted** (conversation history and configuration) — your linked project files are unaffected.

---

## Running Multiple Spaces in Parallel

This is one of Halo's core features. All space tasks execute independently in the background without blocking one another. You can have multiple spaces open, switch between them freely, and advance multiple projects simultaneously.

Halo's **top-left corner shows a real-time count of currently running parallel tasks**, so you always have a clear overview of overall progress.

<!-- Screenshot placeholder: screenshot-parallel-tasks.png (parallel task indicator in the top-left corner) -->

A typical workflow:
- Space A: Ask AI to refactor a module — switch away without waiting
- Space B: Ask AI to draft product documentation
- Space C: Ask AI to research competitor information
- Switch back and forth, review progress, and keep issuing instructions

::: info Best Practice
Use separate spaces for different projects to prevent AI from operating in the wrong directory. Open a new space for ad-hoc questions to avoid polluting the context of ongoing project work.
:::
