import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import matter from 'gray-matter'
import type { SiteConfig } from 'vitepress'
import { applyEditionGates, isInternal, srcDir, stripComments } from '../config/edition'
import { ia, facts, legacyPages, type Locale } from '../config/ia'
import { htmlPath, ORIGIN } from '../config/head'

// Absolute links in the AI outputs. The intranet edition links root-relative
// unless HALO_DOCS_ORIGIN names its own host, so nothing points at the public site.
const LINK_ORIGIN = process.env.HALO_DOCS_ORIGIN ?? (isInternal ? '' : ORIGIN)
const DOCS = LINK_ORIGIN + '/docs/'

const MIRROR_DIR = 'ai-guides/docs'

interface Page {
  rel: string
  locale: Locale
  /** Path without the locale prefix: `features/spaces.md`. */
  local: string
  fm: Record<string, any>
  body: string
}

const localeOf = (rel: string): Locale => (rel.startsWith('en/') ? 'en' : 'zh')
const localPath = (rel: string) => (rel.startsWith('en/') ? rel.slice(3) : rel)

/** Last commit date per source file, from one `git log` pass. */
function lastModified(): Map<string, string> {
  const out = new Map<string, string>()
  try {
    const log = execFileSync('git', ['log', '--format=%x00%cI', '--name-only', '--', '.'], { cwd: srcDir, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 })
    let date = ''
    for (const line of log.split('\n')) {
      if (line.startsWith('\0')) date = line.slice(1).trim()
      else if (line.trim()) {
        const rel = line.trim().replace(/^docs-src\//, '')
        if (!out.has(rel)) out.set(rel, date)
      }
    }
  } catch {
    // Not a git checkout: the field is simply omitted.
  }
  return out
}

/** The hand-written agent guides, published raw at /docs/ai-guides/ (fixed paths). */
function agentGuides(): { path: string; title: string }[] {
  const root = path.join(srcDir, 'public', 'ai-guides')
  const out: { path: string; title: string }[] = []
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name)
      if (e.isDirectory()) walk(abs)
      else if (e.name.endsWith('.md')) {
        const text = fs.readFileSync(abs, 'utf-8')
        const title = text.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? e.name
        out.push({ path: path.relative(root, abs).split(path.sep).join('/'), title })
      }
    }
  }
  if (fs.existsSync(root)) walk(root)
  return out.sort((a, b) => (a.path === 'index.md' ? -1 : b.path === 'index.md' ? 1 : a.path.localeCompare(b.path)))
}

/** Split off fenced code so link and component rewrites never touch code samples. */
function mapOutsideFences(src: string, fn: (text: string) => string): string {
  const parts = src.split(/(^(?:```|~~~)[^\n]*\n[\s\S]*?^(?:```|~~~)[ \t]*$)/m)
  return parts.map((part, i) => (i % 2 === 1 ? part : fn(part))).join('')
}

const PLATFORM_LABEL: Record<string, string> = { macos: 'macOS', windows: 'Windows', linux: 'Linux', web: 'Web', android: 'Android', server: 'Halo Server' }

function plainComponents(text: string, locale: Locale): string {
  const paren = (s: string) => (locale === 'zh' ? `（${s}）` : ` (${s})`)
  return text
    .replace(/<script\b[\s\S]*?<\/script>/g, '')
    .replace(/<style\b[\s\S]*?<\/style>/g, '')
    .replace(/<Badge\b[^>]*?\btext="([^"]*)"[^>]*\/?>/g, (_, t) => paren(t))
    .replace(/<Shortcut\b[^>]*?\bmac="([^"]*)"[^>]*?\bother="([^"]*)"[^>]*\/?>/g, (_, mac, other) =>
      locale === 'zh' ? `${mac}（macOS）/ ${other}（Windows、Linux）` : `${mac} (macOS) / ${other} (Windows, Linux)`
    )
    .replace(/^\s*<template\s+#(\w+)>\s*$/gm, (_, p) => `#### ${PLATFORM_LABEL[p] ?? p}`)
    .replace(/^\s*<\/template>\s*$/gm, '')
    .replace(/^\s*<\/?PlatformTabs\b[^>]*>\s*$/gm, '')
    .replace(/^\s*<\/?div\b[^>]*>\s*$/gm, '')
    .replace(/^\s*<[A-Z][\w-]*\b[^>]*\/>\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
}

/** Resolve a markdown link target to a published path under /docs/ (no origin), or undefined if external. */
function resolveLink(url: string, page: Page): string | undefined {
  if (/^[a-z][\w+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('#')) return undefined
  const [pathPart, hash = ''] = url.split('#')
  let target: string
  if (pathPart.startsWith('/')) target = pathPart.slice(1)
  else target = path.posix.normalize(path.posix.join(path.posix.dirname(page.rel), pathPart))
  if (target.startsWith('docs/')) target = target.slice(5)
  if (/\.(png|jpe?g|webp|gif|svg|pdf|zip|json|txt)$/i.test(target)) return target + (hash ? `#${hash}` : '')
  target = target.replace(/\.(md|html)$/, '')
  if (target === 'index' || target.endsWith('/index')) target = target.slice(0, -5)
  else if (target !== '' && !target.endsWith('/')) target += '.html'
  return target + (hash ? `#${hash}` : '')
}

function rewriteLinks(text: string, page: Page, toUrl: (published: string) => string, image: (alt: string, url: string) => string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (_, alt, url) => image(alt, url))
    .replace(/(?<!!)\[([^\]]+)\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (whole, label, url) => {
      const published = resolveLink(url, page)
      return published === undefined ? whole : `[${label}](${toUrl(published)})`
    })
}

function withLead(body: string, fm: Record<string, any>): string {
  const desc = typeof fm.description === 'string' ? fm.description.trim() : ''
  const lines = body.replace(/^\s+/, '').split('\n')
  const h1 = lines.findIndex((l) => /^#\s+/.test(l))
  if (h1 < 0) return `# ${fm.title ?? ''}\n\n${desc ? desc + '\n\n' : ''}${body.trim()}\n`
  if (!desc || fm.layout === 'home' || fm.type === 'hub' || fm.type === 'landing') return lines.join('\n').trim() + '\n'
  lines.splice(h1 + 1, 0, '', desc)
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}

function yamlFrontmatter(fields: Record<string, unknown>): string {
  const lines = ['---']
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) continue
    lines.push(`${k}: ${Array.isArray(v) ? `[${v.map((x) => JSON.stringify(String(x))).join(', ')}]` : JSON.stringify(v)}`)
  }
  lines.push('---', '')
  return lines.join('\n')
}

const ABOUT = {
  zh: {
    title: 'Halo 文档（Halo AI 工作站）',
    howTo: '## 给 AI 助手的说明',
    rules: [
      '本文档描述 Halo 当前版本（{version}）。标注 `since: "3.0"` 的功能在 2.x 中不存在。',
      '界面文字以文档为准，中文页面使用简体中文界面的原文标签，英文页面使用英文标签。',
      '不同版本或企业定制的 Halo，登录方式、消息通道和商店来源可能不同：不要断言某台电脑上一定有某个选项，以用户屏幕为准。',
      '每个页面都有同路径的 `.md` 版本；完整内容见 llms-full.txt。',
      '用户在 Halo 里可以直接问 Halo，它会自己读这些文档。HTTP API 参考在「开发者 › HTTP API」。',
    ],
    legacy: '待迁移的旧页面',
    other: '其他页面',
    home: '文档首页',
    guides: 'Halo 助手指南（英文原文，Halo 内置 AI 读取的资料）',
  },
  en: {
    title: 'Halo Docs (Halo AI Workstation)',
    howTo: '## How AI assistants should use these docs',
    rules: [
      'These docs describe the current Halo release ({version}). Features marked `since: "3.0"` do not exist in 2.x.',
      'UI labels are quoted exactly as the app shows them: English labels on English pages, Simplified Chinese labels on Chinese pages.',
      'Sign-in options, message channels and store sources can differ between builds and enterprise editions: do not assert that a specific computer has an option; the user\'s screen is the authority.',
      'Every page has a `.md` version at the same path; the full text is in llms-full.txt.',
      'Inside Halo, users can simply ask Halo, which reads these docs itself. The HTTP API reference is under Developers › HTTP API.',
    ],
    legacy: 'Legacy pages (being migrated)',
    other: 'Other pages',
    home: 'Docs home',
    guides: 'Halo assistant guides (raw text read by Halo\'s built-in AI)',
  },
}

// Keyword landing pages (seo/) are for search engines, not for AI readers' facts.
function isLanding(p: Page): boolean {
  return p.fm.type === 'landing' || p.local.startsWith('seo/')
}

function isGeneratedApi(p: Page): boolean {
  return p.fm.generated === true && /^developers\/api\/(index|[\w-]+)\.md$/.test(p.local) && !/^developers\/api\/(websocket|recipes)\.md$/.test(p.local)
}

/**
 * Writes the AI-readable layer (AI-LAYER.md §3): a `.md` twin next to every page,
 * llms.txt / llms-full.txt per locale, and the agent mirror under ai-guides/docs/.
 * Everything is derived from the edition-gated source, so it can never contain
 * text the HTML of the same edition does not.
 */
export function writeAiLayer(siteConfig: SiteConfig): { twins: number; mirror: number } {
  const outDir = siteConfig.outDir
  const dates = lastModified()
  // Agent guides still rendered from public/ until their successors ship already
  // have their raw text at /docs/ai-guides/; they get no second copy here.
  const pages: Page[] = siteConfig.pages.filter((rel) => !rel.startsWith('public/')).map((rel) => {
    const raw = fs.readFileSync(path.join(srcDir, rel), 'utf-8')
    const { data, content } = matter(raw)
    return { rel, locale: localeOf(rel), local: localPath(rel), fm: data ?? {}, body: content }
  })
  const byRel = new Map(pages.map((p) => [p.rel, p]))

  // Order = sidebar order, then legacy pages, then anything else.
  const ordered = (locale: Locale) => {
    const sections: { title: string; groups: { title: string; pages: Page[] }[] }[] = []
    const seen = new Set<string>()
    for (const s of ia.sections) {
      const groups = s.groups
        .map((g) => ({
          title: g[locale],
          pages: g.items
            .map((i) => byRel.get((locale === 'en' ? 'en/' : '') + (i.slug.endsWith('/') ? `${i.slug}index.md` : `${i.slug}.md`)))
            .filter((p): p is Page => !!p),
        }))
        .filter((g) => g.pages.length)
      groups.forEach((g) => g.pages.forEach((p) => seen.add(p.rel)))
      if (groups.length) sections.push({ title: s[locale], groups })
    }
    const legacy = legacyPages(locale).map((l) => byRel.get(l.file)).filter((p): p is Page => !!p && !seen.has(p.rel))
    legacy.forEach((p) => seen.add(p.rel))
    const home = locale === 'en' ? 'en/index.md' : 'index.md'
    const rest = pages.filter((p) => p.locale === locale && !seen.has(p.rel) && p.rel !== home)
    return { sections, legacy, rest }
  }

  const titleOf = (p: Page) => {
    const h1 = p.body.match(/^#\s+(.+)$/m)?.[1]
    return String(p.fm.title ?? h1 ?? p.local).replace(/\s*\|\s*Halo(\s+AI)?\s*$/, '').trim()
  }
  const mdUrl = (p: Page) => DOCS + p.rel

  const llms = new Map<Locale, string>()
  for (const locale of ['zh', 'en'] as Locale[]) {
    const a = ABOUT[locale]
    const { sections, legacy, rest } = ordered(locale)
    const lines = [`# ${a.title}`, '', `> ${facts.definition[locale]}`, '', facts.facts[locale], '', a.howTo, '']
    lines.push(...a.rules.map((r) => `- ${r.replace('{version}', facts.version)}`), '')
    const entry = (p: Page) => `- [${titleOf(p)}](${mdUrl(p)})${p.fm.description ? `: ${String(p.fm.description).trim()}` : ''}`
    const home = byRel.get(locale === 'en' ? 'en/index.md' : 'index.md')
    if (home) lines.push(`## ${a.home}`, '', entry(home), '')
    for (const s of sections) {
      lines.push(`## ${s.title}`, '')
      for (const g of s.groups) lines.push(`### ${g.title}`, '', ...g.pages.map(entry), '')
    }
    if (legacy.length) lines.push(`## ${a.legacy}`, '', ...legacy.map(entry), '')
    if (rest.length) lines.push(`## ${a.other}`, '', ...rest.map(entry), '')
    lines.push(`## ${a.guides}`, '', ...agentGuides().map((g) => `- [${g.title}](${DOCS}ai-guides/${g.path})`), '')
    llms.set(locale, lines.join('\n').trim() + '\n')
  }

  const publicMd = (p: Page): string => {
    if (p.rel === 'index.md' || p.rel === 'en/index.md') return llms.get(p.locale)!
    let body = stripComments(applyEditionGates(p.body))
    body = mapOutsideFences(body, (t) =>
      rewriteLinks(plainComponents(t, p.locale), p, (pub) => (/^[a-z]+:/.test(pub) ? pub : DOCS + pub), (alt, url) => {
        const resolved = resolveLink(url, p)
        return `![${alt}](${resolved === undefined ? url : DOCS + resolved})`
      })
    )
    const fields = {
      title: titleOf(p),
      description: p.fm.description,
      type: p.fm.type,
      audience: p.fm.audience,
      since: p.fm.since,
      platforms: p.fm.platforms,
      prerequisites: p.fm.prerequisites,
      related: p.fm.related,
      lang: p.locale === 'en' ? 'en' : 'zh-CN',
      canonical: LINK_ORIGIN ? DOCS + htmlPath(p.rel) : undefined,
      last_updated: dates.get(p.rel),
      source: `Halo ${facts.version} docs`,
    }
    return yamlFrontmatter(fields) + withLead(body, p.fm)
  }

  let twins = 0
  const full = new Map<string, string>()
  for (const p of pages) {
    const md = publicMd(p)
    fs.mkdirSync(path.dirname(path.join(outDir, p.rel)), { recursive: true })
    fs.writeFileSync(path.join(outDir, p.rel), md)
    twins++
    // llms-full stays factual: no home summary, no keyword landing pages.
    if (p.rel !== 'index.md' && p.rel !== 'en/index.md' && !isLanding(p)) {
      full.set(p.rel, `Source: ${(LINK_ORIGIN ? DOCS : '/docs/') + htmlPath(p.rel)}\n\n${md}`)
    }
  }

  for (const locale of ['zh', 'en'] as Locale[]) {
    const dir = locale === 'en' ? path.join(outDir, 'en') : outDir
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'llms.txt'), llms.get(locale)!)
    const { sections, legacy, rest } = ordered(locale)
    const order = [...sections.flatMap((s) => s.groups.flatMap((g) => g.pages)), ...legacy, ...rest]
    const chunks = order.map((p) => full.get(p.rel)).filter((c): c is string => !!c)
    fs.writeFileSync(
      path.join(dir, 'llms-full.txt'),
      `# ${ABOUT[locale].title}\n\n> ${facts.definition[locale]}\n\n` + chunks.join('\n\n---\n\n')
    )
  }

  // Agent mirror: same text, links rewritten to mirror paths so read_halo_doc can follow them.
  // Old pages awaiting their successor describe 2.x; Halo's agent is better served by its own guides.
  const legacy = new Set([...legacyPages('zh'), ...legacyPages('en')].map((l) => l.file))
  const inMirror = (p: Page) =>
    p.rel !== 'index.md' && p.rel !== 'en/index.md' && !isLanding(p) && !isGeneratedApi(p) && !legacy.has(p.rel)
  const mirrorPath = (rel: string) => `docs/${localeOf(rel)}/${localPath(rel)}`
  const mirrorSet = new Set(pages.filter(inMirror).map((p) => p.rel))
  let mirror = 0
  const index: Record<Locale, string[]> = { zh: [], en: [] }
  for (const p of pages.filter(inMirror)) {
    let body = stripComments(applyEditionGates(p.body))
    body = mapOutsideFences(body, (t) =>
      rewriteLinks(
        plainComponents(t, p.locale),
        p,
        (pub) => {
          const [pathPart, hash] = pub.split('#')
          const source = pathPart === '' || pathPart.endsWith('/') ? `${pathPart}index.md` : pathPart.replace(/\.html$/, '.md')
          if (mirrorSet.has(source)) return mirrorPath(source) + (hash ? `#${hash}` : '')
          return (LINK_ORIGIN ? DOCS : '/docs/') + pub
        },
        (alt) => (p.locale === 'zh' ? `[截图：${alt}]` : `[Screenshot: ${alt}]`)
      )
    )
    const text = yamlFrontmatter({
      title: titleOf(p),
      description: p.fm.description,
      type: p.fm.type,
      since: p.fm.since,
      platforms: p.fm.platforms,
      prerequisites: p.fm.prerequisites,
      related: p.fm.related,
    }) + withLead(body, p.fm)
    const out = path.join(outDir, MIRROR_DIR, p.locale, p.local)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, text)
    index[p.locale].push(`- \`${mirrorPath(p.rel)}\` — ${titleOf(p)}${p.fm.description ? `：${String(p.fm.description).trim()}` : ''}`)
    mirror++
  }
  const indexText = [
    '# Halo docs mirror — index',
    '',
    'The published Halo documentation, readable with `read_halo_doc`. Paths below are relative to the guide root.',
    'Read `docs/zh/…` when the user\'s Halo interface is in Chinese, `docs/en/…` otherwise. These pages hold what users see and do: exact UI labels, steps, and what to ask Halo. When a guide and a docs page disagree on a label or step, the docs page is newer.',
    'This mirror exists only on the documentation host, not in the offline snapshot. The HTTP API reference is not mirrored: use `halo_api_ref`.',
    '',
    '## 中文页面 (docs/zh)',
    '',
    ...index.zh,
    '',
    '## English pages (docs/en)',
    '',
    ...index.en,
    '',
  ].join('\n')
  fs.mkdirSync(path.join(outDir, MIRROR_DIR), { recursive: true })
  fs.writeFileSync(path.join(outDir, MIRROR_DIR, 'index.md'), indexText)
  return { twins, mirror }
}
