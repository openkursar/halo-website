---
title: AI digital workers that run on your computer
description: "Create AI digital workers with Halo: describe the job and how often, and it works on schedule, reports to WeCom, Feishu or email, and asks before decisions."
type: landing
audience: [office, beginner]
edition: public
related: [digital-humans/overview, digital-humans/create, digital-humans/collaboration]
---

# AI digital workers

An AI digital worker is an AI that stays on duty and does its job on a schedule. In Halo it is called a Digital Human: tell it what to do and how often, and it runs on time and hands you the results. When something needs your call, it asks you first. Halo is open-source software, and Digital Humans run on your own computer.

## What digital workers are good at {#good-fit}

- Collecting the news from a few sites every morning and posting a summary to a WeCom group
- Turning this week's spreadsheet data into a weekly report every Friday
- Sorting and filing new files as soon as they land in a folder
- Answering colleagues' common questions in WeCom or Feishu
- Checking a price or a notice on a web page and telling you when it changes

These jobs are regular and rule-based. Decisions that need judgment, or that a person must answer for, stay with you. For more examples by job, see [Use cases](/en/use-cases/).

## Three ways to create one {#create}

1. **Tell Halo.** Describe what you need in any conversation, for example:

   > Set up a Digital Human: every weekday at 9:00, collect the price changes on three competitors' websites and post them to our WeCom group.

   Halo asks which sites and which group, then sets it up. Posting to a WeCom group needs a [WeCom bot](/en/digital-humans/wecom-bot) connected first.
2. **Install one from the Store.** Pick a Digital Human someone else built, install it into your workspace and fill in a few settings.
3. **Fill in the form.** Go to **Digital Humans › My Digital Humans** and click **Create Digital Human**.

See [Create a Digital Human](/en/digital-humans/create) for the details.

## When it works {#when-it-works}

- **Schedule**: at an interval, or at set times every day, week or month. Turn on **Only on mainland China working days** to skip public holidays and run on make-up working days.
- **Events**: a file changes in a folder, a webhook arrives, or someone messages it in WeCom, Feishu or WeChat. To connect a bot, see [Message channels](/en/digital-humans/channels).
- **By hand**: click **Run now** at any time.

See [Schedules and triggers](/en/digital-humans/triggers) for the settings.

## How results reach you {#results}

- **Work activity** on the Digital Human's page records every run and its result; see [Runs and management](/en/digital-humans/manage).
- Questions that need you appear under **Needs you** on its page and in the **Tasks** panel. If you connected a WeCom, Feishu or similar bot, the question also goes to the bot's owner as a direct message, and the owner can answer in plain words. See [who can answer the Digital Human's questions](/en/digital-humans/permissions#questions).
- With **IM Push** on, it can send results to your WeCom, Feishu or WeChat contacts once the matching bot is connected, for example a [Feishu bot](/en/digital-humans/feishu-bot); it can also notify you by email or webhook.

## Too much for one: build a team {#teams}

Since 3.0, Digital Humans can work as a team: a lead splits the work, members take their parts, and the lead brings the results back to you. With **Team Collaboration** on in a conversation (it is on by default), the AI forms a temporary team for complex tasks; click **Keep this team** to keep it. Colleagues' Digital Humans can join from their own computers.

![The workbench of the Digital Human team "Market research team": the task list on the left, one task's conversation and the members' collaboration messages in the middle, and the two members on the right](/images/digital-humans/team-workbench/workbench.en.webp)

See [Digital Human teams](/en/digital-humans/collaboration).

## Good to know {#good-to-know}

- **Halo has to be running.** On macOS and Windows, closing the window keeps Digital Humans working in the background; on Linux, closing the window quits Halo. The computer has to stay on and awake; see [Keep Digital Humans running](/en/digital-humans/keep-running).
- **Every run uses the model.** Work activity shows the tokens each run used.
- **Repeated failures pause it.** After 5 failed runs in a row, the Digital Human pauses; fix the cause, then turn it back on.

## FAQ {#faq}

### How is a digital worker different from RPA?

RPA repeats recorded clicks, so it tends to break when a page changes. A Digital Human decides each time what to do, so it can adapt; the trade-off is that every run calls the model and the result is not identical every time. For fixed, high-volume steps that must never vary, a script or RPA fits better.

### Does my computer have to stay on?

Yes, Digital Humans work while Halo runs. To keep them online all day without tying up your own computer, run Halo as a headless [Halo Server](/en/server/).

### Do I need to code?

No. Describe the job in plain words and Halo sets it up. If you prefer, you can edit a Digital Human's YAML directly.

## Next steps {#next-steps}

- [Digital Humans overview](/en/digital-humans/overview): what a Digital Human is and how it runs
- [Create a Digital Human](/en/digital-humans/create): set up your first one
- [Digital Human teams](/en/digital-humans/collaboration): have several Digital Humans share the work
