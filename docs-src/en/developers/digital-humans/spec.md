---
title: "Digital Human spec.yaml reference: all fields"
description: "Reference for the Digital Human spec.yaml: every field with its type, default and allowed values, the rules Halo checks, and the fields that have no effect."
type: reference
audience: [developer]
---

# Digital Human spec reference

A Digital Human is defined by its spec: its instructions, triggers, settings form, capabilities and dependencies. This page lists every field Halo accepts, the rules it checks, and the fields it accepts but never acts on.

## Where the spec lives {#where}

You rarely start from an empty file:

- **Ask Halo.** Describe the job in a conversation, and Halo writes and installs the spec for you. See [Create a Digital Human](/en/digital-humans/create).
- **Read or edit an existing one.** Open the Digital Human, go to **Capabilities and settings** and switch to the **YAML** tab. It shows the full spec, checks your changes when you click **Save**, and **Export** saves it as a file.
- **Package it.** A Digital Human package carries the spec as `spec.yaml` at its root. See [DHP protocol](/en/developers/dhp).

You can also ask Halo to change an installed Digital Human, or send the changed top-level fields with [`PATCH /api/apps/:appId/spec`](/en/developers/api/digital-human#patch-api-apps-appid-spec).

## A minimal spec {#minimal}

```yaml
name: Weekly sales summary
version: "1.0.0"
author: example
description: Every Monday, sums up last week's orders and reports the totals.
type: automation
system_prompt: |
  You prepare the weekly sales summary.
  1. Read orders.csv in the workspace.
  2. Write the totals per product to report.md.
  3. Report the three biggest changes with report_to_user.
  Never delete or rewrite orders.csv.
subscriptions:
  - id: weekly
    source:
      type: schedule
      config:
        cron: "0 9 * * 1"
```

`name`, `version`, `author`, `description`, `type` and `system_prompt` are required for a Digital Human. When Halo's assistant creates one, it fills in `version` (`1.0`) and `author` (`Halo`) if you leave them out; a file you import must have them.

## Rules Halo checks {#rules}

Halo validates the spec when it is installed or changed, and rejects it with the field that failed:

- `cron` must be a valid cron expression with a future run; `every` must look like `30m`, `2h` or `1d`. A schedule needs one of the two.
- Trigger ids must be unique, and a trigger's `config_key` must name a `config_schema` key.
- A `select` setting needs at least one option.
- `browser_login[].url`, `store.homepage` and `store.repository` must be URLs.

Fields Halo does not know are dropped without an error, so a typo in a field name silently does nothing. Compare a spec you wrote by hand with the tables below.

When Halo reads a `spec.yaml` file (**Import**, or [`POST /api/apps/import-spec`](/en/developers/api/digital-human#post-api-apps-import-spec)), it also accepts a few older names: `inputs` for `config_schema`, `required_mcps` and `required_skills` for `requires.mcps` and `requires.skills`, `input` for `config_key`, and a trigger written as `- type: schedule` with its `config` beside it instead of under `source`. Write the current names in new specs.

## Fields {#fields}

Field paths use `[]` for list items and `<…>` for the keys of a map. A value in parentheses after a path, such as (`schedule`), means the field applies to that trigger type only.

<!-- generated:spec-fields automation -->
_Generated from the schema of Halo 3.0.4._

### Top-level fields {#fields-top}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `spec_version` | `string` | No | = `"1"` | Version of the spec format. Leave it out; Halo fills in `"1"`. |
| `name` | `string` (non-empty) | Yes | — | The name people see. For a skill it is also the folder name and the slash command, so a non-ASCII skill name is turned into an ASCII command name and the original is kept in `display_name`. |
| `display_name` | `string` | No | — | Name to show when `name` is not presentable, such as a skill named in Chinese. A matching `i18n` entry wins over it. |
| `version` | `string` (version) | Yes | — | Your version of the package, such as `1.0.0`. A Store update must carry a higher version. |
| `author` | `string` (non-empty) | Yes | — | Who made it. When published, it becomes the namespace of the Store address, `<author>/<name>`. Optional for skills. |
| `description` | `string` (non-empty) | Yes | — | One or two sentences on what it does, shown in lists and the Store. |
| `icon` | `string` | No | — | An emoji or an image URL. Anything else falls back to the type icon; a Digital Human without an icon gets a generated avatar. |
| `permissions` | `string[]` | No | — | Capabilities to turn on at install: `ai-browser`, `ai-terminal`, `email`, `im-push` (on by default anyway), `halo-api-ref` (Operate Halo) and `conversation-collab` (Conversation Collaboration), both off by default. A spec can only add a capability; the user can still turn any of them off. |
| `requires` ([see below](#field-requires)) | `object` | No | — | MCP servers and skills it depends on. |
| `config_schema` ([see below](#field-config-schema)) | `object[]` | No | — | The settings form the user fills in at install and can change later. Every run and chat hands the Digital Human the current values by `key`, with defaults filled in. |
| `store` ([see below](#field-store)) | `object` | No | — | Store listing details, used when the package is published or installed from a store. |
| `i18n` ([see below](#field-i18n)) | `map<string, object>` | No | — | Translations of the name, description, settings form and login labels, keyed by language tag such as `en` or `zh-CN`. |
| `type` | `literal` | Yes | `automation` | Kind of package: `automation` (a Digital Human), `mcp`, `skill`, or `extension` (reserved). |
| `system_prompt` | `string` (non-empty) | Yes | — | The Digital Human's instructions: its role, its steps, what it must never do and when to ask. Everything it does on its own follows from this text. |
| `subscriptions` ([see below](#field-subscriptions)) | `object[]` | No | — | When it runs on its own. Leave it out for a Digital Human that only answers chats and messages from bots. |
| `filters` ([see below](#field-filters)) | `object[]` | No | — | **No effect:** accepted, but nothing reads it. Meant as rules that drop events before a run starts. Put such conditions in the system prompt instead. |
| `memory_schema` ([see below](#field-memory-schema)) | `map<string, object>` | No | — | What the Digital Human should keep in its memory file between runs, such as processed ids or a last-run time. It guides the AI; nothing checks it. |
| `output` ([see below](#field-output)) | `object` | No | — | **No effect:** accepted, but nothing reads it. Meant to configure notifications and output format. Ask for notifications in the system prompt instead: the Digital Human sends them through the notification channels set up in Settings. |
| `escalation` ([see below](#field-escalation)) | `object` | No | — | How long its questions wait for an answer. The Digital Human can always stop and ask. |
| `recommended_model` | `string` | No | — | Model to suggest. Shown as a hint where the user picks the model; it does not switch the model. |
| `browser_login` ([see below](#field-browser-login)) | `object[]` | No | — | Websites the user must be signed in to in the AI Browser before it can work. Halo asks the user to sign in; the Digital Human never sees the password. |

### `requires` {#field-requires}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `mcps` | `object[]` | No | — | MCP servers it uses. Runs get only the servers listed here, and a run doesn't start while one of them is not installed, turned off, waiting for sign-in or failing. A chat gets every server of its workspace and the global ones, except those marked `enabled: false`. |
| `mcps[].id` | `string` (non-empty) | Yes | — | Id of an installed MCP server. |
| `mcps[].reason` | `string` | No | — | Why it needs the server, shown next to the dependency. |
| `mcps[].bundled` | `boolean` | No | — | **No effect:** accepted, but nothing reads it. Meant to mark an MCP server shipped inside the package. |
| `mcps[].enabled` | `boolean` | No | — | `false` keeps the declaration but stops this Digital Human from using the server, in runs and in chat. The server itself stays on for everyone else. |
| `skills` | `(string \| object)[]` | No | — | Skills to install together with it, as ids or objects. Every skill in its workspace or global scope is available to it anyway; this list only decides what gets installed. |
| `skills[].id` | `string` (non-empty) | Yes | — | Skill id. |
| `skills[].reason` | `string` | No | — | Why it needs the skill. |
| `skills[].bundled` | `boolean` | No | — | `true` when the skill ships inside the package under `skills/<id>/` rather than coming from the Store. |
| `skills[].files` | `string[]` | No | — | For a bundled skill, its files relative to `skills/<id>/`, such as `SKILL.md` and `index.js`. |

### `config_schema` {#field-config-schema}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `key` | `string` (non-empty) | Yes | — | Unique key of the setting. |
| `label` | `string` (non-empty) | Yes | — | Label shown on the form. |
| `type` | `enum` | Yes | `url`, `text`, `string`, `number`, `select`, `boolean`, `email` | Input control. `text` is multi-line, `string` single-line. There is no password or secret type, because the values are passed to the AI as plain text: for sites that need a login, use `browser_login`. |
| `description` | `string` | No | — | Help text under the field. |
| `required` | `boolean` | No | — | Marks the field as required on the form. |
| `default` | `any` | No | — | Value filled in until the user changes it. |
| `placeholder` | `string` | No | — | Hint shown in an empty field. |
| `options` | `object[]` | No | — | Choices of a `select` field, at least one. |
| `options[].label` | `string` (non-empty) | Yes | — | Text of the choice. |
| `options[].value` | `string \| number \| boolean` | Yes | — | Value stored when it is chosen. |

### `store` {#field-store}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `slug` | `string` | No | — | Store address of the package. Publishing sets it to `<author>/<name>` for you. |
| `category` | `string` | No | — | Store category it is listed under. |
| `tags` | `string[]` | No | = `[]` | Tags that help people find it in the Store. |
| `locale` | `string` | No | — | Main language of the package, as a language tag such as `zh-CN`. |
| `min_app_version` | `string` | No | — | Oldest Halo version it is meant for. The Store shows it; Halo does not block older versions. |
| `license` | `string` | No | — | License, as an SPDX identifier such as `MIT`. Kept with the package. |
| `homepage` | `string` (URL) | No | — | Project homepage. Kept with the package. |
| `repository` | `string` (URL) | No | — | Source repository. Kept with the package. |

### `i18n` {#field-i18n}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `<locale>.name` | `string` | No | — | Translated name. |
| `<locale>.description` | `string` | No | — | Translated description. |
| `<locale>.config_schema` | `map<string, object>` | No | — | Translations of settings fields, keyed by the field `key`. |
| `<locale>.config_schema.<key>.label` | `string` | No | — | Translated label. |
| `<locale>.config_schema.<key>.description` | `string` | No | — | Translated help text. |
| `<locale>.config_schema.<key>.placeholder` | `string` | No | — | Translated placeholder. |
| `<locale>.config_schema.<key>.options` | `map<string, string>` | No | — | Translated choice labels, keyed by the choice value. |
| `<locale>.browser_login` | `map<string, object>` | No | — | Translated login labels, keyed by the `browser_login` URL. |
| `<locale>.browser_login.<key>.label` | `string` | No | — | Translated label. |

### `subscriptions` {#field-subscriptions}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `id` | `string` | No | — | Id of this trigger, unique in the spec. Without one, triggers are numbered `0`, `1`, … in order. |
| `source` | `object` | Yes | — | What starts a run. |
| `source.type` | `enum` | Yes | `schedule`, `file`, `webhook`, `webpage`, `rss`, `custom`, `wecom` | `schedule`, `file` and `webhook` start runs. `webpage`, `rss`, `custom` and `wecom` are accepted but nothing produces their events. Messages to a bot reach a Digital Human through its bot binding, not through a trigger. |
| `source.config` (`schedule`) | `object` | Yes | — | When to run: `every` or `cron`. |
| `source.config.every` (`schedule`) | `string` (duration) | No | — | Interval such as `30m`, `2h` or `1d` (units `s`, `m`, `h`, `d`). If both `every` and `cron` are set, `every` wins. |
| `source.config.cron` (`schedule`) | `string` (cron) | No | — | Cron expression with 5 fields, or 6 with seconds first, such as `0 9 * * 1-5`. It is checked when the spec is saved. |
| `source.config.workday_calendar` (`schedule`) | `boolean` | No | — | `true` runs only on mainland China working days, including make-up workdays, and skips public holidays. Use it with a schedule that fires every day, not `1-5`. |
| `source.config` (`file`) | `object` | Yes | — | Which file changes start a run. |
| `source.config.pattern` (`file`) | `string` | No | — | Glob matched against the changed file's path inside its own workspace, such as `inbox/*.csv`. It matches the same path in every workspace Halo watches, not only this one. |
| `source.config.path` (`file`) | `string` | No | — | Folder whose files count, matched as part of the absolute path. Halo does not limit a file trigger to the Digital Human's own workspace: changes in any workspace it watches (those open in the app and those of other file triggers) count. Set `path` to a folder inside this workspace to keep the trigger there. |
| `source.config` (`webhook`) | `object` | Yes | — | An HTTP endpoint at `/hooks/<path>` that other systems post JSON events to. |
| `source.config.path` (`webhook`) | `string` | No | — | Path after `/hooks/`. Use lower case and a path no other Digital Human uses. |
| `source.config.secret` (`webhook`) | `string` | No | — | Shared secret for the HMAC-SHA256 signature every request must carry. Without it, anyone who can reach Halo can start the Digital Human. |
| `source.config` (`webpage`) | `object` | Yes | — | **No effect:** no event source produces this trigger. Meant to watch a web page for changes. To check a page, use a `schedule` and let the Digital Human open it in the AI Browser. |
| `source.config.watch` (`webpage`) | `string` | No | — | **No effect:** no event source produces this trigger. What to watch on the page. |
| `source.config.selector` (`webpage`) | `string` | No | — | **No effect:** no event source produces this trigger. CSS selector to focus on. |
| `source.config.url` (`webpage`) | `string` | No | — | **No effect:** no event source produces this trigger. Page URL. |
| `source.config` (`rss`) | `object` | Yes | — | **No effect:** no event source produces this trigger. Meant to follow an RSS feed. Use a `schedule` that reads the feed instead. |
| `source.config.url` (`rss`) | `string` | No | — | **No effect:** no event source produces this trigger. Feed URL. |
| `source.config` (`custom`) | `map<string, any>` | Yes | — | **No effect:** no event source produces this trigger. Free-form settings for a custom event source. Halo has none built in. |
| `source.config` (`wecom`) | `object` | Yes | — | **No effect:** no event source produces this trigger. Meant for WeCom messages. To have a Digital Human answer a WeCom bot, bind the bot to it in Settings › Message Channels. |
| `source.config.chatId` (`wecom`) | `string` | No | — | **No effect:** no event source produces this trigger. Chat to listen to. |
| `frequency` | `object` | No | — | Meant as the range of intervals a user may pick. Halo does not enforce it. |
| `frequency.default` | `string` (duration) | Yes | — | Suggested interval. It does not change when runs happen: set the schedule's `every` or `cron` for that. |
| `frequency.min` | `string` (duration) | No | — | **No effect:** accepted, but nothing reads it. Meant as the shortest interval a user may pick. |
| `frequency.max` | `string` (duration) | No | — | **No effect:** accepted, but nothing reads it. Meant as the longest interval a user may pick. |
| `config_key` | `string` | No | — | **No effect:** accepted, but nothing reads it. Meant to feed a setting into the trigger. It must name an existing `config_schema` key, or the spec is rejected, but the value is never used. |

### `filters` {#field-filters}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `field` | `string` (non-empty) | Yes | — | **No effect:** accepted, but nothing reads it. Event field to test. |
| `op` | `enum` | Yes | `eq`, `neq`, `contains`, `matches`, `gt`, `lt`, `gte`, `lte` | **No effect:** accepted, but nothing reads it. Comparison. |
| `value` | `any` | Yes | — | **No effect:** accepted, but nothing reads it. Value to compare with. |

### `memory_schema` {#field-memory-schema}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `<field>.type` | `string` (non-empty) | Yes | — | Kind of value, as a hint such as `string`, `number`, `date` or `array`. |
| `<field>.description` | `string` | No | — | What the entry holds and how to update it. |

### `output` {#field-output}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `notify` | `object` | No | — | **No effect:** accepted, but nothing reads it. Notification settings. |
| `notify.system` | `boolean` | No | — | **No effect:** accepted, but nothing reads it. Desktop notifications. The user sets them per Digital Human under Messages & Notifications › System Notifications. |
| `notify.channels` | `enum[]` | No | `email`, `wecom`, `dingtalk`, `feishu`, `webhook` | **No effect:** accepted, but nothing reads it. Notification channels. |
| `format` | `string` | No | — | **No effect:** accepted, but nothing reads it. Output format. |

### `escalation` {#field-escalation}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `enabled` | `boolean` | No | — | **No effect:** accepted, but nothing reads it. `false` does not stop it from asking, and `true` changes nothing. How far it may act alone comes from the system prompt. |
| `timeout_hours` | `number` | No | > 0 | Hours a question waits before it expires; the run then ends as failed. Without it, a question waits until someone answers. |

### `browser_login` {#field-browser-login}

| Field | Type | Required | Default / values | Description |
|---|---|---|---|---|
| `url` | `string` (URL) | Yes | — | Sign-in page. |
| `label` | `string` (non-empty) | Yes | — | Name of the site, shown to the user. |
<!-- /generated:spec-fields -->

## Fields that have no effect {#no-effect}

Halo accepts these fields so that older specs still install, but nothing reads them. Don't rely on them:

- `output` (notifications and format). For notifications, ask for them in `system_prompt`; the Digital Human sends them through the channels set up in **Settings › Message Channels**. Desktop notifications are set per Digital Human under **Messages & Notifications › System Notifications**.
- `escalation.enabled`, which is never read. A Digital Human can always stop and ask; how far it may act alone comes from `system_prompt`. Only `escalation.timeout_hours` has an effect.
- `filters`. Write such conditions into `system_prompt`.
- `subscriptions[].config_key` (checked, then ignored), `subscriptions[].frequency.min` and `.max`, and `requires.mcps[].bundled`.
- The trigger types `webpage`, `rss`, `custom` and `wecom`: nothing produces their events. Use a `schedule` that checks the page or feed, and bind a bot in **Settings › Message Channels** for chat messages.

## Related {#related}

- [Tutorial: build a browser-automation Digital Human](/en/developers/digital-humans/build)
- [Production-grade Digital Humans](/en/developers/digital-humans/production): prompts, memory and browser scripts that hold up
- [DHP protocol](/en/developers/dhp): packages, registries and distribution
- [API recipes](/en/developers/api/recipes#webhook): a webhook trigger end to end
