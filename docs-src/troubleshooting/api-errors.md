# API 错误码

这类错误来自模型服务提供商（如 Anthropic、OpenAI 或第三方代理），Halo 会将原始错误信息直接展示。

## 错误码速查表

| 错误码 / 关键词 | 含义 | 解决方法 |
|----------------|------|----------|
| `429 Too Many Requests` | 请求过于频繁，触发限流 | 等待几分钟后重试；或升级 API 套餐 |
| `rate limit` | 达到速率限制 | 稍后重试；检查 API 额度 |
| `context length exceeded` | 对话太长，超出模型窗口 | 发送 `/compact` 压缩；或新开对话 |
| `image not supported` | 上传了图片，但当前模型不支持视觉 | **必须新开对话**；切换多模态模型 |
| `insufficient quota` / 余额不足 | API 额度耗尽 | 充值或更换 API Key |
| `invalid api key` | API Key 无效或已过期 | 检查 Key 是否正确、是否已过期 |
| `model not found` | 模型名称不存在，或账户无权限 | 检查模型名称；确认账户有该模型访问权限 |
| `overloaded` / 服务繁忙 | 模型服务端过载 | 稍后重试 |
| `401 Unauthorized` | 认证失败 | 重新检查 API Key 配置 |
| `500 Internal Server Error` | 服务提供商内部错误 | 稍后重试；如持续发生请联系服务提供商 |

---

## 通用处理思路

**重试**：`429`、`overloaded`、`500` 类错误通常是暂时性的，等待片刻后点击重新发送即可。

**新开对话**：`context length exceeded`、`image not supported` 类错误，必须新开对话，因为当前上下文已损坏无法恢复。

**检查配置**：`invalid api key`、`model not found`、`401` 类错误，需进入 **设置 → AI 模型** 核查 Key 和模型名称。

**联系提供商**：如果错误持续出现且排查后仍无法解决，请联系你的 API 服务提供商。

---

## 关于第三方代理

使用第三方 OpenAI 兼容代理时，错误信息的格式和含义可能与官方略有差异。如遇不明错误，可将完整错误信息提交到 [GitHub Issues](https://github.com/openkursar/hello-halo/issues) 或用户群中寻求帮助。
