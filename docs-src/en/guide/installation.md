# Installation

Halo supports macOS, Windows, and Linux — all three major desktop platforms — with a one-click installer for each.

## Download

Visit the official GitHub Releases page to download the installer for your platform:

**[→ Go to Download Page](https://github.com/openkursar/hello-halo/releases/latest)**

Or visit the official website directly: **[hello-halo.cc](https://hello-halo.cc)**

::: tip Slow access?
The website is hosted on GitHub Pages. If it loads slowly in your region, go directly to the GitHub Releases page to download.
:::

---

## Platform Notes

### macOS

Download the `.dmg` file, double-click to open it, and drag Halo into the Applications folder.

- **Apple Silicon (M-series)**: Download the `arm64` version
- **Intel processor**: Download the `x64` version

On first launch, macOS may show a warning that the developer cannot be verified. Go to System Preferences → Privacy & Security and click "Open Anyway."

---

### Windows

Download the `.exe` installer, double-click to run it, and follow the on-screen instructions to complete the installation.

::: warning Windows command execution dependency
Halo's command execution on Windows requires **Git Bash**. The installer will prompt you to install it — click the online install option to proceed.

If you are in an environment without internet access (e.g., a corporate VDI), download Git for Windows in advance, manually install it via internal transfer, and then restart Halo.
:::

---

### Linux

Download the appropriate package for your distribution (`.AppImage` or `.deb`) and install it following your platform's conventions.

---

## Configure Your API Key

After installation, open Halo, go to **Settings → AI Model**, and enter your API key.

Halo supports:
- **Anthropic** official API (recommended, full Agent capabilities)
- **Domestic proxies** / third-party OpenAI-compatible endpoints
- **Multiple keys / multiple channels**: switch anytime from the top-right corner

::: info Recommended models
Claude 4.5 or Claude 3.7 Sonnet provide the best Agent experience. Advanced features such as the AI browser require a multimodal model.
:::

---

## Next Step

Once installed, go to [30-Second Quick Start](/en/guide/quickstart) to begin your first conversation.
