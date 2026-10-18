---
title: "Serverless 部署（Knative）：函数平台上的 Halo"
description: "在 Knative 体系的函数平台上部署 Halo Server：准备镜像、设置环境变量、挂载 NFS 持久卷、分配资源，并避开扩缩容的坑。"
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Serverless 部署（Knative）

把 Halo Server 部署到 Knative 体系的 Serverless 函数平台。镜像用 Halo 主仓库 `deploy/server/` 里的 `Dockerfile` 构建，做法见 [Docker 部署](/server/deployment-docker#build-image)。

## 镜像做了什么 {#how-it-works}

`deploy/server/Dockerfile` 在构建时完成三件事：

1. **重组应用包**：`npm run build:server` 生成的 linux-x64 应用被拆成小于 90 MB 的分片（`bundle/halo-bundle.tgz.part-*`，便于放进 git 仓库），构建时重新拼接并解压到 `/app/linux-unpacked`。
2. **安装系统库与字体**：用 apt 安装 Chromium 和 Electron 依赖的 GTK、X11、nss 等库，以及中文字体（文泉驿微米黑）。slim 基础镜像不带字体，缺了它文字会显示成空白。
3. **设置运行时默认值**：`HALO_SERVER_MODE=1`、`PORT=8080`、`HOME=/tmp`（没有设置 `HALO_DATA_DIR` 时数据写在 `/tmp/.halo`），由 tini 启动主进程。

基础镜像是公共镜像 `python:3.12-slim-bookworm`（Debian 12）。需要换成你环境里可达的等价镜像时，改 `Dockerfile` 的 `FROM`，并保证构建环境能拉取它。

## 部署步骤 {#steps}

### 1. 准备镜像 {#image}

任选一种：

- **推送镜像（推荐）**：按 [Docker 部署](/server/deployment-docker#build-image) 在本地构建镜像，推送到平台能访问的镜像仓库，再用这个镜像创建服务。
- **由平台从 git 构建**：把 `deploy/server/` 的文件连同生成的 `bundle/` 放进你自己的私有 git 仓库（`bundle/` 已按小于 90 MB 分片），把平台的代码源指向这个仓库。选择用 Dockerfile 构建，Dockerfile 路径为仓库根目录的 `./Dockerfile`。构建时需要联网安装系统库。

### 2. 设置环境变量 {#env}

在平台的环境变量配置中填入下列变量，含义见 [Halo Server 配置](/server/configuration)：

| 环境变量 | 建议值 |
|---|---|
| `HALO_DATA_DIR` | `/data`，指向下一步挂载的 NFS |
| `HALO_REMOTE_PASSWORD` | 8–64 位随机密码，例如 `openssl rand -hex 24` 的输出 |
| `HALO_AI_PROVIDER` | 你的模型协议族，如 `openai` |
| `HALO_AI_API_URL` | 你的模型网关地址 |
| `HALO_AI_API_KEY` | 网关密钥 |
| `HALO_AI_MODEL` | 模型名 |

镜像已设置 `HALO_SERVER_MODE=1` 和 `PORT=8080`。平台要求特定端口时，设置 `PORT` 并让平台路由到同一端口。

### 3. 把 NFS 持久卷挂到 HALO_DATA_DIR {#volume}

在平台的存储或卷挂载配置中，创建或选择一块 NFS 卷，挂载到容器内的 `/data`，并确保 `HALO_DATA_DIR=/data` 与之一致。

::: danger 不挂载就会丢数据
没有设置 `HALO_DATA_DIR` 时，数据写在 `/tmp/.halo`，实例回收后被清空。生产环境必须挂载 NFS 卷，并把 `HALO_DATA_DIR` 指向挂载点。
:::

### 4. 分配资源 {#resources}

Halo Server 运行完整的 Electron（Chromium）主进程，内存需求较大。

| 资源 | 建议 |
|---|---|
| 内存 | 至少 4–8 GB，过低会被系统终止（OOM） |
| CPU | 至少 2 核 |

请给单个实例分配充足的资源，而不是靠多个实例分摊，原因见下文。

### 5. 暴露端口 {#port}

把服务的对外端口设为容器的 `8080`，或你设置的 `PORT`。

## 路径前缀 {#path-prefix}

平台通常把服务挂在某个路径前缀下（如 `/fc-xxxx/`）。网页版会自动适配这个前缀；调用 API 时，把平台给出的带前缀地址当作基础地址，在后面拼接 `/api/...` 和 `/ws` 即可。

## 并发与扩缩容 {#scaling}

::: danger 有状态的单实例服务，不要横向扩容
Halo Server 的状态由 SQLite、本地文件和内存中的会话共同构成，三者都绑定在单个实例上。
:::

- **不要横向扩容**：多个实例各持一份独立状态，会造成数据不一致；多个实例同时写 NFS 上的同一份 SQLite 还会损坏数据库。把最大实例数限制为 1。
- **纵向扩容**：提高单个实例的 CPU 和内存来承载更高负载。
- **缩容到零后的冷启动是一次完整的重新初始化**：内存中的会话会丢失（持久化数据从 NFS 恢复），Electron 冷启动也需要可观的时间。对延迟敏感的场景，请关闭缩容到零，保持至少 1 个常驻实例。

## 验证 {#verify}

用平台给出的服务地址（含路径前缀）访问公开的状态接口：

```bash
curl https://<PLATFORM_HOST>/<PATH_PREFIX>/api/remote/status
```

输出：

```json
{"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

再校验访问密码：

```bash
curl -X POST https://<PLATFORM_HOST>/<PATH_PREFIX>/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<YOUR_ACCESS_PASSWORD>"}'
```

输出：

```json
{"success":true}
```

`<PLATFORM_HOST>` 和 `<PATH_PREFIX>` 换成平台给出的域名和路径前缀。构建失败时，先检查基础镜像是否可达，以及构建环境的磁盘空间是否够放下重组后的应用包。

## 下一步 {#next-steps}

- [Halo Server 集成指南](/server/integration)：把数字人接入你的业务系统
- [HTTP API 概览](/developers/api/)：基础地址、鉴权和错误约定
