---
title: 部署联邦网关：让不同网络的电脑组成团队
description: 自建 Halo 联邦网关，让不在同一局域网的电脑也能组成数字人团队：用单个程序或 Docker 部署，配好 HTTPS，再在每台电脑的远程访问设置里填上网关地址。
type: how-to
audience: [admin]
since: "3.0"
related: [digital-humans/cross-computer-teams, features/remote-access, advanced/security]
---

# 部署联邦网关

网关装在你自己的服务器上，Halo 不能替你部署；AI 也改不了 **远程访问** 里的设置，填地址这一步要你自己点。

## 什么时候需要联邦网关 {#when-you-need-it}

[跨电脑团队](/digital-humans/cross-computer-teams) 默认走局域网：同事的电脑直接连到创建团队那台电脑的远程访问服务。只有成员分散在不同网络时，才需要联邦网关在中间转发。

| 你的情况 | 用什么 |
|---|---|
| 所有电脑在同一个局域网（同一间办公室、同一个 Wi-Fi） | 打开 [远程访问](/features/remote-access) 就够了，不用网关 |
| 有成员在家、在另一个城市，或在另一个公司网络里 | 部署联邦网关，并在电脑上填写它的地址 |
| 创建团队的电脑 IP 经常变，邀请链接老是失效 | 部署联邦网关：经网关发出的邀请链接指向网关，不随这台电脑的 IP 变化 |

用了网关之后，发邀请的电脑不再需要开着远程访问服务，它会主动连到网关。

::: info 官方版没有内置网关
从官网下载的 Halo 不带默认网关地址，**设置 › 远程访问 › 联邦网关** 下面显示「如团队仅限局域网内使用，请留空。」，所以跨网络使用要自己部署一个。公司提供的 Halo 可能已经内置网关，这时会显示「正在使用内置网关」和它的地址，你不用再部署。
:::

## 网关能看到什么 {#what-it-sees}

联邦网关是一个独立的小服务，只做转发：每个团队在网关上对应一个「房间」，创建团队的电脑是房间的中心，其他电脑的消息经网关转给它。网关只读每条消息外层的路由信息，不解析里面的业务内容，也不写入磁盘。

| 项目 | 网关的处理 |
|---|---|
| 团队内容（消息、任务、文件内容） | 经过网关转发，网关不解析、不写入磁盘。Halo 没有在网关这一层再加密内容，所以传输安全靠 HTTPS / WSS（见 [配置 HTTPS](#tls)） |
| 每台电脑的身份 | 每台电脑用自己的设备密钥（Ed25519）签名一次性挑战来证明身份。网关只认这个身份，没有自己的账号和密码 |
| 邀请链接里的令牌 | 加入时会经过网关，但网关无法校验它，由团队里的电脑自己校验。网关也不能签发邀请 |
| 路由信息 | 团队 ID、各电脑的身份、谁发给谁、连接来源 IP |
| 地址目录 | 创建团队的电脑会向网关登记自己的 Halo 地址（有的话）和显示名，带签名，90 秒内不刷新就过期 |
| 状态存储 | 全部在内存里，不写磁盘。重启网关只丢失临时的转发状态，电脑会自动重连 |

::: danger 诊断追踪会记录消息正文
网关配置里的 `room.trace` 默认是空（关闭）。填上某个团队 ID 或 `*` 后，网关会把该团队（或所有团队）每一帧连同正文写进日志，其中有成员的消息文字。只在排查某个问题时打开，查完立刻关掉。
:::

邀请链接本身就是加入凭证：「任何拥有此链接的人都可以将数字人带入该团队。」网关能看到经过它的邀请令牌，所以网关应由你自己或你信任的管理员运行。Halo 整体的数据流向见 [安全、隐私与数据流](/advanced/security)。

## 开始之前 {#before-you-start}

- 一台所有成员电脑都能访问到的服务器（Linux 或 macOS），能开放一个端口，默认 `3100`
- 构建工具二选一：Go 1.24 和 `make`（单个程序），或 Docker
- 一个域名和 TLS 证书，例如 `gateway.example.com`；或者一个已有的反向代理（nginx、Caddy、Traefik）
- Halo 的源码。网关的源码在 Halo 源码仓库的 `gateway` 目录里

<!-- public:start -->
源码在 [GitHub 上的 Halo 仓库](https://github.com/openkursar/hello-halo)，切到与你的 Halo 版本一致的标签（例如 `v3.0.4`）再构建。
<!-- public:end -->

## 部署网关 {#deploy}

网关目前只支持中继模式（`mode: relay`）。配置里写 `mode: authority` 会直接报错，拒绝启动。

### 方式一：单个程序

1. 在服务器上进入源码的 `gateway` 目录，构建并启动：

   ```bash
   cd gateway
   make build
   ./dist/halo-gateway -listen :3100
   ```

   程序生成在 `dist/halo-gateway`，默认监听 `:3100`，同一个端口同时提供 HTTP 和 WebSocket。
2. 需要给别的平台构建时，运行 `make cross`，会生成 `linux-amd64`、`linux-arm64`、`darwin-arm64` 三个版本，在 `dist/` 下。

### 方式二：Docker

1. 在 `gateway` 目录构建镜像并运行：

   ```bash
   cd gateway
   make docker VERSION=dev
   docker run -d --name halo-gateway -p 3100:3100 halo-gateway:dev
   ```

   `make docker` 会把镜像标记为 `halo-gateway:<版本号>`，不写 `VERSION` 时版本号取自 git 标签。写上 `VERSION=dev`，镜像名就和下一行的 `halo-gateway:dev` 对上。
2. 镜像基于 distroless/static，以非 root 用户运行，对外暴露 `3100` 端口。

### 确认网关在运行

在任意一台成员电脑上打开 `http://gateway.example.com:3100/healthz`（配好 HTTPS 后换成 `https://` 地址）。返回 200 就说明网关在服务。

| 地址 | 用途 |
|---|---|
| `GET /healthz` | 存活检查，进程在服务时总是返回 200 |
| `GET /readyz` | 就绪检查，关停排空时返回 503 |
| `GET /version` | 构建信息（JSON） |
| `GET /metrics` | Prometheus 格式的指标，没有登录保护，不想公开就在反向代理上拦掉 |
| `GET /ws` | Halo 电脑连接用的 WebSocket |
| `GET /`、`GET /invite` | 邀请落地页 |

收到 `SIGTERM` 或 `SIGINT` 时，网关先把 `/readyz` 切到 503，关闭所有连接后退出，最多等 10 秒。电脑会按退避策略自动重连，所以滚动重启是安全的。

### 修改配置

配置按这个顺序生效：命令行参数 > `HALO_GW_*` 环境变量 > YAML 文件 > 默认值。YAML 文件可选，源码里的 `config.example.yaml` 列出了每一项和它的默认值，用 `-config` 指定：

```bash
./halo-gateway -config /etc/halo/gateway.yaml
HALO_GW_LISTEN=:8443 HALO_GW_LOG_FORMAT=text ./halo-gateway
```

| 参数 | 环境变量 | 默认值 | 作用 |
|---|---|---|---|
| `-listen` | `HALO_GW_LISTEN` | `:3100` | HTTP 和 WebSocket 的监听地址 |
| `-config` | `HALO_GW_CONFIG` | — | YAML 配置文件路径 |
| `-tls-cert` / `-tls-key` | `HALO_GW_TLS_CERT` / `HALO_GW_TLS_KEY` | — | 由网关直接提供 TLS |
| `-log-level` | `HALO_GW_LOG_LEVEL` | `info` | `debug`、`info`、`warn`、`error` |
| `-log-format` | `HALO_GW_LOG_FORMAT` | `json` | `json` 或 `text` |

只能在 YAML 里改的限制项（默认值）：

| 配置项 | 默认值 | 含义 |
|---|---|---|
| `limits.maxFrameBytes` | `8388608`（8 MiB） | 单帧上限，超过就断开对方 |
| `limits.connPerIPRate` / `limits.connPerIPBurst` | `10` / `20` | 每个来源 IP 每秒新建连接数 / 突发上限 |
| `limits.sessionFrameRate` | `500` | 每个已认证连接每秒最多转发的帧数 |
| `room.hostRetention` | `5m` | 创建团队的电脑断开后，房间保留多久等它回来 |
| `room.admissionTimeout` | `60s` | 待加入的成员要在这段时间内被放行 |
| `directory.ttl` | `90s` | 地址目录条目不刷新就过期 |

## 配置 HTTPS {#tls}

成员电脑通常要经过公网连到网关，团队内容在网关这一层没有额外加密，所以请给网关配上 HTTPS（WebSocket 随之变成 WSS）。网关不配证书时只提供普通 HTTP。有两种做法：

**网关直接提供 TLS**：在 YAML 里填 `tls.cert` 和 `tls.key`，或者用参数，然后开放端口。

```bash
./dist/halo-gateway -listen :3100 -tls-cert <CERT_FILE> -tls-key <KEY_FILE>
```

`<CERT_FILE>` 和 `<KEY_FILE>` 换成你的证书和私钥文件路径。这时网关地址是 `https://gateway.example.com:3100`。

**放在反向代理后面**（nginx、Caddy、Traefik）：在代理上终止 TLS，再用普通 HTTP 转给网关。代理要满足这几条：

| 要求 | 原因 |
|---|---|
| `/ws` 支持 WebSocket 升级 | Halo 电脑通过 `/ws` 连接网关 |
| 读取 / 空闲超时大于 90 秒 | 连接靠每 30 秒一次的保活 ping 维持，超时太短会被代理断开 |
| 不缓冲、不把 WebSocket 消息限制在 8 MiB 以下 | 网关默认的单帧上限是 8 MiB |
| 调高 `limits.connPerIPBurst`，或改在代理上限流 | 网关按 TCP 来源地址限流，在代理后面所有连接都来自代理的 IP |

nginx 的示例写法（按你的站点调整）：

```nginx
location / {
    proxy_pass http://127.0.0.1:3100;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 120s;
}
```

这时网关地址是 `https://gateway.example.com`。

## 在每台电脑上填写网关地址 {#configure-halo}

<Badge type="info" text="仅桌面版" /> 联邦网关这一栏在 **远程访问** 设置里，只在桌面版显示；即使远程访问没打开，这一栏也在。

哪些电脑要填：

- **必须填**：发出邀请的电脑，也就是创建团队的那台。它的邀请链接会改成指向网关。
- **建议都填同一个地址**：团队里每台电脑。这样谁都能用它创建团队、发出邀请。加入的电脑按邀请链接里的网关地址去连接。

1. 打开 **设置 › 远程访问**，找到 **联邦网关**。说明文字是「通过网关服务器中继团队协作，让本地网络之外的成员也能加入。」
2. 在输入框里填网关地址，例如 `https://gateway.example.com`。支持 `http://`、`https://`、`ws://`、`wss://`。
3. 点 **保存**。按钮变成 **已保存**，就说明地址存好了。
4. 重启 Halo。输入框下面写着「重启 Halo 后，网关更改才会应用于现有的团队连接。」

想换回只在局域网用：清空输入框，点 **保存**，再重启 Halo。

::: done
在创建团队的电脑上打开团队的 **团队设置 › 邀请**，复制链接。链接以 `https://gateway.example.com/?office=` 开头，就说明邀请已经经过网关。
:::

### 邀请链接跨网络也能用

把这条链接发给不在同一网络的同事。对方在浏览器里打开，看到网关上的邀请页，点 **在 Halo 中打开**，就会回到 Halo 的 **加入团队** 窗口。加入的步骤和权限选择见 [跨电脑团队的邀请链接](/digital-humans/cross-computer-teams#invite-links)。

填网关之前复制的旧链接仍是局域网地址，请重新打开 **邀请** 复制一次。

## 遇到问题 {#troubleshooting}

### 邀请时提示「请在设置中开启远程访问，以便他人加入该团队。」

这台电脑既没有填网关地址，也没打开远程访问。跨网络使用时，在这台电脑上按 [填写网关地址](#configure-halo) 的步骤填好并重启 Halo。

### 复制的邀请链接还是局域网地址

保存网关地址后没有重启，或者用的是之前复制的链接。重启 Halo，再从 **团队设置 › 邀请** 复制一次。

### 同事加入时看到「无法加入团队。请检查链接，并确认邀请你的人在线。」

1. 创建团队的电脑要开着 Halo，并且能连上网关。
2. 在同事的网络里打开网关的 `/healthz`，确认能访问到网关。
3. 确认同事用的是以网关地址开头的新链接。

### 提示「该团队要求所有成员将 Halo 更新至最新版本」

团队里的电脑版本不一致。团队中也可能显示「（团队名）需要更新」或「正在等待（成员名）更新」。在每台电脑上打开 **设置 › 关于 › 检查更新**，把 Halo 升到同一个最新版本。

### 成员显示「离线」

每台电脑每 2 秒报一次在线状态：6 秒没消息算暂时离开（「似乎暂时离开了——回复可能会有延迟」），13 秒没消息算离线。常见原因是对方关了 Halo、电脑睡眠、网络断开，或网关在重启。网关恢复后电脑会自动重连，团队里会提示「自动重新连接——工作从上次中断处继续。」创建团队的电脑离线时，其余在线电脑会自动接管团队记录，但那台电脑上的数字人要等它回来才能干活。

### 放在反向代理后面，连接隔一会儿就断

检查代理是否支持 `/ws` 的 WebSocket 升级，读取 / 空闲超时是否大于 90 秒，见 [配置 HTTPS](#tls)。

### 很多电脑同时连接时被拒

网关在代理后面时，所有连接看起来都来自代理的 IP，会触发按 IP 的限流。`/metrics` 里的 `halo_gw_rate_limited_total` 会增长。调高 `limits.connPerIPBurst`，或改在代理上限流。

## 下一步 {#next-steps}

- [跨电脑团队](/digital-humans/cross-computer-teams)：邀请同事、选择他们能让你的数字人做什么
- [远程访问](/features/remote-access)：同一局域网内不用网关时的连接方式
- [安全、隐私与数据流](/advanced/security)：Halo 会连接哪些地址，向安全评审说明
