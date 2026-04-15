# 创建数字人

你有两种方式创建自己的数字人：**自然语言对话创建**，或**直接编写 spec.yaml**。

---

## 方式一：自然语言创建（推荐）

在 Halo 对话中描述你想要的数字人，AI 会自动生成配置并安装。

示例：

```
帮我创建一个数字人，每天早上 8 点打开 Hacker News，
汇总今日热门文章前 10 条，发邮件给我。
邮件地址是 xxx@example.com
```

Halo 会自动：
1. 理解你的需求
2. 生成对应的 spec.yaml
3. 安装并启动数字人

::: tip 搭配顶级模型效果更佳
使用 Claude 4.5 Opus 等更强的模型，自然语言生成的数字人质量更高、更稳定。
:::

---

## 方式二：编写 spec.yaml

对于有技术背景的用户，可以直接编写 spec 文件，精确控制每个细节。

在 Halo 主界面右侧的 **Apps** 面板中点击 **Open →** 进入数字人管理页面，即可手动安装 spec。

![Halo Apps 入口](/images/enter_apps.png)

### 基础结构

```yaml
spec_version: "1"
name: "HN Daily Brief"
version: "1.0.0"
author: "your-name"
description: "每天早上汇总 Hacker News 热门内容并发送邮件摘要"
type: automation
icon: "news"

system_prompt: |
  你是一个简洁的科技分析师。

  每次运行时：
  1. 打开 https://news.ycombinator.com，找出评分最高的 10 条内容
  2. 阅读每条标题、文章（如可访问）和热门评论
  3. 编写摘要，包含：
     - 每条内容的一句话总结
     - 最重要的 2-3 条内容的"为什么值得关注"
  4. 保持简洁，纯文字格式

requires:
  mcps:
    - id: ai-browser
      reason: "需要打开网页和阅读文章"

subscriptions:
  - id: morning-digest
    source:
      type: schedule
      config:
        cron: "0 8 * * *"     # 每天早上 8 点

config_schema:
  - key: email
    label: "收件邮箱"
    type: email
    required: true

output:
  notify:
    system: true
    channels:
      - email
```

---

## spec 字段说明

### 触发方式（subscriptions）

| 类型 | 说明 | 示例 |
|------|------|------|
| `schedule` | 定时执行 | `every: "1h"` 或 cron 表达式 |
| `file` | 文件变化触发 | 监听指定目录 |
| `webhook` | HTTP 请求触发 | 外部系统推送 |
| `webpage` | 网页内容变化触发 | 监听指定 URL |
| `rss` | RSS 新内容触发 | 订阅 RSS 源 |

常用 `every` 值：`30m`、`1h`、`24h`、`7d`

### 输出通知（output.notify）

| 渠道 | 配置 |
|------|------|
| 系统桌面通知 | `system: true` |
| 邮件 | `channels: [email]` |
| 企业微信 | `channels: [wecom]` |
| 飞书 | `channels: [feishu]` |
| 钉钉 | `channels: [dingtalk]` |
| Webhook | `channels: [webhook]` |

消息通道的凭据（邮箱密码、Webhook URL 等）在 **设置 → 消息通道** 中统一管理。

---

## 安装 spec

编写好 spec.yaml 后，在 Halo 中直接告诉 AI：

```
帮我安装这个数字人 spec
```

并粘贴 spec 内容，AI 会自动完成安装。

---

## 发布到商店

想把你的数字人分享给所有人？见 → [DHP 协议](/digital-humans/dhp-protocol)

---

## 下一步：生产级数字人

基础创建完成后，如果你的数字人需要频繁运行、操作平台页面，建议阅读 → [生产级数字人制作](/digital-humans/production-guide)
