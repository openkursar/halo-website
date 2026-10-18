---
title: "DHP protocol: Digital Human packages and stores"
description: "DHP, the Digital Human Protocol: the .dhpkg package format and its limits, the static store layout with its index files, and what a DHP v2 store server adds."
type: reference
audience: [developer]
---

# DHP protocol

DHP (Digital Human Protocol) is how Halo packages Digital Humans, skills and MCP servers, and how a store serves them, so that any Halo can install them in one click. This page covers the package format, the static store layout, and what a DHP v2 store server adds. The official Store source follows the same protocol; its repository is [github.com/openkursar/digital-human-protocol](https://github.com/openkursar/digital-human-protocol).

## Packages {#package}

A Digital Human package (`.dhpkg`) is a zip archive:

```text
weekly-report.dhpkg
├── spec.yaml                    required: the Digital Human's spec
└── skills/                      optional: skills that travel with it
    └── report-tools/
        ├── SKILL.md
        └── build-report.js
```

- `spec.yaml` sits at the root of the archive. Importing in Halo also accepts the same files inside one top-level folder, which is what most zip tools produce.
- Each bundled skill sits under `skills/<id>/`, and the spec lists it in `requires.skills` with `bundled: true` and its `files`. See [Browser scripts](/en/developers/digital-humans/production#script-location) for why scripts belong there.
- Keep a package under 10 MB: that is the most the import dialog reads (a folder has no such limit). Export stops when the files add up to more than 50 MB, and other import routes refuse archives over 50 MB or that unpack to more than 200 MB. Every route refuses entries whose path contains `..` or starts with `/`.
- Never put API keys, tokens or passwords in a package: they travel to everyone who installs it.

**Make one.** In the desktop app, on a Digital Human's page, click **⋮ › Share › Export** to get `<slug>-<version>.dhpkg`. Halo packs under `skills/<id>/` each skill it depends on that is declared `bundled: true` or that no Store source can provide; a skill that is neither in a source nor installed stops the export, which names it. A skill exports the same way as a `.zip` of its files, with `SKILL.md` at the root.

**Install one.** Open **Digital Humans**, click **Create Digital Human**, choose **Import**, and drop a `.dhpkg`, a `.zip`, a `spec.yaml` or a folder. Import installs the bundled skills too.

## Store sources {#sources}

A Store source is an address Halo reads a catalog from. Each source speaks one protocol:

| Protocol | What it is |
|---|---|
| `halo` | The static DHP format below: plain files under one address. The official source uses it, and every source you add in Settings is read this way |
| `dhp-v2` | The same static catalog, plus a store server for publishing, review and curation (see [below](#dhp-v2)) |
| `mcp-registry`, `smithery`, `claude-skills`, `skillhub` | Public catalogs of MCP servers and skills, built in. Halo converts their entries; you don't serve these yourself |

To add a company source, see [Private Store sources](/en/advanced/private-store). Halo refuses addresses on private, loopback or link-local networks for sources you add.

## The static format {#static-format}

### Index files {#index-files}

At the root of the source address:

| File | Contents |
|---|---|
| `digital-humans.json`, `skills.json`, `mcps.json` | The split index, read first. If any of the three is missing or invalid, Halo reads `index.json` instead |
| `index.json` | The same content in one file |

Each index file is one object:

```json
{
  "version": 1,
  "generated_at": "2026-10-18T00:00:00Z",
  "source": "https://store.example.com",
  "apps": [
    {
      "slug": "example/weekly-report",
      "name": "Weekly report",
      "version": "1.0.0",
      "author": "example",
      "description": "Sums up last week's orders every Monday",
      "type": "automation",
      "path": "packages/digital-humans/weekly-report",
      "category": "productivity",
      "tags": ["report"]
    }
  ]
}
```

An index with no entries still needs the whole object, with `"apps": []`.

### Entry fields {#entry-fields}

| Field | Required | Meaning |
|---|---|---|
| `slug` | Yes | Unique id: one part (`weekly-report`) or `author/id` (`example/weekly-report`), lower-case letters, digits and `-` |
| `name`, `version`, `author`, `description` | Yes | As in the spec |
| `type` | Yes | `automation` (Digital Human), `skill`, `mcp` or `extension`. Must match the spec |
| `path` | Yes | Folder of the entry, relative to the source address |
| `download_url` | No | Full URL of the entry's `spec.yaml`, when it is not at `<path>/spec.yaml` |
| `display_name`, `icon`, `category`, `tags`, `locale`, `min_app_version`, `i18n` | No | Shown in the Store. `category` defaults to `other` |
| `requires_mcps`, `requires_skills` | No | Ids of its dependencies, for display |
| `size_bytes`, `checksum`, `created_at`, `updated_at`, `meta` | No | Kept with the entry. Halo does not verify `checksum` |
| `format` | No | Only `bundle` is defined; leave it out |

### Files of an entry {#entry-files}

Under each entry's `path`:

- `spec.yaml`: the full spec. Its `store.slug`, if present, must equal the entry's `slug`, and its `type` must match, or the install fails.
- For a skill, `spec.yaml` lists `skill_files` as file names, and each file is served at `<path>/files/<name>`.
- For a Digital Human with bundled skills, each skill file is served at `<path>/skills/<id>/<file>` (a store server may use `<path>/files/skills/<id>/<file>`).

Halo checks the index for changes with conditional requests, so a host that sends an `ETag` keeps refreshes cheap. How installed items pick up a new version is described in [Private Store sources](/en/advanced/private-store#upgrade-strategy).

## DHP v2 store servers {#dhp-v2}

A DHP v2 source serves the same static catalog and adds server endpoints under its address:

| Endpoint | Purpose |
|---|---|
| `GET /capabilities` | Handshake: which of the features below the server offers |
| `POST /apps/{slug}/installs` | Counts installs |
| `GET /collections` | Curated collections shown in the Store |
| `GET /my/publications`, `POST /my/publications/{author}/{id}/unpublish` | A creator's own listings, and taking one down |
| `GET /category-taxonomy.json`, `GET /discover-layout.json` | Categories and the Store's discover page, managed by the operator |

A DHP v2 server is what enables sign-in to publish, review results, **My Publications** and take-downs. A company build can set one up as its primary source. How a submission reaches each kind of store is described in [Publish to the Store](/en/developers/store-publishing#targets).

## Related {#related}

- [Digital Human spec reference](/en/developers/digital-humans/spec): every field of `spec.yaml`
- [Publish to the Store](/en/developers/store-publishing)
- [Private Store sources](/en/advanced/private-store): add and manage a company source
