---
title: "AI Browser Automation: browse, fill forms, scrape"
description: Turn on Web Control and Halo's AI Browser opens pages, clicks, fills forms, downloads files and collects page data, reusing sites you've signed in to.
type: how-to
audience: [office]
related: [features/capabilities, digital-humans/capabilities, developers/digital-humans/production]
---

# AI Browser

::: say
> Open my admin dashboard and export last month's orders

Halo opens your dashboard in its built-in browser, finds the export, downloads the file into the current workspace's `downloads` folder and tells you the file name.

**Prerequisite**: **Web Control** is on under **＋ › Capabilities** in the composer (it's on by default for new conversations). If the dashboard needs a sign-in, sign in once yourself in Halo's browser first; see [Sites that need sign-in](#sign-in-sites).
:::

## Turn on Web Control {#turn-on}

In a conversation, the AI Browser switch is called **Web Control**. It's on by default for new conversations.

1. In the conversation composer, click **＋** (tooltip "Add files, context and capabilities").
2. In the **Capabilities** group, find **Web Control**, described as "AI works in your browser, with your signed-in sessions".
3. Turn it on. It takes effect from your next message; the current reply isn't affected.

- A new conversation inherits the switches you last changed. An older conversation keeps its own set when you reopen it.
- When Web Control is off, the AI asks you for it: Halo opens the **＋** panel with the switch highlighted, and you decide. The AI can't turn it on by itself.
- These switches don't appear in a chat with a Digital Human. A Digital Human uses its own switch: **Capabilities and settings › Model & Capabilities › AI Browser** ("Enable browser tools for web automation"), on by default. See [Digital Human capabilities and settings](/en/digital-humans/capabilities).

For the other capability switches (AI Terminal, Operate Halo and more), see [Capabilities](/en/features/capabilities).

## Open the browser yourself {#open-browser}

<Badge type="info" text="Desktop only" />

To look at a page first, sign in to a site, or share a page with the AI, open the browser yourself:

1. In the conversation header, click **⋯ More › Open browser** ("Built-in AI browser window"). You can also press <Shortcut mac="⌘ T" other="Ctrl T" /> for a new tab; it works even when the canvas is closed.
2. The browser opens in the canvas on the right. The default home page is Bing.
3. Type an address in the address bar ("Enter URL or search Bing...") and press Enter. Text that doesn't look like an address becomes a Bing search; a bare domain gets `https://` added.

The other toolbar controls:

| Control | What it does |
|---|---|
| **Back** / **Forward** / **Reload (Ctrl+R)** / **Home** | Same as in any browser; Reload becomes **Stop** while a page loads |
| **Switch to H5 mobile mode** / **Switch to PC mode** | Reloads the page as the mobile version (iPhone Safari identity, 390 px wide) |
| **Open in external browser** | Opens the current address in your computer's default browser |
| More options (screenshot, zoom, developer tools) | A menu with **Zoom** (50%–200% in 10% steps), **Screenshot** (copies the visible area to the clipboard) and **Developer Tools** |

- Pop-up windows from a page open in the same tab.
- Up to 6 browser pages are kept in memory at once. Older ones are released and reload at their address when you switch back. Pages the AI is using are exempt.
- The Remote Access web client and the Android app have no built-in browser, and **Open browser** isn't shown. The canvas shows "Browser features are only available in the desktop client"; click **Open in new window** to view the address in your own browser. When you message Halo from a remote client, the AI can still work in web pages on the host computer; you just can't watch.

## Watch the AI and take over {#watch-and-take-over}

When the AI works in a web page, a card appears in the conversation: "AI is operating the browser" while it runs, then "AI browser actions". The card lists each step (navigate, click, fill, analyze page, download and so on) and shows the last 3 when collapsed.

1. Click **View live feed** on the card. The page the AI is using opens in the canvas in a tab named "🤖 AI Browser".
2. A bar at the top of the page reads "AI is operating this browser", with **Live** or **Idle** next to it.
3. To do something yourself, click and type in the same page. To avoid fighting the AI over it, first press <kbd>Esc</kbd> in the composer (or click **Stop generation (Esc)**) to stop the reply, then tell the AI to carry on when you're done.

- The canvas doesn't pop the AI's page open by itself; you click **View live feed**. Closing that tab only stops you watching; the AI keeps the page.
- A strip above the composer lists the pages and terminals the AI opened itself in the current workspace. Its popover is **Active sessions**: **Open** shows a page, and **Stop** closes it after you confirm "Stop this session?". Tabs you opened yourself are never listed there.
- Anything you add while the AI is working reaches it right after its current step.
- In a direct chat with a Digital Human, or when you click **Run now** on the desktop, you can watch the Digital Human's page the same way. When it runs through IM, a team or a schedule, its pages open in the background and can't be watched.

## Sites that need sign-in {#sign-in-sites}

The AI won't sign up or get past a sign-in for you. For a site that needs one, sign in once yourself in Halo's browser, then hand the work to the AI.

1. Open the site with **⋯ More › Open browser** and sign in as usual. Captchas, QR-code scans and SMS codes are yours to complete.
2. Go back to the conversation and tell the AI what to do, for example "Open my admin dashboard and export last month's orders".

Every Halo browser page shares one set of sign-ins: your tabs, the pages the AI opens in a conversation, Digital Humans' pages and Digital Humans' sign-in windows. Sign in once and all of them can use it. When the site itself expires the session, sign in again.

In a conversation, the AI can see the tabs you opened yourself as well as its own pages, so you can also ask it to continue in the page you just signed in to. A Digital Human only sees pages it opened, but it uses your sign-ins too.

### Sign in to sites for a Digital Human {#digital-human-sign-in}

When a Digital Human declares the sites it needs, it asks you to sign in to them here:

| Where | What you see |
|---|---|
| Digital Human › **Capabilities and settings** › **Required Logins** | The list of sites. Clicking one opens a separate sign-in window ("Click to open the website and log in via the Halo browser.") |
| The Digital Human's **Work activity** | A notice "Log in to example.com before running" (with the real site name), with **Open to log in** and **Already logged in, don't show again** |
| The **Browser** button in the Digital Human's header | Its sign-in sites, plus an **Enter URL** field and **Open** |

The **Browser** button appears when the Digital Human has sign-in sites or the AI Browser capability on. From a remote client, signing in opens the site in your own browser, and that sign-in is **not** carried over to Halo.

### Clear browser data {#clear-browser-data}

<Badge type="tip" text="New in 3.0.4" /> <Badge type="info" text="Desktop only" />

To sign out of every site, or to sign in again with another account:

1. Open **Settings › System › Browser data** and click **Clear browser data**.
2. Confirm in "Clear browser data?". You're done when you see "Browser data cleared.".

::: danger
This clears cookies, site storage and cache for every site in the shared browser. You, the AI and every Digital Human are signed out of those sites, and it can't be undone. Halo's own data is kept. Open pages reload.
:::

## Where downloads go {#downloads}

Files the AI downloads are saved directly, with no Save dialog:

- They go into the `downloads` folder of the conversation's or Digital Human's workspace. In the rare case with no workspace, they go into `halo-ai` inside your system Downloads folder.
- Duplicate names get a new name instead of overwriting. Names the AI would read as instructions, such as `CLAUDE.md`, are saved as `CLAUDE (downloaded).md`.
- On the conversation card the step shows as "Download", and "Waiting for download" while pending. When it's done, the AI tells you the file path and size.

Downloads you start yourself in the browser still show the normal Save dialog.

## What the AI can do {#what-the-ai-can-do}

With Web Control on (the AI Browser capability for a Digital Human), the AI can:

| Action | Details |
|---|---|
| Open pages | Opens an address as the desktop or mobile (H5) version; waits up to 30 seconds for loading by default |
| Read pages | Reads the page's text and structure, so text-only models work too |
| Take screenshots | The visible area, one element or the full page; images are at most 1568 px on the long side, and reading them needs a model that accepts images |
| Click and type keys | Click, double-click, drag and drop, hover to open menus, press Enter or shortcuts |
| Fill forms | Fills several fields at once and checks what each field actually holds; password fields are reported by length only |
| Upload files | Puts files from your computer into a page's upload field |
| Download files | See [Where downloads go](#downloads) |
| Wait | Waits for some text to appear before going on, 30 seconds by default |
| Run scripts | Runs a snippet of JavaScript in the page (to scroll or pull data, for example) or a prepared script file in the workspace, for up to 120 seconds |
| Manage tabs | Lists, opens, switches and closes tabs (the last one can't be closed) |
| Inspect network and console | Looks at the page's requests and errors to find out why a page isn't working |

What it can't do:

- Native page dialogs (alert, confirm) can't be handled by the AI; you dismiss them.
- Captchas, QR-code scans and SMS codes need you.
- There's no guarantee of getting past a site's bot detection.

Things you can say:

> Search Amazon for mechanical keyboards, filter for the best-rated ones between $50 and $120, and tell me the pros and cons of each.

> Open Hacker News, summarize today's 5 most-commented stories, and give me a digest.

> Open the company ticketing system and fill in today's work log: finished unit tests for the login module.

## Allowed sites {#allowlist}

::: info
A Halo provided by your company may limit which sites the built-in browser can open. The public release has no such limit.
:::

A blocked site shows an "Access Restricted" page. If your build lets you add sites yourself:

1. Click **Allow example.com and retry** on the blocked page (it shows the blocked address), or open **Settings › System › Browser Allowed Sites**.
2. Enter `example.com` or `*.example.com` (a full URL, an IPv4 address or a range such as `10.0.0.0/8` also work), then click **Add**.
3. The site appears under "Added by you"; click **Remove** when you no longer need it. "Built-in sites" are set by your company and can't be changed.

Sites you add only widen what's allowed. If your build doesn't allow additions, the card isn't in Settings; ask the administrator who provides your Halo.

## User-Agent {#user-agent}

<Badge type="info" text="Desktop only" />

The built-in browser identifies itself as desktop Chrome, and as iPhone Safari in H5 mode. If a site needs a specific browser identity, set your own:

1. Open **Settings › System › Browser User-Agent**.
2. Enter a User-Agent string (up to 1024 characters) and click **Save**. It applies to all open browser pages immediately, including Digital Humans' sign-in windows.
3. To go back to the default, clear the field and save.

A custom User-Agent also applies in H5 mode. Some sites tie a sign-in to the browser identity, so you may need to sign in again after changing it.

## Browser actions for Digital Humans {#browser-scripts}

When a Digital Human repeats the same web steps every day, you can turn them into a script so it runs faster and more reliably. See [Production-grade Digital Humans › Browser scripts](/en/developers/digital-humans/production#browser-scripts).

::: done
An "AI browser actions" card appears in the conversation, and **View live feed** shows the page the AI is using. The AI Browser is working.
:::

## Troubleshooting {#troubleshooting}

### The AI says it can't work in web pages

Web Control is off. Follow the AI's prompt to turn on **Web Control** under **＋ › Capabilities**, then send another message. The switch takes effect from the next message.

### The AI stops at a sign-in page

You haven't signed in to that site yet, or the session expired. Sign in once yourself as described in [Sites that need sign-in](#sign-in-sites), then ask the AI to try again.

### The page shows "Access Restricted"

Your Halo build limits which sites can be opened. See [Allowed sites](#allowlist).

### Pages don't load on a network that needs a proxy

By default the built-in browser uses the system proxy. To make it use the proxy set in Halo, enter the proxy address under **Settings › System › Proxy**, then turn on **Also apply to AI Browser**.

### I can't see the browser in the web client or on my phone

The built-in browser exists only in the desktop app. The AI still works on the computer running Halo; go back to that computer to watch.

### I can't find a file the AI downloaded

Look in the current workspace's `downloads` folder; see [Where downloads go](#downloads).

<!-- public:start -->
The AI Browser can still make mistakes on complex pages. If you run into a problem, report it on [GitHub Issues](https://github.com/openkursar/hello-halo/issues).
<!-- public:end -->

## Next steps {#next-steps}

- [Capabilities](/en/features/capabilities): the other capability switches besides Web Control, such as AI Terminal and Operate Halo
- [Digital Human capabilities and settings](/en/digital-humans/capabilities): turn the AI Browser on or off for a Digital Human and set its required sign-ins
- [Production-grade Digital Humans](/en/developers/digital-humans/production#browser-scripts): turn repeated web steps into scripts
