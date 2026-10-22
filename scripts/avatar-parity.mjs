#!/usr/bin/env node
/**
 * avatar-parity.mjs — keep the site's avatar generator identical to the app's.
 *
 * The avatar page draws Halo's digital-human face with its own port of the
 * boring-avatars `beam` variant (docs-src/.vitepress/theme/lib/halo-avatar.ts).
 * "Same name, same face" only holds while that port matches what the app
 * renders, so docs-src/.vitepress/data/avatar-golden.json records what the real
 * library draws for a fixed set of names and the build compares the port to it.
 *
 *   node scripts/avatar-parity.mjs --check          compare the port with the record (default)
 *   node scripts/avatar-parity.mjs --record <app>   re-record from the app checkout at <app>
 *
 * Needs Node 22.18+ (it imports the TypeScript port directly); --record also
 * needs the app's node_modules (boring-avatars, react, react-dom).
 * Re-record whenever the app changes its boring-avatars version, palette or variant.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const GOLDEN = join(ROOT, 'docs-src', '.vitepress', 'data', 'avatar-golden.json')
const PORT = join(ROOT, 'docs-src', '.vitepress', 'theme', 'lib', 'halo-avatar.ts')
const APP_AVATAR = 'src/renderer/components/apps/AutomationAvatar.tsx'

// Recorded and compared at one size; the mask id is a placeholder because the
// library derives it from React's useId and the site picks its own.
const SIZE = 64
const MASK = 'ID'
const SQUARE_CASES = 24

async function loadPort() {
  try {
    return await import(pathToFileURL(PORT).href)
  } catch (error) {
    console.error(`Cannot load ${PORT}: ${error.message}\nThis check imports TypeScript directly and needs Node 22.18 or newer (running ${process.version}).`)
    process.exit(2)
  }
}

// Names that exercise the hash: empty, whitespace, CJK, accents, emoji and surrogate pairs, long input,
// plus a fixed pseudo-random mix so the record covers more than hand-picked cases.
function caseNames() {
  const fixed = [
    'Alex halo 分身', 'Halo AI 团队', 'digital-human', '每日资讯简报', 'Daily News Brief', 'a', 'A', '0', '数', ' ', '',
    ' padded ', 'tab\there', 'line\nbreak', 'Café Müller', '🚀', '👩‍💻 Dev', '𠮷野家', 'x'.repeat(300), '日本語のなまえ', 'Ünïcödé',
  ]
  let seed = 20260101
  const next = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32)
  const pools = [
    [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_.'],
    [...'数字人分身团队每日资讯简报研究员助理写作报告测试飞书企业微信'],
    [...'éüñßøåçÀÉÎÕÜ—–“”‘’…·'],
    ['😀', '🧠', '🇨🇳', '🏳️‍🌈'],
  ]
  const random = Array.from({ length: 80 }, () => {
    let name = ''
    for (let i = 1 + Math.floor(next() * 30); i > 0; i--) {
      const pool = pools[Math.floor(next() * pools.length)]
      name += pool[Math.floor(next() * pool.length)]
    }
    return name
  })
  return [...fixed, ...random]
}

function readAppConfig(appDir) {
  const source = readFileSync(join(appDir, APP_AVATAR), 'utf-8')
  const colors = [...(/AVATAR_COLORS\s*=\s*\[([^\]]*)\]/.exec(source)?.[1] ?? '').matchAll(/'(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1])
  const usage = /<Avatar\b[^>]*\/>/.exec(source)?.[0] ?? ''
  if (colors.length === 0) throw new Error(`no AVATAR_COLORS found in ${APP_AVATAR}`)
  // The port draws exactly this call; anything more (title, square, another variant) must be ported first.
  if (!/\bvariant="beam"/.test(usage) || /\b(square|title)\b/.test(usage)) {
    throw new Error(`${APP_AVATAR} no longer renders a plain beam avatar (${usage}); update the port before recording`)
  }
  return colors
}

function record(appDir) {
  const app = resolve(appDir)
  const colors = readAppConfig(app)
  const requireApp = createRequire(join(app, 'package.json'))
  const React = requireApp('react')
  const { renderToStaticMarkup } = requireApp('react-dom/server')
  const library = requireApp('boring-avatars')
  const Avatar = library.default ?? library
  const { version } = JSON.parse(readFileSync(join(app, 'node_modules', 'boring-avatars', 'package.json'), 'utf-8'))
  const pinned = JSON.parse(readFileSync(join(app, 'package.json'), 'utf-8')).dependencies?.['boring-avatars']
  if (pinned !== version) throw new Error(`the app pins boring-avatars "${pinned}" but ${version} is installed; faces would drift on the next upgrade`)

  const draw = (name, square) => {
    const svg = renderToStaticMarkup(React.createElement(Avatar, { size: SIZE, name, variant: 'beam', colors, square }))
    const id = /<mask id="([^"]*)"/.exec(svg)?.[1]
    return svg.split(id).join(MASK)
  }
  const cases = caseNames().map((name, index) => ({
    name,
    round: draw(name, false),
    ...(index < SQUARE_CASES ? { square: draw(name, true) } : {}),
  }))
  writeFileSync(GOLDEN, JSON.stringify({ library: `boring-avatars@${version}`, variant: 'beam', colors, size: SIZE, maskId: MASK, cases }, null, 1) + '\n')
  console.log(`Recorded ${cases.length} names from boring-avatars@${version} (${colors.join(' ')}) into ${GOLDEN}`)
}

async function check() {
  if (!existsSync(GOLDEN)) {
    console.error(`${GOLDEN} is missing; record it with --record <app checkout>`)
    process.exit(1)
  }
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf-8'))
  const { haloAvatarSvg, HALO_AVATAR_COLORS } = await loadPort()
  const problems = []
  if (golden.colors.join() !== HALO_AVATAR_COLORS.join()) {
    problems.push(`palette differs: the app uses ${golden.colors.join(' ')}, the port ${HALO_AVATAR_COLORS.join(' ')}`)
  }
  let compared = 0
  for (const { name, round, square } of golden.cases) {
    for (const [expected, isSquare] of [[round, false], [square, true]]) {
      if (expected === undefined) continue
      compared++
      const actual = haloAvatarSvg(name, { size: golden.size, square: isSquare, maskId: golden.maskId })
      if (actual !== expected) problems.push(`${isSquare ? 'square' : 'round'} avatar for ${JSON.stringify(name)} differs from ${golden.library}\n  library: ${expected}\n  port:    ${actual}`)
    }
  }
  if (problems.length > 0) {
    console.error(`Avatar parity check failed (${problems.length} of ${compared}):\n${problems.slice(0, 5).join('\n')}`)
    process.exit(1)
  }
  console.log(`Avatar parity: ${compared} avatars match ${golden.library}`)
}

const args = process.argv.slice(2)
if (args[0] === '--record') {
  if (!args[1]) {
    console.error('usage: node scripts/avatar-parity.mjs --record <path to the app checkout>')
    process.exit(2)
  }
  record(args[1])
} else {
  await check()
}
