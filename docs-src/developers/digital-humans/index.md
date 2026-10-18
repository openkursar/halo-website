---
title: "数字人开发概览：组成、运行方式与开发路径"
description: "Halo 数字人怎样组成、怎样运行：spec、工作区、记忆和触发方式，一次运行能拿到什么，以及什么时候直接让 Halo 来做、什么时候自己写 spec。"
type: explanation
audience: [developer]
---

# 数字人开发概览

数字人是能自己干活的 AI 成员：按计划、在事件到来时，或者有人发消息时开始工作。本节写给动手制作数字人的人：它由哪些部分组成，工作时会发生什么，以及从哪里开始。

## 数字人由什么组成 {#parts}

| 部分 | 内容 | 详见 |
|---|---|---|
| spec | 它的指令（`system_prompt`）、触发方式、设置表单、能力和依赖，写在一个 `type: automation` 的 `spec.yaml` 里 | [spec 参考](/developers/digital-humans/spec) |
| 工作区 | 它的工作目录：它读写的文件，以及 `.claude/skills/` 下的技能 | [编写技能](/developers/skills) |
| 记忆 | 保存在 Halo 数据文件夹里（不在工作目录中）的 `memory.md`，每次开始工作时载入，关闭记忆时除外 | [记忆](/developers/digital-humans/production#memory) |
| 工作动态 | 每次运行一条记录：它的汇报、产出和提问 | [管理数字人](/digital-humans/manage#work-activity) |
| 线程 | 它的聊天：主线程、通过 API 新建的线程，以及每个机器人聊天各一个 | [为每位用户分配线程](/developers/api/recipes#thread-per-user) |

同样的 spec 格式换一个 `type`，也用来描述技能（`skill`）和 MCP 服务器（`mcp`），三者通过同一个商店协议分发；导出的文件格式不同（技能导出为 `.zip`）。见 [DHP 协议](/developers/dhp)。

## 运行与聊天 {#modes}

数字人有两种工作方式，用的是同一份指令和记忆：

- **运行**：不需要有人跟它说话就会开始，比如按计划、在文件变化或 Webhook 到来时，或者有人点了 **立即运行**、调用了它的 HTTP 触发。一次运行按系统提示词执行，用 `report_to_user` 汇报，并记录在 **工作动态** 里。
- **聊天**：回应别人的消息，可以是 Halo 里它的聊天、API，或者绑定的企业微信、飞书、微信机器人。在聊天里约好的提醒，到时间会回到同一个聊天。

制作时要注意两点区别：

| | 运行 | 聊天 |
|---|---|---|
| MCP 服务器 | 只有 `requires.mcps` 里列出的 | 工作区和全局的全部服务器，在 `requires.mcps` 里标了 `enabled: false` 的除外 |
| 替谁做事 | 它的主人 | 它的主人；在机器人聊天里也可能是其他人，按机器人的[访客权限](/digital-humans/permissions)受限 |

数字人运行在运行 Halo 的那台电脑上，或者 [Halo Server](/server/) 上。Halo 必须在运行，数字人才能工作，见[让数字人一直在线](/digital-humans/keep-running)。同一位数字人不会同时运行两次：运行期间到达的事件会交给这次运行，或者并入下一次。

## 一次运行能拿到什么 {#run-context}

运行开始时，数字人会拿到：

- 它的 `system_prompt`；
- 它的设置项的当前值，按 `key` 给出，未填写的用默认值补上；
- 它的记忆文件；
- 是什么启动了它。Webhook 是请求的 `path`、`method`、`body` 和 `query`；文件变化是文件路径和变化类型。请求头和调用方地址不会交给它。
- 它的工具：
  - 始终可用：`report_to_user`、网页搜索、Halo 自己的文档和本机文字识别（OCR），以及通过 **设置 › 消息通道** 里配置好的通道发送通知；
  - 按权限：AI 浏览器、终端、邮件、IM 推送，以及打开时的操作 Halo 和对话协作；
  - `requires.mcps` 里列出的 MCP 服务器；
  - 它所在工作区和全局范围里的所有技能。

## 让 Halo 来做，还是自己写 spec {#ask-or-write}

**让 Halo 来做**：能把要做的事说清楚时，就在会话里说明它该做什么、什么时候做。Halo 会先读自己的数字人制作指南，问清楚需要的信息，然后创建并安装。结果可以在它的 **YAML** 标签页里查看和修改。见[创建数字人](/digital-humans/create)。

**自己写或修改 spec**，适合这些情况：

- 指令和触发方式必须分毫不差，比如涉及不可撤销的操作；
- 它依赖你随包附带的浏览器脚本；
- 你要把它放进版本管理，或用自己的工具生成，再通过导入或 [`POST /api/apps/import-spec`](/developers/api/digital-human#post-api-apps-import-spec) 安装；
- 你要把它打包分发，或发布到商店。

## 下一步 {#next-steps}

- [教程：做一个浏览器自动化数字人](/developers/digital-humans/build)：从头到尾改造一个可用的示例
- [数字人 spec 参考](/developers/digital-humans/spec)：全部字段，以及写了也没有效果的字段
- [生产级数字人](/developers/digital-humans/production)：提示词、记忆、浏览器脚本、登录和安全限制
- [DHP 协议](/developers/dhp)和[发布到商店](/developers/store-publishing)：打包和分享
- [API：数字人](/developers/api/digital-human)：在自己的代码里安装、配置数字人并与它对话
