---
title: "Help center: start here when Halo has a problem"
description: "Start here when something goes wrong in Halo: ask Halo first, look up the exact error text, or find the page for your problem; then what to send us."
type: hub
audience: [all]
related: [troubleshooting/common-errors, troubleshooting/install, troubleshooting/channels, troubleshooting/digital-humans]
---

# Help center

Start here when something goes wrong in Halo: ask Halo first, look up the exact error text, or pick the page for your kind of problem.

::: say
> Halo says "The model service is limiting requests". What does that mean, and what should I do?

Halo checks its own official documentation and tells you what the message means and how to fix it. Paste the full error text for a more precise answer.
:::

## Find your problem {#by-problem}

- [Error messages](/en/troubleshooting/common-errors): look up the exact message you see; conversation, model, attachment, Digital Human, bot and team messages are all there.
- [Model API error codes](/en/troubleshooting/api-errors): what status codes such as 401 and 429 mean.
- [Install and launch problems](/en/troubleshooting/install): Halo won't install or open, Mac and Windows security prompts, Windows "First-time setup required", where the logs are.
- [Bot not replying](/en/troubleshooting/channels): a WeCom, Feishu or WeChat bot doesn't receive or answer messages.
- [A Digital Human did not run](/en/troubleshooting/digital-humans): missed schedules, "Not started", stopped after repeated failures.
- [FAQ](/en/troubleshooting/faq): short answers to common questions such as cost, where your data goes, whether the AI asks before changing files, and offline and phone use.
- [Logs and diagnostics](/en/troubleshooting/diagnostics): run System Diagnostics, reset the AI engine, export a diagnostic report, find logs, and what to include in a bug report.

For team problems, see [Teams across computers](/en/digital-humans/cross-computer-teams#troubleshooting).

## Still stuck {#get-help}

When you ask for help, include these to save a round of questions:

1. What you did, what you expected, and what you actually saw.
2. The exact error: copy the text in the red box, or click **Copy** (tooltip "Copy error message") on the failed step in the thought process above the reply.
3. Your Halo version: **Settings › About**.
4. A diagnostics report: open **Settings › System › System Diagnostics**, click **Run Diagnostics**, then **Copy Report** or **Export Report**. The report doesn't contain the key itself. In error messages, Bearer tokens, JWTs and some keys starting with `sk-` are masked, but formats such as Anthropic (`sk-ant-…`) and OpenAI project keys (`sk-proj-…`) are not; user names in macOS and Linux paths are hidden, but not in Windows paths. Read it through before sending and delete any key you see.
5. If needed, the logs; see [Logs and diagnostics](/en/troubleshooting/diagnostics#logs).

<!-- public:start -->
Then open an issue on [GitHub Issues](https://github.com/openkursar/hello-halo/issues), or reach us through [Contact](/en/contact).
<!-- public:end -->

<!-- internal:support-contact -->

## Next steps {#next-steps}

- [Get started](/en/getting-started/): from install to your first finished task.
- [Guides](/en/features/): how each feature works.
