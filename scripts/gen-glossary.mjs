#!/usr/bin/env node
/**
 * gen-glossary.mjs — render the glossary pages from the terminology dataset.
 *
 * docs-src/.vitepress/data/glossary.json is the one list of product terms the
 * docs use (zh/en wording, the exact UI labels from the app locales, a short
 * definition and the page that explains each term). Writers follow it; this
 * script publishes it as guide/glossary.md and en/guide/glossary.md, linking
 * each term to its page by the page names in data/ia.json.
 *
 *   node scripts/gen-glossary.mjs           write the pages
 *   node scripts/gen-glossary.mjs --check   exit 1 when the pages are stale
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(ROOT, 'docs-src')
const DATA = join(DOCS, '.vitepress', 'data')

const PAGE = {
  zh: {
    file: 'guide/glossary.md',
    title: '术语表：Halo 常用词与界面名称',
    h1: '术语表',
    description: 'Halo 术语表：工作区、数字人、团队、能力、知识库、记忆等常用词的简短说明，附上界面上的原文和详细介绍它的页面。',
    intro: '文档和界面里常见的词，按主题排列。每个词给出简短说明、界面上显示的原文，以及详细介绍它的页面。',
    other: '英文',
    ui: '界面上的文字',
    more: '详见',
    quote: (s) => `「${s}」`,
    join: '',
  },
  en: {
    file: 'en/guide/glossary.md',
    title: 'Glossary: Halo terms and UI names',
    h1: 'Glossary',
    description: 'Halo glossary: short definitions of workspace, Digital Human, team, capabilities, knowledge base, memory and other terms, with the exact UI labels.',
    intro: 'Terms you meet in these docs and in the app, grouped by topic. Each one has a short definition, the labels the app shows, and the page that explains it.',
    other: 'Chinese',
    ui: 'In the app',
    more: 'More',
    quote: (s) => `"${s}"`,
    join: ', ',
  },
}

function fail(message) {
  console.error(`[gen-glossary] ERROR ${message}`)
  process.exit(1)
}

/** IA page names by slug, so a term links with the same name the sidebar shows. */
function pageNames() {
  const ia = JSON.parse(readFileSync(join(DATA, 'ia.json'), 'utf-8'))
  const names = new Map()
  for (const s of ia.sections) for (const g of s.groups) for (const i of g.items) names.set(i.slug, { zh: i.zh, en: i.en })
  return names
}

// Vue compiles every docs page as a template, so interpolation braces and
// angle brackets in data must not reach the markdown as-is.
const safe = (s) => String(s).replace(/{{/g, '{ {').replace(/</g, '&lt;')

function render(locale, terms, names) {
  const p = PAGE[locale]
  const other = locale === 'zh' ? 'en' : 'zh'
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
  ]
  for (const t of terms) {
    const word = locale === 'zh' ? t.zh : t.en.charAt(0).toUpperCase() + t.en.slice(1)
    lines.push(`## ${safe(word)} {#${t.id}}`, '', safe(locale === 'zh' ? t.zh_def : t.en_def), '')
    lines.push(`- ${p.other}：`.replace('：', locale === 'zh' ? '：' : ': ') + safe(t[other]))
    const labels = [...new Set(t.ui.map((u) => u[locale]).filter(Boolean))]
    if (labels.length) lines.push(`- ${p.ui}${locale === 'zh' ? '：' : ': '}${labels.map((l) => safe(p.quote(l))).join(p.join)}`)
    const page = names.get(t.page)
    const link = (locale === 'en' ? '/en/' : '/') + t.page
    lines.push(`- ${p.more}${locale === 'zh' ? '：' : ': '}[${safe(page ? page[locale] : t.page)}](${link})`, '')
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n')
}

const dataFile = join(DATA, 'glossary.json')
if (!existsSync(dataFile)) fail(`no glossary data at ${dataFile}`)
const terms = JSON.parse(readFileSync(dataFile, 'utf-8')).terms
const names = pageNames()
for (const t of terms) if (!names.has(t.page)) fail(`term "${t.id}" links to ${t.page}, which is not a page in data/ia.json`)

const outputs = Object.fromEntries(['zh', 'en'].map((l) => [join(DOCS, PAGE[l].file), render(l, terms, names)]))
if (process.argv.includes('--check')) {
  const stale = Object.entries(outputs).filter(([f, text]) => !existsSync(f) || readFileSync(f, 'utf-8') !== text)
  if (stale.length) fail(`stale: ${stale.map(([f]) => f.slice(ROOT.length + 1)).join(', ')} — run: node scripts/gen-glossary.mjs`)
  console.log('[gen-glossary] glossary is up to date')
} else {
  for (const [f, text] of Object.entries(outputs)) writeFileSync(f, text)
  console.log(`[gen-glossary] wrote ${terms.length} terms to 2 pages`)
}
