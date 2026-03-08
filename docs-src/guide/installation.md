# 安装

Halo 支持 macOS、Windows、Linux 三大桌面平台，均提供一键安装包。

## 下载

前往官方 GitHub Releases 页面下载对应平台的安装包：

**[→ 前往下载页](https://github.com/openkursar/hello-halo/releases/latest)**

或直接访问官网：**[hello-halo.cc](https://hello-halo.cc)**

::: tip 国内访问
官网托管在 GitHub Pages，如访问缓慢，可直接前往 GitHub Releases 页面下载。
:::

---

## 各平台说明

### macOS

下载 `.dmg` 文件，双击打开，将 Halo 拖入 Applications 文件夹。

- **Apple Silicon（M 系列）**：下载 `arm64` 版本
- **Intel 处理器**：下载 `x64` 版本

首次启动时 macOS 可能提示"无法验证开发者"，在系统偏好设置 → 隐私与安全中点击「仍要打开」即可。

---

### Windows

下载 `.exe` 安装包，双击运行，按提示完成安装。

::: warning Windows 命令执行依赖
Halo 在 Windows 上的命令执行功能依赖 **Git Bash**。安装时会提示推荐安装，点击在线安装即可。

如在无法访问外网的环境（如企业 VDI）中安装，请提前下载 Git for Windows 并手动安装，然后重启 Halo。
:::

---

### Linux

下载对应发行版的安装包（`.AppImage` 或 `.deb`），按平台惯例安装。

---

## 配置 API Key

安装完成后，打开 Halo，进入 **设置 → AI 模型**，填入你的 API Key。

Halo 支持：
- **Anthropic** 官方 API（推荐，完整 Agent 能力）
- **国内代理商** / 第三方 OpenAI 兼容接口
- **多 Key / 多渠道**：右上角随时切换

::: info 推荐模型
Claude 4.5 或 Claude 3.7 Sonnet 可获得最佳 Agent 体验。AI 浏览器等高级功能需要支持多模态的模型。
:::

---

## 下一步

安装完成后，前往 [30 秒快速上手](/guide/quickstart) 开始你的第一次对话。
