---
title: "Production-grade Digital Humans: prompts & scripts"
description: "Make a Halo Digital Human reliable enough to run unattended: a step-by-step prompt, memory that prevents repeats, browser scripts, logins and safe limits."
type: how-to
audience: [developer]
---

# Production-grade Digital Humans

A Digital Human that works once in a demo can still fail when it runs every morning on its own. This page collects the practices that keep one reliable: where the AI should decide and where a script should act, how to write its instructions and memory, how to automate websites with browser scripts, and what to check before it goes live.

## The principle: the AI decides, scripts act {#principle}

Letting the AI click through a website step by step works while you explore, but it does not hold up in daily runs:

- **Cost**: every step needs a fresh page snapshot, which uses many tokens.
- **Speed**: every step waits for the model to reason.
- **Consistency**: the model can take a different path each time.

So split the work. The AI reads its configuration and memory, decides what to do, calls a script, reads the result and decides the next step. Everything repetitive and precise, such as calling a site's API, filling a form or extracting a table, lives in a script that does the same thing every time:

```text
Digital Human
├── system_prompt   → the plan: numbered steps and the exact tool calls
├── browser scripts → the repetitive actions, in a skill folder
└── memory_schema   → what to remember between runs
```

## Write the system prompt as a procedure {#system-prompt}

The system prompt is the only place the Digital Human learns what to do. Give it the same structure every time:

1. **Role**: one sentence on what it is responsible for.
2. **Configuration**: which settings from `config_schema` it uses and how. Every run receives the current values.
3. **Forbidden actions**: what it must never do, and what needs a person's decision first.
4. **Numbered steps**: each step names the tool or script to call, with its arguments, and what to do with each possible result.
5. **Last step**: update memory, then report with `report_to_user`.

`report_to_user` is how a run tells the user what happened. Pick the type deliberately:

| Type | Use it for |
|---|---|
| `run_complete` | The run finished; nothing is needed from the user. Also for errors: say what broke |
| `run_skipped` | There was nothing to do this time |
| `milestone` | Something important happened and the run continues |
| `escalation` | A person must decide. The run waits for the answer |
| `output` | A file or report was produced; say where |

Desktop notifications follow the Digital Human's **Messages & Notifications › System Notifications** level. By default only milestones, escalations and outputs notify. External notifications (email, WeCom, Feishu, DingTalk, webhook) go out when the AI decides to send one, through the channels set up in **Settings › Message Channels**. To make one reliable, write it into a step: "when an order is rejected, notify the sales channel".

## Remember what was done {#memory}

Each Digital Human has its own memory file, loaded at the start of every run. Describe what it should keep with `memory_schema`; the descriptions guide the AI, and nothing checks them:

```yaml
memory_schema:
  processed_ids:
    type: array
    description: Ids of items already handled. Skip them; keep the last 500.
  last_run_at:
    type: date
    description: When the last run finished.
  consecutive_failures:
    type: number
    description: Failed runs in a row. Reset to 0 after a success.
```

- **Avoid repeats** with a list of processed ids (simple, but keep it bounded) or a "last seen" timestamp (compact, but needs a reliable time field on the items).
- **Count failures** and escalate after a few in a row, instead of failing silently every day.
- Make "update memory" a numbered step of its own, before the report, so a run that fails halfway does not record work it never did.

The user can see the file and clear it with **Clear Memory** on the Digital Human's page. Clearing it does not touch the workspace's files.

## Browser scripts with `browser_run` {#browser-scripts}

A browser script is a JavaScript file that the Digital Human runs inside a page of Halo's built-in browser with the `browser_run` tool. It is how a recurring web task becomes fast and repeatable.

### When to write one {#when-to-script}

- The same sequence of steps will run again, every day or for every item.
- The task needs real control flow: loops over an unknown number of rows, branching on page content, retries.
- You want to read, compute and return structured data in one call, instead of having the AI read page snapshots.

For a single one-off interaction, the interactive tools (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill`) are simpler and re-check the page after every step.

### The file format {#script-format}

```js
async (params) => {
  const rows = document.querySelectorAll(params.rowSelector)
  return Array.from(rows).map((row) => row.innerText.trim())
}
```

- The file holds exactly one arrow function, written `async`. Halo calls it with your `params`. Don't call it yourself, and put nothing after the closing `}`.
- `params` is a single JSON object. It cannot carry an element from a page snapshot: pass a selector or text and find the element inside the script.
- The script runs in the page, like code in the browser's developer console: `document`, `window`, `fetch` and the page's own cookies are there; `require`, `import` and Node.js modules are not.
- Return plain JSON. A DOM element or a function comes back as `{}`. A thrown error comes back as `Script execution failed: <message>`.
- Return a clear shape, such as `{ success: true, items: [...] }` or `{ success: false, error: "not logged in" }`, so the prompt can say what to do with each case.

A script can call the site's own API with `fetch`; because it runs in the page, the request carries the session the user signed in with. When the site has no usable API, read and write the page itself (DOM).

### Where the file must be {#script-location}

`browser_run` takes `{ file, params, timeout }` and runs a file only from:

- anywhere inside the Digital Human's workspace folder, including its `.claude/skills/<skill>/` folders, where a skill installed for that workspace lands;
- a `.claude/skills/` folder in a folder above the workspace, or in your home folder.

A file anywhere else is refused with `Path not allowed`. With Halo's default configuration folder, that includes a skill installed for all workspaces. A relative `file` path starts from the workspace folder, and the file must end in `.js`.

To ship scripts with a Digital Human, put them in a skill and declare it as bundled, so it is installed into the same workspace:

```yaml
requires:
  skills:
    - id: order-tools
      bundled: true
      files: [SKILL.md, list-orders.js, approve-order.js]
```

In the package the files sit under `skills/order-tools/`. See [DHP protocol](/en/developers/dhp). The skill's folder in the workspace is named after the `name` in its `SKILL.md`, so use the same lower-case ASCII name there, for the folder under `skills/` and as the `id` in `requires.skills`: the prompt calls the script by that path.

### Timeouts {#script-timeout}

`timeout` is in milliseconds: 60000 by default, at least 1000, at most 120000. It only limits how long the tool waits. The script itself keeps running in the page after a timeout, so give your own `fetch` calls a timeout, and navigate to the page again before the next step if one hangs.

### Develop and debug a script {#script-debugging}

1. Get the logic working first as a one-off `browser_evaluate` call on the live page. It runs the same way, without the file round trip.
2. Save the working body as a `.js` file in the allowed location.
3. Call `browser_run` with small, known-safe `params`, and compare the result with step 1.
4. If it fails only as a file, check the format: a missing `async`, something after the closing `}`, or a `params` key that doesn't match.
5. When the error doesn't explain itself, run `browser_inspect` right away, before navigating: `target: "console"` shows errors the page logged, and `target: "network"` with `resourceTypes: ["fetch", "xhr"]` shows the requests and their responses.

## Sites that need a login {#login}

- Declare each site in `browser_login`. Halo then shows a notice with **Open to log in** above the Digital Human's **Work activity**, and lists the sites under **Required Logins** in its **Capabilities and settings**. The user signs in there; the Digital Human never sees a password.
- All Digital Humans and the main chat share one browser profile on this computer. A sign-in from anywhere works for all of them, and signing out anywhere signs out all of them. **Settings › System › Clear browser data** signs out every site at once.
- Halo does not check that the user actually signed in, and cannot tell when a site ends the session. Have the script detect a login page and return `{ success: false, error: "not logged in" }`, and have the prompt escalate in that case instead of retrying.
- Some sites tie a session to the browser type. If a sign-in stops working after the Digital Human switched to the mobile view (`device: "h5"`), sign in again in the view it runs in.
- A login does not move to another computer: after moving Halo, sign in again there.

## Guard actions that can't be undone {#safety}

For a Digital Human that approves, books, sends, pays or deletes:

- Add a switch to `config_schema`, such as `auto_approve` (`boolean`, default `false`). While it is off, the prompt only reports what it would do.
- List the forbidden actions in the prompt, and require an `escalation` for anything the configuration does not allow.
- Cap the work per run with a setting such as `max_actions_per_run`.
- Set `escalation.timeout_hours` when an old answer would do harm. Without it, a question waits until someone answers.
- `escalation.enabled` has no effect, and the Digital Human can always ask. Its autonomy is exactly what the prompt allows.

## Test and watch it {#testing}

- Click **Run now** on the Digital Human's page and read the run in **Work activity**: each run shows its reports and the questions it asked.
- To see every step a run took, through the API, use [`GET /api/apps/:appId/runs/:runId/session`](/en/developers/api/digital-human#get-api-apps-appid-runs-runid-session).
- Start with the report-only switch on, check a few runs against what you would have done, then let it act.

## Before it goes live {#checklist}

- [ ] Every step of the prompt names its tool or script and handles failure.
- [ ] Repetitive web actions are scripts in a bundled skill, not step-by-step clicking.
- [ ] Memory prevents repeats and is updated before the report.
- [ ] Sites that need a login are listed in `browser_login`, and the script detects an expired session.
- [ ] Irreversible actions are behind a switch that is off by default, with a per-run cap.
- [ ] The trigger is set: a `schedule`, a `file` trigger with a `path`, or a `webhook` with a `secret`. See the [spec reference](/en/developers/digital-humans/spec#field-subscriptions).
- [ ] The spec, its settings' defaults and the bundled files contain no API keys, passwords or webhook secrets. The check before publishing only looks for a few common key formats in the system prompt (see [pre-flight checks](/en/developers/store-publishing#preflight)), so don't rely on it, and export checks nothing.

## Related {#related}

- [Digital Human spec reference](/en/developers/digital-humans/spec)
- [Tutorial: build a browser-automation Digital Human](/en/developers/digital-humans/build)
- [Writing skills](/en/developers/skills)
- [AI Browser](/en/features/ai-browser): how the built-in browser works for users
