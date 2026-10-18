import fs from 'node:fs'
import path from 'node:path'
import type { HeadConfig, TransformContext } from 'vitepress'
import { isInternal, srcDir, stripComments } from './edition'
import { builtSources, facts, iaItem, sectionOf } from './ia'

export const ORIGIN = 'https://hello-halo.cc'
const BASE = '/docs/'

const ANALYTICS: HeadConfig[] = [
  // Baidu Analytics
  ['script', {}, `var _hmt = _hmt || [];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?ba1b0224eb934176ead125ffccc8861b";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s)})();`],
  // Google Analytics (GA4)
  ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-6V61P0940T' }],
  ['script', {}, `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-6V61P0940T');`],
]

export const staticHead: HeadConfig[] = [
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/logo.svg' }],
  ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ['meta', { name: 'robots', content: isInternal ? 'noindex' : 'index, follow' }],
  ['meta', { property: 'og:site_name', content: 'Halo' }],
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  // The intranet edition must not report intranet URLs and titles to public analytics.
  ...(isInternal ? [] : ANALYTICS),
]

const isEnglish = (rel: string) => rel === 'en/index.md' || rel.startsWith('en/')

/** Published path of a source page relative to /docs/: `features/spaces.html`, `getting-started/`. */
export function htmlPath(rel: string): string {
  return rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
}

/** The other locale's source path for a page, whether or not it exists. */
export function twinOf(rel: string): string {
  return isEnglish(rel) ? rel.slice(3) : `en/${rel}`
}

/** zh/en pairs by identical path: one function feeds both the HTML head and the sitemap. */
export function pairOf(rel: string, pages: Set<string>): { zh: string; en: string } | undefined {
  const twin = twinOf(rel)
  if (!pages.has(rel) || !pages.has(twin)) return undefined
  return isEnglish(rel) ? { zh: twin, en: rel } : { zh: rel, en: twin }
}

function hreflangLinks(pair: { zh: string; en: string }): HeadConfig[] {
  const zh = ORIGIN + BASE + htmlPath(pair.zh)
  const en = ORIGIN + BASE + htmlPath(pair.en)
  return [
    ['link', { rel: 'alternate', hreflang: 'zh', href: zh }],
    ['link', { rel: 'alternate', hreflang: 'en', href: en }],
    ['link', { rel: 'alternate', hreflang: 'x-default', href: en }],
  ]
}

const SECTION_CARDS = path.join(srcDir, 'public', 'og')

function socialImage(rel: string, frontmatter: Record<string, any>): string | undefined {
  if (typeof frontmatter.image === 'string') return ORIGIN + (frontmatter.image.startsWith('/docs/') ? '' : '/docs') + frontmatter.image
  const locale = isEnglish(rel) ? 'en' : 'zh'
  // Pages outside every section (old pages awaiting their successor) use the home card.
  const section = rel === 'index.md' || rel === 'en/index.md' ? 'home' : sectionOf(rel)?.id ?? 'home'
  const file = `${section}-${locale}.png`
  return fs.existsSync(path.join(SECTION_CARDS, file)) ? `${ORIGIN}/docs/og/${file}` : undefined
}

const HOME_NAME = { zh: 'Halo 文档', en: 'Halo Docs' }
const SOFTWARE_PAGES = new Set(['guide/what-is-halo.md', 'getting-started/install.md'])

function jsonLd(obj: object): HeadConfig {
  return ['script', { type: 'application/ld+json' }, JSON.stringify(obj)]
}

const FAQ_PAGES = new Set(['troubleshooting/faq.md'])

/** Markdown answer → plain text for structured data. */
function plainText(md: string): string {
  return md
    .replace(/^(```|~~~).*$/gm, '')
    .replace(/^:::.*$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<Badge\b[^>]*?\btext="([^"]*)"[^>]*\/?>/g, '($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * FAQPage from a visible FAQ (SEO.md §3.7): every `###` question of the FAQ page,
 * or the `###` questions inside a `## … {#faq}` section, each with the text below it.
 */
function faqEntries(rel: string): { q: string; a: string }[] {
  const whole = FAQ_PAGES.has(rel.replace(/^en\//, ''))
  const file = path.join(srcDir, rel)
  if (!fs.existsSync(file)) return []
  const body = stripComments(fs.readFileSync(file, 'utf-8').replace(/^---\n[\s\S]*?\n---\n/, ''))
  const entries: { q: string; a: string[] }[] = []
  let inFaq = whole
  let inFence = false
  let current: { q: string; a: string[] } | null = null
  for (const line of body.split('\n')) {
    if (/^(```|~~~)/.test(line)) inFence = !inFence
    const h2 = !inFence && line.match(/^##\s+(.+)$/)
    const h3 = !inFence && line.match(/^###\s+(.+)$/)
    if (h2) {
      current = null
      inFaq = whole || /\{#faq\}\s*$/.test(h2[1])
    } else if (h3) {
      current = null
      if (inFaq) {
        current = { q: plainText(h3[1].replace(/\s*\{#[\w-]+\}\s*$/, '')), a: [] }
        entries.push(current)
      }
    } else if (/^#{4,}\s/.test(line) && !inFence) {
      if (current) current.a.push(line.replace(/^#+\s+/, ''))
    } else if (current) {
      current.a.push(line)
    }
  }
  return entries.map((e) => ({ q: e.q, a: plainText(e.a.join('\n')) })).filter((e) => e.q && e.a)
}

function structuredData(rel: string, title: string, description: string, frontmatter: Record<string, any>, lastUpdated: number | undefined, image: string | undefined, pages: Set<string>): HeadConfig[] {
  const isHome = rel === 'index.md' || rel === 'en/index.md'
  const type = frontmatter.type
  if (isHome || type === 'hub' || frontmatter.layout === 'home' || rel === '404.md') return []
  const locale = isEnglish(rel) ? 'en' : 'zh'
  const url = ORIGIN + BASE + htmlPath(rel)
  const out: HeadConfig[] = [
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      description,
      inLanguage: locale === 'en' ? 'en' : 'zh-CN',
      url,
      mainEntityOfPage: url,
      ...(lastUpdated ? { dateModified: new Date(lastUpdated).toISOString() } : {}),
      ...(image ? { image } : {}),
      author: { '@type': 'Organization', name: 'Halo', url: ORIGIN + '/' },
      publisher: {
        '@type': 'Organization',
        name: 'Halo',
        url: ORIGIN + '/',
        logo: { '@type': 'ImageObject', url: ORIGIN + '/assets/icon.png' },
      },
      about: { '@id': ORIGIN + '/#software' },
    }),
  ]
  // Breadcrumb names are sidebar labels; a level whose hub page does not exist yet is skipped.
  const crumbs: { name: string; item: string }[] = [{ name: HOME_NAME[locale], item: ORIGIN + BASE + (locale === 'en' ? 'en/' : '') }]
  const section = sectionOf(rel)
  if (section) {
    const hubRel = (locale === 'en' ? 'en/' : '') + (section.link.endsWith('/') ? `${section.link}index.md` : `${section.link}.md`)
    if (pages.has(hubRel) && hubRel !== rel) crumbs.push({ name: section[locale], item: ORIGIN + BASE + htmlPath(hubRel) })
  }
  crumbs.push({ name: iaItem(rel)?.[locale] ?? title, item: url })
  out.push(
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })),
    })
  )
  const faq = faqEntries(rel)
  if (faq.length > 0) {
    out.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: locale === 'en' ? 'en' : 'zh-CN',
        mainEntity: faq.map((e) => ({ '@type': 'Question', name: e.q, acceptedAnswer: { '@type': 'Answer', text: e.a } })),
      })
    )
  }
  if (SOFTWARE_PAGES.has(locale === 'en' ? rel.slice(3) : rel)) {
    out.push(
      jsonLd({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': ORIGIN + '/#software',
        name: 'Halo',
        alternateName: facts.alternateName,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: facts.platforms.schema,
        softwareVersion: facts.version,
        license: 'https://opensource.org/licenses/MIT',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        url: facts.site,
        downloadUrl: facts.download,
        sameAs: [facts.repo],
      })
    )
  }
  return out
}

/** Per-page head tags (SEO.md §3.5–3.8). The intranet edition gets none that point at the public host. */
export function transformHead(ctx: TransformContext): HeadConfig[] {
  const { pageData, siteConfig } = ctx
  const rel = pageData.relativePath
  const frontmatter = pageData.frontmatter ?? {}
  const title = String(frontmatter.title ?? pageData.title ?? 'Halo')
  const description = String(frontmatter.description ?? pageData.description ?? '')
  const locale = isEnglish(rel) ? 'en' : 'zh'
  const pages = new Set(siteConfig.pages)
  const head: HeadConfig[] = []

  if (rel === '404.md' || pageData.isNotFound) {
    head.push(['meta', { name: 'robots', content: 'noindex' }])
    return head
  }

  head.push(['meta', { property: 'og:title', content: title }])
  if (description) {
    head.push(['meta', { property: 'og:description', content: description }])
    head.push(['meta', { name: 'twitter:description', content: description }])
  }
  head.push(['meta', { name: 'twitter:title', content: title }])
  head.push(['meta', { property: 'og:type', content: rel === 'index.md' || rel === 'en/index.md' ? 'website' : 'article' }])
  head.push(['meta', { property: 'og:locale', content: locale === 'en' ? 'en_US' : 'zh_CN' }])
  // Agent guides still rendered from public/ have their raw text at /docs/ai-guides/.
  head.push(['link', { rel: 'alternate', type: 'text/markdown', href: BASE + rel.replace(/^public\//, '') }])
  // Lets checks tell hubs and landing pages from articles without reading the source.
  if (typeof frontmatter.type === 'string') head.push(['meta', { name: 'halo-docs-type', content: frontmatter.type }])

  if (isInternal) return head

  if (rel === 'guide/changelog.md' || rel === 'en/guide/changelog.md') {
    const feed = locale === 'en' ? { href: `${BASE}en/feed.xml`, title: 'Halo changelog' } : { href: `${BASE}feed.xml`, title: 'Halo 更新日志' }
    head.push(['link', { rel: 'alternate', type: 'application/rss+xml', title: feed.title, href: feed.href }])
  }

  const canonical = ORIGIN + BASE + htmlPath(rel)
  head.push(['link', { rel: 'canonical', href: canonical }])
  head.push(['meta', { property: 'og:url', content: canonical }])
  const pair = pairOf(rel, pages)
  if (pair) {
    head.push(...hreflangLinks(pair))
    head.push(['meta', { property: 'og:locale:alternate', content: locale === 'en' ? 'zh_CN' : 'en_US' }])
  }
  const image = socialImage(rel, frontmatter)
  if (image) {
    head.push(['meta', { property: 'og:image', content: image }])
    head.push(['meta', { property: 'og:image:alt', content: title }])
    head.push(['meta', { name: 'twitter:image', content: image }])
  }
  head.push(...structuredData(rel, title, description, frontmatter, pageData.lastUpdated, image, pages))
  return head
}

/** Sitemap hreflang from the same pairing as the head: codes zh / en / x-default → en. */
export function sitemapTransform(items: { url: string; links?: { url: string; lang: string }[] }[]) {
  const pages = builtSources()
  return items.map((item) => {
    const rel = item.url === '' ? 'index.md' : item.url.endsWith('/') ? `${item.url}index.md` : item.url.replace(/\.html$/, '.md')
    const pair = pairOf(rel, pages)
    if (!pair) return { ...item, links: undefined }
    const zh = ORIGIN + BASE + htmlPath(pair.zh)
    const en = ORIGIN + BASE + htmlPath(pair.en)
    return { ...item, links: [{ lang: 'zh', url: zh }, { lang: 'en', url: en }, { lang: 'x-default', url: en }] }
  })
}
