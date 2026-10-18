import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

// HALO_INTERNAL=1 builds the intranet edition: public-only pages and regions
// are left out and `<!-- internal:NAME -->` markers are filled from .internal/.
export const isInternal = process.env.HALO_INTERNAL === '1'

// Strict mode turns build-check warnings into errors. CI (main) always runs it,
// so nothing that would break a URL or leak can be deployed.
export const isStrict = process.env.DOCS_STRICT === '1' || process.env.CI === 'true'

export const srcDir = fileURLToPath(new URL('../../', import.meta.url))

// Kept out of git; only present on the intranet build machine.
const internalDir = path.join(srcDir, '.internal')

export interface SourcePage {
  /** Path relative to srcDir, e.g. `en/features/spaces.md`. */
  file: string
  frontmatter: Record<string, any>
}

const SKIP_DIRS = new Set(['node_modules', '.vitepress', 'public', '.internal', '_data'])

let cache: SourcePage[] | undefined

/** Every markdown source page with its frontmatter (read once per process). */
export function sourcePages(): SourcePage[] {
  if (cache) return cache
  const out: SourcePage[] = []
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && entry.name !== '.') continue
      const abs = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(abs)
      } else if (entry.name.endsWith('.md')) {
        const file = path.relative(srcDir, abs).split(path.sep).join('/')
        let frontmatter: Record<string, any> = {}
        try {
          frontmatter = matter(fs.readFileSync(abs, 'utf-8')).data ?? {}
        } catch {
          // A broken frontmatter block fails later in VitePress with a precise error.
        }
        out.push({ file, frontmatter })
      }
    }
  }
  walk(srcDir)
  cache = out.sort((a, b) => a.file.localeCompare(b.file))
  return cache
}

// Pages that predate the `edition` frontmatter field. Drop an entry once its
// page carries `edition: public`.
const LEGACY_PUBLIC_ONLY = [/^(en\/)?guide\/philosophy\.md$/, /^(en\/)?contact\.md$/, /^(en\/)?seo\//]

/** Pages that exist only in the public build. */
export function publicOnlyPages(): string[] {
  return sourcePages()
    .filter((p) => p.frontmatter.edition === 'public' || LEGACY_PUBLIC_ONLY.some((re) => re.test(p.file)))
    .map((p) => p.file)
}

/**
 * The agent guides in public/ai-guides/ used to be rendered as pages by accident.
 * Each one stops rendering only once the page its redirect points to is written,
 * so its old URL never breaks (the stub replaces it in the same build).
 */
function retiredAgentGuidePages(): string[] {
  const dir = path.join(srcDir, 'public', 'ai-guides')
  if (!fs.existsSync(dir)) return []
  const mapFile = path.join(srcDir, '.vitepress', 'data', 'url-map.json')
  const entries: { from: string; to: string; status: string }[] = JSON.parse(fs.readFileSync(mapFile, 'utf-8')).entries
  const sources = new Set(sourcePages().map((p) => p.file))
  const out: string[] = []
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const abs = path.join(d, e.name)
      if (e.isDirectory()) walk(abs)
      else if (e.name.endsWith('.md')) {
        const file = path.relative(srcDir, abs).split(path.sep).join('/')
        const url = 'https://hello-halo.cc/docs/' + file.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html')
        const target = entries.find((x) => x.from === url && x.status === 'redirect')?.to
        const rel = target?.replace('https://hello-halo.cc/docs/', '').replace(/#.*$/, '')
        const targetFile = rel === undefined ? undefined : rel === '' || rel.endsWith('/') ? `${rel}index.md` : rel.replace(/\.html$/, '.md')
        if (!targetFile || sources.has(targetFile)) out.push(file)
      }
    }
  }
  walk(dir)
  return out
}

export function srcExclude(): string[] {
  return [...retiredAgentGuidePages(), '**/_data/**', '**/README.md', ...(isInternal ? publicOnlyPages() : [])]
}

/** Site paths (`/guide/philosophy`, `/en/contact`) of pages missing from this edition. */
export function excludedLinks(): Set<string> {
  if (!isInternal) return new Set()
  return new Set(publicOnlyPages().map((f) => '/' + f.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')))
}

const missingSnippets = new Set<string>()

/**
 * The single place where edition gates are applied. HTML rendering, the search
 * index and the Markdown/llms outputs all go through it, so they can never
 * disagree about what an edition contains.
 */
export function applyEditionGates(src: string): string {
  if (!isInternal) return src
  return src
    .replace(/<!--\s*public:start\s*-->[\s\S]*?<!--\s*public:end\s*-->/g, '')
    .replace(/<!--\s*internal:([\w-]+)\s*-->/g, (_, name: string) => {
      const file = path.join(internalDir, `${name}.md`)
      if (fs.existsSync(file)) return fs.readFileSync(file, 'utf-8')
      // A missing snippet must never break the build; it is reported once at the end.
      missingSnippets.add(name)
      return ''
    })
}

export function reportMissingSnippets(): void {
  if (!isInternal || missingSnippets.size === 0) return
  const names = [...missingSnippets].sort()
  console.warn(
    `\n[edition] WARNING: ${names.length} internal snippet(s) referenced by pages but missing from .internal/: ` +
      names.map((n) => `${n}.md`).join(', ') +
      '\n[edition] The marked places render empty in this intranet build.\n'
  )
}

/** Remove HTML comments outside fenced code blocks (markers, authoring notes). */
export function stripComments(src: string): string {
  const parts = src.split(/(^(?:```|~~~)[^\n]*\n[\s\S]*?^(?:```|~~~)[ \t]*$)/m)
  return parts.map((part, i) => (i % 2 === 1 ? part : part.replace(/<!--[\s\S]*?-->/g, ''))).join('')
}
