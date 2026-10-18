import fs from 'node:fs'
import path from 'node:path'
import { srcDir, sourcePages, publicOnlyPages, isInternal } from './edition'

export type Locale = 'zh' | 'en'

export interface IaItem {
  slug: string
  zh: string
  en: string
  type: string
  priority: string
  locales: Locale[]
  edition: 'all' | 'public'
}

export interface IaGroup {
  zh: string
  en: string
  items: IaItem[]
}

export interface IaSection {
  id: string
  zh: string
  en: string
  link: string
  prefixes: string[]
  groups: IaGroup[]
}

const dataDir = path.join(srcDir, '.vitepress', 'data')

export const ia: { sections: IaSection[] } = JSON.parse(fs.readFileSync(path.join(dataDir, 'ia.json'), 'utf-8'))

export const urlMap: {
  entries: { from: string; to: string; status: 'kept' | 'redirect'; note: string }[]
  requiredAnchors: { page: string; anchor: string }[]
} = JSON.parse(fs.readFileSync(path.join(dataDir, 'url-map.json'), 'utf-8'))

export const facts = JSON.parse(fs.readFileSync(path.join(dataDir, 'facts.json'), 'utf-8'))

/** Source file of an IA slug in a locale: `features/spaces` → `en/features/spaces.md`. */
export function sourceFile(slug: string, locale: Locale): string {
  const prefix = locale === 'en' ? 'en/' : ''
  return prefix + (slug === '' || slug.endsWith('/') ? `${slug}index.md` : `${slug}.md`)
}

/** Site path used in nav/sidebar links (base-less, extensionless). */
export function sitePath(slug: string, locale: Locale): string {
  return (locale === 'en' ? '/en/' : '/') + slug
}

let built: Set<string> | undefined

/** Source pages that are part of this edition's build (relative paths). */
export function builtSources(): Set<string> {
  if (built) return built
  const excluded = new Set(isInternal ? publicOnlyPages() : [])
  built = new Set(sourcePages().map((p) => p.file).filter((f) => !excluded.has(f)))
  return built
}

/** IA pages that are written and part of this edition. */
export function exists(slug: string, locale: Locale): boolean {
  return builtSources().has(sourceFile(slug, locale))
}

/** Pages promised by the IA but not written yet (dead links to them are tolerated outside strict mode). */
export function isPlannedPath(link: string): boolean {
  if (!link.startsWith('/')) return false
  const clean = link.replace(/[#?].*$/, '').replace(/\.(html|md)$/, '').replace(/^\//, '').replace(/(^|\/)index$/, '$1')
  const locale: Locale = clean.startsWith('en/') || clean === 'en' ? 'en' : 'zh'
  const slug = locale === 'en' ? clean.replace(/^en\/?/, '') : clean
  return ia.sections.some((s) =>
    s.groups.some((g) => g.items.some((i) => (i.slug === slug || i.slug === slug + '/') && i.locales.includes(locale)))
  )
}

/** Old pages a successor has not replaced yet: url-map redirect sources whose file still exists. */
export function legacyPages(locale: Locale): { file: string; title: string; link: string }[] {
  const built = builtSources()
  const out: { file: string; title: string; link: string }[] = []
  for (const e of urlMap.entries) {
    if (e.status !== 'redirect') continue
    const rel = e.from.replace('https://hello-halo.cc/docs/', '')
    if (rel.startsWith('en/') !== (locale === 'en')) continue
    const file = rel.endsWith('/') ? `${rel}index.md` : rel.replace(/\.html$/, '.md')
    if (!built.has(file)) continue
    const fm = sourcePages().find((p) => p.file === file)?.frontmatter ?? {}
    const title = String(fm.title ?? file.replace(/\.md$/, '').split('/').pop())
      .replace(/\s*\|\s*Halo\s*$/, '')
    out.push({ file, title, link: '/' + file.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '') })
  }
  return out
}

/** The section a page belongs to, by IA membership first and path prefix second. */
export function sectionOf(relativePath: string): IaSection | undefined {
  const locale: Locale = relativePath.startsWith('en/') ? 'en' : 'zh'
  const rel = locale === 'en' ? relativePath.slice(3) : relativePath
  const slug = rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  const bySlug = ia.sections.find((s) => s.groups.some((g) => g.items.some((i) => i.slug === slug)))
  if (bySlug) return bySlug
  return [...ia.sections]
    .map((s) => ({ s, p: s.prefixes.filter((p) => rel.startsWith(p)).sort((a, b) => b.length - a.length)[0] }))
    .filter((x) => x.p)
    .sort((a, b) => b.p!.length - a.p!.length)[0]?.s
}

/** IA page name of a slug (H1 / sidebar label), if the slug is in the IA. */
export function iaItem(relativePath: string): IaItem | undefined {
  const locale: Locale = relativePath.startsWith('en/') ? 'en' : 'zh'
  const rel = locale === 'en' ? relativePath.slice(3) : relativePath
  const slug = rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  for (const s of ia.sections) for (const g of s.groups) for (const i of g.items) if (i.slug === slug) return i
  return undefined
}

/**
 * Links to old URLs that now resolve through a redirect stub. Tolerated outside
 * strict mode while old pages still link each other; strict mode fails them,
 * because internal links must point at the final URL.
 */
export function isRedirectedLink(link: string): boolean {
  const clean = link.replace(/[#?].*$/, '').replace(/\.(html|md)$/, '').replace(/(^|\/)index$/, '$1')
  const sources = urlMap.entries
    .filter((e) => e.status === 'redirect')
    .map((e) => e.from.replace('https://hello-halo.cc/docs/', '').replace(/\.html$/, ''))
  if (clean.startsWith('/')) return sources.includes(clean.replace(/^\/(docs\/)?/, ''))
  // Relative link (old pages use them): match on the trailing path segments.
  const tail = clean.replace(/^(\.\.?\/)+/, '')
  return tail !== '' && sources.some((s) => s === tail || s.endsWith('/' + tail))
}
