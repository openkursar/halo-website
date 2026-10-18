---
title: 帮助中心：Halo 问题排查从这里开始
description: Halo 出问题时从这里开始：先直接问 Halo，再按报错原文查找，或者按问题类型找到对应的排查页面；还解决不了，带上这些信息来找我们。
type: hub
audience: [all]
related: [troubleshooting/common-errors, troubleshooting/install, troubleshooting/channels, troubleshooting/digital-humans]
---

# 帮助中心

Halo 出了问题，从这里开始：先直接问 Halo；有报错原文就按原文查；也可以按问题类型找到对应的排查页面。

::: say
> 我在 Halo 里看到「模型服务正在限流」，这是什么意思？该怎么办？

Halo 会查自己的官方文档，告诉你这条提示的意思和处理办法。把报错原文完整复制进去，回答会更准。
:::

## 按问题找 {#by-problem}

- [错误信息速查](/troubleshooting/common-errors)：按看到的那句话查意思和办法，对话、模型、附件、数字人、机器人、团队的提示都在这里。
- [模型 API 错误码](/troubleshooting/api-errors)：401、429 这类状态码分别是什么问题。
- [安装与启动问题](/troubleshooting/install)：装不上、打不开、Mac 和 Windows 的安全提示、Windows 的「需要首次设置」、日志在哪里。
- [机器人不回复](/troubleshooting/channels)：企业微信、飞书、微信机器人收不到或不回消息。
- [数字人没有运行](/troubleshooting/digital-humans)：到点没运行、显示「未启动」、多次失败后自动停止。
- [常见问题](/troubleshooting/faq)：收费、数据存在哪里、AI 会不会不打招呼就改文件、离线和手机上能不能用等常见疑问的简短回答。
- [日志与诊断](/troubleshooting/diagnostics)：运行系统诊断、重置 AI 引擎、导出诊断报告、找日志，以及反馈问题时附上什么。

团队协作的问题，见 [跨电脑团队](/digital-humans/cross-computer-teams#troubleshooting)。

## 还是解决不了 {#get-help}

找人帮忙时，带上这些信息，能少来回问几次：

1. 你做了什么、想要什么结果、实际看到了什么。
2. 报错原文：复制红框里的文字，或者在回复上方的思考过程里，找到出错的那一步点 **复制**（提示「复制错误信息」）。
3. Halo 的版本：**设置 › 关于**。
4. 诊断报告：**设置 › 系统 › 系统诊断**，点 **运行诊断**，再点 **复制报告** 或 **导出报告**。报告不含 Key 本身。错误信息里的 Bearer 令牌、JWT 和部分 `sk-` 开头的 Key 会被遮盖，但 Anthropic（`sk-ant-…`）和 OpenAI 项目 Key（`sk-proj-…`）这类格式不会；macOS、Linux 路径里的用户名会被隐去，Windows 路径的不会。发出前先通读一遍，删掉看到的 Key。
5. 需要的话，再附上日志，见 [日志与诊断](/troubleshooting/diagnostics#logs)。

<!-- public:start -->
然后在 [GitHub Issues](https://github.com/openkursar/hello-halo/issues) 提交问题，或者通过 [联系我们](/contact) 里的方式找到我们。
<!-- public:end -->

<!-- internal:support-contact -->

## 下一步 {#next-steps}

- [快速开始](/getting-started/)：从安装到完成第一个任务。
- [使用指南](/features/)：按功能查用法。
