---
title: "Private store: add your own Store sources to Halo"
description: Manage Halo's Store sources in Settings › App Store. Learn the 5 built-in sources, add a private source, turn sources on or off, and see what it must serve.
type: how-to
audience: [admin]
related: [digital-humans/store, developers/dhp, advanced/security]
---

# Private store

::: say
> Add our company's source to the Store sources: https://store.example.com

Halo adds the address in **Settings › App Store**. After that, the source's Digital Humans and skills show up in the [Store](/en/digital-humans/store). It can also turn sources on or off and remove them for you.

**Prerequisite**: turn on **Operate Halo** in the composer under **＋ › Capabilities**. The AI adds the source without a confirmation dialog.
:::

## Before you start {#before-you-start}

**Settings › App Store** manages the Store's **sources**, not the Store itself. You browse and install in **Store** on the nav rail; see [Store](/en/digital-humans/store). The Store merges every source that is turned on, and search covers all of them.

To run a private store, you need:

- An address that every colleague's computer can reach, for serving static files (any static web hosting works)
- An index and packages prepared as described in [What a private source must serve](#registry-format)
- Each colleague to add the source once in their own Halo. Sources are saved in each computer's own settings and do not sync

## Built-in sources {#sources}

Open **Settings › App Store**. Its description reads "Manage registry sources for discovering and installing apps". Halo downloaded from the official site has 5 built-in sources, all on by default:

| Name shown | Type tag | What it serves |
|---|---|---|
| Digital Human Protocol | Halo | Digital Humans, skills, MCP. This is the official source. It is always first and is the primary source: the Store's categories and Discover layout come from it |
| MCP Official Registry | MCP | MCP servers, queried live |
| Smithery | Smithery | MCP servers, queried live. It has an optional **Smithery API key (optional)** field; enter the key and click **Save** |
| Claude Skills Registry | Claude Skills | About 100 curated skills; files download from GitHub at install time |
| SkillHub (33k+ Skills) | skillhub | Community skills, queried live. The service is hosted in mainland China |

Each row shows the name, the type tag, the address and an on/off switch. Digital Humans come only from Halo-type sources (the official source and the custom sources you add).

::: info
A Halo provided by your company may show different sources; see [Company builds](#company-builds).
:::

## Add a custom source {#add-source}

1. Open **Settings › App Store** and click **Add Registry** below the list.
2. In **Name**, enter a name your colleagues will recognize, such as "Company store".
3. In **URL**, enter the root address of the private source, such as `https://store.example.com`. A trailing `/` is removed.
4. Click **Add**. The new source appears at the end of the list, switched on.

The form has no type picker. Custom sources are always read as Halo static sources (the DHP static format), and the list shows no type tag for them.

Address rules:

| Rule | What you see if it's not met |
|---|---|
| Both Name and URL are filled in | "Name is required" or "URL is required" |
| It is a complete web address | "Please enter a valid URL" |
| It starts with `http://` or `https://` | `Registry URL must use http:// or https://` |
| It is not `localhost`, `127.0.0.1`, or a private IP address such as `10.x`, `172.16–31.x`, `192.168.x` or `169.254.x` | `Registry URL must point to a public host (loopback, private, and link-local addresses are not allowed)` |
| No source in the list has the same address | `Registry already exists: Company store` (with the existing source's name) |

Halo only checks addresses written as an IP. Reach an internal service by a domain name, such as `https://store.example.com`.

::: done
Go back to **Store** on the nav rail. The private source's Digital Humans appear on the **Digital Human** tab and its skills on the **Skill** tab. A new source downloads its index first; if nothing shows yet, click **Refresh**.
:::

## Turn sources on, off or remove them {#manage-sources}

| Action | How | Result |
|---|---|---|
| Turn a source off | Turn off the row's switch | Its items leave browse, search and category counts. The local cache is kept, so turning it back on needs no download. Items already installed keep working |
| Turn a source on | Turn on the switch | Its items come back to the Store |
| Remove a custom source | Click **Remove registry** (the trash icon) at the right of the row | The source and its local cache are deleted. Installed Digital Humans and skills are not uninstalled. There is no confirmation; add it again to undo |
| Reorder sources | Not supported | The official source is always first; new sources go to the end |

Built-in sources cannot be removed, only turned off. The SkillHub row shows a trash icon too, but clicking it fails and `Cannot remove a built-in registry` appears above the list. If you don't want SkillHub, turn off its switch.

After any change, the Store list reloads at once.

## How often the Store refreshes {#refresh}

When you publish a new version to the private source, this is when colleagues see it:

| When | What happens |
|---|---|
| Halo starts | It downloads each static source's index into a local cache (kept for 1 hour) |
| You switch to a **Store** tab, or back to the Halo window | A light "has anything changed?" check runs, at least 2 seconds apart. If something changed, the list reloads |
| You click **Refresh** in the Store | A full re-check is forced |
| A source fails to load or comes back empty | It is retried in the background, at most every 30 seconds. One failing source never empties the Store; the other sources still show |
| Live-query sources (SkillHub, MCP Official Registry, Smithery) | Query results are cached for 5 minutes |

So after you publish, colleagues see the new version when they switch back to the Store. If it's urgent, ask them to click **Refresh**.

## How updates reach installed items {#upgrade-strategy}

Halo checks installed items for updates 60 seconds after it starts, then every 6 hours. It only checks active items that came from the Store. Versions are compared as semver; a version it can't parse counts as a major version.

Each Digital Human chooses how to take updates in **Digital Humans › a Digital Human › Capabilities and settings › Advanced › Upgrades › Upgrade strategy**:

| Upgrade strategy | What actually happens |
|---|---|
| **Auto (silent patch/minor)** (default) | Patch and minor versions (such as 1.2.0 → 1.2.1 or 1.3.0) install without asking; major versions (such as 2.0.0) ask first |
| **Notify only** | Every update is announced; nothing installs on its own |
| **Manual** | The help text says "No automatic upgrade checks. Use Check for upgrades to update on demand." In fact the background check still runs and the Store detail page still shows **Update to**; it just never installs anything by itself |

**Check for upgrades** next to it runs a check right away. The update dialog also offers **Skip this version**, which applies to that one version only.

For a private store this means: if you raise a Digital Human from 1.0.0 to 1.0.1 in your source, colleagues' computers install it by default at the first update check after Halo next syncs the Store catalog. A raise to 2.0.0 asks them first. The catalog syncs when Halo starts, when the Store page opens (or you switch back to it), and when you click **Refresh**; the 6-hourly update check only reads the synced catalog.

## What a private source must serve {#registry-format}

Custom sources are read in the DHP static format. A set of static files under one address is enough; you don't need a dedicated server. See [DHP protocol](/en/developers/dhp) for the full format and [Publish to the Store](/en/developers/store-publishing) for publishing.

| File (relative to the source's root address) | Contents |
|---|---|
| `digital-humans.json`, `skills.json`, `mcps.json` | Split index, read first. If any one of the three is missing, Halo reads `index.json` instead |
| `index.json` | Single-file index, used when the split index is incomplete |
| `spec.yaml` under the entry's path | The definition of each Digital Human or skill; the path comes from the index entry's `path` |
| `files/` under the entry's path | A skill's files, such as `files/SKILL.md` (the Store detail page shows it as documentation) |
| `skills/` plus the skill ID under the entry's path | Skill files embedded in a Digital Human |

A private source that only holds Digital Humans still needs `skills.json` and `mcps.json`: each must be a full index object whose `apps` is an empty array `[]`, with `version`, `generated_at` and `source` as in the example below. A bare `[]` fails validation and Halo falls back to `index.json`. Or use a single `index.json` instead.

The official source's repository keeps each Digital Human in a folder named after its slug under `packages/digital-humans/`, then builds the index. Following that layout is the easiest way to build your own. An index looks roughly like this:

```json
{
  "version": 1,
  "generated_at": "2026-10-18T00:00:00Z",
  "source": "https://store.example.com",
  "apps": [
    {
      "slug": "ops/daily-report",
      "name": "Daily report helper",
      "version": "1.0.0",
      "author": "ops",
      "description": "Summarizes operations data every day and posts it to the group",
      "type": "automation",
      "path": "packages/digital-humans/daily-report"
    }
  ]
}
```

`type` `automation` is a Digital Human, `skill` is a skill. A `slug` can be one part, such as `daily-report`, or two parts with the author, such as `ops/daily-report`.

::: tip
If your hosting returns an `ETag`, Halo's "has anything changed?" check takes only a few conditional requests (one per index file), and an unchanged index is not downloaded again.
:::

A static private source only provides the catalog and downloads. The following need a DHP v2 store server, set up by a company build as the primary source: sign-in to publish, **Mine** and My Publications, server review messages, install counts, the Featured badge, rank boards and Scene Collections.

## Company builds {#company-builds}

A company can preset the Store sources when it packages Halo:

- Point the official source to the company's own store server; the name and address are re-applied on every start
- Hide a built-in source: it disappears from the list and its cache is cleared
- Lock a source's switch: if a user changes it, it is restored on the next start

A common setup points the official source to the company's DHP v2 store server and hides the other 4 sources, which turns the Store into a private store with only company content.

::: info
A Halo provided by your company may show different sources, or fewer. The list in **Settings › App Store** on your screen is what counts.
:::

## Only add sources you trust {#safety}

::: danger
Installing a Digital Human or skill lets the AI follow its instructions and scripts with the AI's full permissions: reading and writing files, running commands and going online, without per-call confirmation. When a source's content changes, the default **Auto** strategy also installs patch and minor versions silently. Only add sources you trust, and control who can publish to your private source. See [The AI runs tools without asking each time](/en/advanced/security#tool-permissions).
:::

- Serve the private source over `https://` where you can, so downloads can't be altered in transit
- Turn off built-in sources you don't need to reduce Halo's outbound requests
- To let colleagues install only company-reviewed content, hide the other sources with a [company build](#company-builds)

## Troubleshooting {#troubleshooting}

### Adding fails with `Registry URL must point to a public host`

The address uses `localhost` or a private IP directly. Give the private source a domain name and add it again with an address like `https://store.example.com`.

### Adding fails with `Registry already exists`

A source with the same address is already in the list; the message names it. An extra `/` at the end still counts as the same address.

### Clicking SkillHub's trash icon shows `Cannot remove a built-in registry`

SkillHub is a built-in source and can't be removed. Turn off its switch and its items no longer show.

### The source is added, but the Store shows nothing from it

1. Open `https://store.example.com/digital-humans.json` (or `index.json`) in a browser and confirm this computer can reach it.
2. Check that all three split index files exist. If one is missing Halo reads `index.json`; if that is missing too, nothing loads.
3. Check the required fields of each index entry: `slug`, `name`, `version`, `author`, `description`, `type`, `path`.
4. Go back to the Store and click **Refresh**.

### A new version is published, but the Store still shows the old one

Switch to a Store tab or click **Refresh**. Installed items wait for the next update check (60 seconds after start, then every 6 hours). To check right away, click **Refresh** in the Store first, then **Check for upgrades** in the Digital Human's **Upgrades** settings.

## Next steps {#next-steps}

- [Store](/en/digital-humans/store): how colleagues browse, install and update items from your private source
- [DHP protocol](/en/developers/dhp): the full format of the index and `spec.yaml`
- [Security, privacy and data flow](/en/advanced/security): before a security review, see which addresses Halo contacts and what the AI is allowed to do
