import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { excludedLinks, isInternal, isStrict, reportMissingSnippets, srcExclude } from './config/edition'
import { builtSources, isPlannedPath, isRedirectedLink } from './config/ia'
import { nav, sidebar } from './config/navigation'
import { sitemapTransform, staticHead, transformHead } from './config/head'
import { search } from './config/search'
import { configureMarkdown } from './config/markdown'
import { missingImagePlaceholders, reportMissingImages } from './config/assets'
import { Report } from './build/report'
import { writeRedirectStubs } from './build/redirects'
import { writeAiLayer } from './build/ai-layer'
import { runChecks } from './build/checks'
import { writeFeeds } from './build/feed'

const hidden = excludedLinks()

// Pages without a translation yet: the language switcher sends readers to the
// other locale's home instead of a 404 (see theme/composables/langs.ts).
const built = builtSources()
const unpaired = [...built].filter((f) => !built.has(f.startsWith('en/') ? f.slice(3) : `en/${f}`))

// Nav and sidebar never point at pages this edition leaves out.
function prune<T extends { link?: string; items?: T[] }>(items: T[]): T[] {
  return items
    .filter((i) => !i.link || !hidden.has(i.link))
    .map((i) => (i.items ? { ...i, items: prune(i.items) } : i))
    .filter((i) => !i.items || i.items.length > 0)
}

function pruneSidebar(multi: Record<string, any[]>) {
  return Object.fromEntries(Object.entries(multi).map(([k, v]) => [k, prune(v)]))
}

const localeTheme = {
  zh: {
    outline: { level: [2, 3] as [number, number], label: '本页内容' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新于', formatOptions: { dateStyle: 'short' as const } },
    editLink: isInternal ? undefined : { pattern: 'https://github.com/openkursar/halo-website/edit/main/docs-src/:path', text: '在 GitHub 上编辑此页' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    langMenuLabel: '切换语言',
    notFound: { title: '页面不存在', quote: '这个地址没有内容。可以用上方搜索，或回到文档首页。', linkText: '返回文档首页' },
  },
  en: {
    outline: { level: [2, 3] as [number, number], label: 'On this page' },
    docFooter: { prev: 'Previous', next: 'Next' },
    lastUpdated: { text: 'Last updated', formatOptions: { dateStyle: 'short' as const } },
    editLink: isInternal ? undefined : { pattern: 'https://github.com/openkursar/halo-website/edit/main/docs-src/:path', text: 'Edit this page on GitHub' },
    notFound: { title: 'Page not found', quote: 'Nothing lives at this address. Try the search above, or go back to the docs home.', linkText: 'Back to the docs home' },
  },
}

export default defineConfig({
  base: '/docs/',
  cleanUrls: false,
  title: 'Halo',
  titleTemplate: ':title | Halo AI',
  description: 'Halo AI 工作站文档',
  appearance: 'light',
  lastUpdated: true,

  srcExclude: srcExclude(),

  // Outside strict mode, links to IA pages not written yet and to old URLs that
  // now redirect are tolerated, so pages can be migrated one batch at a time.
  // Strict mode (CI) fails both.
  ignoreDeadLinks: isStrict ? false : [(url: string) => isPlannedPath(url) || isRedirectedLink(url)],

  sitemap: isInternal ? undefined : { hostname: 'https://hello-halo.cc/docs/', transformItems: sitemapTransform },

  markdown: {
    image: { lazyLoading: true },
    config: configureMarkdown,
  },

  head: staticHead,
  transformHead,

  vite: {
    plugins: isStrict ? [] : [missingImagePlaceholders()],
    resolve: {
      alias: [{ find: /^\.\.\/composables\/langs(\.js)?$/, replacement: fileURLToPath(new URL('./theme/composables/langs.ts', import.meta.url)) }],
    },
  },

  locales: {
    root: {
      lang: 'zh-CN',
      label: '简体中文',
      themeConfig: { nav: prune(nav('zh')), sidebar: pruneSidebar(sidebar('zh')), ...localeTheme.zh },
    },
    en: {
      lang: 'en-US',
      label: 'English',
      link: '/en/',
      themeConfig: { nav: prune(nav('en')), sidebar: pruneSidebar(sidebar('en')), ...localeTheme.en },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Halo',
    // Read by theme components that behave differently in the intranet edition.
    haloEdition: isInternal ? 'internal' : 'public',
    haloUnpaired: unpaired,
    socialLinks: isInternal ? [] : [{ icon: 'github', link: 'https://github.com/openkursar/hello-halo' }],
    footer: {
      message: isInternal ? '' : '基于 MIT 协议开源 · Open source under the MIT license',
      copyright: isInternal ? '© 2025 Halo' : '© 2025 Halo · <a href="https://hello-halo.cc" target="_blank">hello-halo.cc</a>',
    },
    search,
  } as any,

  async buildEnd(siteConfig) {
    reportMissingSnippets()
    reportMissingImages()
    const report = new Report()
    const stubs = writeRedirectStubs(siteConfig, report)
    const ai = writeAiLayer(siteConfig)
    if (!isInternal) writeFeeds(siteConfig)
    console.log(`[docs-build] ${stubs.length} redirect stub(s), ${ai.twins} .md twin(s), ${ai.mirror} agent-mirror page(s)`)
    runChecks(siteConfig, stubs, report)
    report.finish()
  },
})
