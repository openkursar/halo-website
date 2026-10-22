/**
 * Halo digital-human avatar: a dependency-free port of the `beam` variant of
 * boring-avatars 2.0.4. It reproduces what Halo draws for a digital human
 * (src/renderer/components/apps/AutomationAvatar.tsx in the app), so the same
 * name gives the same face on this site and in the app.
 *
 * Only erasable TypeScript syntax: scripts/check-avatar-parity.mjs runs this
 * file directly in Node and compares it with recorded library output.
 *
 * The face-generation logic below is derived from boring-avatars:
 *
 * MIT License
 *
 * Copyright (c) 2021 boringdesigners
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** Must equal AVATAR_COLORS in the app's AutomationAvatar.tsx, or faces differ. */
export const HALO_AVATAR_COLORS = ['#84B9EF', '#6C8EBF', '#3D5A80', '#98C1D9', '#E0FBFC'] as const

export interface HaloAvatarOptions {
  /** Rendered width and height in pixels. */
  size: number
  /** Full-bleed square instead of the round avatar the app shows. */
  square?: boolean
  /** Id of the SVG mask; must be unique among the avatars on one page. */
  maskId: string
}

// The face is drawn on a 36 x 36 canvas.
const BOX = 36

// Java-style string hash over UTF-16 code units, folded to a non-negative 32-bit integer.
function hashCode(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function digit(number: number, position: number): number {
  return Math.floor((number / Math.pow(10, position)) % 10)
}

function isEven(number: number, position: number): boolean {
  return !(digit(number, position) % 2)
}

// A value in [0, range), negated when the digit at `negateAt` is even.
function unit(number: number, range: number, negateAt?: number): number {
  const value = number % range
  return negateAt && digit(number, negateAt) % 2 === 0 ? -value : value
}

function pick(number: number, colors: readonly string[]): string {
  return colors[number % colors.length]
}

// Black or white, whichever reads better on the given #RRGGBB background.
function contrastColor(hex: string): string {
  const color = hex.startsWith('#') ? hex.slice(1) : hex
  const red = parseInt(color.slice(0, 2), 16)
  const green = parseInt(color.slice(2, 4), 16)
  const blue = parseInt(color.slice(4, 6), 16)
  return (red * 299 + green * 587 + blue * 114) / 1000 >= 128 ? '#000000' : '#FFFFFF'
}

function beamFace(name: string, colors: readonly string[]) {
  const hash = hashCode(name)
  const wrapperColor = pick(hash, colors)
  const shiftX = unit(hash, 10, 1)
  const shiftY = unit(hash, 10, 2)
  const wrapperTranslateX = shiftX < 5 ? shiftX + BOX / 9 : shiftX
  const wrapperTranslateY = shiftY < 5 ? shiftY + BOX / 9 : shiftY
  return {
    wrapperColor,
    faceColor: contrastColor(wrapperColor),
    backgroundColor: pick(hash + 13, colors),
    wrapperTranslateX,
    wrapperTranslateY,
    wrapperRotate: unit(hash, 360),
    wrapperScale: 1 + unit(hash, BOX / 12) / 10,
    isMouthOpen: isEven(hash, 2),
    isCircle: isEven(hash, 1),
    eyeSpread: unit(hash, 5),
    mouthSpread: unit(hash, 3),
    faceRotate: unit(hash, 10, 3),
    faceTranslateX: wrapperTranslateX > BOX / 6 ? wrapperTranslateX / 2 : unit(hash, 8, 1),
    faceTranslateY: wrapperTranslateY > BOX / 6 ? wrapperTranslateY / 2 : unit(hash, 7, 2),
  }
}

/**
 * SVG markup of the avatar for `name`, byte-identical to what boring-avatars
 * 2.0.4 renders for `variant="beam"` with HALO_AVATAR_COLORS (the mask id aside).
 * `name` only feeds the hash and never reaches the markup.
 */
export function haloAvatarSvg(name: string, { size, square = false, maskId }: HaloAvatarOptions): string {
  const f = beamFace(name, HALO_AVATAR_COLORS)
  const mid = BOX / 2
  const maskRadius = square ? '' : ` rx="${BOX * 2}"`
  const mouth = f.isMouthOpen
    ? `<path d="M15 ${19 + f.mouthSpread}c2 1 4 1 6 0" stroke="${f.faceColor}" fill="none" stroke-linecap="round"></path>`
    : `<path d="M13,${19 + f.mouthSpread} a1,0.75 0 0,0 10,0" fill="${f.faceColor}"></path>`
  const eye = (x: number) =>
    `<rect x="${x}" y="14" width="1.5" height="2" rx="1" stroke="none" fill="${f.faceColor}"></rect>`

  return (
    `<svg viewBox="0 0 ${BOX} ${BOX}" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${BOX}" height="${BOX}">` +
    `<rect width="${BOX}" height="${BOX}"${maskRadius} fill="#FFFFFF"></rect></mask>` +
    `<g mask="url(#${maskId})">` +
    `<rect width="${BOX}" height="${BOX}" fill="${f.backgroundColor}"></rect>` +
    `<rect x="0" y="0" width="${BOX}" height="${BOX}" transform="translate(${f.wrapperTranslateX} ${f.wrapperTranslateY}) rotate(${f.wrapperRotate} ${mid} ${mid}) scale(${f.wrapperScale})" fill="${f.wrapperColor}" rx="${f.isCircle ? BOX : BOX / 6}"></rect>` +
    `<g transform="translate(${f.faceTranslateX} ${f.faceTranslateY}) rotate(${f.faceRotate} ${mid} ${mid})">` +
    mouth +
    eye(14 - f.eyeSpread) +
    eye(20 + f.eyeSpread) +
    `</g></g></svg>`
  )
}
