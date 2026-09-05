---
title: "常见问题 FAQ"
description: "Halo 常见问题解答，基于用户真实咨询整理。"
---
# 常见问题 FAQ

> 基于用户真实咨询整理，持续更新。

---

## AI 模型配置


**Q：发了图片就报错？**

部分模型是纯文本模型，不支持图片。发过图片的对话会持续报错，需要**新建一个对话**再继续使用。切换到支持图片的多模态模型可以避免此问题。

**Q：报错 "fetch failed"？**

网络不通，无法连接到 AI 服务。检查：
- API URL 是否填写正确
- 电脑是否能访问这个地址
- 如果是公司内网地址，是否在公司网络环境下

**Q：报错 "error 10000 invoke model error"（500）？**

AI 服务端处理失败。常见原因：
- 对话上下文过长，超出模型限制 → 新建对话或发送 `/compact` 压缩上下文
- 发送了不支持的参数，比如大模型不支持图片，新开对话。
- 服务过载 → 稍后重试

**Q：报错 "There's an issue with the selected model (xxx). It may not exist or you may not have access to it."？**

模型校验本身可以通过 CLI 验证（同模型在 `claude` 命令行能跑），问题出在 Halo 的内部配置文件 `claude-config/settings.json` 被写脏了，SDK 启动时直接拒绝当前模型。

解决：

1. 完全关闭 Halo
2. 删除 `settings.json`：
   - macOS：`~/Library/Application Support/Halo/claude-config/settings.json`
   - Windows：`C:\Users\<用户名>\AppData\Roaming\Halo\claude-config\settings.json`
3. 重新启动 Halo，文件会自动重建

如果同事有可用的配置，也可以直接拷贝覆盖。

---

## 企业微信 Bot

**Q：Bot 一直连不上（黄灯）？**

按顺序排查：
1. 企业微信工作台那边是否点了**保存**
2. Bot ID 和 Secret 是否复制正确（没有多余空格）
3. 一个 Bot 只能绑定一个数字人
4. 重启 Halo 后重新连接

**Q：Bot 收到消息但没有回复？**

1. 检查 Halo 是否在运行
2. 检查连接状态是否绿灯
3. 在 Halo → 数字人 → 聊天 → 右侧面板查看消息是否到达
4. 直接在数字人聊天界面测试 AI 是否正常

**Q：Bot 一直显示"思考中"？**

AI 思考超时（约 5 分钟）。解决：
- 在 Halo → 数字人 → 聊天 → 点击输入框 → 按 **Esc** 中断
- 无效则重启 Halo
- 第一次测试请用简单问题（如"你好"）

**Q：Bot 能看到群里所有消息吗？**

不能。群聊中 Bot 只有被 @ 后才能看到消息。私聊可以看到全部。

**Q：Bot 收不到图片？**

图片和文字要放一起@ 机器人，同时保证大模型是多模态的。

**Q：回复有字符丢失/乱码？**

关闭企业微信 Bot 的**流式回复**开关（在 Halo 设置中）。

**Q：如何清空 Bot 的对话上下文？**

发送 `/halo-clear` 命令，或在 Halo → 数字人 → 会话列表中点击清除按钮。

---

## 数字人

**Q：数字人和普通对话有什么区别？**

普通对话需要你手动发消息并等待；数字人可以设定任务和频率，自动定时运行。两者底层 AI 能力完全相同。

**Q：数字人的通知太多怎么办？**

在数字人设置中调整通知级别：
- `all`：每次运行都通知（默认）
- `important`：只推重要事件
- `none`：关闭所有通知

---

## 系统 / 环境

**Q：Mac 上报错 "spawn open ENOENT"？**

已在最新版修复。请升级到最新版本。

**Q：报错 "Claude Code executable not found at ...\cli.js"？（常见于 VDI 迁移、换电脑或重装之后）**

这个报错有误导性——`cli.js` 并没有丢，真正原因是**数字人/空间的"工作目录"指向了一个已经不存在的文件夹**。Halo 会把这个工作目录作为后台子进程的运行目录（cwd），目录不存在时系统报 ENOENT，被包装成了这句"找不到可执行文件"。

所以**重装、删配置、重装系统都没用**——失效的路径记录在空间配置里，重装不会修复它。

常见触发场景：工作目录被设在了安装目录下（例如 `D:\Program Files\Halo-WeBank\spaces`），而 VDI 迁移或"删目录重装"之后，这个子文件夹没有被重新创建。

定位：设置 → 系统 → 打开日志，搜索 `resolved=`，等号后面就是实际使用的工作目录。把这个路径粘贴到文件管理器打开，大概率打不开（目录已不存在）。

解决：把这个目录建回来即可。若路径在 `Program Files` 下，需**以管理员身份**打开 PowerShell，执行（把路径换成你日志里看到的那个）：

```powershell
New-Item -ItemType Directory -Force "D:\Program Files\Halo-WeBank\spaces" | Out-Null
```

然后重启 Halo 即可恢复。

> 更稳妥的做法：把数字人的工作目录改到**用户可写、且不随安装/迁移丢失**的位置（如 `D:\HaloData`），避免下次重装或换机后再次失效。

**Q：怎么重启 Halo？**

设置 → 系统 → 运行诊断 → 重启应用。

**Q：邮箱报错 "unable to verify the first certificate"？**

更新最新的版本，已「禁用 TLS 验证」
