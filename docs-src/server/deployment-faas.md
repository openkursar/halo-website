---
title: "Serverless 部署（Knative）"
description: "在 Serverless 函数平台（Knative 体系）上部署 Halo Server：仓库构建、环境变量、NFS 持久卷、资源规格与扩缩容注意事项。"
---
# Serverless 部署（Knative）

本文介绍如何把 Halo Server 部署到 Serverless 函数平台（Knative 体系）。镜像用 Halo 主仓库 `deploy/server/` 里的 `Dockerfile` 构建（见[容器部署](./deployment-docker.md)）。

---

## 工作原理

`deploy/server/Dockerfile` 在构建时完成以下工作：

1. **重组应用包**——`npm run build:server` 生成的 linux-x64 Electron 应用被拆成 `<90MB` 的分片（`bundle/halo-bundle.tgz.part-*`，便于放进 git 仓库），构建时重新拼接并解压到 `/app/linux-unpacked`。
2. **安装系统库与字体**——用 apt 安装 Chromium/Electron 依赖的 GTK/X11/nss 等库，以及中文字体（文泉驿微米黑）；slim 基础镜像不带字体，否则文字会渲染为空白。
3. **设置运行时默认值**——`HALO_SERVER_MODE=1`、`PORT=8080`、`HOME=/tmp`（未设置 `HALO_DATA_DIR` 时数据写在 `/tmp/.halo`），由 tini 启动主进程。

> 基础镜像为公共镜像 `python:3.12-slim-bookworm`（Debian 12）。如需换成自己环境里可达的等价基础镜像，改 `Dockerfile` 的 `FROM` 即可，并保证构建环境可拉取该镜像。

---

## 部署步骤

### 1. 准备镜像

两种方式任选其一：

- **推送镜像（推荐）**：按[容器部署](./deployment-docker.md)在本地构建好镜像，推送到平台能访问的镜像仓库，在平台上用这个镜像创建服务。
- **由平台从 git 构建**：把 `deploy/server/` 目录的文件连同生成的 `bundle/` 放进你自己的私有 git 仓库（`bundle/` 已按 `<90MB` 分片），把平台的代码源指向这个仓库。

### 2. 启用 Dockerfile 构建（仅 git 构建方式）

选择「Dockerfile 构建」方式，Dockerfile 路径为仓库根目录的 `./Dockerfile`。构建时需要联网安装系统库。

### 3. 设置运行时环境变量

在平台的「环境变量」配置界面填入下列变量（参见 [配置说明](./configuration.md)）：

| 环境变量 | 建议值 |
|---|---|
| `HALO_SERVER_MODE` | `1` |
| `HALO_DATA_DIR` | `/data`（指向下一步挂载的 NFS） |
| `HALO_REMOTE_PASSWORD` | 强随机令牌（`openssl rand -hex 32`） |
| `HALO_AI_PROVIDER` | 你的供应商，如 `openai` |
| `HALO_AI_API_URL` | 企业自有模型网关地址 |
| `HALO_AI_API_KEY` | 网关密钥 |
| `HALO_AI_MODEL` | 模型名 |

> `PORT` 一般用默认 `8080` 即可；若平台要求特定端口，设置 `PORT` 并让平台路由到同一端口。

### 4. 绑定 NFS 持久卷到 HALO_DATA_DIR

在平台的「存储 / 卷挂载」配置中，创建或选择一块 NFS 卷，挂载到容器内 `/data`，并确保 `HALO_DATA_DIR=/data` 与之一致。

::: danger 不挂载就会丢数据
默认 `HALO_DATA_DIR=/tmp/.halo` 在实例回收后被清空。生产环境必须挂载 NFS 卷并将 `HALO_DATA_DIR` 指向挂载点。
:::

### 5. 设置资源规格

Halo Server 运行的是完整的 Electron（Chromium）主进程，**内存需求较大**。

| 资源 | 建议 |
|---|---|
| 内存 | **≥ 4–8 GB**（Electron/Chromium 真实需求，过低会 OOM） |
| CPU | ≥ 2 核 |

请按**垂直**方向给单实例分配充足资源，而不是靠多实例分摊（见下文扩缩容说明）。

### 6. 暴露端口 8080

把服务对外端口设为容器的 `8080`（或你设置的 `PORT`）。

---

## 路径前缀自动适配

平台通常把服务挂在某个**路径前缀**下（如 `/fc-xxxx/`）。Halo Server 会**自动识别并适配反向代理前缀**，无需在应用层做任何配置——直接通过平台给出的带前缀 URL 访问 API 即可。

---

## 并发与扩缩容（重要）

::: danger 这是有状态单实例服务，不要横向扩容
Halo Server 的状态由 **SQLite + 本地文件 + 内存会话**共同构成，三者都绑定在单个实例上。
:::

- **不要横向扩容**：多个 Pod 各持一份独立状态，会造成状态分裂、数据不一致；多个实例同时写同一份 NFS 上的 SQLite 还会损坏数据库。把最大实例数限制为 **1**。
- **垂直扩容**：通过提高单实例的 CPU / 内存来承载更高负载，而不是增加副本数。
- **Scale-to-zero 冷启动 = 重新初始化**：缩容到零后再被唤醒时，进程是全新启动的一次**重新初始化**——内存会话丢失（持久化数据从 NFS 恢复），且 Electron 冷启动有可观的初始化耗时。对延迟敏感的场景建议**关闭 scale-to-zero**，保持至少 1 个常驻实例。

---

## 验证

部署完成后，访问平台给出的服务 URL（含路径前缀）的公开状态接口即可验证服务存活：

```bash
curl https://<平台域名>/fc-xxxx/api/remote/status
# => {"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

再校验令牌是否生效：

```bash
curl -X POST https://<平台域名>/fc-xxxx/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<HALO_REMOTE_PASSWORD>"}'
# => {"success":true}
```

构建若失败，优先检查基础镜像是否可达、以及构建环境的磁盘是否足够容纳重组后的应用包。
