---
title: "Build Your Own Image & How It Works"
description: "Build the Halo Server deploy bundle yourself from Halo source (to rebrand, swap the provider, or track the latest source), plus how the headless server works."
---
# Build Your Own Image & How It Works

Halo does not publish a ready-made server image, so a deployment starts by generating the app bundle from source once (one command). Regenerate it whenever you want to **rebrand, swap the built-in provider, or track the latest Halo source**.

---

## Prerequisites

Only the Halo repository is needed: the deployment files live in its `deploy/server/` directory (`Dockerfile`, entrypoint script, `docker-compose.yml`), and the generated bundle is written there too.

- A Node environment (matching `hello-halo`'s `package.json` requirements); run `npm ci` first.
- On restricted networks, set the Electron download mirrors: `ELECTRON_MIRROR`, `ELECTRON_BUILDER_BINARIES_MIRROR`.

---

## One command to generate the bundle

From the `hello-halo` directory:

```bash
npm run build:server
```

It runs, in order:

1. **Activates the server profile** — temporarily switches in `server.product.json` (brand-neutral, API-key auth only, because OAuth cannot complete headless). **On exit — success, failure, or interrupt — it always restores `product.json`**, leaving the working tree unmodified.
2. **Prepares linux native dependencies** and builds the app (`electron-vite`).
3. **Cross-builds the linux-x64 headless app** (`electron-builder --linux dir --x64`).
4. **Compresses and splits** — tars the output, splits it into `<90MB` parts written to `deploy/server/bundle/` (so it fits in a git repository), then runs an integrity check on the rejoined size.

> Output defaults to `deploy/server/`. To write somewhere else (your own deploy repository, for example): `bash scripts/build-server-halo.sh /path/to/dir` — that directory needs a `Dockerfile` (copy it from `deploy/server/`).

---

## Assemble the image and run

Once the bundle is generated, build and run the image (same as the [Quickstart](./)):

```bash
docker build -t halo-server deploy/server
docker run -d -p 8080:8080 -e HALO_REMOTE_PASSWORD=set-your-own-token halo-server
```

`deploy/server/bundle/` is not committed to the Halo repository. If you maintain your own deploy repository (for example so a function platform can build from git), commit the files of `deploy/server/` together with `bundle/` there.

---

## Customize

The `server.product.json` used for the build is **brand-neutral by default**. To change the brand name, data directory, built-in provider, etc., edit that file (field meanings are in `product.schema.json`). For fuller enterprise customization (branding, SSO, security policy), see the enterprise deployment guide in the Halo main repo.

---

## How it works

Halo Server is the same application as desktop Halo, in a different runtime shape:

```
┌─────────────────────────────────────────────┐
│  Linux container (Knative Pod / Docker)       │
│                                               │
│   Halo Electron main process (headless)       │
│   HALO_SERVER_MODE=1                          │
│        │                                      │
│        ├── HTTP API          ──┐              │
│        ├── WebSocket (stream)  ├─►  :8080     │
│        │                       │   (PORT)     │
│        └── data / SQLite ──► HALO_DATA_DIR     │
│                                  (mounted vol) │
└───────────────────┬───────────────────────────┘
                    │  platform routing (often path prefix /fc-xxxx/)
                    ▼
            enterprise network / API callers
```

**Headless launch**: in server mode (`HALO_SERVER_MODE=1`) the main process launches headless with the following flags, opening no window:

```
--ozone-platform=headless --no-sandbox --disable-gpu --disable-dev-shm-usage
```

**Reverse-proxy prefix auto-adaptation**: platforms usually serve the app under a path prefix (e.g. `/fc-xxxx/`). Halo Server **detects and adapts to the reverse-proxy prefix automatically** — no app-level config needed; just call the API at the prefixed URL the platform gives you.

**Single-instance model**: it is a **stateful, single-instance** service whose state is SQLite + local files + in-memory sessions. **Scale vertically** (more CPU / memory for the single instance), **do not horizontal-scale** — multiple instances each hold independent state and split your data, and multiple writers to one SQLite will corrupt it. See the scaling notes in [Function-platform deployment](./deployment-faas.md#concurrency-scaling-important).
