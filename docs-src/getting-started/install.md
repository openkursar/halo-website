---
title: 安装 Halo：macOS、Windows、Linux 下载与系统要求
description: 下载并安装 Halo，处理第一次打开时的系统提示；Windows 会多一步安装命令执行环境。看到「让我们开始设置」，就说明 Halo 装好了。
type: tutorial
audience: [beginner]
platforms: [macos, windows, linux]
related: [getting-started/setup-ai, troubleshooting/install, advanced/updates]
---

# 安装 Halo

这是 [快速开始](/getting-started/) 的第 1 步。这一步 Halo 帮不上忙，因为它还没装好。按你的系统做，大多数人几分钟就能完成。

## 开始之前 {#before-you-start}

| 设备 | 系统要求 | 安装包 |
|---|---|---|
| Mac | macOS 12 及以上，Apple 芯片或 Intel 芯片 | `.dmg` |
| Windows 电脑 | Windows 10 及以上，64 位（x64） | `.exe` 安装程序 |
| Linux 电脑 | 64 位（x64），glibc 2.34 及以上，例如 Ubuntu 22.04、Debian 12 或更新版本 | `.AppImage` |
| Android 手机 | Android 7.0 及以上 | `.apk`，只用来远程连接你电脑上的 Halo |

- 不需要先装 Node.js、npm，也不需要会用命令行。
- 目前没有 Windows ARM 版、iOS 安装包，也没有 `.deb` / `.rpm` 包。
- macOS 12 以下的 Mac 请继续使用 Halo 2.x；glibc 低于 2.34 的 Linux 请继续使用 2.1.15。

## 1. 下载安装包 {#download}

<!-- public:start -->
打开 [Halo 官网的下载区](https://hello-halo.cc/#download)。网页会识别你的系统，Mac 还会区分 Apple 芯片和 Intel 芯片，点 **下载** 即可。所有安装包也都在 [GitHub Releases](https://github.com/openkursar/hello-halo/releases/latest)。
<!-- public:end -->
<!-- internal:download -->

如果要自己挑文件，按下表选：

| 你的设备 | 下载这个文件 |
|---|---|
| Mac（Apple 芯片：M1、M2、M3、M4 等） | `Halo-<版本号>-arm64.dmg` |
| Mac（Intel 芯片） | `Halo-<版本号>-Intel.dmg` |
| Windows 电脑 | `Halo-Setup-<版本号>.exe` |
| Linux 电脑 | `Halo-<版本号>.AppImage` |
| Android 手机 | `Halo-<版本号>.apk` |

不确定 Mac 是哪种芯片：点屏幕左上角的苹果菜单 ›「关于本机」，看「芯片」一行。写着 Apple M 开头的就是 Apple 芯片，显示「处理器」并写着 Intel 的就是 Intel 芯片。

## 2. 安装并打开 {#install}

### Mac {#install-macos}

1. 双击下载好的 `.dmg` 文件。
2. 在弹出的窗口里，把 **Halo** 图标拖到 **Applications**（应用程序）文件夹上。
3. 打开「应用程序」文件夹，双击 **Halo**。
4. 第一次打开时，macOS 会问你是否确定打开这个从互联网下载的 App，点 **打开**。

官方发布的 Mac 版经过苹果的公证（notarization），正常情况下只会看到上面这个普通提示。

### Windows {#install-windows}

1. 双击 `Halo-Setup-<版本号>.exe`。
2. 如果出现「Windows 已保护你的电脑」，点 **更多信息**，再点 **仍要运行**。Halo 的 Windows 安装程序目前没有数字签名，所以 Windows 和部分杀毒软件会这样提示。
3. 按安装向导完成安装。向导里可以更换安装位置。
4. 安装完成后打开 Halo。

### Linux {#install-linux}

1. 给下载的文件加上可执行权限：

   ```bash
   chmod +x Halo-<版本号>.AppImage
   ```

2. 双击这个文件运行，或者在终端里运行：

   ```bash
   ./Halo-<版本号>.AppImage
   ```

::: warning Linux 上关掉窗口就会退出
在 macOS 和 Windows 上，关闭窗口只是把 Halo 收到后台，数字人和定时任务照常运行。在 Linux 上，关闭窗口会直接退出 Halo，后台工作也会停下。另外，Linux 版没有 AI 终端，「开机自动启动」也不起作用。
:::

## 3. Windows：安装命令执行环境 {#git-bash}

这一步只在 Windows 上出现，而且排在其他页面之前。没有在电脑上找到 Git 时，Halo 会先显示「需要首次设置」：AI 要运行 git、npm、pip 这类系统命令，需要先装好命令执行环境，而且只需要装一次。

1. 保持选中 **自动下载并安装**（标着「推荐」），点 **继续**。
2. 页面显示「首次初始化,请稍候...」，等进度走完。安装包里已经带了需要的文件，一般不用再从网上下载。
3. 看到「初始化完成」后，Halo 会自动进入下一步。

如果选了 **跳过,稍后手动安装**，Halo 会进入「功能受限模式」：AI 只能对话和生成代码，不能运行系统命令。之后想补装，点会话页顶部提示条里的 **立即安装** 即可。

## 4. 选择语言和主题 {#first-launch}

Halo 打开后显示「让我们开始设置」：

1. 在 **语言** 里选你要用的语言。
2. 在 **主题** 里选 **浅色**、**深色** 或 **跟随系统**。
3. 点 **继续**。

![Halo 第一次打开时的「让我们开始设置」页面，上面是语言选择，下面是浅色、深色、跟随系统三个主题按钮和继续按钮](/images/getting-started/install/preferences.zh.webp)

::: done
看到「欢迎使用 Halo」和「选择一种方式开始」，就说明 Halo 装好了。下一步是连接 AI 模型。
:::

## 以后怎么更新 {#updates}

- Halo 会自动检查新版本并在后台下载。准备好后会弹出「Halo {版本号} 新版本可用」，点 **立即重启**，几秒后就是新版本。Windows 上如果显示的是 **立即安装**，说明这次要用安装程序更新，跟着它操作即可。
- 暂时不想更新，点 **稍后提醒我**，6 小时后会再提醒。标为强制更新的版本不能推迟。
- 想马上检查：打开 **设置 › 关于**，点 **版本** 一行的 **检查更新**。
- 从 Halo 2.x 升级到 3.0 的 Windows 用户，这一次仍然要用安装程序；之后的版本会在后台准备好，点重启即可完成。

更新、覆盖安装和在 Windows 上卸载都会保留你的数据（工作区、会话记录、数字人）。数据存放的位置见 [数据与配置位置](/advanced/config-paths)。

## 遇到问题 {#troubleshooting}

### 下载很慢或下载失败

安装包从 GitHub 下载。稍后再试，或者换一个网络。下载完成的文件名应该和上面表格里的一致。

### Mac 提示 Halo「无法打开」或「无法验证开发者」

官方下载的 Halo 不会出现这个提示，常见于从其他渠道得到的副本，或自己构建的版本。如果你确认文件可信：打开 **系统设置 › 隐私与安全性**，往下找到关于 Halo 的提示，点 **仍要打开**，按要求输入电脑密码，再打开一次 Halo。

### 关掉窗口后，Halo 还在运行

在 macOS 和 Windows 上，关闭窗口只是把 Halo 收到后台，好让数字人、定时任务和远程访问继续工作。再打开一次 Halo，会回到原来的窗口；Windows 上也可以点任务栏托盘里的 Halo 图标。要彻底退出，点托盘图标菜单里的 **Quit Halo**（这个菜单只有英文）。有数字人在值班或有任务在运行时，Halo 会先提醒你，退出会让它们停下。

### 命令执行环境初始化失败

页面显示「初始化失败」时，先点 **重试**。还不行，点 **手动下载并安装** 打开 Git for Windows 的下载页，装好后重新打开 Halo，它会自动识别。也可以点 **跳过,以有限功能使用**，先用起来。

### 系统版本太旧，打不开

macOS 12 以下请使用 Halo 2.x；Linux 的 glibc 低于 2.34 请使用 2.1.15。更多情况见 [安装与启动问题](/troubleshooting/install)。

## 下一步 {#next-steps}

- [连接 AI 模型](/getting-started/setup-ai)：选一种登录方式或填写 API Key，让 Halo 开始干活。
