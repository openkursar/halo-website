# Remote Access

Halo has built-in remote access, allowing you to control your Halo from any device and any location through a browser — no client installation required.

## Enable Remote Access

Go to **Settings → Remote Access** and enable the modes you need.

<!-- Screenshot placeholder: screenshot-remote-settings.png (Remote Access settings page) -->

---

## LAN Access

On the same Wi-Fi network, scan the QR code with your phone or tablet to access Halo in a browser.

**Access URL format**: `http://192.168.x.x:<port>`

You can set an access password (4–32 characters). A 6-digit numeric password is generated randomly by default.

---

## Internet Access (Public Tunnel)

After enabling, Halo generates a public URL in about 10 seconds. From anywhere, open any browser, enter that URL and password, and you can access Halo remotely.

Supported device types:
- PC browsers (full functionality)
- iPad (adaptive layout)
- Mobile H5 (mobile-optimized)

::: danger Security Warning
**Anyone with the URL and password can fully control Halo on your computer and execute arbitrary commands.**

Keep the URL and password secure, and only share them with trusted devices or people (e.g., send them to your own phone via a private message). It is recommended to disable the public tunnel when not in use.
:::

---

## Architecture

Halo's remote access is decentralized. Each machine's URL is an independent Agent endpoint:

- **No central server**: Halo does not route data through its own servers — data is transmitted peer-to-peer
- **One URL cannot control multiple computers**: each device has its own independent URL

Recommended approach for managing multiple computers: record each device's URL and password separately and access them as needed.

---

## Typical Use Cases

**Leaving work early**
Enable the public tunnel before leaving the office, send the URL and password to your phone, open a browser at home, and continue directing Halo to get work done.

**In a meeting**
During a dull meeting, open Halo on your phone or tablet, check AI progress in real time, and send new instructions — without disrupting anyone.

**Remote deployment (macOS)**
Maintain an active server login session (pin + token) in the terminal in advance. Back home, tell Halo: "Use Apple Script to open the terminal, run the build script, and deploy to the test server." The AI will operate your computer's terminal to complete the deployment automatically.

---

## Integration with IM Bots

Halo exposes a standard HTTP Agent interface. Any bot that supports HTTP requests can connect to it, including custom bots for WeCom (Enterprise WeChat), Feishu, and DingTalk.

::: info Web access is recommended
Compared to IM bot integration, accessing Halo directly via a browser offers a more complete experience and simpler configuration. IM integration is for advanced users with automation requirements.
:::
