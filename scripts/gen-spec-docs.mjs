#!/usr/bin/env node
/**
 * gen-spec-docs.mjs — render the Digital Human spec field tables.
 *
 * Input is the JSON the Halo app repository exports with
 *   node scripts/gen-spec-ref.mjs --export-json <file>
 * committed here as developers/digital-humans/_data/spec.json, so building the
 * docs never needs the app checkout.
 *
 * The tables are written between markers in hand-written pages, so the rest of
 * each page stays prose:
 *
 *   <!-- generated:spec-fields automation -->        full tables, page locale
 *   <!-- generated:spec-fields mcp only=mcp_server -->   listed fields or groups only
 *   <!-- generated:spec-fields automation agent -->   one compact English table
 *   …
 *   <!-- /generated:spec-fields -->
 *
 * Every .md under docs-src (agent guides included) is scanned for markers.
 *
 * Descriptions come from developers/digital-humans/_data/spec-overlay.json:
 * zh and en text per field, a status (`schema-only`, `no-producer`) for fields
 * the app accepts but never acts on, and `hidden` for values Halo sets itself.
 * Entries are keyed by field id; a field that one spec type defines differently
 * (a skill's optional `author`) is keyed `<type>:<id>`.
 * Each entry records the hash of the field it was written against; when the
 * app changes that field, the entry is reported stale and the schema comment
 * is shown instead, so a page never describes an older spec.
 *
 * Usage:
 *   node scripts/gen-spec-docs.mjs            fill every block
 *   node scripts/gen-spec-docs.mjs --check    exit 1 when a block is out of date
 *   node scripts/gen-spec-docs.mjs --hashes   print the current hash of every field
 */

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(ROOT, 'docs-src')
const DATA_DIR = join(DOCS, 'developers', 'digital-humans', '_data')
const SUPPORTED_SCHEMA = 1
const SKIP_DIRS = new Set(['node_modules', '.vitepress', '_data'])

const BLOCK = /<!-- generated:spec-fields ([^>]*?) -->\n[\s\S]*?<!-- \/generated:spec-fields -->/g

const LABELS = {
  en: {
    columns: ['Field', 'Type', 'Required', 'Default / values', 'Description'],
    yes: 'Yes',
    no: 'No',
    top: 'Top-level fields',
    seeBelow: 'see below',
    generated: '_Generated from the schema of Halo {version}._',
    status: {
      'schema-only': '**No effect:** accepted, but nothing reads it.',
      'no-producer': '**No effect:** no event source produces this trigger.',
    },
    formats: { duration: 'duration', cron: 'cron', version: 'version', url: 'URL', 'non-empty': 'non-empty' },
    paren: (text) => ` (${text})`,
    join: ' ',
  },
  zh: {
    columns: ['字段', '类型', '必填', '默认值 / 可选值', '说明'],
    yes: '是',
    no: '否',
    top: '顶层字段',
    seeBelow: '见下文',
    generated: '_本表由 Halo {version} 的 schema 生成。_',
    status: {
      'schema-only': '**无效果：** 可以写，但不会被读取。',
      'no-producer': '**无效果：** 没有事件来源会触发它。',
    },
    formats: { duration: '时长', cron: 'cron', version: '版本号', url: 'URL', 'non-empty': '非空' },
    paren: (text) => `（${text}）`,
    join: '',
  },
}

const AGENT_STATUS = { 'schema-only': 'SCHEMA-ONLY, no effect.', 'no-producer': 'NO PRODUCER, never fires.' }

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

function loadJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'))
}

const fieldHash = (row) =>
  createHash('sha256').update(JSON.stringify([row.path, row.type, row.description ?? ''])).digest('hex').slice(0, 12)

/** Overlay key of each row: its id, or `<type>:<id>` where this type defines the field differently from the first type that has it. */
function overlayKeys(spec) {
  const first = new Map()
  const keys = new Map()
  for (const type of spec.specTypes) {
    for (const row of spec.fields[type]) {
      if (!first.has(row.id)) first.set(row.id, row)
      const shared = fieldHash(first.get(row.id)) === fieldHash(row)
      keys.set(row, shared ? row.id : `${type}:${row.id}`)
    }
  }
  return keys
}

function textFor(row, locale, overlay, problems) {
  const key = problems.keys.get(row)
  const entry = overlay[key]
  if (!entry) {
    problems.missing.add(key)
    return { text: row.description ?? '' }
  }
  if (entry.source !== fieldHash(row)) {
    problems.stale.add(key)
    return { text: row.description ?? '', hidden: entry.hidden }
  }
  if (!entry.hidden && !entry[locale]) problems.untranslated.add(`${key} (${locale})`)
  return { text: entry[locale] ?? entry.en ?? row.description ?? '', status: entry.status, hidden: entry.hidden }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const code = (value) => `\`${String(value).replace(/`/g, "'")}\``
const cell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n+/g, ' ').replace(/\{\{/g, '{ {')

function rootOf(path) {
  return path.split(/[.[]/)[0]
}

function relativePath(path, root) {
  if (path === root) return path
  return path.slice(root.length).replace(/^\[\]/, '').replace(/^\./, '') || path
}

function valuesCell(row) {
  const parts = []
  if (row.default !== undefined) parts.push(`= ${code(JSON.stringify(row.default))}`)
  if (row.values && row.type !== 'literal') parts.push(row.values.map(code).join(', '))
  if (row.type === 'literal') parts.push(code(row.values[0]))
  if (row.constraints) parts.push(row.constraints.join(', '))
  return parts.join('; ') || '—'
}

function typeCell(row, labels) {
  const format = row.format ? labels.paren(labels.formats[row.format] ?? row.format) : ''
  return cell(`${code(row.type)}${format}`)
}

function descriptionCell(text, status, labels) {
  const badge = status ? labels.status[status] : ''
  return cell([badge, text].filter(Boolean).join(labels.join))
}

function humanBlock(spec, type, options, locale, overlay, problems) {
  const labels = LABELS[locale]
  const rows = spec.fields[type]
  if (!rows) throw new Error(`unknown spec type "${type}"`)
  const shown = rows
    .map((row) => ({ row, ...textFor(row, locale, overlay, problems) }))
    .filter(({ hidden }) => !hidden)

  const roots = [...new Set(shown.map(({ row }) => rootOf(row.path)))]
  const containers = new Set(roots.filter((root) => shown.some(({ row }) => row.path !== root && rootOf(row.path) === root)))
  const only = options.only ? new Set(options.only.split(',')) : null
  const header = `| ${labels.columns.join(' | ')} |\n|${labels.columns.map(() => '---').join('|')}|`
  const line = ({ row, text, status }, field) =>
    `| ${field} | ${typeCell(row, labels)} | ${row.required ? labels.yes : labels.no} | ${cell(valuesCell(row))} | ${descriptionCell(text, status, labels)} |`

  const out = [labels.generated.replace('{version}', spec.appVersion), '']
  // With `only`, the top table holds the listed plain fields; listed groups get their own tables below.
  const top = shown.filter(({ row }) => row.path === rootOf(row.path) && (!only || (only.has(row.path) && !containers.has(row.path))))
  if (top.length) {
    out.push(`### ${labels.top} {#fields-top}`, '', header)
    for (const entry of top) {
      const name = entry.row.path
      const field = containers.has(name) ? `${code(name)} ([${labels.seeBelow}](#field-${name.replace(/_/g, '-')}))` : code(name)
      out.push(line(entry, field))
    }
    out.push('')
  }
  for (const root of roots) {
    if (!containers.has(root) || (only && !only.has(root))) continue
    out.push(`### ${code(root)} {#field-${root.replace(/_/g, '-')}}`, '', header)
    for (const entry of shown.filter(({ row }) => rootOf(row.path) === root && row.path !== root)) {
      const variant = entry.row.variant ? labels.paren(code(entry.row.variant)) : ''
      out.push(line(entry, `${code(relativePath(entry.row.path, root))}${variant}`))
    }
    out.push('')
  }
  return out.join('\n').trimEnd()
}

function agentBlock(spec, type, options, overlay, problems) {
  const rows = spec.fields[type]
  if (!rows) throw new Error(`unknown spec type "${type}"`)
  const only = options.only ? new Set(options.only.split(',')) : null
  const out = [`Generated from the schema of Halo ${spec.appVersion}.`, '', '| Field | Type | Req | Default / values | Effect |', '|---|---|---|---|---|']
  for (const row of rows) {
    if (only && !only.has(rootOf(row.path))) continue
    const { text, status, hidden } = textFor(row, 'en', overlay, problems)
    if (hidden) continue
    const field = row.variant ? `${code(row.path)} (${row.variant})` : code(row.path)
    const format = row.format ? ` ${row.format}` : ''
    const effect = [status ? AGENT_STATUS[status] : '', text].filter(Boolean).join(' ')
    out.push(`| ${field} | ${cell(code(row.type) + format)} | ${row.required ? 'yes' : ''} | ${cell(valuesCell(row))} | ${cell(effect)} |`)
  }
  return out.join('\n')
}

function parseOptions(args) {
  const [type, ...rest] = args.trim().split(/\s+/)
  const options = { type, agent: false }
  for (const token of rest) {
    if (token === 'agent') options.agent = true
    else if (token.startsWith('only=')) options.only = token.slice(5)
    else throw new Error(`unknown marker option "${token}"`)
  }
  return options
}

function localeOf(file) {
  const rel = relative(DOCS, file)
  return rel.startsWith('en/') || rel.startsWith('public/') ? 'en' : 'zh'
}

function markdownFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...markdownFiles(join(dir, entry.name)))
    } else if (entry.name.endsWith('.md')) {
      out.push(join(dir, entry.name))
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const check = process.argv.includes('--check')
  const spec = loadJson(join(DATA_DIR, 'spec.json'))
  if (spec.schemaVersion !== SUPPORTED_SCHEMA) {
    console.error(`[gen-spec-docs] spec.json schemaVersion ${spec.schemaVersion} is not supported (expected ${SUPPORTED_SCHEMA})`)
    process.exit(1)
  }

  const keys = overlayKeys(spec)
  if (process.argv.includes('--hashes')) {
    const printed = new Set()
    for (const [row, key] of keys) {
      if (printed.has(key)) continue
      printed.add(key)
      console.log(`${fieldHash(row)}  ${key}`)
    }
    return
  }

  const overlay = loadJson(join(DATA_DIR, 'spec-overlay.json'))
  const known = new Set(keys.values())
  const problems = { keys, missing: new Set(), stale: new Set(), untranslated: new Set() }
  const orphaned = Object.keys(overlay).filter((key) => !known.has(key))

  const outdated = []
  let blocks = 0
  for (const file of markdownFiles(DOCS)) {
    const before = readFileSync(file, 'utf8')
    if (!before.includes('<!-- generated:spec-fields')) continue
    const after = before.replace(BLOCK, (_match, args) => {
      blocks++
      const options = parseOptions(args)
      const body = options.agent
        ? agentBlock(spec, options.type, options, overlay, problems)
        : humanBlock(spec, options.type, options, localeOf(file), overlay, problems)
      return `<!-- generated:spec-fields ${args.trim()} -->\n${body}\n<!-- /generated:spec-fields -->`
    })
    if (after === before) continue
    outdated.push(relative(DOCS, file))
    if (!check) writeFileSync(file, after)
  }

  const report = (label, set) => set.size && console.warn(`[gen-spec-docs] ${label} (${set.size}): ${[...set].sort().join(', ')}`)
  report('no overlay entry, schema comment shown', problems.missing)
  report('stale overlay entry, schema comment shown', problems.stale)
  report('missing translation', problems.untranslated)
  if (orphaned.length) console.warn(`[gen-spec-docs] overlay entries for fields the spec no longer has: ${orphaned.join(', ')}`)

  if (check) {
    if (outdated.length) {
      console.error(`[gen-spec-docs] out of date: ${outdated.join(', ')} — run node scripts/gen-spec-docs.mjs`)
      process.exit(1)
    }
    console.log(`[gen-spec-docs] spec tables are up to date (${blocks} block(s), Halo ${spec.appVersion})`)
    return
  }
  console.log(`[gen-spec-docs] ${outdated.length ? `updated ${outdated.join(', ')}` : 'nothing to update'} (${blocks} block(s), Halo ${spec.appVersion})`)
}

main()
