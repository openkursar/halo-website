import fs from 'node:fs'
import path from 'node:path'
import type { SiteConfig } from 'vitepress'
import { isInternal, sourcePages } from '../config/edition'
import { urlMap } from '../config/ia'
import { ORIGIN } from '../config/head'
import type { Report } from './report'

const DOCS = ORIGIN + '/docs/'

function sourceOf(rel: string): string {
  return rel.endsWith('/') || rel === '' ? `${rel}index.md` : rel.replace(/\.html$/, '.md')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function stubHtml(oldRel: string, target: string, title: string): string {
  const english = oldRel.startsWith('en/')
  const href = '/docs/' + target
  const canonical = DOCS + target.replace(/#.*$/, '')
  const jsTarget = JSON.stringify(href).replace(/</g, '\\u003c')
  const text = english ? 'This page has moved to' : '本页已移动到'
  const end = english ? '.' : '。'
  return (
    `<!DOCTYPE html><html lang="${english ? 'en-US' : 'zh-CN'}"><head><meta charset="utf-8">\n` +
    `<title>${escapeHtml(title)} | Halo AI</title>\n` +
    `<meta http-equiv="refresh" content="0; url=${escapeHtml(href)}">\n` +
    (isInternal ? '' : `<link rel="canonical" href="${escapeHtml(canonical)}">\n`) +
    `<script>var t=${jsTarget};if(location.hash&&t.indexOf('#')<0)t+=location.hash;location.replace(t)</script>\n` +
    `</head><body><p>${text} <a href="${escapeHtml(href)}">${escapeHtml(title)}</a>${end}</p></body></html>\n`
  )
}

/** Old URL → stub path in the output folder (folders get index.html). */
export function stubFile(oldRel: string): string {
  return oldRel === '' || oldRel.endsWith('/') ? `${oldRel}index.html` : oldRel
}

/**
 * Writes a stub for every url-map redirect whose old page is no longer built.
 * While the old page is still built it stays live: url-map lands page by page.
 */
export function writeRedirectStubs(siteConfig: SiteConfig, report: Report): string[] {
  const built = new Set(siteConfig.pages)
  const titles = new Map(sourcePages().map((p) => [p.file, String(p.frontmatter.title ?? '').replace(/\s*\|\s*Halo(\s+AI)?\s*$/, '')]))
  const written: string[] = []
  for (const entry of urlMap.entries) {
    if (entry.status !== 'redirect') continue
    const oldRel = entry.from.slice(DOCS.length)
    if (built.has(sourceOf(oldRel))) continue
    const target = entry.to.slice(DOCS.length)
    const targetSource = sourceOf(target.replace(/#.*$/, ''))
    if (!built.has(targetSource)) {
      report.add('stub.target-missing', oldRel, `target ${target} is not built, so this URL would break`)
      continue
    }
    const out = path.join(siteConfig.outDir, stubFile(oldRel))
    if (fs.existsSync(out)) {
      // Something else (a page or a public asset) is already published at this path.
      report.add('stub.collision', oldRel, 'a file already exists at the stub path')
      continue
    }
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, stubHtml(oldRel, target, titles.get(targetSource) || target))
    written.push(oldRel)
  }
  return written
}
