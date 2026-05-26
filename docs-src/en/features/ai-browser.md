---
title: "AI Browser Automation - Web Scraping & Auto-fill | Halo"
description: "Halo's built-in AI browser lets AI agents automatically browse, fill forms, scrape data, and automate web tasks. No coding or crawler scripts needed."
---
# AI Browser: Automated Web Browsing & Data Scraping

The AI Browser lets Halo's Agent directly interact with web pages — automatically opening pages, searching for information, filling out forms, and clicking buttons, just like an automated assistant that can see, click, and type.

## How to Enable

Click the **🌐 icon** at the bottom-left of the input box. When the icon is highlighted, the AI browser is active.

Once enabled, the AI will automatically decide during the conversation whether it needs to open a browser — no manual triggering required each time.

<!-- Screenshot placeholder: screenshot-ai-browser-toggle.png (browser icon at the bottom-left of the input box) -->

---

## What the AI Can Do

- **Automatically open web pages** and navigate to specified URLs
- **Take screenshots to recognize page content** (requires a multimodal model such as Claude 4.5)
- **Automatically fill out forms and click buttons**
- **Extract page information** and return it to you in a structured format

---

## Human-AI Collaboration

When the AI is operating the browser, the interface displays an "AI is operating this browser" notice along with a Live indicator.

You can also take over at any time: type an address directly in the browser or click to navigate — you and the AI can operate simultaneously without conflict.

---

## Typical Use Cases

**Online Shopping**
```
Search for mechanical keyboards on Amazon, filter for models priced between $50–$120 with the highest ratings, and tell me the pros and cons of each.
```

**Information Gathering**
```
Open Hacker News, summarize the 5 most-commented stories today, and give me a digest.
```

**Form Auto-Fill**
```
Open the internal ticketing system and fill in today's work log: completed unit tests for the user login module.
```

---

## Notes

::: warning Multimodal model required
Page screenshot recognition requires a vision-capable model, such as Claude 4.5 or GPT-4o. When using a text-only model, the AI can only understand the page through its DOM structure and cannot recognize image content.
:::

::: info This feature is still being actively improved
The AI browser may be unstable in complex interaction scenarios. If you encounter issues, please report them on [GitHub Issues](https://github.com/openkursar/hello-halo/issues).
:::
