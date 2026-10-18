---
title: "Halo Server configuration: environment variables"
description: "Halo Server configuration reference: environment variables for server mode, port, data directory, access password and your own LLM gateway."
type: reference
audience: [developer, admin]
---

# Halo Server configuration

Halo Server is configured entirely through environment variables. A variable that is set wins; anything unset keeps the saved configuration or the built-in default.

## Environment variables {#environment-variables}

| Variable | Purpose | Default |
|---|---|---|
| `HALO_SERVER_MODE` | Starts Halo in headless server mode when set to `1` or `true` | Unset means desktop mode; the image sets it to `1` |
| `PORT` | HTTP listen port | `8080` |
| `HALO_SERVER_PORT` | Listen port used when `PORT` is not set | — |
| `HALO_DATA_DIR` | Data directory. Mount a persistent volume here in production | `/tmp/.halo` (temporary, wiped) |
| `HALO_REMOTE_PASSWORD` | Access password, sent as `Authorization: Bearer` when calling the API | `halo123`, only if no password was ever saved; change it |
| `HALO_AI_PROVIDER` | Model protocol family: `anthropic`, `openai`, `custom` and others | `anthropic` |
| `HALO_AI_API_URL` | Model endpoint: your own model gateway | `https://api.anthropic.com` |
| `HALO_AI_API_KEY` | Key for the model gateway | — |
| `HALO_AI_MODEL` | Model name | A built-in Claude model |

The four `HALO_AI_*` variables take effect only when `HALO_AI_API_KEY` or `HALO_AI_API_URL` is set, and then they replace the model sources Halo already has. With neither set, Halo keeps the model sources configured in the app.

## Data persistence {#data-dir}

All of Halo Server's state (the SQLite database, workspace data and files) is written under `HALO_DATA_DIR`. With `HALO_DATA_DIR` set, the image built from `deploy/server` also keeps global skills, the AI engine's conversation records and the built-in browser profile in `$HALO_DATA_DIR/home`, so they persist as well.

The default `/tmp/.halo` is a temporary directory: its data is wiped when the instance recycles, restarts or scales to zero.

::: danger Mount a persistent volume in production
Point `HALO_DATA_DIR` at a mounted persistent volume (usually NFS). Otherwise every instance recycle loses all data.
:::

```bash
HALO_DATA_DIR=/data
```

Then mount the volume at `/data` at the platform or Docker layer, as shown in [Deploy with Docker](/en/server/deployment-docker) and [Serverless deployment](/en/server/deployment-faas).

::: warning SQLite on NFS
SQLite on NFS usually works for a single writer, which is exactly what Halo Server is: one instance, one writer. NFS file locking differs between vendors, though, so test writes, concurrent reads and restart recovery in your storage before going live. It is also why you cannot scale out: several instances writing the same SQLite file corrupt it.
:::

## Access password {#access-password}

`HALO_REMOTE_PASSWORD` is the credential for calling the Halo Server API, sent as a bearer token:

```http
Authorization: Bearer <YOUR_ACCESS_PASSWORD>
```

Replace `<YOUR_ACCESS_PASSWORD>` with the password you set.

::: danger The access password is an admin password
The access password grants full control of this Halo Server, including its files, terminal and AI. Set a random password of 8–64 characters: the sign-in page does not accept fewer than 8, so the default `halo123` cannot even sign in to the web app. Do not rely on the default, and never put the password in web pages, repositories or logs.
:::

Generate a random 48-character password:

```bash
openssl rand -hex 24
```

`HALO_REMOTE_PASSWORD` applies on every start. When it is not set, Halo keeps the password it saved last time, and uses `halo123` only if none was ever saved.

## LLM configuration {#llm-gateway}

Halo ships without a model. Each deployment connects its own model endpoint and key: a self-hosted inference service or your organization's model gateway.

```bash
HALO_AI_PROVIDER=openai
HALO_AI_API_URL=https://ai-gateway.example.com/v1
HALO_AI_API_KEY=<YOUR_API_KEY>
HALO_AI_MODEL=<MODEL_NAME>
```

- `HALO_AI_PROVIDER` picks the protocol family (Anthropic, OpenAI-compatible or custom).
- `HALO_AI_API_URL` points at your own model gateway, so traffic can stay inside your network.
- `HALO_AI_API_KEY` is the key for that gateway; replace `<YOUR_API_KEY>` with the real key.
- `HALO_AI_MODEL` is the model to call; replace `<MODEL_NAME>` with a model your gateway offers.

## Example .env {#example-env}

```bash
# Run mode
HALO_SERVER_MODE=1
PORT=8080

# Persistence: must point at a mounted volume in production
HALO_DATA_DIR=/data

# Access password: 8-64 random characters, for example the output of openssl rand -hex 24
HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD>

# LLM (your own gateway)
HALO_AI_PROVIDER=openai
HALO_AI_API_URL=https://ai-gateway.example.com/v1
HALO_AI_API_KEY=<YOUR_API_KEY>
HALO_AI_MODEL=<MODEL_NAME>
```

## Related {#related}

- [Deploy with Docker](/en/server/deployment-docker): run the container with these variables
- [Serverless deployment](/en/server/deployment-faas): set these variables on a function platform
- [HTTP API overview](/en/developers/api/): call the API with the access password
