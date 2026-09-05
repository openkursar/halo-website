---
title: "Halo Server 配置"
description: "Halo Server 的环境变量配置参考：数据持久化、服务访问令牌、以及企业自有大模型网关的接入方式。"
---
# 配置

Halo Server 的全部配置都通过**系统环境变量**注入。容器启动时**优先读取环境变量**，未设置的项回退到默认值。

---

## 环境变量参考

| 环境变量 | 用途 | 默认值 |
|---|---|---|
| `HALO_SERVER_MODE` | 启用无头服务端模式 | 必须设为 `1` |
| `PORT` | HTTP 监听端口 | `8080` |
| `HALO_DATA_DIR` | 数据目录。**生产环境在此挂载持久化存储（NFS）** | `/tmp/.halo`（临时，会被清空！） |
| `HALO_REMOTE_PASSWORD` | 服务访问令牌 / API Key（作为 `Authorization: Bearer` 使用） | `halo123` |
| `HALO_AI_PROVIDER` | 大模型供应商（`anthropic` / `openai` / `custom`） | 由部署方设置 |
| `HALO_AI_API_URL` | 大模型端点——**企业自有的内部模型网关** | 由部署方设置 |
| `HALO_AI_API_KEY` | 大模型 API Key | 由部署方设置 |
| `HALO_AI_MODEL` | 模型名称 | 由部署方设置 |

---

## 数据持久化（HALO_DATA_DIR）

Halo Server 的所有状态——SQLite 数据库、空间数据、文件——都写在 `HALO_DATA_DIR`。

默认值 `/tmp/.halo` 是**临时目录**：实例回收、重启或 scale-to-zero 之后，数据会被清空。

::: danger 生产环境必读
生产环境**必须**把 `HALO_DATA_DIR` 指向一块**挂载的持久卷**（通常是 NFS）。否则每次实例回收都会丢失全部数据。
:::

```bash
# 生产环境：把数据目录指向挂载点
HALO_DATA_DIR=/data
```

然后在平台 / Docker 层把持久卷挂载到 `/data`。具体挂载方式见对应部署文档：
[Serverless 部署](./deployment-faas.md) · [Docker 部署](./deployment-docker.md)。

::: warning SQLite on NFS
SQLite 在 NFS 上运行时，**单写入方（single-writer）**场景通常可正常工作——而 Halo Server 正是单实例单写入。但 NFS 的文件锁实现各家不同，上线前请在你的存储环境中实测验证（写入、并发读、重启恢复）。这也是**不能横向扩容**的另一层原因：多个实例同时写同一份 SQLite 会损坏数据。
:::

---

## 服务访问令牌（HALO_REMOTE_PASSWORD）

`HALO_REMOTE_PASSWORD` 是调用方访问 Halo Server API 的凭据，以标准 Bearer 形式携带：

```http
Authorization: Bearer <HALO_REMOTE_PASSWORD>
```

::: danger 务必修改默认值
默认值 `halo123` 仅用于本地试跑。**任何对外可达的部署都必须改成强随机令牌。**
:::

```bash
# 生成一个强随机令牌
openssl rand -hex 32
```

---

## 大模型配置（企业自有网关）

Halo **不内置任何模型**。每个企业接入**自己的 LLM 端点和密钥**——可以是自托管的推理服务，也可以是企业内部的模型网关。

四个变量配套使用：

```bash
HALO_AI_PROVIDER=openai                      # anthropic / openai / custom
HALO_AI_API_URL=https://ai-gateway.acme.intra/v1
HALO_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
HALO_AI_MODEL=gpt-4o
```

- `HALO_AI_PROVIDER` 决定使用的协议族（Anthropic / OpenAI 兼容 / 自定义）。
- `HALO_AI_API_URL` 指向**企业自己的**模型网关，流量不出企业内网。
- `HALO_AI_API_KEY` 是访问该网关的密钥。
- `HALO_AI_MODEL` 是要调用的模型名。

---

## 示例 `.env`

```bash
# ── 运行模式 ───────────────────────────────
HALO_SERVER_MODE=1            # 必须为 1，启用无头服务端模式
PORT=8080                     # HTTP 监听端口

# ── 数据持久化 ─────────────────────────────
# 生产环境必须指向挂载的持久卷，否则实例回收即丢数据
HALO_DATA_DIR=/data

# ── 服务访问令牌 ───────────────────────────
# 对外部署务必改成强随机值：openssl rand -hex 32
HALO_REMOTE_PASSWORD=请替换为强随机令牌

# ── 大模型（企业自有网关）─────────────────
HALO_AI_PROVIDER=openai
HALO_AI_API_URL=https://ai-gateway.acme.intra/v1
HALO_AI_API_KEY=sk-xxxxxxxxxxxxxxxx
HALO_AI_MODEL=gpt-4o
```

配置就绪后，前往 [Serverless 部署](./deployment-faas.md) 或 [Docker 部署](./deployment-docker.md)。
