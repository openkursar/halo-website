---
title: "Halo Server 配置：环境变量参考"
description: "Halo Server 配置参考：用环境变量设置服务模式、端口、数据目录、访问密码，以及企业自有的大模型网关。"
type: reference
audience: [developer, admin]
---

# Halo Server 配置

Halo Server 的配置全部通过环境变量注入。设置了的环境变量优先；没设置的项，沿用已保存的配置或内置默认值。

## 环境变量参考 {#environment-variables}

| 环境变量 | 用途 | 默认值 |
|---|---|---|
| `HALO_SERVER_MODE` | 设为 `1` 或 `true` 时以无头服务端模式启动 | 未设置时是桌面模式；镜像里已设为 `1` |
| `PORT` | HTTP 监听端口 | `8080` |
| `HALO_SERVER_PORT` | 没有 `PORT` 时使用的监听端口 | — |
| `HALO_DATA_DIR` | 数据目录。生产环境在这里挂载持久卷 | `/tmp/.halo`（临时目录，会被清空） |
| `HALO_REMOTE_PASSWORD` | 访问密码，调用 API 时作为 `Authorization: Bearer` 使用 | 仅当从未保存过密码时为 `halo123`，必须修改 |
| `HALO_AI_PROVIDER` | 模型协议族：`anthropic`、`openai` 或 `custom` 等 | `anthropic` |
| `HALO_AI_API_URL` | 模型端点，即你自己的模型网关地址 | `https://api.anthropic.com` |
| `HALO_AI_API_KEY` | 模型网关的密钥 | — |
| `HALO_AI_MODEL` | 模型名称 | 内置的一个 Claude 模型 |

四个 `HALO_AI_*` 变量只有在设置了 `HALO_AI_API_KEY` 或 `HALO_AI_API_URL` 时才会生效，生效后会替换 Halo 中已有的模型来源。两者都没设置时，沿用在界面里配置的模型来源。

## 数据持久化 {#data-dir}

Halo Server 的全部状态（SQLite 数据库、工作区数据和文件）都写在 `HALO_DATA_DIR` 下。用 `deploy/server` 构建的镜像在设置了 `HALO_DATA_DIR` 时，还会把全局技能、AI 引擎的会话记录和内置浏览器的数据放在 `$HALO_DATA_DIR/home`，一起持久化。

默认的 `/tmp/.halo` 是临时目录：实例回收、重启或缩容到零之后，数据会被清空。

::: danger 生产环境必须挂载持久卷
把 `HALO_DATA_DIR` 指向一块挂载的持久卷（通常是 NFS）。否则每次实例回收都会丢失全部数据。
:::

```bash
HALO_DATA_DIR=/data
```

然后在平台或 Docker 层把持久卷挂载到 `/data`，做法见 [Docker 部署](/server/deployment-docker) 和 [Serverless 部署](/server/deployment-faas)。

::: warning NFS 上的 SQLite
SQLite 在 NFS 上运行时，单写入方的场景通常可以正常工作，而 Halo Server 正是单实例单写入。但各家 NFS 的文件锁实现不同，上线前请在你的存储环境中实测写入、并发读取和重启恢复。这也是不能横向扩容的另一个原因：多个实例同时写同一份 SQLite 会损坏数据。
:::

## 访问密码 {#access-password}

`HALO_REMOTE_PASSWORD` 是调用 Halo Server API 的凭据，以 Bearer 令牌的形式携带：

```http
Authorization: Bearer <YOUR_ACCESS_PASSWORD>
```

`<YOUR_ACCESS_PASSWORD>` 换成你设置的密码。

::: danger 访问密码就是管理员密码
访问密码可以完全控制这台 Halo Server，包括文件、终端和 AI。设置一个 8–64 位的随机密码：登录页不接受少于 8 位的密码，所以默认值 `halo123` 连网页都登录不了。不要依赖默认值，也不要把密码写进网页、代码仓库或日志。
:::

生成一个 48 位的随机密码：

```bash
openssl rand -hex 24
```

`HALO_REMOTE_PASSWORD` 每次启动都会生效。没有设置它时，沿用上次保存的密码；从未保存过时才使用 `halo123`。

## 大模型配置 {#llm-gateway}

Halo 不内置模型。每个部署接入自己的模型端点和密钥，可以是自托管的推理服务，也可以是企业内部的模型网关。

```bash
HALO_AI_PROVIDER=openai
HALO_AI_API_URL=https://ai-gateway.example.com/v1
HALO_AI_API_KEY=<YOUR_API_KEY>
HALO_AI_MODEL=<MODEL_NAME>
```

- `HALO_AI_PROVIDER` 决定协议族（Anthropic、OpenAI 兼容或自定义）。
- `HALO_AI_API_URL` 指向你自己的模型网关，流量不必离开企业网络。
- `HALO_AI_API_KEY` 是访问该网关的密钥，`<YOUR_API_KEY>` 换成真实密钥。
- `HALO_AI_MODEL` 是要调用的模型名，`<MODEL_NAME>` 换成网关提供的模型名。

## 示例 .env {#example-env}

```bash
# 运行模式
HALO_SERVER_MODE=1
PORT=8080

# 数据持久化：生产环境必须指向挂载的持久卷
HALO_DATA_DIR=/data

# 访问密码：8–64 位随机值，例如 openssl rand -hex 24 的输出
HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD>

# 大模型（企业自有网关）
HALO_AI_PROVIDER=openai
HALO_AI_API_URL=https://ai-gateway.example.com/v1
HALO_AI_API_KEY=<YOUR_API_KEY>
HALO_AI_MODEL=<MODEL_NAME>
```

## 相关页面 {#related}

- [Docker 部署](/server/deployment-docker)：用这些变量运行容器
- [Serverless 部署](/server/deployment-faas)：在函数平台上设置这些变量
- [HTTP API 概览](/developers/api/)：用访问密码调用 API
