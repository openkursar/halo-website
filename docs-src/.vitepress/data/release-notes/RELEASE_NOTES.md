## Next

## v3.0.4
Halo 3.0：数字人团队 · 新首页与界面 · 飞书机器人 · 日常助理与提醒 · 会话通信与操作 Halo · 记忆进化 · Office 文档处理 · 多账号与模型选择
Halo 3.0: Digital human teams · New home and interface · Feishu bot · Everyday assistant and reminders · Conversations that work together and operate Halo · Evolving memory · Office documents · Multiple accounts and model choice

- 数字人团队：多位数字人可以分工、沟通、共享成果。可以临时组队，也可以保存为长期团队；还可以邀请同事带着自己的数字人跨电脑协作。
- 新首页与界面：重新组织对话、数字人、知识库和商店入口，统一主要聊天体验，集中查看运行任务和待处理问题。
- 飞书机器人：新增飞书双向接入，可以在飞书中向数字人交办工作，也可以通过团队成员联系背后的协作团队。
- 日常助理与提醒：在数字人聊天里直接安排会议、休息、活动等一次性或重复提醒，不必为一个临时提醒新建数字人。
- 会话通信与操作 Halo：AI 可以参考同空间的其他对话、交接信息、询问进展，也能代办部分会话、空间、数字人等管理操作。
- 记忆进化：同空间聊天可以共享积累的记忆；数字人的记忆按当前状态、历史和专题组织，支持自动与手动整理。
- Office 文档处理：内置文档处理技能和运行环境，减少制作 Word、Excel、PPT、PDF 时安装依赖的麻烦。
- 多账号与模型选择：支持通过 Halo 提供的登录入口分别保留多个 ChatGPT、Claude 等账号，方便命名与切换；模型与思考强度更容易调整。
- Windows 更新更快：从 3.0 起，之后的新版本会在后台下载并准备好，点击重启即可完成更新，不必再下载、运行安装程序。本次从 2.x 升级仍使用安装包。
- 系统要求：Mac 需要 macOS 12 及以上，更低版本的 Mac 会继续使用 2.x；Linux 需要 glibc 2.34 及以上（如 Ubuntu 22.04、Debian 12 及更新版本），更旧的 Linux 请继续使用 2.1.15。

- Digital human teams: several digital humans can divide the work, talk to each other and share results. Form a team for the task at hand or save it as a standing team, and invite colleagues to collaborate from their own computers with their own digital humans.
- New home and interface: entry points for conversations, digital humans, knowledge bases and the store are reorganized, the main chat experience is unified, and running tasks and pending questions are gathered in one place.
- Feishu bot: new two-way Feishu integration — hand work to a digital human from Feishu, or reach the collaborating team behind a team member.
- Everyday assistant and reminders: set one-off or recurring reminders for meetings, breaks, events and more right in a digital human's chat, without creating a digital human for a passing reminder.
- Conversations that work together, and the AI operating Halo: the AI can consult other conversations in the same space, hand over information and ask how things are going, and can take care of some management of conversations, spaces and digital humans for you.
- Evolving memory: chats in the same space share the memory they build up; a digital human's memory is organized into current state, history and topics, and can be tidied automatically or by hand.
- Office documents: built-in document skills and runtime, so making Word, Excel, PowerPoint and PDF files no longer starts with installing dependencies.
- Multiple accounts and model choice: keep several ChatGPT, Claude and other accounts side by side through Halo's sign-in options, name them and switch between them; models and thinking effort are easier to adjust.
- Faster Windows updates: from 3.0 on, new versions download and get ready in the background, and a restart finishes the update — no installer to download and run. This upgrade from 2.x still uses the installer.
- System requirements: macOS 12 or later on Mac, and older Macs stay on 2.x; Linux needs glibc 2.34 or later (for example Ubuntu 22.04, Debian 12 and newer), so keep 2.1.15 on older Linux systems.

## v2.1.15
AI 可操作 Halo 自身 · 应用市场改版 · 强制更新与自动更新修复 · 新增 Claude Code CLI 登录方式 · AI 浏览器/Canvas 稳定性修复
AI can now operate Halo itself · App Store revamped · Mandatory update & auto-update fixes · Claude Code CLI sign-in added · AI Browser/Canvas stability fixes
- 自我操控 API：Agent 现在可以通过受限的本机回环 API 操作 Halo 本身（如切换设置、管理会话等），开启了"AI 帮你操作 Halo"的新交互方式
- 强制更新：新增不可跳过的更新提示，用于关键版本的强制升级；修复 macOS 更新时最小化到托盘导致退出卡死的问题；修复内部自动更新通道端到端链路
- 应用市场：一键发布数字人和技能到商店，支持重新发布更新已安装的作品、技能导出为 .zip 包、离线安装排队重试、发布前检测技能依赖是否可解析；切回商店页面自动刷新，不再显示过期内容
- 新模型与登录：新增 Claude Code CLI 免密登录（凭据由本地 CLI 保管，Halo 不存储）；支持按模型单独设置推理强度，供应商返回的模型能力可持久保存；新建 AI 来源默认按 OpenAI 兼容格式而非 Anthropic
- AI 浏览器与 Canvas：修复浏览器视图节流范围导致的画布/AI 浏览器在隐藏再显示后永久空白问题；文件树不再误藏真实的 build/dist 目录
- 企业微信：图片等媒体消息支持双向收发；群聊 @机器人 后斜杠命令可正常识别；机器人可解析并显示发送者昵称；流式与非流式消息的确认回执文案统一
- 知识库与图片识别：数字人可直接绑定知识库；修复监视文件夹在大量文件或磁盘根目录下卡死的问题；不支持图片的模型自动通过本地 OCR 识别图片文字
- 稳定性修复：修复调度器并发上限导致的任务卡死、超大图片处理失败、多账号同一供应商下模型参数覆盖丢失、会话自动标题覆盖用户手动重命名等问题
- Self-operating API: the agent can now operate Halo itself through a scoped loopback API (e.g. changing settings, managing sessions), enabling a new "AI drives Halo" interaction mode
- Mandatory update: added an unskippable update prompt for critical releases; fixed macOS auto-update hanging on quit when minimized to the tray; repaired the internal auto-update channel end to end
- App Store: publish digital humans and skills to the store in one click, republish to update what you already installed, export skills as a .zip package, detect unresolvable skill dependencies before publishing, and offline installs now queue and retry; the store list refreshes automatically when you switch back to it instead of showing stale content
- Models and sign-in: added Claude Code CLI sign-in (the bundled CLI keeps its own credential, Halo stores none); set reasoning effort per model; provider-supplied model capabilities now persist; new AI sources default to OpenAI-compatible instead of Anthropic
- AI Browser and Canvas: fixed BrowserView throttling scope so canvas/AI Browser no longer goes permanently blank after a hide/show cycle; the file tree no longer hides real build/dist directories
- WeCom: media messages (images, etc.) now flow both ways; slash commands work after an @mention in group chats; the bot can resolve and show sender names; acknowledgement replies are now consistent across streaming and non-streaming channels
- Knowledge base and OCR: digital humans can bind a knowledge base directly; fixed watched folders freezing on large file counts or disk-root paths; non-vision models now fall back to local OCR for images
- Stability: fixed a scheduler concurrency issue that could stall job dispatch, fixed handling of oversized images, fixed model override persistence across multiple accounts on the same provider, and conversation auto-titling no longer overwrites a user's manual rename

## v2.1.13
知识库 · AI 终端 · 数字人多会话 · 界面缩放 · 图片文字识别，以及多项修复
Knowledge base · AI terminal · Multi-session digital humans · Display scaling · OCR, plus fixes

- 知识库：把文件、文件夹、PDF、Office 文档导入知识库，自动整理成可检索的知识，聊天时直接引用并标注出处；支持监视文件夹自动更新、一键清空重学，远程网页端同样可用
- AI 终端：内置终端运行在独立进程中，卡死或崩溃不再影响主界面，入口移到右侧工作区
- 数字人升级：支持多会话同时对话、可把任务接回客户端继续；能按应用单独配置能力、MCP 与技能；停止进行中的 IM 会话不再丢失历史
- 远程访问：支持固定地址的长期隧道与无界面服务器模式，多设备接入自动仲裁，访问码规则放宽
- 界面缩放：设置中可在 50%-150% 之间调节，支持 Cmd/Ctrl 加号、减号、0 快捷键，重启后保持
- 模型与登录：新增 GLM 编程套餐登录、Atlas Cloud 内置源，可按模型单独指定是否支持图片，额度用量直接显示在来源上，首次配置流程简化
- 图片文字识别：内置 OCR，可直接读取截图和扫描件中的文字
- 其他改进：浏览器 User-Agent 可自定义、Canvas 文件标签支持刷新与自动重载、MCP 支持连接检测与多服务器批量导入、企业微信群回复可关闭引用气泡、凭据本地加密存储
- 稳定性修复：修复 OpenAI 兼容接口的用量统计与 max_tokens 传递、Windows 后台进程弹出控制台窗口、图片查看器缓存不刷新、创建空间时中文输入法回车误提交等问题
- Knowledge base: import files, folders, PDFs and Office documents; Halo organises them into searchable knowledge and cites sources inline in chat. Watched folders update automatically, one click clears and relearns, and it all works in the remote web client too
- AI terminal: the built-in terminal now runs in its own process, so a hang or crash no longer affects the main window. Entry point moved to the right-hand workspace
- Digital humans: hold several conversations at once and hand a task back to the desktop client to continue; configure capabilities, MCP servers and skills per app; stopping a running IM session no longer loses its history
- Remote access: long-lived tunnels with a fixed address, a headless server mode, automatic arbitration across multiple devices, and a relaxed access-code policy
- Display scaling: adjustable from 50% to 150% in Settings, with Cmd/Ctrl plus, minus and 0 shortcuts, persisted across restarts
- Models and sign-in: GLM coding plan login, Atlas Cloud as a built-in source, per-model vision override, quota usage shown directly on the source, and a simplified first-run setup
- OCR: read text straight out of screenshots and scanned documents
- Also: customisable browser User-Agent, refresh and auto-reload for Canvas file tabs, MCP connection probing and multi-server import, optional quote bubbles for WeCom group replies, and encrypted local credential storage
- Fixes: usage reporting and max_tokens forwarding for OpenAI-compatible endpoints, console windows popping up from Windows background processes, stale image-viewer cache, and the create-space dialog submitting early during Chinese IME input

## v2.1.12
**应用市场 · App Store**
一键把自己的技能和数字人分享到商店，也能浏览、安装、升级他人的作品，详情页可直接查看使用文档。
Share your skills and digital humans to the store in one click, browse, install, and upgrade others' creations, with docs viewable right on the detail page.

**最新模型 · Latest Models**
支持 Claude Sonnet 5（含 1M 上下文）、Claude Fable 5、Claude Opus 4.8 等最新模型，并新增 LiteLLM 网关接入。
Added Claude Sonnet 5 (with 1M context), Claude Fable 5, Claude Opus 4.8, and LiteLLM gateway support.

**数字人更好用 · Smarter Digital Humans**
可直接给运行中或已完成的任务发消息追问，任务结果自动推送到订阅的企业微信联系人。
Message a running or finished task directly to follow up; results are auto-pushed to subscribed WeCom contacts.

**移动端与安全 · Mobile & Security**
手机界面全面优化，浏览器访问白名单可自定义，远程访问与应用安装安全性增强。
Fully refined mobile UI, customizable browser allowlist, and hardened security for remote access and app installs.

## v2.1.4
AI 自主推送 数字人可通过提示词自主判断何时推送、推送给谁，不再依赖固定规则触发。IM 推送需在应用设置中开启。

可视化调度配置 新增可视化调度编辑器，支持快捷频率和精确 Cron 配置，无需手写 YAML 表达式。

AI 浏览器下载 AI 浏览器新增文件下载能力，支持直接下载和点击触发下载，静默保存无弹窗。

开发者模式 设置中新增开发者模式，开启后输出详细诊断日志，便于排查问题。

DeepSeek V4 模型 新增 DeepSeek V4 Flash 和 V4 Pro 模型，旧版标记为 Legacy。

IM 联系人管理优化 支持重命名联系人、复制信息、移除失效会话，帮助 AI 更准确匹配指令。

DeepSeek V4 深度思考修复 修复深度思考模式下推理内容未正确注入的问题。

文件导出安全机制 防止 AI 通过 IM 发送工作区外的文件，增强安全性。

AI-Autonomous Push Digital humans can now decide when to notify and who to notify based on their prompt instructions, no longer relying on fixed rules. IM Push requires enabling in app settings.

Visual Schedule Picker New visual schedule editor with quick presets and precise cron configuration — no more hand-writing YAML expressions.

AI Browser Download AI browser now supports file downloads — both direct URL and click-triggered, saved silently without dialogs.

Developer Mode New Developer Mode in Settings for verbose diagnostic logging to help troubleshoot issues.

DeepSeek V4 Models Added DeepSeek V4 Flash and V4 Pro models. Legacy V3 / R1 marked accordingly.

IM Contact Management Rename contacts, copy info, and remove stale sessions — helps AI match your natural language instructions.

DeepSeek V4 Thinking Fix Fixed reasoning content not being properly injected in thinking mode.

File Export Security Prevents AI from sending files outside the workspace via IM, enhancing security.

## v2.1.3
**个人微信直连 · Personal WeChat Integration**
扫码即可将 Halo 接入个人微信，在自己的微信直接与 Halo 对话，无需切换任何界面。
Scan a QR code to connect Halo with your personal WeChat — chat with Halo directly without switching apps.
**模型上下文窗口自由配置 · Custom Model Context Window**
可手动设置每个模型的上下文窗口大小，不再受默认值限制，按需调整。
Manually configure the context window size for each model, no longer constrained by defaults.
**内置邮件 MCP · Email MCP Integration** *(需手动开启 / Manual activation required)*
接入公司邮箱，支持收发邮件、查询日历等操作，直接在 Halo 中处理工作邮件。
Connect your work email to send, receive, and manage calendar events directly within Halo.
**企业级安全控制 · Enterprise Security Controls**
访客 Bot 默认禁用 Bash、文件写入、编辑等高权限工具，需管理员手动授权开启，降低误操作风险。
High-privilege tools (Bash, file write, edit) are disabled for guest bots by default and require explicit admin authorization, reducing accidental exposure.
**流式输出开关 · Streaming Toggle**
支持开启或关闭流式传输，按网络环境和使用场景灵活切换。
Enable or disable streaming output to suit your network conditions and workflow preferences.
**浏览器快速打开 URL · Browser URL Shortcut**
数字人浏览器新增 URL 快捷输入入口，无需跳转到空间界面，直接输入地址访问页面。
A new URL input shortcut in the digital human browser lets you navigate directly without switching to the space interface.
**新增 `/halo-clear` 指令 · New `/halo-clear` Command**
一键清空当前对话上下文，前缀 `halo-` 避免与 Claude Code 内置命令冲突。
Instantly clear the current conversation context. The `halo-` prefix avoids conflicts with Claude Code built-in commands.
**私聊免打扰 · Private Chat Silent Mode**
支持配置特定私聊不自动回复，更灵活地管理消息渠道。
Configure specific private chats to skip auto-reply for more granular control over your messaging channels.
**空间文件夹快速打开 · Quick Space Folder Access**
优化数字人空间与记忆区域交互，点击即可直接打开对应文件夹，减少操作层级。
Streamlined space and memory area navigation — open the corresponding folder in one click with fewer steps.
**其他已知问题修复 · Bug Fixes**
修复若干已知问题，提升整体稳定性。
Various known issues resolved for improved overall stability.

## v2.1.1
- SkillHub 查询优化：proxy-first 合并策略 + 技能分组代理源，技能加载更稳定可靠
- @hello-halo/agent-sdk 按需加载：构建产物更轻量，不依赖 SDK 的用户体验更流畅
- Halo SDK 稳定性提升：GLM 流式输出修复、MCP 动态管理、会话多轮优化
- Windows 安装程序升级修复：覆盖安装更顺畅

- SkillHub query optimization: proxy-first merge strategy + skill group proxy sources for more reliable skill loading
- Optional @hello-halo/agent-sdk runtime loading: lighter builds for users who don't rely on the SDK
- Halo SDK stability improvements: GLM streaming fix, dynamic MCP management, multi-turn session robustness
- Windows installer upgrade fix: smoother in-place updates

## v2.1.0
- 技能市场 SkillHub：接入 33,000+ 社区技能，Settings → 技能市场 一键安装
- Halo SDK 引擎：内置 Agent 执行引擎（in-process），无需启动子进程，响应更快、资源占用更低
- SkillHub 查询优化：proxy-first 合并策略 + 技能分组代理源，技能加载更稳定
- @hello-halo/agent-sdk 按需加载：不依赖 SDK 的用户可获得更轻量的构建产物

- SkillHub marketplace: 33,000+ community skills available for one-click install via Settings → Skill Marketplace
- Halo SDK engine: in-process agent execution engine, no subprocess overhead, faster response and lower resource usage
- SkillHub query optimization: proxy-first merge strategy + skill group proxy sources for more reliable skill loading
- Optional @hello-halo/agent-sdk runtime loading: lighter builds for users who don't rely on the SDK

## v2.0.9
- 支持企业微信机器人消息通知
- 支持安卓移动端 App 远程访问
- 新增 @文件 引用、侧边栏等管理体验改进
- 修复已知 bug，提升整体稳定性

- Support WeCom (Enterprise WeChat) robot notifications
- Support remote access via Android mobile app
- Added @file references, sidebar improvements, and other management UX enhancements
- Bug fixes and overall stability improvements

## v2.0.8
- 支持 kiro 登录获取免费的 claude 模型
- AI 数字人时代正式开启, 支持 7×24 小时委托小红书、b 站等监控、发帖等
- 应用商店、skill/数字人等一键安装
- 其他大量改进

 Log in with kiro to get free claude access
- The era of AI digital humans officially begins, supporting 7×24-hour monitoring and posting on platforms like Xiaohongshu and Bilibili
- One-click installation for app stores, skills/digital humans, etc.
- Numerous other improvements

## v2.0.7
- 支持 kiro 登录获取免费的 claude 模型
- AI 数字人时代正式开启, 支持 7×24 小时委托小红书、b 站等监控、发帖等
- 应用商店、skill/数字人等一键安装
- 其他大量改进

 Log in with kiro to get free claude access
- The era of AI digital humans officially begins, supporting 7×24-hour monitoring and posting on platforms like Xiaohongshu and Bilibili
- One-click installation for app stores, skills/digital humans, etc.
- Numerous other improvements


## v2.0.6
- 支持 kiro 登录获取免费的 claude 模型
- AI 数字人时代正式开启, 支持 7×24 小时委托小红书、b 站等监控、发帖等
- 应用商店、skill/数字人等一键安装
- 其他大量改进

 Log in with kiro to get free claude access
- The era of AI digital humans officially begins, supporting 7×24-hour monitoring and posting on platforms like Xiaohongshu and Bilibili
- One-click installation for app stores, skills/digital humans, etc.
- Numerous other improvements

## v2.0.5
- 支持 kiro 登录获取免费的 claude 模型
- AI 数字人时代正式开启, 支持 7×24 小时委托小红书、b 站等监控、发帖等
- 应用商店、skill/数字人等一键安装
- 其他大量改进

 Log in with kiro to get free claude access
- The era of AI digital humans officially begins, supporting 7×24-hour monitoring and posting on platforms like Xiaohongshu and Bilibili
- One-click installation for app stores, skills/digital humans, etc.
- Numerous other improvements


## v1.2.18
- 支持免费的 qwen 3.5 plus
- 修复 AI 浏览器截图卡住
What's New
- Support free qwen 3.5 plus.
- Fix AI browser screenshot freezing issue.

## v1.2.17
更新内容
- 免费使用最新大模型 — 腾讯账号登录后，即可免费使用 GLM 5.0 和 Kimi 2.5。
- 多空间 & 多任务快速切换 — 支持跨空间、跨任务快速切换，实时显示任务状态（进行中、已完成、已阅读），支持系统通知推送，专为多项目并行工作场景设计。
- PC 端聊天侧边栏导航 — 对话切换改为侧边栏交互，操作更直观。欢迎老用户反馈使用体验。
- 性能优化 — 聊天区域采用虚拟滚动与懒加载；文件夹导航等关键计算迁移至 Web Worker，不阻塞主线程，解决 Windows 机型下的卡顿问题。
What's New
- Free Access to Latest AI Models — Sign in with Tencent account to use GLM 5.0 and Kimi 2.5 at no cost.
- Multi-Space & Multi-Task Switching — Quickly switch between spaces and tasks with real-time status indicators (In Progress, Completed, Read). System notifications keep you informed — ideal for managing multiple projects in parallel.
- Chat Sidebar Navigation — Conversation switching on PC has moved to the sidebar for a more intuitive UX. Feedback from existing users is welcome.
- Performance Improvements — Virtual scrolling and lazy loading for chat areas. Folder navigation and heavy computations offloaded to Web Workers, eliminating main-thread blocking and resolving lag on Windows machines.



## v1.2.14
- !!!claude-opus-4-6 Most powerful model!!!
- Supports dozens of AI providers, such as OpenRouter.
- Various bug fixes and stability improvements
- GitHub Login for Free Models - Sign in with GitHub to access free AI models
- Support discovery and invocation of Claude SKILLs
- !!! 支持史上最强模型 claude-opus-4-6
- 支持数十种大模型供应商，比如 OpenRouter 等
- GitHub 登录获取免费模型 - 使用 GitHub 登录即可获取免费 AI 模型
- 支持发现和调用claude 原生 SKILL 技能
- 修复了多个问题并提升了稳定性

## v1.2.13
Supports dozens of AI providers, such as OpenRouter.
Various bug fixes and stability improvements
GitHub Login for Free Models - Sign in with GitHub to access free AI models
Support discovery and invocation of Claude SKILLs

支持数十种大模型供应商，比如 OpenRouter 等
GitHub 登录获取免费模型 - 使用 GitHub 登录即可获取免费 AI 模型
支持发现和调用claude 原生 SKILL 技能
修复了多个问题并提升了稳定性

## v1.2.11
## 🎉 Key Updates
- **Multi-Source AI Support** - Switch between different AI services in settings
- **OAuth Quick Login** - One-click login for supported services (no API key needed)
- **Enhanced Security** - API keys are now encrypted

## 🎉 主要更新
- **多 AI 源支持** - 现在可以在设置中切换不同的 AI 服务
- **OAuth 快捷登录** - 部分服务支持一键登录，无需手动配置 API 密钥
- **安全性增强** - API 密钥现已加密存储


## v1.2.9



## 1.2.2
- Fix startup initialization timing issue that caused blank screen on some Windows devices
- Fix Settings page crash when config not fully loaded
- Add `bootstrap:extended-ready` event for proper frontend/backend synchronization
- Add debug logs for troubleshooting startup issues

---

- 修复部分 Windows 设备启动时出现黑屏/白屏的问题
- 修复设置页面在配置未完全加载时崩溃的问题
- 新增 `bootstrap:extended-ready` 事件，确保前后端正确同步
- 添加启动调试日志，便于问题排查

---

- Fix markdown preview black screen and rendering issues
- Add custom password support for remote access (thanks @yophon)
- Other bug fixes and improvements (thanks @sohowj and @liangxiwei)

## v1.2.1
- 优化启动速度
- 支持多国语言
- 兼容 openai v1/responses 新格式

## v1.2.0

🚀 AI 浏览器 - 让 AI 直接操控网页，自动填表、抓取数据、执行复杂操作
🔍 全局搜索 - Cmd+F 跨对话、跨空间搜索历史消息
🪟 Windows 重大修复 - 修复无法聊天、白屏等问题，现已可正常使用

---

### AI 浏览器
内置真实浏览器，AI 可以导航网页、点击按钮、填写表单、截图、分析网络请求。无需配置，开箱即用。

### 全局搜索
支持三种搜索范围：当前对话、当前空间、全部空间。快速定位历史对话内容。

### Windows 修复
- 修复无法发送消息、对话卡死的问题
- 修复 GPU 渲染导致的白屏/闪烁
- 自动检测并安装 Git Bash 环境
- 防止重复启动多个实例

### 其他改进
- 新增 Extended Thinking 深度思考模式
- 消息支持一键复制
- SDK 升级至 0.1.76

## v1.0.23
- 修复窗口被隐藏的时候偶现弹出报错

## v1.0.22
- 首个包含更新说明的版本
