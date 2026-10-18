---
title: "Docker 部署：在容器中运行 Halo Server"
description: "用 Docker 部署 Halo Server：从 Halo 主仓库的 deploy/server 构建镜像，挂载持久化数据卷，设置访问密码和自有的大模型网关。"
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Docker 部署

用普通 Docker（`docker run` 或 `docker compose`）部署 Halo Server。

## 开始之前 {#before-you-start}

- 一台能运行 Docker 的 Linux 服务器，内存至少 4–8 GB。
- 构建应用包需要 Node.js 环境，版本与 Halo 主仓库 `package.json` 的要求一致。
- 构建镜像时需要联网，用于拉取基础镜像和安装系统库。

## 1. 构建镜像 {#build-image}

部署文件在 Halo 主仓库的 `deploy/server/` 目录。先生成 Linux 版应用包，再用该目录的 `Dockerfile` 构建镜像：

```bash
git clone https://github.com/openkursar/hello-halo.git
cd hello-halo
npm ci
npm run build:server
docker build -t halo-server:latest deploy/server
```

`npm run build:server` 把应用包写入 `deploy/server/bundle/`，细节见 [自建镜像与工作原理](/server/build)。构建镜像时会用 apt 安装 Chromium 和 Electron 依赖的系统库与字体（含中文字体）。

::: tip 基础镜像
`Dockerfile` 基于公共镜像 `python:3.12-slim-bookworm`（Debian 12）。想换成你环境里可达的等价镜像，改 `Dockerfile` 的 `FROM` 即可。更新的 Debian 版本里部分系统库改了包名，需要相应调整安装列表。
:::

## 2. 运行容器 {#run}

挂载一个本地目录作为持久化数据卷，并通过环境变量设置访问密码和大模型：

```bash
docker run -d \
  --name halo-server \
  -p 8080:8080 \
  -v /srv/halo-data:/data \
  -e HALO_DATA_DIR=/data \
  -e HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD> \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=https://ai-gateway.example.com/v1 \
  -e HALO_AI_API_KEY=<YOUR_API_KEY> \
  -e HALO_AI_MODEL=<MODEL_NAME> \
  halo-server:latest
```

- `<YOUR_ACCESS_PASSWORD>`：8–64 位的随机密码，例如 `openssl rand -hex 24` 的输出。登录页不接受少于 8 位的密码。
- `<YOUR_API_KEY>`、`<MODEL_NAME>`：你的模型网关的密钥和模型名。
- `-p 8080:8080`：把容器的 `8080`（`PORT` 的默认值）映射到宿主机。
- `-v /srv/halo-data:/data` 与 `-e HALO_DATA_DIR=/data`：数据写到挂载卷，容器重建后不会丢失。全局技能、AI 引擎的会话记录和内置浏览器数据也会放进 `/data/home`。
- 镜像已设置 `HALO_SERVER_MODE=1`，不需要再传。

全部变量的含义见 [Halo Server 配置](/server/configuration)。

::: danger 不挂载数据卷就会丢数据
不挂载卷、不设置 `HALO_DATA_DIR` 时，数据写在容器里的 `/tmp/.halo`，删除容器即全部丢失。
:::

::: warning 内存
Halo Server 运行完整的 Electron（Chromium）主进程，内存需求较大。为容器预留至少 4–8 GB 内存，否则可能被系统终止（OOM）。可以用 `--memory` 和 `--cpus` 限制资源，同时确保宿主机有足够余量。
:::

## 3. 用 docker compose 运行 {#compose}

仓库里的 `deploy/server/docker-compose.yml` 可以直接使用：生成应用包后，改好其中的密码和模型配置，在 `deploy/server` 目录执行 `docker compose up -d`。等价配置如下：

```yaml
services:
  halo-server:
    image: halo-server:latest
    container_name: halo-server
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./data:/data
    environment:
      HALO_DATA_DIR: /data
      HALO_REMOTE_PASSWORD: <YOUR_ACCESS_PASSWORD>
      HALO_AI_PROVIDER: openai
      HALO_AI_API_URL: https://ai-gateway.example.com/v1
      HALO_AI_API_KEY: <YOUR_API_KEY>
      HALO_AI_MODEL: <MODEL_NAME>
    mem_limit: 8g
```

```bash
docker compose up -d
```

## 4. 验证 {#verify}

服务在线检查（公开接口，无需密码）：

```bash
curl http://127.0.0.1:8080/api/remote/status
```

输出：

```json
{"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}
```

校验访问密码：

```bash
curl -X POST http://127.0.0.1:8080/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<YOUR_ACCESS_PASSWORD>"}'
```

输出：

```json
{"success":true}
```

::: done
浏览器打开 `http://<HOST>:8080`，用访问密码登录，看到和桌面版一样的 Halo 界面，就说明部署成功了。
:::

查看日志。容器启动时会打印缺失的共享库，便于排查基础镜像差异：

```bash
docker logs -f halo-server
```

## 只能运行一个实例 {#single-instance}

Halo Server 是有状态的单实例服务，状态由 SQLite、本地文件和内存中的会话共同构成。不要让多个容器共用同一份数据卷：多个写入方会损坏 SQLite。需要更高吞吐时，给单个容器更多 CPU 和内存。扩缩容的细节见 [Serverless 部署](/server/deployment-faas#scaling)。

## 下一步 {#next-steps}

- [Halo Server 集成指南](/server/integration)：把数字人接入你的业务系统
- [HTTP API 概览](/developers/api/)：用访问密码调用 API
