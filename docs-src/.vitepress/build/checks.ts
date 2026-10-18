import fs from 'node:fs'
import path from 'node:path'
import type { SiteConfig } from 'vitepress'
import { isInternal, publicOnlyPages, srcDir, sourcePages } from '../config/edition'
import { ia, legacyPages, urlMap } from '../config/ia'
import { stubFile } from './redirects'
import type { Report } from './report'

const DOCS = 'https://hello-halo.cc/docs/'
const TYPES = new Set(['tutorial', 'how-to', 'reference', 'explanation', 'hub', 'landing'])
// `all` stands alone for pages written for every reader (docs home, glossary, error lookup).
const AUDIENCES = new Set(['beginner', 'office', 'developer', 'admin', 'all'])
const MIRROR_PATH = /^[A-Za-z0-9][A-Za-z0-9._\-/]*\.md$/
const MAX_DOC_BYTES = 512 * 1024

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, out)
    else out.push(abs)
  }
  return out
}

/** Terms that must never be published. Never stored in the repo: CI passes them through a secret. */
function denylist(): string[] {
  const terms: string[] = []
  const env = process.env.SEO_CHECK_DENYLIST_TERMS
  if (env) terms.push(...env.split(/[,\n]/))
  const file = process.env.SEO_CHECK_DENYLIST ?? path.resolve(srcDir, '..', '.docs-work', 'spec', 'leak-denylist.txt')
  if (fs.existsSync(file)) terms.push(...fs.readFileSync(file, 'utf-8').split('\n').filter((l) => !l.trim().startsWith('#')))
  return [...new Set(terms.map((t) => t.trim().toLowerCase()).filter((t) => t.length >= 3))]
}

function checkFrontmatter(siteConfig: SiteConfig, report: Report) {
  const legacy = new Set([...legacyPages('zh'), ...legacyPages('en')].map((l) => l.file))
  for (const page of sourcePages()) {
    if (!siteConfig.pages.includes(page.file) || legacy.has(page.file)) continue
    const fm = page.frontmatter
    for (const field of ['title', 'description', 'type', 'audience']) {
      if (fm[field] === undefined || fm[field] === '') report.add('frontmatter.missing', page.file, field)
    }
    if (fm.type !== undefined && !TYPES.has(fm.type)) report.add('frontmatter.type', page.file, String(fm.type))
    const aud = Array.isArray(fm.audience) ? fm.audience : fm.audience ? [fm.audience] : []
    for (const a of aud) if (!AUDIENCES.has(a)) report.add('frontmatter.audience', page.file, String(a))
    if (typeof fm.title === 'string' && /\|\s*Halo/.test(fm.title)) report.add('frontmatter.title-brand', page.file, fm.title)
  }
}

function checkParity(siteConfig: SiteConfig, report: Report) {
  const built = new Set(siteConfig.pages)
  for (const s of ia.sections) {
    for (const g of s.groups) {
      for (const item of g.items) {
        if (!item.locales.includes('en')) continue
        if (isInternal && item.edition === 'public') continue
        const file = item.slug.endsWith('/') ? `${item.slug}index.md` : `${item.slug}.md`
        const zh = built.has(file)
        const en = built.has(`en/${file}`)
        if (zh !== en) report.add('parity.missing-twin', zh ? file : `en/${file}`, `no ${zh ? 'en' : 'zh'} twin`)
        if (zh && en) {
          const ids = (rel: string) => [...fs.readFileSync(path.join(srcDir, rel), 'utf-8').matchAll(/\{#([\w-]+)\}/g)].map((m) => m[1]).sort().join(',')
          if (ids(file) !== ids(`en/${file}`)) report.add('parity.heading-ids', file, 'explicit {#id} lists differ between zh and en')
        }
      }
    }
  }
}

function checkAnchors(siteConfig: SiteConfig, report: Report) {
  for (const { page, anchor } of urlMap.requiredAnchors) {
    const rel = page.slice(DOCS.length)
    for (const prefix of ['', 'en/']) {
      const html = path.join(siteConfig.outDir, prefix + rel)
      if (!fs.existsSync(html)) continue
      if (!fs.readFileSync(html, 'utf-8').includes(`id="${anchor}"`)) report.add('anchor.missing', prefix + rel, `#${anchor} (a redirect points here)`)
    }
  }
}

function checkLinksToStubs(siteConfig: SiteConfig, stubs: string[], report: Report) {
  if (stubs.length === 0) return
  const stubHrefs = new Set(stubs.map((s) => '/docs/' + s.replace(/index\.html$/, '')))
  for (const file of walk(siteConfig.outDir)) {
    if (!file.endsWith('.html')) continue
    const rel = path.relative(siteConfig.outDir, file).split(path.sep).join('/')
    if (stubs.some((s) => stubFile(s) === rel)) continue
    for (const m of fs.readFileSync(file, 'utf-8').matchAll(/href="(\/docs\/[^"#?]*)/g)) {
      if (stubHrefs.has(m[1])) report.add('link.to-stub', rel, m[1])
    }
  }
}

function checkLeaks(siteConfig: SiteConfig, report: Report) {
  const terms = denylist()
  const markers = /<!--\s*(internal:[\w-]+|public:(start|end))\s*-->/
  for (const file of walk(siteConfig.outDir)) {
    if (!/\.(html|js|md|txt|xml|json)$/.test(file)) continue
    const rel = path.relative(siteConfig.outDir, file).split(path.sep).join('/')
    // The agent guides are copied verbatim from public/ and checked at the source.
    if (rel.startsWith('ai-guides/') && !rel.startsWith('ai-guides/docs/')) continue
    const text = fs.readFileSync(file, 'utf-8')
    if (markers.test(text)) report.add('leak.marker', rel, 'edition marker in published output')
    if (/\.(md|txt)$/.test(rel) && text.includes('<!--')) report.add('leak.comment', rel, 'HTML comment in an AI-readable file')
    const lower = text.toLowerCase()
    terms.forEach((term, i) => {
      if (lower.includes(term)) report.add('leak.denylist', rel, `denylist term #${i + 1}`)
    })
  }
  if (isInternal) {
    for (const page of publicOnlyPages()) {
      const html = path.join(siteConfig.outDir, page.replace(/(^|\/)index\.md$/, '$1index.html').replace(/\.md$/, '.html'))
      if (fs.existsSync(html)) report.add('edition.public-page-in-internal', page)
    }
  }
}

function checkMirror(siteConfig: SiteConfig, report: Report) {
  const root = path.join(siteConfig.outDir, 'ai-guides')
  for (const file of walk(path.join(root, 'docs'))) {
    const rel = path.relative(root, file).split(path.sep).join('/')
    if (!MIRROR_PATH.test(rel) || rel.length > 200) report.add('mirror.path', rel, 'not readable by read_halo_doc')
    const size = fs.statSync(file).size
    if (size >= MAX_DOC_BYTES) report.add('mirror.size', rel, `${size} bytes`)
  }
}

function checkImages(siteConfig: SiteConfig, report: Report) {
  for (const file of walk(path.join(siteConfig.outDir, 'images'))) {
    const size = fs.statSync(file).size
    if (size > 400 * 1024) report.add('image.too-heavy', path.relative(siteConfig.outDir, file), `${Math.round(size / 1024)} KB > 400 KB`)
  }
}

/** Build checks (BUILD-PLAN §7). Findings are warnings locally and errors in strict mode. */
export function runChecks(siteConfig: SiteConfig, stubs: string[], report: Report): void {
  checkFrontmatter(siteConfig, report)
  checkParity(siteConfig, report)
  checkAnchors(siteConfig, report)
  checkLinksToStubs(siteConfig, stubs, report)
  checkLeaks(siteConfig, report)
  checkMirror(siteConfig, report)
  checkImages(siteConfig, report)
}
