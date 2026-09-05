---
title: "Serverless Deployment (Knative)"
description: "Deploy Halo Server on a serverless function platform (Knative-based): repo build, environment variables, NFS persistent volume, resource sizing, and scaling caveats."
---
# Serverless Deployment (Knative)

This guide covers deploying Halo Server on a serverless function platform (Knative-based). The platform clones the `halo-server` repo and builds the image from its `Dockerfile` — the build is **offline and needs no network**.

---

## How it works

The `halo-server` repo is **self-contained and offline-buildable**. At build time the `Dockerfile`:

1. **Reassembles the app bundle** — the prebuilt linux-x64 Electron app is split into `<90MB` parts (`bundle/halo-bundle.tgz.part-*`, to survive the git host's per-file size limit); the build concatenates and extracts them to `/app/linux-unpacked`.
2. **Adds system libs** — the slim Debian base lacks the GTK/X11/nss libs Chromium/Electron need; they ship in the repo's `chromium-libs.tar.gz`, extracted to a dedicated dir and exposed via `LD_LIBRARY_PATH` (never into the system lib dirs).
3. **Installs fonts** — the slim base ships no fonts (text would render blank); the repo bundles a CJK font (WenQuanYi Micro Hei) plus `fonts.conf`.
4. **Sets runtime defaults** — `HALO_SERVER_MODE=1`, `PORT=8080`, `HALO_DATA_DIR=/tmp/.halo`, `HOME=/tmp`, and launches the main process with headless flags.

> The base image is the public `python:3.12-slim` (Debian 12 bookworm slim). To use an equivalent base image reachable from your own build environment, just change the `Dockerfile`'s `FROM` and make sure your build environment can pull it.

---

## Deployment steps

### 1. Point at the `halo-server` repo

In the platform's function / service creation UI, set the source to the `halo-server` git repo (HTTP or SSH URL + branch).

### 2. Enable Dockerfile build

Choose the "Dockerfile build" option, with the Dockerfile path set to `./Dockerfile` at the repo root. The platform clones and builds — no extra build args needed.

### 3. Set runtime environment variables

In the platform's environment-variable UI, set the following (see [Configuration](./configuration.md)):

| Env | Suggested value |
|---|---|
| `HALO_SERVER_MODE` | `1` |
| `HALO_DATA_DIR` | `/data` (points at the NFS mount in the next step) |
| `HALO_REMOTE_PASSWORD` | strong random token (`openssl rand -hex 32`) |
| `HALO_AI_PROVIDER` | your provider, e.g. `openai` |
| `HALO_AI_API_URL` | your enterprise model gateway URL |
| `HALO_AI_API_KEY` | gateway key |
| `HALO_AI_MODEL` | model name |

> `PORT` defaults to `8080`; if the platform requires a specific port, set `PORT` and route the platform to the same port.

### 4. Bind an NFS persistent volume to HALO_DATA_DIR

In the platform's storage / volume-mount config, create or select an NFS volume and mount it at `/data` inside the container, keeping `HALO_DATA_DIR=/data` consistent with it.

::: danger No mount means data loss
The default `HALO_DATA_DIR=/tmp/.halo` is wiped when the instance recycles. Production must mount an NFS volume and point `HALO_DATA_DIR` at the mount.
:::

### 5. Set resources

Halo Server runs a full Electron (Chromium) main process, so it has **meaningful memory needs**.

| Resource | Suggested |
|---|---|
| Memory | **≥ 4–8 GB** (real Electron/Chromium need; too low → OOM) |
| CPU | ≥ 2 cores |

Allocate generously to a **single** instance vertically, rather than spreading load across replicas (see scaling notes below).

### 6. Expose port 8080

Set the service's external port to the container's `8080` (or your `PORT`).

---

## Path prefix is handled automatically

The platform usually serves the service under a **path prefix** (e.g. `/fc-xxxx/`). Halo Server **detects and adapts to the reverse-proxy prefix automatically** — no app-level config. Just call the API at the prefixed URL the platform gives you.

---

## Concurrency & scaling (important)

::: danger This is a stateful single instance — do not horizontal-scale
Halo Server's state is the combination of **SQLite + local files + in-memory sessions**, all bound to a single instance.
:::

- **Do not horizontal-scale**: multiple pods each hold independent state, causing split state and inconsistency; multiple instances writing the same SQLite file on NFS will also corrupt the database. Cap max instances at **1**.
- **Scale vertically**: handle higher load by giving the single instance more CPU / memory, not by adding replicas.
- **Scale-to-zero cold start = re-initialization**: when woken after scaling to zero, the process starts fresh as a **re-init** — in-memory sessions are lost (persistent data is restored from NFS), and Electron has a noticeable cold-start time. For latency-sensitive use, **disable scale-to-zero** and keep at least one warm instance.

---

## Verify

After deploying, hit the public status endpoint at the platform's service URL (including the path prefix) to check liveness:

```bash
curl https://<platform-domain>/fc-xxxx/api/remote/status
# => {"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

Then validate the token works:

```bash
curl -X POST https://<platform-domain>/fc-xxxx/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<HALO_REMOTE_PASSWORD>"}'
# => {"success":true}
```

If the build fails, first check that the base image is reachable and that the build environment has enough disk to hold the reassembled app bundle.
