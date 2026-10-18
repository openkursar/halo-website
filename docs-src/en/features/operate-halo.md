---
title: "Operate Halo: let the AI manage your workspaces"
description: Turn on Operate Halo and the AI can rename conversations, create workspaces, pause Digital Humans, bind knowledge bases and switch models in Halo for you.
type: how-to
audience: [office]
since: "3.0"
related: [features/capabilities, features/cross-conversation, advanced/security]
---

# Let the AI operate Halo

::: say
> Rename this conversation to "Q3 review"

Halo finds the current conversation and renames it, and the new name shows in the conversation list right away. You can also say "Create a workspace called 'Annual plan'", "Turn off memory for this workspace" or "Pause the news assistant for now".

**Prerequisite**: turn on **Operate Halo** in the composer under **＋ › Capabilities**. It is off by default. The AI can ask you to turn it on, but it cannot turn it on itself.
:::

## Turn on Operate Halo {#turn-on}

**Operate Halo** is a [capability](/en/features/capabilities), and it is off by default everywhere. With it on, the AI can change workspaces, Digital Humans, knowledge bases and settings for you through Halo's own interface.

### In a normal conversation

1. Click **＋** on the left of the composer (its tooltip reads "Add files, context and capabilities"; while the AI is replying it reads "Capabilities").
2. In the **Capabilities** group, turn on **Operate Halo**. Its description reads "AI operates Halo for you: spaces, digital humans, knowledge bases, settings".
3. Send your next message. The switch takes effect from the **next message**. A reply that is already running is not affected.

New conversations keep the capability switches you set last. Once you turn it on, conversations you create afterwards have it on too, until you turn it off.

### For a Digital Human

A Digital Human's chat has no capability switches in the composer. Turn it on in the Digital Human's own settings:

1. Open **Digital Humans** and select the Digital Human.
2. Go to **Capabilities and settings › Model & Capabilities**.
3. Turn on **Operate Halo**. Here the description reads "Allow this app to manage Halo itself: spaces, digital humans, knowledge bases and settings".

Once it is on, your chats with this Digital Human and its scheduled runs can use Operate Halo. Guests who reach it through IM and requests from colleagues on other computers never get this capability.

### The AI asks when it needs it

If what you ask for needs Operate Halo and the switch is off, the AI explains why, and Halo opens the **＋** panel with the **Operate Halo** switch highlighted. Turn it on, then send another message so the AI can continue. The AI has no way to turn the switch on itself.

The switch works in the desktop app, in a browser opened through [Remote Access](/en/features/remote-access) and in the Android app: the AI always works on the computer that runs Halo.

::: done
With the switch on, say "Rename this conversation to 'Q3 review'". When the name changes in the conversation list, Operate Halo is working.
:::

## What the AI can do for you {#what-it-can-do}

With Operate Halo on, you can ask the AI for any of the following in one sentence. The requests below are examples; your own words work too.

| Area | What the AI can do | You can say |
|---|---|---|
| Conversations | Rename, star, delete; start a new conversation and have the AI begin work there; stop a conversation that is running | "Rename this conversation to 'Q3 review'" · "Delete last week's test conversation" · "Stop the conversation that's still running" |
| Workspaces | Create, rename, reorder, change the folder a workspace points to; turn workspace memory on or off, consolidate memory now; list, create, rename and move files, or move them to the trash | "Create a workspace called 'Annual plan'" · "Turn off memory for this workspace" |
| Digital Humans | Pause and resume; change the schedule; set the model, Deep Thinking and memory for one Digital Human; change its permissions; move it to another workspace; clear its memory; list or cancel reminders; show run history; answer a question it is waiting on; continue a failed run | "Pause the news assistant for now" · "Make the news assistant run every 2 hours" · "How did the news assistant's last run go?" |
| Teams | Create a team, save a temporary collaboration as a team, add or remove members, start or stop a run, set a schedule, read the board | "Have this team write the weekly report every Monday at 9" |
| Knowledge bases | Create, add files by their path, watch a folder, bind to a workspace or a Digital Human, make one the default, re-index | "Add the 'Product manual' folder on my desktop to a knowledge base and bind it to this workspace" |
| Message channels | Check the connection status, reconnect, reload, send a test notification | "Is my WeCom bot connected?" |
| Settings | Switch the model source or model; edit or delete an existing model source; check which agent engines are available; test MCP servers | "Switch this conversation to my DeepSeek source" · "Check whether my MCP servers connect" |
| Store | Browse and search, install, check and apply updates, manage store sources, unpublish what you published | "Install 'HN Daily Brief' from the Store" |

Pausing has no timed resume: "Pause the news assistant until next Monday" pauses it **now**, and it does not resume by itself on Monday. On Monday, say "Resume the news assistant".

To switch models, the model source must already be added in **Settings › AI Model**; the AI cannot add it for you. See [Models and accounts](/en/features/models).

## What stays manual {#what-stays-manual}

Even with Operate Halo on, the AI cannot do the following. When you ask, the AI tells you where to go in Halo and walks you through it.

| Task | Where to do it |
|---|---|
| Add an account or model source | **Settings › AI Model**, see [Models and accounts](/en/features/models) |
| Appearance, language, permissions and other general settings | **Settings**, see [Settings](/en/features/settings) |
| Turn Remote Access on or off, set its password | **Settings › Remote Access**, see [Remote Access](/en/features/remote-access) |
| Pair a WeCom, Feishu or WeChat bot by scanning; create a channel; set up email SMTP and webhooks | **Settings › Message Channels**, see [Message channels](/en/digital-humans/channels) |
| Invite colleagues to a team, set colleagues' permissions | **Invite to this team** in the team settings, see [Teams across computers](/en/digital-humans/cross-computer-teams) |
| Publish a Digital Human or skill to the Store | See [Store](/en/digital-humans/store) |
| Update Halo | See [Update Halo](/en/advanced/updates) |
| Answer a question card the AI shows you in a conversation | Choose or type the answer yourself in the conversation |
| Turn capability switches on or off (including Operate Halo itself) | Composer **＋ › Capabilities**, or the Digital Human's **Capabilities and settings** |

**Enter keys and tokens in Settings yourself.** A few routes do accept secrets: if you give the AI the value, it can set the token of an existing WeChat bot or the API key of a Store source. The route that edits an existing model source would also take an API key, but Halo tells the AI not to send one. Either way, a key typed into a conversation stays in the conversation history and is sent to your model provider. Change API keys in **Settings › AI Model**, bot tokens in **Settings › Message Channels** and Store source keys in **Settings › App Store**.

## Safety {#safety}

::: danger Deletes happen at once
Operate Halo has no confirmation dialog. Deleting a workspace or a conversation, clearing memory and dissolving a team all complete the moment the AI runs them, and cannot be undone. Only these irreversible actions carry an instruction for the AI to confirm with you in plain words first. When you ask for one, name the item clearly.
:::

Other facts you should know:

- **Secrets in responses are masked**: in what the AI reads back through the interface, values such as API keys, passwords and tokens are masked.
- **Open only inside this computer**: the interface the AI uses listens only on the computer that runs Halo. Other devices on the network cannot reach it.
- **Turning it off takes it back**: after you turn off **Operate Halo**, the AI loses this access from the next message. Turn it off when you don't need it, especially since new conversations keep your last switches.
- **Guests never get it**: IM guests and requests from other computers cannot use it, even when they reach a Digital Human that has Operate Halo on.

::: warning It covers all of Halo, not just this workspace
With Operate Halo on, the AI can act on **every** workspace, Digital Human and team in this Halo, not only the workspace you are in.
:::

For Halo's overall safety model (including that tool calls run without per-call approval, and how keys are stored), see [Security](/en/advanced/security). If you are a developer and want to call this interface yourself, see the [HTTP API](/en/developers/api/).

## Managing Digital Humans without Operate Halo {#digital-humans-without-operate-halo}

Managing Digital Humans and installing skills **does not need** Operate Halo. In any normal conversation or Digital Human chat, you can say these by default:

| You can say | What the AI does |
|---|---|
| "Make me a Digital Human that summarizes tech news every weekday at 9am" | Asks you a few questions, then creates it. See [Create a Digital Human](/en/digital-humans/create) |
| "Make the news assistant run every 2 hours" | Changes its schedule |
| "Run the news assistant now" | Starts a run right away, without waiting for the schedule |
| "Pause the news assistant" · "Resume the news assistant" | Pauses or resumes it |
| "Install the code-commit skill from the Store" | Installs or uninstalls a skill |

How the two differ:

| | Built-in Digital Human management | Operate Halo |
|---|---|---|
| Default | On | Off |
| Scope | Digital Humans and skills in the current workspace | All of Halo: conversations, workspaces, Digital Humans, teams, knowledge bases, message channels, settings, Store |
| Typical use | Create, edit, schedule, run, pause and delete Digital Humans; install skills | A Digital Human's permissions, memory, reminders and run history, and everything else in the table above |

::: danger Deleting a Digital Human from a chat is permanent
Without Operate Halo, asking the AI to "delete" a Digital Human removes it and all its data permanently, with no confirmation dialog.
:::

Built-in Digital Human management is controlled by **Settings › Advanced › Built-in MCP Extensions › Digital Humans**, which is on by default. Advanced settings exist only in the desktop app.

## Troubleshooting {#troubleshooting}

### The AI says it needs "Operate Halo"

The switch is still off. Turn on the highlighted **＋ › Capabilities › Operate Halo**, then send another message so the AI continues.

### I turned the switch on, but the AI still says it can't

- The switch takes effect from the **next message**. Send another message after turning it on.
- Are you in a Digital Human's chat? For a Digital Human, turn it on in **Digital Humans › Capabilities and settings › Model & Capabilities**; the composer has no such switch there.
- The task may be on the [What stays manual](#what-stays-manual) list. The AI tells you where to do it.

### A colleague messages a Digital Human in IM, and it can't change Halo

This is by design. IM guests and requests from other computers never get Operate Halo. Only you do.

## Next steps {#next-steps}

- [Capabilities](/en/features/capabilities): what Web Control, AI Terminal, Text Recognition and the other switches do, and which are on by default
- [Conversations that work together](/en/features/cross-conversation): let conversations read, hand over to and ask each other, without Operate Halo
- [Security](/en/advanced/security): how Halo protects your data before you grant more access
