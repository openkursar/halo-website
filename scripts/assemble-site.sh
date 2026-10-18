#!/usr/bin/env bash
# Assemble the published site into dist/: the landing page at the root and the
# built VitePress docs under /docs/. Run after `npm run build` in docs-src.
# Shared by every host (GitHub Pages and Cloudflare) so they serve identical files.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
mkdir -p dist
cp index.html CNAME robots.txt sitemap.xml llms.txt dist/
cp -r assets dist/assets
cp -r docs-src/.vitepress/dist dist/docs
# GitHub Pages serves only a root 404.html; without it, unknown /docs/ URLs get
# GitHub's generic page. The docs 404 uses absolute /docs/ asset paths, so it
# works at the root too (the haloxe Worker already falls back to /docs/404.html).
cp docs-src/.vitepress/dist/404.html dist/404.html
