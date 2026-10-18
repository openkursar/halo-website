---
title: "Tutorial: build a browser-automation Digital Human"
description: "Tutorial: turn Halo's OA approval sample into a Digital Human that works in a web system you sign in to, with bundled browser scripts, memory and safe defaults."
type: tutorial
audience: [developer]
---

# Tutorial: build a browser-automation Digital Human

In this tutorial you adapt a sample into a Digital Human that works inside a web system you sign in to. The sample is an approval assistant for an office system: every 30 minutes it lists your pending approvals, handles the ones that match your rules, and reports the rest. Along the way you meet every part of a production Digital Human: the spec, bundled browser scripts, memory, a login, and a safe default.

## Before you start {#before-you-start}

- Halo with an AI model set up.
- A web system you sign in to in a browser, such as an approval, ticket or CRM system, whose pages you can inspect with the browser's developer tools.
- Some JavaScript, if you want to adapt the scripts by hand. Halo can also adapt them for you.

## 1. Download the sample {#download}

Download [oa-approval-agent.zip](/downloads/oa-approval-agent.zip) and unzip it into your workspace folder:

```text
oa-approval-agent/
├── spec.yaml                 the Digital Human
├── README.md
└── skills/
    ├── oa-todo-list/         script: list pending approvals
    ├── oa-approve/           script: approve or reject one
    └── oa-approved-list/     script: list approved items, to double-check
```

::: warning The sample does not run as it is
Its addresses, API paths and field names are placeholders such as `your-oa.example.com`. You replace them with your system's in step 4.
:::

## 2. Read the spec {#spec}

Open `spec.yaml`. Five parts matter:

- **`requires.skills`** lists the three scripts as bundled skills, so they are installed with the Digital Human into its workspace's `.claude/skills/`, the paths the prompt's `browser_run` calls use.
- **`system_prompt`** is a procedure: a list of forbidden actions, then numbered steps that each name the exact call, such as `browser_run({ file: ".claude/skills/oa-todo-list/index.js", params: { pageSize: 30 } })`, and what to do when it fails. The last step reports with `report_to_user`.
- **`config_schema`** is the settings form. `auto_approve` is a `boolean` that defaults to `false`, so the Digital Human only reports until you turn it on. `max_approvals_per_run` caps how many it may handle in one run.
- **`memory_schema`** keeps `processed_todos`, so an item is never handled twice, plus the time of the last run and running totals.
- **`browser_login`** names the system's address, so Halo asks you to sign in there.

Each field is described in the [spec reference](/en/developers/digital-humans/spec).

## 3. Read a browser script {#script}

Open `skills/oa-todo-list/index.js`. It is one `async (params) => { … }` function that runs inside the signed-in page:

```js
async (params) => {
  const { pageSize = 30 } = params || {}
  try {
    const resp = await fetch(`https://your-oa.example.com/api/todo/list?pageSize=${pageSize}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!resp.ok) {
      return { success: false, status: resp.status, error: resp.status === 401 ? 'not logged in' : `HTTP ${resp.status}` }
    }
    const data = await resp.json()
    return { success: true, todos: data.list ?? [] }
  } catch (e) {
    return { success: false, error: e.message }
  }
}
```

The script calls the system's own API with the session you signed in with, and it never throws: every outcome comes back as `{ success, … }`, so the prompt can tell "not logged in" from other failures. This is shortened from the file; the full rules are under [Browser scripts](/en/developers/digital-humans/production#browser-scripts).

## 4. Adapt it to your system {#adapt}

Find the requests your system makes. Sign in to it in a browser, open the developer tools on the **Network** tab, filter for **Fetch/XHR**, and approve or reject one item. Note each request's URL, method, body and the fields of its response.

Then adapt the package in one of two ways:

- **Let Halo do it.** In a conversation in this workspace, say: "Adapt the Digital Human in the oa-approval-agent folder to our approval system at `<YOUR_SYSTEM_URL>`. The list of pending items comes from `<LIST_REQUEST>` and approving one sends `<APPROVE_REQUEST>`. Update the three scripts, `browser_login` and the address in the first step of `system_prompt`, and keep the rest of the spec."
- **By hand.** In each `index.js`, replace the base address, the API paths and the field names. In `spec.yaml`, set `browser_login[].url` and the address in the first step of `system_prompt`.

If an action needs a token from the page, such as a CSRF token in a form field, have the script read it from the page before it calls the API.

## 5. Import it and sign in {#import}

1. In Halo, open **Digital Humans**, click **Create Digital Human**, choose **Import**, and drop the `oa-approval-agent` folder (or a `.zip` of it). Import installs the bundled scripts along with the Digital Human.
2. Open the new Digital Human, go to **Capabilities and settings**, and fill in the keyword settings. Leave `auto_approve` (labelled 自动审批 in the sample) off.
3. Above the Digital Human's **Work activity**, click **Open to log in** for your system and sign in.

## 6. Test it {#test}

1. Click **Run now** on the Digital Human's page.
2. Open **Work activity** and read the run's report. With `auto_approve` off it only suggests: it lists what it would approve and reject, and changes nothing in your system.
3. If the report says it is not logged in, sign in again with **Open to log in**. If a script fails, its error is in the report; debug it as described under [Develop and debug a script](/en/developers/digital-humans/production#script-debugging).
4. When a few reports match what you would have decided, narrow the keywords to a small, safe set and turn `auto_approve` on.

::: done
The Digital Human now checks your system every 30 minutes on its own, handles only items that match your rules, never more than `max_approvals_per_run` at once, and reports the rest to you.
:::

## 7. Share it {#share}

In the desktop app, on the Digital Human's page, click **⋮ › Share › Export** to get a `.dhpkg` package, or submit it to a Store, where it is listed after review. See [Publish to the Store](/en/developers/store-publishing). Remove company addresses and names before you share it outside your company.

## Troubleshooting {#troubleshooting}

| What you see | What to do |
|---|---|
| The report says the OA login has expired (HTTP 401) | Sign in again with **Open to log in**. Sessions expire on the system's side |
| `Path not allowed` | The script is outside the workspace and its `.claude/skills/` folder. Import the package with **Create Digital Human › Import** so the skills land in the workspace |
| The Digital Human doesn't run on its own | Check `subscriptions` (the sample runs on `every: "30m"`) and that it isn't paused. Scheduled runs are also skipped while one of its questions is unanswered, such as its request to sign in again: answer it in **Work activity** |
| Items are handled twice | The last step must write the handled ids into memory before the report |

## Next steps {#next-steps}

- [Production-grade Digital Humans](/en/developers/digital-humans/production): prompts, memory and scripts that hold up
- [Digital Human spec reference](/en/developers/digital-humans/spec): every field
- [DHP protocol](/en/developers/dhp): how a package is laid out
