---
title: "Docker deployment: run Halo Server in a container"
description: "Deploy Halo Server with Docker: build the image from the Halo repository, mount a persistent volume, and set the access password and LLM gateway."
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Deploy with Docker

Deploy Halo Server with plain Docker (`docker run` or `docker compose`).

## Before you start {#before-you-start}

- A Linux server that runs Docker, with at least 4–8 GB of memory.
- Node.js to build the app bundle, in the version the Halo repository's `package.json` requires.
- Internet access while building the image, to pull the base image and install system libraries.

## 1. Build the image {#build-image}

The deployment files live in `deploy/server/` in the Halo repository. Build the Linux app bundle first, then the image from that folder's `Dockerfile`:

```bash
git clone https://github.com/openkursar/hello-halo.git
cd hello-halo
npm ci
npm run build:server
docker build -t halo-server:latest deploy/server
```

`npm run build:server` writes the bundle to `deploy/server/bundle/`; see [Build your own image](/en/server/build) for the details. The image build installs the system libraries and fonts Chromium and Electron need (CJK fonts included) with apt.

::: tip Base image
The `Dockerfile` starts from the public image `python:3.12-slim-bookworm` (Debian 12). To use an equivalent image your environment can reach, change the `FROM` line. Newer Debian releases renamed some library packages, so adjust the install list accordingly.
:::

## 2. Run the container {#run}

Mount a local folder as the persistent data volume and set the access password and model through environment variables:

```bash
docker run -d \
  --name halo-server \
  -p 8080:8080 \
  -v /srv/halo-data:/data \
  -e HALO_DATA_DIR=/data \
  -e HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD> \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=https://ai-gateway.example.com/v1 \
  -e HALO_AI_API_KEY=<YOUR_API_KEY> \
  -e HALO_AI_MODEL=<MODEL_NAME> \
  halo-server:latest
```

- `<YOUR_ACCESS_PASSWORD>`: a random password of 8–64 characters, for example the output of `openssl rand -hex 24`. The sign-in page does not accept fewer than 8 characters.
- `<YOUR_API_KEY>`, `<MODEL_NAME>`: the key and model name of your model gateway.
- `-p 8080:8080`: maps the container's `8080` (the `PORT` default) to the host.
- `-v /srv/halo-data:/data` with `-e HALO_DATA_DIR=/data`: data goes to the mounted volume and survives a rebuilt container. Global skills, the AI engine's conversation records and the built-in browser profile go to `/data/home` too.
- The image already sets `HALO_SERVER_MODE=1`.

Every variable is explained in [Halo Server configuration](/en/server/configuration).

::: danger Without a volume, data is lost
Without a mounted volume and `HALO_DATA_DIR`, data is written to `/tmp/.halo` inside the container and disappears with it.
:::

::: warning Memory
Halo Server runs the full Electron (Chromium) main process and needs a fair amount of memory. Give the container at least 4–8 GB, or the system may kill it (OOM). Limit resources with `--memory` and `--cpus` and keep headroom on the host.
:::

## 3. Run with docker compose {#compose}

The repository's `deploy/server/docker-compose.yml` works as is: after building the bundle, set the password and model values in it and run `docker compose up -d` in `deploy/server`. The equivalent configuration:

```yaml
services:
  halo-server:
    image: halo-server:latest
    container_name: halo-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    environment:
      HALO_DATA_DIR: /data
      HALO_REMOTE_PASSWORD: <YOUR_ACCESS_PASSWORD>
      HALO_AI_PROVIDER: openai
      HALO_AI_API_URL: https://ai-gateway.example.com/v1
      HALO_AI_API_KEY: <YOUR_API_KEY>
      HALO_AI_MODEL: <MODEL_NAME>
    mem_limit: 8g
```

```bash
docker compose up -d
```

## 4. Verify {#verify}

Check that the service is up (public endpoint, no password needed):

```bash
curl http://127.0.0.1:8080/api/remote/status
```

Output:

```json
{"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

Check the access password:

```bash
curl -X POST http://127.0.0.1:8080/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<YOUR_ACCESS_PASSWORD>"}'
```

Output:

```json
{"success":true}
```

::: done
Open `http://<HOST>:8080` in a browser and sign in with the access password. When you see the same Halo interface as on the desktop, the deployment works.
:::

Read the logs. On start the container lists any shared libraries it is missing, which helps when you change the base image:

```bash
docker logs -f halo-server
```

## Run one instance only {#single-instance}

Halo Server is a stateful, single-instance service: its state is SQLite, local files and in-memory sessions together. Never let several containers share one data volume, because several writers corrupt SQLite. For more throughput, give the one container more CPU and memory. Scaling is covered in [Serverless deployment](/en/server/deployment-faas#scaling).

## Next steps {#next-steps}

- [Halo Server integration guide](/en/server/integration): connect Digital Humans to your systems
- [HTTP API overview](/en/developers/api/): call the API with the access password
