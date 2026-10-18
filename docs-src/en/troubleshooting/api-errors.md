---
title: "Model API error codes: 401, 429, 5xx and fixes"
description: "What Halo shows when a model service returns 401, 402, 403, 404, 429 or 5xx, which errors retry on their own, and whether to check key, quota or network."
type: reference
audience: [office, developer]
related: [troubleshooting/common-errors, features/models, advanced/gateway-and-proxy]
---

# Model API error codes

This page goes through the status codes and keywords in errors returned by a model service: what each one means and how to handle it in Halo. If you see one of Halo's own messages, such as "Invalid API Key or no permission" or "The model service is limiting requests", check [Error messages](/en/troubleshooting/common-errors) first.

When the model service fails, Halo's AI can't work either, so the steps on this page are yours to do. If you have another model source that works, switch to it in the model card next to the composer and ask it about the error text.

## Where errors show up {#where-errors-show}

| Where | What you see |
|---|---|
| A retry card in the reply | Appears when a request fails and Halo is about to try again. The title gives the reason, next to it is the HTTP status, below are two lines from the provider, plus "Attempt N of M" and **Stop**. If a retry succeeds, the reply carries on |
| "Something went wrong" in the reply | When Halo stops retrying or runs out of retries, the turn stops and shows "Something went wrong" with the error text, for example `API Error: 429 {"error": …}` |
| The thought process above the reply | The failed step holds the error text. Click **Copy** (tooltip "Copy error message") to copy it; for errors over 600 characters, click **Expand full error** to read it all |
| **Settings › AI Model** | Errors while saving, fetching the model list or running **Test connection** use different messages; see [Connecting a model or fetching its model list](/en/troubleshooting/common-errors#model-setup) |

## Status codes {#status-codes}

| Status | Usual cause | What Halo shows | What to do |
|---|---|---|---|
| 400 | The provider rejected the request: the conversation is too long, the model doesn't accept images, or a parameter is over the model's limit | Usually stops right away with "Something went wrong" | Read the error text; see [Conversation too long](#context-too-long), [Model rejects images](#images-rejected), [Output limit](#max-output) |
| 401 | The key is invalid or revoked, or the sign-in has expired | Retry card "The model service rejected the credentials", or stops right away | Paste the key again in **Settings › AI Model**; for a signed-in account, sign in again with the same account |
| 402 | Unpaid account or insufficient balance | No retry; stops right away | Top up in the provider's console or switch to another model source; see [Quota used up or unpaid](#quota) |
| 403 | The account has no access to this model, or the provider doesn't serve your region | Usually stops right away | Pick another model, or check the account's access in the provider's console |
| 404 | Wrong model name or API URL | Usually stops right away | See [Model not found](#model-not-found) |
| 413 | The request is too large, usually too many or too large images or attachments | Usually stops right away | Send fewer images or compress them; if the conversation is already long, start a new one |
| 429 | Too many requests; you're rate-limited | Retry card "The model service is limiting requests", retries automatically | Let it retry; see [Rate limits](#rate-limit) |
| 500, 502, 503 | Something went wrong on the provider's side | Retry card "The model service returned an error", retries automatically | Wait and send again; if it keeps happening, check the provider's status page; on a company gateway, contact your admin |
| 504 | The provider or gateway timed out | Retries automatically | Same as above; split long tasks into steps |
| 529 | The service is too busy (Anthropic uses this code) | Retry card "The model service is overloaded", retries automatically | Wait a moment or pick another model |
| No status | Halo can't reach the model service: network, proxy or certificate trouble | Retry card "Could not reach the model service" | See [Can't reach the model service](#cannot-connect) |

- Errors from 400 to 413 won't go away on a retry, so Halo usually stops right away. Rate limits, busy services and dropped connections are temporary and retry automatically.
- The card title follows the type of error; the table shows the most common pairing. When in doubt, go by the status on the card and the provider's text.
- Behind a company gateway or a third-party relay, the status comes from them and can differ slightly from the official meaning.

## Quota used up or unpaid {#quota}

Words such as `402`, `insufficient_quota`, `Insufficient Balance`, `credit balance`, `usage limit`, 余额不足, 额度 or 配额 in the error mean the quota is used up or the account is unpaid.

- Halo doesn't retry these errors; the turn stops right away instead of waiting for nothing.
- If the provider's error asks to retry in a few hours, Halo doesn't sit and wait that long; it retries on its own schedule or reports the error.
- To fix it, top up in the provider's console or wait until the quota resets under the provider's rules. If you're in a hurry, switch to another model source in the model card.

## Rate limits {#rate-limit}

A `429` without words about quota or balance means too many requests.

1. Let the retry card count down first; most retries succeed.
2. If it happens often, run fewer conversations and Digital Humans at the same time; see [Work on several things at once](/en/features/parallel-work).
3. If that isn't enough, upgrade your plan with the provider, or move part of the work to another model source.

## Model not found {#model-not-found}

When the error is `404`, `model_not_found`, or "There's an issue with the selected model … It may not exist or you may not have access to it.":

1. Open the model card next to the composer, click the model name and pick a model from the list.
2. If a signed-in account's model list is out of date, click ↻ **Refresh Models** at the bottom of the model list.
3. With a **Custom API** source, go to **Settings › AI Model**, click **Edit** on that provider's card, and check the **API URL** and model ID against the provider's documentation.
4. If **Settings › Advanced › Claude CLI Integration** uses the **Claude CLI Default** config directory, settings in `~/.claude/settings.json` can override the model Halo picked; see [Overrides from a shared ~/.claude](/en/advanced/gateway-and-proxy#claude-cli-overrides).

## Conversation too long {#context-too-long}

When the error says the context is too long (`context_length_exceeded`, `maximum context length`, `prompt is too long` and similar), what was sent is longer than the model accepts.

Halo compacts older content automatically when a conversation is about to overflow, and the **Context Window** of the model decides when that happens. Halo treats a model it doesn't recognize as 200K; if the provider's model really holds only 64K or 128K, the conversation overflows before compaction starts.

1. Go to **Settings › AI Model**, click **Edit** on the card of the source this model belongs to, and expand **Model Configuration**.
2. Set **Context Window** to the value in the provider's documentation and save. Check it especially when the preset badge at the bottom of **Model Configuration** reads "No preset found — verify these values match your model".
3. Go back and continue the conversation, or start a new one.

Each setting is explained in [Per-model settings](/en/features/models#model-settings).

## Model rejects images {#images-rejected}

When the error says the model doesn't support images (`image`, `vision`, `does not support image input` and similar), the model most likely can't see images but Halo is sending them as if it could.

1. Turn off **Vision** in this model's **Model Configuration** and save.
2. Send again. The composer shows "Current model has no vision — images will be read via local OCR (text only)", and the text in the images is recognized on this computer and passed to the model.

For the model to understand the image itself, pick a model whose model card shows **Image input** as **Supported**; see [Files and images](/en/features/image-input#text-recognition).

## Output limit {#max-output}

When the error says `max_tokens` is too large or over the model's output limit, set **Max Output Tokens** in this model's **Model Configuration** to a value the provider allows. Below 20,000, Halo warns that the auto-compaction summary may be affected. It's only a warning; you can still save.

## Can't reach the model service {#cannot-connect}

When the retry card shows "Could not reach the model service", or the error contains `fetch failed`, `ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT` or `Connection error`:

- Check the network: make sure the provider's website opens in a browser.
- If you need a proxy to get out, enter it in **Settings › System › Proxy** and save; add an intranet model gateway to **Don't use the proxy for**. See [Model gateway and proxy](/en/advanced/gateway-and-proxy).
- If the error mentions certificates (`self signed certificate`, `unable to get local issuer certificate`), your company network is probably inspecting encrypted traffic. Ask IT to exempt the model service's address, or use the company's intranet model gateway instead.
- If the error starts with "Security software on this computer blocked Halo's internal connection to 127.0.0.1", the model, account and gateway are fine: security software on the computer blocked Halo's internal connection on this machine. Send IT the program named in the error and ask them to allow it to make local connections. Running **Settings › System › System Diagnostics** also shows this in the **Child process local connection** row; see [Logs and diagnostics](/en/troubleshooting/diagnostics#run-diagnostics).

## Sign-in failures {#sign-in}

Errors while signing in with Claude, ChatGPT, GitHub Copilot and other accounts:

| Message | Meaning | What to do |
|---|---|---|
| "OAuth token expired or invalid. Please login again." | The sign-in expired and the automatic refresh failed too | Sign in again with the same account; see [Connect an AI model › Troubleshooting](/en/getting-started/setup-ai#troubleshooting) |
| "A different account was authorized. Add it as a new account instead." | While signing an account in again, the browser was signed in to a different account | Sign in with the original account; to use the new one, add it as a new account |
| "Failed to bind 127.0.0.1:1455 or 1457" (ChatGPT) | ChatGPT sign-in receives its callback on these two local ports, and another program is using them, often a Codex sign-in in progress | Close the program that holds the ports, or let it finish signing in, then try again in Halo |
| "CLI-delegated sources run on the Claude Code engine…" | A source signed in with **Claude Code CLI** only works on the default engine | Switch **Settings › Advanced › AI Agent Engine** back to **Claude Code SDK**; see [Agent engines](/en/features/agent-engines#differences) |

For other sign-in problems, such as Halo still waiting after you finished signing in or a sign-in page that won't open, see [Connect an AI model › Troubleshooting](/en/getting-started/setup-ai#troubleshooting).

## Still stuck {#get-help}

- Copy the full error text: click **Copy** (tooltip "Copy error message") on the failed step in the thought process.
- Send the error, the provider and model you use, and the version from **Settings › About** to the provider or your support contact. To export logs and a diagnostic report, see [Logs and diagnostics](/en/troubleshooting/diagnostics).

<!-- public:start -->
You can also open an issue on [GitHub Issues](https://github.com/openkursar/hello-halo/issues).
<!-- public:end -->

## Next steps {#next-steps}

- [Error messages](/en/troubleshooting/common-errors): what Halo's own messages mean and what to do.
- [Models and accounts](/en/features/models): add accounts, pick a model per conversation and adjust each model's settings.
- [Model gateway and proxy](/en/advanced/gateway-and-proxy): settings for a company gateway or a proxy.
