# Digital Human Collaboration & Communication

When Remote Access is enabled in Halo, each digital human exposes a REST API. One digital human can call another using `curl`, enabling task distribution and collaboration.

This is a **hands-on guide** — follow the steps top to bottom. All commands are copy-paste ready.

---

## Step 1: Enable Remote Access

Open Halo, go to **Settings (gear icon in bottom-left) → Remote Access**.

<!-- Screenshot placeholder: screenshot-remote-settings.png -->

1. Toggle **"Enable Remote Access"** on
2. Note the **Local Address** shown, e.g. `http://localhost:3847`
3. Click **"Show"** next to the password to reveal the 6-digit PIN, e.g. `583921`

::: tip Set a Custom Password
The default PIN changes on every restart. Click **"Edit"** next to the password and set a 4-32 character alphanumeric password. You won't need to update it after restarts.
:::

These three values are all you need going forward:

| Item | Example | Where to find it |
|------|---------|------------------|
| URL | `http://localhost:3847` | Settings → "Local Address" |
| Port | `3847` | Part after the colon in the URL |
| Password | `583921` (or custom) | Settings → "Access Password" |

---

## Step 2: Try It Out

Open your terminal and replace the placeholders with your actual values.

### 2.1 List All Digital Humans

```bash
curl -s http://localhost:3847/api/apps \
  -H "Authorization: Bearer your-password"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "e7b3c9a1-2f4d-4e6b-8a5c-1d3f5e7b9a2c",
      "specId": "stock-monitor",
      "spaceId": "f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "spec": { "name": "Stock Monitor", "type": "automation", "description": "Monitors stock prices" },
      "status": "active"
    },
    {
      "id": "d6f8e2b1-3c5a-4d7e-9f1b-2a4c6d8e0f1a",
      "specId": "alert-notifier",
      "spaceId": "f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "spec": { "name": "Alert Notifier", "type": "automation", "description": "Sends alert notifications" },
      "status": "active"
    }
  ]
}
```

From the response, note two key fields:

- **`id`** — The digital human's UUID. You'll use this to send messages and trigger runs.
- **`spaceId`** — The space UUID. Required when sending messages.

::: tip Filter by space
Add `?spaceId=<spaceId>` to filter:
```bash
curl -s "http://localhost:3847/api/apps?spaceId=f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c" \
  -H "Authorization: Bearer your-password"
```
:::

### 2.2 Get a Single Digital Human's Details

Replace `<appId>` with the `id` from the previous step:

```bash
curl -s http://localhost:3847/api/apps/<appId> \
  -H "Authorization: Bearer your-password"
```

Returns the full digital human config, including `system_prompt`, `subscriptions`, `config_schema`, and more.

### 2.3 Send a Message to a Digital Human

This is the core of inter-digital-human communication — send a message to trigger another digital human to act.

```bash
curl -s -X POST http://localhost:3847/api/apps/<targetAppId>/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-password" \
  -d '{
    "spaceId": "<spaceId>",
    "message": "This is a message from another digital human"
  }'
```

Two required fields in the `-d` body:

| Field | Meaning | Source |
|-------|---------|--------|
| `spaceId` | Space UUID | `spaceId` field from step 2.1 |
| `message` | Message content | Whatever you want to tell the target |

Success response:

```json
{ "success": true, "data": { "conversationId": "conv-xxx..." } }
```

::: warning
Sending is **async**. `curl` returns immediately. The target digital human executes in the background. Want to know when it's done? See the next step.
:::

### 2.4 Check Digital Human State

```bash
curl -s http://localhost:3847/api/apps/<targetAppId>/state \
  -H "Authorization: Bearer your-password"
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "idle",
    "lastRunAt": 1715000000000,
    "lastRunStatus": "completed"
  }
}
```

`status` values:
- `idle` — Not running
- `running` — Currently executing

### 2.5 Manually Trigger a Run

```bash
curl -s -X POST http://localhost:3847/api/apps/<targetAppId>/trigger \
  -H "Authorization: Bearer your-password"
```

Triggers the digital human to run immediately, regardless of its schedule.

---

## Step 3: Parameter Cheat Sheet

Where does each parameter come from? Here's the complete reference:

| Parameter | What it is | Where to find it |
|-----------|------------|------------------|
| **Port** | Remote access port, default `3847` | Settings → Remote Access → "Local Address", the number after the colon |
| **Password (Token)** | Remote access PIN or custom password | Settings → Remote Access → "Access Password", click "Show" |
| **appId** | Digital human's UUID | From `curl /api/apps`, the `id` field, e.g. `"e7b3c9a1-..."` |
| **spaceId** | Space UUID | Same response, the `spaceId` field. Or Settings → Space Management |

---

## Step 4: Make It Automatic

Now that you can `curl` manually, let's make digital humans do it themselves:

1. Expose password and port as user-configurable fields via `config_schema`
2. Write `system_prompt` rules for when and who to call
3. The digital human's AI will use its `Bash` tool to run `curl` commands

---

### Full Example: Stock Monitor + Alert Notifier

**Scenario**: App A (Stock Monitor) checks prices every 10 minutes. When a stock crosses the threshold, it notifies App B (Alert Notifier) to send email alerts.

#### App A — The Monitor

```yaml
spec_version: "1"
name: "Stock Monitor"
version: "1.0.0"
author: "your-name"
description: "Checks stock prices every 10 min, notifies Alert Notifier on threshold breach"
type: automation
icon: "trending-up"

system_prompt: |
  You are a stock monitor. You run every 10 minutes.

  ## Configuration (from User Configuration)
  - Access Password: {halo_token}
  - Port: {halo_port}      ← default 3847
  - Target App ID: {alert_app_id}
  - Space ID: {space_id}
  - Symbols: {symbols}    ← comma-separated, e.g. AAPL,GOOGL

  ## Steps

  1. Fetch current prices for {symbols}. Use web_search or your configured data source.
  2. Compare against the last recorded prices from memory (last_prices).

  3. For any symbol exceeding the threshold, run this Bash command:

  ```
  curl -s -X POST http://localhost:{halo_port}/api/apps/{alert_app_id}/chat/send \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer {halo_token}" \
    -d '{"spaceId":"{space_id}","message":"ALERT: <symbol> price change <pct>%, current price <price>"}'
  ```

  4. Update last_prices in memory.

  ## Forbidden
  - Do NOT use WebFetch for POST requests (WebFetch is GET-only and returns LLM summaries)
  - All message sending must use Bash + curl

subscriptions:
  - id: watch-trigger
    source:
      type: schedule
      config:
        every: "10m"

config_schema:
  - key: halo_token
    label: "Halo Remote Access Password"
    type: text
    required: true
    description: "Settings → Remote Access → Access Password"
  - key: halo_port
    label: "Halo HTTP Port"
    type: number
    required: false
    description: "Default 3847"
  - key: alert_app_id
    label: "Alert Notifier App ID"
    type: text
    required: true
    description: "The target digital human's id from curl /api/apps"
  - key: space_id
    label: "Space ID"
    type: text
    required: true
    description: "Current space UUID"
  - key: symbols
    label: "Symbols to Monitor"
    type: text
    required: true
    description: "Comma-separated, e.g. AAPL,GOOGL,TSLA"

memory_schema:
  last_prices:
    type: object
    description: "Last recorded prices {AAPL: 150.23, GOOGL: 140.56}"

output:
  notify:
    system: false
```

#### App B — The Alert Handler

```yaml
spec_version: "1"
name: "Alert Notifier"
version: "1.0.0"
author: "your-name"
description: "Receives alert messages and sends notifications"
type: automation
icon: "bell"

system_prompt: |
  You are an alert handler.
  - Normally idle
  - When you receive a message from another digital human, analyze and act immediately

  ## Processing Rules
  1. Analyze the alert content and determine severity
  2. Use notify_channel to send notifications
  3. Log to memory to prevent duplicate alerts within 1 hour for the same symbol

  ## Forbidden
  - Do not act unless triggered
  - Notification content must include "alert source" and "recommended action"

output:
  notify:
    system: true
    channels:
      - email

memory_schema:
  alerted_symbols:
    type: object
    description: "{AAPL: 1715000000000, ...} timestamps for deduplication"
```

---

#### Install and Configure

1. Install both digital humans in Halo
2. Open App A's config and fill in:
   - `halo_token`: your remote access password
   - `halo_port`: `3847`
   - `alert_app_id`: App B's UUID (from `curl /api/apps`)
   - `space_id`: current space UUID
   - `symbols`: `AAPL,GOOGL`

3. App B needs no extra config — it only receives, never calls out

---

## Security Notes

### Never hardcode passwords in specs

Use `config_schema` to let the user fill in the token. Reference it as `{halo_token}` in the system_prompt.

```yaml
# ✓ Correct: via variable
"Authorization: Bearer {halo_token}"

# ✗ Wrong: hardcoded (leaks to anyone with spec access)
"Authorization: Bearer 583921"
```

### Public Tunnel Scenarios

If you enable the public tunnel, anyone with the URL and password can call your digital human APIs. Recommendations:
- Turn off the tunnel when not in use
- Use a custom password instead of random PIN (easier to manage)
- Rotate passwords periodically

### Limit Collaboration Scope

- Don't want a digital human callable? Just don't give it the password in config_schema
- Only want specific digital humans to collaborate? Only configure the password in those specific digital humans

---

## Alternative: Webhook (No Password)

If you prefer not to manage passwords, use Webhooks with HMAC signatures instead.

App B subscribes to a webhook:

```yaml
subscriptions:
  - id: from-app-a
    source:
      type: webhook
      config:
        path: "app-a-to-b"
        secret: "your-shared-secret"
```

App A calls via Bash with HMAC:

```bash
BODY='your message content'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "your-shared-secret" | sed 's/^.* //')
curl -s -X POST http://localhost:3847/hooks/app-a-to-b \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=$SIGNATURE" \
  -d "$BODY"
```

No password needed — just a shared `secret` agreed upon by both parties.

---

## Current Limitations

| Limitation | Impact |
|------------|--------|
| Messages are **async** — returns before the target finishes | Poll `/api/apps/:appId/state` or `/api/apps/:appId/activity` to confirm completion |
| No callback mechanism | The caller has no automatic way to learn the callee's execution result |
| Automation digital humans lack built-in `list_automation_apps` or `trigger_automation_app` tools | Target App IDs must be pre-configured; no runtime auto-discovery |
| Webhook path names must be **globally unique** | Multiple digital humans cannot share the same webhook path |

---

## Next Steps

- [Creating Digital Humans](/en/digital-humans/create) — Learn the full spec format
- [Production-Grade Digital Humans](/en/digital-humans/production-guide) — Encapsulate curl calls in Skill scripts
- [Remote Access](/en/features/remote-access) — Manage remote access toggle and password
