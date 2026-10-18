---
title: "A Digital Human did not run: missed runs"
description: "When a Halo Digital Human misses its schedule, shows Not started, stops after repeated failures or stays queued, find the cause and get it working again."
type: how-to
audience: [office]
related: [digital-humans/triggers, digital-humans/manage, digital-humans/keep-running, troubleshooting/channels]
---

# A Digital Human did not run

::: say
> Why didn't the News Assistant run this morning?

Halo checks the Digital Human's status, its last and next run times, and whether a question is waiting for you, then tells you the cause and what to do. Ask in the workspace the Digital Human lives in.
:::

## It didn't run on schedule {#schedule-missed}

Check, in order:

1. Halo is running and the computer is awake. A run that came due while the computer slept runs once when it wakes (even if several were missed); runs that came due while Halo was quit are not made up, so click **Run now** if you need one. On Linux, closing the window quits Halo. See [Keep Digital Humans running](/en/digital-humans/keep-running).
2. It isn't paused. If the status is **Paused**, click **Enable automatic tasks**.
3. It didn't stop itself after repeated failures. After 5 failed runs in a row, Halo stops its automatic tasks and shows "Stopped itself after repeated failures". Look at why the recent runs failed, fix that, then click **Resume work**.
4. No question is waiting for you. While it has an unanswered question, scheduled runs that come due are skipped; once you answer, that piece of work finishes and the schedule carries on as usual. Answer it at the top of **Work activity** or in the **Tasks** panel.
5. The previous run has finished. If a run is still going when the next time comes, that time is skipped; the run's entry says "N scheduled runs came due during this run and were skipped."
6. With "Only on mainland China working days" on, check whether today is a public holiday. If the holiday calendar doesn't cover today, the run is skipped and Work activity says "The holiday calendar does not cover today, so this scheduled run was skipped. Run it manually if needed."

To set the schedule itself, see [Schedules and triggers](/en/digital-humans/triggers#schedule).

## A run shows "Not started" {#not-started}

A connection it declares wasn't ready, so the run didn't start. The entry names the connection and the reason:

| It says | What to do |
|---|---|
| "‹name›: not installed" | Install the connection under **Tools & Resources** |
| "‹name›: turned off" | Turn it on under **Tools & Resources** |
| "‹name›: waiting for sign-in" | Finish signing in as prompted |
| "‹name›: connection failing" | Check the connection's settings, or try again later |

Click **Open Tools & Resources** on the entry to go straight there. When it's fixed, click **Run now** to try again.

## It says "Log in to … before running" {#needs-login}

A website it uses was never signed in, or the sign-in expired. Work activity shows "Log in to ‹site› before running": click **Open to log in**, or click **Browser** at the top right of the Digital Human's page, sign in to that site in the window that opens, then click **Run now**.

## A run failed {#run-failed}

- If the entry has **Continue**, click it to have the Digital Human carry on.
- A run that was going when Halo quit or crashed is marked failed the next time Halo opens; you can click **Continue** on it too.
- To see exactly what it did, click **View process**. Each Digital Human keeps the full process of its latest 200 runs; older ones say "The detailed process of this run was cleared under the retention rule. Its result stays on the timeline."

## Run now is greyed out, or it stays queued {#queued}

- While it's running or already queued, **Run now** can't be clicked. You can stop a running one with **Stop this execution**.
- Halo runs at most 10 independent runs at once; the rest queue in order.

## It doesn't answer bot messages {#im}

See [Bot not replying](/en/troubleshooting/channels). **Pause automatic tasks** doesn't affect chats or bot messages.

::: done
The Digital Human's page shows a "Next run" time, and a new run appears in Work activity.
:::

## Next steps {#next-steps}

- [Runs and management](/en/digital-humans/manage): see what each run did and answer its questions.
- [Schedules and triggers](/en/digital-humans/triggers): change when it runs.
