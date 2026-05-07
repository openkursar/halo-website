# 数字人协作与通信

Halo 开启远程访问后，每个数字人都暴露了 REST API。一个数字人可以通过 `curl` 命令调用另一个数字人，实现分工协作。

本文是**可执行的上手指南**，从上到下一步步操作，所有命令都可以直接复制粘贴。

---

## 第一步：打开远程访问

打开 Halo，进入 **设置（左下角齿轮图标）→ 远程访问**。

你会看到这个界面：

<!-- 截图占位：screenshot-remote-settings.png（远程访问设置页） -->

1. 点击 **「开启远程访问」**开关
2. 记下页面显示的 **本地地址**，例如 `http://localhost:3847`
3. 点击密码旁边的 **「显示」**，记下访问密码（6 位数字），例如 `583921`

::: tip 建议设置固定密码
默认密码每次重启会变。点击密码旁边的 **「编辑」** 按钮，输入一个 4-32 位的字母数字密码并保存。后续不用每次重启都重新填。
:::

这三个信息就是后续操作需要的全部凭据：

| 信息 | 示例 | 从哪里看 |
|------|------|----------|
| 地址 | `http://localhost:3847` | 设置页"本地地址" |
| 端口 | `3847` | 地址冒号后面的数字 |
| 密码 | `583921`（或自定义） | 设置页"访问密码" |

---

## 第二步：动手试试

打开终端（macOS 按 `Cmd+空格` 搜 "终端"，Windows 搜 "cmd"），把下面命令里的占位符换成你的实际值，直接复制粘贴执行。

### 2.1 查看所有数字人

```bash
curl -s http://localhost:3847/api/apps \
  -H "Authorization: Bearer 你的密码"
```

返回类似这样的 JSON：

```json
{
  "success": true,
  "data": [
    {
      "id": "e7b3c9a1-2f4d-4e6b-8a5c-1d3f5e7b9a2c",
      "specId": "stock-monitor",
      "spaceId": "f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "spec": { "name": "Stock Monitor", "type": "automation", "description": "监控股价" },
      "status": "active"
    },
    {
      "id": "d6f8e2b1-3c5a-4d7e-9f1b-2a4c6d8e0f1a",
      "specId": "alert-notifier",
      "spaceId": "f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
      "spec": { "name": "Alert Notifier", "type": "automation", "description": "发送告警通知" },
      "status": "active"
    }
  ]
}
```

从返回结果中，你需要记住两个关键字段：

- **`id`** — 数字人的唯一 ID（一串 UUID），后面发消息和触发时要用
- **`spaceId`** — 空间 ID，发消息时必须提供

::: tip 只看某个空间的数字人
加上 `?spaceId=<空间ID>` 参数可以过滤：
```bash
curl -s "http://localhost:3847/api/apps?spaceId=f8a3b2c1-4d5e-6f7a-8b9c-0d1e2f3a4b5c" \
  -H "Authorization: Bearer 你的密码"
```
:::

### 2.2 查看单个数字人详情

把 `<appId>` 换成上一步拿到的 `id`：

```bash
curl -s http://localhost:3847/api/apps/<appId> \
  -H "Authorization: Bearer 你的密码"
```

返回完整的数字人配置，包括 `system_prompt`、`subscriptions`、`config_schema` 等所有字段。

### 2.3 向数字人发消息

::: warning 注意：两套独立系统
Halo 数字人有两套独立系统：
- **Chat 系统**（`/chat/send`）：对话式交互，有消息历史，可获取回复内容
- **执行系统**（`/trigger`、`/state`）：定时 / 手动触发自动化任务，只有运行状态

`/chat/send` 发出的消息走 Chat 系统，`/state` 查的是执行系统状态，两者互不关联。
:::

这是数字人之间通信的核心 —— 给目标数字人发一条消息。

```bash
curl -s -X POST http://localhost:3847/api/apps/<目标数字人ID>/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的密码" \
  -d '{
    "spaceId": "<空间ID>",
    "message": "这是一条来自另一个数字人的消息"
  }'
```

你需要在 `-d` 后面提供两个必填字段：

| 字段 | 含义 | 从哪里拿 |
|------|------|----------|
| `spaceId` | 空间 ID | 第 2.1 步返回结果里的 `spaceId` |
| `message` | 消息内容 | 你写给目标数字人的内容 |

成功返回：

```json
{ "success": true, "data": { "conversationId": "conv-xxx..." } }
```

::: warning 注意
发消息是**异步**的。`curl` 会立刻返回，目标数字人会在后台生成回复。想拿到回复内容？看 2.4。
:::

### 2.4 获取 Chat 回复内容

发消息后想拿到数字人的回复，需要两步轮询：

**Step 1：等待生成完成**

```bash
curl -s http://localhost:3847/api/apps/<目标数字人ID>/chat/status \
  -H "Authorization: Bearer 你的密码"
```

返回：

```json
{ "success": true, "data": { "isGenerating": false, "conversationId": "conv-xxx..." } }
```

`isGenerating` 为 `false` 时说明回复生成完毕。

**Step 2：获取消息内容**

```bash
curl -s http://localhost:3847/api/apps/<目标数字人ID>/chat/messages \
  -H "Authorization: Bearer 你的密码"
```

返回完整的消息列表，最后一条即为数字人的回复。

### 2.5 手动触发数字人执行

不等定时计划，直接让数字人跑一次：

```bash
curl -s -X POST http://localhost:3847/api/apps/<目标数字人ID>/trigger \
  -H "Authorization: Bearer 你的密码"
```

### 2.6 查看自动化执行状态

查看数字人自动化任务的运行状态（定时执行或手动触发的任务）：

```bash
curl -s http://localhost:3847/api/apps/<目标数字人ID>/state \
  -H "Authorization: Bearer 你的密码"
```

返回：

```json
{
  "success": true,
  "data": {
    "status": "idle",
    "lastRunAt": 1715000000000,
    "lastRunStatus": "completed"
  }
}
```

`status` 的含义：
- `idle` — 空闲，没有在跑
- `running` — 正在执行中

---

## 第三步：参数到底从哪来 —— 速查

看了上面的命令，你可能会困惑：`appId`、`spaceId`、`token`、端口号这些东西到底从哪来？这张表汇总了所有参数的来源：

| 参数 | 是什么 | 在哪找 |
|------|--------|--------|
| **端口号** | 远程访问端口，默认 `3847` | Halo 设置 → 远程访问 → "本地地址"，冒号后面的数字 |
| **密码 (Token)** | 远程访问 PIN 或自定义密码 | Halo 设置 → 远程访问 → "访问密码"，点"显示"查看 |
| **appId** | 数字人的 UUID | 第一步 `curl /api/apps` 返回的 `id` 字段，如 `"e7b3c9a1-..."` |
| **spaceId** | 空间 UUID | 同上，返回的 `spaceId` 字段。或者 Halo 设置 → 空间管理 |

---

## 第四步：让数字人自动调用另一个数字人

掌握了手动 `curl` 之后，接下来就是让数字人自己来做这件事。核心思路：

1. 把密码和端口通过 `config_schema` 变成用户可填的配置项
2. 在 `system_prompt` 里写好什么时候调、调谁的规则
3. 数字人的 AI 会自己执行 `Bash` 工具跑 `curl` 命令

---

### 完整示例：股票监控 + 告警通知

**场景**：App A（Stock Monitor）每 10 分钟查一次股价，发现波动超过阈值时，自动通知 App B（Alert Notifier）发邮件告警。

#### App A — 监控方

```yaml
spec_version: "1"
name: "Stock Monitor"
version: "1.0.0"
author: "your-name"
description: "每 10 分钟检测股价波动，超阈值时通知 Alert Notifier"
type: automation
icon: "trending-up"

system_prompt: |
  你是一个股价监控员。每 10 分钟自动执行一次。

  ## 配置（从 User Configuration 读取）
  - 访问密码：{halo_token}
  - 端口：{halo_port}      ← 默认 3847
  - 通知目标 ID：{alert_app_id}
  - 空间 ID：{space_id}
  - 监控标的：{symbols}    ← 逗号分隔，如 AAPL,GOOGL

  ## 任务步骤

  1. 获取 {symbols} 的当前股价。使用 web_search 或预先配置的数据源。
  2. 与上次记录的股价对比（读取 memory 中的 last_prices）。

  3. 对于波动超过阈值的标的，立即执行 Bash 命令通知 Alert Notifier：

  ```
  curl -s -X POST http://localhost:{halo_port}/api/apps/{alert_app_id}/chat/send \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer {halo_token}" \
    -d '{"spaceId":"{space_id}","message":"告警：<标的> 价格变化 <百分比>%，当前价 <当前价>"}'
  ```

  4. 更新 memory 中的 last_prices，准备下次对比。

  ## 禁止事项
  - 禁止用 WebFetch 代替 curl 发起 POST 请求（WebFetch 只能 GET，且返回的是 LLM 摘要）
  - 所有消息发送必须用 Bash + curl

subscriptions:
  - id: watch-trigger
    source:
      type: schedule
      config:
        every: "10m"

config_schema:
  - key: halo_token
    label: "Halo 远程访问密码"
    type: text
    required: true
    description: "Halo 设置 → 远程访问 → 访问密码"
  - key: halo_port
    label: "Halo HTTP 端口"
    type: number
    required: false
    description: "默认 3847"
  - key: alert_app_id
    label: "告警通知数字人 ID"
    type: text
    required: true
    description: "从 curl http://localhost:3847/api/apps 查询到的目标数字人 id"
  - key: space_id
    label: "空间 ID"
    type: text
    required: true
    description: "当前空间的 UUID"
  - key: symbols
    label: "监控标的"
    type: text
    required: true
    description: "逗号分隔，如 AAPL,GOOGL,TSLA"

memory_schema:
  last_prices:
    type: object
    description: "上次记录的各标的价格 {AAPL: 150.23, GOOGL: 140.56}"

output:
  notify:
    system: false
```

#### App B — 告警处理方

```yaml
spec_version: "1"
name: "Alert Notifier"
version: "1.0.0"
author: "your-name"
description: "接收告警消息并发送通知"
type: automation
icon: "bell"

system_prompt: |
  你是一个告警处理专家。你的工作方式是：
  - 正常情况下你处于空闲状态
  - 收到其他数字人的消息后，立即分析和处理

  ## 处理规则
  1. 分析收到的告警内容，判断严重程度
  2. 使用 notify_channel 工具发送通知
  3. 记录到 memory 避免 1 小时内重复通知同一标的

  ## 禁止事项
  - 禁止在未被调用时主动操作
  - 通知内容必须包含"告警来源"和"建议操作"

output:
  notify:
    system: true
    channels:
      - email

memory_schema:
  alerted_symbols:
    type: object
    description: "{AAPL: 1715000000000, ...} 记录最近通知时间和标的，用于去重"
```

---

#### 安装和配置

1. 在 Halo 中安装两个数字人
2. 打开 App A 的配置，填入：
   - `halo_token`：你的远程访问密码
   - `halo_port`：`3847`
   - `alert_app_id`：App B 的 UUID（通过前面的 `curl /api/apps` 获取）
   - `space_id`：当前空间 ID
   - `symbols`：`AAPL,GOOGL`

3. App B 不需要额外配置 — 它只接收消息，不主动调用别人

---

## 安全注意事项

### 密码不要硬编码在 spec 里

Token 通过 `config_schema` 由用户填入，而不是直接写在 `system_prompt` 中。system_prompt 里用 `{halo_token}` 这样的变量引用配置值。

```yaml
# ✓ 正确：通过变量引用
"Authorization: Bearer {halo_token}"

# ✗ 错误：硬编码（会泄漏给所有能看到 spec 的人）
"Authorization: Bearer 583921"
```

### 公网隧道场景

如果开启了公网隧道，任何知道公网地址和密码的人都可以调用你的数字人 API。建议：
- 不使用时关闭公网隧道
- 使用自定密码而非随机 PIN（便于管理）
- 定期更换密码

### 限制协作范围

- 不想让某个数字人被其他数字人调用？不给它配置密码即可
- 只想让特定数字人协作？只在这几个数字人的 config_schema 里配置密码

---

## 可选方案：Webhook（免密码）

上面的方式需要管理密码。如果你觉得麻烦，可以使用 Webhook —— 它不走密码认证，而是用 HMAC 签名。

App B 的 spec 中订阅一个 Webhook：

```yaml
subscriptions:
  - id: from-app-a
    source:
      type: webhook
      config:
        path: "app-a-to-b"
        secret: "你设置的共享密钥"
```

App A 的 system_prompt 中通过 Bash + curl 发送签名请求：

```bash
BODY='要发送的内容'
SIGNATURE=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "你设置的共享密钥" | sed 's/^.* //')
curl -s -X POST http://localhost:3847/hooks/app-a-to-b \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: sha256=$SIGNATURE" \
  -d "$BODY"
```

不需要密码了，但需要双方约定好 `secret`（共享密钥）。

---

## 当前限制

| 限制 | 影响 |
|------|------|
| 发消息是**异步**的，不等对方执行完就返回 | Chat 消息可通过轮询 `/chat/status` + `/chat/messages` 获取回复；自动化任务可轮询 `/state` 查看执行状态 |
| 没有"谁调了我"的回调机制 | 调用方无法自动获知被调用方的执行结果 |
| 自动化数字人**没有**内置的 `list_automation_apps` 或 `trigger_automation_app` 等便利工具 | 必须手动配置目标 App ID，不能运行时自动发现 |
| Webhook 的路径名必须是**全局唯一**的 | 多个数字人不能用同一个 webhook path |

---

## 下一步

- [创建数字人](/digital-humans/create) — 了解 spec 的完整写法
- [生产级数字人制作](/digital-humans/production-guide) — 把 curl 调用封装成 Skill 脚本
- [远程访问](/features/remote-access) — 管理远程访问开关和密码
