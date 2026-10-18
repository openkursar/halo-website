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
