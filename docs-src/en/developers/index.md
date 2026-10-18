---
title: "Halo for developers: API, Server, Digital Humans"
description: "Halo for developers: call the HTTP API and WebSocket, run Halo Server, build Digital Humans, write skills and MCP configurations, and publish packages."
type: hub
audience: [developer]
related: [developers/quickstart, developers/api/, server/, developers/digital-humans/]
---

# Developers

Everything Halo does in its window, your own code can do too. This section covers calling Halo from scripts and services, running it as a server, building Digital Humans and skills, and sharing what you build.

## Where to start {#start}

| You want to | Start here |
|---|---|
| Send Halo work from a script and read the result | [Quickstart: call the Halo API](/en/developers/quickstart) |
| Put a Digital Human behind your own product or chat | [Halo Server integration guide](/en/server/integration) |
| Run Halo on a server, without a desktop | [Halo Server quickstart](/en/server/) |
| Build a Digital Human that works on its own | [Building Digital Humans](/en/developers/digital-humans/) |
| Teach the AI a task, or give it new tools | [Writing skills](/en/developers/skills), [MCP configuration reference](/en/developers/mcp) |
| Share what you built | [DHP protocol](/en/developers/dhp), [Publish to the Store](/en/developers/store-publishing) |

## Call Halo {#api}

Halo answers HTTP requests and streams its progress over a WebSocket, on the desktop while **Settings › Remote Access** is on, and always on Halo Server. Every API call except sign-in and the status check carries the access password, which grants full control of that Halo.

- [HTTP API overview](/en/developers/api/): base URL, authentication, errors, and the operations by group
- [WebSocket events](/en/developers/api/websocket): follow replies and status as they happen
- [API recipes](/en/developers/api/recipes): chat with a Digital Human, one thread per user, answer its questions, webhooks

## Run Halo as a service {#server}

Halo Server is the same app without a window, in a Linux container, for back ends that call it all day.

- [Halo Server quickstart](/en/server/), [configuration](/en/server/configuration) and [Docker deployment](/en/server/deployment-docker)
- [Integration guide](/en/server/integration) and [examples](/en/server/examples): Digital Humans as the AI back end of your systems

## Build Digital Humans {#digital-humans}

- [Building Digital Humans](/en/developers/digital-humans/): what one is made of and how it runs
- [Tutorial: build a browser-automation Digital Human](/en/developers/digital-humans/build)
- [Digital Human spec reference](/en/developers/digital-humans/spec), generated from Halo's schema
- [Production-grade Digital Humans](/en/developers/digital-humans/production): prompts, memory, browser scripts and safe limits

## Extend Halo {#extend}

- [Writing skills](/en/developers/skills): instructions and scripts the AI follows for one kind of task
- [MCP configuration reference](/en/developers/mcp): connect tools from local programs or remote servers
- [Operate Halo](/en/features/operate-halo): let Halo's own assistant change workspaces, Digital Humans and settings for the user

## Share what you build {#share}

- [DHP protocol](/en/developers/dhp): the `.dhpkg` package and the Store format
- [Publish to the Store](/en/developers/store-publishing): publish Digital Humans and skills from Halo
- [Private Store sources](/en/advanced/private-store): serve your company's own catalog

## Docs for AI tools {#docs-for-ai}

These pages are also available as plain Markdown for coding assistants and other AI tools. See [Docs for AI tools](/en/developers/docs-for-ai).
