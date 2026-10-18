---
title: 管理员与 IT：Halo 的安全评审、部署与运维
description: 给管理员和 IT 的 Halo 入口：安全评审要看的事实，批量部署、模型网关与代理、更新、私有商店、Halo Server，以及日志和诊断。
type: hub
audience: [admin]
related: [advanced/security, advanced/deployment, server/, troubleshooting/diagnostics]
---

# 管理员与 IT

要在公司里推广 Halo 3.0.4，这里按顺序整理了你会遇到的问题：先回答安全评审，再看怎样部署到多台电脑、接入公司的模型网关和代理、管理更新和私有商店。需要不带界面、长期在线的部署时，看 Halo Server；排查问题时，看日志和诊断。

## 安全评审 {#security-review}

[安全、隐私与数据流](/advanced/security)：安全评审需要的事实都在这一页，包括 Halo 会连接的每个对象和你能怎样控制。先记住这几点：

- **在本机运行**：对话、文件、记忆和密钥都存在用户自己的电脑上，Halo 没有保存这些内容的云端。发出去的主要是给所选模型服务商的对话内容，见[数据流](/advanced/security#data-flow)。
- **凭据明文存放**：公开版把 API Key 和令牌以明文存在本机配置文件里，界面上始终显示为 `***`，见[密钥和凭据](/advanced/security#credentials)。
- **工具不逐次确认**：用户本人使用时，AI 执行工具不会每次征求确认；对 IM 访客和其他电脑上的同事另有限制，见[AI 权限](/advanced/security#tool-permissions)。
- **远程访问等于完全控制**：打开 **远程访问** 后，知道访问密码的人就能完全控制这台电脑上的 Halo，见[远程访问的风险](/advanced/security#remote-access)。
- **使用统计**：公开版会发送使用事件（不含消息文字），设置里没有关闭开关，见[数据流](/advanced/security#data-flow)。

## 部署 {#deploy}

- [批量部署](/advanced/deployment)：给很多台电脑装 Halo 前，先确认系统要求、安装包和首次启动时的默认设置。
- [更新 Halo](/advanced/updates)：Halo 怎样自动检查和下载更新，Windows 的快速更新和强制更新怎样进行。
- [数据与配置位置](/advanced/config-paths)：在每个系统上，Halo 的数据、配置、日志和技能放在哪个文件夹，备份和清理前先看这里。
- [换电脑迁移](/advanced/migrate)：员工换电脑时要拷贝哪两个文件夹、哪些要重新登录，或只带走某个数字人。

## 网络 {#network}

- [模型网关与代理](/advanced/gateway-and-proxy)：把公司兼容 OpenAI 或 Anthropic 接口的模型网关接成 AI 来源，并在 **设置 › 系统** 里设置代理和不走代理的地址。
- [部署联邦网关](/advanced/federation-gateway)：团队成员不在同一个局域网时，需要自建联邦网关，公开版没有内置网关。
- [远程访问](/features/remote-access)：用户从手机或另一台电脑连回自己的 Halo 时，局域网访问和互联网访问分别怎样连接、访问密码怎样管理。

## 商店与渠道 {#store-and-channels}

- [私有商店](/advanced/private-store)：在 **设置 › 应用商店** 里添加、开关和移除商店来源，让员工从公司自己的来源安装数字人和技能。
- [主人与访客权限](/digital-humans/permissions)：数字人接入企业微信或飞书机器人后，用 **权限控制** 决定谁是主人、访客能用哪些工具。

## Halo Server {#halo-server}

- [Halo Server 快速开始](/server/)：在 Linux 容器里不带窗口运行 Halo，用浏览器、安卓 App 或 HTTP API 访问，适合需要一直在线的部署。
- [开发者](/developers/)：把 Halo 接进公司系统时，从这里找 HTTP API、WebSocket 和集成说明。

## 日志与诊断 {#logs-and-diagnostics}

- [数据与配置位置](/advanced/config-paths)：各系统的日志文件夹在哪里，也可以在 **设置 › 系统 › 日志文件 › 打开文件夹** 直接打开。
- [设置参考：系统](/features/settings#system)：**系统诊断**、**崩溃报告** 等系统设置各管什么。
- [日志与诊断](/troubleshooting/diagnostics)：出问题时收集哪些日志、怎样导出诊断报告，反馈问题时附上什么。打开 **开发者模式** 后日志会记下完整请求，包括密钥，见[日志里有什么](/advanced/security#logs)。

## 更多 {#more}

- [使用技巧](/advanced/best-practices)：给员工培训时可以参考的用法经验，比如一个项目一个工作区、管好上下文和记忆。
