---
title: "开发者文档：Halo API、Server 与数字人开发"
description: "Halo 开发者文档：调用 HTTP API 和 WebSocket，部署 Halo Server，开发数字人，编写技能和 MCP 配置，以及发布数字人包。"
type: hub
audience: [developer]
related: [developers/quickstart, developers/api/, server/, developers/digital-humans/]
---

# 开发者

Halo 在窗口里能做的事，你自己的代码也能做。本节介绍怎样从脚本和服务里调用 Halo、把它作为服务端运行、开发数字人和技能，以及分享你做的东西。

## 从哪里开始 {#start}

| 你想要 | 从这里开始 |
|---|---|
| 从脚本里给 Halo 派活并读取结果 | [快速上手：调用 Halo API](/developers/quickstart) |
| 把数字人接到你自己的产品或聊天里 | [Halo Server 集成指南](/server/integration) |
| 在服务器上运行 Halo，不需要桌面 | [Halo Server 快速开始](/server/) |
| 做一个能自己干活的数字人 | [数字人开发概览](/developers/digital-humans/) |
| 教会 AI 做某类任务，或给它新的工具 | [编写技能](/developers/skills)、[MCP 配置参考](/developers/mcp) |
| 分享你做的东西 | [DHP 协议](/developers/dhp)、[发布到商店](/developers/store-publishing) |

## 调用 Halo {#api}

Halo 接受 HTTP 请求，并通过 WebSocket 实时推送进度：桌面版在 **设置 › 远程访问** 开启时提供，Halo Server 始终提供。除了登录和状态检查，每个 API 调用都要带上访问密码，它能完全控制这台 Halo。

- [HTTP API 概览](/developers/api/)：地址、鉴权、错误，以及按分组列出的全部操作
- [WebSocket 事件](/developers/api/websocket)：实时跟进回复和状态
- [API 实用示例](/developers/api/recipes)：和数字人对话、为每位用户分配线程、回答它的提问、Webhook

## 把 Halo 作为服务运行 {#server}

Halo Server 是去掉窗口、运行在 Linux 容器里的同一个应用，适合整天调用它的后台系统。

- [Halo Server 快速开始](/server/)、[配置](/server/configuration)和 [Docker 部署](/server/deployment-docker)
- [集成指南](/server/integration)和[集成示例](/server/examples)：把数字人作为你的系统的 AI 后端

## 开发数字人 {#digital-humans}

- [数字人开发概览](/developers/digital-humans/)：它由什么组成、怎样运行
- [教程：做一个浏览器自动化数字人](/developers/digital-humans/build)
- [数字人 spec 参考](/developers/digital-humans/spec)：由 Halo 的 schema 生成
- [生产级数字人](/developers/digital-humans/production)：提示词、记忆、浏览器脚本和安全限制

## 扩展 Halo {#extend}

- [编写技能](/developers/skills)：AI 做某类任务时遵循的指令和脚本
- [MCP 配置参考](/developers/mcp)：接入本地程序或远程服务器提供的工具
- [操作 Halo](/features/operate-halo)：让 Halo 自己的助手替用户修改工作区、数字人和设置

## 分享你做的东西 {#share}

- [DHP 协议](/developers/dhp)：`.dhpkg` 包格式和商店格式
- [发布到商店](/developers/store-publishing)：在 Halo 里发布数字人和技能
- [私有商店](/advanced/private-store)：提供公司自己的商品目录

## 给 AI 工具的文档 {#docs-for-ai}

这些页面也提供纯 Markdown 版本，方便编程助手和其他 AI 工具读取。见[给 AI 工具的文档](/developers/docs-for-ai)。
