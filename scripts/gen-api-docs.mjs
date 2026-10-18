#!/usr/bin/env node
/**
 * gen-api-docs.mjs — render the public HTTP API reference pages.
 *
 * Input is the JSON the Halo app repository exports with
 *   node scripts/gen-api-ref.mjs --check --export-json <file>
 * committed here as developers/api/_data/api.json, so building the docs never
 * needs the app checkout. The same reconciled data drives Halo's own
 * assistant, which is what keeps this reference from describing an endpoint
 * the app does not have.
 *
 * Framing (page titles, intros, labels, parameter descriptions; zh + en) lives
 * in scripts/api-docs/framing.json and the overview prose in
 * scripts/api-docs/overview.{zh,en}.md. Operation text stays in English on
 * both locales unless the optional overlay supplies a rewrite or translation.
 *
 * Overlay (optional, developers/api/_data/overlay.json): per-locale
 * replacements keyed by operation id — a reader-facing rewrite of text written
 * for Halo's assistant, details the meta lacks, or a translation. Each entry
 * records the hash of the source text it was written against; once the app
 * changes that text the entry is reported stale and ignored, so a page never
 * describes an older API.
 *
 * Usage:
 *   node scripts/gen-api-docs.mjs                  write pages under docs-src
 *   node scripts/gen-api-docs.mjs --check          exit 1 when pages are out of date
 *   options: --out <docs root>  --data <api.json>  --overlay <overlay.json>  --report <file>
 *
 * Only index.md and the group pages are written; everything else in the
 * folder (the WebSocket page, _data/) is hand-maintained and never touched.
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'scripts', 'api-docs')
const SUPPORTED_SCHEMA = 1
const LOCALES = ['zh', 'en']
const SECTION = 'developers/api'
const METHOD_ORDER = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
/** SEO.md §3.2–3.3: description length per locale, and title width including the " | Halo AI" suffix the site appends (CJK counts 2). */
const DESCRIPTION_RANGE = { zh: [35, 80], en: [70, 160] }
const TITLE_WIDTH_RANGE = [20, 60]
const TITLE_SUFFIX = ' | Halo AI'

const titleWidth = (title) => [...`${title}${TITLE_SUFFIX}`].reduce((w, ch) => w + (/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(ch) ? 2 : 1), 0)

/** Credentials have no business in a public page; any match fails the build. */
const SECRET_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{16,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
]

/**
 * Wording that only makes sense to Halo's assistant, which the meta text was
 * written for. Not filtered out — rewriting it is a human's call — but every
 * hit is listed in the report as a candidate for an overlay rewrite.
 */
const ASSISTANT_VOICE = /\b(you|your|yourself)\b|\b(tell|ask|confirm with) the user\b|\$HALO_|halo_api_ref|request_toolset|\b[a-z]+_automation_app\b|notify_channel|collab_save|skill_manage/i

const log = {
  info: (m) => console.log(`[gen-api-docs] ${m}`),
  warn: (m) => console.warn(`[gen-api-docs] WARN ${m}`),
  fail: (m) => {
    console.error(`[gen-api-docs] ERROR ${m}`)
    process.exit(1)
  },
}

function parseArgs(argv) {
  const value = (flag, fallback) => {
    const at = argv.indexOf(flag)
    if (at === -1) return fallback
    const v = argv[at + 1]
    if (!v || v.startsWith('--')) log.fail(`${flag} needs a value`)
    return v
  }
  const out = resolve(value('--out', join(ROOT, 'docs-src')))
  return {
    check: argv.includes('--check'),
    out,
    data: resolve(value('--data', join(ROOT, 'docs-src', SECTION, '_data', 'api.json'))),
    overlay: value('--overlay', null),
    report: value('--report', null),
  }
}

const readJson = (path) => JSON.parse(readFileSync(path, 'utf-8'))

// ---------------------------------------------------------------------------
// Operations: ids, ownership, overlay
// ---------------------------------------------------------------------------

/** Stable anchor: method + path, lower-case, `:` dropped — "POST /api/spaces/:spaceId" -> "post-api-spaces-spaceid". */
function operationId(method, path) {
  return `${method}-${path}`.toLowerCase().replace(/:/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const routeKey = (method, path) => `${method} ${path}`

/** Hash of the source text an overlay entry was written against. */
function sourceHash(op) {
  const text = JSON.stringify([op.summary, op.body, op.query, op.returns, op.notes, op.useInstead, op.bypassCost])
  return createHash('sha256').update(text).digest('hex').slice(0, 12)
}

function pathPattern(path) {
  const source = path
    .split('/')
    .map((seg) => (seg.startsWith(':') ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/')
  return new RegExp(`^${source}$`)
}

function prepareOperations(data, overlay, problems) {
  const ops = data.operations.map((op) => ({ ...op, id: operationId(op.method, op.path), hash: sourceHash(op) }))

  // An entry for an operation the app no longer has would silently never render.
  const ids = new Set(ops.map((op) => op.id))
  for (const locale of LOCALES) {
    for (const id of Object.keys(overlay[locale] ?? {})) {
      if (!ids.has(id)) problems.push(`overlay.${locale}.${id}: no such operation in this export — removed or renamed in the app?`)
    }
  }

  const seen = new Map()
  for (const op of ops) {
    if (seen.has(op.id)) log.fail(`anchor collision: ${routeKey(op.method, op.path)} and ${seen.get(op.id)} both map to #${op.id}`)
    seen.set(op.id, routeKey(op.method, op.path))
    op.page = op.groups[0]
    op.pattern = pathPattern(op.path)
  }
  return ops
}

function applyEntry(op, entry, label, problems) {
  if (!entry) return op
  if (entry.source !== op.hash) {
    problems.push(`overlay.${label}.${op.id}: stale (written against ${entry.source}, source is now ${op.hash}) — ignored`)
    return op
  }
  const replaced = {}
  for (const field of ['summary', 'body', 'bodyExample', 'query', 'returns', 'impact', 'narrowerAlternative']) {
    if (entry[field] !== undefined) replaced[field] = entry[field]
  }
  if (entry.notes) replaced.notes = entry.notes.map((n) => (typeof n === 'string' ? { kind: 'note', text: n } : n))
  return { ...op, ...replaced, rewritten: op.rewritten || Boolean(entry.notes) }
}

/**
 * The text to show for an operation in one locale. The English rewrite is the
 * base on both pages, so a zh page never shows the assistant-facing wording the
 * en page already replaced; a zh entry then translates on top of it.
 */
function textFor(op, locale, overlay, problems) {
  const english = applyEntry(op, overlay.en?.[op.id], 'en', problems)
  if (locale !== 'zh') return english
  const zh = overlay.zh?.[op.id]
  const shown = applyEntry(english, zh, 'zh', problems)
  return shown === english ? shown : { ...shown, translated: Boolean(zh.notes) }
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/** Prose is rendered by markdown-it and then compiled by Vue: `<x>` would become a tag and `{{` an interpolation. */
function escapeProse(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;')
}

const escapeCell = (text) => text.replace(/\|/g, '\\|')

/** The meta text addresses a live session, where `$HALO_SPACE_ID` is set; a reader has a path parameter instead. */
const humanize = (text) => text.replace(/\$HALO_SPACE_ID/g, ':spaceId')

function pageLink(locale, page, id) {
  const base = locale === 'en' ? `/en/${SECTION}` : `/${SECTION}`
  return `${base}/${page}${id ? `#${id}` : ''}`
}

function findOperation(ops, method, rawPath) {
  const path = humanize(rawPath).replace(/<([A-Za-z]\w*)[^>]*>/g, ':$1')
  return (
    ops.find((op) => op.method === method && op.path === path) ??
    ops.find((op) => op.method === method && op.pattern.test(path.replace(/:\w+/g, 'x')))
  )
}

/** A path is ASCII: prose around it (a CJK full stop, a closing parenthesis) ends it, and so does a trailing period. */
const ENDPOINT_RE = /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/[A-Za-z0-9_\-/:<>{}.$*~]*[A-Za-z0-9_\-/:<>{}$*~])/g

/** Escapes prose and turns every "METHOD /api/..." mention of a documented operation into a link to it. */
function renderProse(text, ctx) {
  const source = humanize(text)
  const parts = []
  let last = 0
  for (const m of source.matchAll(ENDPOINT_RE)) {
    // "<id — a uuid from GET /api/spaces>": the `>` closes the placeholder, not the path.
    const path = m[2].endsWith('>') && !m[2].includes('<') ? m[2].slice(0, -1) : m[2]
    parts.push(escapeProse(source.slice(last, m.index)))
    const target = findOperation(ctx.ops, m[1], path)
    const label = `\`${m[1]} ${path}\``
    parts.push(target ? `[${label}](${target.page === ctx.page ? '' : pageLink(ctx.locale, target.page, '')}#${target.id})` : label)
    last = m.index + m[0].length - (m[2].length - path.length)
  }
  parts.push(escapeProse(source.slice(last)))
  return parts.join('')
}

function isStrictJson(text) {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

function codeBlock(text, lang) {
  return ['```' + lang, text, '```']
}

/** Strict JSON is pretty-printed; a written shape (`{success:true,data:boolean}`) is shown as written. */
function shapeBlock(text) {
  return isStrictJson(text) ? codeBlock(JSON.stringify(JSON.parse(text), null, 2), 'json') : codeBlock(text, 'ts')
}

/** Names in a written query string: "?q=report&limit=50" -> ["q", "limit"]. */
function queryNames(query) {
  return query ? [...query.matchAll(/[?&]([^=&]+)=/g)].map((m) => m[1]) : []
}

const shellQuote = (s) => `'${s.replace(/'/g, `'\\''`)}'`

function curlExample(op) {
  const url = `"$HALO_URL${op.path.replace(/:(\w+)/g, '<$1>')}${op.query ? humanize(op.query) : ''}"`
  const auth = '-H "Authorization: Bearer $HALO_TOKEN"'
  if (op.bodyExample === undefined) {
    return op.method === 'GET' ? `curl -s ${url} \\\n  ${auth}` : `curl -sX ${op.method} ${url} \\\n  ${auth}`
  }
  const body = humanize(JSON.stringify(op.bodyExample))
  return [`curl -sX ${op.method} ${url} \\`, `  ${auth} \\`, '  -H "Content-Type: application/json" \\', `  -d ${shellQuote(body)}`].join('\n')
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function frontmatter({ title, description }) {
  return ['---', `title: ${JSON.stringify(title)}`, `description: ${JSON.stringify(description)}`, 'type: reference', 'audience: [developer]', 'generated: true', 'editLink: false', '---']
}

function generatedNotice(data, source) {
  return `<!-- Generated by scripts/gen-api-docs.mjs from ${source} (Halo ${data.appVersion}). Do not edit by hand. -->`
}

function sortOps(ops) {
  return [...ops].sort((a, b) => a.path.localeCompare(b.path) || METHOD_ORDER.indexOf(a.method) - METHOD_ORDER.indexOf(b.method))
}

function badges(op, L) {
  const out = []
  if (op.impact === 'irreversible') out.push(`<Badge type="danger" text="${L.irreversible}" />`)
  else if (op.impact === 'reversible') out.push(`<Badge type="tip" text="${L.reversible}" />`)
  if (op.expose === 'ai') out.push(`<Badge type="info" text="${L.assistant}" />`)
  return out.join(' ')
}

function renderParams(op, ctx) {
  const names = [...op.path.matchAll(/:(\w+)/g)].map((m) => m[1])
  if (names.length === 0) return []
  const { L, framing, locale } = ctx
  const rows = names.map((name) => {
    const described = framing.params[name]?.[locale]
    if (!described) ctx.problems.push(`no ${locale} description for path parameter :${name} (framing.json params)`)
    return `| \`${name}\` | ${escapeCell(renderProse(described ?? L.pathParamFallback, ctx))} |`
  })
  return [`**${L.pathParams}**`, '', `| ${L.name} | ${L.description} |`, '| --- | --- |', ...rows, '']
}

function renderOperation(source, ctx) {
  const { L, locale } = ctx
  const op = textFor(source, locale, ctx.overlay, ctx.problems)
  const englishBlock = locale === 'zh' && !op.translated
  const lines = [`## ${escapeProse(op.summary)} {#${op.id}}`, '', `\`${op.method} ${op.path}\` ${badges(op, L)}`.trimEnd(), '']

  if (op.impact === 'irreversible') {
    lines.push(`::: danger ${L.irreversible}`, L.irreversibleText)
    if (op.narrowerAlternative) {
      const [method, path] = op.narrowerAlternative.split(' ')
      lines.push(`${L.narrower} ${renderProse(`${method} ${path}`, ctx)}`)
    }
    lines.push(':::', '')
  }

  const notes = (op.notes ?? []).filter((n) => n.kind !== 'error')
  const errors = (op.notes ?? []).filter((n) => n.kind === 'error')
  const prose = []
  if (op.expose === 'wrapped' && !op.rewritten) prose.push(`- ${L.wrapped} ${renderProse(op.bypassCost, ctx)}`)
  for (const n of notes) prose.push(`- ${renderProse(n.text, ctx)}`)
  if (prose.length) {
    if (englishBlock) lines.push('<div lang="en">', '')
    lines.push(...prose, '')
    if (englishBlock) lines.push('</div>', '')
  }

  lines.push(...renderParams(op, ctx))

  // Required names come from the meta; the rest are what the handler's own source reads.
  const required = queryNames(op.query)
  const query = [...new Set([...required, ...(op.reads?.query ?? [])])]
  if (query.length) {
    const list = query.map((name) => `\`${name}\`${required.includes(name) ? L.requiredMark : ''}`).join(L.listSeparator)
    lines.push(`**${L.query}**${L.colon}${list}`, '')
  }

  if (op.body !== undefined) {
    const body = humanize(op.body)
    if (op.bodyExample === undefined && !body.trim().startsWith('{')) {
      lines.push(`**${L.body}**${L.colon}${renderProse(body, ctx)}`, '')
    } else {
      lines.push(`**${L.body}**`, '', ...shapeBlock(body), '')
    }
  }

  if (op.returns) lines.push(`**${L.response}**`, '', ...shapeBlock(humanize(op.returns)), '')

  if (errors.length) {
    lines.push(`**${L.errors}**`, '')
    if (englishBlock) lines.push('<div lang="en">', '')
    lines.push(...errors.map((n) => `- ${renderProse(n.text, ctx)}`), '')
    if (englishBlock) lines.push('</div>', '')
  }

  lines.push(`**${L.example}**`, '', ...codeBlock(curlExample(op), 'bash'), '')
  return lines
}

function renderGroupPage(group, ctx, data) {
  const { L, locale, framing } = ctx
  const f = framing.groups[group.id][locale]
  const listed = sortOps(ctx.ops.filter((op) => op.groups.includes(group.id)))
  const owned = listed.filter((op) => op.page === group.id)

  const rows = listed.map((op) => {
    const { summary, impact } = textFor(op, locale, ctx.overlay, [])
    const href = op.page === group.id ? `#${op.id}` : pageLink(locale, op.page, op.id)
    const elsewhere = op.page === group.id ? '' : ` (${framing.groups[op.page][locale].name})`
    const mark = impact === 'irreversible' ? ` <Badge type="danger" text="${L.irreversible}" />` : ''
    return `| [${escapeCell(escapeProse(summary))}](${href})${escapeCell(elsewhere)}${mark} | \`${op.method} ${escapeCell(op.path)}\` |`
  })

  const lines = [
    ...frontmatter({ title: f.title, description: f.description }),
    '',
    generatedNotice(data, `${SECTION}/_data/api.json`),
    '',
    `# ${f.heading}`,
    '',
    f.intro,
    '',
    L.groupLead.replace('{overview}', pageLink(locale, '', '')),
    '',
    `| ${L.operation} | ${L.endpoint} |`,
    '| --- | --- |',
    ...rows,
    '',
  ]
  for (const op of owned) lines.push(...renderOperation(op, { ...ctx, page: group.id }))
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}

function renderOverview(data, ctx) {
  const { locale, framing } = ctx
  const template = readFileSync(join(ASSETS, `overview.${locale}.md`), 'utf-8')
  const documented = ctx.ops.length
  const groupTable = [
    `| ${ctx.L.group} | ${ctx.L.covers} | ${ctx.L.operations} |`,
    '| --- | --- | ---: |',
    ...data.groups.map((g) => {
      const f = framing.groups[g.id][locale]
      const count = ctx.ops.filter((op) => op.groups.includes(g.id)).length
      return `| [${f.name}](${pageLink(locale, g.id, '')}) | ${escapeCell(f.short)} | ${count} |`
    }),
  ].join('\n')
  const tokens = {
    appVersion: data.appVersion,
    documentedCount: String(documented),
    internalCount: String(data.counts.totalRoutes - documented),
    groupTable,
  }
  const page = template.replace(/\{\{(\w+)\}\}/g, (whole, name) => {
    if (!(name in tokens)) log.fail(`overview.${locale}.md: unknown token ${whole}`)
    return tokens[name]
  })
  return page.replace(/^(---\n[\s\S]*?\n---\n)/, `$1\n${generatedNotice(data, `scripts/api-docs/overview.${locale}.md`)}\n`)
}

// ---------------------------------------------------------------------------
// Checks, report, output
// ---------------------------------------------------------------------------

function validateFraming(data, framing) {
  for (const locale of LOCALES) {
    if (!framing.labels[locale]) log.fail(`framing.json: no labels for ${locale}`)
    for (const g of data.groups) {
      const f = framing.groups[g.id]?.[locale]
      if (!f) log.fail(`framing.json: group '${g.id}' has no ${locale} framing — the app added a group; add its title, intro and description`)
      for (const field of ['title', 'heading', 'name', 'description', 'intro', 'short']) {
        if (!f[field]) log.fail(`framing.json: groups.${g.id}.${locale}.${field} is missing`)
      }
      const [minDesc, maxDesc] = DESCRIPTION_RANGE[locale]
      const descLength = [...f.description].length
      if (descLength < minDesc || descLength > maxDesc) {
        log.fail(`framing.json: groups.${g.id}.${locale}.description is ${descLength} chars (allowed ${minDesc}–${maxDesc})`)
      }
      const width = titleWidth(f.title)
      if (width < TITLE_WIDTH_RANGE[0] || width > TITLE_WIDTH_RANGE[1]) {
        log.fail(`framing.json: groups.${g.id}.${locale}.title is ${width} wide with the suffix (allowed ${TITLE_WIDTH_RANGE.join('–')})`)
      }
    }
  }
  const stale = Object.keys(framing.groups).filter((id) => !data.groups.some((g) => g.id === id))
  if (stale.length) log.fail(`framing.json: groups no longer in the export: ${stale.join(', ')}`)
}

function assertNoSecrets(files) {
  for (const [path, content] of files) {
    for (const re of SECRET_PATTERNS) {
      const m = content.match(re)
      if (m) log.fail(`${path}: text matching a credential pattern (${re}) — never publish a secret, fix the source`)
    }
  }
}

/** Same shape test the app generator uses to demand an `impact` on AI-exposed routes. */
const isDestructiveShaped = (op) => op.method === 'DELETE' || ['/remove', '/clear', '/uninstall', '/unbind', '/reset'].some((s) => op.path.endsWith(s))

function buildReport(data, ops, problems) {
  const voiced = []
  const undescribed = []
  for (const op of ops) {
    const hits = [op.summary, op.body, op.bypassCost, ...(op.notes ?? []).map((n) => n.text)].filter((t) => t && ASSISTANT_VOICE.test(t))
    if (op.expose === 'wrapped' || hits.length) voiced.push({ op, hits })
    const text = [op.query, op.body, ...(op.notes ?? []).map((n) => n.text)].join(' ')
    const query = (op.reads?.query ?? []).filter((name) => !text.includes(name))
    const body = (op.reads?.body ?? []).filter((name) => !text.includes(name))
    if (query.length || body.length) undescribed.push(`- \`${op.method} ${op.path}\`${query.length ? ` query: ${query.join(', ')}` : ''}${body.length ? ` body: ${body.join(', ')}` : ''}`)
  }
  const unmarked = ops.filter((op) => isDestructiveShaped(op) && !op.impact).map((op) => `- \`${op.method} ${op.path}\` (${op.expose})`)
  const lines = [
    `# API reference report — Halo ${data.appVersion}`,
    '',
    `Documented operations: ${ops.length} (${ops.filter((o) => o.expose === 'ai').length} ai, ${ops.filter((o) => o.expose === 'wrapped').length} wrapped). Routes without public docs: ${data.counts.totalRoutes - ops.length}.`,
    '',
    `## Problems (${problems.length})`,
    '',
    ...(problems.length ? problems.map((p) => `- ${p}`) : ['- none']),
    '',
    `## Fields the handler reads that the meta never mentions (${undescribed.length})`,
    '',
    'Fix in the app meta (`*.routes.meta.ts`: `query` for required ones, `notes` otherwise). Pages already list these names, without a description.',
    '',
    ...(undescribed.length ? undescribed : ['- none']),
    '',
    `## Destructive-shaped operations without an impact mark (${unmarked.length})`,
    '',
    'The meta gives these no `impact` (wrapped routes cannot carry one today), so a page shows a badge only where the overlay adds it.',
    '',
    ...(unmarked.length ? unmarked : ['- none']),
    '',
    `## Text written for the assistant — candidates for an overlay rewrite (${voiced.length} operations)`,
    '',
    'Each entry: anchor id, source hash to put in overlay `source`, and the lines that address the assistant.',
    '',
  ]
  for (const { op, hits } of voiced) {
    lines.push(`### ${op.method} ${op.path}`, '', `- id \`${op.id}\`, source \`${op.hash}\`, expose ${op.expose}`)
    if (op.expose === 'wrapped') lines.push(`- wrapped: no body/response documented; bypassCost: ${op.bypassCost}`)
    for (const h of hits) lines.push(`- ${h}`)
    lines.push('')
  }
  // Every translation or rewrite pins the text it was written against, so translators need every hash, not just the flagged ones.
  lines.push(`## Source hashes (${ops.length})`, '', '| id | source |', '| --- | --- |', ...ops.map((op) => `| \`${op.id}\` | \`${op.hash}\` |`), '')
  return lines.join('\n')
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!existsSync(args.data)) log.fail(`no API data at ${args.data} — export it from the app: node scripts/gen-api-ref.mjs --check --export-json <file>`)
  const data = readJson(args.data)
  if (data.schemaVersion !== SUPPORTED_SCHEMA) log.fail(`api.json schemaVersion ${data.schemaVersion}, this renderer understands ${SUPPORTED_SCHEMA}`)

  const framing = readJson(join(ASSETS, 'framing.json'))
  validateFraming(data, framing)
  const overlayPath = args.overlay ? resolve(args.overlay) : join(dirname(args.data), 'overlay.json')
  const overlay = existsSync(overlayPath) ? readJson(overlayPath) : {}

  const problems = []
  const ops = prepareOperations(data, overlay, problems)

  const files = new Map()
  for (const locale of LOCALES) {
    const ctx = { locale, L: framing.labels[locale], framing, ops, overlay, problems }
    const dir = join(args.out, locale === 'en' ? 'en' : '', SECTION)
    files.set(join(dir, 'index.md'), renderOverview(data, ctx))
    for (const g of data.groups) files.set(join(dir, `${g.id}.md`), renderGroupPage(g, ctx, data))
  }
  assertNoSecrets(files)
  const unique = [...new Set(problems)]
  for (const p of unique) log.warn(p)

  if (args.report) {
    mkdirSync(dirname(resolve(args.report)), { recursive: true })
    writeFileSync(resolve(args.report), buildReport(data, ops, unique))
  }

  // A page left behind by a group the app dropped would keep publishing a dead reference.
  const orphans = []
  for (const locale of LOCALES) {
    const dir = join(args.out, locale === 'en' ? 'en' : '', SECTION)
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (!name.endsWith('.md') || files.has(path)) continue
      if (/^generated:\s*true$/m.test(readFileSync(path, 'utf-8').split('\n---')[0])) orphans.push(path)
    }
  }

  if (args.check) {
    const stale = [...files].filter(([path, content]) => !existsSync(path) || readFileSync(path, 'utf-8') !== content).map(([path]) => path)
    if (stale.length || orphans.length) {
      for (const p of stale) console.error(`[gen-api-docs] stale: ${p}`)
      for (const p of orphans) console.error(`[gen-api-docs] orphaned generated page: ${p}`)
      log.fail('API reference pages are out of date — run: node scripts/gen-api-docs.mjs')
    }
    log.info(`API reference is up to date (${files.size} pages)`)
    return
  }

  for (const [path, content] of files) {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
  for (const p of orphans) log.warn(`orphaned generated page (delete it and add a redirect): ${p}`)
  log.info(`wrote ${files.size} pages for ${ops.length} operations under ${args.out}`)
}

main()
