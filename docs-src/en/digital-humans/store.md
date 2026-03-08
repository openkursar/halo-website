# Digital Human Store

The Digital Human Store is Halo's built-in app marketplace. Just like installing an app, you can install Digital Humans curated by community developers with a single click — no coding required, no complex configuration, ready to use out of the box.

## Open the Store

Click the **Store** entry on the left side of the Halo main interface, or go to **Settings → App Store**.

<!-- Screenshot placeholder: screenshot-store.png (Digital Human Store main interface) -->

---

## Installation Steps

1. Browse or search for scenario keywords in the store
2. Click on a Digital Human to view details and description
3. Click "Install"
4. Fill in a small number of required parameters (such as target keywords or notification email)
5. Start running

The entire process typically takes under 2 minutes.

---

## Example Scenarios

| Digital Human | Functionality |
|---------------|---------------|
| **Sentiment Monitor** | Tracks brand/product keywords 24/7, pushes an alert when anomalies are detected |
| **Hacker News Daily** | Summarizes top HN content every morning and sends an email digest |
| **Code Review Assistant** | Listens to GitHub PRs, automatically checks code quality and leaves comments |
| **Daily/Weekly Report Generator** | Summarizes work content on a schedule and automatically sends the report |
| **Competitor Tracker** | Periodically scrapes competitor websites and social media, pushes a summary of changes |
| **Comment Monitor** | Tracks comments on specified accounts or keywords on social platforms |

More Digital Humans → [DHP Registry Ecosystem](https://github.com/openkursar/digital-human-protocol)

---

## Why Not Just Write Your Own Prompt?

In theory you could configure an AI to perform these tasks yourself, but the practical difficulty is far higher than it seems.

Take "social media sentiment monitoring" as an example: how do you search for posts? How do you filter out irrelevant content? Which MCP do you use? How do you structure the data? What conditions trigger an alert? Where does the output go? Every detail requires repeated tuning.

Developers package their well-tuned Digital Humans and publish them to the store; you install with one click and get started immediately. Experts handling expert work.

---

## Contribute Your Digital Human

Anyone can publish their own Digital Human to the store. See the process → [DHP Protocol](/en/digital-humans/dhp-protocol)

::: tip Create with natural language
Don't want to write a spec from scratch? In the Halo conversation, simply describe the Digital Human functionality you want and the AI will automatically generate the corresponding configuration. See [Create a Digital Human](/en/digital-humans/create).
:::
