# Generated developer data: refreshing it for an app release

Maintainer notes; this folder is outside `docs-src` and is never published.

The developer reference is generated from data that the Halo app repository exports. The exported data is committed in this repository, so building the docs never needs an app checkout. When Halo ships a release, check out that release's tag in the app repository (`<hello-halo>` below) and refresh everything from this repository's root (`<halo-release>`):

1. **HTTP API reference.** In `<hello-halo>`, run `node scripts/gen-api-ref.mjs --check --export-json <halo-release>/docs-src/developers/api/_data/api.json`. Then, in `<halo-release>`, run `node scripts/gen-api-docs.mjs --report /tmp/api-report.md`. The report lists stale overlay entries: the app changed an operation's text after the rewrite or translation in `docs-src/developers/api/_data/overlay.json` was written. Revise each one and copy in the new `source` hash from the report.
2. **Digital Human spec reference.** In `<hello-halo>`, run `node scripts/gen-spec-ref.mjs --export-json <halo-release>/docs-src/developers/digital-humans/_data/spec.json`. Then, in `<halo-release>`, run `node scripts/gen-spec-docs.mjs`. It fills the marked tables in `developers/digital-humans/spec` (zh, en) and in `public/ai-guides/create-digital-human/spec-reference.md`, and warns about missing or stale entries in `docs-src/developers/digital-humans/_data/spec-overlay.json`. `--hashes` prints the current hash of every field. Recheck a field's `status` (`schema-only`, `no-producer`) whenever the app starts reading that field.
3. **Changelog.** In `<halo-release>`, run `node scripts/gen-changelog.mjs --sync <hello-halo>`.
4. **Offline AI guides.** In `<hello-halo>`, run `node scripts/sync-ai-guides.mjs <halo-release>/docs-src/public/ai-guides`. Pass the path explicitly: the script's default source (`../halo-website/...`) does not match this repository.
5. **Build.** In `<halo-release>/docs-src`, run `npm run build`. It runs every `--check` (API pages, spec tables, changelog, glossary) before VitePress, so stale generated output fails the build.

Both export scripts only read the app's sources: `gen-api-ref.mjs --export-json` never changes `resources/api-ref/`, and `gen-spec-ref.mjs` writes nothing but the file you name.
