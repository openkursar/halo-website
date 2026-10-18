import fs from 'node:fs'
import path from 'node:path'
import { defineLoader } from 'vitepress'
import { isInternal, srcDir } from '../config/edition'
import { builtSources, ia, sourceFile, type Locale } from '../config/ia'

interface NewsItem {
  title: string
  text: string
}

export interface HomeData {
  edition: 'public' | 'internal'
  /** IA slug → page name, for pages this edition actually builds. */
  pages: Record<Locale, Record<string, string>>
  /** Pages of the "Use cases & comparisons" sidebar group that exist. */
  useCases: Record<Locale, string[]>
  whatsNew: { version: string; anchor: string; items: Record<Locale, NewsItem[]> } | null
}

declare const data: HomeData
export { data }

const USE_CASE_GROUP = 'Use cases & comparisons'

function splitItem(item: string, locale: Locale): NewsItem {
  const sep = locale === 'zh' ? '：' : ': '
  const at = item.indexOf(sep)
  return at > 0 && at < 40 ? { title: item.slice(0, at), text: item.slice(at + sep.length) } : { title: '', text: item }
}

// The docs home links only to pages that exist in this build, so it can ship
// while the rest of the site is still being written.
export default defineLoader({
  load(): HomeData {
    const built = builtSources()
    const pages: HomeData['pages'] = { zh: {}, en: {} }
    const useCases: HomeData['useCases'] = { zh: [], en: [] }
    for (const locale of ['zh', 'en'] as Locale[]) {
      for (const section of ia.sections) {
        for (const group of section.groups) {
          for (const item of group.items) {
            if (!item.locales.includes(locale) || !built.has(sourceFile(item.slug, locale))) continue
            pages[locale][item.slug] = item[locale]
            if (group.en === USE_CASE_GROUP) useCases[locale].push(item.slug)
          }
        }
      }
    }
    let whatsNew: HomeData['whatsNew'] = null
    const changelog = path.join(srcDir, '.vitepress', 'data', 'changelog.json')
    if (fs.existsSync(changelog)) {
      const latest = JSON.parse(fs.readFileSync(changelog, 'utf-8')).releases?.[0]
      if (latest) {
        whatsNew = {
          version: latest.version,
          anchor: latest.anchor,
          items: {
            zh: latest.items.zh.slice(0, 4).map((i: string) => splitItem(i, 'zh')),
            en: latest.items.en.slice(0, 4).map((i: string) => splitItem(i, 'en')),
          },
        }
      }
    }
    return { edition: isInternal ? 'internal' : 'public', pages, useCases, whatsNew }
  },
})
