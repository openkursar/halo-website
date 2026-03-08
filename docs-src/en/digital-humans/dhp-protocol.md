# DHP Protocol

DHP (Digital Human Protocol) is an **open AI Digital Human distribution protocol** proposed by Halo.

Developers write a `spec.yaml`, submit it to the DHP Registry, and any user on a DHP-compatible platform can install and use their Digital Human with a single click.

::: info Protocol Repository
[github.com/openkursar/digital-human-protocol](https://github.com/openkursar/digital-human-protocol)
:::

---

## Why DHP Is Needed

MCP addresses "what tools the AI can use," A2A addresses "how Agents communicate with each other," but no protocol answers:

> **Who is this Agent? What can it do? How do you distribute it to users worldwide?**

DHP is the answer to that question. It defines a standardized format for Agent identity, capability description, and distribution — making Digital Humans discoverable, installable, and reusable, just like npm packages.

---

## Complete spec.yaml Structure

```yaml
# ─── Basic Information ────────────────────────────────
spec_version: "1"
name: "HN Daily Brief"           # Digital Human name
version: "1.0.0"
author: "your-name"
description: "Summarizes top Hacker News content every morning"
type: automation
icon: "news"                      # Icon identifier

# ─── Core Instructions ───────────────────────────────
system_prompt: |
  You are a concise tech analyst.
  On each run:
  1. Open https://news.ycombinator.com and find the top 10 highest-scoring items
  2. ...

# ─── Dependencies ────────────────────────────────────
requires:
  mcps:
    - id: ai-browser
      reason: "Needs to open web pages and read articles"

# ─── Triggers ────────────────────────────────────────
subscriptions:
  - id: morning-digest
    source:
      type: schedule
      config:
        cron: "0 8 * * *"

# ─── User Configuration ──────────────────────────────
config_schema:
  - key: email
    label: "Recipient email"
    type: email
    required: true
    description: "The digest will be sent to this email address"

# ─── Output Notifications ────────────────────────────
output:
  notify:
    system: true
    channels:
      - email

# ─── Store Information (fill in when publishing) ─────
store:
  slug: "hn-daily-brief"
  category: news
  tags: ["hn", "tech", "digest", "daily"]
  locale: en
  license: MIT

# ─── Optional: Persistent Memory Schema ──────────────
memory_schema:
  last_seen_ids:
    type: array
    description: "IDs of articles processed in the last run, used for deduplication"

# ─── Optional: Permissions ───────────────────────────
permissions:
  - ai-browser
```

---

## Field Quick Reference

### config_schema Field Types

| type | Description |
|------|-------------|
| `text` / `string` | Plain text |
| `email` | Email address |
| `url` | URL |
| `number` | Number |
| `boolean` | Toggle switch |
| `select` | Dropdown (used with `options`) |

### subscriptions source.type

| type | When it triggers |
|------|-----------------|
| `schedule` | On a schedule (`every` or `cron`) |
| `file` | Local file change |
| `webhook` | Incoming HTTP request |
| `webpage` | Specified web page content change |
| `rss` | New RSS content |
| `custom` | Custom |

---

## Publish to DHP Registry

1. Fork the [digital-human-protocol](https://github.com/openkursar/digital-human-protocol) repository
2. Create your Digital Human folder under the `registry/` directory
3. Submit your `spec.yaml` and open a Pull Request
4. Once reviewed and approved, your Digital Human will appear in the Halo store

---

## Build Once, Distribute Globally

DHP's vision is to make it easy for every developer to contribute reusable AI capability modules. Write the spec once, and Halo users can install and run your Digital Human with a single click. Contributions are welcome.
