---
title: "Deploy the Federation Gateway for remote teams"
description: "Self-host the Halo Federation Gateway so computers on different networks can share a Digital Human team: deploy it, add HTTPS, then set it in Remote Access."
type: how-to
audience: [admin]
since: "3.0"
related: [digital-humans/cross-computer-teams, features/remote-access, advanced/security]
---

# Deploy the Federation Gateway

The gateway runs on your own server, so Halo can't deploy it for you. The AI also can't change **Remote Access** settings, so you enter the address yourself.

## When you need the Federation Gateway {#when-you-need-it}

[Teams across computers](/en/digital-humans/cross-computer-teams) use the local network by default: colleagues' computers connect straight to the Remote Access server of the computer that created the team. You only need the Federation Gateway in the middle when members are on different networks.

| Your situation | What to use |
|---|---|
| Every computer is on the same local network (same office, same Wi-Fi) | Turn on [Remote Access](/en/features/remote-access). No gateway needed |
| Some members work from home, another city or another company network | Deploy the Federation Gateway and enter its address on the computers |
| The team creator's IP address keeps changing and invite links stop working | Deploy the Federation Gateway. Invite links made through it point at the gateway, so they don't depend on that computer's IP |

With a gateway, the inviting computer no longer needs its Remote Access server running. It connects out to the gateway instead.

::: info The official build has no built-in gateway
Halo downloaded from the official site has no default gateway address. Under **Settings › Remote Access › Federation Gateway** it shows "Leave empty for LAN-only teams.", so you deploy your own for use across networks. A Halo provided by your company may already include a gateway. Then it shows "Using the built-in gateway" with its address, and you don't need to deploy one.
:::

## What the gateway can see {#what-it-sees}

The Federation Gateway is a small standalone service that only relays. Each team is a "room" on the gateway. The computer that created the team is the hub of that room, and the other computers' messages reach it through the gateway. The gateway reads only the routing fields on the outside of each message. It doesn't interpret the business content inside, and it doesn't write it to disk.

| Item | How the gateway handles it |
|---|---|
| Team content (messages, tasks, file contents) | Relayed through the gateway, which doesn't interpret it or write it to disk. Halo adds no extra encryption of the content at the gateway layer, so transport security comes from HTTPS / WSS (see [Set up HTTPS](#tls)) |
| Each computer's identity | Each computer proves who it is by signing a one-time challenge with its own device key (Ed25519). The gateway only knows this identity. It has no accounts or passwords of its own |
| The token in an invite link | Passes through the gateway when someone joins, but the gateway can't verify it. The team's computers verify it themselves. The gateway can't issue invites either |
| Routing information | Team ID, each computer's identity, who sends to whom, the connection's source IP |
| Address directory | The team creator's computer registers its own Halo address (if it has one) and display name with the gateway, signed. Entries expire unless refreshed within 90 seconds |
| State storage | All in memory, nothing on disk. Restarting the gateway only loses transient relay state, and computers reconnect on their own |

::: danger Diagnostic tracing logs message text
`room.trace` in the gateway configuration is empty (off) by default. If you set it to a team ID or `*`, the gateway writes every frame of that team (or of every team) to its log with the body, including members' message text. Turn it on for one investigation, then off again.
:::

An invite link is itself the credential to join: "Anyone with this link can bring a digital human into this team." The gateway sees the invite tokens that pass through it, so run the gateway yourself or have an administrator you trust run it. For Halo's overall data flow, see [Security, privacy and data flow](/en/advanced/security).

## Before you start {#before-you-start}

- A server (Linux or macOS) that every member's computer can reach, with one open port, `3100` by default
- One of these build tools: Go 1.24 and `make` (single binary), or Docker
- A domain and a TLS certificate, for example `gateway.example.com`, or an existing reverse proxy (nginx, Caddy, Traefik)
- The Halo source code. The gateway's source is in the `gateway` folder of the Halo source repository

<!-- public:start -->
The source is in the [Halo repository on GitHub](https://github.com/openkursar/hello-halo). Check out the tag that matches your Halo version (for example `v3.0.4`) before you build.
<!-- public:end -->

## Deploy the gateway {#deploy}

The gateway supports relay mode only (`mode: relay`). Setting `mode: authority` in the configuration makes it refuse to start with an error.

### Option A: single binary

1. On the server, go to the `gateway` folder of the source, then build and start it:

   ```bash
   cd gateway
   make build
   ./dist/halo-gateway -listen :3100
   ```

   The binary is written to `dist/halo-gateway` and listens on `:3100` by default. The same port serves both HTTP and WebSocket.
2. To build for other platforms, run `make cross`. It writes `linux-amd64`, `linux-arm64` and `darwin-arm64` builds to `dist/`.

### Option B: Docker

1. In the `gateway` folder, build the image and run it:

   ```bash
   cd gateway
   make docker VERSION=dev
   docker run -d --name halo-gateway -p 3100:3100 halo-gateway:dev
   ```

   `make docker` tags the image `halo-gateway:<version>`. Without `VERSION`, the version comes from the git tag. With `VERSION=dev`, the tag matches `halo-gateway:dev` on the next line.
2. The image is distroless/static, runs as a non-root user and exposes port `3100`.

### Check that the gateway is running

On any member's computer, open `http://gateway.example.com:3100/healthz` (use the `https://` address once HTTPS is set up). A 200 response means the gateway is serving.

| Endpoint | Purpose |
|---|---|
| `GET /healthz` | Liveness probe, always 200 while the process serves |
| `GET /readyz` | Readiness probe, 503 while draining for shutdown |
| `GET /version` | Build info (JSON) |
| `GET /metrics` | Metrics in Prometheus format. It has no login, so block it at the reverse proxy if you don't want it public |
| `GET /ws` | WebSocket endpoint that Halo computers connect to |
| `GET /`, `GET /invite` | Invite landing page |

On `SIGTERM` or `SIGINT`, the gateway switches `/readyz` to 503, closes all connections and exits, within 10 seconds at most. Computers reconnect with their usual backoff, so rolling restarts are safe.

### Change the configuration

Settings apply in this order: command-line flags > `HALO_GW_*` environment variables > YAML file > defaults. The YAML file is optional. `config.example.yaml` in the source lists every setting with its default. Point to your file with `-config`:

```bash
./halo-gateway -config /etc/halo/gateway.yaml
HALO_GW_LISTEN=:8443 HALO_GW_LOG_FORMAT=text ./halo-gateway
```

| Flag | Environment variable | Default | What it does |
|---|---|---|---|
| `-listen` | `HALO_GW_LISTEN` | `:3100` | HTTP and WebSocket listen address |
| `-config` | `HALO_GW_CONFIG` | — | Path to the YAML configuration file |
| `-tls-cert` / `-tls-key` | `HALO_GW_TLS_CERT` / `HALO_GW_TLS_KEY` | — | Serve TLS from the gateway itself |
| `-log-level` | `HALO_GW_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `-log-format` | `HALO_GW_LOG_FORMAT` | `json` | `json` or `text` |

Limits you can only change in YAML (defaults):

| Setting | Default | Meaning |
|---|---|---|
| `limits.maxFrameBytes` | `8388608` (8 MiB) | Largest frame; a larger one disconnects the sender |
| `limits.connPerIPRate` / `limits.connPerIPBurst` | `10` / `20` | New connections per second per source IP / burst allowance |
| `limits.sessionFrameRate` | `500` | Frames per second per authenticated connection |
| `room.hostRetention` | `5m` | How long a room waits for the team creator's computer to come back after it disconnects |
| `room.admissionTimeout` | `60s` | A pending member must be let in within this window |
| `directory.ttl` | `90s` | Address directory entries expire unless refreshed |

## Set up HTTPS {#tls}

Members' computers usually reach the gateway over the internet, and team content has no extra encryption at the gateway layer. So give the gateway HTTPS (WebSocket then becomes WSS). Without a certificate, the gateway serves plain HTTP only. There are two ways:

**TLS served by the gateway**: set `tls.cert` and `tls.key` in YAML, or use the flags, then open the port.

```bash
./dist/halo-gateway -listen :3100 -tls-cert <CERT_FILE> -tls-key <KEY_FILE>
```

Replace `<CERT_FILE>` and `<KEY_FILE>` with the paths to your certificate and private key. The gateway address is then `https://gateway.example.com:3100`.

**Behind a reverse proxy** (nginx, Caddy, Traefik): terminate TLS at the proxy and forward to the gateway over plain HTTP. The proxy must meet these requirements:

| Requirement | Why |
|---|---|
| WebSocket upgrades on `/ws` | Halo computers connect to the gateway through `/ws` |
| Read / idle timeout above 90 seconds | Keepalive pings every 30 seconds hold the connection open. A shorter timeout lets the proxy cut it |
| No buffering, and no WebSocket message limit below 8 MiB | The gateway's default frame limit is 8 MiB |
| Raise `limits.connPerIPBurst`, or rate-limit at the proxy instead | The gateway rate-limits by TCP source address. Behind a proxy, every connection comes from the proxy's IP |

An nginx example (adjust it to your site):

```nginx
location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 120s;
}
```

The gateway address is then `https://gateway.example.com`.

## Enter the gateway address on each computer {#configure-halo}

<Badge type="info" text="Desktop only" /> The Federation Gateway field is in the **Remote Access** settings, which appear only in the desktop app. The field is there even when Remote Access is off.

Which computers need it:

- **Required**: the computer that sends invites, that is, the one that created the team. Its invite links then point at the gateway.
- **Recommended, with the same address**: every computer on the team. Then anyone can create a team and send invites through it. Joining computers connect to the gateway address in the invite link.

1. Open **Settings › Remote Access** and find **Federation Gateway**. Its description reads "Relay team collaboration through a gateway server so members outside your local network can join."
2. Enter the gateway address in the box, for example `https://gateway.example.com`. `http://`, `https://`, `ws://` and `wss://` are accepted.
3. Click **Save**. The button changes to **Saved** once the address is stored.
4. Restart Halo. The note under the box says "Restart Halo to apply gateway changes to existing team connections."

To go back to local-network only: clear the box, click **Save**, then restart Halo.

::: done
On the team creator's computer, open the team's **Team settings › Invite** and copy the link. If it starts with `https://gateway.example.com/?office=`, invites now go through the gateway.
:::

### Invite links now work across networks

Send the link to a colleague on another network. They open it in a browser, see the invite page served by the gateway, and click **Open in Halo** to land in Halo's **Join a team** dialog. For the joining steps and permission choices, see [invite links for teams across computers](/en/digital-humans/cross-computer-teams#invite-links).

Links copied before you set the gateway still carry the local-network address. Open **Invite** again and copy a new one.

## Troubleshooting {#troubleshooting}

### Inviting shows "Turn on Remote Access in Settings so others can join this team."

This computer has no gateway address and Remote Access is off. For use across networks, [enter the gateway address](#configure-halo) on this computer and restart Halo.

### The copied invite link still has a local-network address

Halo wasn't restarted after you saved the gateway address, or the link was copied earlier. Restart Halo, then copy the link again from **Team settings › Invite**.

### A colleague sees "Could not join the team. Check the link and that the person who invited you is online."

1. The team creator's computer must have Halo open and be able to reach the gateway.
2. From the colleague's network, open the gateway's `/healthz` to confirm it is reachable.
3. Make sure the colleague uses a new link that starts with the gateway address.

### "This team requires everyone to update Halo to the latest version"

The computers on the team run different versions. The team may also show "(team name) needs an update" or "Waiting on (member name) to update". On every computer, open **Settings › About › Check for updates** and update Halo to the same latest version.

### Members show as Offline

Each computer reports its presence every 2 seconds. After 6 seconds of silence it counts as stepped away ("seems to have stepped away — replies may take a moment"), and after 13 seconds as offline. Common causes are Halo being closed, the computer sleeping, a network drop or a gateway restart. When the gateway is back, computers reconnect on their own and the team shows "Reconnected automatically — work picks up where it left off." If the team creator's computer goes offline, the remaining online computers take over the team record automatically, but that computer's Digital Humans can't work until it returns.

### Behind a reverse proxy, connections keep dropping

Check that the proxy supports WebSocket upgrades on `/ws` and that its read / idle timeout is above 90 seconds. See [Set up HTTPS](#tls).

### Connections are refused when many computers connect at once

Behind a proxy, every connection appears to come from the proxy's IP and hits the per-IP rate limit. `halo_gw_rate_limited_total` in `/metrics` goes up. Raise `limits.connPerIPBurst`, or rate-limit at the proxy instead.

## Next steps {#next-steps}

- [Teams across computers](/en/digital-humans/cross-computer-teams): invite colleagues and choose what they can have your Digital Humans do
- [Remote Access](/en/features/remote-access): how computers connect on the same local network without a gateway
- [Security, privacy and data flow](/en/advanced/security): which addresses Halo connects to, for a security review
