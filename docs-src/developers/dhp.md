---
title: "DHP 协议：数字人包格式与商店来源"
description: "DHP（数字人协议）参考：.dhpkg 包的格式和限制，静态商店的目录结构与索引文件，以及 DHP v2 商店服务器额外提供的能力。"
type: reference
audience: [developer]
---

# DHP 协议

DHP（Digital Human Protocol，数字人协议）规定了 Halo 怎样打包数字人、技能和 MCP 服务器，以及商店怎样提供它们，让任何一台 Halo 都能一键安装。本页介绍包的格式、静态商店的目录结构，以及 DHP v2 商店服务器额外提供的能力。官方商店来源也遵循这套协议，仓库在 [github.com/openkursar/digital-human-protocol](https://github.com/openkursar/digital-human-protocol)。

## 数字人包 {#package}

数字人包（`.dhpkg`）是一个 zip 压缩包：

```text
weekly-report.dhpkg
├── spec.yaml                    必需：数字人的 spec
└── skills/                      可选：随包附带的技能
    └── report-tools/
        ├── SKILL.md
        └── build-report.js
```

- `spec.yaml` 放在压缩包根目录。在 Halo 里导入时，也接受把这些文件放在唯一一个顶层文件夹里的压缩包，大多数压缩工具打出来的就是这种。
- 每个随包技能放在 `skills/<id>/` 下，并在 spec 的 `requires.skills` 里写上 `bundled: true` 和它的 `files`。脚本为什么要放在这里，见[浏览器脚本](/developers/digital-humans/production#script-location)。
- 包请控制在 10 MB 以内：导入对话框最多读取这么大的压缩包（导入文件夹没有这个限制）。导出时文件合计超过 50 MB 会停止；其他导入方式会拒绝超过 50 MB、或解压后超过 200 MB 的压缩包。所有方式都会拒绝路径含 `..` 或以 `/` 开头的条目。
- 不要把 API Key、令牌或密码放进包里：它们会跟着包到达每一位安装者手里。

**制作。** 在桌面版的数字人页面点 **⋮ › 分享 › 导出**，得到 `<slug>-<version>.dhpkg`。它依赖的技能里，声明为 `bundled: true` 的，以及商店来源提供不了的，Halo 会打包进 `skills/<id>/`；既不在任何来源里、本机也没安装的技能会让导出停止，并给出它的名字。技能用同样的方式导出为它全部文件组成的 `.zip`，`SKILL.md` 在根目录。

**安装。** 打开 **数字人**，点 **创建数字人**，选择 **导入**，把 `.dhpkg`、`.zip`、`spec.yaml` 或文件夹拖进去。导入时会一并安装随包技能。

## 商店来源 {#sources}

商店来源是 Halo 读取商品目录的地址。每个来源使用一种协议：

| 协议 | 说明 |
|---|---|
| `halo` | 下文的静态 DHP 格式：同一个地址下的一组普通文件。官方来源用的就是它，在设置里添加的来源也都按它读取 |
| `dhp-v2` | 同样的静态目录，再加一个负责发布、审核和运营的商店服务器（见[下文](#dhp-v2)） |
| `mcp-registry`、`smithery`、`claude-skills`、`skillhub` | 内置的公共 MCP 服务器和技能目录。Halo 会转换它们的条目，你不需要自己提供 |

添加公司自己的来源，见[私有商店](/advanced/private-store)。你自己添加的来源不能是内网、本机回环或链路本地地址。

## 静态格式 {#static-format}

### 索引文件 {#index-files}

放在来源地址的根目录：

| 文件 | 内容 |
|---|---|
| `digital-humans.json`、`skills.json`、`mcps.json` | 拆分索引，优先读取。三个中任何一个缺失或无效时，Halo 改读 `index.json` |
| `index.json` | 同样的内容，放在一个文件里 |

每个索引文件是一个对象：

```json
{
  "version": 1,
  "generated_at": "2026-10-18T00:00:00Z",
  "source": "https://store.example.com",
  "apps": [
    {
      "slug": "example/weekly-report",
      "name": "每周报告",
      "version": "1.0.0",
      "author": "example",
      "description": "每周一汇总上周的订单",
      "type": "automation",
      "path": "packages/digital-humans/weekly-report",
      "category": "productivity",
      "tags": ["report"]
    }
  ]
}
```

没有条目的索引也必须是完整的对象，写成 `"apps": []`。

### 条目字段 {#entry-fields}

| 字段 | 必填 | 含义 |
|---|---|---|
| `slug` | 是 | 唯一标识：一段（`weekly-report`），或 `author/id`（`example/weekly-report`），只用小写字母、数字和 `-` |
| `name`、`version`、`author`、`description` | 是 | 与 spec 中的含义相同 |
| `type` | 是 | `automation`（数字人）、`skill`、`mcp` 或 `extension`，必须与 spec 一致 |
| `path` | 是 | 条目所在的文件夹，相对于来源地址 |
| `download_url` | 否 | 条目 `spec.yaml` 的完整地址，不在 `<path>/spec.yaml` 时使用 |
| `display_name`、`icon`、`category`、`tags`、`locale`、`min_app_version`、`i18n` | 否 | 显示在商店里。`category` 默认为 `other` |
| `requires_mcps`、`requires_skills` | 否 | 依赖的 id，用于展示 |
| `size_bytes`、`checksum`、`created_at`、`updated_at`、`meta` | 否 | 随条目保存。Halo 不会校验 `checksum` |
| `format` | 否 | 目前只定义了 `bundle`，不用写 |

### 条目的文件 {#entry-files}

在每个条目的 `path` 下：

- `spec.yaml`：完整的 spec。如果其中写了 `store.slug`，必须等于条目的 `slug`，`type` 也必须一致，否则安装失败。
- 技能的 `spec.yaml` 用文件名列出 `skill_files`，每个文件放在 `<path>/files/<name>`。
- 带随包技能的数字人，每个技能文件放在 `<path>/skills/<id>/<file>`（商店服务器也可以用 `<path>/files/skills/<id>/<file>`）。

Halo 用条件请求检查索引是否有变化，所以托管服务返回 `ETag` 时，刷新几乎没有开销。已安装的条目怎样获取新版本，见[私有商店](/advanced/private-store#upgrade-strategy)。

## DHP v2 商店服务器 {#dhp-v2}

DHP v2 来源提供同样的静态目录，并在同一地址下增加服务端接口：

| 接口 | 用途 |
|---|---|
| `GET /capabilities` | 握手：服务器提供下面哪些功能 |
| `POST /apps/{slug}/installs` | 统计安装次数 |
| `GET /collections` | 商店里展示的精选合集 |
| `GET /my/publications`、`POST /my/publications/{author}/{id}/unpublish` | 作者自己的上架条目，以及下架 |
| `GET /category-taxonomy.json`、`GET /discover-layout.json` | 由运营维护的分类和商店发现页 |

登录后发布、查看审核结果、**我的发布** 和下架，都依赖 DHP v2 服务器。企业版构建可以把它设为主来源。提交在各类商店中的去向，见[发布到商店](/developers/store-publishing#targets)。

## 相关页面 {#related}

- [数字人 spec 参考](/developers/digital-humans/spec)：`spec.yaml` 的全部字段
- [发布到商店](/developers/store-publishing)
- [私有商店](/advanced/private-store)：添加和管理公司自己的来源
