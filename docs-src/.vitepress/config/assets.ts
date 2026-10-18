import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { srcDir } from './edition'

const PREFIX = '\0halo-missing-image:'
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200"><rect width="100%" height="100%" fill="#f1f5f9"/>' +
      '<text x="50%" y="50%" fill="#64748b" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">' +
      'Screenshot pending / 截图待补</text></svg>'
  )

const missing = new Set<string>()

/**
 * Outside strict mode, a page may reference a screenshot that is still being
 * captured: it renders a visible placeholder instead of failing everyone's
 * build. Strict mode (CI) does not load this plugin, so nothing ships without
 * its real image.
 */
export function missingImagePlaceholders(): Plugin {
  return {
    name: 'halo-missing-image-placeholders',
    enforce: 'pre',
    resolveId(id) {
      if (!/^\/images\/.+\.(png|jpe?g|webp|gif|svg|avif)$/i.test(id)) return null
      if (fs.existsSync(path.join(srcDir, 'public', id))) return null
      missing.add(id)
      return PREFIX + id
    },
    load(id) {
      return id.startsWith(PREFIX) ? `export default ${JSON.stringify(PLACEHOLDER)}` : null
    },
  }
}

export function reportMissingImages(): void {
  if (missing.size === 0) return
  console.warn(
    `\n[assets] WARNING: ${missing.size} referenced image(s) do not exist yet and render as placeholders ` +
      `(strict mode fails on them):\n` +
      [...missing].sort().map((m) => `  - ${m}`).join('\n') +
      '\n'
  )
}
