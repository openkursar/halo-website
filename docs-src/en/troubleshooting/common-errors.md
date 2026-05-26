---
title: "Common Errors"
description: "Troubleshoot common issues and errors when using Halo AI desktop agent."
---
# Common Errors

## AI Disconnects Without Warning / Stops Mid-Task

**Symptom**: The AI suddenly stops responding during a conversation with no error message.

**Cause**: The underlying Claude Code terminates directly when it encounters certain abnormal model responses, without any error handling. This is more common when using open-source models or third-party proxies.

**Solution**:
- Click the **"Continue"** button on the interface — Halo will automatically send a continue instruction
- Or manually type in the input box: `Continue`

---

## Prompt is Too Long

**Symptom**: A `Prompt is too long` error appears and the conversation cannot proceed.

**Cause**: Claude Code internally hit the context length limit. This usually happens when the AI calls a command that returns a large amount of content during execution (e.g., reading a large file), causing the context to expand dramatically, without automatic filtering by Claude Code.

**Solution**:
1. Send `/compact` to attempt context compression (effective in some cases)
2. If that no longer works, copy the key content from the current conversation, **open a new space**, paste the history, and continue.

::: tip Copy the full conversation history
Use your mouse to select all conversation content, paste it into the new conversation, and say: "The above is the conversation history — please continue executing."
:::

---

## Error After Uploading an Image

**Symptom**: The AI throws an error after an image is uploaded, and subsequent messages also fail.

**Cause**: The currently selected model does not support image input (it is not a multimodal model).

**Solution**:
- **You must open a new conversation**, because the context that already contains image parameters is corrupted
- Switch to a multimodal model (such as Claude 4.5 or GPT-4o), then re-upload the image

::: warning
Before uploading an image, confirm that the current model supports vision capabilities. You can check the model in use under Settings → AI Model.
:::

---

## Context Too Long / Model Limit Exceeded

**Symptom**: An error indicating context overflow appears after a long conversation.

**Note**: Official Claude models support approximately 200K token context. Third-party proxies or open-source models may have lower limits.

**Solution**:
- Send `/compact` to let Claude Code automatically summarize and compress
- Open a new space and continue there

---

## Commands Cannot Be Executed on Windows

**Symptom**: On Windows, the AI fails or throws an error when attempting to execute shell commands.

**Cause**: Claude Code's command execution on Windows depends on Git Bash. If Git Bash is not installed, commands cannot run.

**Solution**:
1. Download and install [Git for Windows](https://git-scm.com/download/win)
2. **Restart Halo** after installation is complete

In environments without internet access (e.g., a corporate VDI), download the installer in advance, transfer it via your internal network, and install manually.

---

## Remote Access Cannot Connect

| Symptom | Solution |
|---------|---------|
| Incorrect password error | Verify the password is entered correctly, paying attention to case sensitivity |
| LAN access fails | Ensure both devices are on the same Wi-Fi network |
| Public internet access fails | Wait about 10 seconds for DNS propagation to complete, then retry |
| Cannot get a URL after enabling | Check your network connection, then try enabling the tunnel again |

---

## AI Is Unresponsive / Stuck

1. Go to **Settings → System → Diagnostics**
2. Check the process status and service status
3. First try **"Reset AI Engine"** (S2)
4. If that still doesn't work, click **"Restart App"** (S3)

---

## Other Issues / Crashes / Compatibility

Go to **Settings → System → Open Log Folder**, and send the log files to the developers to help quickly identify the problem.

Log files contain runtime information. They do not contain your conversation content or API keys.

::: info Submit a Bug
Bug reports are welcome on [GitHub Issues](https://github.com/openkursar/hello-halo/issues). Please include the log files and steps to reproduce the issue.
:::
