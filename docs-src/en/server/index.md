---
title: "Halo Server quickstart: run Halo as a service"
description: "Halo Server quickstart: run Halo as a service on Linux, open the desktop interface in a browser, and call its API from your systems."
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Halo Server quickstart

Halo Server is the headless server form of Halo and the same app as the desktop one: it runs Halo's main process headless in a Linux container (`HALO_SERVER_MODE=1`), opens no window, and serves the HTTP API and WebSocket instead. Everything the desktop app can do, it can do.

After deploying, open its address in a browser and you get the same Halo interface as on the desktop; your back-end systems can call it through the API.

## Before you start {#before-you-start}

You need a Linux server that runs Docker with at least 4–8 GB of memory, Node.js (Halo does not publish a server image, so you build the app bundle from source), and your own model endpoint and key. See [Deploy with Docker](/en/server/deployment-docker#before-you-start) for the full requirements.

## 1. Build and run {#run}

These are the shortest commands, the same as steps 1 and 2 of [Deploy with Docker](/en/server/deployment-docker); data is written to the mounted `/srv/halo-data`:

```bash
git clone https://github.com/openkursar/hello-halo.git
cd hello-halo
npm ci
npm run build:server
docker build -t halo-server deploy/server

docker run -d --name halo-server \
  -p 8080:8080 \
  -v /srv/halo-data:/data \
  -e HALO_DATA_DIR=/data \
  -e HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD> \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=https://ai-gateway.example.com/v1 \
  -e HALO_AI_API_KEY=<YOUR_API_KEY> \
  -e HALO_AI_MODEL=<MODEL_NAME> \
  halo-server
```

- `<YOUR_ACCESS_PASSWORD>`: a random password of 8–64 characters, for example the output of `openssl rand -hex 24`. The sign-in page does not accept fewer than 8 characters, so do not rely on the default.
- `<YOUR_API_KEY>`, `<MODEL_NAME>`: the key and model name of your model gateway.

For what each option does, the `docker compose` form and the base image, see [Deploy with Docker](/en/server/deployment-docker).

## 2. Open the interface {#open}

Open `http://<HOST>:8080` in a browser and sign in with the access password. You see the same Halo interface as on the desktop: workspaces, tasks, Digital Humans and tool calls are all there.

## 3. Verify the service {#verify}

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
When you can sign in from the browser and see the Halo interface, Halo Server is running. Back-end programs skip the sign-in page and send `Authorization: Bearer <YOUR_ACCESS_PASSWORD>` with every request; see the [HTTP API overview](/en/developers/api/).
:::

Halo Server is a stateful, single-instance service (SQLite, files and in-memory sessions). For more capacity, give the one instance more CPU and memory rather than adding instances: several instances each hold their own state and drift apart. See [Serverless deployment](/en/server/deployment-faas#scaling) for details.

## Next steps {#next-steps}

- [Halo Server configuration](/en/server/configuration): connect your model gateway, set the access password, persist data
- [Deploy with Docker](/en/server/deployment-docker): `docker compose`, volumes and resource sizing
- [Halo Server integration guide](/en/server/integration): use Digital Humans as the AI back end of your systems
