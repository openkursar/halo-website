---
title: "Get an API key: OpenAI, DeepSeek and more"
description: "Create an API key with a model provider such as OpenAI, Anthropic or DeepSeek, then paste it into Halo with the matching provider selected."
type: how-to
audience: [beginner]
prerequisites: [getting-started/install]
related: [getting-started/setup-ai, advanced/gateway-and-proxy, advanced/security]
---

# Get an API key

You get the key on the model provider's website; Halo can't do this part for you. Once you have it, paste it into Halo.

## What is an API key? {#what-is-an-api-key}

An API key is a long string a model provider gives you. It works like a key to your account there: Halo uses it to call that provider's models, and usage is billed to your account with that provider.

- Don't share the key, or paste it into chats or screenshots. If it leaks, delete it on the provider's site and create a new one.
- The key is stored in Halo's configuration file on your own computer, and Halo's screens only ever show `***`. Halo has no backend server of its own; the key is sent only to the provider you chose. Storage details: [Security, privacy and data flow](/en/advanced/security).

## Steps {#steps}

Every provider's site looks different, but the steps are similar:

1. Open the provider's console (see the tables below), sign up and sign in.
2. Complete what the provider requires: identity verification, adding credit, or claiming a free quota. Prices and quotas are whatever the provider's site says.
3. Find the "API keys" page, create a key, and copy it right away. Many providers show the full key only once.
4. Back in Halo, on "Welcome to Halo", click **Custom API**, paste the key, pick the name in the last column under **Provider**, click **Test connection**, then **Save and enter**. If you already use Halo, do this under **Settings › AI Model › Add AI Provider**.

::: done
When you see "Connection successful" and then "What do you want to do today?", the key works.
:::

## Providers and the name to pick in Halo {#providers}

Commonly used providers:

| Provider | Console | Pick under "Provider" |
|---|---|---|
| OpenAI | [platform.openai.com](https://platform.openai.com/) | OpenAI API |
| Anthropic (Claude) | [console.anthropic.com](https://console.anthropic.com/) | Claude (Anthropic) API |
| OpenRouter | [openrouter.ai](https://openrouter.ai/) | OpenRouter |
| DeepSeek | [platform.deepseek.com](https://platform.deepseek.com/) | DeepSeek |
| Moonshot Kimi (global) | [platform.moonshot.ai](https://platform.moonshot.ai/) | Kimi (Global) |
| MiniMax (global) | [minimax.io](https://www.minimax.io/) | MiniMax (Global), or MiniMax Token Plan (Global) for a Token Plan |
| Groq | [console.groq.com](https://console.groq.com/) | Groq |
| Mistral AI | [console.mistral.ai](https://console.mistral.ai/) | Mistral AI |
| xAI | [x.ai](https://x.ai/) | xAI (Grok) |

Providers based in mainland China:

| Provider | Console | Pick under "Provider" |
|---|---|---|
| Moonshot Kimi (China) | [platform.moonshot.cn](https://platform.moonshot.cn/) | Kimi (中国) |
| Zhipu GLM | [open.bigmodel.cn](https://open.bigmodel.cn/) | Zhipu AI (GLM), or Zhipu GLM (Coding Plan) for a coding plan |
| Alibaba Cloud DashScope (Qwen) | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) | Aliyun DashScope (Qwen) |
| SiliconFlow | [siliconflow.cn](https://siliconflow.cn/) | SiliconFlow |
| MiniMax (China) | [minimaxi.com](https://www.minimaxi.com/) | MiniMax (中国), or MiniMax Token Plan (中国) for a Token Plan |
| 01.AI | [platform.lingyiwanwu.com](https://platform.lingyiwanwu.com/) | 01.AI (Yi) |
| StepFun | [platform.stepfun.com](https://platform.stepfun.com/) | StepFun |

The list also has OrcaRouter, Atlas Cloud, Requesty, DeepInfra, Together AI, Fireworks AI and LiteLLM; pick them the same way. When you add a provider under **Settings › AI Model**, the **Get API Key** link at the top of the form opens that provider's website.

## An address and a key from your company {#company-gateway}

If your company or a service gives you an address (URL) and a key:

1. Under **Provider**, choose **OpenAI API**.
2. Put the address you were given into **API URL**, replacing the one that was filled in.
3. Paste the key, click **Test connection**, and save.

Choose **Claude (Anthropic) API** only if you're told the endpoint uses the Anthropic format. Picking Claude (Anthropic) API for a third-party gateway is a common mistake that stops the connection from working. More in [Model gateway and proxy](/en/advanced/gateway-and-proxy).

## Troubleshooting {#troubleshooting}

### The connection test fails, or saving shows an error

Check two things first: the key was copied completely (no missing characters at either end, no extra space), and **Provider** is the provider you created the key with. What each message means and what to do: [Connect an AI model › Troubleshooting](/en/getting-started/setup-ai#troubleshooting).

### You're not sure which provider your key belongs to

Pick the provider whose website you created the key on. If the names don't match, check the tables above.

### You accidentally shared your key

Delete the key in that provider's console, create a new one, then edit the provider under **Settings › AI Model** and replace the key.

## Next steps {#next-steps}

- [Connect an AI model](/en/getting-started/setup-ai#api-key): the full steps for entering a key in Halo.
