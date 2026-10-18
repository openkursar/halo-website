#!/usr/bin/env node
/**
 * gen-changelog.mjs — render the docs changelog from Halo's release notes.
 *
 * The release notes live in the app repository (RELEASE_NOTES.md, one
 * `## vX.Y.Z` section per release, Chinese and English lines side by side).
 * A copy plus the tag dates is kept under docs-src/.vitepress/data/release-notes/
 * so building the docs never needs the app checkout. Refresh it on each app
 * release (this also updates the version in data/facts.json):
 *
 *   node scripts/gen-changelog.mjs --sync /path/to/hello-halo
 *
 * Writes guide/changelog.md, en/guide/changelog.md and data/changelog.json.
 *   node scripts/gen-changelog.mjs           write the outputs
 *   node scripts/gen-changelog.mjs --check   exit 1 when the outputs are stale
 */

import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(ROOT, 'docs-src')
const DATA = join(DOCS, '.vitepress', 'data')
const NOTES_DIR = join(DATA, 'release-notes')
const NOTES = join(NOTES_DIR, 'RELEASE_NOTES.md')
const DATES = join(NOTES_DIR, 'release-dates.json')
const FACTS = join(DATA, 'facts.json')

// Notes before 2.1.0 repeat each other and describe long-gone behaviour; they
// stay available in GitHub Releases instead of being republished here.
const FIRST_VERSION = '2.1.0'

const CJK = /[\u3400-\u9fff]/

const log = {
  info: (m) => console.log(`[gen-changelog] ${m}`),
  fail: (m) => {
    console.error(`[gen-changelog] ERROR ${m}`)
    process.exit(1)
  },
}

const PAGE = {
  zh: {
    file: 'guide/changelog.md',
    title: '更新日志：Halo 各版本新功能与修复',
    h1: '更新日志',
    description: 'Halo 更新日志：按版本列出每次发布的新功能、改进和修复，最新版本在最前面，内容来自 Halo 的发布说明。',
    intro:
      'Halo 每个版本的发布说明，最新的在最前面。每条记录描述的是发布当时的情况；功能后来可能有调整，现在怎么用以对应的功能页为准，安全相关的现状（例如凭据怎样保存）以[安全、隐私与数据流](/advanced/security)为准。',
    older: '更早的版本见 [GitHub Releases](https://github.com/openkursar/hello-halo/releases)。',
    feed: '想及时知道新版本，可以订阅 [RSS](/feed.xml)。',
  },
  en: {
    file: 'en/guide/changelog.md',
    title: "Changelog: what's new in each Halo release",
    h1: 'Changelog',
    description: "Halo changelog: new features, improvements and fixes in each release, newest first, taken from Halo's release notes.",
    intro:
      'The release notes of every Halo version, newest first. Each entry describes the release as it shipped; features may have changed since, so the feature pages describe how things work today. For security as it stands now, such as how credentials are stored, see [Security, privacy and data flow](/en/advanced/security).',
    older: 'Older versions are listed in [GitHub Releases](https://github.com/openkursar/hello-halo/releases).',
    feed: 'To hear about new versions, subscribe to the [RSS feed](/en/feed.xml).',
  },
}

function cmpVersion(a, b) {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
  return 0
}

/** Split one source line into its Chinese and English renderings (either may be empty). */
function splitLine(raw) {
  let line = raw.trim().replace(/!{2,}\s*/g, '')
  if (!line) return { zh: '', en: '', blank: true }
  if (/^-{3,}$/.test(line) || /^(what's new|更新内容)$/i.test(line)) return { zh: '', en: '' }
  const heading = line.match(/^#{2,6}\s+(.+)$/)
  if (heading) line = `**${heading[1].replace(/^[^\p{L}\p{N}]+/u, '')}**`
  // "**中文标题 · English title** *(中文说明 / English note)*"
  const pair = line.match(/^\*\*(.+?)\s+·\s+(.+?)\*\*(.*)$/)
  if (pair && CJK.test(pair[1]) && !CJK.test(pair[2])) {
    const note = pair[3].trim().match(/^\*\((.+?)\s*\/\s*(.+?)\)\*$/)
    return {
      zh: `**${pair[1]}**${note ? ` *（${note[1]}）*` : ''}`,
      en: `**${pair[2]}**${note ? ` *(${note[2]})*` : ''}`,
      heading: true,
    }
  }
  return CJK.test(line) ? { zh: line, en: '' } : { zh: '', en: line }
}

/** One version's lines → per-locale blocks (headline, items). */
function parseVersion(lines) {
  const out = { zh: [], en: [] }
  for (const raw of lines) {
    const s = splitLine(raw)
    if (s.blank) {
      out.zh.push('')
      out.en.push('')
      continue
    }
    if (s.zh) out.zh.push(s.heading ? { heading: s.zh } : s.zh)
    if (s.en) out.en.push(s.heading ? { heading: s.en } : s.en)
  }
  const result = {}
  for (const locale of ['zh', 'en']) {
    const blocks = []
    let para = null
    let pendingHeading = null
    const flush = () => {
      if (para) blocks.push(para)
      para = null
    }
    for (const entry of out[locale]) {
      if (entry === '') {
        flush()
        continue
      }
      if (typeof entry === 'object') {
        flush()
        pendingHeading = entry.heading
        continue
      }
      if (/^[-*]\s+/.test(entry)) {
        flush()
        blocks.push({ bullet: true, text: entry.replace(/^[-*]\s+/, '') })
        continue
      }
      const text = pendingHeading ? `${pendingHeading}${locale === 'zh' ? '：' : ': '}${entry}` : entry
      pendingHeading = null
      para = para ? { text: `${para.text} ${text}` } : { text }
    }
    flush()
    if (pendingHeading) blocks.push({ text: pendingHeading })
    result[locale] = blocks
  }
  // A release that opens with one Chinese and one English summary line has a headline.
  const firstZh = result.zh[0]
  const firstEn = result.en[0]
  const headline =
    firstZh && firstEn && !firstZh.bullet && !firstEn.bullet && !firstZh.text.startsWith('**') && !firstEn.text.startsWith('**')
      ? { zh: result.zh.shift().text, en: result.en.shift().text }
      : null
  return { headline, blocks: result }
}

function parseNotes(text) {
  const versions = []
  let current = null
  for (const chunk of text.split(/^## /m).slice(1)) {
    const [header, ...body] = chunk.split('\n')
    const m = header.trim().match(/^v?(\d+\.\d+\.\d+)$/)
    if (m) {
      current = { version: m[1], lines: body }
      versions.push(current)
    } else if (current) {
      // A level-2 heading inside a release (e.g. "## 🎉 Key Updates") belongs to it.
      current.lines.push(`### ${header}`, ...body)
    }
  }
  return versions
}

const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*\((.+?)\)\*/g, '($1)').replace(/`([^`]+)`/g, '$1').trim()
const anchorOf = (v) => `v${v.replace(/\./g, '-')}`

function build() {
  if (!existsSync(NOTES)) log.fail(`no release notes at ${NOTES}; run --sync <hello-halo> first`)
  const dates = existsSync(DATES) ? JSON.parse(readFileSync(DATES, 'utf-8')) : {}
  const releases = parseNotes(readFileSync(NOTES, 'utf-8'))
    .filter((r) => cmpVersion(r.version, FIRST_VERSION) >= 0)
    .map((r) => ({ version: r.version, date: dates[r.version] ?? null, ...parseVersion(r.lines) }))
    .filter((r) => r.blocks.zh.length || r.blocks.en.length)
    .sort((a, b) => cmpVersion(b.version, a.version))
  if (releases.length === 0) log.fail('no releases found')

  const pages = {}
  for (const locale of ['zh', 'en']) {
    const p = PAGE[locale]
    const lines = [
      '---',
      `title: ${JSON.stringify(p.title)}`,
      `description: ${JSON.stringify(p.description)}`,
      'type: reference',
      'audience: [beginner, office, developer, admin]',
      'outline: [2, 2]',
      'editLink: false',
      'generated: true',
      '---',
      '',
      `# ${p.h1}`,
      '',
      p.intro,
      '',
      '<!-- public:start -->',
      p.feed,
      '<!-- public:end -->',
      '',
    ]
    for (const r of releases) {
      const blocks = r.blocks[locale]
      if (!blocks.length && !r.headline) continue
      lines.push(`## ${r.version}${r.date ? ` · ${r.date}` : ''} {#${anchorOf(r.version)}}`, '')
      if (r.headline) lines.push(r.headline[locale], '')
      let inList = false
      for (const b of blocks) {
        if (b.bullet) {
          lines.push(`- ${b.text}`)
          inList = true
        } else {
          if (inList) lines.push('')
          lines.push(b.text, '')
          inList = false
        }
      }
      if (inList) lines.push('')
    }
    lines.push('<!-- public:start -->', p.older, '<!-- public:end -->', '')
    pages[locale] = lines.join('\n').replace(/\n{3,}/g, '\n\n')
  }

  const data = {
    version: 1,
    note: 'Generated by scripts/gen-changelog.mjs from data/release-notes/. Do not edit.',
    releases: releases.map((r) => ({
      version: r.version,
      date: r.date,
      anchor: anchorOf(r.version),
      headline: r.headline ? { zh: plain(r.headline.zh), en: plain(r.headline.en) } : null,
      items: {
        zh: r.blocks.zh.map((b) => plain(b.text)),
        en: r.blocks.en.map((b) => plain(b.text)),
      },
    })),
  }
  return {
    [join(DOCS, PAGE.zh.file)]: pages.zh,
    [join(DOCS, PAGE.en.file)]: pages.en,
    [join(DATA, 'changelog.json')]: JSON.stringify(data, null, 1) + '\n',
  }
}

function sync(appRoot) {
  const notes = join(appRoot, 'RELEASE_NOTES.md')
  if (!existsSync(notes)) log.fail(`no RELEASE_NOTES.md in ${appRoot}`)
  mkdirSync(NOTES_DIR, { recursive: true })
  copyFileSync(notes, NOTES)
  const dates = {}
  for (const r of parseNotes(readFileSync(notes, 'utf-8'))) {
    try {
      const d = execFileSync('git', ['-C', appRoot, 'log', '-1', '--format=%cs', `v${r.version}`], {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
      if (d) dates[r.version] = d
    } catch {
      // A release without a tag is published without a date.
    }
  }
  writeFileSync(DATES, JSON.stringify(dates, null, 1) + '\n')
  const latest = Object.keys(dates).sort(cmpVersion).pop()
  if (latest) {
    const facts = JSON.parse(readFileSync(FACTS, 'utf-8'))
    const previous = facts.version
    facts.version = latest
    facts.releaseDate = dates[latest]
    for (const locale of ['zh', 'en']) facts.facts[locale] = facts.facts[locale].split(previous).join(latest)
    writeFileSync(FACTS, JSON.stringify(facts, null, 2) + '\n')
    log.info(`synced release notes; latest release ${latest} (${dates[latest]})`)
  }
}

const args = process.argv.slice(2)
const syncAt = args.indexOf('--sync')
if (syncAt >= 0) {
  const appRoot = args[syncAt + 1]
  if (!appRoot) log.fail('--sync needs the path of the hello-halo checkout')
  sync(resolve(appRoot))
}
const outputs = build()
if (args.includes('--check')) {
  const stale = Object.entries(outputs).filter(([file, text]) => !existsSync(file) || readFileSync(file, 'utf-8') !== text)
  if (stale.length) {
    log.fail(`stale: ${stale.map(([f]) => f.slice(ROOT.length + 1)).join(', ')} — run: node scripts/gen-changelog.mjs`)
  }
  log.info('changelog is up to date')
} else {
  for (const [file, text] of Object.entries(outputs)) {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, text)
  }
  log.info(`wrote the changelog (${Object.keys(outputs).length} files)`)
}
