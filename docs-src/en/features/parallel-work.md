---
title: "Parallel work: run several conversations at once"
description: Run several Halo conversations side by side, add instructions while the AI works, follow progress in the task panel, and hand bigger jobs to a team.
type: how-to
audience: [developer, office]
related: [features/tasks, features/cross-conversation, digital-humans/collaboration]
---

# Work on several things at once

::: say
> Ask the deploy conversation that's running how it's going

Halo finds that conversation in the current workspace, sends it the question, waits for the answer, and tells you where things stand. The message on the other side is labelled "From conversation", so it is never mistaken for something you said.

**Prerequisite**: both conversations are in the same workspace. This is on by default; nothing to set up.
:::

## Run several conversations and workspaces {#several-conversations}

While one conversation works, you can move on to something else. Switching conversations or workspaces never interrupts a running reply; the reply keeps going in the background.

1. Click **New** at the top of the conversation list to start a second task. The first conversation keeps running, and the blue dot next to it in the list shows it is still working.
2. To switch to another project, click the workspace name on the left of the header (tooltip "Current workspace: … — click to switch") and pick a workspace from the dropdown. The list is sorted by recent use, with the [Halo Workspace](/en/features/spaces#halo-workspace) pinned on top.
3. Go back to any conversation and you see where it is right now, including a reply that is still being written.

Each conversation has its own model, so one conversation can use a fast model for research while another uses a stronger one for code. See [Models and accounts](/en/features/models#model-per-conversation).

Each workspace has its own set of canvas tabs. When you switch workspaces, the canvas swaps to that workspace's tabs; unsaved edits and running terminals are kept and are still there when you switch back. For the canvas itself, see [Files and the canvas](/en/features/files-and-canvas).

Closing the window doesn't stop the work: on macOS and Windows the window hides to the tray and conversations and Digital Humans keep running. On Linux, closing the window quits Halo and the work stops. See [Work keeps running when the window is closed](/en/features/tasks#window-closed).

## Active Conversation Limit <Badge type="info" text="Desktop only" /> {#active-limit}

Halo keeps a set of recently used conversations ready to answer at once. Every resident session (including Digital Human, IM and team member sessions) holds one AI process in memory. **Settings › Advanced › Active Conversation Limit** sets how many it keeps.

| Item | Value |
|---|---|
| Range | 2–50 |
| Default | 20 |
| Over the limit | The least recently used idle conversations pause first and resume automatically on your next message. Nothing is lost |
| A conversation mid-reply | Never paused. If every conversation is busy, a new one still starts and the limit is exceeded for a while |
| Low memory | When available system memory drops below 15%, the limit is halved automatically |

If your computer has little memory and you often keep many conversations open, lower the limit. Every setting is described in the [Settings reference](/en/features/settings#limits).

## Add information while Halo works {#add-while-working}

You don't have to wait for Halo to finish. While it works, keep typing and sending; the Send button then reads "Add to queue".

1. Type the extra detail, for example "only use the East region data", and send it. It appears under the running reply, marked **Queued**.
2. Halo reads it as soon as it finishes its current step. The mark changes to **Appended**, and Halo carries on with the new instruction.

A queued message can't carry images and can't be edited or withdrawn. If you press Stop before Halo reads it, it is marked **Stopped, not handled** and never runs. Details: [Conversations › Keep adding while Halo works](/en/features/conversations#queue).

## Follow the progress of each task {#follow-progress}

You don't need to open conversations one by one. Two places show everything at a glance:

- **Status dots**: the small dot at the start of each row in the conversation list.

  | Color | Meaning |
  |---|---|
  | Blue | Working |
  | Amber | Waiting for your answer |
  | Green | Finished, not seen yet |
  | Red | Error |
  | No dot | Idle |

- **Task panel**: click **Tasks** at the bottom of the nav rail. Work from every workspace is in this one list, grouped into **Needs you**, **Running** and **Pinned**. Click a row to go back to that task; Halo switches workspace if needed. See [The task panel](/en/features/tasks).

To get a "task complete" system notification while the Halo window is not in front, first turn on **Settings › System › Task Notifications**. It is off by default. See [Task-complete notifications](/en/features/tasks#notifications).

## Ask other conversations for progress, or hand over results {#ask-other-conversations}

Conversations in the same workspace can talk to each other. Tell Halo what you want:

- Ask for progress: "Ask the deploy conversation that's running how it's going"
- Hand over a result: "Tell the 'frontend redesign' conversation about this decision"
- Look up a decision: "What did we decide in the 'DB choice' conversation?"

You can also click **＋ › Context › Reference a conversation** in the composer, or type `@`, and pick the conversation.

If the other conversation is busy, the message is delivered after it finishes its current turn. Halo waits up to 120 seconds for a reply by default (300 seconds at most) and tells you if no answer came back. Conversations in different workspaces can't message each other. For the rules, rate limits and the switch for Digital Human chats, see [Conversations that work together](/en/features/cross-conversation).

## Hand a bigger job to a team {#hand-to-a-team}

When a job splits into parts that can run in parallel, or needs someone to review it, ask Halo to put together a temporary team.

::: say
> Put together a small team: one to research, one to write, one to review, and produce a competitor report

Halo assembles a temporary team of 1–5 members and coordinates it itself, while the members work in the background. A panel such as "Team: name · 2/3 working" appears at the bottom of the conversation, one row per member with a status dot. Member reports arrive in the conversation, marked as sent by a team member.

**Prerequisite**: **Team Collaboration** is on under **＋ › Capabilities** in the composer. New conversations have it on by default (if you turned it off before, new conversations keep your last choice).
:::

- Click **Open team view** on the panel to follow the team in the canvas.
- A conversation can have only one temporary team at a time. To keep working with this team later, click **Keep this team** at the top of the team view.
- You can hand work straight to a saved team in the current workspace: "Give this request to the competitor team".

How teams split work and how to answer members' questions: [Digital Human teams](/en/digital-humans/collaboration).

## Hand recurring work to a Digital Human {#recurring-work}

Work you do every day or every week doesn't need a new conversation each time. Give it to a [Digital Human](/en/digital-humans/overview): it runs on its own on a schedule or when an event happens, reports the results to you, and doesn't tie up the conversation you are using. Questions waiting for your decision show up under **Needs you** in the task panel. To set when it runs, see [Schedules and triggers](/en/digital-humans/triggers).

## Patterns that work {#patterns}

| Pattern | Why |
|---|---|
| One workspace per project | Files, memory and Digital Humans stay with their project, and "the deploy conversation" always means the right one |
| Split conversations by topic, not by step | The full story of one task stays in one conversation, so Halo doesn't have to keep reading other conversations |
| Give long-running work its own conversation | Deploys and batch jobs aren't interrupted by unrelated questions; ask them for progress when you need it |
| Give parallel work to a team | Research, writing and review run at the same time; you only read reports and make decisions |
| Give recurring work to a Digital Human | It runs on time by itself, with no message to remember |
| Don't watch every step | Status dots and the task panel tell you which task needs you |

## Limits and costs {#limits}

The more you run at once, the more it costs.

| Item | Detail |
|---|---|
| Model usage | Every working conversation, team member and Digital Human calls the model and uses its own tokens |
| Digital Human runs at once | At most 10 across Halo; extra runs wait in order and show "Queued" in the task panel |
| One Digital Human | Runs one run at a time |
| Scheduled runs starting together | At most 5 due schedules start at the same moment |
| Team members working at once | **Settings › Advanced › Digital Team Concurrency Limit**, default 10, range 1–100 <Badge type="info" text="Desktop only" /> |
| Conversations kept ready | See [Active Conversation Limit](#active-limit) above |

Run rules for Digital Humans: [Runs and management › Limits](/en/digital-humans/manage#limits).

::: done
When several conversations in the list show a blue dot and the task panel lists them under **Running**, those tasks are moving at the same time.
:::

## Troubleshooting {#troubleshooting}

### Halo says it can't find the conversation I asked about

Conversations can only talk to each other inside one workspace. Switch to the workspace that holds that conversation and ask again. If several conversations share a title, Halo lists the candidates for you to choose.

### My computer got slow after opening many conversations

Each conversation kept ready uses memory. Lower **Settings › Advanced › Active Conversation Limit**: the least recently used idle conversations pause first and resume on your next message, with nothing lost. See [Active Conversation Limit](#active-limit).

### A Digital Human run stays "Queued"

Halo runs at most 10 Digital Humans at once, and each Digital Human runs one run at a time. It starts by itself once an earlier run finishes.

### The extra message I sent was never handled

If you pressed Stop before Halo read it, the message is marked **Stopped, not handled**. Send it again.

### The work stopped when I closed the window

On Linux, closing the window quits Halo. To keep work running in the background, leave the window open (minimizing is fine).

## Next steps {#next-steps}

- [The task panel](/en/features/tasks): see what is running and what is waiting for you
- [Conversations that work together](/en/features/cross-conversation): the full rules for reading, asking and handing over
- [Digital Human teams](/en/digital-humans/collaboration): let a team split up a big job
