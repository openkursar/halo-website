---
title: 常见问题 FAQ：Halo 收费、数据、模型和数字人
description: Halo 常见问题的简短回答：要不要钱、数据存在哪里、AI 会不会不打招呼就改文件、支持哪些模型、能不能离线和在手机上用，以及数字人和机器人的常见疑问。
type: reference
audience: [all]
related: [troubleshooting/common-errors, advanced/security, getting-started/setup-ai]
---

# 常见问题

这里是大家最常问的问题，每条先给简短的回答，细节在链接的页面里。手上有报错原文的，按原文查 [错误信息速查](/troubleshooting/common-errors)。

::: say
> Halo 收费吗？我的对话会发到哪里？

Halo 会查自己的官方文档来回答。下面这些问题，都可以这样直接问它。
:::

## 费用与账号 {#cost-and-accounts}

### Halo 收费吗？ {#is-it-free}

Halo 不按使用收费，也不需要注册 Halo 账号。要花钱的是 AI 模型：用 API Key 时，按用量付费给模型服务商；用 Claude、ChatGPT、GitHub Copilot 这类账号登录时，用的是你在那边的订阅。怎么选，见 [连接 AI 模型](/getting-started/setup-ai)。

<!-- public:start -->
Halo 是 MIT 许可证的开源软件，代码在 [GitHub](https://github.com/openkursar/hello-halo) 上。登录方式里，**腾讯** 和 **Kiro** 两项的说明写着可以免费使用，额度和条件由这两家决定。
<!-- public:end -->

### 用了多少 token、花了多少钱，在哪里看？ {#token-usage}

每条回复右下角的灰色数字，是这次回复时模型看到的上下文大小。鼠标停上去，能看到输入、输出等 Token 明细；有费用数据时也会显示。账户的实际花费以服务商控制台为准。见 [读懂一条回复](/features/conversations#reading-replies)。

## 数据与安全 {#data-and-security}

### 我的对话和文件会上传到哪里？ {#where-does-data-go}

对话、文件、记忆和数字人都存在你自己的电脑上，Halo 没有存放这些内容的云端。会发出去的主要是对话内容：每次对话，你的消息、附件和 AI 读到的文件内容会发给你选的模型服务商。Halo 还会发送不含消息文字的使用统计，公开版的设置里没有关闭开关。完整清单见 [哪些留在本机，哪些会发出去](/advanced/security#data-flow)。

### API Key 存在哪里，安全吗？ {#are-keys-safe}

公开版把 API Key、登录令牌等以明文保存在本机的 `~/.halo/config.json` 里，界面上只显示 `***`。不要把这个文件发给别人，也不要放进网盘同步。见 [密钥和凭据](/advanced/security#credentials)。

### AI 会不会不经我同意就改文件、删文件？ {#does-ai-ask-first}

会直接做，不会每一步都问你。你本人使用时，AI 运行命令、改文件、删文件都不逐次确认；只有需要你拍板的事，它才会弹出问题卡片问你。所以，工作区只指向你愿意让 AI 改动的文件夹，大改之前先备份或用 Git 提交一次。见 [AI 执行工具不会逐次确认](/advanced/security#tool-permissions)。

## 模型 {#models}

### 支持哪些模型？ {#which-models}

两类都行：用账号登录（Claude、ChatGPT、GitHub Copilot 等），或者用 **自定义 API** 填 API Key，接入 DeepSeek、Kimi、智谱这类兼容 OpenAI 或 Anthropic 接口的服务，公司自己的模型网关也可以。每个会话可以单独选模型。见 [模型与账号](/features/models) 和 [获取 API Key](/getting-started/api-keys)。

### 不联网能用吗？ {#offline}

至少要连得上一个模型服务，Halo 才能干活。公司内网有模型网关时，大部分功能不需要外网：对话、读写文件、知识库学习、图片文字识别都能用；用 Claude 等账号登录、网页搜索、商店的内置来源和检查更新需要外网。见 [没有外网时能用什么](/advanced/gateway-and-proxy#offline)。

### 发了图片，模型看不了图怎么办？ {#images}

当前模型不支持看图时，Halo 会自动在本机识别图片里的文字交给模型，只是模型看不到图片本身。要它看懂图表或界面，换一个模型卡片上 **图片输入** 显示 **支持** 的模型。见 [模型不支持图片时：文字识别](/features/image-input#text-recognition)。

### 报错说额度用完、被限流、Key 无效，怎么办？ {#model-errors}

这些都是模型服务返回的错误。按报错里的状态码（401、429 等）对照 [模型 API 错误码](/troubleshooting/api-errors)。

## 日常使用 {#everyday-use}

### 能在手机上用吗？ {#phone}

可以，但干活的始终是电脑上的 Halo。在电脑上打开 **远程访问**，再用安卓 App 或手机浏览器连接；没有 iOS App，iPhone 和 iPad 用浏览器。见 [在手机上用 Halo](/features/mobile)。

### 能同时做好几件事吗？ {#parallel-work}

可以。几个会话、几个工作区可以同时在跑，Halo 工作时你也能接着发补充。见 [同时推进多件事](/features/parallel-work)。

### 关掉窗口后，Halo 还在运行吗？ {#close-window}

在 macOS 和 Windows 上还在：关窗口只是把 Halo 收到后台，数字人、定时任务和远程访问照常工作。要彻底退出，在托盘或菜单栏的 Halo 图标菜单里选 **Quit Halo**。在 Linux 上，关窗口就会退出。见 [关闭窗口和退出 Halo](/digital-humans/keep-running#close-vs-quit)。

### 怎么重启 Halo？ {#restart}

打开 **设置 › 系统 › 重启 Halo**，点 **重启**。打不开设置时，先彻底退出（托盘或菜单栏图标 › **Quit Halo**），再重新打开。还在出问题，见 [日志与诊断](/troubleshooting/diagnostics#recover)。

### 怎么更新 Halo？ {#update}

不用你做什么：Halo 会在后台检查和下载新版本，准备好后弹出提示，点 **立即重启**（Windows 走安装程序时是 **立即安装**）。想马上检查，在 **设置 › 关于** 点 **检查更新**。见 [更新 Halo](/advanced/updates)。

### 我的电脑系统比较旧，能用吗？ {#older-systems}

Halo 3.0 需要 macOS 12 及以上、64 位的 Windows 10 及以上，或 glibc 2.34 及以上的 64 位 Linux。更旧的系统请继续使用 2.x，见 [旧系统继续使用 2.x](/advanced/updates#older-systems)。

### 照着教程找不到按钮，界面对不上 {#ui-does-not-match}

这份文档对应 Halo 3.0.4。2.x 的很多菜单和名称已经变了，例如「空间」改叫「工作区」，聊天框里的「工具」按钮换成了 **＋** 面板。先更新到最新版；还在用 2.x 的，见 [旧系统继续使用 2.x](/advanced/updates#older-systems)。

### 卸载 Halo 会删掉我的数据吗？ {#uninstall}

不会。卸载只删程序，数据文件夹 `~/.halo`（Windows 上是 `%USERPROFILE%\.halo`）和应用数据文件夹都会留着，重新安装后工作区、会话和数字人都还在。要彻底清除，手动删掉这两个文件夹，见 [数据与配置位置](/advanced/config-paths)。

## 数字人和机器人 {#digital-humans-and-bots}

### 数字人和普通会话有什么区别？ {#vs-conversation}

普通会话要你发消息它才回答，适合一次性的任务；数字人有固定的工作说明和自己的记忆，到点、来消息或有事件时自己开工，做完向你汇报，还能接到企业微信、飞书、微信上。见 [数字人和普通会话有什么区别](/digital-humans/overview#vs-conversation)。

### 电脑关机或睡眠时，数字人还会工作吗？ {#computer-off}

不会。数字人在你的电脑上运行，需要电脑开着、没有睡眠，Halo 也在运行。电脑睡眠期间到点的运行，醒来后补跑一次；Halo 退出期间到点的定时运行不会补跑。见 [让数字人一直在线](/digital-humans/keep-running)。

### 数字人的通知太多了怎么办？ {#too-many-notifications}

在这位数字人的 **能力与设置** 里，找到 **消息与通知 › 系统通知**，选 **重要**（默认，只通知里程碑、提问和产出）、**全部**（每次运行结果）或 **无**。见 [桌面通知](/digital-humans/notifications#desktop)。

### 怎么让机器人忘掉之前聊的内容？ {#clear-bot-context}

在企业微信、飞书或微信里给它发 `/clear`（`/halo-clear`、`/halo-reset` 也行），群聊里先 @ 它。这位数字人的记忆和提醒会保留。见 [清空保留什么](/features/commands#im-clear)。

### 机器人不回复怎么办？ {#bot-not-replying}

按 [机器人不回复](/troubleshooting/channels) 逐项查：Halo 开着、机器人已连接、绑定了数字人、回复范围和 @ 提及对得上、机器人有主人。

## 下一步 {#next-steps}

- [错误信息速查](/troubleshooting/common-errors)：按看到的那句话查意思和办法。
- [安全、隐私与数据流](/advanced/security)：数据、密钥和 AI 权限的完整说明。
- [帮助中心](/troubleshooting/)：按问题类型找排查页面，还解决不了时怎么找我们。
