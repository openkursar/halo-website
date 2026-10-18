---
title: "Halo HTTP API reference: base URL, auth and errors"
description: "Halo HTTP API overview: base URL, authentication, request and response conventions, errors, real-time events, and the documented endpoint groups."
type: reference
audience: [developer]
generated: true
editLink: false
---

# HTTP API overview

Halo has an HTTP API and a WebSocket event stream. Halo's remote web app and Android app use the same interface, so a script or a back-end service can do most of what you do in the app: work with workspaces and conversations, run Digital Humans and teams and chat with them, manage knowledge bases, message channels and the Store, and drive the terminal.

This reference is generated from Halo {{appVersion}} and documents {{documentedCount}} operations. Halo's own apps also use {{internalCount}} further endpoints. They are not part of this reference and not a stable contract: they can change or disappear in any release without notice.

New to the API? Make your first calls with the [quickstart](/en/developers/quickstart).

## Base URL {#base-url}

| Where Halo runs | Base URL |
| --- | --- |
| Halo desktop, called from the same computer | the **Local Address**, `http://localhost:3456` by default |
| Halo desktop, called from another device on the same network | the **LAN Address**, `http://<COMPUTER_IP>:3456` |
| Halo desktop, called from anywhere | the `https://` address shown under **Internet Access** in **Settings › Remote Access** |
| Halo Server | `http://<HOST>:8080` by default (set with `PORT` or `HALO_SERVER_PORT`) |

On the desktop the API is available while **Enable Remote Access** is on. When the port is taken, Halo moves to the next free one, so copy the address Halo shows rather than assuming the default. If a reverse proxy serves Halo under a path prefix, put the prefix before `/api`.

The Local and LAN addresses use plain HTTP, so traffic on the network is not encrypted. Across networks you do not trust, use Internet Access (HTTPS) or your own TLS proxy.

## Authentication {#authentication}

Every request under `/api/` carries the access password as a bearer token:

```http
Authorization: Bearer <ACCESS_PASSWORD>
```

`<ACCESS_PASSWORD>` is:

- on Halo desktop, the **Access Password** in **Settings › Remote Access**. Halo generates a 12-character password; to use your own, click **Edit** next to it (8–64 characters, with an upper-case letter, a lower-case letter and a digit). Requests with the old password are refused at once. Restart Halo after a change so connections that are already open are closed too.
- on Halo Server, the value of the `HALO_REMOTE_PASSWORD` environment variable. Set your own, 8–64 characters long: the sign-in page does not accept shorter ones. Do not rely on the default. See [Halo Server configuration](/en/server/configuration).

::: danger The access password is an admin password
The access password grants full control of this Halo, including its files, its terminal and its AI. Treat it like an admin password: keep it on the server side, and never put it in web pages, repositories or logs.
:::

A `?token=` query parameter is accepted too, but it ends up in logs and browser history, and special characters must be URL-encoded. Prefer the header.

Three endpoints work without a token: `GET /api/remote/status`, `POST /api/remote/login` and `GET /api/security/policy`.

### Checking a password, and lockout {#lockout}

`POST /api/remote/login` with `{"token":"<ACCESS_PASSWORD>"}` answers `{"success":true}` when the password is right. It creates no session, so keep sending the header on every request.

Wrong passwords sent to this endpoint or to the WebSocket sign-in are throttled. Five failures from one IP address within 5 minutes lock that address out for 15 minutes. Ten failures within an hour, from any addresses, lock sign-in for everyone for 30 minutes. A locked request gets `429`, a `Retry-After` header in seconds and `"code": "LOCKED"`. Requests that carry the header are not throttled; a wrong token there gets `401`.

## Requests {#requests}

- Send JSON with `Content-Type: application/json`. JSON bodies are limited to 100 KB.
- Ids are UUIDs, apart from a few fixed ones such as the Halo Workspace, `halo-temp`.
- Path parameters are written `:name` in this reference. Replace the whole segment with the value.
- The path has no version prefix.

## Responses and errors {#errors}

Most operations answer with the same envelope:

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": "What went wrong" }
```

- **Check `success`, not only the status code.** Many failures come back as HTTP 200 with `"success": false`.
- A few operations put their result under another key, such as `servers` or `result`. Their entries say so.
- Response shapes in this reference are abbreviated: `…` stands for fields left out, `a | b` for alternatives and `// …` for comments. They show the structure, not exact JSON.

| Status | Meaning |
| --- | --- |
| 200 | Handled. Check `success`. |
| 400 | Missing or invalid input, on operations that validate it |
| 401 | No token or a wrong one: `"No authorization token"` or `"Invalid token"` |
| 403 | Refused: a path outside the folders Halo allows, a feature this build's security policy turns off, or a feature this computer does not offer |
| 404 | The id does not exist, on operations that check it |
| 413 | The request body is too large |
| 429 | Sign-in is locked (see [lockout](#lockout)) |

An unknown path does not answer with JSON: `GET` returns the web app's HTML page with status 200, and other methods return a plain 404 page. If you get HTML back, check the path.

## Real-time events {#real-time}

Halo streams progress over a WebSocket at `/ws` on the same address: the reply as it is written, tool calls, questions waiting for an answer, and status changes of Digital Humans, teams and files. See [WebSocket events](/en/developers/api/websocket).

## Calling from a web page {#cors}

The API accepts cross-origin requests from any origin for `GET`, `POST`, `PUT` and `DELETE`. `PATCH` is not in the allowed list, so a page on another origin cannot call the `PATCH` operations; call those from a server. Keep the access password out of any page other people can load.

## Changes that cannot be undone {#destructive}

Operations that change or delete existing data carry a mark. **Irreversible** ones delete with no undo and no trash folder, so confirm with the user before you call them. **Reversible** ones change something that can be changed back.

## Halo's assistant uses this API too {#assistant}

With the **Operate Halo** capability turned on, Halo's own assistant calls this API to act on Halo for the user. It connects through a separate listener on the same computer with its own token, it can reach only the operations marked **Assistant**, and secrets in the responses it reads are masked. Operations without that mark are left to the user in the app, or to you through this API.

## Stability {#stability}

- The API has no version number. This reference matches Halo {{appVersion}} and is regenerated for every release. Ask a running Halo for its version with [`GET /api/system/version`](/en/developers/api/settings#get-api-system-version). The `version` field of `/api/remote/status` is fixed at `1.0.0` and does not follow releases.
- Operations and response fields can change between releases. Read the [release notes](/en/guide/changelog) before you upgrade the Halo an integration depends on.

## Groups {#groups}

{{groupTable}}

## Related {#related}

- [Quickstart](/en/developers/quickstart): your first calls, step by step
- [WebSocket events](/en/developers/api/websocket): follow replies and status as they happen
- [Halo Server](/en/server/): run Halo as a service on Linux
