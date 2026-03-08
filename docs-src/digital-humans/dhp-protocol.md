# DHP 协议

DHP（Digital Human Protocol）是 Halo 提出的**开放 AI 数字人分发协议**。

开发者编写一个 `spec.yaml`，提交到 DHP Registry，任何支持 DHP 的用户都可以一键安装并使用你创建的数字人。

::: info 协议仓库
[github.com/openkursar/digital-human-protocol](https://github.com/openkursar/digital-human-protocol)
:::

---

## 为什么需要 DHP

MCP 解决了"AI 能用什么工具"，A2A 解决了"Agent 之间怎么通信"，但没有协议回答：

> **这个 Agent 是谁？它能做什么？怎么分发给全球用户使用？**

DHP 就是这个问题的答案。它定义了一套标准化的 Agent 身份、能力描述和分发格式，让数字人像 npm 包一样可以被发现、安装和复用。

---

## 完整 spec.yaml 结构

```yaml
# ─── 基础信息 ──────────────────────────────────────
spec_version: "1"
name: "HN Daily Brief"           # 数字人名称
version: "1.0.0"
author: "your-name"
description: "每天早上汇总 Hacker News 热门内容"
type: automation
icon: "news"                      # 图标标识符

# ─── 核心指令 ──────────────────────────────────────
system_prompt: |
  你是一个简洁的科技分析师。
  每次运行时：
  1. 打开 https://news.ycombinator.com，找出评分最高的 10 条内容
  2. ...

# ─── 依赖 ──────────────────────────────────────────
requires:
  mcps:
    - id: ai-browser
      reason: "需要打开网页读取文章"

# ─── 触发方式 ──────────────────────────────────────
subscriptions:
  - id: morning-digest
    source:
      type: schedule
      config:
        cron: "0 8 * * *"

# ─── 用户配置项 ────────────────────────────────────
config_schema:
  - key: email
    label: "收件邮箱"
    type: email
    required: true
    description: "摘要将发送到此邮箱"

# ─── 输出通知 ──────────────────────────────────────
output:
  notify:
    system: true
    channels:
      - email

# ─── 商店信息（发布时填写）───────────────────────
store:
  slug: "hn-daily-brief"
  category: news
  tags: ["hn", "tech", "digest", "daily"]
  locale: zh-CN
  license: MIT

# ─── 可选：持久记忆 Schema ────────────────────────
memory_schema:
  last_seen_ids:
    type: array
    description: "上次已处理的文章 ID，用于去重"

# ─── 可选：权限 ───────────────────────────────────
permissions:
  - ai-browser
```

---

## 字段速查

### config_schema 字段类型

| type | 说明 |
|------|------|
| `text` / `string` | 普通文本 |
| `email` | 邮箱地址 |
| `url` | URL 地址 |
| `number` | 数字 |
| `boolean` | 开关 |
| `select` | 下拉选择（配合 `options`） |

### subscriptions source.type

| type | 触发时机 |
|------|----------|
| `schedule` | 定时（`every` 或 `cron`） |
| `file` | 本地文件变化 |
| `webhook` | 接收 HTTP 请求 |
| `webpage` | 指定网页内容变化 |
| `rss` | RSS 新内容 |
| `custom` | 自定义 |

---

## 发布到 DHP Registry

1. Fork [digital-human-protocol](https://github.com/openkursar/digital-human-protocol) 仓库
2. 在 `registry/` 目录下创建你的数字人文件夹
3. 提交 `spec.yaml` 并发起 Pull Request
4. 审核通过后，你的数字人将出现在 Halo 商店中

---

## 一次开发，全球分发

DHP 的愿景是让每个开发者都能轻松贡献可复用的 AI 能力模块。你只需要写好 spec，Halo 用户就能一键安装并运行你的数字人。欢迎参与共建。
