---
title: "Connect an AI model: sign in or use an API key"
description: "Halo needs an AI model to work. Pick a free sign-in, an account you already pay for, an API key, or skip for now, then follow the steps for it."
type: tutorial
audience: [beginner]
prerequisites: [getting-started/install]
related: [getting-started/api-keys, features/models, advanced/gateway-and-proxy]
---

# Connect an AI model

You do this step yourself: until a model is connected, Halo can't answer anything, and even afterwards it can't add an account or an API key for you.

::: tip Did you arrive from "Don't know how to get it? View tutorial" in Halo?
An API key comes from your model provider's website. The steps for each provider are in [Get an API key](/en/getting-started/api-keys). No key yet? The sign-in options in the table below don't need one.
:::

## Which option should I choose? {#which-option}

After you pick a language and theme on first launch, you see "Welcome to Halo" and "Select a method to start". Choose by your situation:

| Your situation | Choose | What happens next |
|---|---|---|
| Outside mainland China, no paid AI account | **Kiro** | Sign in with Google or GitHub and use Claude models (free quota as Kiro currently offers it) |
| In mainland China, no paid AI account and no API key | **Tencent** | A CodeBuddy sign-in page opens in your browser; scan it with WeChat to use models such as kimi, glm and deepseek (free quota as that service currently offers it) |
| You have Claude Pro or Max | **Claude** | Sign in with your claude.ai account |
| You have ChatGPT or Codex Plus, Pro or Business | **ChatGPT** | Sign in with your ChatGPT account |
| You have GitHub Copilot | **GitHub Copilot** | Enter the code Halo shows you in your browser |
| Your company gave you an API key, or you bought one from a provider such as OpenAI, Anthropic, DeepSeek or OpenRouter | **Custom API** | Paste the key, pick the provider, test and save |
| You want to look around first | **Skip for now** | Halo opens; you can't chat until you add a model |

![The "Welcome to Halo" screen: a Claude button at the top, then "Or choose another method" with Tencent, Kiro, ChatGPT, GitHub Copilot and Custom API, and "Skip for now" at the bottom](/images/getting-started/setup-ai/sign-in-options.en.webp)

::: info Your options may differ
The sign-in options depend on the Halo build you use. A Halo provided by your company may show different options; go by what's on your screen.
:::

<!-- internal:sso-sign-in -->

## Before you start {#before-you-start}

- Halo is installed and showing "Welcome to Halo". Already using Halo? Add a model under **Settings › AI Model** with the same steps; see [Models and accounts](/en/features/models).
- To sign in with an account, your browser must be able to open that service's website, such as claude.ai, chatgpt.com or github.com.

## Sign in with an account {#sign-in}

For Tencent, Kiro, Claude, ChatGPT and GitHub Copilot.

1. On "Welcome to Halo", click the option you chose.
2. A sign-in page opens in your browser, and Halo shows "Opening login page..." or "Waiting for login...". Finish signing in in the browser:
   - **Tencent**: scan with WeChat to sign in to your CodeBuddy account.
   - **Kiro**: sign in with Google or GitHub.
   - **ChatGPT**: sign in with your ChatGPT account.
   - **GitHub Copilot**: Halo shows "Visit this URL to login:" and a code. Open the link and enter the code (the button next to it copies the code).
3. When sign-in is done, Halo opens by itself.

### Two ways to sign in to Claude {#claude}

After you click **Claude**, Halo shows "Choose a login method":

- Click **Open Login Window** to sign in to claude.ai in a window inside Halo.
- Or use **Manual login**: click **Copy** next to the link, open it in your browser and sign in, paste the authorization code from that page into "Paste authorization code here", then click **Complete Login**.

![Claude's Choose a login method: the Open Login Window button at the top, then Manual login with the sign-in link, a Copy button and a box for the authorization code](/images/getting-started/setup-ai/browser-sign-in.en.webp)

Finish within 10 minutes. If it times out, click **Claude** again.

## Enter an API key {#api-key}

1. Click **Custom API** (Claude / OpenAI compatible).
2. Paste your key into the box under **API Key** (it says "Enter your API Key").
3. Under **Provider**, choose which provider the key belongs to. You can type to search. There is no default, so you have to pick one.
4. **API URL** fills in by itself. Change it only for a company gateway or a proxy.
5. Click **Test connection** and wait for "Connection successful".
6. Click **Save and enter**.

![The Custom API form: an API Key box at the top, DeepSeek chosen as the provider, the API URL filled in, "Connection successful" and a "Save and enter" button below](/images/getting-started/setup-ai/custom-api.en.webp)

When you save, Halo reads the provider's model list and picks the first model. You can switch models later, next to the message box.

Provider names in the list are the providers' own names, such as "OpenAI API", "Claude (Anthropic) API", "DeepSeek" or "OpenRouter". The full list is in [Get an API key](/en/getting-started/api-keys#providers).

Did your company give you an address and a key? Choose **OpenAI API** as the provider and put the address in **API URL**. Choose **Claude (Anthropic) API** only if you're told it uses the Anthropic format. More in [Model gateway and proxy](/en/advanced/gateway-and-proxy).

## Skip for now {#skip}

Click **Skip for now** ("Configure your AI later in Settings") at the bottom. Halo opens right away and won't show this screen again on the next launch.

Halo can't chat until you add a model. The model button next to the message box shows "Configure AI Source"; click it to open **Settings › AI Model**.

::: done
When you see "What do you want to do today?" with the message box in the middle, your model is connected.
:::

## What you can do later {#later}

- **Keep several accounts or keys side by side**: add them under **Settings › AI Model**. For a second account with the same provider, click "Add another account".
- **Choose a model per conversation**: click the model name next to the message box to switch models and adjust "Deep Thinking".

More in [Models and accounts](/en/features/models).

## Troubleshooting {#troubleshooting}

### You finished signing in, but Halo is still waiting

Go back to Halo, click **Cancel**, and click the same option again. For Claude, you can use **Manual login** and paste the authorization code into Halo.

### claude.ai or chatgpt.com won't open

That's a network problem, not a Halo problem. Use **Tencent** or **Custom API** instead. If you need a proxy to get online: click **Skip for now**, open **Settings › System › Proxy**, enter your proxy address and save, then sign in under **Settings › AI Model**.

### Saving shows an error, or the connection test fails

Messages you may see when saving, and what to do:

| Message | What to do |
|---|---|
| "Invalid API Key or no permission" | The key was copied incompletely or was deleted on the provider's site. Copy it again |
| "Endpoint not found, check the URL" | The wrong provider is selected, or the API URL was changed. Choose the provider again |
| "Rate limited or out of quota" | Your balance or free quota with that provider is used up, or you sent too many requests |
| "Request timed out, check the server or proxy" or "Cannot reach server, check network or proxy" | Your computer can't reach the provider. Check your network and proxy settings |

**Test connection** failures read, for example, "Invalid API key", "API endpoint not found - check URL", "Rate limited - try again later" or "Cannot connect to API server - check URL".

### After a while you see "OAuth token expired or invalid. Please login again."

The account's sign-in has expired. Open **Settings › AI Model**, find the same provider under "OAuth Login" (it shows "Add another account"), and sign in again with the **same** account. Halo updates that account instead of adding a duplicate. More messages: [Error messages](/en/troubleshooting/common-errors).

## Next steps {#next-steps}

- [Your first task](/en/getting-started/first-chat): ask Halo for a real file in one sentence.
- [Get an API key](/en/getting-started/api-keys): where to get a key from OpenAI, Anthropic, DeepSeek, OpenRouter and others.
