---
title: "IT and admins: Halo security review and rollout"
description: Halo for IT and admins — facts for a security review, then deployment, model gateway and proxy, updates, private store, Halo Server and logs.
type: hub
audience: [admin]
related: [advanced/security, advanced/deployment, server/, troubleshooting/diagnostics]
---

# For IT and admins

Rolling out Halo 3.0.4 at your company? This section follows the questions in the order you'll meet them: first the security review, then deploying to many computers, connecting your company's model gateway and proxy, and managing updates and a private store. For an always-on deployment without a window, see Halo Server. For troubleshooting, see logs and diagnostics.

## Security review {#security-review}

[Security, privacy and data flow](/en/advanced/security) holds the facts a security review needs, including every party Halo connects to and how you control each one. Start with these:

- **Runs locally**: conversations, files, memory and keys stay on the user's own computer, and Halo has no cloud service that keeps them. What leaves is mainly the conversation content sent to the chosen model provider. See [data flow](/en/advanced/security#data-flow).
- **Credentials in plain text**: the public build stores API keys and tokens in plain text in a local config file, and every UI shows them as `***`. See [keys and credentials](/en/advanced/security#credentials).
- **No per-call confirmation**: when users work with Halo themselves, the AI runs tools without asking each time. IM guests and colleagues on other computers have limits. See [AI permissions](/en/advanced/security#tool-permissions).
- **Remote Access means full control**: once **Remote Access** is on, anyone with the access password has full control of the Halo on that computer. See [risks of Remote Access](/en/advanced/security#remote-access).
- **Usage statistics**: the public build sends usage events (never message text), and Settings has no switch to turn this off. See [data flow](/en/advanced/security#data-flow).

## Deploy {#deploy}

- [Deploy to many computers](/en/advanced/deployment): check system requirements, installers and first-launch defaults before you roll Halo out.
- [Updating Halo](/en/advanced/updates): how Halo checks for and downloads updates, and how Windows fast updates and mandatory updates work.
- [Where Halo keeps your data](/en/advanced/config-paths): the folders for Halo's data, settings, logs and skills on each system, worth reading before backups or cleanup.
- [Move Halo to a new computer](/en/advanced/migrate): which two folders to copy and what needs signing in again when someone changes computers, or how to move a single Digital Human.

## Network {#network}

- [Model gateway and proxy](/en/advanced/gateway-and-proxy): add your company's OpenAI- or Anthropic-compatible model gateway as an AI source, and set the proxy and the addresses that bypass it in **Settings › System**.
- [Deploy the Federation Gateway](/en/advanced/federation-gateway): teams whose members are not on the same local network need a self-hosted Federation Gateway. The public build has no built-in gateway.
- [Remote Access](/en/features/remote-access): how users reach their own Halo from a phone or another computer over the local network or the internet, and how the access password is managed.

## Store and channels {#store-and-channels}

- [Private store](/en/advanced/private-store): add, turn off and remove store sources in **Settings › App Store**, so staff install Digital Humans and skills from your company's own source.
- [Owner and guest permissions](/en/digital-humans/permissions): once a Digital Human is connected to a WeCom or Feishu bot, **Permission Control** decides who the owner is and which tools guests may use.

## Halo Server {#halo-server}

- [Halo Server quickstart](/en/server/): run Halo without a window in a Linux container and reach it from a browser, the Android app or the HTTP API, for deployments that must stay online.
- [Developers](/en/developers/): the HTTP API, WebSocket and integration guides for connecting Halo to your company's systems.

## Logs and diagnostics {#logs-and-diagnostics}

- [Where Halo keeps your data](/en/advanced/config-paths): where the log folder is on each system. You can also open it from **Settings › System › Log Files › Open Folder**.
- [Settings reference: System](/en/features/settings#system): what **System Diagnostics**, **Crash Reports** and the other System settings do.
- [Logs and diagnostics](/en/troubleshooting/diagnostics): which logs to collect, how to export a diagnostics report, and what to attach to a bug report. With **Developer Mode** on, the logs record full requests, keys included. See [what the logs contain](/en/advanced/security#logs).

## More {#more}

- [Tips and best practices](/en/advanced/best-practices): habits worth sharing when you train staff, such as one workspace per project and keeping context and memory tidy.
