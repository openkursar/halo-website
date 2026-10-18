#!/usr/bin/env node
// Audits a built Halo docs folder (VitePress dist) against the docs SEO/GEO rules: titles,
// descriptions, headings, canonical, hreflang, JSON-LD, social cards, links and anchors, images,
// performance budget, sitemap, redirect stubs, the URL baseline and url-map, the AI layer, and
// leaks of private data. Run `node scripts/seo-check.mjs --help` for options.
//
// Exit code 1 when any ERROR is found. No dependencies; Node 18+.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SITE = 'https://hello-halo.cc'
const BASE = '/docs/'
const MIRROR_ORIGINS = ['https://haloxe.com', 'https://www.haloxe.com', 'https://www.hello-halo.cc', 'http://hello-halo.cc', 'http://haloxe.com']
const BRAND_SUFFIX = '| Halo AI'
const ANALYTICS = ['hm.baidu.com/hm.js?ba1b0224eb934176ead125ffccc8861b', 'googletagmanager.com/gtag/js?id=G-6V61P0940T']
const LOCALE_PREFIX_EN = 'en/'
const HREFLANG_OK = /^(x-default|[a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?)$/i

// Width units: CJK and full-width characters count 2, everything else 1.
// 60 units ~ 30 CJK characters ~ 60 Latin characters ~ what Google/Baidu show.
const LIMITS = {
  titleMin: 20, titleMax: 60, titleHardMax: 70,
  descMin: 70, descMax: 160,
  leadMin: 40, leadMax: 400,
  thinUnits: 250,
  imgWarnBytes: 200 * 1024, imgMaxBytes: 400 * 1024, imgMaxWidth: 2400,
  ogMinWidth: 1200, ogMinHeight: 630,
  pageWeightWarn: 2 * 1024 * 1024,
  dupContainment: 0.5,
  topicContainment: 0.2,
  maxDepth: 3,
}

const RULES = {
  // [level, description]
  'site.404-missing': ['error', '404.html is missing'],
  'site.sitemap-missing': ['error', 'sitemap.xml is missing'],
  'page.work-file': ['error', 'A work/progress file is published as a page'],
  'title.missing': ['error', 'Page has no <title>'],
  'title.brand-duplicated': ['error', 'Title repeats the brand suffix (e.g. "| Halo | Halo")'],
  'title.duplicate': ['error', 'Same title on more than one indexable page'],
  'title.too-long': ['error', `Title wider than ${LIMITS.titleHardMax} units (truncated in results)`],
  'title.long': ['warn', `Title wider than ${LIMITS.titleMax} units`],
  'title.short': ['warn', `Title narrower than ${LIMITS.titleMin} units (too generic)`],
  'title.brand-suffix': ['warn', `Title does not end with "${BRAND_SUFFIX}"`],
  'desc.missing': ['error', 'Page has no meta description'],
  'desc.default': ['error', 'Page uses the site-wide default description'],
  'desc.duplicate': ['error', 'Same description on more than one indexable page'],
  'desc.short': ['warn', `Description narrower than ${LIMITS.descMin} units`],
  'desc.long': ['warn', `Description wider than ${LIMITS.descMax} units (truncated)`],
  'h1.missing': ['error', 'Page has no <h1>'],
  'h1.multiple': ['error', 'Page has more than one <h1>'],
  'heading.skip': ['warn', 'Heading level skipped (e.g. h2 -> h4)'],
  'heading.empty': ['warn', 'Empty heading'],
  'canonical.missing': ['error', 'No rel=canonical'],
  'canonical.multiple': ['error', 'More than one rel=canonical'],
  'canonical.host': ['error', `Canonical is not on ${SITE}${BASE}`],
  'canonical.mismatch': ['error', 'Canonical does not match the page URL'],
  'robots.noindex-in-sitemap': ['error', 'Page is noindex but listed in the sitemap'],
  'robots.noindex': ['info', 'Page is noindex (must be intentional)'],
  'robots.nofollow': ['warn', 'Page has nofollow'],
  'hreflang.missing': ['error', 'zh/en counterpart exists but no hreflang pair is declared (HTML or sitemap)'],
  'hreflang.html-missing': ['warn', 'hreflang pair only in the sitemap, not in the page <head>'],
  'hreflang.incomplete': ['error', 'hreflang set does not list both the page itself and its counterpart'],
  'hreflang.no-x-default': ['warn', 'hreflang set has no x-default'],
  'hreflang.x-default-target': ['warn', 'x-default does not point at the English version'],
  'hreflang.code-policy': ['warn', 'hreflang codes should be exactly zh, en and x-default'],
  'hreflang.invalid-code': ['error', 'Invalid hreflang value'],
  'hreflang.host': ['error', `hreflang URL is not an absolute ${SITE} URL`],
  'hreflang.bad-target': ['error', 'hreflang points to a missing, redirecting or noindex page'],
  'hreflang.not-reciprocal': ['error', 'hreflang target does not point back'],
  'hreflang.lang-mismatch': ['error', 'hreflang language does not match the target page locale'],
  'hreflang.sitemap-html-mismatch': ['warn', 'Sitemap alternates differ from the page <head> alternates'],
  'lang.content-mismatch': ['warn', 'Content language does not match <html lang> / locale'],
  'lang.attr': ['error', '<html lang> missing or wrong for the locale'],
  'jsonld.invalid': ['error', 'JSON-LD block is not valid JSON'],
  'jsonld.context': ['warn', 'JSON-LD @context is not https://schema.org'],
  'jsonld.article-missing': ['error', 'No TechArticle/Article JSON-LD on a doc page'],
  'jsonld.breadcrumb-missing': ['error', 'No BreadcrumbList JSON-LD on a doc page'],
  'jsonld.article-field': ['warn', 'Article JSON-LD is missing a recommended field'],
  'jsonld.article-url': ['error', 'Article JSON-LD url/mainEntityOfPage differs from canonical'],
  'jsonld.date-invalid': ['error', 'JSON-LD date is not ISO 8601'],
  'jsonld.breadcrumb-invalid': ['error', 'BreadcrumbList is malformed (positions, names, URLs)'],
  'jsonld.breadcrumb-bad-item': ['error', 'BreadcrumbList item URL does not resolve to an indexable page'],
  'jsonld.faq-not-visible': ['error', 'FAQPage question is not visible on the page'],
  'jsonld.faq-invalid': ['error', 'FAQPage is malformed'],
  'jsonld.deprecated-type': ['info', 'Structured data type without Google rich results (HowTo)'],
  'og.missing': ['error', 'Missing og:title / og:description / og:url'],
  'og.url-mismatch': ['error', 'og:url differs from canonical'],
  'og.image-missing': ['error', 'No og:image (social and chat link cards)'],
  'og.image-broken': ['error', 'og:image file does not exist'],
  'og.image-small': ['warn', `og:image smaller than ${LIMITS.ogMinWidth}x${LIMITS.ogMinHeight}`],
  'og.image-relative': ['error', 'og:image is not an absolute https URL'],
  'og.type': ['warn', 'og:type should be "article" on doc pages'],
  'og.locale': ['warn', 'No og:locale'],
  'twitter.card': ['warn', 'No twitter:card'],
  'link.broken': ['error', 'Internal link target does not exist'],
  'link.anchor-missing': ['error', 'Link #anchor does not exist on the target page'],
  'link.invalid': ['error', 'Malformed internal link'],
  'link.lang-switch-missing': ['error', 'Language switcher links to a translation that does not exist (404)'],
  'link.to-stub': ['warn', 'Internal link points at a redirect stub (link the final URL)'],
  'link.non-canonical': ['warn', 'Internal link is not in canonical form (.html page / trailing-slash folder)'],
  'link.mirror-host': ['warn', 'Link to haloxe.com or http:// instead of a relative/canonical URL'],
  'link.outside-unchecked': ['info', 'Link outside /docs/ not checked (no --site-root)'],
  'links.orphan': ['warn', 'No other page links here'],
  'links.no-contextual-inbound': ['info', 'Only nav/sidebar links reach this page (no in-content links)'],
  'links.unreachable': ['warn', 'Not reachable by links from the docs home'],
  'links.deep': ['warn', `More than ${LIMITS.maxDepth} clicks from the docs home`],
  'img.alt-missing': ['error', 'Content image without alt attribute'],
  'img.alt-empty': ['warn', 'Content image with empty alt'],
  'img.broken': ['error', 'Image file does not exist'],
  'img.too-heavy': ['error', `Image over ${LIMITS.imgMaxBytes / 1024} KB`],
  'img.heavy': ['warn', `Image over ${LIMITS.imgWarnBytes / 1024} KB`],
  'img.too-wide': ['warn', `Image wider than ${LIMITS.imgMaxWidth}px`],
  'img.placeholder': ['error', 'Image is a placeholder (under 1 KB or at most 16 px), not a real screenshot'],
  'img.no-dimensions': ['warn', 'Content images without width/height (layout shift)'],
  'img.not-lazy': ['info', 'Content images without loading="lazy"'],
  'perf.third-party-css': ['error', 'Render-blocking third-party stylesheet (e.g. Google Fonts)'],
  'perf.third-party-preconnect': ['warn', 'Preconnect to a third-party font host'],
  'perf.blocking-script': ['error', 'External script without async/defer'],
  'perf.page-weight': ['warn', `First-visit weight over ${LIMITS.pageWeightWarn / 1024 / 1024} MB`],
  'analytics.missing': ['error', 'Baidu or GA4 analytics tag missing'],
  'content.thin': ['warn', `Main content under ${LIMITS.thinUnits} text units`],
  'content.near-duplicate': ['warn', 'Main content largely duplicates another page (copied prose)'],
  'content.table-broken': ['error', 'Markdown table row that will not render as a table (glued to a paragraph, or no separator row)'],
  'content.code-span-cjk': ['error', 'Inline code for an HTTP operation runs into Chinese text (a misplaced backtick; the operation is not linked)'],
  'content.title-overlap': ['warn', 'Two pages in one locale target the same primary phrase (cannibalization)'],
  'content.topic-overlap': ['info', 'Pages cover largely the same topic in different words (merge candidates)'],
  'site.robots': ['error', 'robots.txt missing or blocks /docs/'],
  'site.robots-sitemap': ['warn', 'robots.txt does not list the docs sitemap'],
  'site.root-sitemap': ['warn', 'Root sitemap lists a /docs/ URL that is not a canonical docs page'],
  'site.root-llms': ['warn', 'Root llms.txt has a non-canonical/missing docs link or no link to /docs/llms.txt'],
  'site.root-404': ['warn', 'Site root has no 404.html: GitHub Pages shows its generic 404 (no nav, no search, no analytics) for broken /docs/ URLs'],
  'geo.md-alternate-missing': ['error', 'No <link rel="alternate" type="text/markdown"> raw markdown version'],
  'geo.md-alternate-broken': ['error', 'Raw markdown alternate does not exist'],
  'geo.llms-missing': ['error', 'llms.txt missing at the docs root'],
  'geo.llms-full-missing': ['warn', 'llms-full.txt missing at the docs root'],
  'geo.llms-broken-link': ['error', 'llms.txt links to a missing URL'],
  'geo.llms-coverage': ['warn', 'Indexable page not listed in llms.txt'],
  'geo.no-lead-summary': ['warn', 'No short factual lead paragraph right after the h1'],
  'sitemap.missing-page': ['error', 'Indexable page not in the sitemap'],
  'sitemap.bad-url': ['error', 'Sitemap URL is missing, a redirect stub, noindex or 404'],
  'sitemap.not-canonical': ['error', 'Sitemap <loc> differs from the page canonical'],
  'sitemap.duplicate': ['error', 'URL listed twice in the sitemap'],
  'sitemap.no-lastmod': ['warn', 'Sitemap URL without lastmod'],
  'sitemap.lastmod-invalid': ['error', 'Sitemap lastmod is not a valid date'],
  'sitemap.lastmod-future': ['warn', 'Sitemap lastmod in the future'],
  'sitemap.lastmod-uniform': ['warn', 'Most lastmod values are identical (shallow git clone in CI?)'],
  'stub.delayed': ['error', 'Redirect stub meta refresh is not instant (0)'],
  'stub.target-missing': ['error', 'Redirect stub target does not exist'],
  'stub.chain': ['error', 'Redirect stub points at another stub (chain)'],
  'stub.target-noindex': ['error', 'Redirect stub points at a noindex page'],
  'stub.canonical': ['error', 'Redirect stub canonical missing or not the absolute target URL'],
  'stub.noindex': ['error', 'Redirect stub carries noindex (conflicts with the redirect)'],
  'stub.no-fallback-link': ['warn', 'Redirect stub has no visible link to the target'],
  'baseline.lost': ['error', 'Baseline URL no longer resolves (no page, no stub)'],
  'baseline.stub-broken': ['error', 'Baseline URL redirects to a missing page'],
  'baseline.chain': ['error', 'Baseline URL reaches its page through more than one redirect'],
  'baseline.noindexed': ['warn', 'Baseline URL resolves but is now noindex'],
  'baseline.moved': ['info', 'Baseline URL redirects to a new page'],
  'baseline.title-drift': ['warn', 'Page lost the primary phrase of its indexed title'],
  'baseline.topic-lost': ['warn', 'Redirect target does not mention the old page topic in its title or headings'],
  'baseline.missing-file': ['warn', 'Baseline file not found; baseline checks skipped'],
  'baseline.title-changed': ['info', 'Indexed title phrase left the title but is kept in the h1/headings/lead'],
  'urlmap.kept-not-page': ['error', 'url-map says "kept" but the URL is not a real page'],
  'urlmap.target-mismatch': ['error', 'Redirect stub target differs from url-map.json'],
  'urlmap.pending': ['warn', 'url-map redirect not switched on yet (old page still live)'],
  'urlmap.anchor-missing': ['error', 'Anchor required by url-map.json does not exist'],
  'privacy.denylist': ['error', 'Denylisted organization/system name in published text'],
  'privacy.im-id': ['error', 'Real-looking IM identifier (WeCom/Feishu user, group or bot ID)'],
  'privacy.secret': ['error', 'Real-looking credential (API key, token, private key)'],
  'privacy.internal-host': ['error', 'Intranet-style host name in published text (use example.com)'],
  'privacy.email': ['error', 'Email address outside example.com and the allowlist (use name@example.com)'],
  'privacy.no-denylist': ['info', 'No denylist file; only pattern-based leak checks ran'],
  'privacy.code-host': ['info', 'Host in a code block outside the example/public allowlist (review: use example.com)'],
}

const PLACEHOLDER_RE = /abcdef|xxxx|0123456|example|your|placeholder|sample|test/i
const CODE_HOST_ALLOW = /(^|\.)(example\.(com|org|net)|localhost|hello-halo\.cc|haloxe\.com|github\.com|githubusercontent\.com|github\.io|anthropic\.com|openai\.com|deepseek\.com|feishu\.cn|larksuite\.com|weixin\.qq\.com|work\.weixin\.qq\.com|npmjs\.org|npmjs\.com|docker\.io|docker\.com|ghcr\.io|schema\.org|w3\.org|baidu\.com|googletagmanager\.com|nodejs\.org|python\.org|microsoft\.com|apple\.com|cloudflare\.com|knative\.dev)$/i

// Leak patterns. Organization names are NOT listed here (this file may become public);
// they come from a denylist file kept outside the public repo.
const LEAK_PATTERNS = [
  ['privacy.im-id', /\b(?:wo|wm|wr)(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Z])[A-Za-z0-9_-]{20,40}\b/g],
  ['privacy.im-id', /\baib(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{16,}\b/g],
  ['privacy.im-id', /\b(?:ou|oc|on)_[0-9a-f]{32}\b/g],
  ['privacy.im-id', /\bcli_[0-9a-f]{16}\b/g],
  ['privacy.secret', /\bsk-(?:ant-)?(?=[A-Za-z0-9_-]*\d)(?=[A-Za-z0-9_-]*[A-Za-z])[A-Za-z0-9_-]{24,}\b/g],
  ['privacy.secret', /\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{30,}\b/g],
  ['privacy.secret', /\bAKIA[0-9A-Z]{16}\b/g],
  ['privacy.secret', /\bxox[abprs]-[A-Za-z0-9-]{10,}\b/g],
  ['privacy.secret', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['privacy.internal-host', /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:corp|internal|intranet|intra|lan)\b/gi],
  ['privacy.email', /\b[A-Za-z0-9._%+-]+@(?!(?:[a-z0-9-]+\.)*(?:example\.(?:com|org|net)|hello-halo\.cc|haloxe\.com|users\.noreply\.github\.com)\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g],
]

// ---------------------------------------------------------------- CLI

const argv = process.argv.slice(2)
const opts = { maxList: 8, fullUnder: 40 }
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--baseline') opts.baseline = argv[++i]
  else if (a === '--url-map') opts.urlMap = argv[++i]
  else if (a === '--denylist') opts.denylist = argv[++i]
  else if (a === '--config') opts.config = argv[++i]
  else if (a === '--src') opts.src = argv[++i]
  else if (a === '--only') opts.only = argv[++i].split(',').map((s) => s.trim().replace(/^\/?(docs\/)?/, '')).filter(Boolean)
  else if (a === '--label') opts.label = argv[++i]
  else if (a === '--site-root') opts.siteRoot = argv[++i]
  else if (a === '--json') opts.json = argv[++i]
  else if (a === '--internal') opts.internal = true
  else if (a === '--reveal') opts.reveal = true
  else if (a === '--max-list') opts.maxList = Number(argv[++i])
  else if (a === '--verbose') { opts.maxList = Infinity; opts.fullUnder = Infinity }
  else if (a === '-h' || a === '--help') { printHelp(); process.exit(0) }
  else positional.push(a)
}
if (!positional[0]) { printHelp(); process.exit(2) }
const DIST = path.resolve(positional[0])
if (!fs.existsSync(path.join(DIST, 'index.html')) && !fs.existsSync(path.join(DIST, '404.html'))) {
  console.error(`Not a built docs folder: ${DIST}`)
  process.exit(2)
}

// The script lives in <repo>/scripts/. Data files and the config are resolved from the repo root.
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(scriptDir, '..')
const configFile = opts.config || path.join(scriptDir, 'seo-check.config.json')
const CONFIG = fs.existsSync(configFile) ? readJson(configFile) : {}
const firstExisting = (cands) => [].concat(cands || []).map((c) => path.resolve(REPO, c)).find((c) => fs.existsSync(c))
if (!opts.baseline) opts.baseline = firstExisting(CONFIG.baseline)
if (!opts.urlMap) opts.urlMap = firstExisting(CONFIG.urlMap)
if (!opts.src) opts.src = firstExisting(CONFIG.src)
if (!opts.denylist) opts.denylist = process.env.SEO_CHECK_DENYLIST || firstExisting(CONFIG.localDenylist)
if (!opts.siteRoot) {
  for (const cand of [path.join(DIST, '..'), path.join(DIST, '../../..')]) {
    if (fs.existsSync(path.join(cand, 'index.html')) && fs.existsSync(path.join(cand, 'CNAME'))) { opts.siteRoot = cand; break }
  }
}
const ALLOW_EMAILS = new Set((CONFIG.allowEmails || []).map((e) => e.toLowerCase()))
const EXTRA_CODE_HOSTS = (CONFIG.allowCodeHosts || []).map((h) => h.toLowerCase())

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch (e) {
    console.error(`Cannot read ${file}: ${e.message}`)
    process.exit(2)
  }
}

function printHelp() {
  console.log(`Usage: node scripts/seo-check.mjs <dist> [options]
  --site-root <dir>   assembled site root (auto-detected for dist/docs and docs-src/.vitepress/dist)
  --baseline <file>   URL baseline JSON (default: first existing path in seo-check.config.json "baseline")
  --url-map <file>    url-map.json (default: config "urlMap")
  --src <dir>         docs source scanned for leaks, since the repo is public (default: config "src")
  --denylist <file>   names that must never be published; or env SEO_CHECK_DENYLIST (file) /
                      SEO_CHECK_DENYLIST_TERMS (comma or newline separated). Never commit the list.
  --config <file>     non-secret config (default: scripts/seo-check.config.json)
  --only <prefixes>   report only pages under these paths, e.g. --only seo/,en/seo/
  --internal          intranet build: skip SEO-only checks, check links/quality and credentials
  --json <file>       write every finding as JSON      --label <text>   header label
  --reveal            print privacy matches unmasked (local use only, never in CI logs)
  --max-list <n>      examples for rules with more than 40 findings (default 8); --verbose for all
Exit code: 1 on any ERROR, 2 on bad input, 0 otherwise.`)
}

// ---------------------------------------------------------------- findings

const findings = []
function report(rule, page, msg = '', extra) {
  const def = RULES[rule]
  if (!def) throw new Error(`Unknown rule ${rule}`)
  findings.push({ level: def[0], rule, page, msg, ...(extra || {}) })
}

// ---------------------------------------------------------------- HTML helpers

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', hellip: '…', mdash: '—', ndash: '–', copy: '©', middot: '·', laquo: '«', raquo: '»', rarr: '→', larr: '←', times: '×' }
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m
    }
    return ENTITIES[e.toLowerCase()] ?? m
  })
}

const TAG_RE = (name) => new RegExp(`<${name}\\b((?:[^>"']|"[^"]*"|'[^']*')*)>`, 'gi')
function attrs(inner) {
  const out = {}
  const re = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let m
  while ((m = re.exec(inner))) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '')
  return out
}
function tags(html, name) {
  const out = []
  const re = TAG_RE(name)
  let m
  while ((m = re.exec(html))) out.push({ attrs: attrs(m[1]), index: m.index, end: m.index + m[0].length })
  return out
}
function textOf(html) {
  return decode(html.replace(/<[^>]*>/g, ' ')).replace(/[\u200b\u00a0]/g, ' ').replace(/\s+/g, ' ').trim()
}

function width(s) {
  let w = 0
  for (const ch of s) {
    const c = ch.codePointAt(0)
    const wide = (c >= 0x1100 && c <= 0x115f) || (c >= 0x2e80 && c <= 0xa4cf) || (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xf900 && c <= 0xfaff) || (c >= 0xfe30 && c <= 0xfe4f) || (c >= 0xff00 && c <= 0xff60) ||
      (c >= 0xffe0 && c <= 0xffe6) || (c >= 0x20000 && c <= 0x3fffd)
    w += wide ? 2 : 1
  }
  return w
}
const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/g
function textUnits(s) {
  const cjk = (s.match(CJK_RE) || []).length
  const words = (s.replace(CJK_RE, ' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length
  return { cjk, words, units: cjk + words }
}
const norm = (s) => s.toLowerCase().replace(/[\s\u200b]+/g, '')

// Image dimensions from file headers (PNG, JPEG, GIF, WebP); null when unknown.
function imageSize(buf) {
  try {
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }
    if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) }
    if (buf.length > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const kind = buf.toString('ascii', 12, 16)
      if (kind === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff }
      if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 } }
      if (kind === 'VP8X') return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 }
    }
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) { i++; continue }
        const marker = buf[i + 1]
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) }
        i += 2 + buf.readUInt16BE(i + 2)
      }
    }
  } catch { /* unreadable header */ }
  return null
}

// ---------------------------------------------------------------- inventory

const allFiles = new Set()
const fileSize = new Map()
;(function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(abs)
    else {
      const rel = path.relative(DIST, abs).split(path.sep).join('/')
      allFiles.add(rel)
      fileSize.set(rel, fs.statSync(abs).size)
    }
  }
})(DIST)

const siteFiles = new Set()
if (opts.siteRoot) {
  ;(function walk(dir, depth) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.') || ent.name === 'node_modules') continue
      const abs = path.join(dir, ent.name)
      const rel = path.relative(opts.siteRoot, abs).split(path.sep).join('/')
      if (ent.isDirectory()) { if (depth < 3 && !['docs-src', 'dist', 'docs', 'haloxe', 'scripts'].includes(rel)) walk(abs, depth + 1) }
      else siteFiles.add(rel)
    }
  })(opts.siteRoot, 0)
}

const pageUrlOf = (rel) => SITE + BASE + rel.replace(/(^|\/)index\.html$/, '$1')
const isEn = (rel) => rel.startsWith(LOCALE_PREFIX_EN)
const counterpartOf = (rel) => (isEn(rel) ? rel.slice(LOCALE_PREFIX_EN.length) : LOCALE_PREFIX_EN + rel)
const isHome = (rel) => rel === 'index.html' || rel === LOCALE_PREFIX_EN + 'index.html'

// Resolve a URL string the way GitHub Pages serves /docs/ (case-sensitive).
function resolve(href, fromUrl) {
  let u
  try { u = new URL(href, fromUrl) } catch { return { kind: 'invalid' } }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { kind: 'other' }
  const origin = u.origin
  const mirror = origin !== SITE && MIRROR_ORIGINS.includes(origin)
  if (origin !== SITE && !mirror) return { kind: 'external' }
  let p, hash
  try { p = decodeURIComponent(u.pathname); hash = decodeURIComponent(u.hash.slice(1)) } catch { return { kind: 'invalid' } }
  if (!p.startsWith(BASE)) {
    if (p + '/' === BASE) p = BASE
    else {
      const rel = p.replace(/^\//, '')
      const cands = rel === '' || rel.endsWith('/') ? [rel + 'index.html'] : /\.[a-z0-9]+$/i.test(rel) ? [rel] : [rel + '.html', rel + '/index.html']
      const hit = opts.siteRoot ? cands.find((c) => siteFiles.has(c)) : undefined
      return { kind: 'outside', checked: !!opts.siteRoot, exists: !!hit, path: p, mirror }
    }
  }
  const rel = p.slice(BASE.length)
  const cands = rel === '' || rel.endsWith('/') ? [rel + 'index.html'] : /\.[a-z0-9]+$/i.test(rel.split('/').pop()) ? [rel] : [rel + '.html', rel + '/index.html']
  const hit = cands.find((c) => allFiles.has(c))
  return { kind: hit ? (hit.endsWith('.html') ? 'page' : 'asset') : 'missing', rel: hit ?? cands[0], hash, mirror, url: u.href }
}

// ---------------------------------------------------------------- parse pages

const pages = new Map()
let siteDescription = null
for (const rel of [...allFiles].filter((f) => f.endsWith('.html') && !f.startsWith('assets/')).sort()) {
  const html = fs.readFileSync(path.join(DIST, rel), 'utf8')
  const headEnd = html.search(/<\/head>/i)
  const head = headEnd > 0 ? html.slice(0, headEnd) : html
  const jsonld = []
  for (const m of html.matchAll(/<script\b[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)) jsonld.push(m[1])
  if (!siteDescription) {
    const m = html.match(/__VP_SITE_DATA__=JSON\.parse\(("(?:[^"\\]|\\.)*")\)/)
    if (m) { try { siteDescription = JSON.parse(JSON.parse(m[1])).description || null } catch { /* not VitePress */ } }
  }
  const clean = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '')
  const cleanHead = clean.slice(0, Math.max(0, clean.search(/<\/head>/i)))
  const body = clean.slice(clean.search(/<\/head>/i) + 7)
  const mainStart = body.search(/<main\b/i)
  const mainEnd = body.search(/<\/main>/i)
  const main = mainStart >= 0 && mainEnd > mainStart ? body.slice(mainStart, mainEnd) : body
  const metas = tags(cleanHead, 'meta').map((t) => t.attrs)
  const links = tags(cleanHead, 'link').map((t) => t.attrs)
  const meta = (k, v) => metas.find((m) => (m[k] || '').toLowerCase() === v)?.content
  const titleM = cleanHead.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const refresh = metas.find((m) => (m['http-equiv'] || '').toLowerCase() === 'refresh')
  const robots = (meta('name', 'robots') || '').toLowerCase()
  const htmlTag = tags(clean, 'html')[0]
  const headings = [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: Number(m[1]), text: textOf(m[2]) }))
  const ids = new Set()
  for (const m of body.matchAll(/\s(?:id|name)\s*=\s*"([^"]*)"/gi)) ids.add(decode(m[1]))
  const anchors = tags(body, 'a').map((t) => ({ href: t.attrs.href, inMain: t.index >= mainStart + 0 && mainStart >= 0 && t.index < mainEnd })).filter((a) => a.href !== undefined)
  const images = tags(body, 'img').map((t) => ({ ...t.attrs, inMain: mainStart >= 0 && t.index >= mainStart && t.index < mainEnd }))
  const mainNoCode = main.replace(/<pre\b[\s\S]*?<\/pre>/gi, ' ')
  const page = {
    rel, html, head, cleanHead, body, main, mainNoCode, jsonld, metas, links, headings, ids, anchors, images,
    url: pageUrlOf(rel),
    title: titleM ? textOf(titleM[1]) : null,
    description: meta('name', 'description') ?? null,
    lang: htmlTag?.attrs.lang || null,
    robots,
    refresh: refresh ? refresh.content || '' : null,
    canonicals: links.filter((l) => (l.rel || '').toLowerCase() === 'canonical').map((l) => l.href),
    alternates: links.filter((l) => (l.rel || '').toLowerCase() === 'alternate' && l.hreflang).map((l) => ({ hreflang: l.hreflang, href: l.href })),
    mdAlternates: links.filter((l) => (l.rel || '').toLowerCase() === 'alternate' && (l.type || '').toLowerCase() === 'text/markdown').map((l) => l.href),
    og: Object.fromEntries(metas.filter((m) => m.property && m.property.startsWith('og:')).map((m) => [m.property, m.content])),
    twitter: Object.fromEntries(metas.filter((m) => m.name && m.name.startsWith('twitter:')).map((m) => [m.name, m.content])),
  }
  page.docType = (metas.find((m) => (m.name || '').toLowerCase() === 'halo-docs-type')?.content || '').toLowerCase()
  page.isStub = page.refresh !== null
  page.is404 = rel === '404.html'
  page.noindex = /noindex/.test(robots)
  page.indexable = !page.isStub && !page.is404 && !page.noindex
  pages.set(rel, page)
}

const indexable = [...pages.values()].filter((p) => p.indexable)
const stubs = [...pages.values()].filter((p) => p.isStub)
const resolveFrom = (href, page) => resolve(href, page.url)

// Follow a stub to its final page; returns {final, hops, error}.
function stubTarget(page) {
  const m = page.refresh.match(/^\s*(\d+)\s*(?:;\s*url\s*=\s*['"]?\s*([^'"]+?)\s*['"]?)?\s*$/i)
  if (!m || !m[2]) return { delay: m ? Number(m[1]) : NaN, error: 'stub.target-missing' }
  const r = resolveFrom(m[2], page)
  return { delay: Number(m[1]), target: r, href: m[2] }
}
function follow(rel, maxHops = 5) {
  let cur = pages.get(rel)
  let hops = 0
  while (cur && cur.isStub && hops < maxHops) {
    const t = stubTarget(cur)
    if (!t.target || t.target.kind !== 'page') return { final: null, hops: hops + 1 }
    cur = pages.get(t.target.rel)
    hops++
  }
  return { final: cur && !cur.isStub ? cur : null, hops }
}

// ---------------------------------------------------------------- site-level

if (!pages.has('404.html')) report('site.404-missing', '-')

// Sitemap
const sitemap = new Map()
const sitemapFile = path.join(DIST, 'sitemap.xml')
if (!opts.internal) {
  if (!fs.existsSync(sitemapFile)) report('site.sitemap-missing', '-')
  else {
    const xml = fs.readFileSync(sitemapFile, 'utf8')
    for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = decode((m[1].match(/<loc>([\s\S]*?)<\/loc>/) || [])[1] || '').trim()
      const lastmod = ((m[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/) || [])[1] || '').trim() || null
      const alts = [...m[1].matchAll(/<xhtml:link\b([^>]*)\/?>/g)].map((a) => attrs(a[1])).filter((a) => a.hreflang).map((a) => ({ hreflang: a.hreflang, href: a.href }))
      if (sitemap.has(loc)) report('sitemap.duplicate', loc)
      sitemap.set(loc, { loc, lastmod, alts })
    }
    const lastmods = [...sitemap.values()].map((e) => e.lastmod).filter(Boolean)
    const now = Date.now() + 24 * 3600 * 1000
    for (const e of sitemap.values()) {
      const r = resolve(e.loc, SITE + BASE)
      const p = r.kind === 'page' ? pages.get(r.rel) : null
      if (!p || !p.indexable) report('sitemap.bad-url', e.loc, p ? (p.isStub ? 'redirect stub' : p.noindex ? 'noindex' : '404') : 'no file')
      else if (p.canonicals[0] && p.canonicals[0] !== e.loc) report('sitemap.not-canonical', p.rel, `${e.loc} vs canonical ${p.canonicals[0]}`)
      if (!e.lastmod) report('sitemap.no-lastmod', e.loc)
      else if (Number.isNaN(Date.parse(e.lastmod))) report('sitemap.lastmod-invalid', e.loc, e.lastmod)
      else if (Date.parse(e.lastmod) > now) report('sitemap.lastmod-future', e.loc, e.lastmod)
    }
    if (lastmods.length >= 10) {
      const counts = {}
      for (const l of lastmods) counts[l] = (counts[l] || 0) + 1
      const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (n / lastmods.length >= 0.8) report('sitemap.lastmod-uniform', '-', `${n}/${lastmods.length} URLs share lastmod ${top}`)
    }
    for (const p of indexable) {
      const key = p.canonicals[0] || p.url
      if (!sitemap.has(key) && !sitemap.has(p.url)) report('sitemap.missing-page', p.rel)
      if (p.noindex && sitemap.has(p.url)) report('robots.noindex-in-sitemap', p.rel)
    }
    for (const p of pages.values()) if (p.noindex && sitemap.has(p.url)) report('robots.noindex-in-sitemap', p.rel)
  }
}

// llms.txt
if (!opts.internal) {
  // llms.txt per locale: /docs/llms.txt (zh) and /docs/en/llms.txt (en); pages may be listed by .html or .md.
  if (!allFiles.has('llms.txt')) report('geo.llms-missing', '-')
  const listed = new Set()
  for (const f of ['llms.txt', LOCALE_PREFIX_EN + 'llms.txt'].filter((x) => allFiles.has(x))) {
    const txt = fs.readFileSync(path.join(DIST, f), 'utf8')
    for (const m of txt.matchAll(/\]\(([^)\s]+)\)/g)) {
      const r = resolve(m[1], SITE + BASE + (f.startsWith(LOCALE_PREFIX_EN) ? LOCALE_PREFIX_EN : ''))
      if (r.kind === 'missing' || r.kind === 'invalid') report('geo.llms-broken-link', f, m[1])
      if (r.rel) listed.add(r.rel.replace(/\.md$/, '.html'))
    }
  }
  if (allFiles.has('llms.txt')) for (const p of indexable) if (!listed.has(p.rel)) report('geo.llms-coverage', p.rel)
  if (!allFiles.has('llms-full.txt')) report('geo.llms-full-missing', '-')
  if (allFiles.has(LOCALE_PREFIX_EN + 'llms.txt') && !allFiles.has(LOCALE_PREFIX_EN + 'llms-full.txt')) report('geo.llms-full-missing', LOCALE_PREFIX_EN)
}

// ---------------------------------------------------------------- per page

const titleSeen = new Map()
const descSeen = new Map()
const inbound = new Map()
const contextualInbound = new Map()
const graph = new Map()
const imageUse = new Map()
const brokenSeen = new Set()

for (const p of pages.values()) {
  if (p.is404) continue

  if (p.isStub) {
    checkStub(p)
    continue
  }

  // Work files published as pages
  if (/(^|\/)(progress|todo|draft|wip|notes?)[^/]*\.html$/i.test(p.rel) || /写作进度|work in progress/i.test(p.title || '')) report('page.work-file', p.rel, p.title || '')

  // <html lang>
  const wantLang = isEn(p.rel) ? /^en\b/i : /^zh\b/i
  if (!p.lang || !wantLang.test(p.lang)) report('lang.attr', p.rel, `lang="${p.lang}"`)

  const text = textOf(p.mainNoCode)
  const tu = textUnits(text)
  if (!isEn(p.rel) && tu.words > 150 && tu.cjk / Math.max(1, tu.units) < 0.15) report('lang.content-mismatch', p.rel, `zh locale but ${Math.round((100 * tu.cjk) / Math.max(1, tu.units))}% CJK`)
  if (isEn(p.rel) && tu.cjk > 0.2 * Math.max(1, tu.units)) report('lang.content-mismatch', p.rel, `en locale but ${Math.round((100 * tu.cjk) / tu.units)}% CJK`)

  if (p.robots.includes('nofollow')) report('robots.nofollow', p.rel)
  if (p.noindex) report('robots.noindex', p.rel)

  // Title
  if (!p.title) report('title.missing', p.rel)
  else {
    const t = p.title
    if (/\|\s*Halo(\s+AI)?\s*\|\s*Halo(\s+AI)?\s*$/i.test(t)) report('title.brand-duplicated', p.rel, t)
    const w = width(t)
    if (w > LIMITS.titleHardMax) report('title.too-long', p.rel, `${w}u: ${t}`)
    else if (w > LIMITS.titleMax) report('title.long', p.rel, `${w}u: ${t}`)
    if (w < LIMITS.titleMin) report('title.short', p.rel, `${w}u: ${t}`)
    // The docs home sets titleTemplate: false and carries its full title (SEO.md §3.2).
    if (!isHome(p.rel) && !t.trim().endsWith(BRAND_SUFFIX)) report('title.brand-suffix', p.rel, t)
    if (p.indexable) {
      const k = t.trim().toLowerCase()
      titleSeen.set(k, [...(titleSeen.get(k) || []), p.rel])
    }
  }

  // Description
  if (!p.description) report('desc.missing', p.rel)
  else {
    const d = p.description.trim()
    if (siteDescription && d === siteDescription.trim()) report('desc.default', p.rel)
    const w = width(d)
    if (w < LIMITS.descMin) report('desc.short', p.rel, `${w}u: ${d}`)
    else if (w > LIMITS.descMax) report('desc.long', p.rel, `${w}u`)
    if (p.indexable && !(siteDescription && d === siteDescription.trim())) descSeen.set(d, [...(descSeen.get(d) || []), p.rel])
  }

  // Headings
  const h1 = p.headings.filter((h) => h.level === 1)
  if (h1.length === 0) report('h1.missing', p.rel)
  if (h1.length > 1) report('h1.multiple', p.rel, h1.map((h) => h.text).join(' / '))
  let prev = 0
  for (const h of p.headings) {
    if (!h.text) report('heading.empty', p.rel, `h${h.level}`)
    if (prev && h.level > prev + 1) { report('heading.skip', p.rel, `h${prev} -> h${h.level} "${h.text.slice(0, 40)}"`); break }
    prev = h.level
  }

  // Canonical
  if (p.canonicals.length === 0) { if (p.indexable) report('canonical.missing', p.rel) }
  else {
    if (p.canonicals.length > 1) report('canonical.multiple', p.rel, p.canonicals.join(' '))
    const c = p.canonicals[0]
    if (!c.startsWith(SITE + BASE)) report('canonical.host', p.rel, c)
    else if (c !== p.url) report('canonical.mismatch', p.rel, `${c} (expected ${p.url})`)
  }

  // Social
  if (!opts.internal) {
    if (!p.og['og:title'] || !p.og['og:description'] || !p.og['og:url']) report('og.missing', p.rel)
    if (p.og['og:url'] && p.canonicals[0] && p.og['og:url'] !== p.canonicals[0]) report('og.url-mismatch', p.rel, p.og['og:url'])
    const ogImg = p.og['og:image'] || p.twitter['twitter:image']
    if (!ogImg) report('og.image-missing', p.rel)
    else checkOgImage(p, ogImg)
    if (!isHome(p.rel) && p.og['og:type'] !== 'article') report('og.type', p.rel, `og:type=${p.og['og:type']}`)
    if (!p.og['og:locale']) report('og.locale', p.rel)
    if (!p.twitter['twitter:card']) report('twitter.card', p.rel)
  }

  // Analytics and render-blocking third parties
  if (!opts.internal) for (const a of ANALYTICS) if (!p.html.includes(a)) report('analytics.missing', p.rel, a)
  const preconnects = []
  for (const l of p.links) {
    const rel = (l.rel || '').toLowerCase()
    const external = /^https?:\/\//i.test(l.href || '') && !(l.href || '').startsWith(SITE)
    if (external && (rel.includes('stylesheet') || (rel.includes('preload') && (l.as || '') === 'style'))) report('perf.third-party-css', p.rel, l.href)
    if (external && rel.includes('preconnect') && /fonts\.(googleapis|gstatic)\.com/.test(l.href)) preconnects.push(l.href)
  }
  if (preconnects.length) report('perf.third-party-preconnect', p.rel, preconnects.join(' '))
  for (const s of tags(p.head, 'script')) {
    const src = s.attrs.src || ''
    if (/^https?:\/\//i.test(src) && !src.startsWith(SITE) && s.attrs.async === undefined && s.attrs.defer === undefined && (s.attrs.type || '') !== 'module') report('perf.blocking-script', p.rel, src)
  }

  // hreflang
  if (!opts.internal) checkHreflang(p)

  // JSON-LD
  checkJsonLd(p, text)

  // GEO: raw markdown alternate and lead summary
  if (p.indexable && !opts.internal) {
    if (p.mdAlternates.length === 0) report('geo.md-alternate-missing', p.rel)
    for (const href of p.mdAlternates) {
      const r = resolveFrom(href, p)
      if (r.kind !== 'asset') report('geo.md-alternate-broken', p.rel, href)
    }
  }
  if (p.indexable && !isHome(p.rel)) {
    const afterH1 = p.main.split(/<\/h1>/i)[1]
    const firstBlock = afterH1 ? afterH1.match(/<(p|div|table|ul|ol|blockquote|pre|h[2-6]|img|figure)\b[^>]*>([\s\S]*?)<\/\1>/i) : null
    const lead = firstBlock && firstBlock[1].toLowerCase() === 'p' ? textOf(firstBlock[2]) : ''
    const lw = width(lead)
    if (!lead || lw < LIMITS.leadMin || lw > LIMITS.leadMax) report('geo.no-lead-summary', p.rel, lead ? `${lw}u` : `first block is <${firstBlock ? firstBlock[1] : 'none'}>`)
  }

  // Content size
  if (p.indexable && !isHome(p.rel) && p.docType !== 'hub' && tu.units < LIMITS.thinUnits) report('content.thin', p.rel, `${tu.units} units`)
  p.textUnits = tu.units
  p.plainText = text

  // Links
  const out = new Set()
  for (const a of p.anchors) {
    const href = a.href.trim()
    if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) continue
    const r = resolveFrom(href, p)
    if (r.kind === 'external' || r.kind === 'other') continue
    if (r.kind === 'invalid') { report('link.invalid', p.rel, href); continue }
    if (r.mirror) report('link.mirror-host', p.rel, href)
    if (r.kind === 'outside') {
      if (!r.checked) report('link.outside-unchecked', p.rel, href)
      else if (!r.exists) reportBroken(p, href, r.path)
      continue
    }
    if (r.kind === 'missing') {
      if (r.rel === counterpartOf(p.rel)) {
        if (!brokenSeen.has(`${p.rel}|${href}`)) report('link.lang-switch-missing', p.rel, href)
        brokenSeen.add(`${p.rel}|${href}`)
      } else reportBroken(p, href, r.rel)
      continue
    }
    if (r.kind === 'asset') continue
    const target = pages.get(r.rel)
    if (target.isStub) report('link.to-stub', p.rel, href)
    const wantPath = BASE + r.rel.replace(/(^|\/)index\.html$/, '$1')
    let gotPath = ''
    try { gotPath = decodeURIComponent(new URL(href, p.url).pathname) } catch { /* reported as invalid above */ }
    if (gotPath && gotPath !== wantPath) report('link.non-canonical', p.rel, `${href} (canonical ${wantPath})`)
    if (r.hash && !r.hash.startsWith('/') && !r.hash.startsWith(':~:') && !target.ids.has(r.hash)) report('link.anchor-missing', p.rel, href)
    if (r.rel !== p.rel) {
      out.add(r.rel)
      if (!inbound.has(r.rel)) inbound.set(r.rel, new Set())
      inbound.get(r.rel).add(p.rel)
      if (a.inMain) {
        if (!contextualInbound.has(r.rel)) contextualInbound.set(r.rel, new Set())
        contextualInbound.get(r.rel).add(p.rel)
      }
    }
  }
  graph.set(p.rel, out)

  // Images
  let noDim = 0, notLazy = 0, contentImgs = 0, imgBytes = 0
  for (const img of p.images) {
    const src = img.src || ''
    if (!src || src.startsWith('data:')) continue
    const r = resolveFrom(src, p)
    if (r.kind === 'missing' || (r.kind === 'outside' && r.checked && !r.exists)) report('img.broken', p.rel, src)
    if (r.kind === 'asset') {
      imgBytes += fileSize.get(r.rel) || 0
      if (!imageUse.has(r.rel)) imageUse.set(r.rel, new Set())
      imageUse.get(r.rel).add(p.rel)
    }
    if (!img.inMain) continue
    contentImgs++
    if (img.alt === undefined) report('img.alt-missing', p.rel, src)
    else if (!img.alt.trim() && img.role !== 'presentation' && img['aria-hidden'] !== 'true') report('img.alt-empty', p.rel, src)
    if (!img.width || !img.height) noDim++
    if ((img.loading || '').toLowerCase() !== 'lazy') notLazy++
  }
  if (noDim) report('img.no-dimensions', p.rel, `${noDim}/${contentImgs} images`)
  if (notLazy) report('img.not-lazy', p.rel, `${notLazy}/${contentImgs} images`)

  // First-visit weight: HTML + same-origin CSS/JS/fonts referenced from <head> + images.
  let weight = Buffer.byteLength(p.html) + imgBytes
  for (const l of p.links) {
    const rel = (l.rel || '').toLowerCase()
    if (!/(stylesheet|modulepreload|preload)/.test(rel)) continue
    const r = resolveFrom(l.href || '', p)
    if (r.kind === 'asset') weight += fileSize.get(r.rel) || 0
  }
  for (const s of tags(p.head, 'script')) {
    const r = s.attrs.src ? resolveFrom(s.attrs.src, p) : null
    if (r && r.kind === 'asset') weight += fileSize.get(r.rel) || 0
  }
  p.weight = weight
  if (weight > LIMITS.pageWeightWarn) report('perf.page-weight', p.rel, `${(weight / 1024 / 1024).toFixed(2)} MB`)
}

function reportBroken(p, href, target) {
  const key = `${p.rel}|${href}`
  if (brokenSeen.has(key)) return
  brokenSeen.add(key)
  report('link.broken', p.rel, `${href} -> ${target}`)
}

for (const [k, list] of titleSeen) if (list.length > 1) for (const rel of list) report('title.duplicate', rel, `"${k}" also on ${list.filter((r) => r !== rel).slice(0, 3).join(', ')}`)
for (const [d, list] of descSeen) if (list.length > 1) for (const rel of list) report('desc.duplicate', rel, `also on ${list.filter((r) => r !== rel).slice(0, 3).join(', ')}${list.length > 4 ? ` (+${list.length - 4})` : ''}`)

// Image files (each reported once)
for (const [rel, users] of imageUse) {
  const size = fileSize.get(rel) || 0
  const where = [...users].slice(0, 2).join(', ')
  if (size > LIMITS.imgMaxBytes) report('img.too-heavy', rel, `${Math.round(size / 1024)} KB (used on ${where})`)
  else if (size > LIMITS.imgWarnBytes) report('img.heavy', rel, `${Math.round(size / 1024)} KB (used on ${where})`)
  if (/\.(png|jpe?g|gif|webp)$/i.test(rel)) {
    const dim = imageSize(fs.readFileSync(path.join(DIST, rel)))
    if (dim && dim.w > LIMITS.imgMaxWidth) report('img.too-wide', rel, `${dim.w}x${dim.h}`)
    if (size < 1024 || (dim && dim.w <= 16 && dim.h <= 16)) report('img.placeholder', rel, `${size} bytes${dim ? `, ${dim.w}x${dim.h}` : ''} (used on ${where})`)
  }
}

// Orphans, contextual inbound, reachability from the docs homes
for (const p of indexable) {
  if (isHome(p.rel)) continue
  if (!inbound.get(p.rel)?.size) report('links.orphan', p.rel)
  else if (!contextualInbound.get(p.rel)?.size) report('links.no-contextual-inbound', p.rel)
}
const depth = new Map()
const queue = []
for (const h of ['index.html', LOCALE_PREFIX_EN + 'index.html']) if (pages.has(h)) { depth.set(h, 0); queue.push(h) }
while (queue.length) {
  const cur = queue.shift()
  for (const next of graph.get(cur) || []) {
    const np = pages.get(next)
    const real = np && np.isStub ? follow(next).final?.rel : next
    if (real && !depth.has(real)) { depth.set(real, depth.get(cur) + 1); queue.push(real) }
  }
}
for (const p of indexable) {
  if (!depth.has(p.rel)) report('links.unreachable', p.rel)
  else if (depth.get(p.rel) > LIMITS.maxDepth) report('links.deep', p.rel, `${depth.get(p.rel)} clicks`)
}

// Overlap of main content within a locale (prose only, code removed). Containment
// is measured against the smaller page: 5-token shingles catch copied prose,
// 3-token shingles catch the same topic retold in other words.
const shingles = new Map()
for (const p of indexable) {
  if (isHome(p.rel) || !p.plainText) continue
  const toks = []
  for (const m of p.plainText.toLowerCase().matchAll(/[\u3400-\u9fff\uf900-\ufaff]|[a-z0-9]+/g)) toks.push(m[0])
  if (toks.length < 60) continue
  const s5 = new Set(), s3 = new Set()
  for (let i = 0; i + 3 <= toks.length; i++) {
    s3.add(fnv(toks.slice(i, i + 3).join(' ')))
    if (i + 5 <= toks.length) s5.add(fnv(toks.slice(i, i + 5).join(' ')))
  }
  shingles.set(p.rel, { s5, s3 })
}
function containment(a, b) {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  let inter = 0
  for (const x of small) if (large.has(x)) inter++
  return inter / small.size
}
const dupPairs = [], topicPairs = []
const relsByLocale = [[], []]
for (const rel of shingles.keys()) relsByLocale[isEn(rel) ? 1 : 0].push(rel)
for (const group of relsByLocale) {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = shingles.get(group[i]), b = shingles.get(group[j])
      const smaller = a.s3.size <= b.s3.size ? group[i] : group[j]
      const other = smaller === group[i] ? group[j] : group[i]
      const c5 = containment(a.s5, b.s5)
      if (c5 >= LIMITS.dupContainment) { dupPairs.push([smaller, other, c5]); continue }
      const c3 = containment(a.s3, b.s3)
      if (c3 >= LIMITS.topicContainment) topicPairs.push([smaller, other, c3])
    }
  }
}
for (const [s, o, c] of dupPairs.sort((x, y) => y[2] - x[2])) report('content.near-duplicate', s, `${Math.round(c * 100)}% of its prose also on ${o}`)
for (const [s, o, c] of topicPairs.sort((x, y) => y[2] - x[2])) report('content.topic-overlap', s, `${Math.round(c * 100)}% overlap with ${o}`)

// Same primary phrase on two pages of one locale: they compete for one query.
const phraseSeen = new Map()
for (const p of indexable) {
  if (isHome(p.rel) || !p.title) continue
  const ph = primaryPhrase(p.title)
  if (!ph) continue
  const key = (isEn(p.rel) ? 'en:' : 'zh:') + norm(ph)
  phraseSeen.set(key, [...(phraseSeen.get(key) || []), p.rel])
}
for (const [key, list] of phraseSeen) if (list.length > 1) for (const rel of list) report('content.title-overlap', rel, `"${key.slice(3)}" also leads ${list.filter((r) => r !== rel).join(', ')}`)

// Site root files (only when the assembled site root is known).
if (opts.siteRoot && !opts.internal) {
  const read = (f) => (siteFiles.has(f) ? fs.readFileSync(path.join(opts.siteRoot, f), 'utf8') : null)
  if (!siteFiles.has('404.html')) report('site.root-404', opts.siteRoot, 'copy the docs 404.html to the site root in scripts/assemble-site.sh')
  const robotsTxt = read('robots.txt')
  if (!robotsTxt) report('site.robots', 'robots.txt', 'missing')
  else {
    let applies = false
    for (const line of robotsTxt.split(/\r?\n/)) {
      const [k, ...rest] = line.split(':')
      const v = rest.join(':').trim()
      if (/^user-agent$/i.test(k.trim())) applies = v === '*'
      if (applies && /^disallow$/i.test(k.trim()) && v && (BASE.startsWith(v) || v === '/')) report('site.robots', 'robots.txt', `Disallow: ${v}`)
    }
    if (!robotsTxt.includes(`${SITE}${BASE}sitemap.xml`)) report('site.robots-sitemap', 'robots.txt')
  }
  const rootSitemap = read('sitemap.xml')
  if (rootSitemap) {
    for (const m of rootSitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)) {
      const loc = decode(m[1].trim())
      if (!loc.startsWith(SITE + BASE)) continue
      const r = resolve(loc, SITE + BASE)
      const tp = r.kind === 'page' ? pages.get(r.rel) : null
      if (!tp || !tp.indexable || tp.url !== loc) report('site.root-sitemap', 'sitemap.xml (root)', `${loc}${tp ? ` (canonical ${tp.url})` : ' (no page)'}`)
    }
  }
  const rootLlms = read('llms.txt')
  if (rootLlms) {
    for (const m of rootLlms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)) {
      const r = resolve(m[1], SITE + BASE)
      if (r.kind === 'missing') report('site.root-llms', 'llms.txt (root)', `${m[1]} (missing)`)
      else if (r.kind === 'page' && pages.get(r.rel).url !== m[1].split('#')[0]) report('site.root-llms', 'llms.txt (root)', `${m[1]} (canonical ${pages.get(r.rel).url})`)
    }
    if (!rootLlms.includes(`${SITE}${BASE}llms.txt`)) report('site.root-llms', 'llms.txt (root)', `no link to ${SITE}${BASE}llms.txt`)
  }
}

function fnv(s) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return h >>> 0
}

// ---------------------------------------------------------------- checks used above

function checkStub(p) {
  const t = stubTarget(p)
  if (t.delay !== 0) report('stub.delayed', p.rel, p.refresh)
  if (!t.target || t.target.kind === 'missing' || t.target.kind === 'invalid') { report('stub.target-missing', p.rel, t.href || p.refresh); return }
  if (t.target.kind !== 'page') { report('stub.target-missing', p.rel, `${t.href} (not a docs page)`); return }
  const target = pages.get(t.target.rel)
  if (target.isStub) report('stub.chain', p.rel, `${t.href} is itself a stub`)
  // The intranet build is noindex everywhere and has no canonicals (SEO.md §3.10).
  else if (target.noindex && !opts.internal) report('stub.target-noindex', p.rel, t.href)
  const want = pageUrlOf(t.target.rel)
  if (!opts.internal && p.canonicals[0] !== want) report('stub.canonical', p.rel, `canonical=${p.canonicals[0] || 'none'} expected ${want}`)
  if (p.noindex) report('stub.noindex', p.rel)
  const hasLink = p.anchors.some((a) => { const r = resolveFrom(a.href, p); return r.kind === 'page' && r.rel === t.target.rel })
  if (!hasLink) report('stub.no-fallback-link', p.rel)
}

function checkOgImage(p, img) {
  if (!/^https:\/\//.test(img)) { report('og.image-relative', p.rel, img); return }
  const r = resolve(img, p.url)
  if (r.kind === 'missing' || (r.kind === 'outside' && r.checked && !r.exists)) { report('og.image-broken', p.rel, img); return }
  if (r.kind === 'asset' && /\.(png|jpe?g|webp|gif)$/i.test(r.rel)) {
    const dim = imageSize(fs.readFileSync(path.join(DIST, r.rel)))
    if (dim && (dim.w < LIMITS.ogMinWidth || dim.h < LIMITS.ogMinHeight)) report('og.image-small', p.rel, `${dim.w}x${dim.h}`)
  }
}

function langOfCode(code) {
  const c = code.toLowerCase()
  return c === 'x-default' ? 'x-default' : c.split('-')[0]
}

function checkHreflang(p) {
  if (!p.indexable) return
  const cpRel = counterpartOf(p.rel)
  const cp = pages.get(cpRel)
  const hasPair = cp && cp.indexable
  const sm = sitemap.get(p.canonicals[0] || p.url)
  const smAlts = sm ? sm.alts : []
  const htmlAlts = p.alternates

  for (const a of htmlAlts) {
    if (!HREFLANG_OK.test(a.hreflang)) { report('hreflang.invalid-code', p.rel, a.hreflang); continue }
    if (!a.href || !a.href.startsWith(SITE + BASE)) { report('hreflang.host', p.rel, a.href); continue }
    const r = resolve(a.href, p.url)
    const tp = r.kind === 'page' ? pages.get(r.rel) : null
    if (!tp || !tp.indexable) { report('hreflang.bad-target', p.rel, `${a.hreflang} -> ${a.href}`); continue }
    const lang = langOfCode(a.hreflang)
    if (lang !== 'x-default' && lang !== (isEn(tp.rel) ? 'en' : 'zh')) report('hreflang.lang-mismatch', p.rel, `${a.hreflang} -> ${tp.rel}`)
    if (tp.rel !== p.rel && !tp.alternates.some((b) => b.href === p.url || b.href === p.canonicals[0])) report('hreflang.not-reciprocal', p.rel, `${tp.rel} does not list ${p.url}`)
  }

  if (!hasPair) return
  const declared = htmlAlts.length > 0 || smAlts.length > 0
  if (!declared) { report('hreflang.missing', p.rel, `counterpart ${cpRel}`); return }
  if (htmlAlts.length === 0) report('hreflang.html-missing', p.rel)
  const set = htmlAlts.length ? htmlAlts : smAlts
  const hrefs = set.map((a) => a.href)
  if (!hrefs.includes(p.url) || !hrefs.includes(cp.url)) report('hreflang.incomplete', p.rel, hrefs.join(' '))
  const xd = set.find((a) => a.hreflang.toLowerCase() === 'x-default')
  if (!xd) report('hreflang.no-x-default', p.rel)
  else if (xd.href !== (isEn(p.rel) ? p.url : cp.url)) report('hreflang.x-default-target', p.rel, xd.href)
  const codes = set.map((a) => a.hreflang.toLowerCase())
  if (codes.some((c) => !['zh', 'en', 'x-default'].includes(c))) report('hreflang.code-policy', p.rel, codes.join(','))
  if (htmlAlts.length && smAlts.length) {
    const key = (arr) => arr.map((a) => `${a.hreflang.toLowerCase()} ${a.href}`).sort().join('|')
    if (key(htmlAlts) !== key(smAlts)) report('hreflang.sitemap-html-mismatch', p.rel)
  }
}

function checkJsonLd(p, visibleText) {
  const items = []
  for (const raw of p.jsonld) {
    let data
    try { data = JSON.parse(raw) } catch (e) { report('jsonld.invalid', p.rel, e.message); continue }
    const top = Array.isArray(data) ? data : [data]
    for (const d of top) {
      if (d && d['@context'] && !/^https:\/\/schema\.org\/?$/.test(String(d['@context']))) report('jsonld.context', p.rel, String(d['@context']))
      if (d && Array.isArray(d['@graph'])) items.push(...d['@graph'])
      else if (d) items.push(d)
    }
  }
  const typeOf = (i) => [].concat(i['@type'] || [])
  const articles = items.filter((i) => typeOf(i).some((t) => ['TechArticle', 'Article', 'BlogPosting', 'HowTo'].includes(t) && t !== 'HowTo'))
  const crumbs = items.filter((i) => typeOf(i).includes('BreadcrumbList'))
  const faqs = items.filter((i) => typeOf(i).includes('FAQPage'))
  if (items.some((i) => typeOf(i).includes('HowTo'))) report('jsonld.deprecated-type', p.rel, 'HowTo')

  // Hubs (section pages) are link lists, not articles (SEO.md §3.7).
  if (p.indexable && !isHome(p.rel) && p.docType !== 'hub') {
    if (!articles.length) report('jsonld.article-missing', p.rel)
    if (!crumbs.length) report('jsonld.breadcrumb-missing', p.rel)
  }
  for (const a of articles) {
    for (const f of ['headline', 'description', 'inLanguage', 'dateModified', 'author', 'publisher', 'image']) if (a[f] === undefined) report('jsonld.article-field', p.rel, f)
    for (const f of ['dateModified', 'datePublished']) if (a[f] !== undefined && (typeof a[f] !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(a[f]) || Number.isNaN(Date.parse(a[f])))) report('jsonld.date-invalid', p.rel, `${f}=${a[f]}`)
    const url = typeof a.mainEntityOfPage === 'string' ? a.mainEntityOfPage : a.mainEntityOfPage?.['@id'] || a.url
    if (url && p.canonicals[0] && url !== p.canonicals[0]) report('jsonld.article-url', p.rel, url)
  }
  for (const c of crumbs) {
    const list = c.itemListElement
    if (!Array.isArray(list) || !list.length) { report('jsonld.breadcrumb-invalid', p.rel, 'empty itemListElement'); continue }
    list.forEach((li, i) => {
      if (li.position !== i + 1) report('jsonld.breadcrumb-invalid', p.rel, `position ${li.position} at index ${i}`)
      if (!li.name) report('jsonld.breadcrumb-invalid', p.rel, `item ${i + 1} has no name`)
      const item = typeof li.item === 'string' ? li.item : li.item?.['@id']
      if (!item) { if (i !== list.length - 1) report('jsonld.breadcrumb-invalid', p.rel, `item ${i + 1} has no URL`); return }
      if (!/^https:\/\//.test(item)) { report('jsonld.breadcrumb-invalid', p.rel, `relative URL ${item}`); return }
      const r = resolve(item, p.url)
      if (r.kind === 'page') { const tp = pages.get(r.rel); if (!tp.indexable) report('jsonld.breadcrumb-bad-item', p.rel, item) }
      else if (r.kind === 'missing') report('jsonld.breadcrumb-bad-item', p.rel, item)
    })
  }
  const visible = norm(visibleText)
  for (const f of faqs) {
    const qs = [].concat(f.mainEntity || [])
    if (!qs.length) { report('jsonld.faq-invalid', p.rel, 'no mainEntity'); continue }
    for (const q of qs) {
      if (!q.name || !q.acceptedAnswer?.text) { report('jsonld.faq-invalid', p.rel, `question without name/answer`); continue }
      if (!visible.includes(norm(textOf(String(q.name))))) report('jsonld.faq-not-visible', p.rel, String(q.name).slice(0, 60))
    }
  }
}

// ---------------------------------------------------------------- baseline

const baselineRows = []
if (!opts.internal) {
  if (!opts.baseline || !fs.existsSync(opts.baseline)) report('baseline.missing-file', '-', opts.baseline || '(none)')
  else {
    const baseline = readJson(opts.baseline)
    for (const row of baseline) {
      const r = resolve(row.url, SITE + BASE)
      const rel = r.rel
      const p = r.kind === 'page' ? pages.get(rel) : null
      let status, finalPage = null
      if (!p) { status = 'lost'; report('baseline.lost', row.url) }
      else if (!p.isStub) { status = p.noindex ? 'noindex' : 'ok'; finalPage = p; if (p.noindex) report('baseline.noindexed', rel) }
      else {
        const f = follow(rel)
        if (!f.final) { status = 'stub-broken'; report('baseline.stub-broken', row.url) }
        else {
          finalPage = f.final
          status = f.hops > 1 ? 'chain' : 'moved'
          if (f.hops > 1) report('baseline.chain', row.url, `${f.hops} hops to ${f.final.rel}`)
          report('baseline.moved', rel, `-> ${f.final.rel}`)
        }
      }
      if (finalPage && row.title) {
        const phrase = primaryPhrase(row.title)
        if (phrase) {
          // An English-titled old page that now lands on a zh page is judged by the zh page's
          // English twin, which carries the same topic in the old page's language.
          const crossLang = !CJK_RE.test(phrase) && !isEn(finalPage.rel) && pages.get(counterpartOf(finalPage.rel))?.indexable
          CJK_RE.lastIndex = 0
          const judged = crossLang ? pages.get(counterpartOf(finalPage.rel)) : finalPage
          const has = (p) => ({
            title: norm(p.title || '').includes(norm(phrase)),
            body: p.headings.some((h) => norm(h.text).includes(norm(phrase))) || norm(leadOf(p)).includes(norm(phrase)),
          })
          const { title: inTitle, body: inBody } = has(judged)
          if (!inTitle) {
            if (status === 'ok' || status === 'noindex') report(inBody ? 'baseline.title-changed' : 'baseline.title-drift', finalPage.rel, `"${phrase}" not in title "${finalPage.title}"`)
            else if (!inBody) report('baseline.topic-lost', rel, `"${phrase}" not in ${judged.rel}`)
          }
        }
      }
      baselineRows.push({ url: row.url, status, final: finalPage?.rel || null })
    }
  }
}

// Leaks: published text of every page, every .md/.txt file served from the docs root, and the
// docs source (the repository is public). The intranet build legitimately names the organization
// and its hosts, so only credentials are checked there. Matches are masked unless --reveal, so a
// public CI log never repeats what it found.
{
  let deny = []
  if (!opts.internal) {
    if (process.env.SEO_CHECK_DENYLIST_TERMS) deny = process.env.SEO_CHECK_DENYLIST_TERMS.split(/[,\n]/)
    else if (opts.denylist && fs.existsSync(opts.denylist)) deny = fs.readFileSync(opts.denylist, 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*/, ''))
    deny = deny.map((t) => t.trim()).filter(Boolean)
    if (!deny.length) report('privacy.no-denylist', '-', 'set SEO_CHECK_DENYLIST_TERMS or --denylist')
  }
  const patterns = opts.internal ? LEAK_PATTERNS.filter(([rule]) => rule === 'privacy.secret') : LEAK_PATTERNS
  const denyRe = deny.length ? new RegExp(deny.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi') : null
  const sources = []
  for (const p of pages.values()) sources.push([p.rel, textOf(p.body) + ' ' + p.metas.map((m) => m.content || '').join(' ')])
  for (const rel of allFiles) if (/\.(md|txt)$/i.test(rel)) sources.push([rel, fs.readFileSync(path.join(DIST, rel), 'utf8')])
  if (!opts.internal && opts.src && fs.existsSync(opts.src)) {
    ;(function walk(dir) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', 'dist', 'cache', '.internal', '.git'].includes(ent.name)) continue
        const abs = path.join(dir, ent.name)
        if (ent.isDirectory()) walk(abs)
        else if (/\.(md|mts|ts|vue|json|ya?ml|txt)$/i.test(ent.name)) sources.push([`src:${path.relative(opts.src, abs).split(path.sep).join('/')}`, fs.readFileSync(abs, 'utf8')])
      }
    })(opts.src)
  }
  // A table row right after a paragraph line, or a table with no |---| row, renders as literal pipes.
  for (const [rel, text] of sources) {
    if (!rel.startsWith('src:') || rel.startsWith('src:public/') || !rel.endsWith('.md')) continue
    const lines = text.split('\n')
    let fence = false
    const isRow = (l) => /^\|.*\|\s*$/.test(l)
    lines.forEach((l, i) => {
      if (/^\s*(```|~~~)/.test(l)) { fence = !fence; return }
      if (fence || !isRow(l)) return
      const prev = i > 0 ? lines[i - 1] : ''
      if (prev.trim() && !prev.trimStart().startsWith('|')) report('content.table-broken', `${rel}:${i + 1}`, 'row follows a paragraph line without a blank line')
      else if (!prev.trim() && !/^\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) report('content.table-broken', `${rel}:${i + 1}`, 'table has no separator row')
    })
    fence = false
    lines.forEach((l, i) => {
      if (/^\s*(```|~~~)/.test(l)) { fence = !fence; return }
      if (fence) return
      for (const m of l.matchAll(/`((?:GET|POST|PUT|PATCH|DELETE) \/[^`]*?[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef][^`]*)`/g)) {
        report('content.code-span-cjk', `${rel}:${i + 1}`, `\`${m[1].slice(0, 60)}\``)
      }
    })
  }
  const mask = (s) => (opts.reveal ? s : s.length <= 4 ? '*'.repeat(s.length) : `${s.slice(0, 2)}${'*'.repeat(Math.min(8, s.length - 3))}${s.slice(-1)}`)
  const seen = new Set()
  const hit = (rule, rel, s, label) => {
    const key = `${rule}|${rel}|${s}`
    if (seen.has(key)) return
    seen.add(key)
    report(rule, rel, label || `"${mask(s)}"`)
  }
  for (const [rel, text] of sources) {
    if (denyRe) {
      for (const m of text.matchAll(denyRe)) {
        const idx = deny.findIndex((t) => t.toLowerCase() === m[0].toLowerCase())
        hit('privacy.denylist', rel, m[0].toLowerCase(), opts.reveal ? `"${m[0]}"` : `denylist term #${idx + 1}`)
      }
    }
    for (const [rule, re] of patterns) {
      for (const m of text.matchAll(re)) {
        if ((rule === 'privacy.im-id' || rule === 'privacy.secret') && PLACEHOLDER_RE.test(m[0])) continue
        if (rule === 'privacy.email' && ALLOW_EMAILS.has(m[0].toLowerCase())) continue
        hit(rule, rel, m[0])
      }
    }
  }
  if (!opts.internal) for (const p of pages.values()) {
    for (const block of p.body.matchAll(/<pre\b[\s\S]*?<\/pre>/gi)) {
      for (const m of textOf(block[0]).matchAll(/\bhttps?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
        const host = m[1].toLowerCase()
        if (!CODE_HOST_ALLOW.test(host) && !EXTRA_CODE_HOSTS.some((h) => host === h || host.endsWith('.' + h))) hit('privacy.code-host', p.rel, host, host)
      }
    }
  }
}

// url-map.json: kept URLs are real pages, redirects point exactly where the map says.
if (opts.urlMap && fs.existsSync(opts.urlMap) && !opts.internal) {
  const map = readJson(opts.urlMap)
  for (const e of map.entries || []) {
    const r = resolve(e.from, SITE + BASE)
    const p = r.kind === 'page' ? pages.get(r.rel) : null
    if (e.status === 'kept') {
      if (!p || p.isStub) report('urlmap.kept-not-page', e.from, p ? 'is a stub' : 'missing')
      continue
    }
    if (!p) continue // reported as baseline.lost
    if (!p.isStub) { report('urlmap.pending', r.rel, `-> ${e.to}`); continue }
    const t = stubTarget(p)
    const got = t.target && t.target.kind === 'page' ? pageUrlOf(t.target.rel) + (t.target.hash ? `#${t.target.hash}` : '') : t.href
    const want = (() => { const w = resolve(e.to, SITE + BASE); return w.kind === 'page' ? pageUrlOf(w.rel) + (w.hash ? `#${w.hash}` : '') : e.to })()
    if (got !== want) report('urlmap.target-mismatch', r.rel, `stub -> ${got}, map -> ${want}`)
  }
  for (const a of map.requiredAnchors || []) {
    const r = resolve(a.page, SITE + BASE)
    for (const rel of r.kind === 'page' ? [r.rel, isEn(r.rel) ? null : counterpartOf(r.rel)].filter(Boolean) : []) {
      const p = pages.get(rel)
      if (p && !p.isStub && !p.ids.has(a.anchor)) report('urlmap.anchor-missing', rel, `#${a.anchor}`)
    }
  }
}

function leadOf(p) {
  const afterH1 = p.main.split(/<\/h1>/i)[1] || ''
  const m = afterH1.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)
  return m ? textOf(m[1]) : ''
}

// Primary phrase of an indexed title: the first segment before a separator, minus the brand.
function primaryPhrase(title) {
  const parts = title.split(/\s+[|\-—–]\s+|[：:|]/).map((s) => s.trim())
    .filter((s) => s && !/^halo(\s+ai)?$/i.test(s) && !/^(第[零一二三四五六七八九十百\d]+章|chapter\s*\d+|part\s*\d+)$/i.test(s))
  const first = parts[0] || ''
  return first.length >= 2 ? first : null
}

// ---------------------------------------------------------------- output

// --only keeps findings for pages under the given prefixes (source files as src:<prefix>);
// site-wide findings are dropped so a writer sees only their batch.
const pageOf = (f) => {
  const p = String(f.page)
  return p.startsWith(SITE + BASE) ? p.slice((SITE + BASE).length) : p.replace(/^src:/, '')
}
const shown = opts.only ? findings.filter((f) => opts.only.some((pre) => pageOf(f).startsWith(pre))) : findings
const order = { error: 0, warn: 1, info: 2 }
const byRule = new Map()
for (const f of shown) {
  if (!byRule.has(f.rule)) byRule.set(f.rule, [])
  byRule.get(f.rule).push(f)
}
const counts = { error: 0, warn: 0, info: 0 }
for (const f of shown) counts[f.level]++

const lines = []
const out = (s = '') => lines.push(s)
const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
out(`Halo docs SEO/GEO check  ${stamp}`)
if (opts.label) out(`build:     ${opts.label}`)
out(`dist:      ${DIST}`)
out(`baseline:  ${opts.baseline || '-'}`)
out(`site root: ${opts.siteRoot || '- (links outside /docs/ not checked)'}`)
out(`mode:      ${opts.internal ? 'internal (intranet) build' : 'public build'}${opts.only ? `, only ${opts.only.join(', ')}` : ''}`)
out()
const noindexCount = [...pages.values()].filter((p) => p.noindex && !p.isStub).length
out(`Pages: ${pages.size} HTML files = ${indexable.length} indexable, ${stubs.length} redirect stubs, ${noindexCount} noindex, ${pages.has('404.html') ? 1 : 0} 404`)
out(`       zh ${indexable.filter((p) => !isEn(p.rel)).length} / en ${indexable.filter((p) => isEn(p.rel)).length} indexable; zh pages with an en counterpart: ${indexable.filter((p) => !isEn(p.rel) && pages.get(counterpartOf(p.rel))?.indexable).length}`)
out(`Sitemap: ${sitemap.size} URLs   Findings: ${counts.error} errors, ${counts.warn} warnings, ${counts.info} info`)
out()

const ruleIds = [...byRule.keys()].sort((a, b) => order[RULES[a][0]] - order[RULES[b][0]] || byRule.get(b).length - byRule.get(a).length || a.localeCompare(b))
for (const level of ['error', 'warn', 'info']) {
  const ids = ruleIds.filter((id) => RULES[id][0] === level)
  if (!ids.length) continue
  out(`${'='.repeat(78)}\n${level.toUpperCase()}S (${ids.reduce((n, id) => n + byRule.get(id).length, 0)})\n${'='.repeat(78)}`)
  for (const id of ids) {
    const list = byRule.get(id)
    const limit = list.length <= opts.fullUnder ? list.length : opts.maxList
    out(`[${id}] ${list.length} - ${RULES[id][1]}`)
    for (const f of list.slice(0, limit)) out(`    ${f.page}${f.msg ? '  ' + f.msg : ''}`)
    if (list.length > limit) out(`    ... +${list.length - limit} more (all in --json)`)
  }
  out()
}

out('='.repeat(78))
out('SUMMARY TABLES')
out('='.repeat(78))
if (baselineRows.length) {
  const by = {}
  for (const r of baselineRows) by[r.status] = (by[r.status] || 0) + 1
  out(`Baseline URLs: ${baselineRows.length} -> ${Object.entries(by).map(([k, v]) => `${v} ${k}`).join(', ')}`)
}
const heavy = indexable.filter((p) => p.weight).sort((a, b) => b.weight - a.weight).slice(0, 10)
out('Heaviest first visits (HTML + same-origin CSS/JS/fonts + images):')
for (const p of heavy) out(`    ${(p.weight / 1024).toFixed(0).padStart(6)} KB  ${p.rel}`)
const sec = {}
for (const p of indexable) {
  const s = p.rel.split('/').slice(0, isEn(p.rel) ? 2 : 1).join('/').replace(/\.html$/, '')
  sec[s] = sec[s] || { n: 0, units: 0 }
  sec[s].n++
  sec[s].units += p.textUnits || 0
}
out('Indexable pages per section (pages / avg text units):')
for (const [s, v] of Object.entries(sec).sort()) out(`    ${s.padEnd(28)} ${String(v.n).padStart(3)}  ${String(Math.round(v.units / v.n)).padStart(6)}`)
out()
out(`RESULT: ${counts.error ? 'FAIL' : 'PASS'} (${counts.error} errors, ${counts.warn} warnings)`)

console.log(lines.join('\n'))
if (opts.json) {
  fs.writeFileSync(opts.json, JSON.stringify({ generated: stamp, dist: DIST, only: opts.only || null, counts, pages: pages.size, indexable: indexable.length, stubs: stubs.length, baseline: baselineRows, findings: shown }, null, 2))
}
process.exit(counts.error ? 1 : 0)
