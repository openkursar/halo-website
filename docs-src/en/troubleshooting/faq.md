---
title: "Halo FAQ: cost, data, models and Digital Humans"
description: "Short answers to common Halo questions: what it costs, where your data goes, whether the AI asks before changing files, which models work, offline use, phones."
type: reference
audience: [all]
related: [troubleshooting/common-errors, advanced/security, getting-started/setup-ai]
---

# FAQ

These are the questions people ask most. Each one starts with a short answer; the details are on the linked pages. If you have the text of an error, look it up in [Error messages](/en/troubleshooting/common-errors).

::: say
> Does Halo cost money? Where do my conversations go?

Halo looks up its own documentation to answer. You can ask it any of the questions below the same way.
:::

## Cost and accounts {#cost-and-accounts}

### Does Halo cost money? {#is-it-free}

Halo doesn't charge for use, and you don't need a Halo account. What costs money is the AI model: with an API key, you pay the model provider for what you use; when you sign in with an account such as Claude, ChatGPT or GitHub Copilot, you use your subscription there. To choose, see [Connect an AI model](/en/getting-started/setup-ai).

<!-- public:start -->
Halo is open-source software under the MIT license; the code is on [GitHub](https://github.com/openkursar/hello-halo). Among the sign-in options, the descriptions of **Tencent** and **Kiro** say they can be used for free; those two providers set the quota and terms.
<!-- public:end -->

### Where can I see how many tokens I used and what it cost? {#token-usage}

The grey number at the bottom right of each reply is the context size the model saw for that reply. Hover over it to see input, output and other token details; when cost data is available, the cost shows too. Your provider's console is the authority on what you actually spent. See [Read a reply](/en/features/conversations#reading-replies).

## Data and security {#data-and-security}

### Where do my conversations and files go? {#where-does-data-go}

Conversations, files, memory and Digital Humans are stored on your own computer; Halo has no cloud that keeps them. What leaves the computer is mainly conversation content: in each conversation, your messages, attachments and the file content the AI reads go to the model provider you chose. Halo also sends usage statistics without message text, and the public build has no setting to turn them off. The full list is in [What stays local and what leaves the computer](/en/advanced/security#data-flow).

### Where are API keys stored, and are they safe? {#are-keys-safe}

The public build stores API keys, sign-in tokens and similar secrets in plain text in `~/.halo/config.json` on your computer; the interface shows them only as `***`. Don't send that file to anyone, and keep it out of cloud-synced folders. See [Keys and credentials](/en/advanced/security#credentials).

### Will the AI change or delete files without asking me? {#does-ai-ask-first}

It goes ahead without asking at every step. When you use Halo yourself, the AI runs commands, changes files and deletes files without confirming each one; it stops to ask with a question card only when it needs your decision. So point workspaces only at folders you're happy for the AI to change, and back up or commit with Git before big changes. See [The AI runs tools without asking each time](/en/advanced/security#tool-permissions).

## Models {#models}

### Which models can I use? {#which-models}

Both kinds work: sign in with an account (Claude, ChatGPT, GitHub Copilot and others), or use **Custom API** with an API key for services compatible with the OpenAI or Anthropic API, such as DeepSeek, Kimi or Zhipu, including your company's own model gateway. Each conversation can use its own model. See [Models and accounts](/en/features/models) and [Get an API key](/en/getting-started/api-keys).

### Does Halo work offline? {#offline}

Halo needs to reach at least one model service to do any work. With a model gateway on your company intranet, most features need no internet access: conversations, reading and writing files, knowledge base learning and text recognition in images all work. Signing in with Claude and other accounts, web search, the Store's built-in sources and update checks need the internet. See [What works without internet access](/en/advanced/gateway-and-proxy#offline).

### I sent an image and the model can't see it. What now? {#images}

When the current model can't see images, Halo recognizes the text in them on your computer and gives that to the model; the model doesn't see the image itself. For it to read a chart or a screen layout, pick a model whose model card shows **Image input** as **Supported**. See [When the model can't see images: Text Recognition](/en/features/image-input#text-recognition).

### The error says quota used up, rate-limited or invalid key. What do I do? {#model-errors}

These errors come from the model service. Look up the status code in the error (401, 429 and so on) in [Model API error codes](/en/troubleshooting/api-errors).

## Everyday use {#everyday-use}

### Can I use Halo on my phone? {#phone}

Yes, but the work always happens in Halo on your computer. Turn on **Remote Access** on the computer, then connect from the Android app or your phone's browser. There's no iOS app; on an iPhone or iPad, use the browser. See [Halo on your phone](/en/features/mobile).

### Can I do several things at once? {#parallel-work}

Yes. Several conversations and workspaces can run at the same time, and you can keep adding instructions while Halo works. See [Work on several things at once](/en/features/parallel-work).

### Does Halo keep running after I close the window? {#close-window}

On macOS and Windows, yes: closing the window only moves Halo to the background, and Digital Humans, schedules and Remote Access keep working. To quit completely, choose **Quit Halo** from the menu of the Halo icon in the tray or menu bar. On Linux, closing the window quits Halo. See [Closing the window vs quitting Halo](/en/digital-humans/keep-running#close-vs-quit).

### How do I restart Halo? {#restart}

Open **Settings › System › Restart Halo** and click **Restart**. If Settings won't open, quit completely (tray or menu bar icon › **Quit Halo**) and open Halo again. If problems continue, see [Logs and diagnostics](/en/troubleshooting/diagnostics#recover).

### How do I update Halo? {#update}

You don't need to do anything: Halo checks for and downloads new versions in the background and shows a prompt when one is ready. Click **Restart now** (or **Install now** when Windows uses the installer). To check right away, click **Check for updates** in **Settings › About**. See [Updating Halo](/en/advanced/updates).

### My computer's system is old. Can I use Halo? {#older-systems}

Halo 3.0 needs macOS 12 or later, 64-bit Windows 10 or later, or 64-bit Linux with glibc 2.34 or later. On older systems, keep using 2.x; see [Staying on 2.x on older systems](/en/advanced/updates#older-systems).

### I followed a tutorial but can't find the button {#ui-does-not-match}

These docs are for Halo 3.0.4. Many menus and names from 2.x have changed: for example, "space" is now "workspace", and the **Tools** button in the composer was replaced by the **+** panel. Update to the latest version first; if you're still on 2.x, see [Staying on 2.x on older systems](/en/advanced/updates#older-systems).

### Does uninstalling Halo delete my data? {#uninstall}

No. Uninstalling removes only the program. The data folder `~/.halo` (`%USERPROFILE%\.halo` on Windows) and the app data folder stay, so after reinstalling, your workspaces, conversations and Digital Humans are still there. To remove everything, delete those two folders yourself; see [Where Halo keeps your data](/en/advanced/config-paths).

## Digital Humans and bots {#digital-humans-and-bots}

### How is a Digital Human different from a normal conversation? {#vs-conversation}

A normal conversation answers when you send a message and suits one-off tasks. A Digital Human has a fixed job description and its own memory; it starts work by itself on a schedule, when a message arrives or when an event happens, reports when it's done, and can be connected to WeCom, Feishu or WeChat. See [How is a Digital Human different from a conversation?](/en/digital-humans/overview#vs-conversation)

### Do Digital Humans work while my computer is off or asleep? {#computer-off}

No. Digital Humans run on your computer, so it must be on and awake, with Halo running. A run that came due while the computer slept runs once after it wakes; scheduled runs that came due while Halo was quit are not made up. See [Keep Digital Humans running](/en/digital-humans/keep-running).

### A Digital Human sends too many notifications. What can I do? {#too-many-notifications}

In that Digital Human's **Capabilities and settings**, find **Messages & Notifications › System Notifications** and choose **Important** (the default: milestones, questions and outputs only), **All** (every run result) or **None**. See [Desktop notifications](/en/digital-humans/notifications#desktop).

### How do I make a bot forget the earlier conversation? {#clear-bot-context}

Send it `/clear` in WeCom, Feishu or WeChat (`/halo-clear` and `/halo-reset` work too); in a group chat, @ it first. The Digital Human's memory and reminders are kept. See [What clear keeps](/en/features/commands#im-clear).

### The bot doesn't reply. What should I check? {#bot-not-replying}

Work through [Bot not replying](/en/troubleshooting/channels): Halo is running, the bot is connected, it's bound to a Digital Human, the reply scope and @ mentions match, and the bot has an owner.

## Next steps {#next-steps}

- [Error messages](/en/troubleshooting/common-errors): look up the message you saw and what to do.
- [Security, privacy and data flow](/en/advanced/security): the full story on data, keys and AI permissions.
- [Help center](/en/troubleshooting/): find the troubleshooting page by type of problem, and how to reach us when you're still stuck.
