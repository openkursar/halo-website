import fs from 'node:fs'
import path from 'node:path'
import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import { imageSize } from 'image-size'
import { applyEditionGates, excludedLinks, isInternal, srcDir } from './edition'

const isEnglish = (env: any) => typeof env?.relativePath === 'string' && env.relativePath.startsWith('en/')

const CONTAINER_TITLES: Record<string, { zh: string; en: string }> = {
  say: { zh: '直接对 Halo 说', en: 'Just tell Halo' },
  done: { zh: '完成', en: 'Done' },
}

function customContainer(md: MarkdownIt, name: 'say' | 'done') {
  md.use(container, name, {
    render(tokens: any[], idx: number, _options: unknown, env: any) {
      const token = tokens[idx]
      if (token.nesting !== 1) return '</div>\n'
      const custom = token.info.trim().slice(name.length).trim()
      const title = custom || CONTAINER_TITLES[name][isEnglish(env) ? 'en' : 'zh']
      // The first "say" block is the stable target of `#say-it` links and redirects.
      let id = ''
      if (name === 'say' && !env.__haloSayDone) {
        env.__haloSayDone = true
        id = ' id="say-it"'
      }
      return `<div class="custom-block ${name}"${id}><p class="custom-block-title">${md.utils.escapeHtml(title)}</p>\n`
    },
  })
}

// The frontmatter description is the page lead: rendered right under the H1
// (SEO.md §3.3, §4.3) so writers never repeat it in the body.
function pageDescription(md: MarkdownIt) {
  md.core.ruler.after('block', 'halo_page_description', (state: any) => {
    const fm = state.env?.frontmatter ?? {}
    const desc = typeof fm.description === 'string' ? fm.description.trim() : ''
    if (!desc || fm.layout === 'home' || fm.layout === 'page' || fm.type === 'hub' || fm.type === 'landing') return
    const tokens = state.tokens
    const close = tokens.findIndex((t: any) => t.type === 'heading_close' && t.tag === 'h1')
    if (close < 0) return
    const html = new state.Token('html_block', '', 0)
    html.content = `<p class="vp-page-desc">${md.utils.escapeHtml(desc)}</p>\n`
    tokens.splice(close + 1, 0, html)
  })
}

// In the intranet edition, a link to a page that edition leaves out (seo/,
// philosophy, contact) renders as plain text instead of a broken link.
function dropLinksToExcludedPages(md: MarkdownIt) {
  if (!isInternal) return
  const hidden = excludedLinks()
  const isHidden = (href: string) => {
    if (!href.startsWith('/')) return false
    const clean = href.replace(/[#?].*$/, '').replace(/^\/docs\//, '/').replace(/\.(md|html)$/, '').replace(/\/index$/, '/')
    return hidden.has(clean)
  }
  md.core.ruler.after('inline', 'halo_edition_links', (state: any) => {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue
      const stack: boolean[] = []
      block.children = block.children.filter((t: any) => {
        if (t.type === 'link_open') {
          const drop = isHidden(t.attrGet('href') ?? '')
          stack.push(drop)
          return !drop
        }
        if (t.type === 'link_close') return !stack.pop()
        return true
      })
    }
  })
}

const sizes = new Map<string, { width: number; height: number } | null>()

function sizeOf(src: string): { width: number; height: number } | null {
  if (!sizes.has(src)) {
    let size: { width: number; height: number } | null = null
    try {
      const file = path.join(srcDir, 'public', decodeURIComponent(src.replace(/^\/docs\//, '/')))
      const { width, height } = imageSize(fs.readFileSync(file))
      if (width && height) size = { width, height }
    } catch {
      // A missing or unreadable image is reported by the asset checks, not here.
    }
    sizes.set(src, size)
  }
  return sizes.get(src)!
}

// Screenshots get their intrinsic width/height so the page does not shift while
// they load (the theme already scales them with max-width: 100%; height: auto).
function imageDimensions(md: MarkdownIt) {
  md.core.ruler.after('inline', 'halo_image_dimensions', (state: any) => {
    for (const block of state.tokens) {
      if (block.type !== 'inline' || !block.children) continue
      for (const t of block.children) {
        if (t.type !== 'image' || t.attrGet('width')) continue
        const src = t.attrGet('src') ?? ''
        if (!src.startsWith('/') || !/\.(png|jpe?g|webp|gif|avif)$/i.test(src)) continue
        const size = sizeOf(src)
        if (!size) continue
        t.attrSet('width', String(size.width))
        t.attrSet('height', String(size.height))
      }
    }
  })
}

export function configureMarkdown(md: MarkdownIt) {
  md.core.ruler.before('normalize', 'halo_edition_gates', (state: any) => {
    state.src = applyEditionGates(state.src)
  })
  customContainer(md, 'say')
  customContainer(md, 'done')
  pageDescription(md)
  dropLinksToExcludedPages(md)
  imageDimensions(md)
}
