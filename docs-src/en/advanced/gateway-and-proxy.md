---
title: "Model gateway and proxy: company API gateway setup"
description: Add your company's OpenAI- or Anthropic-compatible model gateway to Halo as an AI source, set a proxy and bypass list, and see what works offline.
type: how-to
audience: [admin, developer]
related: [features/models, getting-started/api-keys, features/settings, advanced/security]
---

# Model gateway and proxy

You add AI sources and change the proxy yourself in **Settings**; Halo can't do these for you. Once a source exists, turn on **Operate Halo** and you can say "switch this conversation to the company gateway model" to have Halo move between existing sources. See [Models and accounts](/en/features/models).

## Before you start {#before-you-start}

Get these from your gateway administrator:

| What you need | Example | Where it goes |
|---|---|---|
| Gateway address | `https://ai-gateway.example.com/v1` | **API URL** |
| A key | `<YOUR_TOKEN>` | **API Key** |
| API format | OpenAI-compatible, or Anthropic (Claude) format | Decides the **Provider**, see [Which format to choose](#which-format) |
| Model IDs | The model names configured on the gateway | Typed by hand if the gateway has no model list |

- You can add an AI source in the desktop app and in a browser opened through [Remote Access](/en/features/remote-access). The proxy in **Settings › System** exists only in the desktop app.
- The first-run setup also offers **Custom API** and works the same way: enter the **API Key**, choose the **Provider**, edit the auto-filled **API URL** to the gateway address, then click **Save and enter**.

## Add a company gateway as an AI source {#gateway-as-source}

1. Open **Settings › AI Model** and click **Add AI Provider**.
2. In **Provider**, pick the format: **OpenAI API** (the default) for an OpenAI-compatible gateway, **Claude (Anthropic) API** for an Anthropic-format gateway. Not sure? See the next section.
3. Give it a recognizable **Display Name**, such as "Company gateway". Paste the gateway key into **API Key**.
4. Change **API URL** to the gateway address. For an OpenAI-compatible gateway, stop at the version segment, for example `https://ai-gateway.example.com/v1`, without `/chat/completions`.
5. Click **Fetch Models**. When you see "Found N models", choose one under **Model**.
6. No model list, or the model you want is missing: tick **Use custom model ID**, type the ID into "Enter model ID", and click **Apply**.
7. Click **Test connection** and wait for "Connection successful".
8. Click **Save** (**Update** when editing an existing source). The saved source becomes the current source.

For a model Halo doesn't know, **Model Configuration** opens on its own after you click **Apply**, showing the defaults: **Context Window** 200,000 tokens and **Max Output Tokens** 64,000. Below the panel you'll see "No preset found — verify these values match your model". Change the values to what your gateway administrator gives you before saving. Each field is explained in [Per-model settings](/en/features/models#model-settings).

::: done
**Test connection** shows "Connection successful", the gateway's model appears in the model card next to the composer, and a message gets a reply. You're connected.
:::

## Which format to choose {#which-format}

The provider decides the request format; Halo has no separate format switch. Most company gateways are OpenAI-compatible, so **OpenAI API** is the default. Its grey description in the dropdown reads "Official and all compatible providers".

| Gateway API | Provider | API URL up to | What Halo requests |
|---|---|---|---|
| OpenAI-compatible (`/v1/chat/completions`) | **OpenAI API** | `https://ai-gateway.example.com/v1` | Appends `/chat/completions` |
| OpenAI-compatible Responses API | **OpenAI API** | The full address, ending in `/responses` | Used as is |
| Anthropic format (`/v1/messages`) | **Claude (Anthropic) API** | `https://ai-gateway.example.com`, without `/v1` | Appends `/v1/messages` |

For OpenAI-compatible sources, Halo tidies the address: it strips a trailing `/`, keeps an address that already ends in `/chat/completions`, and adds `/v1` to a bare host (such as `https://ai-gateway.example.com`).

The Anthropic format does only one thing: it appends `/v1/messages` to what you typed. An address that already has `/v1` becomes `/v1/v1/messages` and fails. Choose **Claude (Anthropic) API** only when the administrator says the gateway uses the Anthropic format. Picking it for an OpenAI-compatible gateway is the most common misconfiguration.

**Fetch Models** requests the gateway's `/models` with the key as a `Bearer` token. Anthropic-format gateways may not support that request. If no list comes back, use **Use custom model ID**.

### LiteLLM and similar gateways {#litellm}

The **Provider** list includes **LiteLLM**, with the default address `http://localhost:4000` and an empty model list: click **Fetch Models** to read the models from the gateway. LiteLLM uses the OpenAI-compatible format. If the gateway runs on another machine, change **API URL** to its address.

Halo needs an **API Key** before it saves, LiteLLM included. Enter the virtual key the gateway issued; if the gateway doesn't check keys, any text works.

For any other OpenAI-compatible gateway or router that isn't in the list, choose **OpenAI API** and change **API URL**.

## Test connection {#test}

**Test connection** sends one real turn to the chosen model and asks it to reply "OK". With no answer within 15 seconds, it times out. OpenAI-compatible sources need a model chosen first. After a successful test, **API URL** may be rewritten to the full address Halo derived; that's expected. Saving without a test is allowed.

| Test shows | Likely cause |
|---|---|
| `Invalid API key` / `Access denied - check API key permissions` | Wrong key, or the key has no access to this model |
| `API endpoint not found - check URL` | Wrong address or wrong format, see [Which format to choose](#which-format) |
| `Cannot connect to API server - check URL` | The gateway can't be reached: a typo, or the proxy is missing or shouldn't be used, see [Set a proxy](#proxy) |
| `Connection timeout - server may be slow or unreachable` | No answer within 15 seconds: a slow gateway or no network path |
| `Rate limited - try again later` | The gateway is limiting requests; try again later |
| `No response received from API` | The gateway returned nothing |

**Fetch Models** errors read: "Invalid API Key or no permission", "Endpoint not found, check the URL", "Rate limited or out of quota", "Request timed out, check the server or proxy", "Cannot reach server, check network or proxy". The gateway's own reason (up to 200 characters) follows the message, with the key removed.

## Preset providers in company builds {#preset-providers}

A company build of Halo can ship with the company gateway built in. Then a **Preset API** group appears below the source list in **Settings › AI Model**. Click its entry:

1. Fill in **Display Name** and **API Key**.
2. The gateway address is fixed and can't be edited: "Gateway URL is fixed by the preset configuration".
3. Click **Fetch Models** (fetch the latest model list from the gateway) and choose a model, or use **Use custom model ID**. With an empty list you'll see "No models available — fetch from gateway or enter a custom ID".
4. Click **Add**. The entry leaves the **Preset API** group and appears in the source list above.

::: info
The **Preset API** group appears only in builds that define presets. Halo downloaded from the official site has none, so you won't see the group. Follow [Add a company gateway as an AI source](#gateway-as-source) instead.
:::

## Set a proxy <Badge type="info" text="Desktop only" /> {#proxy}

If your network reaches the internet only through a proxy, set Halo's own proxy here. Left empty (the default), Halo follows the system proxy, PAC auto-configuration included.

1. Open **Settings › System** and find **Proxy** ("Override system proxy. Leave empty to auto-detect from system settings.").
2. Enter the proxy address, for example `http://127.0.0.1:1087`. Only `http://` and `https://` are accepted ("Supports http://, https://"). A `socks5://` address shows "Unsupported protocol. Use http://, https://".
3. Click **Save** or press <kbd>Enter</kbd>. The button briefly shows "Saved".

Only have a SOCKS proxy? Set it in the operating system and leave Halo's **Proxy** empty. Model requests then reach it through the system proxy.

What the proxy covers:

| Traffic | Which proxy |
|---|---|
| Model requests, **Fetch Models**, **Test connection** | The **Proxy** address; the system proxy when empty. Exception: **Test connection** for a **Claude (Anthropic) API** source is sent by the AI engine process directly, so it only uses the **Proxy** address or the `HTTP_PROXY` / `HTTPS_PROXY` environment variables, not the system proxy |
| The [Store](/en/digital-humans/store) | Same as above |
| AI engine processes Halo starts, and the MCP servers they connect | The **Proxy** address, passed to the process as `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY`. If `HTTP_PROXY` / `HTTPS_PROXY` were already set when Halo started, those values stay |
| The AI reading Halo's official docs | The **Proxy** address; the system proxy when empty |
| The [AI Browser](/en/features/ai-browser) and web search | The system proxy. With **Also apply to AI Browser** on, the **Proxy** address, see [below](#ai-browser-proxy) |
| Checking for and downloading [updates](/en/advanced/updates) | The system proxy; the **Proxy** address isn't used |

### Addresses that skip the proxy {#bypass}

A gateway on the company network usually shouldn't go through an internet proxy. Add it to **Don't use the proxy for** below **Proxy**, then click that field's own **Save**.

```text
ai-gateway.example.com, .corp.example.com, 10.0.0.0/8
```

| Entry | Matches |
|---|---|
| `ai-gateway.example.com` | That host only |
| `.example.com` | Subdomains only, not `example.com` itself; add `example.com` as a separate entry to include it |
| `10.0.0.0/8` | An IP range |
| `host:port` | That port only |
| A pasted full URL | Only its host and port are kept |

- Separate entries with commas; semicolons and spaces work too.
- `localhost`, `127.0.0.1` and `[::1]` never use the proxy ("Local addresses never use the proxy."). Halo's model requests pass through a local translation service, so local addresses must stay direct.
- Addresses already in the `NO_PROXY` environment variable when Halo started are merged in.
- "A changed list applies to conversations started afterwards." Start a new conversation after a change.

### Also apply to AI Browser {#ai-browser-proxy}

The **Also apply to AI Browser** switch appears only after you enter a proxy address. It is off by default ("By default, AI Browser uses system proxy instead of the proxy above").

- **Off**: the AI Browser and web search use the system proxy. Keep it off when **Proxy** holds an API-only proxy that can't load ordinary web pages.
- **On**: the AI Browser and web search use the **Proxy** address, and **Don't use the proxy for** applies to them too. The change takes effect immediately.

Web search runs on the AI Browser's network in the background, so it follows the same proxy. By default it picks the engine by the query's language: Bing for English, Baidu for Chinese, and it falls back to the other when one is unreachable. Google is used only when asked for, and some regions need a proxy to reach it. When no engine is reachable, the AI tells you search is unavailable and carries on without it.

## What works without internet access {#offline}

With a model gateway reachable on the company network, most of Halo needs no internet access. As of 3.0.4:

| Feature | Without internet access |
|---|---|
| Conversations, reading and writing workspace files | Works, as long as the model gateway is reachable |
| [Knowledge base](/en/features/knowledge-base#how-learning-works) learning | Works. "Learning" extracts text on your computer and calls no model |
| [Text Recognition](/en/features/image-input#text-recognition) (OCR) | Works. The engine and the English and Chinese language data ship with Halo |
| The Windows first-launch command environment (Git Bash) | Works. The installer bundles a portable Git that is unpacked locally, see [Deploy to many computers](/en/advanced/deployment#windows-git-bash) |
| The AI reading Halo's official docs | Works. If the docs site doesn't answer within 3 seconds, Halo reads an earlier cached copy or the docs bundled with the app, and says the content may be out of date |
| Signing in with Claude, ChatGPT, GitHub Copilot and other accounts | Needs access to those sites |
| Web search, and the AI Browser on internet sites | Needs internet access, or a [proxy](#proxy) |
| The Store's built-in sources, update checks in the official build | Need internet access. A [private store](/en/advanced/private-store) on an intranet domain only needs to be reachable on your network |
| Remote Access over the internet | Needs internet access; it goes through a tunnel service and Halo's address service, see [Remote Access](/en/features/remote-access#internet-access) |
| [Memory](/en/features/memory) consolidation | Calls the model, so it works when the model gateway is reachable |

## Overrides from a shared ~/.claude {#claude-cli-overrides}

This section applies only to the Claude Code engine (the default engine).

The Claude Code engine reads `settings.json` in its config directory, and `.claude/settings.json` in the workspace folder. If the `env` block of those files sets an API address or key, it can take priority over the source chosen in Halo: the connection test passes, but chats reach another service or fail.

The config directory is set in **Settings › Advanced › Claude CLI Integration › Config Directory**:

| Option | Reads from | Notes |
|---|---|---|
| **Halo Default** (**Recommended**) | Halo's own separate directory | Not affected by a standalone Claude CLI install |
| **Claude CLI Default** | `~/.claude`, shared with a standalone Claude CLI | Tagged **High Risk** and **Not Recommended**. The confirmation "High Risk: Shared Config" says: "If your standalone Claude CLI has a custom API key or endpoint configured, it will take priority over the model selected in Halo, which may break chat". It switches only after **Use Shared Config** |
| **Custom Path** | A directory you choose | Its `settings.json` is read too |

Click **Apply**. After "Saved. Restart any active conversation to apply.", restart the conversations in progress. "Current effective path:" on the panel shows the directory Halo actually uses. All options are described in [Claude CLI Integration](/en/features/settings#claude-cli-integration); folder locations are in [Where Halo keeps your data](/en/advanced/config-paths).

If you need the company gateway and must keep **Claude CLI Default**, remove the API address and key from `env` in `~/.claude/settings.json` so Halo's AI source takes effect.

## Troubleshooting {#troubleshooting}

### Fetch Models shows "Endpoint not found, check the URL"

- OpenAI-compatible gateway: **API URL** stops at the version segment (such as `https://ai-gateway.example.com/v1`). If the gateway's path isn't `/v1`, use what the administrator gave you, for example `https://ai-gateway.example.com/openai/v1`.
- The gateway has no `/models` endpoint: use **Use custom model ID**, then confirm with **Test connection**.

### "Cannot reach server, check network or proxy" or "Request timed out, check the server or proxy"

1. Gateway on the company network: add its host name to [Don't use the proxy for](#bypass), then start a new conversation.
2. Internet service: enter the company proxy under [Proxy](#proxy), or check that the system proxy works.
3. Security software that blocks local connections also makes conversations fail. Halo tells you which program to allow.

### Claude (Anthropic) API never connects

The format is probably wrong. If the gateway is OpenAI-compatible, choose **OpenAI API** instead. If it really uses the Anthropic format, check that **API URL** doesn't end in `/v1`.

### After changing the proxy, the AI's tools still use the old one

- The AI engine process gets its proxy settings when a conversation starts. Start a new conversation.
- If `HTTP_PROXY` / `HTTPS_PROXY` were set before Halo started (for example, Halo launched from a terminal), the AI engine process keeps those values. Remove them and restart Halo.

### The AI Browser or web search can't load pages, but the model works

The AI Browser uses the system proxy by default, not the **Proxy** address. Turn on [Also apply to AI Browser](#ai-browser-proxy) if needed. If **Proxy** holds an API-only proxy, keep it off and browse through the system proxy.

### Test connection passes, but chats reach another model or fail

Check whether the [config directory](#claude-cli-overrides) is set to **Claude CLI Default**, and whether `env` in `settings.json` sets an API address or key.

## Next steps {#next-steps}

- [Models and accounts](/en/features/models): choose a model per conversation, adjust Deep Thinking, manage several sources.
- [Security, privacy and data flow](/en/advanced/security): what stays on your computer, what is sent out, and how keys are stored.
- [Deploy to many computers](/en/advanced/deployment): read this first when rolling Halo out to many computers.
