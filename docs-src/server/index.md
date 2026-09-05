---
title: "Halo Server 快速开始"
description: "几条命令把 Halo 跑成一个服务，然后用浏览器打开，得到和桌面版一模一样的 Halo 管理界面。"
---
# Halo Server

Halo Server 是 Halo 的无头（headless）服务端版本，与桌面版 Halo 是**同一套应用**，只是运行形态不同：桌面版在 macOS / Windows 上开窗口供人交互；Server 版在 Linux 容器里以无头模式运行真正的 Halo Electron 主进程（`HALO_SERVER_MODE=1`），把人机界面换成对外的 HTTP + WebSocket API。因为运行的是完整应用，桌面版的全部能力都在。

**部署完，用浏览器打开地址，你看到的就是完整的 Halo 管理界面 —— 和桌面版一模一样，只是现在它常驻在服务器上、还能被你的后台用 API 调用。**

## 快速开始

```bash
git clone <halo-server 仓库地址>
cd halo-server
docker build -t halo-server .

docker run -d --name halo-server \
  -p 8080:8080 \
  -e HALO_REMOTE_PASSWORD=改成你自己的令牌 \
  -e HALO_AI_PROVIDER=openai \
  -e HALO_AI_API_URL=<你的模型网关地址> \
  -e HALO_AI_API_KEY=<你的密钥> \
  -e HALO_AI_MODEL=<模型名> \
  halo-server
```

仓库**自包含、可离线构建**，应用包、系统库、字体都已随仓库提供，`docker build` 过程不需要联网（除非要拉取基础镜像）。

## 打开管理界面

浏览器打开：

```
http://localhost:8080
```

用上面设置的 `HALO_REMOTE_PASSWORD` 登录 —— 你看到的就是**和桌面版完全一样的 Halo 管理界面**：空间、任务、数字人、工具调用，全都在。

到这一步，你已经拥有了一个以**服务形态**运行的 Halo。

> 给后台程序调用时，不用走登录页，直接带 `Authorization: Bearer <HALO_REMOTE_PASSWORD>` 调 API 即可。详见 [集成指南](./integration.md)。

## 验证服务存活

```bash
# 存活探测（公开接口，无需令牌）
curl http://localhost:8080/api/remote/status
# => {"success":true,"data":{"active":true,"clients":0,"version":"1.0.0"}}

# 校验令牌是否正确
curl -X POST http://localhost:8080/api/remote/login \
  -H "Content-Type: application/json" \
  -d '{"token":"<HALO_REMOTE_PASSWORD>"}'
# => {"success":true}
```

## 接下来

- **[配置（环境变量）](./configuration.md)** —— 接入自有大模型网关、设置访问令牌、把数据持久化。
- **[容器部署](./deployment-docker.md)** —— `docker compose`、持久化挂卷、资源规格等完整说明。
- **[函数平台部署](./deployment-faas.md)** —— 部署到 Serverless（Knative 体系）。
- **[集成（给后台用）](./integration.md)** —— HTTP API、WebSocket 事件、多用户数字人对话示例。

::: tip 上生产前两件事
1. **持久化**：默认数据写在容器内 `/tmp/.halo`，删容器即丢。挂一块卷并设置 `HALO_DATA_DIR`（见[配置](./configuration.md)）。
2. **资源**：Halo 跑的是完整的 Electron（Chromium）主进程，内存需求较大，给容器预留 **≥ 4–8 GB**。
:::

> Halo Server 是**有状态的单实例**服务（SQLite + 文件 + 内存会话）：请**垂直扩容**（给单实例更多 CPU / 内存），不要简单横向扩容——多个实例各持一份独立状态会造成数据分裂。扩缩容细节见[函数平台部署](./deployment-faas.md#并发与扩缩容重要)。
