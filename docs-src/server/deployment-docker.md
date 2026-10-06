---
title: "Docker 部署"
description: "用普通 Docker 部署 Halo Server：用 Halo 主仓库的 deploy/server 构建镜像，挂载持久化数据卷，配置访问令牌与企业自有大模型网关。"
---
# Docker 部署

本文介绍用普通 Docker（`docker run` / `docker compose`）部署 Halo Server。

---

## 1. 构建镜像

部署文件在 Halo 主仓库的 `deploy/server/` 目录。先生成 Linux 版应用包，再用该目录的 `Dockerfile` 构建镜像：

```bash
git clone https://github.com/openkursar/hello-halo.git
cd hello-halo
npm ci
npm run build:server              # 应用包写入 deploy/server/bundle/
docker build -t halo-server:latest deploy/server
```

构建镜像时需要联网：拉取基础镜像，并用 apt 安装 Chromium/Electron 依赖的系统库和字体（含中文字体）。

::: tip 基础镜像
`Dockerfile` 基于公共镜像 `python:3.12-slim-bookworm`（Debian 12）。若想换成自己环境里可达的等价基础镜像，改 `Dockerfile` 的 `FROM` 即可；注意更新的 Debian 版本里部分系统库改了包名，需要相应调整安装列表。
:::

---

## 2. 运行容器

挂载一块本地目录作为持久化数据卷，并通过环境变量注入令牌与大模型配置。

```bash
docker run -d \
  --name halo-server \
  -p 8080:8080 \
  -v /your/data:/data \
  -e HALO_SERVER_MODE=1 \
  -e HALO_DATA_DIR=/data \
  -e HALO_REMOTE_PASSWORD=请替换为强随机令牌 \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=https://ai-gateway.acme.intra/v1 \
  -e HALO_AI_API_KEY=sk-xxxxxxxxxxxxxxxx \
  -e HALO_AI_MODEL=gpt-4o \
  halo-server:latest
```

要点：

- `-p 8080:8080`：把容器的 `8080`（`PORT` 默认值）映射到宿主机。
- `-v /your/data:/data` + `-e HALO_DATA_DIR=/data`：把数据写到挂载卷，容器重建后数据不丢。设置了 `HALO_DATA_DIR` 时，全局技能、AI 引擎的对话记录和内置浏览器数据也会放进这个目录（`$HALO_DATA_DIR/home`）。
- `HALO_REMOTE_PASSWORD`：对外可达的部署务必改成强随机令牌（`openssl rand -hex 32`）。
- 大模型四件套指向**企业自有网关**，详见 [配置说明](./configuration.md)。

::: danger 持久化
如果不挂载 `-v` 卷并设置 `HALO_DATA_DIR`，数据会写进容器内默认的 `/tmp/.halo`，容器删除即丢失。
:::

::: tip 资源
Halo Server 运行完整的 Electron（Chromium）主进程，**内存需求较大**。建议为容器预留 **≥ 4–8 GB** 内存，否则可能 OOM。可用 `--memory` / `--cpus` 限制并确保宿主机有足够余量。
:::

---

## 3. docker compose

仓库里的 `deploy/server/docker-compose.yml` 可以直接使用：生成应用包后，修改其中的令牌和模型配置，在 `deploy/server` 目录执行 `docker compose up -d`。等价配置如下：

```yaml
services:
  halo-server:
    image: halo-server:latest
    # 或在 deploy/server 目录里直接构建：
    # build: .
    container_name: halo-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    environment:
      HALO_SERVER_MODE: "1"
      HALO_DATA_DIR: /data
      HALO_REMOTE_PASSWORD: 请替换为强随机令牌
      HALO_AI_PROVIDER: openai
      HALO_AI_API_URL: https://ai-gateway.acme.intra/v1
      HALO_AI_API_KEY: sk-xxxxxxxxxxxxxxxx
      HALO_AI_MODEL: gpt-4o
    # Electron/Chromium 内存需求较大
    mem_limit: 8g
```

启动：

```bash
docker compose up -d
```

---

## 4. 验证

存活探测（公开接口，无需令牌）：

```bash
curl http://localhost:8080/api/remote/status
# => {"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

校验令牌是否正确：

```bash
curl -X POST http://localhost:8080/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<HALO_REMOTE_PASSWORD>"}'
# => {"success":true}
```

查看日志（容器启动时会一次性打印仍缺失的共享库，便于排查基础镜像差异）：

```bash
docker logs -f halo-server
```

---

## 单实例约束

与 Serverless 部署相同，Halo Server 是**有状态的单实例**服务（SQLite + 文件 + 内存会话）。**不要**用同一份数据卷同时跑多个容器实例——多写入方会损坏 SQLite。需要更高吞吐时请**垂直扩容**（给单容器更多 CPU / 内存）。详见 [Serverless 部署](./deployment-faas.md#并发与扩缩容重要) 中的扩缩容说明。
