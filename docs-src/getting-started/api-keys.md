---
title: 获取 API Key：DeepSeek、Kimi、智谱等平台怎么申请
description: 到模型平台注册、充值或领取额度，创建一个 API Key，再回到 Halo 选对提供商粘贴进去。这里列出各平台的控制台入口，以及在 Halo 里要选的名字。
type: how-to
audience: [beginner]
prerequisites: [getting-started/install]
related: [getting-started/setup-ai, advanced/gateway-and-proxy, advanced/security]
---

# 获取 API Key

这一步要在模型平台的网站上完成，Halo 帮不上忙。拿到 Key 以后，回到 Halo 粘贴进去就行。

## API Key 是什么 {#what-is-an-api-key}

API Key 是模型平台发给你的一串长字符，相当于一把钥匙。Halo 拿着它替你调用这家平台的模型，费用记在你在这家平台的账户上。

- 不要把 Key 发给别人，也不要贴到群里或截图里。泄露了就到平台上删除，再新建一个。
- Key 保存在你自己电脑上的 Halo 配置文件里，Halo 的界面上只显示 `***`。Halo 没有自己的后端服务器，Key 只会发给你选的那家模型平台。存储细节见 [安全、隐私与数据流](/advanced/security)。

## 申请步骤 {#steps}

各平台的页面不一样，但流程差不多：

1. 打开平台的控制台（见下面的表格），注册并登录。
2. 按平台要求完成实名认证、充值或领取免费额度。价格和额度以平台页面为准。
3. 找到「API Keys」或「API 密钥」页面，新建一个 Key，马上复制保存。很多平台只显示一次完整的 Key。
4. 回到 Halo，在「欢迎使用 Halo」页面点 **自定义 API**，粘贴 Key，在 **提供商** 里选下表最后一列的名字，点 **测试连接**，再点 **保存并进入**。已经在用 Halo 的话，在 **设置 › AI 模型 › 添加AI提供商** 里操作。

::: done
看到「连接成功」并进入「今天想做点什么？」，就说明 Key 能用了。
:::

## 各平台入口和在 Halo 里选的名字 {#providers}

Halo 的提供商列表里显示的是平台的英文名。下面是常用的国内平台：

| 平台 | 控制台 | 在「提供商」里选 |
|---|---|---|
| DeepSeek（深度求索） | [platform.deepseek.com](https://platform.deepseek.com/) | DeepSeek |
| 月之暗面 Kimi（中国站） | [platform.moonshot.cn](https://platform.moonshot.cn/) | Kimi (中国) |
| 智谱 GLM | [open.bigmodel.cn](https://open.bigmodel.cn/) | Zhipu AI (GLM)；买的是编程套餐就选 Zhipu GLM (Coding Plan) |
| 通义千问（阿里云 DashScope） | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) | Aliyun DashScope (Qwen) |
| 硅基流动 | [siliconflow.cn](https://siliconflow.cn/) | SiliconFlow |
| MiniMax（中国站） | [minimaxi.com](https://www.minimaxi.com/) | MiniMax (中国)；买的是 Token Plan 就选 MiniMax Token Plan (中国) |
| 零一万物 | [platform.lingyiwanwu.com](https://platform.lingyiwanwu.com/) | 01.AI (Yi) |
| 阶跃星辰 | [platform.stepfun.com](https://platform.stepfun.com/) | StepFun |

海外平台：

| 平台 | 控制台 | 在「提供商」里选 |
|---|---|---|
| OpenAI | [platform.openai.com](https://platform.openai.com/) | OpenAI API |
| Anthropic（Claude） | [console.anthropic.com](https://console.anthropic.com/) | Claude (Anthropic) API |
| OpenRouter | [openrouter.ai](https://openrouter.ai/) | OpenRouter |
| 月之暗面 Kimi（国际站） | [platform.moonshot.ai](https://platform.moonshot.ai/) | Kimi (Global) |
| MiniMax（国际站） | [minimax.io](https://www.minimax.io/) | MiniMax (Global) 或 MiniMax Token Plan (Global) |
| Groq | [console.groq.com](https://console.groq.com/) | Groq |
| Mistral AI | [console.mistral.ai](https://console.mistral.ai/) | Mistral AI |
| xAI | [x.ai](https://x.ai/) | xAI (Grok) |

列表里还有 OrcaRouter、Atlas Cloud、Requesty、DeepInfra、Together AI、Fireworks AI 和 LiteLLM，选法相同。在 **设置 › AI 模型** 添加提供商时，表单顶部的 **获取API密钥** 链接会直接打开所选平台的网站。

## 公司给的地址和 Key {#company-gateway}

公司或服务商给你一个地址（URL）和一个 Key 时：

1. 在 **提供商** 里选 **OpenAI API**。
2. 把公司给的地址填进 **API URL**，替换掉自动填好的地址。
3. 粘贴 Key，点 **测试连接**，再保存。

只有对方明确说是 Anthropic 格式的接口，才选 **Claude (Anthropic) API**。第三方网关选错成 Claude (Anthropic) API 是常见的配置错误，会导致连不上。更多见 [模型网关与代理](/advanced/gateway-and-proxy)。

## 遇到问题 {#troubleshooting}

### 测试连接失败，或保存时报错

先确认两件事：Key 是完整复制的（开头结尾没有少字符，也没有多余的空格），**提供商** 选的是你申请 Key 的那一家。每条报错的含义和处理方法，见 [连接 AI 模型 › 遇到问题](/getting-started/setup-ai#troubleshooting)。

### 不知道自己的 Key 属于哪家

看你是在哪个网站上申请的，就选哪一家。名字对不上时，对照上面的表格。

### Key 不小心发给了别人

到这家平台的控制台删除这个 Key，新建一个，再到 **设置 › AI 模型** 里编辑这个提供商，换成新的 Key。

## 下一步 {#next-steps}

- [连接 AI 模型](/getting-started/setup-ai#api-key)：把 Key 填进 Halo 的完整步骤。
