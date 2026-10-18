---
title: 安装与启动问题：系统要求、安全提示和 Git Bash
description: Halo 装不上、打不开或第一次启动卡住时看这里：系统版本要求、Mac 和 Windows 的安全提示、Windows 的「需要首次设置」、Linux 的 AppImage，以及日志在哪里。
type: how-to
audience: [beginner]
related: [getting-started/install, getting-started/setup-ai, troubleshooting/common-errors]
---

# 安装与启动问题

Halo 还没装好或打不开时没法问 Halo，按下面的情况逐项排查。

## 系统要求 {#requirements}

| 系统 | 要求 | 不满足时 |
|---|---|---|
| macOS | macOS 12 或更新，Apple 芯片或 Intel | 更旧的 Mac 请继续使用 Halo 2.x |
| Windows | 64 位（x64） | 没有 ARM 版 |
| Linux | 64 位（x64），glibc 2.34 或更新（比如 Ubuntu 22.04、Debian 12） | glibc 更旧的系统请继续使用 2.1.15 |

## Mac 提示「无法打开」或「无法验证开发者」 {#macos-blocked}

从官网下载的 Halo 经过苹果公证，只会出现普通的「从互联网下载」确认，点 **打开** 即可。出现「无法打开」或「无法验证开发者」，多半是从其他渠道得到的副本或自己构建的版本。如果你确认文件可信：

1. 打开 **系统设置 › 隐私与安全性**。
2. 往下找到关于 Halo 的提示，点 **仍要打开**，按要求输入电脑密码。
3. 再打开一次 Halo。

## Windows 提示「Windows 已保护你的电脑」 {#smartscreen}

Windows 安装程序没有代码签名，SmartScreen 会拦一下。点 **更多信息**，再点 **仍要运行**。

## Windows 第一次打开显示「需要首次设置」 {#git-bash}

Halo 要用 Git Bash 来运行命令（比如 git、npm、pip）。电脑上没有找到时，第一次打开会显示这个页面：

- 选 **自动下载并安装**（推荐），点 **继续**。安装包里自带 Git Bash，不用联网；显示「初始化完成」后就进入 Halo。
- 选 **跳过,稍后手动安装** 也能用，但 AI 不能运行系统命令，只能聊天和写文件。

### 显示「初始化失败」 {#git-bash-failed}

1. 先点 **重试**。
2. 还不行，点 **手动下载并安装**，从打开的网页下载安装 Git for Windows，装好后重新打开 Halo，它会自动识别。
3. 想先用起来，点 **跳过,以有限功能使用**。

### 跳过之后 {#git-bash-skipped}

Halo 进入「功能受限模式」，工作区页面顶部显示「未安装命令执行环境,AI 无法运行系统命令」。点 **立即安装** 随时补装；之后自己装好的 Git 也会被自动识别。

## Linux：AppImage 打不开 {#linux}

- 只有 x64 的 AppImage，没有 deb 或 rpm。
- 下载后先给文件加上可执行权限：在终端里运行 `chmod +x Halo-*.AppImage`，或者在文件属性里勾选「允许作为程序执行」，再双击打开。
- 打开后马上退出，先看系统的 glibc 版本是否满足 [系统要求](#requirements)。
- 在 Linux 上，关掉窗口就会退出 Halo，数字人的定时任务也会停下。

## 双击图标没反应，或者看不到窗口 {#no-window}

- 在 macOS 和 Windows 上，关掉窗口后 Halo 仍在后台运行。再打开一次 Halo，会回到原来的窗口；Windows 上也可以点任务栏托盘里的 Halo 图标。
- 想彻底重启：在托盘图标的菜单里选 **Quit Halo**（这个菜单只有英文），再重新打开。
- 还是不行，重启电脑后再试。

## 一直停在「欢迎使用 Halo」 {#stuck-on-welcome}

还没连好 AI 模型、也没点过 **暂时跳过** 时，每次打开都会回到这里。按 [连接 AI 模型](/getting-started/setup-ai) 选一种方式连好；想先看看界面，点 **暂时跳过**。

## 日志在哪里 {#logs}

向别人求助时，附上日志能帮上大忙。在 Halo 里打开 **设置 › 系统 › 日志文件**，点 **打开文件夹**；Halo 打不开时，直接去这些文件夹找 `main.log`：

| 系统 | 日志文件夹 |
|---|---|
| macOS | `~/Library/Logs/halo` |
| Windows | `%APPDATA%\halo\logs` |
| Linux | `~/.config/halo/logs` |

发日志前，看一眼里面有没有你不想给别人看的内容。日志的更多说明，见 [日志与诊断](/troubleshooting/diagnostics#logs)。

::: done
Halo 打开后显示「欢迎使用 Halo」或「今天想做点什么？」，就说明安装和启动都没问题了。
:::

## 下一步 {#next-steps}

- [安装 Halo](/getting-started/install)：完整的安装步骤。
- [错误信息速查](/troubleshooting/common-errors)：按看到的提示查原因。
