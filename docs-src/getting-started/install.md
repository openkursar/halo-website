# 1. 安装 Halo

Halo 是一个 AI 桌面助手。装好之后，你可以用自然语言让 AI 帮你完成各种工作——写文档、整理文件、分析数据、操作网页、收发邮件，甚至让它 7×24 小时自动干活。

不需要任何编程基础，安装过程和装一个普通软件一样。

---

## 下载安装包

打开下载页面，找到对应你电脑系统的安装包：

<!-- INTERNAL: 内网用户下载地址 -->

**[前往下载页](https://github.com/openkursar/hello-halo/releases/latest)**

![下载页面](/images/install-download.png)

::: tip 不确定下载哪个？
- **Windows 电脑**：下载 `.exe` 文件
- **Mac 电脑**：下载 `.dmg` 文件。如果下载页有多个 `.dmg`，看文件名中是否带 `arm64`——带 `arm64` 的适用于 M 系列芯片（M1/M2/M3/M4），另一个适用于 Intel 芯片

如何判断你的 Mac 是哪种芯片：点击屏幕左上角苹果图标 →「关于本机」→ 看"芯片"一行。
:::

---

## 安装

### Windows

1. 双击下载好的 `.exe` 文件
2. 如果弹出安全提示"Windows 已保护你的电脑"，点击「更多信息」→「仍要运行」
3. 按提示点击「下一步」直到完成

<!-- screenshot: windows-install.png — Windows 安装向导界面 -->

::: warning 如果提示需要安装 Git Bash
Halo 在 Windows 上需要 Git Bash 来执行命令。安装过程中如果弹出提示，点击「在线安装」即可自动完成。

如果你的电脑无法访问外网（比如公司 VDI 环境），需要提前下载 [Git for Windows](https://gitforwindows.org/) 并手动安装，然后重启 Halo。
:::

### Mac

1. 双击下载好的 `.dmg` 文件
2. 把 Halo 图标拖入 Applications（应用程序）文件夹
3. 打开「应用程序」文件夹，双击 Halo 启动

![Mac 安装拖拽界面](/images/install-mac-drag.png)

::: warning 首次打开提示"无法验证开发者"？
这是 Mac 的正常安全提示，不是病毒。解决方法：

1. 点击屏幕左上角苹果图标 →「系统设置」（或「系统偏好设置」）
2. 找到「隐私与安全性」
3. 页面下方会出现"已阻止 Halo"的提示，点击「仍要打开」
4. 回到应用程序文件夹，再次双击 Halo

![Mac 安全设置](/images/install-mac-security.png)
:::

### Linux

下载 `.AppImage` 或 `.deb` 文件，按你使用的发行版惯例安装即可。

---

## 确认安装成功

启动 Halo 后，你应该看到这样的界面：

![Halo 主界面](/images/install-first-launch.png)

看到这个界面，说明安装成功了。

::: danger 如果启动后是空白/报错
- 检查电脑是否联网
- 尝试完全退出 Halo 后重新打开（Mac：右键 Dock 栏图标 →「退出」；Windows：右键任务栏托盘图标 →「退出」）
- 仍有问题请参考 [常见问题](/troubleshooting/faq)
:::

---

## 升级

- **Windows**：Halo 会自动检测新版本并提示更新
- **Mac**：由于没有开发者签名证书，不会自动提示。你可以在 Halo 中点击 **设置 → 关于 → 检查更新** 来手动检查

也可以随时去下载页下载最新安装包**直接覆盖安装**。你的所有数据（空间、对话记录、数字人配置）都会保留，不需要重新设置。

---

**下一步**：[配置 AI 模型 →](/getting-started/setup-ai)
