---
title: "Docker Deployment"
description: "Deploy Halo Server with plain Docker: build the image from deploy/server in the Halo repository, mount a persistent data volume, and configure the access token and your own LLM gateway."
---
# Docker Deployment

This guide covers deploying Halo Server with plain Docker (`docker run` / `docker compose`).

---

## 1. Build the image

The deployment files live in the Halo repository's `deploy/server/` directory. Generate the Linux app bundle first, then build the image from that directory's `Dockerfile`:

```bash
git clone https://github.com/openkursar/hello-halo.git
cd hello-halo
npm ci
npm run build:server              # the bundle lands in deploy/server/bundle/
docker build -t halo-server:latest deploy/server
```

Building the image needs network access: it pulls the base image and installs, with apt, the system libraries Chromium/Electron need plus fonts (including CJK fonts).

::: tip Base image
The `Dockerfile` is based on the public image `python:3.12-slim-bookworm` (Debian 12). To use an equivalent base image reachable from your own environment, change the `Dockerfile`'s `FROM`; newer Debian releases renamed some of the system library packages, so adjust the install list accordingly.
:::

---

## 2. Run the container

Mount a local directory as the persistent data volume, and inject the token and LLM config via environment variables.

```bash
docker run -d \
  --name halo-server \
  -p 8080:8080 \
  -v /your/data:/data \
  -e HALO_SERVER_MODE=1 \
  -e HALO_DATA_DIR=/data \
  -e HALO_REMOTE_PASSWORD=replace-with-strong-random-token \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=https://ai-gateway.acme.intra/v1 \
  -e HALO_AI_API_KEY=sk-xxxxxxxxxxxxxxxx \
  -e HALO_AI_MODEL=gpt-4o \
  halo-server:latest
```

Key points:

- `-p 8080:8080`: maps the container's `8080` (the `PORT` default) to the host.
- `-v /your/data:/data` + `-e HALO_DATA_DIR=/data`: writes data to the mounted volume so it survives container recreation. With `HALO_DATA_DIR` set, global skills, the AI engine's conversation records and the built-in browser profile are kept in that directory too (`$HALO_DATA_DIR/home`).
- `HALO_REMOTE_PASSWORD`: for any externally reachable deployment, change to a strong random token (`openssl rand -hex 32`).
- The four LLM vars point at **your own enterprise gateway**; see [Configuration](./configuration.md).

::: danger Persistence
Without a `-v` mount and `HALO_DATA_DIR`, data is written to the in-container default `/tmp/.halo` and is lost when the container is removed.
:::

::: tip Resources
Halo Server runs a full Electron (Chromium) main process with **meaningful memory needs**. Allow **≥ 4–8 GB** of memory for the container, or it may OOM. You can use `--memory` / `--cpus` to constrain it, ensuring the host has enough headroom.
:::

---

## 3. docker compose

The repository's `deploy/server/docker-compose.yml` is ready to use: after generating the bundle, edit the token and model settings in it and run `docker compose up -d` in `deploy/server`. The equivalent configuration:

```yaml
services:
  halo-server:
    image: halo-server:latest
    # or build in deploy/server directly:
    # build: .
    container_name: halo-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    environment:
      HALO_SERVER_MODE: "1"
      HALO_DATA_DIR: /data
      HALO_REMOTE_PASSWORD: replace-with-strong-random-token
      HALO_AI_PROVIDER: openai
      HALO_AI_API_URL: https://ai-gateway.acme.intra/v1
      HALO_AI_API_KEY: sk-xxxxxxxxxxxxxxxx
      HALO_AI_MODEL: gpt-4o
    # Electron/Chromium has meaningful memory needs
    mem_limit: 8g
```

Start:

```bash
docker compose up -d
```

---

## 4. Verify

Liveness probe (public endpoint, no token needed):

```bash
curl http://localhost:8080/api/remote/status
# => {"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

Validate the token:

```bash
curl -X POST http://localhost:8080/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<HALO_REMOTE_PASSWORD>"}'
# => {"success":true}
```

View logs (on startup the container prints any still-missing shared libs once, to help diagnose base-image differences):

```bash
docker logs -f halo-server
```

---

## Single-instance constraint

As with serverless deployment, Halo Server is a **stateful single instance** (SQLite + files + in-memory sessions). **Do not** run multiple container instances against the same data volume — multiple writers will corrupt SQLite. For higher throughput, **scale vertically** (give the single container more CPU / memory). See the scaling notes in [Serverless deployment](./deployment-faas.md#concurrency-scaling-important).
