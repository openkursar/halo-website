---
title: 模型网关与代理：接入公司 API 网关并设置网络代理
description: 把公司兼容 OpenAI 或 Anthropic 接口的模型网关接成 Halo 的 AI 来源，配置代理和不走代理的地址，并了解没有外网时哪些功能照常可用。
type: how-to
audience: [admin, developer]
related: [features/models, getting-started/api-keys, features/settings, advanced/security]
---

# 模型网关与代理

添加 AI 来源、修改代理都要你自己在 **设置** 里操作，Halo 帮不上。来源加好以后，打开 **操作 Halo**，就可以对 Halo 说「这个对话换成公司网关的模型」，让它在已有来源之间切换，见 [模型与账号](/features/models)。

## 开始之前 {#before-you-start}

先向网关管理员要到这几样：

| 需要的信息 | 例子 | 用在哪里 |
|---|---|---|
| 网关地址 | `https://ai-gateway.example.com/v1` | **API URL** |
| 一把 Key | `<YOUR_TOKEN>` | **API 密钥** |
| 接口格式 | 兼容 OpenAI，或 Anthropic（Claude）格式 | 决定 **提供商** 选哪个，见 [选哪种格式](#which-format) |
| 模型 ID | 网关里配置的模型名 | 网关不提供模型列表时，手动填写 |

- 添加 AI 来源在桌面版和通过 [远程访问](/features/remote-access) 打开的浏览器里都能做。**设置 › 系统** 里的代理只在桌面版里有。
- 第一次打开 Halo 的设置向导里也有 **自定义 API**，填法相同：先填 **API Key**，再选 **提供商**，**API URL** 会自动填好，可以改成网关地址，最后点 **保存并进入**。

## 把公司网关接成 AI 来源 {#gateway-as-source}

1. 打开 **设置 › AI 模型**，点 **添加AI提供商**。
2. 在 **提供商** 里选格式：兼容 OpenAI 的网关选 **OpenAI API**（这是默认值），Anthropic 格式的网关选 **Claude (Anthropic) API**。拿不准时看下一节。
3. 改一个好认的 **显示名称**，例如「公司网关」。在 **API 密钥** 里粘贴网关发给你的 Key。
4. 把 **API URL** 改成网关地址。兼容 OpenAI 的网关填到版本号为止，例如 `https://ai-gateway.example.com/v1`，不要带 `/chat/completions`。
5. 点 **获取模型**。看到「找到 N 个模型」后，在 **模型** 里选一个。
6. 网关没有模型列表，或列表里没有你要的模型：勾选 **使用自定义模型ID**，在「输入模型ID」里填模型 ID，点 **应用**。
7. 点 **测试连接**，看到「连接成功」。
8. 点 **保存**（修改已有来源时是 **更新**）。保存后这个来源成为当前来源。

Halo 不认识的模型，在点 **应用** 后会自动展开 **模型配置**，按默认值显示：**上下文窗口** 200,000 标记、**最大输出标记数** 64,000。面板下方会提示「未找到预设 — 请确认这些值符合您的模型」。按网关管理员给的数值改好再保存，各项含义见 [每个模型的设置](/features/models#model-settings)。

::: done
**测试连接** 显示「连接成功」，输入框旁的模型卡片里出现网关的模型，发一句话能收到回复，就说明接好了。
:::

## 选哪种格式 {#which-format}

提供商决定请求格式，Halo 没有单独的格式开关。大多数公司网关兼容 OpenAI 接口，所以默认选 **OpenAI API**。它在下拉列表里的灰色说明是英文「Official and all compatible providers」，中文界面里也一样。

| 网关的接口 | 提供商选 | API URL 填到 | Halo 实际请求的地址 |
|---|---|---|---|
| 兼容 OpenAI（`/v1/chat/completions`） | **OpenAI API** | `https://ai-gateway.example.com/v1` | 末尾补上 `/chat/completions` |
| 兼容 OpenAI 的 Responses 接口 | **OpenAI API** | 完整地址，以 `/responses` 结尾 | 原样使用 |
| Anthropic 格式（`/v1/messages`） | **Claude (Anthropic) API** | `https://ai-gateway.example.com`，不带 `/v1` | 末尾补上 `/v1/messages` |

兼容 OpenAI 时，Halo 会帮你整理地址：去掉末尾的 `/`；已经以 `/chat/completions` 结尾的地址原样使用；只填了域名（如 `https://ai-gateway.example.com`）时，自动补上 `/v1`。

Anthropic 格式只做一件事：在你填的地址后面直接加 `/v1/messages`。所以地址里多写了 `/v1` 就会变成 `/v1/v1/messages`，请求失败。只有网关管理员明确说是 Anthropic 格式时才选 **Claude (Anthropic) API**，把兼容 OpenAI 的网关错选成它，是最常见的配置错误。

**获取模型** 用 `Bearer` 方式带上 Key，去请求网关的 `/models`。Anthropic 格式的网关不一定支持这个请求，取不到列表时，用 **使用自定义模型ID** 填模型 ID 即可。

### LiteLLM 和类似的网关 {#litellm}

**提供商** 列表里有 **LiteLLM**，默认地址是 `http://localhost:4000`，模型列表为空，要点 **获取模型** 从网关读取。LiteLLM 走的是兼容 OpenAI 的格式。网关部署在别的机器上时，把 **API URL** 改成它的地址。

Halo 要求填了 **API 密钥** 才能保存，LiteLLM 也一样。网关发了虚拟 Key 就填那把 Key；网关不校验 Key 时，填任意文字即可。

其他兼容 OpenAI 的网关或路由服务（列表里没有的），一律选 **OpenAI API**，再改 **API URL**。

## 测试连接 {#test}

**测试连接** 会用你选的模型真的发一轮对话，要求模型回复「OK」，15 秒没有回应就算超时。兼容 OpenAI 的来源要先选好模型才能测试。测试通过后，**API URL** 可能被改写成 Halo 整理后的完整地址，这是正常的。不测试也可以保存。

测试结果只有「连接成功」是中文，失败信息在中文界面里也是英文：

| 测试显示 | 多半是因为 |
|---|---|
| `Invalid API key` / `Access denied - check API key permissions` | Key 错了，或这把 Key 没有这个模型的权限 |
| `API endpoint not found - check URL` | 地址不对，或格式选错了，见 [选哪种格式](#which-format) |
| `Cannot connect to API server - check URL` | 连不上网关：地址写错，或需要代理 / 不该走代理，见 [设置代理](#proxy) |
| `Connection timeout - server may be slow or unreachable` | 15 秒内没有回应：网关慢，或网络不通 |
| `Rate limited - try again later` | 网关限流，稍后再试 |
| `No response received from API` | 网关没有返回任何内容 |

**获取模型** 的错误是中文的：「API 密钥无效或没有权限」「未找到端点，请检查 URL」「请求频率受限或配额已用尽」「请求超时，请检查服务器或代理」「无法连接服务器，请检查网络或代理」。错误后面会附上网关返回的原因（最多 200 个字符），Key 会被隐去。

## 公司版本里的预设提供商 {#preset-providers}

公司定制的 Halo 可以把公司网关预先写进安装包。这时 **设置 › AI 模型** 列表下方会多出 **预设API** 分组，点里面的条目：

1. 填 **显示名称** 和 **API 密钥**。
2. 网关地址已经定好，不能改，下面写着「网关URL由预设配置固定」。
3. 点 **获取模型**（从网关获取最新模型列表）选模型；也可以 **使用自定义模型ID**。列表为空时显示「没有可用模型 — 从网关获取或输入自定义ID」。
4. 点 **添加**。添加后这个条目会从 **预设API** 分组里消失，出现在上面的来源列表中。

::: info
**预设API** 分组只出现在定义了预设的版本里。从官网下载的 Halo 没有预设，看不到这个分组，按 [把公司网关接成 AI 来源](#gateway-as-source) 的步骤添加即可。
:::

## 设置代理 <Badge type="info" text="仅桌面版" /> {#proxy}

公司网络要通过代理才能上外网时，在这里设置 Halo 自己的代理。留空（默认）时 Halo 自动沿用系统代理，包括 PAC 自动配置。

1. 打开 **设置 › 系统**，找到 **代理**（「覆盖系统代理。留空以从系统设置自动检测。」）。
2. 填代理地址，例如 `http://127.0.0.1:1087`。只接受 `http://` 和 `https://`（「支持 http://、https://」）。填 `socks5://` 会提示「不支持的协议。请使用 http:// 或 https://」。
3. 点 **保存** 或按 <kbd>Enter</kbd>，按钮短暂变成「已保存」。

只有 SOCKS 代理？在系统设置里配好它，Halo 的 **代理** 留空。这样模型请求会通过系统代理走 SOCKS。

代理管哪些流量：

| 流量 | 用哪个代理 |
|---|---|
| 模型请求、**获取模型**、**测试连接** | **代理** 里的地址；留空时用系统代理。例外：**Claude (Anthropic) API** 来源的 **测试连接** 由 AI 引擎进程直接发出，只认 **代理** 里的地址或环境变量 `HTTP_PROXY` / `HTTPS_PROXY`，不读系统代理 |
| [商店](/digital-humans/store) | 同上 |
| Halo 启动的 AI 引擎进程，以及它连接的 MCP 服务器 | **代理** 里的地址，通过 `HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY` 环境变量传给进程。启动 Halo 时环境里已经有 `HTTP_PROXY` / `HTTPS_PROXY`，就保留原来的值 |
| AI 读取 Halo 官方文档 | **代理** 里的地址；留空时用系统代理 |
| [AI 浏览器](/features/ai-browser) 和网页搜索 | 系统代理。打开 **同时应用于AI浏览器** 后改用 **代理** 里的地址，见 [下文](#ai-browser-proxy) |
| 检查和下载 [更新](/advanced/updates) | 系统代理，不读 **代理** 里的地址 |

### 不走代理的地址 {#bypass}

公司内网的模型网关通常不该走外网代理。把它写进 **代理** 下方的 **以下地址不使用代理**，再点这一栏自己的 **保存**。

```text
ai-gateway.example.com, .corp.example.com, 10.0.0.0/8
```

| 写法 | 匹配 |
|---|---|
| `ai-gateway.example.com` | 只匹配这个主机 |
| `.example.com` | 只匹配子域名，不含 `example.com` 本身；要包括它，另加一条 `example.com` |
| `10.0.0.0/8` | 一个 IP 段 |
| `host:port` | 只匹配这个端口 |
| 粘贴一个完整网址 | 只保留其中的主机和端口 |

- 条目用逗号分隔，分号和空格也可以。
- `localhost`、`127.0.0.1`、`[::1]` 始终不走代理（「本地地址绝不使用代理。」）。Halo 的模型请求要经过本机的转换服务，所以不能让本机地址走代理。
- 启动 Halo 时环境变量 `NO_PROXY` 里已有的地址也会合并进来。
- 「更改后的列表适用于之后开始的对话。」改完后新开一个会话再试。

### 同时应用于AI浏览器 {#ai-browser-proxy}

填了代理地址后，下面才会出现 **同时应用于AI浏览器** 开关，默认关闭（「默认情况下，AI浏览器使用系统代理而非上述代理」）。

- **关闭**：AI 浏览器和网页搜索用系统代理。适合 **代理** 里只填了转发模型 API 的专用代理、它打不开普通网页的情况。
- **打开**：AI 浏览器和网页搜索也改用 **代理** 里的地址，**以下地址不使用代理** 同样生效。切换后立即应用。

网页搜索在后台用的就是 AI 浏览器的网络，所以和它走同一个代理。搜索默认按查询语言选引擎：英文用必应（Bing），中文用百度，一个连不上会换另一个；只有明确要求时才用 Google，有些地区要代理才能访问。所有引擎都连不上时，AI 会告诉你搜索暂时不可用，然后不靠搜索继续做。

## 没有外网时能用什么 {#offline}

内网有可用的模型网关时，Halo 的大部分功能不需要外网。下面是 3.0.4 的情况：

| 功能 | 没有外网时 |
|---|---|
| 对话、读写工作区里的文件 | 能用，只要模型网关在内网能连上 |
| [知识库](/features/knowledge-base#how-learning-works) 学习文件 | 能用。「学习」是在本机提取文字，不调用模型 |
| [文字识别](/features/image-input#text-recognition)（OCR） | 能用。识别引擎和中英文语言数据都装在 Halo 里 |
| Windows 第一次启动的命令执行环境（Git Bash） | 能用。安装包里带了一份便携版 Git，在本机解压，见 [批量部署](/advanced/deployment#windows-git-bash) |
| AI 读取 Halo 官方文档 | 能用。连不上文档站（等 3 秒）时，改读之前的缓存或 Halo 自带的离线文档，并注明内容可能不是最新的 |
| 用 Claude、ChatGPT、GitHub Copilot 等账号登录 | 需要能访问对应的网站 |
| 网页搜索、AI 浏览器打开外网网页 | 需要外网，或在 [代理](#proxy) 里配好 |
| 商店的内置来源、官方版本的检查更新 | 需要外网。用内网域名搭的 [私有商店](/advanced/private-store) 在内网能连上就行 |
| 远程访问的互联网访问 | 需要外网，它经过隧道服务和 Halo 的地址服务，见 [远程访问](/features/remote-access#internet-access) |
| [记忆](/features/memory) 整合 | 要调用模型，模型网关能连上就行 |

## 共用 ~/.claude 时的配置覆盖 {#claude-cli-overrides}

这一节只影响 Claude Code 引擎（默认引擎）。

Claude Code 引擎会读取配置目录里的 `settings.json`，也会读取工作区文件夹里的 `.claude/settings.json`。如果这些文件的 `env` 里设置了 API 地址或 Key，它们可能盖过 Halo 选好的来源：测试连接正常，聊天却连到别的服务或报错。

配置目录在 **设置 › 高级 › Claude CLI 集成 › 配置目录**：

| 选项 | 读哪里 | 说明 |
|---|---|---|
| **Halo 默认**（**推荐**） | Halo 自己的独立目录 | 不受你单独安装的 Claude CLI 影响 |
| **Claude CLI 默认** | `~/.claude`，和单独安装的 Claude CLI 共用 | 标记 **高风险**、**不推荐**。确认对话框「高风险：共享配置」写明：「如果您的独立 Claude CLI 配置了自定义 API 密钥或端点，它将优先于您在 Halo 中选择的模型，这可能会导致聊天功能异常。」点 **使用共享配置** 才会切换 |
| **自定义路径** | 你指定的目录 | 同样会读取其中的 `settings.json` |

改完点 **应用**，看到「已保存。重启任何活跃的对话以应用。」后，重新开始正在进行的会话。面板上的「当前生效路径：」显示 Halo 实际在用的目录。各选项的完整说明见 [Claude CLI 集成](/features/settings#claude-cli-integration)，目录位置见 [数据与配置位置](/advanced/config-paths)。

要用公司网关，又必须选 **Claude CLI 默认** 时，先把 `~/.claude/settings.json` 里 `env` 中的 API 地址和 Key 去掉，让 Halo 的 AI 来源生效。

## 遇到问题 {#troubleshooting}

### 获取模型时显示「未找到端点，请检查 URL」

- 兼容 OpenAI 的网关：**API URL** 填到版本号为止（如 `https://ai-gateway.example.com/v1`）。网关的路径不是 `/v1` 时，按管理员给的写，例如 `https://ai-gateway.example.com/openai/v1`。
- 网关没有 `/models` 接口：改用 **使用自定义模型ID**，再点 **测试连接** 确认。

### 显示「无法连接服务器，请检查网络或代理」或「请求超时，请检查服务器或代理」

1. 内网网关：把它的主机名加进 [以下地址不使用代理](#bypass)，再新开一个会话。
2. 外网服务：在 [代理](#proxy) 里填公司代理，或确认系统代理能用。
3. 安全软件拦截了本机连接时，对话也会失败。Halo 会说明要放行哪个程序。

### 选了 Claude (Anthropic) API 后一直连不上

多半是格式选错了。网关兼容 OpenAI 时，改选 **OpenAI API**。确实是 Anthropic 格式时，检查 **API URL** 末尾没有 `/v1`。

### 改了代理，AI 用到的工具还是走旧代理

- AI 引擎进程在会话开始时拿到代理设置。新开一个会话再试。
- 启动 Halo 前环境里已经设了 `HTTP_PROXY` / `HTTPS_PROXY`（例如从终端启动 Halo），AI 引擎进程会保留这些值。去掉这些环境变量后重启 Halo。

### AI 浏览器或网页搜索打不开页面，模型却正常

AI 浏览器默认用系统代理，不用 **代理** 里的地址。需要时打开 [同时应用于AI浏览器](#ai-browser-proxy)。如果 **代理** 里是只转发 API 的专用代理，保持关闭，改用系统代理上网。

### 测试连接成功，聊天时却连到了别的模型或报错

检查 [配置目录](#claude-cli-overrides) 是否选了 **Claude CLI 默认**，以及 `settings.json` 的 `env` 里有没有 API 地址或 Key。

## 下一步 {#next-steps}

- [模型与账号](/features/models)：为每个会话选模型、调深度思考，管理多个来源。
- [安全、隐私与数据流](/advanced/security)：哪些数据留在本机、哪些会发出去，Key 怎么保存。
- [批量部署](/advanced/deployment)：给多台电脑统一部署 Halo 时先看这里。
