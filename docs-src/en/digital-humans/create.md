---
title: "Create a Digital Human"
description: "Create your own Halo digital human using natural language or spec.yaml configuration."
---
# Create a Digital Human

You have two ways to create your own Digital Human: **natural language conversation** or **writing a spec.yaml directly**.

---

## Method 1: Natural Language (Recommended)

Describe the Digital Human you want in a Halo conversation, and the AI will automatically generate the configuration and install it.

Example:

```
Create a Digital Human for me that opens Hacker News every morning at 8 AM,
summarizes the top 10 trending articles of the day, and emails them to me.
My email address is xxx@example.com
```

Halo will automatically:
1. Understand your requirements
2. Generate the corresponding spec.yaml
3. Install and start the Digital Human

::: tip Better results with top-tier models
Using a more powerful model like Claude 4.5 Opus produces higher-quality, more stable Digital Humans from natural language.
:::

---

## Method 2: Write spec.yaml

For users with a technical background, you can write the spec file directly to control every detail precisely.

### Basic Structure

```yaml
spec_version: "1"
name: "HN Daily Brief"
version: "1.0.0"
author: "your-name"
description: "Summarizes top Hacker News content every morning and sends an email digest"
type: automation
icon: "news"

system_prompt: |
  You are a concise tech analyst.

  On each run:
  1. Open https://news.ycombinator.com and find the top 10 highest-scoring items
  2. Read each title, article (if accessible), and top comments
  3. Write a summary that includes:
     - A one-sentence summary of each item
     - "Why it matters" for the 2–3 most important items
  4. Keep it concise, plain text format

requires:
  mcps:
    - id: ai-browser
      reason: "Needs to open web pages and read articles"

subscriptions:
  - id: morning-digest
    source:
      type: schedule
      config:
        cron: "0 8 * * *"     # Every day at 8 AM

config_schema:
  - key: email
    label: "Recipient email"
    type: email
    required: true

output:
  notify:
    system: true
    channels:
      - email
```

---

## spec Field Reference

### Trigger Types (subscriptions)

| Type | Description | Example |
|------|-------------|---------|
| `schedule` | Runs on a schedule | `every: "1h"` or a cron expression |
| `file` | Triggered by file changes | Monitor a specified directory |
| `webhook` | Triggered by an HTTP request | Push from an external system |
| `webpage` | Triggered by web page content changes | Monitor a specified URL |
| `rss` | Triggered by new RSS content | Subscribe to an RSS feed |

Common `every` values: `30m`, `1h`, `24h`, `7d`

### Output Notifications (output.notify)

| Channel | Configuration |
|---------|---------------|
| System desktop notification | `system: true` |
| Email | `channels: [email]` |
| WeCom (Enterprise WeChat) | `channels: [wecom]` |
| Feishu | `channels: [feishu]` |
| DingTalk | `channels: [dingtalk]` |
| Webhook | `channels: [webhook]` |

Message channel credentials (email password, Webhook URL, etc.) are managed centrally under **Settings → Message Channels**.

---

## Installing a spec

Once you have written your spec.yaml, tell the AI in Halo:

```
Install this Digital Human spec for me
```

Paste the spec content, and the AI will complete the installation automatically.

---

## Publish to the Store

Want to share your Digital Human with everyone? See → [DHP Protocol](/en/digital-humans/dhp-protocol)
