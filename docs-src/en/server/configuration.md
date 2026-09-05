---
title: "Halo Server Configuration"
description: "Environment-variable reference for Halo Server: data persistence, the service access token, and connecting your own enterprise LLM gateway."
---
# Configuration

All Halo Server configuration is injected through **system environment variables**. On startup the container **reads environment variables first**, falling back to defaults for any that are unset.

---

## Environment variable reference

| Env | Purpose | Default |
|---|---|---|
| `HALO_SERVER_MODE` | enable headless server mode | must be `1` |
| `PORT` | HTTP listen port | `8080` |
| `HALO_DATA_DIR` | data directory. **Mount persistent storage (NFS) here for production** | `/tmp/.halo` (ephemeral — wiped!) |
| `HALO_REMOTE_PASSWORD` | service access token / API key (used as `Authorization: Bearer`) | `halo123` |
| `HALO_AI_PROVIDER` | LLM provider (`anthropic` / `openai` / `custom`) | set by deployer |
| `HALO_AI_API_URL` | LLM endpoint — your **own internal model gateway** | set by deployer |
| `HALO_AI_API_KEY` | LLM API key | set by deployer |
| `HALO_AI_MODEL` | model name | set by deployer |

---

## Data persistence (HALO_DATA_DIR)

All of Halo Server's state — the SQLite database, space data, files — is written under `HALO_DATA_DIR`.

The default `/tmp/.halo` is a **temporary directory**: data is wiped when the instance recycles, restarts, or scales to zero.

::: danger Required for production
In production you **must** point `HALO_DATA_DIR` at a **mounted persistent volume** (typically NFS). Otherwise every instance recycle loses all data.
:::

```bash
# Production: point the data directory at the mount
HALO_DATA_DIR=/data
```

Then mount the persistent volume at `/data` at the platform / Docker layer. See the deployment docs for how to mount:
[Serverless](./deployment-faas.md) · [Docker](./deployment-docker.md).

::: warning SQLite on NFS
SQLite on NFS generally works for the **single-writer** case — which is exactly what Halo Server is (a single instance, single writer). But NFS file-locking implementations vary across vendors, so validate it in your own storage environment before going live (writes, concurrent reads, restart recovery). This is another reason you **cannot horizontal-scale**: multiple instances writing the same SQLite file will corrupt it.
:::

---

## Service access token (HALO_REMOTE_PASSWORD)

`HALO_REMOTE_PASSWORD` is the credential callers use to access the Halo Server API, carried as a standard Bearer token:

```http
Authorization: Bearer <HALO_REMOTE_PASSWORD>
```

::: danger Change the default
The default `halo123` is for local trials only. **Any externally reachable deployment must change it to a strong random token.**
:::

```bash
# Generate a strong random token
openssl rand -hex 32
```

---

## LLM configuration (your own gateway)

Halo **hardwires no model**. Each enterprise plugs in its **own LLM endpoint and key** — a self-hosted inference service or an internal model gateway.

The four variables work together:

```bash
HALO_AI_PROVIDER=openai                      # anthropic / openai / custom
HALO_AI_API_URL=https://ai-gateway.acme.intra/v1
HALO_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
HALO_AI_MODEL=gpt-4o
```

- `HALO_AI_PROVIDER` selects the protocol family (Anthropic / OpenAI-compatible / custom).
- `HALO_AI_API_URL` points at **your own** model gateway, keeping traffic inside your network.
- `HALO_AI_API_KEY` is the key for that gateway.
- `HALO_AI_MODEL` is the model name to call.

---

## Sample `.env`

```bash
# ── Runtime mode ───────────────────────────
HALO_SERVER_MODE=1            # must be 1, enables headless server mode
PORT=8080                     # HTTP listen port

# ── Data persistence ───────────────────────
# Production must point at a mounted persistent volume, or data is lost on recycle
HALO_DATA_DIR=/data

# ── Service access token ───────────────────
# For any external deployment, change to a strong random value: openssl rand -hex 32
HALO_REMOTE_PASSWORD=replace-with-strong-random-token

# ── LLM (your own gateway) ─────────────────
HALO_AI_PROVIDER=openai
HALO_AI_API_URL=https://ai-gateway.acme.intra/v1
HALO_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
HALO_AI_MODEL=gpt-4o
```

Once configured, head to [Serverless deployment](./deployment-faas.md) or [Docker deployment](./deployment-docker.md).
