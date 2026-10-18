---
title: AI Agent 自动化：从一句话到定时执行的工作流
description: 用 Halo 做 AI Agent 自动化：一句话交代任务，AI 自己拆解步骤、调用浏览器和各种工具完成；需要重复做的事交给数字人定时运行。
type: landing
audience: [beginner, office]
edition: public
related: [digital-humans/create, features/ai-browser, digital-humans/collaboration]
---

# AI Agent 自动化

AI Agent 自动化，是把一件事交给 AI，让它自己规划步骤、调用工具做完，而不是你一步步操作。在 Halo 里有两种用法：在对话里交代一次性的任务；把需要重复做的工作交给数字人，按计划或事件自动运行。

## 一次性的任务：在对话里交代 {#one-off}

说清楚你要的结果，Halo 会拆成几步来做：搜索网页、打开和操作网站、读写文件、运行代码，必要时调用你接入的 MCP 服务和技能。每一步都显示在对话里，任务计划会标出哪些已完成、哪些在进行。

它工作的时候，你可以随时补充信息，它做完手头这一步就会看到；想停下来就点 **停止**。

## 需要重复的工作：交给数字人 {#recurring}

每天、每周都要做的事，交给数字人。它按计划任务运行，也可以在文件变化、收到 Webhook 或聊天消息时开始工作，把结果发到企业微信、飞书或邮件，需要你决定时再来问你。

![在对话里让 Halo 建数字人：它问清运行时间、内容和结果放在哪里，然后建好「每日资讯简报」，说明每个工作日 09:00 运行、在工作动态里看结果](/images/digital-humans/create/create-by-chat.zh.webp)

数字人能接手哪些工作、怎么创建，见 [AI 数字员工](/seo/ai-digital-worker) 和 [创建数字人](/digital-humans/create)；各种触发方式见 [运行计划与触发方式](/digital-humans/triggers)。

## 多个 Agent 一起做 {#multi-agent}

对话里开着 **团队协作**（默认开启，见 [能力开关](/features/capabilities)）时，遇到复杂任务，AI 会组建一个临时团队，让几位成员分头并行完成，再汇总结果。经常要用的团队可以保留下来，按计划运行；同事的数字人也可以从他们自己的电脑加入。见 [数字人团队](/digital-humans/collaboration)。

## 和固定流程的工作流工具怎么选 {#vs-workflow-tools}

| 你的情况 | 更合适的做法 |
|---|---|
| 步骤固定，每次完全一样，要求零差错 | 固定流程的工作流工具（如 n8n、Zapier）或脚本 |
| 输入不固定，需要读网页、读文档、做判断 | AI Agent |
| 只做一次 | 在 Halo 对话里直接交代 |
| 定期重复，需要一点判断 | Halo 数字人 |
| 已经有现成的接口或流程 | 让数字人通过 Webhook 或 HTTP 接口和它们衔接 |

AI Agent 每次运行都要调用模型、消耗 token，同样的任务每次的做法也可能略有不同。

## 常见问题 {#faq}

### AI Agent 会乱操作吗？

Halo 用你的权限直接执行操作，不会每一步都弹窗确认；遇到需要你决定的地方会停下来问你。每一步都显示在对话里，你可以随时点 **停止**。在重要的文件夹里工作之前，先说清楚哪些东西不能动。

### 自动化失败了怎么办？

数字人每次运行的过程和结果都记在 **工作动态** 里，连续失败 5 次会自动暂停。你可以把出错的情况告诉 Halo，让它帮你调整这个数字人。

## 下一步 {#next-steps}

- [创建数字人](/digital-humans/create)：把重复的工作交出去
- [AI 浏览器](/features/ai-browser)：让 AI 打开网页、填表和下载
- [数字人团队](/digital-humans/collaboration)：让多个数字人分工协作
