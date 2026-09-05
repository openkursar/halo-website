---
title: "Halo Server Quickstart"
description: "A few commands to run Halo as a service, then open it in a browser and get the exact same Halo management UI as the desktop app."
---
# Halo Server

Halo Server is the headless edition of Halo — the **same application** as desktop Halo, only the runtime shape differs: desktop opens a window on macOS / Windows for a human; the Server edition runs the real Halo Electron main process headless in a Linux container (`HALO_SERVER_MODE=1`), replacing the human UI with an HTTP + WebSocket API. Because it runs the complete app, all of desktop Halo's capabilities are there.

**Deploy it, open the URL in a browser, and what you see is the full Halo management UI — identical to the desktop app, except now it runs on a server 24/7 and your backends can drive it over an API.**

## Quickstart

```bash
git clone <halo-server repo URL>
cd halo-server
docker build -t halo-server .

docker run -d --name halo-server \
  -p 8080:8080 \
  -e HALO_REMOTE_PASSWORD=set-your-own-token \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=<your-llm-gateway> \
  -e HALO_AI_API_KEY=<your-key> \
  -e HALO_AI_MODEL=<model-name> \
  halo-server
```

The repo is **self-contained and builds offline** — the app bundle, system libraries, and fonts are all vendored, so `docker build` needs no network (except to pull the base image).

## Open the management UI

Open in your browser:

```
http://localhost:8080
```

Log in with the `HALO_REMOTE_PASSWORD` you set — what you get is the **exact same Halo management UI as the desktop app**: spaces, tasks, digital humans, tool calls, all of it.

At this point you already have a Halo running as a **service**.

> For programmatic callers, skip the login page and call the API directly with `Authorization: Bearer <HALO_REMOTE_PASSWORD>`. See the [Integration Guide](./integration.md).

## Verify it is running

```bash
# liveness probe (public endpoint, no token)
curl http://localhost:8080/api/remote/status
# => {"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}

# validate the service token
curl -X POST http://localhost:8080/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<HALO_REMOTE_PASSWORD>"}'
# => {"success":true}
```

## Next

- **[Configuration (env vars)](./configuration.md)** — point at your own LLM gateway, set the access token, persist your data.
- **[Docker deployment](./deployment-docker.md)** — `docker compose`, persistent volumes, resource sizing.
- **[Function-platform deployment](./deployment-faas.md)** — deploy on serverless (Knative-based).
- **[Integration (for backends)](./integration.md)** — HTTP API, WebSocket events, multi-user digital-human examples.

::: tip Two things before production
1. **Persistence**: by default data is written to `/tmp/.halo` inside the container and lost when the container is removed. Mount a volume and set `HALO_DATA_DIR` (see [Configuration](./configuration.md)).
2. **Resources**: Halo runs a full Electron (Chromium) main process and needs real memory — provision **≥ 4–8 GB** for the container.
:::

> Halo Server is a **stateful, single-instance** service (SQLite + files + in-memory sessions): **scale vertically** (more CPU / memory for the single instance), do not naively horizontal-scale — multiple instances each hold independent state and split your data. See the scaling notes in [Function-platform deployment](./deployment-faas.md#concurrency-scaling-important).
