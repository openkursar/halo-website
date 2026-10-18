# App Spec Field Reference (condensed, automation-focused)

The source of truth is the Zod schema `src/main/apps/spec/schema.ts` in the Halo repository.
`src/main/apps/spec/PROTOCOL.md` describes it in prose but has drifted from it; when the two
disagree, the schema (and this page) wins. This page covers what matters when authoring
`type: automation` specs through `create_automation_app`, and flags what the tool description
omits.

## Top-level shape

```
name*, description*, system_prompt*        always required
type: "automation"                          forced by create_automation_app
subscriptions?                              omit entirely for IM-only / manual-only apps
config_schema?, requires?, filters?
memory_schema?, escalation?                 escalation: only timeout_hours has an effect
permissions?, browser_login?
display_name?, recommended_model?
output?                                     schema-only, never read — don't write it
version, author                             default to "1.0" / "Halo" when omitted
```

## `subscriptions[].source.type` — status of each

| type | Works? | Notes |
|---|---|---|
| `schedule` | Yes | `every: "30m"` (duration `\d+[smhd]`) or `cron: "0 8 * * *"` — 5 fields, or 6 with a leading seconds field, validated by croner when the spec is saved (`schema.ts:44-60`). At least one is required; set only one — if both are present `every` wins and `cron` is ignored (`runtime/service.ts:1066-1085`). `workday_calendar: true` runs only on mainland China working days (holidays and make-up workdays included); the schedule must then fire every day, not `1-5`. |
| `file` | Yes | `pattern` (glob against relative path) and/or `path` (absolute dir, substring match). Both omitted = every file change. |
| `webhook` | Yes | Mounted at `/hooks/{path}`; `secret` enables HMAC-SHA256 verification. JSON only, ≤256KB. |
| `webpage` | **No producer** | Schema-only. Use `schedule` + AI Browser polling instead. |
| `rss` | **No producer** | Schema-only. Use `schedule` + AI Browser polling instead. |
| `custom` | Free-form | `config` is unvalidated; only meaningful with a custom event source that actually emits matching events. Don't offer speculatively. |
| `wecom` | **No producer** | Schema-only. Real WeCom delivery is binding-based — see `create-digital-human/im-triggers.md`. Never use. |

`frequency: { default, min?, max? }` gives the UI a user-adjustable slider within bounds (only
meaningful for `schedule`). `config_key` wires a `config_schema` value into the trigger (e.g. a
URL); the key must exist or validation fails.

## `config_schema[]` — input types

| type | Control | Use for |
|---|---|---|
| `url` | URL input | A link the automation targets |
| `text` | Multi-line textarea | Long-form content |
| `string` | Single-line input | Short values: names, comma-separated lists, `HH:mm` times |
| `number` | Number input | Counts, thresholds, safety caps |
| `select` | Dropdown (requires `options: [{label, value}]`) | Fixed choice set |
| `boolean` | Toggle | On/off switches |
| `email` | Email input | Recipient addresses |

There is no credential type, by design. Use `browser_login` for login-gated sites.

## `permissions[]`

| id | Grants | Default |
|---|---|---|
| `ai-browser` | AI Browser web automation | ON |
| `ai-terminal` | Shell commands / interactive terminals | ON where the platform supports terminals |
| `email` | Email and calendar tools | ON, but tools load only once an email channel is configured |
| `im-push` | `notify_bot` proactive IM push | ON, but tools load only once a pushable contact exists |
| `halo-api-ref` | **Operate Halo** — Halo's own API through `halo_api_ref`: spaces, digital humans, knowledge bases, settings | **OFF** |
| `conversation-collab` | **Conversation Collaboration** — read and message the other conversations of its space, other digital humans included, with their authority | **OFF** |

Resolution order (`resolvePermission`, `src/shared/apps/app-types.ts:564-573`): explicit user
deny → explicit user grant → declared in `spec.permissions` → the default (`true` for the first
four, `false` for the last two). **A spec can only add capability, never remove it**; only a user
opt-out in the UI disables one. Declaring an OFF-by-default permission turns it on at install, so
add `halo-api-ref` or `conversation-collab` only when the task truly needs it, and tell the user.
Web search, memory, and OCR are always on and not permission-gated.

## `output`

**`output.notify` is schema-only — the runtime never reads `spec.output` at all** (repo-wide
`grep -rn "spec.output|output?.notify" src/main/apps/runtime` is zero hits). Do not put
`"output": { "notify": {...} }` in a spec and tell the user "this will send you a desktop
toast" or "this will email you" — configured this way, it silently never fires. This is the same
category as `subscriptions[].source.type: webpage`/`rss`/`wecom` above: defined in the Zod schema,
never consumed at runtime.

The real mechanisms, both entirely outside the App Spec:

- **Desktop toast** is controlled by a per-app **user override**, not a spec field —
  `app.userOverrides.notificationLevel` (`'none' | 'important' | 'all'`, default `'important'`),
  set by the user in the app's own Settings panel (**Messages & Notifications** › **System
  Notifications**, `AppConfigPanel.tsx`), read by the runtime at
  `src/main/apps/runtime/service.ts:801-804` and `report-tool.ts:357-362`. Nothing in
  `create_automation_app` can set this at creation time; if the user wants toasts, point them at
  that panel afterward.
- **External channel delivery is entirely AI-driven at runtime**, not spec-configured — during a
  run the agent decides whether to call `notify_channel` (email/wecom/dingtalk/feishu/webhook,
  credentials configured once globally in Settings → Message Channels) or `notify_bot` (IM, needs
  `permissions: ["im-push"]`). Both `service.ts:800` and `report-tool.ts:369` say this outright in
  comments: *"External channel notifications are now AI-driven via notify_channel / notify_bot
  tools."* There is no `output.notify.channels` list that pre-declares which channels a run will
  push to — that decision is made by the model, in `system_prompt`, at run time. If a task must
  reliably notify externally, say so explicitly in `system_prompt` ("call `notify_channel` with
  X when Y happens") rather than relying on a spec field that does nothing.
- `output.format` is dead for the same reason — the runtime never reads any part of `spec.output`,
  so it isn't interpolated or used to shape a reply either. Don't set it expecting any effect.

Don't write an `output` block into a spec at all; it has no effect of any kind.

## `escalation`

```json
"escalation": { "timeout_hours": 24 }
```

The agent can always pause and ask the user (a `report_to_user` escalation; status →
`waiting_user`), resuming on reply. **`enabled` is schema-only** — nothing reads it, so `false`
does not stop the agent from asking and does not make it autonomous; autonomy comes from
`system_prompt` and its config (`interview-checklist.md`, item 6). Don't write it.

`timeout_hours` is the only field with an effect: a question asked by this app expires that many
hours after it is asked, and the run then ends as `error` ("Decision deadline expired without an
answer", `runtime/store.ts:502-505`, `runtime/service.ts:1037-1054`). **There is no default for
new installs** — without `timeout_hours` a question waits until answered (only apps installed
before the change keep their old 24 h, `runtime/migrations.ts:163`). Set it when a stale answer
would be worse than none. Ask the user explicitly whenever the task performs irreversible
actions.

## `memory_schema`

Descriptive guidance for the agent's own `memory.md` (no runtime validation). Use it whenever
the app must remember across runs: processed-ID lists for dedup, running counters, last-run
timestamps, consecutive-failure counts. Stored at
`{space}/.halo/apps/{appId}/memory.md` for a digital human installed in a space (a global install
uses `{haloDir}/apps/{appId}/`; `resolveWorkDir()`, `src/main/apps/manager/service.ts:290-301`,
and `src/main/platform/memory/paths.ts:58-80`), read and written by the agent each run. The
sibling `memory/` directory (no `.md`) is the **archive** for run summaries and compaction
snapshots, not the live file — don't add an extra `memory/` segment when referencing the main
file.

## `filters`

Zero-LLM-cost pre-filtering for `file` / `webhook` events before a run starts (AND across all
rules). Not useful for `schedule` triggers — put that logic in `system_prompt`. Operators:
`eq, neq, contains, matches, gt, lt, gte, lte`.

## `requires`

```json
"requires": {
  "mcps": [{ "id": "some-installed-mcp-server", "reason": "..." }],
  "skills": [{ "id": "team/some-skill", "reason": "..." }]
}
```

`requires.mcps` is a **real least-privilege gate for this app's autonomous runs — not
documentation.** Its effect depends entirely on what `id` refers to:

- **Built-in capabilities** (`ai-browser`, `ai-terminal`, `halo-email`, and the always-on
  `halo-report`/`halo-notify`/`web-search`/`ocr`) are injected based on
  `permissions[]` and other conditions (`resolvePermission()`), in *both* `execute.ts` (scheduled/
  webhook/file-triggered runs) and `app-chat.ts` (chatting with the digital human directly) —
  `requires.mcps` has **zero effect** on them either way. Listing `ai-browser` here (as a real
  bundled browser-automation app does, in its own `spec.yaml` — see
  `create-digital-human/examples.md` §3) is harmless but inert; declare
  `permissions: ["ai-browser"]` instead, which is what actually grants it.
- **User-installed MCP server apps** (installed from the App Store or added manually — real rows
  in the apps database, scoped globally or per-space) behave *differently by run mode*, and this
  is the part that actually matters:
  - **Scheduled / webhook / file-triggered runs** (`execute.ts` → `getMcpServersForRequires`):
    only servers explicitly listed in `requires.mcps` are injected — an **allowlist**. An
    installed-and-active server the space has is silently absent from the run if it isn't
    declared here, even though the same digital human's interactive chat has it.
  - **Chatting with the digital human directly** (`app-chat.ts` → `getDbMcpServers`): gets *all*
    effective MCP servers for the space by default; `requires.mcps` only matters here as a
    **denylist** — an entry with `enabled: false` excludes that specific server from chat too.
  - Practical consequence: if a digital human needs a specific installed MCP server to work when
    it runs on its own initiative (not just when you're chatting with it), that server's id
    **must** be declared in `requires.mcps`, or the autonomous run silently has fewer tools than
    a live chat with the same app would suggest.

`requires.skills` matters unconditionally: those skills are installed right after the app is
created, and **a failed skill install rolls the entire app creation back**.

## `browser_login`

```json
"browser_login": [{ "url": "https://internal.example.com", "label": "Internal System" }]
```

Declares sites the user must be logged into in their own Halo browser before the automation can
work. The correct alternative to ever asking for credentials.
