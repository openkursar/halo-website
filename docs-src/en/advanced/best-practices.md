---
title: "Best practices: workspaces, context and models"
description: "Best practices for Halo: one workspace per project, one topic per conversation, tidy memory, the right model and Deep Thinking level, and a few safety habits."
type: explanation
audience: [office, developer]
related: [features/spaces, features/memory, features/models, features/parallel-work]
---

# Tips and best practices

Each tip says what to do and why; the details live on the linked pages. These tips apply to Halo 3.0.4.

| I want to… | Read this tip |
|---|---|
| Keep each project's conversations, files and memory apart | [One workspace per project](#one-workspace-per-project) |
| Stop a long conversation from drifting off course | [Keep context clean](#context) |
| Make Halo remember a preference or forget outdated information | [Look after memory](#memory) |
| Balance quality, speed and token cost | [Pick a model and a Deep Thinking level](#models) |
| Send a screenshot although the model can't see images | [Images with a model that can't see them](#images) |
| Get answers based on my documents, with sources | [Use a knowledge base for documents you want cited](#knowledge-base) |
| Move several things forward at once | [Work in parallel](#parallel-work) |
| Stop babysitting work that repeats every day or week | [Hand recurring work to Digital Humans](#recurring-work) |
| Avoid unwanted file changes and permissions | [Safety habits](#safety) |
| Keep handing out work when I'm away from my computer | [Use Halo remotely from your phone](#remote) |

## One workspace per project {#one-workspace-per-project}

A [workspace](/en/features/spaces) keeps one project's conversations, files and memory together and apart from other projects.

- Give each code repository or long-running project its own workspace, pointed at its folder. The AI mostly reads and writes inside that folder, so point it only at a folder you're happy for the AI to change.
- For quick one-off questions, use the built-in **Halo Workspace**. Nothing leaks into your real projects.
- For a one-off experiment, create a separate workspace so your real projects stay untouched. Before you delete it, read [Delete a workspace](/en/features/spaces#delete): files kept in the default location are deleted permanently.
- To change topic inside the same project, a new conversation is enough. You don't need a new workspace; see the next tip.

## Keep context clean {#context}

The model rereads the conversation for every reply. The longer a conversation gets, the more likely earlier topics pull it off course, and the more tokens it uses.

- **One topic per conversation.** Write the weekly report and chase a bug in two separate conversations.
- **When a conversation gets long, start a new conversation in the same workspace**, not a new workspace. A new conversation reads the workspace's memory from the start, so lasting decisions carry over. When you need specifics from the old conversation, [reference that conversation](/en/features/cross-conversation).
- **Compaction is automatic.** When the context is nearly full, the engine summarizes the older part, and "Context has been intelligently compressed" appears in the conversation. The token usage number at the bottom right of a reply warns "Approaching context limit" at 80% and "Context will be automatically compressed soon" at 95%. Either warning is a good moment to start a new conversation.
- How to read these signals: [Read a reply](/en/features/conversations#reading-replies).

## Look after memory {#memory}

[Memory](/en/features/memory) is the long-term notes the AI keeps for itself, and it decides what to record. You can also tell it directly, for example:

- "Remember: weekly reports always use tables."
- "Forget the server address I gave you."

Worth knowing:

- **Workspace memory is shared by all conversations in a workspace.** A preference recorded in one conversation is used by new conversations in the same workspace. That is one more reason to keep one workspace per project: preferences from different projects don't mix.
- **Consolidation uses the model and costs tokens.** In the background, the AI tidies memory: it merges duplicates, files knowledge into topics and archives old history.
- **Choose a consolidation cadence that fits.** In **Manage workspaces**, open the workspace card's **⋮ › Edit**, expand **Advanced**, and pick a **Consolidation cadence**:

| Consolidation cadence | Fits when |
|---|---|
| **Diligent** (default) | You want the best recall; uses the model most |
| **Balanced** | Tidying only once memory has grown noticeably is enough |
| **Economical** | Tidying only when memory is large is enough; uses the model least |

- Don't ask the AI to remember passwords, keys or other secrets.

## Pick a model and a Deep Thinking level {#models}

The model and the **Deep Thinking** level are both set **per conversation**, in the model card next to **Send** in the composer. The model you pick is pinned to that conversation and also becomes the default for new conversations.

- **Pick for the task, not the name.** The model card shows **Context window** and **Image input** ("Supported" or "Not supported"). Choose a long context window for long material, and image input when you often send pictures.
- **Higher Deep Thinking levels are slower and use more tokens.** The default is **High**. Turn it down for everyday questions or reformatting; turn it up to **Extra High** or **Max** for hard problems and complex plans.
- When you have light and heavy work at the same time, use two conversations, each with its own model and level.
- A Digital Human's model is changed in its own settings; in its chat the model card is read-only. See [A Digital Human's own model](/en/features/models#digital-human-model).

Step by step: [Models and accounts](/en/features/models).

## Images with a model that can't see them {#images}

You can still send images when the current model has no vision. The composer shows "Current model has no vision — images will be read via local OCR (text only)", and Halo turns on **Text Recognition**, which reads the text in the images on this device.

This recovers text only; the AI cannot see the picture itself. That's enough for an error message or table in a screenshot. To judge colors or layout, switch to a model with image input. Details: [Text Recognition](/en/features/image-input#text-recognition).

## Use a knowledge base for documents you want cited {#knowledge-base}

When you want answers based on your documents, with the source file named, put the documents in a [knowledge base](/en/features/knowledge-base) instead of relying on memory.

- Memory is notes the AI writes for itself; a knowledge base holds documents you collect.
- In a conversation, click **Knowledge** in the composer to load a knowledge base. Answers then show **Sources**; click one to open the original file.
- A knowledge base "learns" by extracting text on this computer. It calls no model and uses no tokens.

## Work in parallel {#parallel-work}

You don't have to wait for one thing to finish before starting the next. Several conversations and workspaces can run at the same time; see [Work on several things at once](/en/features/parallel-work).

- Running tasks and questions waiting for your answer are gathered in the [Tasks](/en/features/tasks) panel.
- While Halo is working, you can keep sending more information. It reaches the AI right after its current step; you don't have to wait for the reply to finish.
- **Don't stare at the thought process.** The thought process above a reply lists every step, but day to day the result is what matters. When a result looks wrong, open it and use **Show tool result** to see which step went astray.

## Hand recurring work to Digital Humans {#recurring-work}

Give work that repeats every day or week to a [Digital Human](/en/digital-humans/overview): it runs on its own schedule and reports back to you. You can tell Halo directly, for example "Make me a digital human that summarizes tech news every weekday at 9am". Halo asks you a few questions first, then sets it up.

- Reminders are set in a Digital Human's chat; see [Reminders](/en/digital-humans/reminders).
- When a job has several stages, such as research, writing and review, have Halo put together a [team](/en/digital-humans/collaboration) to split the work, for example "Put together a small team (researcher, writer, reviewer) to produce a competitor report".

## Safety habits {#safety}

When you use Halo yourself, the AI runs commands and changes or deletes files **without asking each time**. The **Permissions** card in **Settings › System** shows **Full Permission Mode**, and **Trust Mode** is always on and cannot be turned off. So:

- **Back up, or commit with Git, before big edits.** If something breaks, you can go back. For code projects, review and commit changes in [Changes](/en/features/code-review).
- **Keep Operate Halo off when you don't need it.** **Operate Halo** is off by default. When it's on, the AI can change every workspace, Digital Human and team in this Halo, and deletes have no confirmation dialog. New conversations keep the switches you last set, so turn it off again in **＋ › Capabilities** when you're done. See [Let the AI operate Halo](/en/features/operate-halo).
- **Use a strong Remote Access password.** Anyone with the access password has full control of this Halo. A custom password must be 8–64 characters with upper- and lowercase letters and a digit. Turn Remote Access off when you don't use it.

More: [Security, privacy and data flow](/en/advanced/security).

## Use Halo remotely from your phone {#remote}

You can keep handing work to Halo when you're away from your computer: check progress on the way home, answer its questions, or add a request between meetings.

- Turn on [Remote Access](/en/features/remote-access) on your computer, then connect from a phone browser or the Android app. There is no iOS app; on an iPhone, use the browser.
- The work always runs in Halo on your computer, so the computer must stay on with Halo running.
- Some features are desktop-only, such as choosing folders. What works on a phone: [Halo on your phone](/en/features/mobile).

## Next steps {#next-steps}

- [Workspaces](/en/features/spaces): create a workspace, point it at a folder, switch and delete
- [Memory](/en/features/memory): how workspace and Digital Human memory is recorded, tidied and cleared
- [Models and accounts](/en/features/models): add accounts, choose a model per conversation, set Deep Thinking
