---
title: "Digital Human Collaboration: teams that split work"
description: "Let several Halo Digital Humans team up on a bigger job: start a temporary collaboration in one sentence, keep it, and bring in colleagues' Digital Humans."
type: explanation
audience: [office]
since: "3.0"
related: [digital-humans/team-workbench, digital-humans/saved-teams, digital-humans/cross-computer-teams]
---

# Digital Human teams

::: say
> Put together a small team: one researcher, one writer and one reviewer, and get me a comparison report on three note-taking apps.

Halo assembles a temporary team in the current workspace and gives each member a role. A team panel appears below the conversation showing what each member is doing; members' reports arrive in the conversation, and Halo hands you the result at the end.

**Prerequisite**: **Team Collaboration** under **＋ › Capabilities** in the message box must be on. It's on by default in new conversations.
:::

One AI doing everything has limited attention. Splitting the work lets each member handle one stage, hand over to the next and check each other. Halo's teams work that way: several Digital Humans do the work, and you set the direction and make the decisions.

## When a team is worth it {#when}

- The job splits into parts that can run in parallel, such as researching several subjects.
- It needs different roles, such as one writer and one reviewer.
- The work needs checking, such as verifying data and conclusions.

Simple tasks are faster in a plain conversation: each extra member uses more model quota. Halo also forms a team only when it's worth it.

## Two kinds of team {#two-kinds}

| | Temporary collaboration | Saved team |
|---|---|---|
| Where it comes from | You ask Halo for a team in a conversation | Created under **Digital Humans › Teams**, or a temporary collaboration you kept |
| Who coordinates | The conversation itself | The team's own lead |
| Members | New members Halo creates for this job, up to 5 | Your Digital Humans, and colleagues' Digital Humans from their computers |
| Where you follow it | The team panel below the conversation, or the team view in the canvas | The team workbench under **Digital Humans › Teams** |
| Scheduled runs | No | Yes |

## Start a temporary collaboration in one sentence {#start}

1. In a conversation, click **＋** in the message box and check that **Team Collaboration** under **Capabilities** is on.
2. Say what you want. You can describe how to split the work, or leave it to Halo.
3. Once the team is formed, a panel below the conversation reads "Team: name · N/M working", with one row per member showing their status and what they're doing.
4. Members' reports appear in the conversation as collapsed messages labelled with the member's and the team's names. Expanded, they say "Sent by a team member, not by you".
5. To see the team's full conversation, click **Open team view** on the panel. It opens in the canvas on the right.

You can keep talking to Halo about other things while the team works. When everything is done, the panel says "finished".

![The team panel below a conversation: the team name and "0/2 working", one row for each of the two members with its current task, and "Open team view" on the right](/images/digital-humans/collaboration/team-panel.en.webp)

### When a member needs your decision {#decisions}

When a member hits something the team can't decide, it asks you. Its status on the panel changes to "waiting for your decision"; open the team view to see the question and answer it.

## Keep the team {#keep}

If you like how it worked, keep the temporary collaboration as a standing team:

- click **Keep this team** at the top of the team view, or
- tell Halo: "Keep this team for later."

![The team view of a temporary collaboration: the Temporary collaboration tag and the Keep this team button at the top right, team messages in the middle and three members on the right](/images/digital-humans/collaboration/team-view.en.webp)

The team then appears under **Digital Humans › Teams**. Once this collaboration has finished, it can take tasks of its own and run on a schedule. See [Saved teams and schedules](/en/digital-humans/saved-teams).

::: warning One temporary collaboration per conversation at a time
If you form a new team in the same conversation, the previous temporary collaboration (finished but not kept) is dissolved, and the members Halo created for it are deleted. To keep it, keep it first.
:::

## Hand work to a saved team {#delegate}

In a conversation, just say:

> Have the competitor research team do another round, this time with a price comparison.

> How is the competitor research team doing?

Halo passes the job to that team's lead and stays with you; when you ask for progress, it sums up the team's tasks, results and decisions waiting for you. Only teams in the current workspace are available here.

## Colleagues' Digital Humans can join too {#across-computers}

A saved team can invite colleagues to bring their own Digital Humans. Each runs on its owner's computer, and data stays on each computer. See [Teams across computers](/en/digital-humans/cross-computer-teams).

::: info Want programs to call Digital Humans over HTTP?
To have programs or other systems call Digital Humans through Halo's HTTP API, see [API recipes](/en/developers/api/recipes).
:::

## Next steps {#next-steps}

- [The team workbench](/en/digital-humans/team-workbench): tasks, results and the decisions waiting for you.
- [Saved teams and schedules](/en/digital-humans/saved-teams): build a team by hand and give it a schedule.
- [Teams across computers](/en/digital-humans/cross-computer-teams): invite colleagues and their Digital Humans.
