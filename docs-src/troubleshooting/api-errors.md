---
title: 模型 API 错误码：401、429、5xx 报错怎么处理
description: 模型服务返回 401、402、403、404、429、5xx 等错误时，Halo 里会看到什么、哪些会自动重试，以及该检查 Key、额度、模型配置还是网络。
type: reference
audience: [office, developer]
related: [troubleshooting/common-errors, features/models, advanced/gateway-and-proxy]
---

# 模型 API 错误码

这一页按状态码和报错里的关键词，说明模型服务返回的错误是什么意思、在 Halo 里怎么处理。看到的是 Halo 自己的中文提示，比如「API 密钥无效或没有权限」「模型服务正在限流」，先查 [错误信息速查](/troubleshooting/common-errors)。

模型服务出错时，Halo 的 AI 也用不了，所以这一页的事要你自己处理。如果你还有另一个能用的模型来源，可以在输入框旁的模型卡片里换过去，再把报错原文发给它问一问。

## 报错在哪里看 {#where-errors-show}

| 在哪里 | 看到什么 |
|---|---|
| 回复里的重试卡片 | 请求失败、Halo 准备再试时出现。标题说明原因，旁边是 HTTP 状态码，下面是服务商给的两行说明，还有「第 N/M 次重试」和 **停止**。重试成功后，回复照常继续 |
| 回复里的「出现错误」 | 不再重试或重试用完后，这一轮停下，显示「出现错误」和报错原文，例如 `API Error: 429 {"error": …}` |
| 回复上方的思考过程 | 出错的那一步里有报错原文。点 **复制**（提示「复制错误信息」）复制下来；报错超过 600 个字符时，点 **展开完整错误** 看全文 |
| **设置 › AI 模型** | 保存、获取模型列表或 **测试连接** 时出错，提示和这一页不同，见 [连接模型、获取模型列表时](/troubleshooting/common-errors#model-setup) |

## 状态码速查 {#status-codes}

| 状态码 | 通常是什么问题 | Halo 里会看到 | 怎么办 |
|---|---|---|---|
| 400 | 请求被服务商拒绝：对话太长、模型不接受图片、参数超出模型的上限 | 一般直接停下，显示「出现错误」 | 看报错里的说明，见 [对话太长](#context-too-long)、[模型不接受图片](#images-rejected)、[输出上限](#max-output) |
| 401 | Key 无效或已作废，登录状态失效 | 重试卡片「模型服务拒绝了凭据」，或直接停下 | 到 **设置 › AI 模型** 重新粘贴 Key；用账号登录的，用同一个账号再登录一次 |
| 402 | 欠费或余额不足 | 不重试，直接停下 | 到服务商控制台充值，或换一个模型来源，见 [额度用完、欠费](#quota) |
| 403 | 账号没有这个模型的权限，或服务商不在你所在的地区提供服务 | 一般直接停下 | 换一个模型，或到服务商控制台确认权限 |
| 404 | 模型名或 API URL 不对 | 一般直接停下 | 见 [找不到模型](#model-not-found) |
| 413 | 请求太大，多半是图片或附件太多、太大 | 一般直接停下 | 少发几张图或压缩后再发；对话已经很长时，新建一个会话 |
| 429 | 请求太频繁，被限流 | 重试卡片「模型服务正在限流」，自动重试 | 等它重试，见 [限流](#rate-limit) |
| 500、502、503 | 服务商那边出错 | 重试卡片「模型服务返回错误」，自动重试 | 等一会儿再发；一直出现，看服务商的状态页；用公司网关的，联系管理员 |
| 504 | 服务商或网关处理超时 | 自动重试 | 同上；长任务可以拆成几步 |
| 529 | 服务太忙（Anthropic 用这个码） | 重试卡片「模型服务过载」，自动重试 | 等一会儿，或换一个模型 |
| 没有状态码 | 连不上模型服务：网络、代理或证书问题 | 重试卡片「无法连接模型服务」 | 见 [连不上模型服务](#cannot-connect) |

- 400 到 413 这一类错误，重试也不会好，所以一般直接停下。限流、服务繁忙和网络中断是暂时的，会自动重试。
- 卡片标题由出错的类型决定，表里写的是最常见的对应关系。不确定时，以卡片上的状态码和服务商的说明为准。
- 用公司网关或第三方中转服务时，状态码由它们返回，含义可能和官方略有不同。

## 额度用完、欠费 {#quota}

报错里出现 `402`、`insufficient_quota`、`Insufficient Balance`、`credit balance`、`usage limit`、余额不足、额度、配额这类说法，就是额度用完或欠费了。

- Halo 遇到这类错误不会重试，这一轮直接停下，免得白等。
- 服务商在报错里要求「几小时后再试」时，Halo 不会照着干等几个小时，而是按自己的节奏重试或直接报错。
- 处理办法：到服务商控制台充值，或等额度按服务商的规则恢复；着急的话，在模型卡片里换一个模型来源。

## 限流 {#rate-limit}

`429` 而且报错里没有额度、余额一类的字样，就是请求太频繁。

1. 先等重试卡片倒计时，多数情况下重试会成功。
2. 经常被限流时，减少同时在跑的会话和数字人，见 [同时推进多件事](/features/parallel-work)。
3. 还不够，就升级服务商的套餐，或者把一部分工作换到另一个模型来源。

## 找不到模型 {#model-not-found}

报错是 `404`、`model_not_found`，或者 "There's an issue with the selected model … It may not exist or you may not have access to it." 时：

1. 打开输入框旁的模型卡片，点模型名，换一个列表里有的模型。
2. 登录账号的模型列表过时了，在模型列表底部点 ↻ **刷新模型**。
3. 用 **自定义 API** 的，到 **设置 › AI 模型**，在这个提供商的卡片上点 **编辑**，核对 **API URL** 和模型 ID 是否和服务商文档一致。
4. 在 **设置 › 高级 › Claude CLI 集成** 里选了 **Claude CLI 默认** 配置目录的，`~/.claude/settings.json` 里的设置可能盖过 Halo 选的模型，见 [共用 ~/.claude 时的配置覆盖](/advanced/gateway-and-proxy#claude-cli-overrides)。

## 对话太长 {#context-too-long}

报错里说上下文太长（`context_length_exceeded`、`maximum context length`、`prompt is too long` 一类），说明发出去的内容超过了模型能接收的长度。

Halo 会在对话快装不下时自动压缩较早的内容，什么时候压缩，按这个模型的 **上下文窗口** 来算。Halo 不认识的模型默认按 200K 处理；如果服务商的模型实际只有 64K 或 128K，没等压缩就会超长。

1. 到 **设置 › AI 模型**，在这个模型所在来源的卡片上点 **编辑**，展开 **模型配置**。
2. 把 **上下文窗口** 改成服务商文档里写的值，保存。**模型配置** 底部的预设标签显示「未找到预设 — 请确认这些值符合您的模型」时，尤其要核对。
3. 回到对话继续，或者新建一个会话。

每个设置项的说明见 [每个模型的设置](/features/models#model-settings)。

## 模型不接受图片 {#images-rejected}

报错说模型不支持图片（`image`、`vision`、`does not support image input` 一类）时，多半是这个模型其实看不了图，但 Halo 按能看图来发送。

1. 在这个模型的 **模型配置** 里关掉 **视觉**，保存。
2. 重新发送。输入框会提示「当前模型不具备视觉能力——图片将通过本地 OCR 转文字读取（仅文本）」，图片里的文字会在本机识别后交给模型。

要模型理解图片本身，就换一个模型卡片上 **图片输入** 显示 **支持** 的模型，见 [文件和图片](/features/image-input#text-recognition)。

## 输出上限 {#max-output}

报错说 `max_tokens` 太大，或超出了模型的输出上限时，在这个模型的 **模型配置** 里把 **最大输出标记数** 改成服务商允许的值。低于 20,000 时 Halo 会提示可能影响自动压缩的摘要，这只是提醒，照样可以保存。

## 连不上模型服务 {#cannot-connect}

重试卡片显示「无法连接模型服务」，或者报错里有 `fetch failed`、`ECONNREFUSED`、`ENOTFOUND`、`ETIMEDOUT`、`Connection error` 时：

- 检查网络，确认能在浏览器里打开服务商的网站。
- 需要代理才能访问的，在 **设置 › 系统 › 代理** 填好代理并保存；公司内网的模型网关加进 **以下地址不使用代理**，见 [模型网关与代理](/advanced/gateway-and-proxy)。
- 报错里有证书字样（`self signed certificate`、`unable to get local issuer certificate`），通常是公司网络在检查加密流量。请 IT 把模型服务的地址加入例外，或者改用公司内网的模型网关。
- 报错以 "Security software on this computer blocked Halo's internal connection to 127.0.0.1" 开头时，问题不在模型、账号或网关：是电脑上的安全软件拦住了 Halo 在本机的内部连接。把报错里写的程序发给 IT，请他们允许它建立本地连接。在 **设置 › 系统 › 系统诊断** 里运行诊断，**子进程本地连接** 一行也会显示这个问题，见 [日志与诊断](/troubleshooting/diagnostics#run-diagnostics)。

## 登录失败 {#sign-in}

用 Claude、ChatGPT、GitHub Copilot 等账号登录时出的错：

| 看到的提示 | 意思 | 怎么办 |
|---|---|---|
| "OAuth token expired or invalid. Please login again." | 登录状态过期，自动刷新也失败了 | 用同一个账号再登录一次，见 [连接 AI 模型 › 遇到问题](/getting-started/setup-ai#troubleshooting) |
| "A different account was authorized. Add it as a new account instead." | 重新登录某个账号时，浏览器里登录的是另一个账号 | 换回原来的账号登录；要用新账号，就把它作为新账户添加 |
| "Failed to bind 127.0.0.1:1455 or 1457"（ChatGPT） | ChatGPT 登录要用本机的这两个端口接收回调，它们被别的程序占用了，常见的是另一个正在登录的 Codex | 关掉占用端口的程序，或等它登录完成，再在 Halo 里重试 |
| "CLI-delegated sources run on the Claude Code engine…" | **Claude Code CLI** 登录的来源只能用默认引擎 | 把 **设置 › 高级 › AI Agent 引擎** 换回 **Claude Code SDK**，见 [Agent 引擎](/features/agent-engines#differences) |

其他登录问题，比如浏览器里登录完成了 Halo 还在等、打不开登录页面，见 [连接 AI 模型 › 遇到问题](/getting-started/setup-ai#troubleshooting)。

## 还是解决不了 {#get-help}

- 复制完整的报错原文：在思考过程里出错的那一步点 **复制**（提示「复制错误信息」）。
- 把报错、你用的服务商和模型，以及 **设置 › 关于** 里的版本号一起发给服务商或技术支持。日志和诊断报告怎么导出，见 [日志与诊断](/troubleshooting/diagnostics)。

<!-- public:start -->
也可以在 [GitHub Issues](https://github.com/openkursar/hello-halo/issues) 提交问题。
<!-- public:end -->

## 下一步 {#next-steps}

- [错误信息速查](/troubleshooting/common-errors)：Halo 自己的中文提示是什么意思、怎么办。
- [模型与账号](/features/models)：添加账号、为会话选模型、调整每个模型的设置。
- [模型网关与代理](/advanced/gateway-and-proxy)：用公司网关或代理时的设置。
