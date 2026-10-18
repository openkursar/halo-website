---
title: "Logs and diagnostics: report, logs, bug reports"
description: How to check Halo and collect information when something breaks. Run System Diagnostics, export a report, find logs and crash reports, and record full requests.
type: how-to
audience: [admin, office]
platforms: [macos, windows, linux]
related: [advanced/config-paths, troubleshooting/common-errors, advanced/security]
---

# Logs and diagnostics

When something goes wrong in Halo, check and fix it in Halo first; if you need help, collect information as this page describes. For the folder each log, report and crash dump lives in, see [Where Halo keeps your data](/en/advanced/config-paths#logs).

The steps on this page are yours to do in Settings; Halo's AI can't run diagnostics or export a report for you.

## Before you start {#before-you-start}

- **System Diagnostics**, **Log Files** and **Crash Reports** are in **Settings › System**, and **Developer Mode** is in **Settings › Advanced**. Both sections exist only in the desktop app <Badge type="info" text="Desktop only" />. If you're using the Remote Access web page or the Android app, go to the computer that runs Halo.
- Halo Server has no window; read its logs with `docker logs`, see [Deploy with Docker › Verify](/en/server/deployment-docker#verify).

## Run System Diagnostics {#run-diagnostics}

1. Open **Settings › System** and find **System Diagnostics** ("Check system health and fix issues").
2. Click **Run Diagnostics**. The button shows "Running..." and the result appears after a few seconds, with the details expanded.
3. The top line reads "System Healthy" or "Issues Detected", followed by the "Last check" time. Click that line to collapse or expand the details.

| Part | What it tells you |
|---|---|
| System Info | Version, platform, system memory, uptime |
| Health Metrics | Consecutive failures, recovery attempts, active processes, orphan processes found |
| Process Status | **Claude (AI Sessions)**: the AI session processes running. **Cloudflared (Tunnel)**: the tunnel process for internet access, "Not running" when no tunnel is started; the row is hidden when a company build disables the tunnel |
| Service Status | **OpenAI Router**: the service that forwards model requests on this computer. **HTTP Server**: the Remote Access service, "Not started" when Remote Access is off. **Child process local connection**: whether the AI engine's processes can reach the local forwarding service |
| Cleanup Actions | Dead process entries cleared and orphan processes found during the check |
| Recent Errors | The 5 most recent errors |

A service's status is "Healthy", "Not responding", "Not started" or "Failed".

"System Healthy" only means there are no consecutive failures, orphan processes or recent errors; it doesn't mean every row is fine. Also look through Process Status and Service Status for "Not responding" or "Failed".

::: done
With "System Healthy" and every process and service row fine, Halo's own processes and services are working. If the problem remains, it's most likely the model service, the network or a specific feature; see [Model API error codes](/en/troubleshooting/api-errors) and [Error messages](/en/troubleshooting/common-errors).
:::

When **Child process local connection** shows "Failed" with "Security software on this computer blocks Halo's internal connection. Ask your IT team to allow this program to make local connections: …", model requests from conversations and Digital Humans all fail, but the model and account are fine. Send IT the program named in the message and ask them to allow it.

## Recover: reset the AI engine or restart {#recover}

**Recovery Actions** in the expanded **System Diagnostics** have two buttons; when one succeeds, the diagnostics run again by themselves:

| Button | What it does | When to use it |
|---|---|---|
| **Reset AI Engine** | "Kill all AI sessions and restart - fixes most issues". Replies in progress are interrupted; conversation history stays | A reply stays stuck, or every conversation reports the same error |
| **Restart App** | Restarts all of Halo | Resetting the AI engine didn't help |

You can also click **Restart** under **Settings › System › Restart Halo**. The confirmation warns: "All active conversations and background tasks will be interrupted."

Halo also handles some problems on its own:

- **The AI engine keeps failing**: after 3 consecutive errors, Halo resets the AI engine by itself. At 5, it shows the dialog "Halo is having trouble", where you can choose **Restart App**, **Try to Fix** (reset the AI engine) or **Ignore**. Tick "Don't show again this session" to stop it from coming back until Halo restarts.
- **The window crashes**: Halo reloads a crashed window by itself, at most 3 times a minute. If it crashes again, Halo stops reloading it and shows "Halo window stopped" with **Restart Halo** and **Later**. Digital Humans and background tasks keep running; click **Restart Halo** when convenient. The dialog follows the system language.

## Export a diagnostic report {#report}

When you ask someone for help, give them the diagnostic report first, not logs or config files.

1. In **Settings › System › System Diagnostics**, click **Run Diagnostics**.
2. Click **Copy Report** to copy a text report to the clipboard; the button briefly shows "Copied!". Or click **Export Report** to save a file; Halo shows "Report exported to" with the full path.
3. The exported file is in your Downloads folder, named `halo-diagnostics-<timestamp>.json`.

The report contains:

- the Halo version, operating system and chip architecture, memory and uptime;
- the type of model provider in use, whether a key is configured (just "Yes" or "No") and the number of MCP servers; the exported file also has the domain of the current model service;
- process and health counters, and the 10 most recent errors and warnings.

The report never contains a key itself. Bearer tokens, JWTs and some `sk-` keys in error messages are masked, but formats such as Anthropic keys (`sk-ant-…`) and OpenAI project keys (`sk-proj-…`) are not. The user name in macOS and Linux paths is removed; in Windows paths (`C:\Users\…`) it is not. Read the report before you send it and delete any key you find.

## Find the logs {#logs}

Open **Settings › System › Log Files** and click **Open Folder**. If Halo won't open, go to the folder directly using the paths in [Where Halo keeps your data › Logs](/en/advanced/config-paths#logs).

| File | When to look |
|---|---|
| `main.log` | Almost any problem. Halo's main log; it rotates at 10 MB and keeps 5 older copies (`main.1.log` to `main.5.log`) |
| `halo-sdk.log` | Problems with the Halo SDK engine |
| `http-raw.log` | Only exists after you turn on Developer Mode; see [the next section](#developer-mode) |
| `auth-audit.log` | Remote Access sign-ins: successes, failures, lockouts and source IPs, never passwords. On macOS it's in the `logs` folder of the app data folder; see [Logs](/en/advanced/config-paths#logs) |

`main.log` is for troubleshooting, not for sharing. It contains file and workspace paths, conversation and Digital Human IDs, model service addresses, the providers' error text, and your proxy address, written as is, including any user name and password in it. Halo masks the keys it writes itself, but it can't promise the log holds nothing else sensitive.

::: warning Before you send a log
Read it first. Send only the part the other person needs, or the few minutes around the problem; don't zip up the whole folder.
:::

## Record full requests with Developer Mode {#developer-mode}

When a problem with the model service, a company gateway or a proxy doesn't show in `main.log`, use Developer Mode to record the full requests and responses.

1. Turn on **Settings › Advanced › Developer Mode**. It takes effect at once, with the note "Generates large log files and may affect performance. Disable after troubleshooting."
2. Go back to the conversation and repeat what went wrong.
3. Turn **Developer Mode** off.
4. Open the log folder. `http-raw.log` holds the full request headers and bodies for that time, and `main.log` and `halo-sdk.log` gain debug detail.

::: danger http-raw.log contains your keys and full conversations
This file masks nothing: it records API keys, sign-in tokens and conversation content as they are. Don't send it to anyone as is, and delete it when you're done. To show someone, use the [diagnostic report](#report), or copy out only the relevant lines and remove any keys.
:::

## Crash reports {#crash-reports}

When Halo crashes, a crash dump is left in `Crashpad/` inside the app data folder. Open **Settings › System › Crash Reports** and click **Open Folder** to find it.

- "Crash reports stay on this computer. Open the folder to send them to support when asked." Halo doesn't upload them.
- Send them only when someone asks for them.

## What to include in a bug report {#bug-report}

1. What you did, what you expected and what you saw. If you can reproduce it, write the steps.
2. The error text: click **Copy** (tooltip "Copy error message") on the failed step in the thought process. If there is no error, take a screenshot that shows no keys, accounts or company information.
3. The Halo version (**Settings › About**) and your operating system version.
4. The [diagnostic report](#report).
5. If asked, the relevant part of the logs.

<!-- public:start -->
Then open an issue on [GitHub Issues](https://github.com/openkursar/hello-halo/issues) with the **Bug Report** template, or reach us through [Contact](/en/contact). Don't report security vulnerabilities in a public issue; [report them privately](https://github.com/openkursar/hello-halo/security/advisories/new) on GitHub.
<!-- public:end -->

<!-- internal:support-contact -->

## Troubleshooting {#troubleshooting}

### System Diagnostics isn't in Settings

You're probably on the Remote Access web page or the Android app. **Settings › System** exists only in the desktop app; open it on the computer that runs Halo.

### Export Report finished, but you can't find the file

Look at the path after "Report exported to". By default it's your system's Downloads folder, and the file name starts with `halo-diagnostics-`.

### The top of the window says "The configuration file cannot be read. Halo has paused saving settings to protect your data."

Halo can't read its config file `config.json`; the notice shows its path. For example, the file was damaged by a manual edit, or a sync tool or antivirus is holding it. Settings you change in the meantime aren't saved and show "Not saved".

1. Repair the file, or wait until the program holding it is done.
2. Click **Check again**. Once it reads again, Halo shows "Settings reloaded".

The file holds keys in plain text; don't send it to anyone. See [Keys and credentials](/en/advanced/security#credentials).

### You forgot to turn off Developer Mode

The logs keep growing, and `http-raw.log` keeps recording full requests. Turn off **Developer Mode** in **Settings › Advanced**, then delete `http-raw.log`.

## Next steps {#next-steps}

- [Where Halo keeps your data](/en/advanced/config-paths): the exact paths of logs, reports and crash dumps on each system.
- [Error messages](/en/troubleshooting/common-errors): look up the message you saw and what to do.
- [Security, privacy and data flow](/en/advanced/security#logs): what the logs contain and what to watch before sending them.
