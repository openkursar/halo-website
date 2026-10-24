---
title: "Decentralized AI agent teams: Raft-style consensus"
description: "Halo's AI agent teams (Digital Humans) run on members' own computers. No central server holds team state; a Raft-style host rotates, so the board never forks."
type: explanation
audience: [developer, admin]
since: "3.0"
related: [digital-humans/cross-computer-teams, advanced/federation-gateway, advanced/security]
---

# Decentralized AI agent teams

A Halo team can span several computers. Each person's Digital Humans (long-running AI agents that keep working on their own) run on their own computer, with the engine and model that person set up, and the team works together without any vendor's server in between. Below is how the team stays consistent without a central server, and the trade-offs behind it.

## Why it is needed {#why}

When coding agents such as Claude Code, Codex or DeepSeek dsh work as a team, the members usually sit on one computer and share its file system to track tasks and pass results.

Halo spreads the members across their own computers, so there is no shared place like that. One computer has to keep the team's board: its tasks, findings and record of who did what. We don't want that to be some company's server, so the members' own computers take turns at the role. We call it the **host**.

The idea comes from chat apps. Group messages have one order, and someone decides who is in the group, because a server keeps order. Halo keeps "someone keeps order" and lets that role rotate among the members, so it belongs to no company.

## How it works {#how-it-works}

- **The host writes everything**: members send their board changes to the host, which writes them one by one in order and copies them to the other members. A change counts once most of the online members' computers have stored it.
- **A new host takes over automatically**: when the host stops answering for a dozen seconds or so, it is marked offline. The online member that joined the team earliest steps up, and it wins only if more than half of the team's computers agree. Every host's tenure is numbered.
- **Never two hosts at once**: "more than half" counts the whole team, not just whoever is online. If the network splits in two, at most one side can pick a host.
- **The old host steps aside when it comes back**: it sees the newer number and steps down, and other members refuse anything it writes under its old tenure.
- **The smaller side pauses**: the side that can't reach more than half pauses board changes and stays view-only until it reconnects. We would rather pause than end up with two boards that don't match.
- **Work in progress isn't done twice**: a new host first checks whether each task's member is still working on it. Busy members keep their tasks; only tasks whose member is confirmed offline go back to be reassigned.

## How it differs from standard Raft {#differences-from-raft}

Halo borrows Raft's terms, majority votes and replicated log, adjusted for members that are personal computers:

- **Takeover by join order**: no randomized election timeouts. The next host is known in advance, so it is clear who takes over.
- **A candidate that is behind is turned down**: a voter holding newer committed changes refuses its vote. The candidate catches up first, so the new host never loses data.
- **Sleep-aware**: a laptop waking from sleep gets a grace period, so it isn't taken for a crash and doesn't set off a takeover.
- **The Federation Gateway relays but doesn't vote**: across networks, messages pass through the [Federation Gateway](/en/advanced/federation-gateway) you deploy yourself. It keeps no board and casts no vote; while there is no host, it only relays the messages members need to pick a new one.

That is why we call it Raft-style, not standard Raft.

## What it guarantees, and what it doesn't {#guarantees}

It guarantees:

- The team has one board, and it never forks.
- Changes that already counted survive a change of host.
- Every member sees changes in the same order.

It doesn't guarantee:

- Digital Humans on an offline computer stay offline. If the host's computer sleeps, its Digital Humans, possibly including the lead, wait until it wakes. A takeover keeps the shared team record going, not the Digital Humans on that computer.
- A message to an offline member is marked as not received. Send it again once they are back, or assign the work to someone else; see [Team workbench](/en/digital-humans/team-workbench#offline).

## Team size and trade-offs {#team-size}

- **3 or more people**: when the host leaves, the others pick a new host and the board stays writable.
- **2 people**: when the host leaves, the one left can't reach more than half, so board changes pause while each person's Digital Humans keep working locally. When the host comes back, the board picks up again on its own. With the other person offline there is no one to work with anyway, so this is a deliberate trade-off.
- **Intended size**: a few people to a few dozen. A larger organization is made of several teams, each running on its own.

## Why not CRDTs {#why-not-crdt}

CRDTs let every computer write on its own and merge the results later, which suits content that can be merged, such as documents and notes. Some team decisions need someone to decide on the spot:

- Who a task goes to can't be merged into two people afterwards.
- Once a member is removed from the team, their later writes must stop counting immediately.

These can't be merged after the fact, so in Halo the host writes everything.

## What stays on your computer and what is shared {#privacy}

- **Shared with the team**: tasks, findings, the team record, and the work a member does for the team.
- **Stays on your computer**: private chats, memory and local files. A file reaches teammates only after it is published to the team, and it is fetched from your computer when someone opens it.
- **Your computer decides**: what teammates can have your Digital Humans do (**Read only**, **Read and write files** or **Everything it can normally do**) is stored only on your computer and never synced; see [Teams across computers](/en/digital-humans/cross-computer-teams).

For how data flows overall, see [Security, privacy and data flow](/en/advanced/security).

## FAQ {#faq}

### Are Halo teams decentralized? {#is-it-decentralized}

No central server holds team state: team data lives on the members' computers, and the host role rotates among them. To be precise, Raft itself is a high-availability replication algorithm, not a decentralization technology. Halo is decentralized because of how it is used here: the host is a member's own computer, not a vendor's server.

### Do I need a server? {#need-a-server}

Not on one local network. If members are on different networks, you deploy a Federation Gateway to relay messages; see [Deploy the Federation Gateway](/en/advanced/federation-gateway).

### What happens when a laptop goes to sleep? {#laptop-sleeps}

A member's laptop sleeping doesn't affect anyone else; its tasks wait until it is back. If the host sleeps, a team of 3 or more picks a new host, and a 2-person team pauses board changes until the host returns.

### Does everyone need the same AI? {#same-ai}

No. Each Digital Human uses the engine (Claude Code, Codex, DeepSeek dsh and others) and model its owner set up, local models included, and one team can mix them.

### Can a team have thousands of members? {#large-teams}

No. Teams are designed to be small; split a large organization into several teams.
