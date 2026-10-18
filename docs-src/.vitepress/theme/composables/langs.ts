import { computed } from 'vue'
import { useData } from 'vitepress'

// Replaces VitePress' internal useLangs (aliased in config.mts) with one change:
// when the current page has no translation yet, the language switcher links to
// the other locale's home instead of a 404.
export function useLangs({ correspondingLink = false } = {}) {
  const { site, localeIndex, page, theme, hash } = useData()
  const currentLang = computed(() => ({
    label: site.value.locales[localeIndex.value]?.label,
    link: site.value.locales[localeIndex.value]?.link || (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`),
  }))
  const localeLinks = computed(() =>
    Object.entries(site.value.locales).flatMap(([key, value]) => {
      if (currentLang.value.label === value.label) return []
      const home = value.link || (key === 'root' ? '/' : `/${key}/`)
      const unpaired: string[] = theme.value.haloUnpaired ?? []
      const rel = page.value.relativePath
      const addPath = theme.value.i18nRouting !== false && correspondingLink && !unpaired.includes(rel) && !rel.startsWith('public/')
      const path = page.value.relativePath.slice(currentLang.value.link.length - 1)
      const link = addPath
        ? home.replace(/\/$/, '') + ('/' + path.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, site.value.cleanUrls ? '' : '.html')).replace(/^\/+/, '/')
        : home
      return { text: value.label, link: link + (addPath ? hash.value : '') }
    })
  )
  return { localeLinks, currentLang }
}
