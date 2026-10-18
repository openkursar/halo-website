---
title: 给 AI 工具的文档：llms.txt 与 Markdown 版本
description: 给 AI 工具的文档：Halo 为 AI 读者提供 llms.txt 索引、全文合集和每一页的 Markdown 版本；这里列出地址和内容，并说明 Halo 内置的 AI 怎样读取官方指南。
type: reference
audience: [developer]
related: [features/operate-halo, developers/api/]
---

# 给 AI 工具的文档

这些文件和本站页面出自同一份源文件，每次发布文档时一起重新生成，所以内容总是和你看到的网页一致。下文的地址都以本文档站点为根。

## 文件一览 {#files}

| 文件 | 地址 | 内容 |
|---|---|---|
| 中文索引 | `/docs/llms.txt` | 每个页面一行：标题、Markdown 地址和一句话说明。开头是写给 AI 助手的使用说明。 |
| 英文索引 | `/docs/en/llms.txt` | 同上，列出英文页面。 |
| 中文全文 | `/docs/llms-full.txt` | 所有中文页面的 Markdown 全文，按侧边栏的顺序排列。 |
| 英文全文 | `/docs/en/llms-full.txt` | 同上，收录英文页面。 |
| 单页 Markdown | 把网页地址末尾的 `.html` 换成 `.md` | 例如 `/docs/features/memory.html` 对应 `/docs/features/memory.md`。以 `/` 结尾的目录页对应 `index.md`，例如 `/docs/getting-started/index.md`。 |
| Halo 助手指南 | `/docs/ai-guides/index.md` | Halo 内置的 AI 读取的英文指南，从这份索引进入。 |

全文合集不收录文档首页和「场景与对比」里的页面。文档首页的 Markdown 版本就是同一语言的 llms.txt。

<!-- public:start -->
公开站点的地址以 `https://hello-halo.cc/docs/` 开头，例如 `https://hello-halo.cc/docs/llms.txt`。网站根目录的 `https://hello-halo.cc/llms.txt` 是 Halo 的产品简介，并链接到上面的两份索引和两份全文。
<!-- public:end -->

## Markdown 版本里有什么 {#markdown-pages}

每个 Markdown 文件开头是一段 YAML 元数据，后面是正文。

| 字段 | 含义 |
|---|---|
| `title` | 页面标题 |
| `description` | 一句话说明，和网页标题下面的那句话相同 |
| `type` | 页面类型：`tutorial` 教程、`how-to` 操作指南、`reference` 参考、`explanation` 说明，或 `hub` 栏目首页 |
| `audience` | 适合的读者：`beginner` 新手、`office` 办公用户、`developer` 开发者、`admin` 管理员 |
| `since` | 功能从哪个版本开始提供，只在需要时出现 |
| `platforms` | 功能只在部分平台上提供时，列出这些平台 |
| `prerequisites`、`related` | 建议先读的页面、相关页面，写的是页面路径 |
| `lang` | `zh-CN` 或 `en` |
| `last_updated` | 页面最后一次修改的时间 |
| `source` | 文档对应的 Halo 版本 |

<!-- public:start -->
公开站点的文件还有一个 `canonical` 字段，是对应网页的完整地址。
<!-- public:end -->

正文和网页一致，只为纯文本做了几处调整：

- 网页标题下面的那句说明，成为标题后的第一段。
- 站内链接指向对应的网页（`.html`）。
- 「直接对 Halo 说」「完成」和提示框保留为 `::: say`、`::: done`、`::: tip` 这样的块，读者和程序都能认出来。
- 按平台切换的内容，改成每个平台一个小标题，例如 `#### macOS`。
- 截图保留为图片链接。网页源文件里的注释不会出现在 Markdown 版本中。

## 复制本页 {#copy-page}

每个文档页的右上方有 **复制本页**：把这一页的 Markdown 版本复制到剪贴板，可以直接粘贴给任何 AI 助手。旁边的 **更多** 菜单里还有：

- **查看 Markdown**：在新标签页打开这一页的 Markdown 版本。
- **在 Halo 里问**：复制一句以本页主题开头的提问。粘贴到 Halo 的输入框，接着写你的问题就行。

<!-- public:start -->
公开站点的 **更多** 菜单还有 **在 ChatGPT 中打开** 和 **在 Claude 中打开**：在对应的网站新开一个对话，并请它先读这一页的 Markdown 版本。
<!-- public:end -->

## Halo 内置的 AI 怎样读文档 {#halo-assistant}

Halo 里的 AI 回答关于 Halo 自己的问题前，会先读官方的「Halo 助手指南」，而不是凭记忆回答。这些指南是写给 AI 的英文文档，放在本站的 `/docs/ai-guides/` 下，入口是 `index.md`。它们写明每个功能的机制、排查问题的顺序，以及哪些事必须由你亲手在界面上完成。

- **在哪里能用**：任何会话、数字人聊天和计划运行里，Halo 都可以用内置的读文档工具读取这些指南。这个工具只能读 `/docs/ai-guides/` 里的 `.md` 文件。
- **读的是最新内容**：工具先从文档站点实时读取。同一份指南在 10 分钟内再次读取时，直接用刚才读到的内容。
- **离线时**：连不上文档站点时，工具改读安装包里自带的指南副本。副本是这个 Halo 版本发布时的快照，可能比网上的旧；这时工具会注明内容来自离线副本。
- **公司定制的 Halo**：可以让它改从公司自己的文档站点读取（`product.json` 里的 `officialContent.baseUrl`）。

### 文档镜像 {#agent-mirror}

每次发布文档时，本站页面的纯文本副本会写到 `/docs/ai-guides/docs/` 下，Halo 的 AI 可以用同一个工具读取它们：

- 入口是 `docs/index.md`，中文页面在 `docs/zh/`，英文页面在 `docs/en/`。
- 副本里的站内链接改成镜像里的路径，截图换成文字说明，方便接着往下读。
- 镜像不包含生成的 HTTP API 参考。打开 **操作 Halo** 后，Halo 的 AI 用它自己的接口手册调用这些接口。
- 镜像只在文档站点上，不在安装包自带的离线副本里。

## 让其他 AI 工具读 Halo 文档 {#other-ai-tools}

- **问一个具体问题**：把相关页面的 Markdown 地址发给能读网页的 AI，或者在那一页点 **复制本页**，再粘贴过去。
- **让 AI 先了解整个产品**：给它 llms.txt 的地址，它可以从索引里挑出要读的页面。
- **一次读完全部文档**：给它 llms-full.txt 的地址。全文较长，适合能处理长文本的工具。

## 相关页面 {#related}

- [让 AI 帮你操作 Halo](/features/operate-halo)：打开「操作 Halo」后，AI 能替你改哪些设置。
- [HTTP API 概览](/developers/api/)：用你自己的脚本或服务调用 Halo。
