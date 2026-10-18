---
title: "Serverless deployment (Knative) of Halo Server"
description: "Deploy Halo Server on a Knative function platform: prepare the image, set variables, mount NFS, size resources and avoid scaling pitfalls."
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Serverless deployment (Knative)

Deploy Halo Server to a Knative-based serverless function platform. The image is built from the `Dockerfile` in `deploy/server/` of the Halo repository, as described in [Deploy with Docker](/en/server/deployment-docker#build-image).

## What the image does {#how-it-works}

At build time, `deploy/server/Dockerfile` does three things:

1. **Reassembles the app bundle**: the linux-x64 app produced by `npm run build:server` is split into parts under 90 MB (`bundle/halo-bundle.tgz.part-*`, so it fits in a git repository); the build joins them and unpacks them to `/app/linux-unpacked`.
2. **Installs system libraries and fonts**: the GTK, X11, nss and other libraries Chromium and Electron need, plus a CJK font (WenQuanYi Micro Hei). The slim base image has no fonts, so text would render blank without it.
3. **Sets runtime defaults**: `HALO_SERVER_MODE=1`, `PORT=8080` and `HOME=/tmp` (without `HALO_DATA_DIR`, data goes to `/tmp/.halo`), with tini starting the main process.

The base image is the public `python:3.12-slim-bookworm` (Debian 12). To use an equivalent image your environment can reach, change the `FROM` line and make sure the build environment can pull it.

## Steps {#steps}

### 1. Prepare the image {#image}

Pick one:

- **Push an image (recommended)**: build the image locally as in [Deploy with Docker](/en/server/deployment-docker#build-image), push it to a registry the platform can reach, and create the service from it.
- **Let the platform build from git**: put the files of `deploy/server/` together with the generated `bundle/` into a private git repository of your own (`bundle/` is already split into parts under 90 MB) and point the platform's code source at it. Choose the Dockerfile build with the path `./Dockerfile` at the repository root. The build needs internet access to install system libraries.

### 2. Set environment variables {#env}

In the platform's environment-variable settings, set the following; [Halo Server configuration](/en/server/configuration) explains each one:

| Variable | Suggested value |
|---|---|
| `HALO_DATA_DIR` | `/data`, the NFS mount from the next step |
| `HALO_REMOTE_PASSWORD` | A random password of 8–64 characters, for example the output of `openssl rand -hex 24` |
| `HALO_AI_PROVIDER` | Your model protocol family, such as `openai` |
| `HALO_AI_API_URL` | Your model gateway address |
| `HALO_AI_API_KEY` | The gateway key |
| `HALO_AI_MODEL` | The model name |

The image already sets `HALO_SERVER_MODE=1` and `PORT=8080`. If the platform requires a specific port, set `PORT` and route the platform to the same port.

### 3. Mount an NFS volume at HALO_DATA_DIR {#volume}

In the platform's storage or volume settings, create or pick an NFS volume, mount it at `/data` in the container, and keep `HALO_DATA_DIR=/data` in step with it.

::: danger Without a volume, data is lost
Without `HALO_DATA_DIR`, data is written to `/tmp/.halo` and wiped when the instance recycles. In production, mount an NFS volume and point `HALO_DATA_DIR` at it.
:::

### 4. Size the resources {#resources}

Halo Server runs the full Electron (Chromium) main process and needs a fair amount of memory.

| Resource | Recommendation |
|---|---|
| Memory | At least 4–8 GB; less gets the process killed (OOM) |
| CPU | At least 2 cores |

Give one instance enough resources rather than spreading the load over several; the next section explains why.

### 5. Expose the port {#port}

Set the service's external port to the container's `8080`, or the `PORT` you set.

## Path prefix {#path-prefix}

Platforms usually serve the service under a path prefix, such as `/fc-xxxx/`. The web app adapts to the prefix by itself. When calling the API, use the platform's address including the prefix as the base URL and append `/api/...` and `/ws` to it.

## Concurrency and scaling {#scaling}

::: danger A stateful single instance: never scale out
Halo Server's state is SQLite, local files and in-memory sessions together, all tied to one instance.
:::

- **Do not scale out**: several instances each hold their own state and drift apart, and several instances writing the same SQLite file on NFS corrupt it. Limit the maximum instance count to 1.
- **Scale up**: give the one instance more CPU and memory to carry more load.
- **A cold start after scaling to zero is a full re-initialization**: in-memory sessions are lost (persisted data comes back from NFS), and an Electron cold start takes noticeable time. For latency-sensitive use, turn scale-to-zero off and keep at least one instance running.

## Verify {#verify}

Call the public status endpoint at the service address the platform gives you, prefix included:

```bash
curl https://<PLATFORM_HOST>/<PATH_PREFIX>/api/remote/status
```

Output:

```json
{"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

Then check the access password:

```bash
curl -X POST https://<PLATFORM_HOST>/<PATH_PREFIX>/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<YOUR_ACCESS_PASSWORD>"}'
```

Output:

```json
{"success":true}
```

Replace `<PLATFORM_HOST>` and `<PATH_PREFIX>` with the host and path prefix the platform gives you. If the build fails, first check that the base image is reachable and that the build environment has enough disk space for the reassembled bundle.

## Next steps {#next-steps}

- [Halo Server integration guide](/en/server/integration): connect Digital Humans to your systems
- [HTTP API overview](/en/developers/api/): base URL, authentication and error conventions
