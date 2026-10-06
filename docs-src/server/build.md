---
title: "自建镜像与工作原理"
description: "从 Halo 源码自己构建 Halo Server 的部署 bundle（用于改品牌、换 Provider 或跟最新源码），以及无头服务端的工作原理。"
---
# 自建镜像与工作原理

Halo 目前不提供现成的服务端镜像，部署前需要从源码生成一次应用包（一条命令）。之后要**改品牌、更换内置 Provider、或跟随最新的 Halo 源码**时，重新生成即可。

---

## 前置

只需要 Halo 主仓库：部署文件在仓库的 `deploy/server/` 目录（`Dockerfile`、入口脚本、`docker-compose.yml`），生成的应用包也写到这里。

- Node 环境（与 `hello-halo` 的 `package.json` 要求一致），先执行 `npm ci` 安装依赖。
- 国内网络建议设置 Electron 下载镜像：`ELECTRON_MIRROR`、`ELECTRON_BUILDER_BINARIES_MIRROR`。

---

## 一条命令生成 bundle

在 `hello-halo` 目录执行：

```bash
npm run build:server
```

它会按顺序完成：

1. **切入服务端配置**——临时启用 `server.product.json`（品牌中立、仅保留 API-key 接入方式，因为 OAuth 在无头环境无法完成）。**无论成功、失败还是中断，退出时都会还原 `product.json`**，工作区不留改动。
2. **准备 linux 原生依赖**并构建应用（`electron-vite`）。
3. **交叉构建 linux-x64 无头应用**（`electron-builder --linux dir --x64`）。
4. **压缩并分片**——把构建产物打成 `tar.gz`，按 `<90MB` 切片写入 `deploy/server/bundle/`（便于放进 git 仓库），最后做一次拼接完整性校验。

> 默认输出到 `deploy/server/`。如需输出到其它目录（例如你自己的部署仓库）：`bash scripts/build-server-halo.sh /path/to/dir`，该目录里需要有 `Dockerfile`（可从 `deploy/server/` 复制）。

---

## 拼装成镜像并运行

应用包生成后，构建并运行镜像（与[快速开始](./)一致）：

```bash
docker build -t halo-server deploy/server
docker run -d -p 8080:8080 -e HALO_REMOTE_PASSWORD=改成你自己的令牌 halo-server
```

`deploy/server/bundle/` 不进入 Halo 主仓库。如果你维护自己的部署仓库（例如让函数平台从 git 构建），把 `deploy/server/` 的文件连同 `bundle/` 一起提交到那个仓库即可。

---

## 定制

构建用的 `server.product.json` **默认品牌中立**。要改品牌名、数据目录、内置 Provider 等，编辑该文件即可（字段含义见 `product.schema.json`）。更完整的企业定制（品牌、SSO、安全策略等）见 Halo 主仓库的企业部署指南。

---

## 工作原理

Halo Server 与桌面版是同一套应用，运行形态不同：

```
┌─────────────────────────────────────────────┐
│  Linux 容器 (Knative Pod / Docker)            │
│                                               │
│   Halo Electron 主进程（无头）                 │
│   HALO_SERVER_MODE=1                          │
│        │                                      │
│        ├── HTTP API          ──┐              │
│        ├── WebSocket (实时流)   ├─►  :8080     │
│        │                       │   (PORT)     │
│        └── 数据 / SQLite ──► HALO_DATA_DIR     │
│                                  (挂载持久卷)  │
└───────────────────┬───────────────────────────┘
                    │  平台路由 (常带路径前缀 /fc-xxxx/)
                    ▼
            企业内网 / API 调用方
```

**无头启动**：进入服务端模式（`HALO_SERVER_MODE=1`）后，主进程以下列参数无头启动，不打开任何窗口：

```
--ozone-platform=headless --no-sandbox --disable-gpu --disable-dev-shm-usage
```

**路径前缀自动适配**：平台通常把服务挂在某个路径前缀下（如 `/fc-xxxx/`）。Halo Server 会**自动识别并适配反向代理前缀**，应用层无需任何配置——直接用平台给出的带前缀 URL 访问 API 即可。

**单实例模型**：它是**有状态的单实例**服务，状态由 SQLite + 本地文件 + 内存会话共同构成。请**垂直扩容**（给单实例更多 CPU / 内存），**不要横向扩容**——多个实例各持一份独立状态会造成数据分裂，多写方同时写一份 SQLite 还会损坏数据库。扩缩容细节见[函数平台部署](./deployment-faas.md#并发与扩缩容重要)。
