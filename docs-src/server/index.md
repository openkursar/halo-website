---
title: "Halo Server 快速开始：把 Halo 作为服务运行"
description: "Halo Server 快速开始：几条命令把 Halo 作为服务运行在 Linux 上，用浏览器打开和桌面版一样的界面，并让后台系统调用它的 API。"
type: how-to
audience: [developer, admin]
platforms: [server]
---

# Halo Server 快速开始

Halo Server 是 Halo 的无头服务端形态，和桌面版是同一套应用：它在 Linux 容器里以无头模式运行 Halo 主进程（`HALO_SERVER_MODE=1`），不打开窗口，改为提供 HTTP API 和 WebSocket。桌面版的能力它都有。

部署后用浏览器打开地址，看到的就是和桌面版一样的 Halo 界面；你的后台系统也可以通过 API 调用它。

## 开始之前 {#before-you-start}

你需要一台能运行 Docker、内存至少 4–8 GB 的 Linux 服务器，装好 Node.js（Halo 不提供现成的服务端镜像，要从源码生成应用包），再准备好你自己的模型端点和密钥。完整要求见 [Docker 部署](/server/deployment-docker#before-you-start)。

## 1. 构建并运行 {#run}

下面是最短的命令，与 [Docker 部署](/server/deployment-docker) 的第 1、2 步相同，数据写在挂载的 `/srv/halo-data` 中：

```bash
git clone https://github.com/openkursar/hello-halo.git
cd hello-halo
npm ci
npm run build:server
docker build -t halo-server deploy/server

docker run -d --name halo-server \
  -p 8080:8080 \
  -v /srv/halo-data:/data \
  -e HALO_DATA_DIR=/data \
  -e HALO_REMOTE_PASSWORD=<YOUR_ACCESS_PASSWORD> \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=https://ai-gateway.example.com/v1 \
  -e HALO_AI_API_KEY=<YOUR_API_KEY> \
  -e HALO_AI_MODEL=<MODEL_NAME> \
  halo-server
```

- `<YOUR_ACCESS_PASSWORD>`：8–64 位的随机密码，例如 `openssl rand -hex 24` 的输出。登录页不接受少于 8 位的密码，所以不要依赖默认值。
- `<YOUR_API_KEY>`、`<MODEL_NAME>`：你的模型网关的密钥和模型名。

每个参数的含义、`docker compose` 写法和基础镜像见 [Docker 部署](/server/deployment-docker)。

## 2. 打开管理界面 {#open}

用浏览器打开 `http://<HOST>:8080`，输入访问密码登录。你看到的是和桌面版一样的 Halo 界面：工作区、任务、数字人和工具调用都在。

## 3. 验证服务 {#verify}

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
浏览器里登录成功、看到 Halo 界面，就说明 Halo Server 已经在运行。后台程序不需要登录页，每个请求都带上 `Authorization: Bearer <YOUR_ACCESS_PASSWORD>` 即可调用 API，见 [HTTP API 概览](/developers/api/)。
:::

Halo Server 是有状态的单实例服务（SQLite、文件和内存中的会话）。需要更多算力时给单个实例更多 CPU 和内存，不要横向扩容：多个实例各持一份状态会造成数据分裂。细节见 [Serverless 部署](/server/deployment-faas#scaling)。

## 下一步 {#next-steps}

- [Halo Server 配置](/server/configuration)：接入自有模型网关、设置访问密码、持久化数据
- [Docker 部署](/server/deployment-docker)：`docker compose`、数据卷和资源规格
- [Halo Server 集成指南](/server/integration)：把数字人作为你的业务系统的 AI 后端
