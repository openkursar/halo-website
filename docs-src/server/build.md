---
title: "自建镜像与工作原理：从源码构建 Halo Server"
description: "自建 Halo Server 镜像：从源码生成部署用的应用包（改品牌、换内置提供商或跟随最新源码时使用），以及无头服务端的工作原理。"
type: how-to
audience: [developer, admin]
platforms: [server]
---

# 自建镜像与工作原理

Halo 不提供现成的服务端镜像，部署前需要从源码生成一次应用包，一条命令即可。之后要改品牌、更换内置提供商或跟随最新的 Halo 源码时，重新生成即可。

## 开始之前 {#before-you-start}

只需要 Halo 主仓库：部署文件在仓库的 `deploy/server/` 目录（`Dockerfile`、入口脚本、`docker-compose.yml`），生成的应用包也写到这里。

- Node.js 环境，版本与 Halo 主仓库 `package.json` 的要求一致。先执行 `npm ci` 安装依赖。
- 网络访问受限时，设置 Electron 下载镜像：`ELECTRON_MIRROR`、`ELECTRON_BUILDER_BINARIES_MIRROR`。

## 一条命令生成应用包 {#build-bundle}

在 Halo 主仓库目录执行：

```bash
npm run build:server
```

它依次完成：

1. **切换到服务端配置**：临时启用 `server.product.json`（品牌中立，只保留 API Key 接入方式，因为 OAuth 在无头环境中无法完成）。无论成功、失败还是中断，退出时都会还原 `product.json`，工作区不留改动。
2. **准备 Linux 原生依赖**并构建应用（`electron-vite`）。
3. **交叉构建 linux-x64 无头应用**（`electron-builder --linux dir --x64`）。
4. **压缩并分片**：把构建产物打成 `tar.gz`，按小于 90 MB 切片写入 `deploy/server/bundle/`（便于放进 git 仓库），最后校验拼接后的大小。

默认输出到 `deploy/server/`。要输出到其他目录（例如你自己的部署仓库），执行 `bash scripts/build-server-halo.sh /path/to/dir`，该目录里需要有 `Dockerfile`（可以从 `deploy/server/` 复制）。

## 构建镜像并运行 {#image}

应用包生成后，构建并运行镜像，与 [Halo Server 快速开始](/server/) 一致：

```bash
docker build -t halo-server deploy/server
docker run -d -p 8080:8080 -e HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD> halo-server
```

`<YOUR_ACCESS_PASSWORD>` 换成 8–64 位的随机密码。

`deploy/server/bundle/` 不会提交到 Halo 主仓库。如果你维护自己的部署仓库（例如让函数平台从 git 构建），把 `deploy/server/` 的文件连同 `bundle/` 一起提交到那个仓库。

## 定制 {#customize}

构建用的 `server.product.json` 默认品牌中立。要修改品牌名、数据目录、内置提供商等，编辑这个文件即可，字段含义见 `product.schema.json`。更完整的企业定制（品牌、单点登录、安全策略等）见 Halo 主仓库的企业部署指南（`docs/enterprise-deployment.zh.md`）。

## 工作原理 {#how-it-works}

Halo Server 和桌面版是同一套应用，只是运行形态不同：

```text
┌──────────────────────────────────────────────┐
│  Linux 容器（Knative Pod 或 Docker）          │
│                                              │
│   Halo 主进程（无头），HALO_SERVER_MODE=1      │
│        │                                     │
│        ├── HTTP API         ──┐              │
│        ├── WebSocket（实时）  ├──►  :8080     │
│        │                      │   (PORT)     │
│        └── 数据与 SQLite ──► HALO_DATA_DIR    │
│                              （挂载的持久卷）  │
└───────────────────┬──────────────────────────┘
                    │  平台路由（常带路径前缀）
                    ▼
             内网或 API 调用方
```

**无头启动**：在服务端模式（`HALO_SERVER_MODE=1`）下，主进程带着下列参数无头启动，不打开任何窗口：

```text
--ozone-platform=headless --no-sandbox --disable-gpu --disable-dev-shm-usage
```

**路径前缀**：平台通常把服务挂在某个路径前缀下（如 `/fc-xxxx/`）。网页版会自动适配这个前缀；调用 API 时，把平台给出的带前缀地址当作基础地址即可。

**单实例模型**：Halo Server 是有状态的单实例服务，状态由 SQLite、本地文件和内存中的会话共同构成。请纵向扩容（给单个实例更多 CPU 和内存），不要横向扩容：多个实例各持一份状态会造成数据分裂，多个写入方同时写一份 SQLite 还会损坏数据库。扩缩容细节见 [Serverless 部署](/server/deployment-faas#scaling)。

## 下一步 {#next-steps}

- [Docker 部署](/server/deployment-docker)：用构建好的镜像运行容器
- [Halo Server 配置](/server/configuration)：全部环境变量
