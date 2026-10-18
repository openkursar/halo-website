---
title: "Create a Digital Human: three ways"
description: "Create a Digital Human in Halo: tell Halo what it should do, install a ready-made one from the Store, or build one with a form or an imported file."
type: how-to
audience: [office, beginner]
related: [digital-humans/triggers, digital-humans/store, digital-humans/channels]
---

# Create a Digital Human

::: say
> Set up a Digital Human that sums up the previous day's tech news in 5 points every weekday at 9 am.

Halo first reads the official guide for creating Digital Humans, asks you a few questions (when it should run, where results go, whether to post them to a group), then creates the Digital Human in the current workspace and tells you it's ready. It then appears under **Digital Humans › My Digital Humans**.
:::

The Digital Human is created in the workspace where you ask. The more specific you are, the better: what it should do each time, how often, who gets the result, and when it should check with you first. Where something is unclear, Halo asks; it never guesses a schedule.

![A conversation in the Halo Workspace: Halo asks about the run time, the content and where results go, then creates a daily news brief Digital Human and sums up its schedule and where to see results](/images/digital-humans/create/create-by-chat.en.webp)

## Before you start {#before-you-start}

- [Connect an AI model](/en/getting-started/setup-ai).
- For a Digital Human that takes requests or posts results in WeCom, Feishu or WeChat, you also need a bot. You can create the Digital Human first and see [Message channels overview](/en/digital-humans/channels) afterwards.

## Four ways to create one {#ways}

| Way | Best when |
|---|---|
| Tell Halo (above) | Most of the time; no configuration knowledge needed |
| [Install from the Store](#from-store) | You want a ready-made Digital Human and only fill in a few settings |
| [Use the form](#form) | You want to write the job description yourself, field by field |
| [Import a file](#import) | A colleague shared a Digital Human file with you |

## Install from the Store {#from-store}

1. Click **Store** on the left rail, switch to the **Digital Human** tab, and click a card to see its details.
2. Click **Install**.
3. Choose the workspace to install it in. A Digital Human goes into one workspace; if you have only one, there's nothing to choose.
4. If it has settings to fill in, click **Next**, fill in the required ones as the card describes, then click **Install**; if it has none, just click **Install**.
5. When the button says **Installed**, click **Use** to open it.

More in [Store](/en/digital-humans/store).

## Use the form {#form}

1. Click **Digital Humans** on the left rail, then **Create Digital Human** in **My Digital Humans**.
2. Stay on the **Visual** tab and fill in:
   - **App Name**, **Description** and **Author**;
   - **System Prompt**: the Digital Human's job description, which it follows on every run.
3. The **Schedule** switch is on by default, with a run every hour. Change the timing as you need, or turn it off (then it works only when you run it or a bot message arrives). How to set the timing: [Schedules and triggers](/en/digital-humans/triggers).
4. Choose a model (it follows the global setting by default) and pick a workspace under **Install to**. You can also create a new workspace right there.
5. Click **Create Digital Human**.

![The Visual tab of the Create Digital Human dialog: App Name, Description, Author, System Prompt, and the Schedule switch turned on with interval choices](/images/digital-humans/create/create-dialog.en.webp)

How to write the **System Prompt**: say who it is, the few things it does on each run, the format of the result and who gets it, and when it should ask you first. For example:

```text
You compile tech news every day. On each run:
1. Search for the previous day's AI and internet news;
2. Pick the 5 most important stories, summarize each in one sentence, and add the source link;
3. Put the result together as a short brief.
If there's no news worth reporting that day, say "No important news today."
```

For every field in the YAML, see the [Digital Human spec reference](/en/developers/digital-humans/spec).

## Import a file {#import}

1. In the **Create Digital Human** dialog, switch to the **Import** tab.
2. Drag the file onto "Drop a digital human file here". `.zip`, `.dhpkg` and `.yaml` are supported; you can also click **Browse folder...** to pick a folder.
3. Check the preview, choose a workspace under **Install to**, and install. "Installation complete" means you're done.

Skills included in the file are installed along with the Digital Human.

::: done
The Digital Human appears under **Digital Humans › My Digital Humans** as **Standing by** or **Running**. Open it to see its runs in **Work activity**; to try it right away, click **Run now**.
:::

## Troubleshooting {#troubleshooting}

### "A digital human with the same name already exists in this workspace"

A workspace can't have two Digital Humans with the same name. Use another name, or uninstall the old one first.

### It was created in the wrong workspace

Open the Digital Human, click **⋮** at the top right, and choose **Move to another workspace**. Files and history stay where they are; new work starts in the new workspace.

### You asked Halo, but it didn't create anything

Make sure you asked in a conversation (not during another Digital Human's scheduled run). Also, **Digital Humans** under **Settings › Advanced › Built-in MCP Extensions** must be on (it is by default); when it's off, Halo can't create or manage Digital Humans for you.

## Next steps {#next-steps}

- [Schedules and triggers](/en/digital-humans/triggers): have it work at set times, or only on working days.
- [Message channels overview](/en/digital-humans/channels): let it take requests and report in WeCom, Feishu or WeChat.
- [Runs and management](/en/digital-humans/manage): see what it did and answer its questions.
