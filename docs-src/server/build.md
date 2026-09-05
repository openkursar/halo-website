---
title: "自建镜像与工作原理"
description: "从 Halo 源码自己构建 Halo Server 的部署 bundle（用于改品牌、换 Provider 或跟最新源码），以及无头服务端的工作原理。"
---
# 自建镜像与工作原理

这是一个**低频的进阶入口**。绝大多数情况下你**不需要**自建——直接用现成的 `halo-server` 仓库 `docker build` 即可（见[快速开始](./)）。

只有当你要**改品牌、更换内置 Provider、或跟随最新的 Halo 源码**时，才需要从源码重新生成部署 bundle。

---

## 前置

把两个仓库 checkout 到**同级目录**：

```
工作目录/
├── hello-halo/     # Halo 主仓库（源码 + 构建脚本）
└── halo-server/    # 部署仓库（bundle 产物落到这里）
```

- Node 环境（与 `hello-halo` 的 `package.json` 要求一致）。
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
4. **压缩并分片**——把构建产物打成 `tar.gz`，按 `<90MB` 切片写入 `../halo-server/bundle/`（规避 git 托管的单文件大小限制，并保证容器内可离线重组），最后做一次拼接完整性校验。

> 默认输出到同级的 `../halo-server`。如需指定其它目录：`bash scripts/build-server-halo.sh /path/to/halo-server`。

---

## 拼装成镜像并运行

bundle 更新后，进入 `halo-server` 仓库照常构建运行（与[快速开始](./)一致）：

```bash
cd ../halo-server
docker build -t halo-server .
docker run -d -p 8080:8080 -e HALO_REMOTE_PASSWORD=改成你自己的令牌 halo-server
```

若要把新 bundle 提交回部署仓库：

```bash
cd ../halo-server
git add bundle && git commit -m "update bundle" && git push
```

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
