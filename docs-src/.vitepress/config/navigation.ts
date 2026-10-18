import type { DefaultTheme } from 'vitepress'
import { isInternal } from './edition'
import { ia, exists, facts, legacyPages, sectionOf, sitePath, urlMap, type IaSection, type Locale } from './ia'

const LEGACY_GROUP = { zh: '待迁移的旧页面', en: 'Legacy pages (being migrated)' }

// Sections whose later groups start collapsed when they are long.
const COLLAPSE_LONG_GROUPS = new Set(['guides', 'dev'])

function visible(item: { slug: string; locales: Locale[]; edition: string }, locale: Locale): boolean {
  if (!item.locales.includes(locale)) return false
  if (isInternal && item.edition === 'public') return false
  // A page appears once it is written, so the IA can be ahead of the content.
  return exists(item.slug, locale)
}

/** Where an old page's content is going, so it can sit in that section until it is replaced. */
function legacySection(file: string): IaSection | undefined {
  const from = 'https://hello-halo.cc/docs/' + file.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
  const target = urlMap.entries.find((e) => e.from === from)?.to.replace('https://hello-halo.cc/docs/', '').replace(/#.*$/, '')
  if (!target) return sectionOf(file)
  return sectionOf(target.endsWith('/') ? `${target}index.md` : target.replace(/\.html$/, '.md'))
}

function sectionSidebar(section: IaSection, locale: Locale): DefaultTheme.SidebarItem[] {
  const groups: DefaultTheme.SidebarItem[] = []
  section.groups.forEach((group) => {
    const items = group.items
      .filter((item) => visible(item, locale))
      .map((item) => ({ text: item[locale], link: sitePath(item.slug, locale) }))
    if (items.length === 0) return
    const collapsed = COLLAPSE_LONG_GROUPS.has(section.id) && groups.length > 0 && items.length > 6
    groups.push({ text: group[locale], collapsed, items })
  })
  const legacy = legacyPages(locale).filter((page) => legacySection(page.file)?.id === section.id)
  if (legacy.length > 0) {
    groups.push({
      text: LEGACY_GROUP[locale],
      collapsed: true,
      items: legacy.map((page) => ({ text: page.title, link: page.link })),
    })
  }
  return groups
}

/** Multi-sidebar keyed by path prefix (IA §4). Same-depth keys match in insertion order. */
export function sidebar(locale: Locale): DefaultTheme.SidebarMulti {
  const p = locale === 'en' ? '/en/' : '/'
  const byId = new Map(ia.sections.map((s) => [s.id, sectionSidebar(s, locale)]))
  const out: DefaultTheme.SidebarMulti = {}
  // Specific keys first: /guide/changelog belongs to Help, not to Get started.
  for (const s of [...ia.sections].sort((a, b) => (a.id === 'help' ? -1 : b.id === 'help' ? 1 : 0))) {
    for (const prefix of s.prefixes) out[p + prefix] = byId.get(s.id)!
  }
  // Old pages outside every section prefix (e.g. manual/) get the sidebar of their successor's section.
  for (const page of legacyPages(locale)) {
    const s = legacySection(page.file)
    if (s && !Object.keys(out).some((key) => ('/' + page.file).startsWith(key))) out[page.link] = byId.get(s.id)!
  }
  return out
}

const NAV_LABELS = {
  zh: { changelog: '更新日志', download: '下载 Halo' },
  en: { changelog: 'Changelog', download: 'Download Halo' },
}

const ACTIVE_MATCH: Record<string, string> = {
  start: '(getting-started/|guide/(?!changelog))',
  guides: '(features|advanced|use-cases|seo)/',
  dh: 'digital-humans/',
  dev: '(developers|server)/',
  help: '(troubleshooting/|guide/changelog|contact)',
}

/** First page of a section that exists, used until the section hub is written. */
function sectionLink(section: IaSection, locale: Locale): string | undefined {
  const hub = section.groups.flatMap((g) => g.items).find((i) => i.slug === section.link)
  if (hub && visible(hub, locale)) return sitePath(hub.slug, locale)
  const first = section.groups.flatMap((g) => g.items).find((i) => visible(i, locale))
  return first ? sitePath(first.slug, locale) : undefined
}

export function nav(locale: Locale): DefaultTheme.NavItem[] {
  const p = locale === 'en' ? '/en/' : '/'
  const items: DefaultTheme.NavItem[] = []
  for (const s of ia.sections) {
    const link = sectionLink(s, locale)
    if (link) items.push({ text: s[locale], link, activeMatch: `^${p}${ACTIVE_MATCH[s.id]}` })
  }
  const version: DefaultTheme.NavItemWithChildren = {
    text: `v${facts.version}`,
    items: [
      ...(exists('guide/changelog', locale) ? [{ text: NAV_LABELS[locale].changelog, link: `${p}guide/changelog` }] : []),
      ...(isInternal ? [] : [{ text: NAV_LABELS[locale].download, link: facts.landingDownload }]),
    ],
  }
  if (version.items.length > 0) items.push(version)
  return items
}
