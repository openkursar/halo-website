---
title: AI desktop agent that works on your own computer
description: "Halo is an open-source AI desktop agent: it works with your files, drives a browser and a terminal, and makes Office documents to finish tasks end to end."
type: landing
audience: [beginner, office]
edition: public
related: [guide/what-is-halo, getting-started/install, features/ai-browser]
---

# AI desktop agent

An AI desktop agent is an AI app that runs on your computer. Besides answering questions, it can read and write your files, open web pages and run commands, so it can carry a task from start to finish. Halo is an open-source AI desktop agent (we call it a desktop AI workstation) for macOS, Windows and Linux. Halo itself is free; model usage is billed by your account or API provider.

## What it can do on your computer {#what-it-does}

| Capability | What it does | How to use it |
|---|---|---|
| Your files | Reads and writes your files and folders, with no upload first | **+ › Files and folders** in the message box, or drag them in |
| The web | Opens pages, clicks, fills in forms and downloads, using your existing sign-ins | **Web Control**, on by default |
| A terminal | Shares a real terminal with you, including SSH sessions and long jobs (macOS, Windows) | turn on **AI Terminal** under **+** |
| Office documents | Creates and edits Word, Excel, PowerPoint and PDF files, with nothing extra to install | ask for the document you want; see [Office documents](/en/features/office-documents) |
| Your documents | Answers from the documents you put in a knowledge base, with the sources shown | the **Knowledge** button in the message box |
| Text in images | Recognizes text in images on your computer, without using tokens | turn on **Text Recognition** under **+** |
| Recurring work | Runs on a schedule and sends results to WeCom, Feishu or email | ask Halo to set up a Digital Human |

![The + menu of the Halo message box: Files and folders, Reference a conversation, Chat with a digital human, and five capability switches: Web Control, Team Collaboration, AI Terminal, Text Recognition and Operate Halo](/images/features/capabilities/plus-panel.en.webp)

These switches apply per conversation. See [Capabilities](/en/features/capabilities) for which ones are on by default and what each one does.

## Just say what you want {#just-ask}

No commands to learn. Describe the result, for example:

> Sort the PDFs in my Downloads folder into one folder per month, then give me a list of what moved.

Halo plans the steps and does them, and every step shows in the conversation. You can add information while it works; it sees your message as soon as it finishes its current step. Click **Stop** whenever you want it to stop.

## Good to know {#good-to-know}

- **Where your data lives**: conversations, files and settings stay on your computer. What you send to the model goes to the model provider you chose.
- **The AI works with your permissions**: Halo does not ask before every step; it stops and asks when it needs a decision from you. Before it works in an important folder, say what it must not touch. Details: [Security and permissions](/en/advanced/security).
- **It needs the internet** to reach the model. Knowledge-base learning and text recognition run locally.

## FAQ {#faq}

### How is an AI desktop agent different from a web AI chat?

A web chat lives in the browser. An AI desktop agent runs on your computer, so it can work with your files, a browser and a terminal directly, and it can work on a schedule.

### Is Halo free?

Halo is open-source software (MIT license) and costs nothing. What you pay for AI models depends on the account or API provider you use.

### Do I need to know how to code?

No. Describe the result in plain words. When a task needs code, Halo writes and runs it.

## Next steps {#next-steps}

- [Install Halo](/en/getting-started/install): download it and finish the first-run setup
- [Your first task](/en/getting-started/first-chat): get a first task done in Halo
- [What is Halo](/en/guide/what-is-halo): workspaces, Digital Humans and teams at a glance
- [AI Browser](/en/features/ai-browser): let the AI work in web pages
