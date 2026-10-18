---
title: 配置 AI 模型：登录账号或填写 API Key
description: Halo 要连上一个 AI 模型才能干活。先用表格选一种方式：免费登录、已有会员账号、API Key，或者暂时跳过，再按对应的步骤完成。
type: tutorial
audience: [beginner]
prerequisites: [getting-started/install]
related: [getting-started/api-keys, features/models, advanced/gateway-and-proxy]
---

# 连接 AI 模型

这一步需要你自己点：连上模型之前，Halo 还不能回答问题；连上之后，它也不能替你添加账号或填写 API Key。

::: tip 从 Halo 里的「不知道如何获取?查看教程」点进来的？
API Key 要到模型平台的网站上申请。各平台的申请步骤见 [获取 API Key](/getting-started/api-keys)。如果你还没有 Key，也可以先用下表里的登录方式，不需要 Key。
:::

## 我该选哪种？ {#which-option}

第一次打开 Halo、选好语言和主题后，会看到「欢迎使用 Halo」和「选择一种方式开始」。按你的情况选：

| 你的情况 | 选这个 | 接下来会发生什么 |
|---|---|---|
| 在中国大陆，没有 AI 会员，也没有 API Key | **腾讯** | 浏览器打开 CodeBuddy 登录页，用微信扫码登录，就能用 kimi、glm、deepseek 等模型（免费额度以该服务当前规则为准） |
| 不在中国大陆，没有会员 | **Kiro** | 用 Google 或 GitHub 账号登录，使用 Claude 模型（免费额度以 Kiro 当前规则为准） |
| 有 Claude Pro 或 Max 会员 | **Claude** | 用 claude.ai 账号登录 |
| 有 ChatGPT 或 Codex 的 Plus、Pro、Business 会员 | **ChatGPT** | 用 ChatGPT 账号登录 |
| 有 GitHub Copilot | **GitHub Copilot** | 在浏览器里输入 Halo 显示的验证码 |
| 公司发了 API Key，或你在 DeepSeek、Kimi、智谱等平台买了 Key | **自定义 API** | 粘贴 Key，选提供商，测试后保存 |
| 想先看看界面 | **暂时跳过** | 直接进入 Halo；在添加模型之前不能对话 |

![「欢迎使用 Halo」页面：最上面是 Claude 按钮，下方「或选择其他方式」列出腾讯、Kiro、ChatGPT、GitHub Copilot 和自定义 API，最下面是「暂时跳过」](/images/getting-started/setup-ai/sign-in-options.zh.webp)

::: info 选项可能和这里不同
登录方式由你使用的 Halo 版本决定。公司提供的 Halo 可能显示不同的选项，以你屏幕上看到的为准。
:::

<!-- internal:sso-sign-in -->

## 开始之前 {#before-you-start}

- Halo 已经装好，停在「欢迎使用 Halo」页面。已经在用 Halo 了？到 **设置 › AI 模型** 添加，步骤一样，见 [模型与账号](/features/models)。
- 用账号登录时，需要在浏览器里打开对应的网站，例如 claude.ai、chatgpt.com 或 github.com。

## 用账号登录 {#sign-in}

适用于腾讯、Kiro、Claude、ChatGPT 和 GitHub Copilot。

1. 在「欢迎使用 Halo」页面点你选的方式。
2. 浏览器会打开登录页面，Halo 上显示「正在打开登录页面...」或「等待登录...」。在浏览器里完成登录：
   - **腾讯**：用微信扫码，登录 CodeBuddy 账户。
   - **Kiro**：用 Google 或 GitHub 账号登录。
   - **ChatGPT**：用你的 ChatGPT 账号登录。
   - **GitHub Copilot**：Halo 会显示「请访问此链接登录：」和一个验证码。打开链接，输入验证码（可以点旁边的按钮复制）。
3. 登录完成后，Halo 自动进入主界面。

### Claude 的两种登录方法 {#claude}

点 **Claude** 后，Halo 显示「选择登录方式」：

- 点 **打开登录窗口**：在 Halo 弹出的窗口里登录 claude.ai。
- 或者用 **手动登录**：点链接旁边的 **复制**，在浏览器里打开并登录，把页面给出的授权码粘贴到「在此处粘贴授权码」，再点 **完成登录**。

![Claude 的「选择登录方式」：上面是打开登录窗口按钮，下面是手动登录，有登录链接、复制按钮和粘贴授权码的输入框](/images/getting-started/setup-ai/browser-sign-in.zh.webp)

登录要在 10 分钟内完成，超时就重新点一次 **Claude**。

## 填写 API Key {#api-key}

1. 点 **自定义 API**（兼容 Claude / OpenAI）。
2. 在 **API Key** 下面的输入框（提示文字是「输入您的 API Key」）里粘贴你的 Key。
3. 在 **提供商** 里选这个 Key 属于哪家平台。可以输入名字搜索。这里没有默认值，必须选。
4. **API URL** 会自动填好。只有用公司网关或代理时才需要改。
5. 点 **测试连接**，看到「连接成功」。
6. 点 **保存并进入**。

![自定义 API 表单：上面是 API Key 输入框，中间选了提供商 DeepSeek，API URL 已自动填好，下方显示「连接成功」和「保存并进入」按钮](/images/getting-started/setup-ai/custom-api.zh.webp)

保存时，Halo 会读取这家平台的模型列表，并自动选第一个模型。以后可以在输入框旁边换成别的模型。

提供商列表里的名字是平台的英文名，例如智谱是「Zhipu AI (GLM)」，通义千问是「Aliyun DashScope (Qwen)」，月之暗面是「Kimi (中国)」。对照表见 [获取 API Key](/getting-started/api-keys#providers)。

公司给你的是一个地址和一个 Key？提供商选 **OpenAI API**，把地址填进 **API URL**。只有对方明确说是 Anthropic 格式时，才选 **Claude (Anthropic) API**。详见 [模型网关与代理](/advanced/gateway-and-proxy)。

## 暂时跳过 {#skip}

点页面下方的 **暂时跳过**（「稍后在设置中配置你的 AI」）。Halo 会直接进入主界面，下次打开也不会再弹出这个页面。

在添加模型之前，Halo 还不能对话。输入框旁的模型按钮会显示「配置 AI 来源」，点它就会打开 **设置 › AI 模型**。

::: done
看到「今天想做点什么？」和中间的输入框，就说明模型连好了。
:::

## 以后可以做的事 {#later}

- **同时保留多个账号或 Key**：在 **设置 › AI 模型** 里添加。同一家登录第二个账号时，点「添加其他账户」。
- **每个会话单独选模型**：点输入框旁边的模型名，可以换模型，也可以调整「深度思考」的级别。

详见 [模型与账号](/features/models)。

## 遇到问题 {#troubleshooting}

### 浏览器里登录完成了，Halo 还在等

回到 Halo 点 **取消**，再点一次刚才的登录方式。Claude 可以改用 **手动登录**，把授权码粘贴回 Halo。

### 打不开 claude.ai 或 chatgpt.com

这是网络问题，不是 Halo 的问题。可以改用 **腾讯** 或 **自定义 API**。如果你需要通过代理上网：先点 **暂时跳过** 进入 Halo，到 **设置 › 系统 › 代理** 填写代理地址并保存，再到 **设置 › AI 模型** 登录。

### 保存时报错，或者测试连接失败

保存时出现的提示和处理方法：

| 提示 | 怎么办 |
|---|---|
| 「API 密钥无效或没有权限」 | Key 没有复制完整，或已经在平台上删除。重新复制一次 |
| 「未找到端点，请检查 URL」 | 提供商选错了，或 API URL 被改错了。重新选择提供商 |
| 「请求频率受限或配额已用尽」 | 平台账户余额或免费额度用完了，或者请求太频繁 |
| 「请求超时，请检查服务器或代理」或「无法连接服务器，请检查网络或代理」 | 电脑连不上这家平台。检查网络和代理设置 |

**测试连接** 的失败提示目前只有英文，例如 "Invalid API key"（Key 无效）、"API endpoint not found - check URL"（地址不对）、"Rate limited - try again later"（请求太频繁或额度用完）、"Cannot connect to API server - check URL"（连不上服务器）。

### 用了一段时间后提示 "OAuth token expired or invalid. Please login again."

账号的登录状态过期了。打开 **设置 › AI 模型**，在下方「OAuth登录」里点同一家（它会显示「添加其他账户」），用**同一个账号**再登录一次，Halo 会更新这个账号，不会重复添加。更多报错见 [错误信息速查](/troubleshooting/common-errors)。

## 下一步 {#next-steps}

- [完成第一个任务](/getting-started/first-chat)：用一句话让 Halo 做出一份真实的文件。
- [获取 API Key](/getting-started/api-keys)：想用 DeepSeek、Kimi、智谱等平台的 Key 时看这里。
