---
title: "API Error Codes"
description: "Quick reference for AI model API error codes including Anthropic, OpenAI, and third-party providers."
---
# API Error Codes

These errors come from model service providers (such as Anthropic, OpenAI, or third-party proxies). Halo displays the raw error messages directly.

## Error Code Reference

| Error code / keyword | Meaning | Solution |
|----------------------|---------|---------|
| `429 Too Many Requests` | Requests are too frequent — rate limit triggered | Wait a few minutes and retry; or upgrade your API plan |
| `rate limit` | Rate limit reached | Retry later; check your API quota |
| `context length exceeded` | Conversation is too long, exceeding the model window | Send `/compact` to compress; or start a new conversation |
| `image not supported` | An image was uploaded, but the current model does not support vision | **Must start a new conversation**; switch to a multimodal model |
| `insufficient quota` / quota exhausted | API quota is depleted | Top up or replace your API key |
| `invalid api key` | API key is invalid or has expired | Check that the key is correct and has not expired |
| `model not found` | Model name does not exist, or account lacks permission | Check the model name; confirm your account has access to that model |
| `overloaded` / service busy | The model service is overloaded | Retry later |
| `401 Unauthorized` | Authentication failed | Re-check your API key configuration |
| `500 Internal Server Error` | Internal error on the provider's side | Retry later; contact the provider if it persists |

---

## General Troubleshooting Approach

**Retry**: `429`, `overloaded`, and `500` errors are usually temporary. Wait a moment and click resend.

**Start a new conversation**: `context length exceeded` and `image not supported` errors require a new conversation, because the current context is corrupted and cannot be recovered.

**Check configuration**: `invalid api key`, `model not found`, and `401` errors require you to go to **Settings → AI Model** to verify your key and model name.

**Contact the provider**: If an error persists after troubleshooting, contact your API service provider.

---

## About Third-Party Proxies

When using a third-party OpenAI-compatible proxy, the format and meaning of error messages may differ slightly from those of the official API. If you encounter an unfamiliar error, you can submit the full error message to [GitHub Issues](https://github.com/openkursar/hello-halo/issues) or the user community for help.
