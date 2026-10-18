import fs from 'node:fs'
import path from 'node:path'
import type { SiteConfig } from 'vitepress'
import { srcDir } from '../config/edition'
import { ORIGIN } from '../config/head'

interface Release {
  version: string
  date: string | null
  anchor: string
  headline: { zh: string; en: string } | null
  items: { zh: string[]; en: string[] }
}

const CHANNEL = {
  zh: { title: 'Halo 更新日志', page: 'guide/changelog.html', description: 'Halo 每个版本的新功能、改进和修复。', language: 'zh-CN' },
  en: { title: 'Halo changelog', page: 'en/guide/changelog.html', description: 'New features, improvements and fixes in each Halo release.', language: 'en' },
}

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** RSS 2.0 feeds of the changelog (public build only), one per locale. */
export function writeFeeds(siteConfig: SiteConfig): number {
  const file = path.join(srcDir, '.vitepress', 'data', 'changelog.json')
  if (!fs.existsSync(file)) return 0
  const releases: Release[] = JSON.parse(fs.readFileSync(file, 'utf-8')).releases
  let written = 0
  for (const locale of ['zh', 'en'] as const) {
    const c = CHANNEL[locale]
    const pageUrl = `${ORIGIN}/docs/${c.page}`
    const items = releases.map((r) => {
      const body = [r.headline?.[locale], ...r.items[locale]].filter(Boolean).join('\n')
      return [
        '<item>',
        `<title>Halo ${r.version}</title>`,
        `<link>${pageUrl}#${r.anchor}</link>`,
        `<guid isPermaLink="true">${pageUrl}#${r.anchor}</guid>`,
        r.date ? `<pubDate>${new Date(`${r.date}T00:00:00Z`).toUTCString()}</pubDate>` : '',
        `<description>${escapeXml(body)}</description>`,
        '</item>',
      ]
        .filter(Boolean)
        .join('')
    })
    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<rss version="2.0"><channel>' +
      `<title>${escapeXml(c.title)}</title><link>${pageUrl}</link>` +
      `<description>${escapeXml(c.description)}</description><language>${c.language}</language>` +
      items.join('') +
      '</channel></rss>\n'
    const out = path.join(siteConfig.outDir, locale === 'en' ? 'en' : '', 'feed.xml')
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, xml)
    written++
  }
  return written
}
