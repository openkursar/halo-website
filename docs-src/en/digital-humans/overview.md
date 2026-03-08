# What are Digital Humans

Starting with Halo v2.0, Halo is no longer just a "one-off AI conversation tool" — it is a platform capable of running persistent AI individuals.

These long-running AI individuals are called **Digital Humans**.

---

## Digital Humans vs. Regular Conversations

| | Regular Conversation | AI Digital Human |
|---|---|---|
| How it runs | You send a message, AI replies | Runs autonomously in the background, 24/7 |
| Context | Cleared when the conversation ends | Long-term memory, persists across days and weeks |
| Trigger | Manual input | Scheduled tasks, event triggers, Webhooks |
| Execution capability | Full Agent capabilities | Full Agent capabilities (identical) |
| Best for | Instant Q&A, one-off tasks | Continuous monitoring, periodic automation |

In a nutshell: **a regular conversation is a temp worker you hire; a Digital Human is a full-time employee.**

---

## Digital Human Capabilities

```
AI Digital Human
├── Identity & Memory     → Persistent, maintains context across runs
├── Triggers              → Scheduled tasks / file changes / Webhooks / page monitoring
├── Execution Tools       → MCP servers / AI browser / shell commands
├── Output Channels       → System notifications / email / WeCom / Feishu / DingTalk
└── User Configuration    → Keywords, URLs, API keys, and other parameters
```

---

## The Difference Between MCP, Skill, and A2A

These concepts are easy to confuse — here is a clear breakdown:

| Concept | What it is | Analogy |
|---------|-----------|---------|
| **MCP** | Tool interfaces the AI can call (query databases, operate files, call APIs…) | The toolbox in an employee's hands |
| **Skill** | A packaged, single capability (send email, search, write a report…) | A skill the employee knows |
| **A2A** (Google) | A network protocol for Agent-to-Agent communication — solving "how to pass messages" | A walkie-talkie between employees |
| **AI Digital Human (DHP)** | A complete, independently running AI individual with identity, memory, goals, and triggers | The employee themselves |

To put it plainly:
- MCP and Skills are "tools"; Digital Humans are "the people who use those tools"
- A2A addresses communication format; DHP addresses "who this Agent is, what it can do, and how to distribute it to everyone"
- A Digital Human is not a one-off prompt — it has a persistent identity, long-term memory, and the ability to be triggered externally

---

## Typical Scenarios

- **Sentiment monitoring**: Searches for brand keywords every hour, immediately pushes an alert when anomalies are detected
- **Code review**: Listens to GitHub PRs, automatically performs code quality checks and leaves comments
- **Daily/weekly report assistant**: Summarizes work progress on a schedule and sends it by email
- **Information subscriptions**: Tracks competitor updates and industry news, periodically pushes summaries
- **Task delegation**: Hand a long-term goal to a Digital Human and let it keep making progress while you do other things

---

## Next Steps

- [Digital Human Store](/en/digital-humans/store): Install ready-made Digital Humans with one click
- [Create a Digital Human](/en/digital-humans/create): Create your own Digital Human using natural language
- [DHP Protocol](/en/digital-humans/dhp-protocol): Developer-oriented — a deep dive into the protocol specification
