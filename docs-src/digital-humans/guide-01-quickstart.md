# 第一章：快速上手

读完这一章你将拥有一个能干活的数字人。

不需要写代码，不需要懂 YAML，不需要理解什么是 MCP、Skill、Browser Action。你只需要把一个现成的数字人装到 Halo 里，让它跑起来。

全程 10 分钟以内。

---

## 你将得到一个数字人

它叫 **HN Daily Brief**——每天早上 8 点自动打开 Hacker News，挑出 10 条最热门的内容，写成一段摘要，发到你邮箱。

你不需要打开浏览器，不需要登录任何账号，邮件会自己来。

---

## 三种装数字人的方式

| 方式 | 适合谁 | 难度 |
|---|---|---|
| 从 Halo 商店一键安装 | 所有人 | ⭐ |
| 导入 zip 包 | 拿到别人发的包、从下载的 | ⭐⭐ |
| 让 AI 帮你生成 | 想做没有现成模板的数字人 | ⭐⭐⭐（见第二章） |

我们从最简单的开始。

---

## 方式一：从商店一键安装（推荐）

### 1. 打开数字人商店

Halo 主界面 → 左侧 **「商店」** → 进入数字人商店。

<!-- screenshot: store-entry.png — 商店入口位置 -->

### 2. 找到 HN Daily Brief

在搜索框里输入 `HN` 或者 `Hacker News`，点击搜索结果。

<!-- screenshot: store-search-hn.png — 搜索 HN -->

### 3. 点击「安装」

在数字人详情页右上角点 **「安装」**。Halo 会让你填几个配置项。

### 4. 填配置项

```
收件邮箱：your-email@example.com
```

只需要填邮箱。其他保持默认就行。

<!-- screenshot: store-install-config.png — 配置表单 -->

### 5. 点「启动」

完成。数字人已经在跑了。

明天早上 8 点你会收到第一封 HN 摘要邮件。

---

## 方式二：导入 zip 包

如果你拿到的是一个 zip 文件——比如同事发给你的、或者从这个文档下载的——按下面的步骤导入。

📦 **示例下载**：[hn-daily-brief.zip](/downloads/hn-daily-brief.zip)

### 1. 解压 zip 到任意位置

```
~/Downloads/hn-daily-brief/
  └── spec.yaml
```

### 2. 在 Halo 中导入

回到 Halo 主界面 → 右侧 **「Apps」** 面板 → 点 **「Open →」** 进入数字人管理。

<!-- screenshot: apps-entry.png — Apps 入口 -->

点左下角 **「+」** → 选择 **「导入」** → 选择刚才解压的文件夹（或 zip 文件）。

<!-- screenshot: apps-import.png — 导入入口 -->

### 3. 填配置 → 启动

和方式一一样，填邮箱，点启动。

---

## 不想等到明天？让它现在跑一次

数字人默认每天早上 8 点自动跑。想现在看到效果：

1. 在数字人列表点击 HN Daily Brief 进入详情页
2. 点击 **「立即运行」** 按钮
3. 等待 1-2 分钟

<!-- screenshot: trigger-now.png — 立即运行按钮 -->

跑完后你会看到：
- 桌面通知一条
- 邮箱里一封摘要邮件
- 详情页有一份完整的运行日志

---

## 看一眼它做了什么：运行日志

点开数字人详情页，最下面有运行历史。点开最近一次：

<!-- screenshot: run-log.png — 运行日志展示 -->

日志会告诉你 AI 这一次：
- 打开了哪个网页
- 读了什么内容
- 调用了哪些工具
- 生成了什么结果

如果某次运行没拿到结果（比如网络断了、Hacker News 临时打不开），这里也会告诉你为什么失败。

---

## 看一眼包里有什么

打开你解压出来的文件夹（或者方式一安装的话，进数字人详情页 → 「查看 spec」按钮）：

```
hn-daily-brief/
  └── spec.yaml
```

只有一个文件。`spec.yaml` 是数字人的**工作手册**——告诉 Halo 这个数字人叫什么、多久跑一次、要做什么、跑完发到哪里。

打开看一眼，你会看到这样的结构：

```yaml
name: "HN Daily Brief"           # 数字人名字
description: "..."                # 一句话描述

system_prompt: |                  # 给 AI 的工作指令
  你是一位关注技术动态的分析师...

subscriptions:                    # 多久跑一次
  - source:
      type: schedule
      config:
        cron: "0 8 * * *"         # 每天早上 8 点

config_schema:                    # 用户安装时要填什么
  - key: email
    label: "收件邮箱"

output:                           # 跑完通过什么渠道通知
  notify:
    channels: [email]
```

::: tip 不用全看懂
现在你不需要理解每个字段。下一章会教你怎么改这些东西，做你自己的数字人。
:::

---

## 暂停、恢复、删除

不需要这个数字人工作时：

- **暂停**：详情页右上角 → 暂停按钮（不会丢配置，随时可恢复）
- **恢复**：再点一次恢复运行
- **删除**：菜单 → 删除（彻底删除，记忆和历史一起清掉）

---

## 还有什么数字人可以装？

去商店搜搜看，常用的有：

| 数字人 | 它能干什么 |
|---|---|
| **HN Daily Brief** | 每天发 Hacker News 摘要邮件 |
| **GitHub PR Reviewer** | 自动审 GitHub PR 提交 |
| **GitHub Issue Triager** | 自动分类和分配 GitHub Issue |
| **Price Hunter** | 监控商品价格，到价提醒 |
| **Site Health Monitor** | 7×24 监控网站可用性 |
| **Sentiment Monitor** | 跟踪关键词，发现负面舆情预警 |
| **Tender Radar** | 招标公告自动监控 |
| **Dependency Vulnerability Scanner** | 扫描项目依赖漏洞 |

商店里的数字人都是公开发布的，可以直接装，不需要懂技术。

---

## 下一步

如果商店里没有完全符合你需求的数字人——比如你想监控的不是 Hacker News 而是别的网站，或者你想操作的是公司内部系统——你需要**改造一个数字人**或者**让 AI 帮你做一个新的**。

→ [第二章：改造一个数字人](./guide-02-build.md)
