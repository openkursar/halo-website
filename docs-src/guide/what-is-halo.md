---
title: Halo 是什么：开源的 Claude Code 桌面版 AI 工作台
description: Halo 是开源免费的 AI 桌面应用，把 Claude Code 的 Agent 能力做成人人能用的界面：说一句话就能做文档、操作网页，还能让数字人按计划干活、接入企业微信和飞书。
type: explanation
audience: [all]
related: [getting-started/install, digital-humans/overview, guide/from-claude-code, advanced/security]
---

# Halo 是什么

::: say
> 你能帮我做什么？举几个和我工作相关的例子。

Halo 会查自己的官方文档，按你的工作给出能直接照着说的例子。
:::

## 一句话理解 {#in-one-sentence}

你用平常说话的方式交代任务，Halo 在你的电脑上把事情做完：写文档、整理表格、操作网页、改代码。重复的工作可以交给数字人，它按计划自己干活，在企业微信、飞书或微信里接活，几位数字人还能组成团队分工协作。

## 它能为你做什么 {#what-it-does}

| 你是 | Halo 能帮你 | 从这里开始 |
|---|---|---|
| 办公用户 | 一句话做出 Word、Excel、PPT 和 PDF；整理文件；让 AI 打开网页查资料、填表 | [快速开始](/getting-started/) |
| 想让 AI 自己干活的人 | 建数字人，每天定时汇总、巡检、出报告；接入企业微信、飞书、微信；组团队分工 | [数字人概述](/digital-humans/overview) |
| 开发者 | Claude Code 完整的 Agent 能力，加上文件预览、变更与代码评审、终端（macOS 和 Windows）、技能和 MCP | [从 Claude Code / Codex 迁移](/guide/from-claude-code) |
| IT 管理员 | 远程访问、手机客户端、无界面的 Halo Server、跨网络团队的联邦网关、私有商店 | [管理员与 IT](/advanced/) |

更多例子见 [场景示例](/use-cases/)。

## 它是怎么工作的 {#how-it-works}

- **装在你的电脑上**：支持 macOS 12 及以上、64 位 Windows 和 64 位 Linux。也可以用浏览器或 Android 应用远程连回你的电脑，见 [远程访问](/features/remote-access)。
- **用你自己选的 AI 模型**：用 Claude、ChatGPT、GitHub Copilot、腾讯、Kiro 账号登录，或者填一个 API Key，见 [连接 AI 模型](/getting-started/setup-ai)。Halo 本身免费；模型的费用由你登录的账号或 Key 所属的平台收取。
- **默认用 Claude Code 引擎干活**：读写文件、运行命令、操作 [AI 浏览器](/features/ai-browser)、使用 [技能](/features/skills) 和 [MCP](/features/mcp)。设置里还有几种实验性的引擎可选，见 [Agent 引擎](/features/agent-engines)。
- **数字人在后台按计划运行**：Halo 开着、电脑没睡时，它们按时开工，见 [让数字人一直在线](/digital-humans/keep-running)。

## 数据在哪里 {#data}

对话、文件、数字人和它们的记忆都保存在你的电脑上。发给 AI 模型的内容，由你选的模型服务商处理。Halo 还会连接哪些服务（更新、商店、使用统计等），哪些能关、怎样关，见 [安全、隐私与数据流](/advanced/security#data-flow)。

## 和 Claude Code 是什么关系 {#claude-code}

Halo 用 Claude Code 的 Agent 能力做底层，命令行能做的事，大部分都可以在 Halo 里用说话的方式交给它。在这之上，Halo 加了可视化的文件和预览、变更视图、远程访问、数字人和团队。已经在用 Claude Code 或 Codex，见 [从 Claude Code / Codex 迁移](/guide/from-claude-code)。

## 名字的含义 {#name}

Halo 读作 `/ˈheɪləʊ/`，也可以用谐音 Hello 来记。

<!-- public:start -->
## 开源 {#open-source}

Halo 是开源项目，代码在 [GitHub](https://github.com/openkursar/hello-halo) 上，欢迎提 Issue 或 PR。它是怎么来的、想做成什么样，见 [核心理念](/guide/philosophy#story)。

想了解 Halo 和其他 AI 桌面助手有什么不同，见 [AI 桌面助手](/seo/ai-desktop-agent)。
<!-- public:end -->

## 下一步 {#next-steps}

- [安装 Halo](/getting-started/install)：下载、安装、第一次打开。
- [完成第一个任务](/getting-started/first-chat)：用一句话做出一份真实的文件。
- [数字人概述](/digital-humans/overview)：让 AI 按计划自己干活。
