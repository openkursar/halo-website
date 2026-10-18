---
title: "数字人 spec 参考手册：spec.yaml 全部字段说明"
description: "数字人 spec.yaml 参考：每个字段的类型、默认值和可选值，Halo 会检查的规则，以及写了也没有效果的字段。"
type: reference
audience: [developer]
---

# 数字人 spec 参考

数字人由它的 spec 定义：指令、触发方式、设置表单、能力和依赖都写在里面。本页列出 Halo 接受的每个字段、它会检查的规则，以及可以写但不会生效的字段。

## spec 在哪里 {#where}

你很少需要从空白文件写起：

- **直接让 Halo 来做。** 在会话里说清楚要做的事，Halo 会写好 spec 并安装。见[创建数字人](/digital-humans/create)。
- **查看或修改已有的 spec。** 打开数字人，进入 **能力与设置**，切到 **YAML** 标签页。这里显示完整的 spec，点 **保存** 时会检查你的修改，**导出** 可以把它存成文件。
- **打包。** 数字人包把 spec 放在根目录的 `spec.yaml` 里。见 [DHP 协议](/developers/dhp)。

也可以请 Halo 修改已安装的数字人，或用 [`PATCH /api/apps/:appId/spec`](/developers/api/digital-human#patch-api-apps-appid-spec) 发送要改的顶层字段。

## 一个最小的 spec {#minimal}

```yaml
name: 每周销售汇总
version: "1.0.0"
author: example
description: 每周一汇总上周的订单并报告总数。
type: automation
system_prompt: |
  你负责每周的销售汇总。
  1. 读取工作区里的 orders.csv。
  2. 把每个产品的合计写进 report.md。
  3. 用 report_to_user 报告变化最大的三项。
  绝不删除或改写 orders.csv。
subscriptions:
  - id: weekly
    source:
      type: schedule
      config:
        cron: "0 9 * * 1"
```

数字人必填的字段是 `name`、`version`、`author`、`description`、`type` 和 `system_prompt`。由 Halo 助手创建时，没写的 `version` 和 `author` 会被填为 `1.0` 和 `Halo`；导入的文件必须自己写上。

## Halo 检查的规则 {#rules}

安装或修改 spec 时，Halo 会校验它，不通过时指出出错的字段：

- `cron` 必须是有效且还会再触发的 cron 表达式；`every` 必须形如 `30m`、`2h`、`1d`。定时触发至少要有其中一个。
- 触发器的 id 不能重复，触发器的 `config_key` 必须是已有的 `config_schema` key。
- `select` 类型的设置至少要有一个选项。
- `browser_login[].url`、`store.homepage` 和 `store.repository` 必须是 URL。

Halo 不认识的字段会被直接丢弃，不报错，所以字段名写错了只会悄无声息地不起作用。手写 spec 后，请对照下面的字段表检查。

Halo 读取 `spec.yaml` 文件时（**导入**，或 [`POST /api/apps/import-spec`](/developers/api/digital-human#post-api-apps-import-spec)），还接受几个旧写法：用 `inputs` 代替 `config_schema`，用 `required_mcps` 和 `required_skills` 代替 `requires.mcps` 和 `requires.skills`，用 `input` 代替 `config_key`，以及把触发器写成 `- type: schedule`、`config` 直接写在旁边而不是放在 `source` 下。新写的 spec 请用现在的写法。

## 字段 {#fields}

字段路径里，`[]` 表示列表中的每一项，`<…>` 表示映射的键。路径后面括号里的值，例如（`schedule`），表示该字段只用于这种触发类型。

<!-- generated:spec-fields automation -->
_本表由 Halo 3.0.4 的 schema 生成。_

### 顶层字段 {#fields-top}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `spec_version` | `string` | 否 | = `"1"` | spec 格式的版本。不用写，Halo 会填为 `"1"`。 |
| `name` | `string`（非空） | 是 | — | 大家看到的名字。对技能来说它也是文件夹名和斜杠命令，所以非 ASCII 的技能名会被转成 ASCII 命令名，原名保存在 `display_name`。 |
| `display_name` | `string` | 否 | — | `name` 不适合直接显示时使用的名字，例如用中文命名的技能。`i18n` 中对应语言的名字优先。 |
| `version` | `string`（版本号） | 是 | — | 这个包的版本，例如 `1.0.0`。发布到商店的新版本必须更高。 |
| `author` | `string`（非空） | 是 | — | 作者。发布后它会成为商店地址的命名空间：`<author>/<name>`。技能可以不写。 |
| `description` | `string`（非空） | 是 | — | 用一两句话说明它做什么，显示在列表和商店里。 |
| `icon` | `string` | 否 | — | 一个 emoji 或图片 URL。其他值会退回类型图标；没有图标的数字人会得到自动生成的头像。 |
| `permissions` | `string[]` | 否 | — | 安装时要打开的能力：`ai-browser`、`ai-terminal`、`email`、`im-push`（这四项默认就是开的），以及默认关闭的 `halo-api-ref`（操作 Halo）和 `conversation-collab`（对话协作）。spec 只能增加能力，用户仍可以关掉其中任何一项。 |
| `requires` ([见下文](#field-requires)) | `object` | 否 | — | 依赖的 MCP 服务器和技能。 |
| `config_schema` ([见下文](#field-config-schema)) | `object[]` | 否 | — | 用户在安装时填写、之后还能修改的设置表单。每次运行和聊天，数字人都会拿到按 `key` 给出的当前值，未填写的用默认值补上。 |
| `store` ([见下文](#field-store)) | `object` | 否 | — | 商店条目信息，发布或从商店安装时使用。 |
| `i18n` ([见下文](#field-i18n)) | `map<string, object>` | 否 | — | 名称、简介、设置表单和登录标签的翻译，按语言标签区分，例如 `en`、`zh-CN`。 |
| `type` | `literal` | 是 | `automation` | 包的类型：`automation`（数字人）、`mcp`、`skill`，或保留的 `extension`。 |
| `system_prompt` | `string`（非空） | 是 | — | 数字人的指令：它的角色、步骤、绝不能做的事，以及什么时候要来问人。它自己做的一切都由这段文字决定。 |
| `subscriptions` ([见下文](#field-subscriptions)) | `object[]` | 否 | — | 它什么时候自己开始运行。只回复聊天和机器人消息的数字人不需要写。 |
| `filters` ([见下文](#field-filters)) | `object[]` | 否 | — | **无效果：** 可以写，但不会被读取。本意是在运行开始前过滤事件的规则。请把这类条件写进系统提示词。 |
| `memory_schema` ([见下文](#field-memory-schema)) | `map<string, object>` | 否 | — | 数字人在两次运行之间要记在记忆文件里的内容，例如已处理的 id、上次运行时间。它是给 AI 的指引，不会被校验。 |
| `output` ([见下文](#field-output)) | `object` | 否 | — | **无效果：** 可以写，但不会被读取。本意是配置通知和输出格式。请在系统提示词里写明要发通知：数字人会通过 设置 里配置的通知通道发送。 |
| `escalation` ([见下文](#field-escalation)) | `object` | 否 | — | 它的提问等待回答的时长。数字人随时都可以停下来提问。 |
| `recommended_model` | `string` | 否 | — | 推荐使用的模型。在用户选择模型的地方作为提示显示，不会自动切换模型。 |
| `browser_login` ([见下文](#field-browser-login)) | `object[]` | 否 | — | 数字人工作前，用户需要在 AI 浏览器里登录的网站。Halo 会请用户登录，数字人永远拿不到密码。 |

### `requires` {#field-requires}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `mcps` | `object[]` | 否 | — | 它使用的 MCP 服务器。运行只拿到这里列出的服务器；其中有服务器没有安装、被关闭、等待登录或连接失败时，运行不会开始。聊天时它能用工作区和全局的全部服务器，标了 `enabled: false` 的除外。 |
| `mcps[].id` | `string`（非空） | 是 | — | 已安装的 MCP 服务器的 id。 |
| `mcps[].reason` | `string` | 否 | — | 为什么需要这个服务器，显示在依赖旁边。 |
| `mcps[].bundled` | `boolean` | 否 | — | **无效果：** 可以写，但不会被读取。本意是标记随包附带的 MCP 服务器。 |
| `mcps[].enabled` | `boolean` | 否 | — | 设为 `false` 会保留声明，但这位数字人在运行和聊天中都不再使用这个服务器。服务器本身对其他人照常可用。 |
| `skills` | `(string \| object)[]` | 否 | — | 随它一起安装的技能，可以写 id 或对象。它所在工作区和全局范围里的技能本来就都能用；这个列表只决定要安装哪些。 |
| `skills[].id` | `string`（非空） | 是 | — | 技能 id。 |
| `skills[].reason` | `string` | 否 | — | 为什么需要这个技能。 |
| `skills[].bundled` | `boolean` | 否 | — | 技能放在包内 `skills/<id>/` 下、而不是来自商店时设为 `true`。 |
| `skills[].files` | `string[]` | 否 | — | 包内技能的文件列表，路径相对于 `skills/<id>/`，例如 `SKILL.md` 和 `index.js`。 |

### `config_schema` {#field-config-schema}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `key` | `string`（非空） | 是 | — | 设置项的唯一 key。 |
| `label` | `string`（非空） | 是 | — | 表单上显示的标签。 |
| `type` | `enum` | 是 | `url`, `text`, `string`, `number`, `select`, `boolean`, `email` | 输入控件。`text` 是多行，`string` 是单行。没有密码或密钥类型，因为这些值会以明文交给 AI：需要登录的网站请用 `browser_login`。 |
| `description` | `string` | 否 | — | 字段下方的说明文字。 |
| `required` | `boolean` | 否 | — | 在表单上标为必填。 |
| `default` | `any` | 否 | — | 用户修改之前使用的值。 |
| `placeholder` | `string` | 否 | — | 字段为空时显示的提示。 |
| `options` | `object[]` | 否 | — | `select` 字段的选项，至少一个。 |
| `options[].label` | `string`（非空） | 是 | — | 选项的文字。 |
| `options[].value` | `string \| number \| boolean` | 是 | — | 选中后保存的值。 |

### `store` {#field-store}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `slug` | `string` | 否 | — | 包在商店里的地址。发布时会自动设为 `<author>/<name>`。 |
| `category` | `string` | 否 | — | 在商店里归属的分类。 |
| `tags` | `string[]` | 否 | = `[]` | 帮助别人在商店里找到它的标签。 |
| `locale` | `string` | 否 | — | 包的主要语言，用语言标签表示，例如 `zh-CN`。 |
| `min_app_version` | `string` | 否 | — | 适用的最低 Halo 版本。商店会显示它，但 Halo 不会因此阻止旧版本安装。 |
| `license` | `string` | 否 | — | 许可证，使用 SPDX 标识，例如 `MIT`。随包保存。 |
| `homepage` | `string`（URL） | 否 | — | 项目主页。随包保存。 |
| `repository` | `string`（URL） | 否 | — | 源码仓库地址。随包保存。 |

### `i18n` {#field-i18n}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `<locale>.name` | `string` | 否 | — | 翻译后的名称。 |
| `<locale>.description` | `string` | 否 | — | 翻译后的简介。 |
| `<locale>.config_schema` | `map<string, object>` | 否 | — | 设置字段的翻译，按字段的 `key` 区分。 |
| `<locale>.config_schema.<key>.label` | `string` | 否 | — | 翻译后的标签。 |
| `<locale>.config_schema.<key>.description` | `string` | 否 | — | 翻译后的说明文字。 |
| `<locale>.config_schema.<key>.placeholder` | `string` | 否 | — | 翻译后的占位提示。 |
| `<locale>.config_schema.<key>.options` | `map<string, string>` | 否 | — | 翻译后的选项文字，按选项的值区分。 |
| `<locale>.browser_login` | `map<string, object>` | 否 | — | 登录标签的翻译，按 `browser_login` 的 URL 区分。 |
| `<locale>.browser_login.<key>.label` | `string` | 否 | — | 翻译后的标签。 |

### `subscriptions` {#field-subscriptions}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `id` | `string` | 否 | — | 这个触发器的 id，在 spec 内唯一。不写时按顺序编号为 `0`、`1`…… |
| `source` | `object` | 是 | — | 什么会启动一次运行。 |
| `source.type` | `enum` | 是 | `schedule`, `file`, `webhook`, `webpage`, `rss`, `custom`, `wecom` | 会启动运行的是 `schedule`、`file` 和 `webhook`。`webpage`、`rss`、`custom` 和 `wecom` 可以写，但没有任何事件来源会产生它们的事件。发给机器人的消息通过机器人绑定交给数字人，不需要触发器。 |
| `source.config`（`schedule`） | `object` | 是 | — | 运行时间：`every` 或 `cron`。 |
| `source.config.every`（`schedule`） | `string`（时长） | 否 | — | 间隔，例如 `30m`、`2h`、`1d`（单位 `s`、`m`、`h`、`d`）。同时写了 `every` 和 `cron` 时，以 `every` 为准。 |
| `source.config.cron`（`schedule`） | `string`（cron） | 否 | — | cron 表达式，5 段，或以秒开头的 6 段，例如 `0 9 * * 1-5`。保存 spec 时会校验。 |
| `source.config.workday_calendar`（`schedule`） | `boolean` | 否 | — | 设为 `true` 时只在中国大陆的工作日运行，包括调休上班日，跳过法定节假日。请搭配每天都触发的计划，不要用 `1-5`。 |
| `source.config`（`file`） | `object` | 是 | — | 哪些文件变化会启动运行。 |
| `source.config.pattern`（`file`） | `string` | 否 | — | 与变动文件在它所在工作区内的相对路径匹配的通配模式，例如 `inbox/*.csv`。它会匹配 Halo 监视的每个工作区里的同一路径，而不只是这一个。 |
| `source.config.path`（`file`） | `string` | 否 | — | 只算这个文件夹里的文件，与绝对路径做部分匹配。Halo 不会把文件触发限定在数字人自己的工作区：它监视的任何工作区（在应用里打开的，以及其他文件触发所在的）发生变化都算。把 `path` 设为本工作区里的文件夹，触发才只限于那里。 |
| `source.config`（`webhook`） | `object` | 是 | — | 位于 `/hooks/<path>` 的 HTTP 入口，其他系统向它推送 JSON 事件。 |
| `source.config.path`（`webhook`） | `string` | 否 | — | `/hooks/` 之后的路径。请用小写，并且不要与其他数字人重复。 |
| `source.config.secret`（`webhook`） | `string` | 否 | — | 每个请求都必须携带的 HMAC-SHA256 签名所用的共享密钥。不设置时，任何能访问 Halo 的人都能启动这位数字人。 |
| `source.config`（`webpage`） | `object` | 是 | — | **无效果：** 没有事件来源会触发它。本意是监视网页变化。要检查网页，请用 `schedule`，让数字人在 AI 浏览器里打开它。 |
| `source.config.watch`（`webpage`） | `string` | 否 | — | **无效果：** 没有事件来源会触发它。要监视页面上的什么。 |
| `source.config.selector`（`webpage`） | `string` | 否 | — | **无效果：** 没有事件来源会触发它。要关注的 CSS 选择器。 |
| `source.config.url`（`webpage`） | `string` | 否 | — | **无效果：** 没有事件来源会触发它。页面地址。 |
| `source.config`（`rss`） | `object` | 是 | — | **无效果：** 没有事件来源会触发它。本意是订阅 RSS 源。请改用定时读取订阅源的 `schedule`。 |
| `source.config.url`（`rss`） | `string` | 否 | — | **无效果：** 没有事件来源会触发它。订阅源地址。 |
| `source.config`（`custom`） | `map<string, any>` | 是 | — | **无效果：** 没有事件来源会触发它。自定义事件来源的任意配置。Halo 没有内置这样的来源。 |
| `source.config`（`wecom`） | `object` | 是 | — | **无效果：** 没有事件来源会触发它。本意是接收企业微信消息。要让数字人回复企业微信机器人，请在 设置 › 消息通道 中把机器人绑定给它。 |
| `source.config.chatId`（`wecom`） | `string` | 否 | — | **无效果：** 没有事件来源会触发它。要接收的聊天。 |
| `frequency` | `object` | 否 | — | 本意是用户可选的间隔范围。Halo 不会据此做限制。 |
| `frequency.default` | `string`（时长） | 是 | — | 建议的间隔。它不会改变运行时间：要改运行时间，请修改计划的 `every` 或 `cron`。 |
| `frequency.min` | `string`（时长） | 否 | — | **无效果：** 可以写，但不会被读取。本意是用户可选的最短间隔。 |
| `frequency.max` | `string`（时长） | 否 | — | **无效果：** 可以写，但不会被读取。本意是用户可选的最长间隔。 |
| `config_key` | `string` | 否 | — | **无效果：** 可以写，但不会被读取。本意是把某个设置项的值交给触发器。它必须是已有的 `config_schema` key，否则 spec 校验不通过，但这个值不会被使用。 |

### `filters` {#field-filters}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `field` | `string`（非空） | 是 | — | **无效果：** 可以写，但不会被读取。要检查的事件字段。 |
| `op` | `enum` | 是 | `eq`, `neq`, `contains`, `matches`, `gt`, `lt`, `gte`, `lte` | **无效果：** 可以写，但不会被读取。比较方式。 |
| `value` | `any` | 是 | — | **无效果：** 可以写，但不会被读取。用来比较的值。 |

### `memory_schema` {#field-memory-schema}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `<field>.type` | `string`（非空） | 是 | — | 值的种类，作为提示，例如 `string`、`number`、`date`、`array`。 |
| `<field>.description` | `string` | 否 | — | 这一项记什么、怎样更新。 |

### `output` {#field-output}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `notify` | `object` | 否 | — | **无效果：** 可以写，但不会被读取。通知设置。 |
| `notify.system` | `boolean` | 否 | — | **无效果：** 可以写，但不会被读取。桌面通知。由用户在每位数字人的 消息与通知 › 系统通知 中设置。 |
| `notify.channels` | `enum[]` | 否 | `email`, `wecom`, `dingtalk`, `feishu`, `webhook` | **无效果：** 可以写，但不会被读取。通知通道。 |
| `format` | `string` | 否 | — | **无效果：** 可以写，但不会被读取。输出格式。 |

### `escalation` {#field-escalation}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `enabled` | `boolean` | 否 | — | **无效果：** 可以写，但不会被读取。设为 `false` 并不能阻止它提问，设为 `true` 也没有变化。它能自己做到哪一步，由系统提示词决定。 |
| `timeout_hours` | `number` | 否 | > 0 | 提问等待的小时数，超时后提问失效，这次运行以失败结束。不写时，提问会一直等到有人回答。 |

### `browser_login` {#field-browser-login}

| 字段 | 类型 | 必填 | 默认值 / 可选值 | 说明 |
|---|---|---|---|---|
| `url` | `string`（URL） | 是 | — | 登录页地址。 |
| `label` | `string`（非空） | 是 | — | 网站名称，显示给用户。 |
<!-- /generated:spec-fields -->

## 写了也没有效果的字段 {#no-effect}

为了让旧的 spec 还能安装，Halo 接受下面这些字段，但不会读取它们。不要依赖它们：

- `output`（通知和输出格式）。需要通知时，在 `system_prompt` 里写明；数字人会通过 **设置 › 消息通道** 里配置的通道发送。桌面通知由每位数字人的 **消息与通知 › 系统通知** 决定。
- `escalation.enabled`，从不读取。数字人随时都可以停下来提问；它能自己做到哪一步，由 `system_prompt` 决定。`escalation` 里只有 `timeout_hours` 有效果。
- `filters`。这类条件请写进 `system_prompt`。
- `subscriptions[].config_key`（会检查，但随后不使用）、`subscriptions[].frequency.min` 和 `.max`，以及 `requires.mcps[].bundled`。
- 触发类型 `webpage`、`rss`、`custom` 和 `wecom`：没有任何来源会产生它们的事件。请用定时检查网页或订阅源的 `schedule`；聊天消息请在 **设置 › 消息通道** 里绑定机器人。

## 相关页面 {#related}

- [教程：做一个浏览器自动化数字人](/developers/digital-humans/build)
- [生产级数字人](/developers/digital-humans/production)：经得起考验的提示词、记忆和浏览器脚本
- [DHP 协议](/developers/dhp)：数字人包、商店来源与分发
- [API 实用示例](/developers/api/recipes#webhook)：从头到尾配好一个 Webhook 触发
