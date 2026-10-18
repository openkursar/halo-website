---
title: "Build your own image & how it works"
description: "Build your own Halo Server image from source to rebrand, change the built-in provider or follow the latest code, and see how the headless server works."
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Build your own image

Halo does not publish a ready-made server image, so a deployment starts by generating the app bundle from source once, with one command. Run it again whenever you want to rebrand, change the built-in provider or follow the latest Halo source.

## Before you start {#before-you-start}

Only the Halo repository is needed: the deployment files live in its `deploy/server/` folder (`Dockerfile`, entrypoint script, `docker-compose.yml`), and the generated bundle is written there too.

- Node.js in the version the Halo repository's `package.json` requires. Run `npm ci` first.
- On restricted networks, set the Electron download mirrors `ELECTRON_MIRROR` and `ELECTRON_BUILDER_BINARIES_MIRROR`.

## One command to generate the bundle {#build-bundle}

In the Halo repository folder, run:

```bash
npm run build:server
```

It runs, in order:

1. **Switches to the server profile**: temporarily uses `server.product.json` (brand-neutral, API-key sign-in only, because OAuth cannot complete headless). On exit, whether it succeeded, failed or was interrupted, it restores `product.json`, leaving the working tree unchanged.
2. **Prepares Linux native dependencies** and builds the app (`electron-vite`).
3. **Cross-builds the linux-x64 headless app** (`electron-builder --linux dir --x64`).
4. **Compresses and splits**: packs the output as `tar.gz`, splits it into parts under 90 MB in `deploy/server/bundle/` (so it fits in a git repository) and checks the size of the rejoined parts.

The output goes to `deploy/server/` by default. To write it elsewhere (your own deployment repository, for example), run `bash scripts/build-server-halo.sh /path/to/dir`; that folder needs a `Dockerfile` (copy it from `deploy/server/`).

## Build the image and run it {#image}

Once the bundle exists, build and run the image as in the [Halo Server quickstart](/en/server/):

```bash
docker build -t halo-server deploy/server
docker run -d -p 8080:8080 -e HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD> halo-server
```

Replace `<YOUR_ACCESS_PASSWORD>` with a random password of 8–64 characters.

`deploy/server/bundle/` is not committed to the Halo repository. If you keep your own deployment repository (for example so a function platform can build from git), commit the files of `deploy/server/` together with `bundle/` there.

## Customize {#customize}

The `server.product.json` used for the build is brand-neutral by default. To change the brand name, data folder, built-in provider and more, edit that file; `product.schema.json` explains each field. Fuller enterprise customization (branding, single sign-on, security policy) is described in the enterprise deployment guide in the Halo repository (`docs/enterprise-deployment.md`).

## How it works {#how-it-works}

Halo Server is the same application as desktop Halo, in a different runtime shape:

```text
┌──────────────────────────────────────────────┐
│  Linux container (Knative Pod or Docker)     │
│                                              │
│   Halo main process, headless                │
│   HALO_SERVER_MODE=1                         │
│        │                                     │
│        ├── HTTP API          ──┐             │
│        ├── WebSocket (live)    ├──►  :8080   │
│        │                       │    (PORT)   │
│        └── data and SQLite ──► HALO_DATA_DIR │
│                              (mounted volume)│
└───────────────────┬──────────────────────────┘
                    │  platform routing (often a path prefix)
                    ▼
             your network and API callers
```

**Headless launch**: in server mode (`HALO_SERVER_MODE=1`) the main process starts headless with these flags and opens no window:

```text
--ozone-platform=headless --no-sandbox --disable-gpu --disable-dev-shm-usage
```

**Path prefix**: platforms usually serve the app under a path prefix, such as `/fc-xxxx/`. The web app adapts to the prefix by itself; when calling the API, use the prefixed address the platform gives you as the base URL.

**Single-instance model**: Halo Server is a stateful, single-instance service whose state is SQLite, local files and in-memory sessions together. Scale up (more CPU and memory for the one instance), not out: several instances each hold their own state and split your data, and several writers to one SQLite file corrupt it. See [Serverless deployment](/en/server/deployment-faas#scaling) for scaling details.

## Next steps {#next-steps}

- [Deploy with Docker](/en/server/deployment-docker): run a container from the image
- [Halo Server configuration](/en/server/configuration): every environment variable
