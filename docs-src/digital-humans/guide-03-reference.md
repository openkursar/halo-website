# 第三章：参考手册

需要时翻，不需要通读。

按主题分节，每一节独立可查。写数字人卡住了，从下面这张索引里找：

| 你卡在哪 | 看哪一节 |
|---|---|
| 不知道 Browser Action 该用什么模式 | [3.1](#_3-1-halo-browser-action-四种模式) |
| Action 写好了不工作 | [3.4](#_3-4-调试和排错) |
| AI 不按你的步骤跑 | [3.2](#_3-2-system-prompt-完整公式) |
| 每次都重复处理 | [3.3](#_3-3-memory-schema-设计模式) |
| 报错查不到原因 | [3.4](#_3-4-调试和排错) |
| 之前踩过的坑想避免 | [3.5](#_3-5-反模式集) |
| 字段语法忘了 | [3.6](#_3-6-spec-yaml-字段速查) 或 [DHP 协议](./dhp-protocol.md) |
| 想找现成的参考案例 | [3.7](#_3-7-数字人包索引) |

---

## 3.1 Halo Browser Action 四种模式

Browser Action 本质是一段在 Halo 浏览器里跑的 JS 脚本。根据它**怎么和目标平台交互**，分四种模式：

| 模式 | 适用场景 | 代表案例 |
|---|---|---|
| **A. API 代理型** | 目标系统有明确的 API 接口 | OA 审批、会议室预订、ITSM |
| **B. XHR 拦截型** | 数据通过 AJAX 加载但 API 没文档 | 小红书搜索、知乎话题 |
| **C. DOM 注入型** | 需要在网页上写入内容（评论、表单） | 小红书评论、社交平台发帖 |
| **D. 混合型** | 先 API 查数据，再做操作 | DPMS 研发流水线 |

---

### 模式 A：API 代理型

**核心思路**：直接 `fetch` 调用目标系统的 API，借用浏览器已登录的 cookie。

**适用场景**：

- 你知道目标系统的 API 接口（通过抓包或者就是你公司的内部系统）
- 接口用 cookie/session 鉴权
- 操作可以一次 HTTP 请求完成（查询、提交、更新）

**完整骨架（可直接复制）**：

```js
async (params) => {
  // 1. 参数解构，带默认值
  const {
    targetId,
    action = 'default',
    extra = null
  } = params || {}

  // 2. 入参校验（早失败早返回）
  if (!targetId) {
    return {
      success: false,
      error: 'targetId 是必填参数'
    }
  }

  try {
    // 3. 发起请求
    const resp = await fetch(
      `https://your-system.example.com/api/endpoint`,
      {
        method: 'POST',                        // 或 GET
        credentials: 'include',                // 关键：带上浏览器 cookie
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({                 // GET 时删掉 body
          id: targetId,
          action,
          extra
        })
      }
    )

    // 4. HTTP 错误处理
    if (!resp.ok) {
      const text = await resp.text()
      return {
        success: false,
        status: resp.status,
        error: resp.status === 401
          ? '未登录或登录已过期，请重新登录'
          : `HTTP ${resp.status}: ${text.slice(0, 200)}`
      }
    }

    // 5. 业务错误处理（接口返回 200 但业务失败）
    const data = await resp.json()
    if (data.code && data.code !== 0 && data.code !== '0') {
      return {
        success: false,
        error: data.message || data.msg || '业务失败'
      }
    }

    // 6. 成功返回
    return {
      success: true,
      data: data.result || data.data || data
    }
  } catch (e) {
    // 7. 网络/解析异常
    return {
      success: false,
      error: e.message || String(e)
    }
  }
}
```

**关键点逐条解释**：

| 关键点 | 为什么 |
|---|---|
| `credentials: 'include'` | 让 fetch 带上浏览器的 cookie。删了 100% 返 401 |
| `Content-Type: application/json` | 大部分内部系统 API 要求 JSON body |
| `if (!resp.ok)` 检查 | HTTP 层失败（4xx/5xx）必须捕获，不能假定成功 |
| 业务错误检查 | 很多系统 200 也可能失败（`code != 0`），要识别 |
| `try/catch` 包整体 | 网络异常、JSON 解析异常等兜底 |
| `return { success, ... }` 而不是 throw | AI 不会处理 JS 异常，必须用返回值告知 |
| 箭头函数 `async (params) => { ... }` | 这是 Browser Action 唯一合法的形式 |

**常见变体**：

```js
// 变体 1：GET 请求 + URL 参数
const resp = await fetch(
  `https://your-system.example.com/api/list?pageSize=30&keyword=${encodeURIComponent(keyword)}`,
  {
    method: 'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  }
)

// 变体 2：form-encoded body（老系统常见）
const formData = new URLSearchParams()
formData.set('id', targetId)
formData.set('action', action)

const resp = await fetch(url, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData.toString()
})

// 变体 3：多步操作（先查详情，再操作）
const detail = await fetch(`${base}/api/detail/${id}`, { credentials: 'include' }).then(r => r.json())
if (!detail.canApprove) {
  return { success: false, error: '无审批权限' }
}
const result = await fetch(`${base}/api/approve`, {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({ id, stepId: detail.currentStepId })
}).then(r => r.json())
```

---

### 模式 B：XHR 拦截型

**核心思路**：在脚本里 monkey-patch `XMLHttpRequest`，触发页面上的 UI 操作，让页面自己发请求，然后截获响应数据。

**适用场景**：

- 数据通过 AJAX 加载，但你不知道接口
- 直接 fetch 调接口会被反爬（缺少签名、需要复杂 token）
- 走页面 UI 流程能正常拿数据，但 DOM 提取太脆弱

**完整骨架**：

```js
async (params) => {
  const { keyword = '' } = params || {}

  // 1. 保存原始的 XHR 方法，准备复原
  const origOpen = XMLHttpRequest.prototype.open
  const origSend = XMLHttpRequest.prototype.send
  const captured = []

  try {
    // 2. monkey-patch open，记录 URL
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this.__capturedUrl = url
      this.__capturedMethod = method
      return origOpen.call(this, method, url, ...rest)
    }

    // 3. monkey-patch send，监听 response
    XMLHttpRequest.prototype.send = function (body) {
      this.addEventListener('load', function () {
        // 只截获我们关心的接口
        if (this.__capturedUrl && this.__capturedUrl.includes('/api/search')) {
          try {
            captured.push({
              url: this.__capturedUrl,
              status: this.status,
              data: JSON.parse(this.responseText)
            })
          } catch (e) {
            // 不是 JSON，跳过
          }
        }
      })
      return origSend.call(this, body)
    }

    // 4. 触发 UI 操作。两种方式：
    // 方式一：直接调用框架内部方法（最稳）
    if (window.__VUE_APP__ && window.__VUE_APP__.search) {
      await window.__VUE_APP__.search(keyword)
    } else {
      // 方式二：模拟用户点击（兼容性好）
      const input = document.querySelector('input[type="search"]')
      input.focus()
      input.value = keyword
      input.dispatchEvent(new Event('input', { bubbles: true }))

      const searchBtn = document.querySelector('button[data-testid="search-btn"]')
      searchBtn.click()
    }

    // 5. 等待响应（关键：要等到拦截到数据）
    const timeout = 10000
    const start = Date.now()
    while (captured.length === 0 && Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 200))
    }

    if (captured.length === 0) {
      return {
        success: false,
        error: '超时未拦截到 API 响应，UI 可能没触发请求'
      }
    }

    // 6. 处理拦截到的数据
    const allItems = captured.flatMap(c => c.data.items || [])
    return {
      success: true,
      items: allItems,
      count: allItems.length
    }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  } finally {
    // 7. 必须复原！否则后续运行会被拦截器干扰
    XMLHttpRequest.prototype.open = origOpen
    XMLHttpRequest.prototype.send = origSend
  }
}
```

**关键点**：

| 关键点 | 为什么 |
|---|---|
| **必须有 `finally` 复原拦截器** | 不复原，下次跑会反复拦截，数据混乱 |
| **要等到 captured 有数据再返回** | UI 触发请求是异步的，不等就拿空数据 |
| **只截获关心的接口** | 页面会有大量其他 XHR（埋点、心跳），全收会混乱 |
| **优先调用框架内部方法** | 比模拟点击稳定，不依赖 UI 选择器 |
| **超时兜底** | UI 可能因为各种原因没触发，必须有兜底 |

---

### 模式 C：DOM 注入型

**核心思路**：往页面里输入内容（评论、回复、表单），然后触发提交。

**适用场景**：

- 在网页上发评论、发帖、提交表单
- 通过 API 直接提交会缺少前端生成的签名/token
- 走页面流程是最稳的提交方式

**核心难点**：现代框架（Vue/React）的输入框是受控组件——你直接 `input.value = 'xxx'` 不会触发框架的内部状态更新。提交时框架读取的还是空字符串。

**完整骨架**：

```js
async (params) => {
  const { text } = params || {}

  if (!text) {
    return { success: false, error: 'text 是必填参数' }
  }

  // 监听提交后的响应
  const origOpen = XMLHttpRequest.prototype.open
  let submitResult = null

  try {
    // 1. 准备拦截提交响应
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      if (url.includes('/api/comment') && method === 'POST') {
        this.addEventListener('load', function () {
          try {
            submitResult = JSON.parse(this.responseText)
          } catch (e) {}
        })
      }
      return origOpen.call(this, method, url, ...rest)
    }

    // 2. 找到输入框
    const input = document.querySelector('[contenteditable="true"]')
      || document.querySelector('textarea.comment-input')
    if (!input) {
      return { success: false, error: '找不到评论输入框' }
    }

    // 3. 用 execCommand 注入文本（关键：会触发框架状态更新）
    input.focus()
    document.execCommand('selectAll', false, null)
    document.execCommand('insertText', false, text)

    // 部分 React 应用需要这种方式
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set
    if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
      nativeInputValueSetter.call(input, text)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }

    // 4. 等待框架更新（通常 100-300ms）
    await new Promise(r => setTimeout(r, 300))

    // 5. 点击提交
    const submitBtn = document.querySelector('button.submit-btn')
    if (!submitBtn || submitBtn.disabled) {
      return { success: false, error: '提交按钮不可用，可能内容未注入成功' }
    }
    submitBtn.click()

    // 6. 等待提交响应
    const timeout = 8000
    const start = Date.now()
    while (!submitResult && Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 200))
    }

    if (!submitResult) {
      return { success: false, error: '提交超时，未收到响应' }
    }
    if (submitResult.code !== 0 && submitResult.code !== '0') {
      return { success: false, error: submitResult.message || '提交失败' }
    }

    return {
      success: true,
      commentId: submitResult.data?.id,
      text
    }
  } catch (e) {
    return { success: false, error: e.message }
  } finally {
    XMLHttpRequest.prototype.open = origOpen
  }
}
```

**关键点**：

| 关键点 | 为什么 |
|---|---|
| `execCommand('insertText')` | 会触发框架的 input 事件，比直接 `value=` 稳 |
| 同时 dispatch `input` 事件 | 兜底，让框架感知到变化 |
| 等待 300ms 让框架更新 | 框架的 setState 是异步的，立即点提交会拿到旧值 |
| 检查 `submitBtn.disabled` | 框架感知到内容后才会启用按钮，没启用说明注入失败 |
| 拦截 POST 响应确认成功 | 不能只看按钮点了，要看接口真的返回成功 |

::: warning 为什么不用 browser_fill

`browser_fill` 是 AI 工具，每次调用都要 AI 推理、要看 DOM 快照、有不确定性。在 Browser Action 内部用 `browser_fill` 反而失去了"确定性脚本"的优势——你应该直接在 JS 里操作 DOM。
:::

---

### 模式 D：混合型

**核心思路**：先用 API 查数据做判断，再用 API 或 DOM 操作执行。

**适用场景**：

- 多步业务流转（查 → 决策 → 操作 → 验证）
- 数据来源和操作渠道不同（比如查走 API、提交走 DOM）
- 操作前需要前置检查（权限、状态、冲突）

这种模式实际是模式 A/B/C 的组合，没有单独的骨架。设计要点：

**1. 每个步骤单独成 Action，不要堆在一个文件里**

```
skills/
  ├── query-target/index.js       ← 模式 A：查目标信息
  ├── check-permission/index.js   ← 模式 A：检查权限
  ├── submit-action/index.js      ← 模式 C：DOM 提交
  └── verify-result/index.js      ← 模式 A：验证结果
```

**2. 串联逻辑放在 system_prompt，不要放在 Action 里**

```yaml
system_prompt: |-
  ## 第一步：查目标信息
  browser_run({ file: ".../query-target/index.js", params: { id } })
  → 失败：停止，报告"找不到目标"

  ## 第二步：检查权限
  browser_run({ file: ".../check-permission/index.js", params: { id } })
  → canOperate=false：跳过，报告"无权操作"

  ## 第三步：执行操作
  browser_run({ file: ".../submit-action/index.js", params: { id, action } })
  → 失败：报告，但不停止整个流程

  ## 第四步：验证
  browser_run({ file: ".../verify-result/index.js", params: { id } })
  → 不一致：升级给用户
```

**3. Action 之间通过参数传递状态**

每个 Action 是无状态的——上一步的返回值由 AI 提取关键字段，作为下一步的参数。不要让 Action 之间共享全局变量。

---

### 怎么选模式：决策树

```
你要操作的目标系统...

├── 有明确的 API 文档 / 你抓过包知道接口
│   └── 用 模式 A（API 代理型）
│
├── 数据靠 AJAX 加载，没文档，直接调接口会被拦
│   └── 用 模式 B（XHR 拦截型）
│
├── 要往页面写内容（评论、发帖、表单）
│   ├── 接口直接提交可行（有完整 token）
│   │   └── 用 模式 A
│   └── 必须走页面流程
│       └── 用 模式 C（DOM 注入型）
│
└── 多步业务流转
    └── 用 模式 D，每步用 A/B/C 组合
```

---

## 3.2 system_prompt 完整公式

system_prompt 是数字人的灵魂。写得好的 prompt 让弱模型也能稳定干活，写得差的让强模型也跑飞。

### 标准结构（6 段）

```
你是[一句话角色定义]
严格按照下面的步骤执行，不要跳步，不要自由发挥。

## 禁止事项
- 禁止 X
- 禁止 Y
- 禁止 Z

## 配置
从 User Configuration（JSON）读取。缺失项使用默认值：
- key_a: 默认值（说明）
- key_b: 默认值

## 第一步：[操作名]
1. 调用：[精确的工具调用语法]
2. 等待 / 检查
3. 失败处理：...

## 第二步：[...]

## 最后一步：更新记忆并报告
1. 更新 memory：...
2. 生成 Markdown 报告：...
3. 调用：report_to_user(type="run_complete", summary="...")
```

### 每段怎么写

**第 1 段：角色声明**

一句话。明确身份和场景。

```
你是一名 [公司名] OA 待办审批助手，
负责定时检查待审批列表并根据用户配置的规则自动处理或汇报。
```

不要写成 "你是一个智能助手"——太模糊，AI 会自由发挥。

**第 2 段：禁止事项（最关键）**

这一节是防止弱模型"自由发挥"的围栏。**绝对不能删**。

每条禁止项来自一个真实的失败案例。常见禁止项：

```
## 禁止事项
- 禁止用 browser_click / browser_fill 操作 [系统名] 页面。
  所有数据操作只能通过 browser_run 调用 skill 脚本。

- 禁止用 Skill 工具或 Task 工具调用 skill。只能用 browser_run。
  （原因：Skill 工具是给用户对话用的，自动化运行必须用 browser_run）

- 禁止自己拼接 API URL 或直接 fetch 接口。
  必须通过封装好的 skill 脚本。

- 禁止在 success: false 时尝试补救操作。
  失败就跳过，记录原因，继续下一项。

- 禁止在未经用户确认的情况下执行高风险操作（删除、转账、批量审批）。
```

写禁止项的方法：**每次数字人跑飞了，问"它做了什么不该做的"，然后加一条禁止**。

**第 3 段：配置读取**

明确告诉 AI 从用户配置里读什么：

```
## 配置
从 User Configuration（JSON）读取。缺失项使用默认值：
- target_url: ""（必填，不填则报错停止）
- max_per_run: 10（单次最多处理数量）
- enable_auto_action: false（是否自动执行）
- notify_channels: ["system"]（通知渠道）
```

**第 4 段及之后：编号步骤**

每一步 = 一次工具调用。写出**精确语法**：

```
## 第一步：建立浏览器会话

打开目标系统首页：
```
browser_new_page({ url: "https://your-system.example.com" })
```

等待加载：
```
browser_wait_for({ text: "登录", timeout: 15000 })
```

失败处理：超时或报错 → 停止本次运行，报告"无法连接 [系统名] 或未登录"。
```

**绝对不要**写成"打开系统页面，等加载完成"这种自然语言——弱模型会自己想办法，可能用错工具。

**最后一段：报告**

```
## 最后一步：更新记忆并报告

1. 更新 memory.md：
   - 追加本次 processed_ids（上限 2000）
   - 设置 last_run_at = 当前时间
   - 更新 stats

2. 生成 Markdown 报告，包含：
   ### 处理概览
   - 本次处理：N 个
   - 成功：M 个
   - 失败：K 个

   ### 失败明细（如有）
   - ID: xxx, 原因: yyy

3. 调用 report_to_user(type="run_complete", summary=<上面的报告>)
```

### report_to_user 三种类型

| type | 什么时候用 |
|---|---|
| `run_complete` | 正常结束。每次运行都必须有一次。 |
| `milestone` | 中间发现重要事件（监控类常用：发现新内容、价格达标、告警）。 |
| `escalation` | 拿不准要不要做。暂停运行，等用户回答。 |

```
# 正常结束
report_to_user(type="run_complete", summary="本次处理 5 个待办...")

# 中途有重要发现
report_to_user(type="milestone", summary="价格已降至目标值 199 元")

# 升级给用户
report_to_user(
  type="escalation",
  summary="检测到金额 50000 元的审批，超出自动审批阈值，请确认是否同意"
)
```

### 完整 prompt 示例

参考第二章 [OA 审批助手案例](./guide-02-build.md#案例二：oa-审批助手) 里的完整 system_prompt。

---

## 3.3 memory_schema 设计模式

memory 是数字人的"记性"——跨次运行保留的数据。没有 memory，数字人每次都从头开始，会重复处理、重复通知。

### 常用字段

每个数字人几乎都需要这几个字段：

```yaml
memory_schema:
  last_run_at:
    type: date
    description: 最近一次成功运行的时间戳

  processed_ids:           # 或叫 processed_todos / seen_items / handled_records
    type: array
    description: 已处理的项目 ID，防止重复处理

  stats:
    type: object
    description: 累计统计（total_processed, total_failed 等）

  consecutive_failures:    # 可选，连续失败计数
    type: number
    description: 连续失败次数，达到阈值后告警
```

### 两种去重策略

**策略 1：ID 数组（简单）**

适合只需要"知道哪些处理过"的场景：

```yaml
memory_schema:
  processed_ids:
    type: array            # ["id_1", "id_2", "id_3", ...]
    description: 已处理 ID，上限 2000 条
```

prompt 里这样用：

```
## 第一步：读取 memory，过滤已处理项
读取 memory.processed_ids
拉取最新列表后，过滤掉 id 在 processed_ids 中的项

## 最后：更新 memory
将本次处理的 id 追加到 processed_ids 末尾
如果总长度超过 2000，从头部删除直到 = 2000
```

**策略 2：ID-Object 映射（带元数据）**

适合需要记录每条记录的处理结果、时间、状态的场景：

```yaml
memory_schema:
  processed_records:
    type: object
    description: |
      已处理记录 { [id]: { action, timestamp, result, error } }
      上限 1000 条，按时间戳清理最早的
```

prompt 里这样用：

```
## 第一步：读取 memory
读取 memory.processed_records

## 处理时
对每条记录处理后，写入 memory.processed_records[id] = {
  action: "approve",
  timestamp: <now>,
  result: "success",
  error: null
}

## 最后：清理
如果 memory.processed_records 条数超过 1000，
按 timestamp 删除最早的，保留最近 1000 条
```

### 选哪种策略

| 你需要... | 用 |
|---|---|
| 只需要知道"是否处理过" | 策略 1 |
| 需要记录"处理时做了什么" | 策略 2 |
| 需要记录"处理失败原因" | 策略 2 |
| 数据量很大（10000+） | 策略 1，控制长度 |

---

## 3.4 调试和排错

### 报错对照表

| 报错 | 原因 | 怎么修 |
|---|---|---|
| `HTTP 401 Unauthorized` | 未登录 / 登录过期 | 点数字人详情页地球图标，重新登录目标系统 |
| `HTTP 403 Forbidden` | 缺少 CSRF Token / 无权限 | 检查接口是否需要额外 header；检查账号权限 |
| `HTTP 404 Not Found` | URL 拼错 | 打开目标系统抓真实接口，比对 URL |
| `HTTP 429 Too Many Requests` | 频率限制 | 降低 schedule 频率；Action 里加 `await sleep(1000)` |
| `Network Error` | 网络断 / DNS / CORS | 检查 VPN；检查目标域名能否访问 |
| `Unexpected token in JSON` | 接口返回不是 JSON（可能是 HTML 登录页） | 通常 = 未登录跳到登录页。先处理 401 |
| `success: false` 没具体原因 | Action 返回了错误但没说明白 | 改 Action，在 catch 里 `error: e.stack` 或 `error.message` |
| AI 不调你的 Action | prompt 写得不够精确 | 用精确的 `browser_run({ file: "..." })` 语法 |
| AI 调错 Action | prompt 里步骤描述模糊 | 在每步标题里写明"调用 oa-todo-list 查待办" |
| 每次重复处理同一条 | memory 没生效 | 检查 prompt 里有没有"读 memory → 过滤"步骤 |
| 跑得不稳定 | prompt 给 AI 自由发挥空间太大 | 加禁止事项；改成精确语法；用 Qwen 测试 |

### 调试单个 Browser Action

不需要每次都跑完整数字人，可以单独测试一个 Action。在 Halo 对话里：

```
帮我跑一下这个 skill 测试一下：
.claude/skills/oa-todo-list/index.js

参数：{ pageSize: 5, withDetail: false }
```

Halo 会调用 `browser_run` 执行这个 Action，返回结果。看结果定位问题。

### 比对页面真实请求 vs Action 请求

数字人跑不通时，对比"页面自己发的请求"和"Action 发的请求"，差异点就是问题。

1. 打开目标系统，按 F12 → Network 标签
2. 手动操作一次（比如手动审批一条）
3. 观察 Network 里的请求：URL、Method、Headers、Body
4. 对比 Action 代码里的 fetch 是否一致

常见差异：
- 缺 `X-CSRF-Token` header
- Content-Type 不对（form-encoded vs JSON）
- 缺 `Referer` header（部分系统会校验）
- 参数大小写不一致

### 登录态过期的应对

cookie 过期是最常见的失败原因。两种应对：

**方式 1：在 Action 里检测并提示**

```js
if (resp.status === 401 || resp.status === 302) {
  return {
    success: false,
    error: '登录已过期，请到数字人详情页点击地球图标重新登录',
    needLogin: true
  }
}
```

**方式 2：在 prompt 里升级处理**

```
如果连续 3 次 Action 返回 needLogin=true：
调用 report_to_user(
  type="escalation",
  summary="登录已过期，请重新登录 OA 后回复「已登录」"
)
```

---

## 3.5 反模式集

来自真实失败案例。看这一节避免重复踩坑。

### 反模式 1：裸 URL 导航

❌ **错误**：让 AI 自己拼接 URL 直接访问

```
prompt:
  第三步：访问 https://platform.com/item/{itemId} 查看详情
```

**问题**：很多平台要求 URL 携带 session token（防直接访问），裸 URL 会 302 跳转到首页或登录页。

✅ **正确**：让 Browser Action 返回完整链接（包含 token）

```js
// Action 返回
return {
  success: true,
  items: data.list.map(item => ({
    id: item.id,
    link: `https://platform.com/item/${item.id}?token=${encodeURIComponent(item.token)}`
  }))
}
```

```
prompt:
  第三步：使用上一步返回的 items[i].link 访问详情
```

---

### 反模式 2：模糊的 Action 调用

❌ **错误**：

```
prompt:
  第二步：调用搜索 skill 查找帖子
```

**问题**：弱模型不知道用什么工具调，可能用 `Skill("search")` 或 `Task("search")`，找不到正确的方法。

✅ **正确**：

```
prompt:
  第二步：调用搜索 skill
  ```
  browser_run({
    file: ".claude/skills/xhs-search/index.js",
    params: { keyword: "..." }
  })
  ```
```

---

### 反模式 3：用 DOM 工具操作 Action 已处理的元素

❌ **错误**：

```
prompt:
  第三步：调用 xhs-comment skill 发评论
  第四步：用 browser_click 点击"发布"按钮确保发出
```

**问题**：第四步会和 Action 内部的提交逻辑冲突，造成重复提交或竞态错误。

✅ **正确**：第三步的 Action 自己完整处理输入、提交、确认。Prompt 里不要再追加 DOM 操作。

---

### 反模式 4：失败后尝试补救

❌ **错误**：

```
prompt:
  如果 Action 返回 success: false：
    1. 截图当前页面
    2. 尝试点击"确认"按钮
    3. 再次调用 Action
```

**问题**：弱模型会无限循环尝试，token 烧光，状态搞乱。

✅ **正确**：

```
prompt:
  如果 Action 返回 success: false：
    跳过本项，记录错误原因，继续下一项。
    禁止任何补救操作。
```

---

### 反模式 5：登录态误判

❌ **错误**：

```js
// 数据 API 不需要登录可用
const list = await fetch('/api/public/list', { credentials: 'include' })
return { success: true, items: list, logged_in: true }
```

**问题**：只读 API 不要登录也能返回数据，但操作 API 需要登录。Action 错报 `logged_in: true`，导致后续操作 API 全部 401。

✅ **正确**：

```js
// 用一个需要登录的 endpoint 判断
const meResp = await fetch('/api/user/me', { credentials: 'include' })
if (meResp.status === 401) {
  return { success: false, error: '未登录' }
}
```

---

### 反模式 6：首次导航没用 browser_new_page

❌ **错误**：

```
prompt:
  第一步：browser_navigate({ url: "..." })
```

**问题**：自动化运行启动时**没有任何活跃页面**，`browser_navigate` 找不到要导航的页面，报错。

✅ **正确**：

```
prompt:
  第一步：browser_new_page({ url: "..." })
```

`browser_new_page` 会创建新页面再导航，自动化场景下必须用这个。

---

### 反模式 7：禁止事项被删

❌ **错误**：用户改 prompt 时觉得"禁止事项太啰嗦"，删了。

**问题**：AI（尤其弱模型）会立刻自由发挥——自己拼 URL、用错工具、跳步执行。

✅ **正确**：禁止事项每条都对应一个曾经的失败案例，不要删。如果发现 AI 又出新问题，就**加一条**。

---

## 3.6 spec.yaml 字段速查

只列常用字段。完整规范见 [DHP 协议](./dhp-protocol.md)。

### 顶部信息

```yaml
spec_version: "1"               # 固定 "1"
name: "数字人名字"               # 必填
version: "1.0.0"                # 必填
author: "作者"                   # 必填
description: "一句话描述"        # 必填
type: automation                # 固定 automation（其他类型见 DHP 协议）
icon: "automation"              # 可选，图标
```

### 触发

```yaml
subscriptions:
  - id: my-trigger              # 可选
    source:
      type: schedule
      config:
        every: "1h"             # 或 cron: "0 8 * * *"
    frequency:                  # 可选，让用户调节
      default: "1h"
      min: "15m"
      max: "24h"
```

duration 写法：`"30s"` `"5m"` `"2h"` `"1d"`

cron 写法：

| cron | 含义 |
|---|---|
| `"0 8 * * *"` | 每天 8 点 |
| `"*/30 * * * *"` | 每 30 分钟 |
| `"0 9 * * 1-5"` | 周一到周五 9 点 |
| `"0 0 1 * *"` | 每月 1 号 0 点 |

### 用户配置

```yaml
config_schema:
  - key: target_url
    label: "目标地址"
    type: url                   # string | text | number | boolean | url | email | select
    required: true
    description: "..."
    default: ""
    placeholder: "https://..."

  - key: mode
    label: "模式"
    type: select
    options:
      - { label: "保守", value: "safe" }
      - { label: "激进", value: "aggressive" }
    default: safe
```

### 依赖

```yaml
permissions:
  - ai-browser                  # 需要浏览器能力

requires:
  mcps:
    - id: ai-browser
      reason: "操作网页"

  skills:                       # Halo Browser Action 在这里声明
    - id: my-action
      bundled: true
      files: [SKILL.md, index.js]
      reason: "..."
```

### 记忆

```yaml
memory_schema:
  last_run_at:
    type: date
    description: "..."
  processed_ids:
    type: array
    description: "..."
```

### 输出

```yaml
output:
  notify:
    system: true                # 桌面通知
    channels:                   # 外部通道
      - email
      - wecom
      - feishu
      - dingtalk
      - webhook
  format: markdown
```

### 浏览器登录

```yaml
browser_login:
  - url: "https://your-system.example.com"
    label: "你的系统名"
```

### 升级机制

```yaml
escalation:
  enabled: true                 # 默认 true
  timeout_hours: 24             # 用户多久不回，视为失败
```

---

## 3.7 数字人包索引

### 公开商店里的数字人

可以一键安装、直接参考、改造。

| 包名 | 类型 | 适合改造成 |
|---|---|---|
| `hn-daily-brief` | 纯 prompt | 公开网站采集 + 邮件摘要 |
| `github-pr-reviewer` | 纯 prompt + shell | GitHub PR 自动 review |
| `github-issue-triager` | 纯 prompt + webhook | Issue 自动分类 |
| `price-hunter` | 纯 prompt | 价格/库存/排名监控 |
| `site-health-monitor` | 纯 prompt | 网站可用性监控 |
| `sentiment-monitor` | 纯 prompt | 关键词舆情跟踪 |
| `tender-radar` | 纯 prompt | 招标公告监控 |
| `dependency-vulnerability-scanner` | 纯 prompt + shell | 依赖漏洞扫描 |
| `cicd-failure-analyst` | 纯 prompt + webhook | CI 失败分析 |
| `changelog-generator` | 纯 prompt + git | 自动 changelog |
| `complexity-watchdog` | 纯 prompt + 文件监听 | 代码复杂度监控 |
| `release-gatekeeper` | 纯 prompt | 发布前检查 |
| `ticket-triage-agent` | 纯 prompt + webhook | 工单分类 |
| `wechat-article-monitor` | 纯 prompt | 公众号文章跟踪 |
| `zhihu-topic-monitor` | 纯 prompt | 知乎话题跟踪 |

仓库：[digital-human-protocol/packages/digital-humans](https://github.com/openkursar/digital-human-protocol/tree/main/packages/digital-humans)

### Halo Browser Action 型参考

带 `skills/` 目录的，看 Browser Action 怎么写：

| 包名 | 模式 | 适合改造成 |
|---|---|---|
| `meeting-room-booker` | 模式 A：API 代理 | 内部系统 API 自动化 |
| `oa-approval-agent`（脱敏版） | 模式 A：API 代理 | OA / ITSM / CRM 审批 |
| `xiaohongshu-engager` | 模式 B + C：XHR + DOM | 社交平台搜索 + 评论 |

---

## 还有问题？

如果这一章里没找到答案：

- 看完整字段规范 → [DHP 协议](./dhp-protocol.md)
- 看历史版本的复杂案例 → [生产级数字人制作](./production-guide.md)
- 不确定怎么设计 → 在 Halo 对话里直接问 AI："参考 [某个数字人]，我想做 [需求]，应该用什么模式？"

---

← 回到 [第二章：改造一个数字人](./guide-02-build.md)
