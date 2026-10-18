import fs from 'node:fs'
import path from 'node:path'
import type { DefaultTheme } from 'vitepress'
import { srcDir } from './edition'

// Product words the generic Chinese segmenter splits apart (数字人 → 数字 + 人).
// Taken from the glossary so search and the docs use the same vocabulary.
function productTerms(): string[] {
  const glossary = JSON.parse(fs.readFileSync(path.join(srcDir, '.vitepress', 'data', 'glossary.json'), 'utf-8'))
  const terms = new Set<string>(['飞书', '企业微信', '微信', '钉钉', '浏览器', '终端', '截图', '提供商'])
  for (const t of glossary.terms) {
    for (const piece of String(t.zh).split(/[\s/（）()、]+/)) if (/^[\u3400-\u9fff]{2,}$/.test(piece)) terms.add(piece)
    for (const u of t.ui) for (const piece of String(u.zh).split(/[\s·/（）()、]+/)) if (/^[\u3400-\u9fff]{2,6}$/.test(piece)) terms.add(piece)
  }
  return [...terms].sort((a, b) => b.length - a.length)
}

// VitePress serializes this function into the client bundle, so it is built
// with `new Function` to carry the term list inside its own source text.
// Chinese runs are split with Intl.Segmenter (MiniSearch only splits on spaces)
// and also emit any product term they contain.
const tokenize = new Function(
  'text',
  `const TERMS = ${JSON.stringify(productTerms())};
  const out = [];
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('zh', { granularity: 'word' }) : null;
  for (const part of String(text).toLowerCase().split(/[\\s\\p{P}\\p{S}]+/u)) {
    if (!part) continue;
    if (/[\\u3400-\\u9fff]/.test(part)) {
      for (const term of TERMS) if (part.includes(term)) out.push(term);
      if (seg) { for (const s of seg.segment(part)) if (s.isWordLike) out.push(s.segment); }
      else out.push(part);
    } else {
      out.push(part);
    }
  }
  return out;`
) as (text: string) => string[]

export const search: DefaultTheme.Config['search'] = {
  provider: 'local',
  options: {
    miniSearch: {
      options: { tokenize },
      searchOptions: { prefix: true, fuzzy: 0.1, boost: { title: 4, text: 2, titles: 1 } },
    },
    locales: {
      root: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关结果',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
      en: {
        translations: {
          button: { buttonText: 'Search docs', buttonAriaLabel: 'Search docs' },
        },
      },
    },
  },
}
