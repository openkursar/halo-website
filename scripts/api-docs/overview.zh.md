---
title: "Halo HTTP API 参考与概览：地址、鉴权和约定"
description: "Halo HTTP API 概览：基础地址、鉴权、请求与响应约定、错误码和实时事件，以及全部已收录的接口分组。"
type: reference
audience: [developer]
generated: true
editLink: false
---

# HTTP API 概览

Halo 提供一套 HTTP API 和 WebSocket 事件流。Halo 的远程网页版和安卓客户端用的就是这套接口，所以脚本或后台服务能做到你在应用里做的大部分事：管理工作区和会话，运行数字人和团队并与之对话，管理知识库、消息通道和商店，以及操作终端。

本参考由 Halo {{appVersion}} 生成，收录 {{documentedCount}} 个操作。Halo 自己的客户端还会用到另外 {{internalCount}} 个端点，它们不在本参考之列，也不是稳定的契约，任何版本都可能修改或移除，且不另行通知。

第一次用这套 API？先跟着[快速上手](/developers/quickstart)发出第一个请求。

## 基础地址 {#base-url}

| Halo 运行在哪里 | 基础地址 |
| --- | --- |
| Halo 桌面版，在同一台电脑上调用 | **本地地址**，默认 `http://localhost:3456` |
| Halo 桌面版，在同一网络的其他设备上调用 | **局域网地址**，`http://<COMPUTER_IP>:3456` |
| Halo 桌面版，在任何地方调用 | **设置 › 远程访问** 中 **互联网访问** 给出的 `https://` 地址 |
| Halo Server | 默认 `http://<HOST>:8080`（用 `PORT` 或 `HALO_SERVER_PORT` 修改） |

桌面版只有在开启 **启用远程访问** 时才提供 API。端口被占用时 Halo 会顺延到下一个空闲端口，所以请以 Halo 显示的地址为准，不要假定默认值。如果反向代理把 Halo 挂在某个路径前缀下，把前缀加在 `/api` 前面。

本地地址和局域网地址是明文 HTTP，网络中的流量不加密。跨越不可信的网络时，请使用互联网访问（HTTPS）或自己的 TLS 代理。

## 鉴权 {#authentication}

`/api/` 下的每个请求都要以 Bearer 令牌的形式带上访问密码：

```http
Authorization: Bearer <ACCESS_PASSWORD>
```

`<ACCESS_PASSWORD>` 是：

- Halo 桌面版：**设置 › 远程访问** 中的 **访问密码**。Halo 默认生成 12 位密码；想换成自己的密码，点它旁边的 **编辑**（8–64 位，需包含大写字母、小写字母和数字）。修改后，使用旧密码的请求会立即被拒绝。改完请重启 Halo，已经建立的连接也会一并断开。
- Halo Server：环境变量 `HALO_REMOTE_PASSWORD` 的值。请自己设置一个 8–64 位的密码，登录页不接受更短的密码，不要依赖默认值。见 [Halo Server 配置](/server/configuration)。

::: danger 访问密码就是管理员密码
访问密码可以完全控制这台 Halo，包括它的文件、终端和 AI。请像对待管理员密码一样对待它：只放在服务端，不要写进网页、代码仓库或日志。
:::

也可以用查询参数 `?token=` 传递密码，但它会留在日志和浏览器历史里，特殊字符还需要 URL 编码。优先使用请求头。

有三个端点无需令牌：`GET /api/remote/status`、`POST /api/remote/login`、`GET /api/security/policy`。

### 校验密码与锁定 {#lockout}

向 `POST /api/remote/login` 发送 `{"token":"<ACCESS_PASSWORD>"}`，密码正确时返回 `{"success":true}`。它不会建立会话，之后的每个请求仍要带请求头。

发往这个端点和 WebSocket 登录的错误密码会被限流：同一 IP 在 5 分钟内失败 5 次，这个 IP 锁定 15 分钟；1 小时内累计失败 10 次（不论来自哪些 IP），所有人的登录锁定 30 分钟。被锁定的请求返回 `429`，带以秒为单位的 `Retry-After` 响应头和 `"code": "LOCKED"`。带请求头的普通请求不受限流影响，令牌错误时返回 `401`。

## 请求 {#requests}

- 发送 JSON，并带上 `Content-Type: application/json`。JSON 请求体上限 100 KB。
- ID 都是 UUID，少数固定 ID 除外，例如 Halo 工作区的 `halo-temp`。
- 本参考中路径参数写作 `:name`，调用时把整段替换成实际值。
- 路径中没有版本前缀。

## 响应与错误 {#errors}

大多数操作返回同样的信封结构：

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "error": "出错原因" }
```

- **请检查 `success`，不要只看状态码。** 很多失败会以 HTTP 200 加 `"success": false` 返回。
- 少数操作把结果放在别的字段里（如 `servers` 或 `result`），对应条目会注明。
- 本参考中的响应结构是简写：`…` 表示省略的字段，`a | b` 表示二选一，`// …` 是注释。它们说明结构，并不是可以直接解析的 JSON。

| 状态码 | 含义 |
| --- | --- |
| 200 | 已处理，请检查 `success` |
| 400 | 输入缺失或无效（仅限会校验输入的操作） |
| 401 | 没有令牌或令牌错误：`"No authorization token"` 或 `"Invalid token"` |
| 403 | 被拒绝：路径超出 Halo 允许的目录、功能被本版本的安全策略关闭，或这台电脑不提供该功能 |
| 404 | ID 不存在（仅限会检查 ID 的操作） |
| 413 | 请求体过大 |
| 429 | 登录已被锁定（见[校验密码与锁定](#lockout)） |

未知路径不会返回 JSON：`GET` 会返回网页版的 HTML 页面且状态码为 200，其他方法返回普通的 404 页面。如果收到的是 HTML，请检查路径。

## 实时事件 {#real-time}

Halo 通过同一地址上的 `/ws` WebSocket 推送进度：正在生成的回复、工具调用、等待回答的问题，以及数字人、团队和文件的状态变化。详见 [WebSocket 事件](/developers/api/websocket)。

## 在网页中调用 {#cors}

API 允许任意来源的跨域请求，方法限于 `GET`、`POST`、`PUT`、`DELETE`。`PATCH` 不在允许列表中，所以其他来源的网页无法调用 `PATCH` 操作，请改从服务端调用。不要把访问密码放进别人能打开的网页。

## 无法撤销的操作 {#destructive}

会修改或删除已有数据的操作都带有标记。**不可撤销** 的操作删除后无法恢复，也不会进入回收站，调用前请先征得用户确认。**可撤销** 的操作改动之后还能改回来。

## Halo 助手也在用这套 API {#assistant}

开启 **操作 Halo** 能力后，Halo 自己的助手会调用这套 API 替用户操作 Halo。它经由本机上一个独立的监听端口、使用单独的令牌，只能调用标有 **助手可调用** 的操作，读到的响应中密钥类字段会被遮盖。没有这个标记的操作留给用户在应用里完成，或者由你通过这套 API 完成。

## 稳定性 {#stability}

- API 没有版本号。本参考对应 Halo {{appVersion}}，每次发版都会重新生成。可以用 [`GET /api/system/version`](/developers/api/settings#get-api-system-version) 查询运行中的 Halo 版本；`/api/remote/status` 返回的 `version` 固定为 `1.0.0`，不随版本变化。
- 操作和响应字段可能在版本之间变化。升级集成所依赖的 Halo 之前，请先查看[更新日志](/guide/changelog)。

## 分组 {#groups}

{{groupTable}}

## 相关页面 {#related}

- [快速上手](/developers/quickstart)：一步步发出第一个请求
- [WebSocket 事件](/developers/api/websocket)：实时跟进回复和状态
- [Halo Server](/server/)：在 Linux 上把 Halo 作为服务运行
