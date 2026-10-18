---
title: 命令与快捷键：斜杠命令、IM 命令和键盘快捷键
description: Halo 的命令与快捷键：聊天输入框里的 / 菜单，发给数字人机器人的 IM 命令（停止、清空上下文），以及键盘快捷键和发送键。
type: reference
audience: [beginner, office, developer]
related: [features/conversations, digital-humans/channels, features/code-review]
---

# 命令与快捷键

命令分两处：Halo 窗口里的 **/** 菜单，以及在企业微信、飞书、微信里发给数字人机器人的 IM 命令，两者互不通用。日常使用不需要记命令，用自然语言告诉 Halo 要做什么就行。快捷键只在 Halo 窗口里有效，Halo 没有系统级的全局快捷键。

## 斜杠命令（Halo 窗口） {#slash-commands}

在消息开头输入 **/**，会弹出一个列表，分 **技能** 和 **内置** 两组。选中一条，Halo 把 `/命令` 加一个空格填进输入框，你补完再发送。

- **技能**：你启用的 [技能](/features/skills)。在技能上点 **去使用**，也会把它的命令填进来，并显示参数提示。
- **内置**：当前 [Agent 引擎](/features/agent-engines) 自己报告的命令。Halo 不在聊天窗口里加任何命令，也没有固定的命令清单。

能看到哪些命令，取决于引擎：

| AI Agent 引擎 | / 菜单 |
|---|---|
| Claude Code SDK（默认） | 列出引擎报告的命令和你的技能 |
| Halo SDK <Badge type="warning" text="实验性" /> | 列出引擎报告的命令和你的技能 |
| Codex SDK、DeepSeek dsh | 不报告命令，不出现菜单 |

想知道现在有哪些命令，输入 **/** 看列表：

- 匹配不区分大小写，开头相同的排在前面。列表一次显示 8 条，多了可以滚动。
- 用 ↑ ↓ 移动，<kbd>Enter</kbd> 选中，<kbd>Esc</kbd> 关闭。
- 只有消息以 / 开头、中间没有空格或换行时才弹出菜单。
- 新会话在第一条回复之前，列表可能是空的，或者全部显示为 **内置**。第一条回复到达后会更新。
- 在目标模式里选命令，会退出目标模式。

`/compact` 这类命令只有引擎在列表里报告了才有。用它手动压缩上下文时，对话里会出现「上下文已智能压缩」，不带 token 数；自动压缩时会带上数量。

在 Halo 窗口里，`/halo-stop`、`/halo-clear` 这些 IM 命令不起作用：

- 停止回复：按 <kbd>Esc</kbd> 或点方块按钮，见 [停下与继续](/features/conversations#stop)。
- 清空数字人的聊天：在对话底部点 **清空聊天**，再在「清空所有聊天记录？」里点 **确认**。
- 普通会话没有清空，想重新开始就新建一个会话。

## IM 命令（发给数字人的机器人） {#im-commands}

在企业微信、飞书、微信里给数字人的机器人发下面这些命令，可以让它停下或从头开始。机器人怎么接入，见 [消息通道](/digital-humans/channels)。

| 作用 | 命令（任选一个） | 机器人回复 |
|---|---|---|
| 停止当前回复 | `/halo-stop`、`/halo-cancel`、`/stop` | "Generation stopped."；没有在回复时是 "No active generation to stop." |
| 清空上下文，从新对话开始 | `/halo-clear`、`/halo-reset`、`/clear` | "Context cleared. Starting a fresh conversation." |

- 命令不区分大小写，前后的空格会被忽略。
- 机器人的回复只有英文。
- 私聊里，整条消息只发命令本身。
- 群聊里先 @ 机器人，把命令放在**最后**，例如 `@运营助手 /stop`。机器人名字里带空格也能识别。命令后面再跟文字，就会被当成普通消息。
- 企业微信群只把 @ 机器人的消息交给它，飞书群默认也要 @。个人微信只支持私聊。

### 停止做什么 {#im-stop}

- 中断这位数字人在这个聊天里正在进行的回复。
- 聊天记录和上下文都保留，下一条消息接着之前的内容继续。

### 清空保留什么 {#im-clear}

| 会被清掉 | 会保留 |
|---|---|
| 正在进行的回复 | 数字人的 [记忆](/features/memory) |
| Halo 这边这个聊天的对话历史，下一条消息开始新对话 | 在这个聊天里设的 [提醒](/digital-humans/reminders) |
| 机器人忙时你补发、还没处理的消息 | 企业微信、飞书、微信里的聊天记录本身 |

- 只影响发命令的这一个聊天（这个人的私聊，或这个群）。同一个机器人的其他聊天不受影响。
- 机器人由团队成员负责时，`/clear` 只结束这个聊天当前的团队对话，其他聊天保留各自的上下文。
- 想一次清空一位数字人的所有对话，在它的 **能力与设置 › 高级 › 危险区域** 里用 **清空所有对话**。由团队负责的 IM 聊天不包括在内，需要在那个聊天里发 `/clear`。

### 回答数字人的提问：直接回复，没有命令 {#answer-in-im}

3.0.4 没有 `/answer` 命令。旧文档里教的「`/answer` 加编号和选项」已经不能用了。

数字人需要你拍板时，问题会发到你和机器人的私聊里。开头是「「名字」的任务需要你决定：…」，后面列出 A、B 等选项，最后一行是「直接回复我就行，也可以在 Halo 里回答。」

用平常的话回复就行，比如「B」或者「华东吧」。数字人收到后接着做这项工作。你也可以在 Halo 里回答，见 [回答它的提问](/digital-humans/manage#answer-questions)。谁会收到这些问题，见 [主人与访客权限](/digital-humans/permissions)。

## 键盘快捷键 {#shortcuts}

下面的快捷键在 Halo 窗口里有效。Windows 和 Linux 上一般用 <kbd>Ctrl</kbd> 代替 <kbd>⌘</kbd>，例外在表里单独写明。

### 搜索 {#shortcuts-search}

| macOS | Windows / Linux | 作用 | 在哪里有效 |
|---|---|---|---|
| <kbd>⌘</kbd> <kbd>K</kbd> | <kbd>Ctrl</kbd> <kbd>K</kbd> | 打开或关闭搜索和命令面板：跳到会话、数字人、任务、知识库，或搜索消息 | 任何地方 |
| <kbd>⌘</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>F</kbd> | 搜索当前会话 | 仅桌面版；网页客户端里这个键留给浏览器 |
| <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>F</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>F</kbd> | 搜索当前工作区 | 任何地方 |

打开一个搜索结果后，会出现一条高亮栏：↑ 看更早的，↓ 看更近的，<kbd>⌘</kbd> <kbd>K</kbd> / <kbd>Ctrl</kbd> <kbd>K</kbd> 修改搜索，<kbd>Esc</kbd> 关闭。详见 [找到以前的对话](/features/conversations#search)。

### 画布和工具 {#shortcuts-canvas}

| macOS | Windows / Linux | 作用 | 在哪里有效 |
|---|---|---|---|
| <kbd>⌘</kbd> <kbd>T</kbd> | <kbd>Ctrl</kbd> <kbd>T</kbd> | 在画布里新开一个 [AI 浏览器](/features/ai-browser) 标签页 | 会话页，画布关着也能用 |
| <kbd>⌘</kbd> <kbd>W</kbd> | <kbd>Ctrl</kbd> <kbd>W</kbd> | 关闭当前画布标签页 | 画布打开时 |
| <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>W</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>W</kbd> | 关闭全部画布标签页 | 画布打开时 |
| <kbd>⌃</kbd> <kbd>Tab</kbd> / <kbd>⌃</kbd> <kbd>⇧</kbd> <kbd>Tab</kbd> | <kbd>Ctrl</kbd> <kbd>Tab</kbd> / <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>Tab</kbd> | 下一个 / 上一个画布标签页 | 画布打开时 |
| <kbd>⌘</kbd> <kbd>1</kbd>–<kbd>9</kbd> | <kbd>Ctrl</kbd> <kbd>1</kbd>–<kbd>9</kbd> | 跳到第 1–9 个画布标签页 | 画布打开时 |
| <kbd>Esc</kbd> | <kbd>Esc</kbd> | 收起画布，回到对话 | 画布打开，且画布里的菜单或查看器没有先用掉这一下 |
| <kbd>⌘</kbd> <kbd>S</kbd> | <kbd>Ctrl</kbd> <kbd>S</kbd> | 保存 | 在画布的代码编辑器或目标编辑器里编辑时 |
| <kbd>⌃</kbd> <kbd>C</kbd> | <kbd>Ctrl</kbd> <kbd>C</kbd> | 总是发给终端，中断正在运行的命令；选中了文字也不会复制。要把输出交给 AI，选中后点 **添加到对话**，见 [和 AI 共用同一个终端](/features/ai-terminal#shared-session) | [AI 终端](/features/ai-terminal) 标签页 |
| <kbd>⌃</kbd> <kbd>⇧</kbd> <kbd>G</kbd> | <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>G</kbd> | 打开 **变更** | 会话页；macOS 上是 Control 键，不是 Command 键 |

### 显示大小 <Badge type="info" text="仅桌面版" /> {#shortcuts-zoom}

| macOS | Windows / Linux | 作用 |
|---|---|---|
| <kbd>⌘</kbd> <kbd>+</kbd>（或 <kbd>⌘</kbd> <kbd>=</kbd>） | <kbd>Ctrl</kbd> <kbd>+</kbd>（或 <kbd>Ctrl</kbd> <kbd>=</kbd>） | 放大界面 |
| <kbd>⌘</kbd> <kbd>−</kbd> | <kbd>Ctrl</kbd> <kbd>−</kbd> | 缩小界面 |
| <kbd>⌘</kbd> <kbd>0</kbd> | <kbd>Ctrl</kbd> <kbd>0</kbd> | 恢复 100% |

- 范围 50%–150%，每次 10%，默认 100%，重启后保持。
- 和 **设置 › 外观 › 显示大小** 的滑块同步，详见 [设置参考](/features/settings#appearance)。
- 远程访问的网页和安卓客户端没有这项，用浏览器自己的缩放。

## 输入框按键 {#composer-keys}

| 按键 | 默认模式（Enter 发送） | Ctrl+Enter 模式 |
|---|---|---|
| <kbd>Enter</kbd> | 发送 | 换行 |
| <kbd>Shift</kbd> <kbd>Enter</kbd> | 换行 | — |
| <kbd>Ctrl</kbd> <kbd>Enter</kbd> | — | 发送；macOS 上也是 Control 键，<kbd>⌘</kbd> <kbd>Enter</kbd> 不会发送 |
| <kbd>Esc</kbd> | 停止当前回复（「停止生成 (Esc)」） | 同左 |

- 切换模式：**设置 › 外观 › 发送键**，选 **Enter** 或 **Ctrl+Enter**。
- Halo 工作时也可以发送。发送按钮显示「加入队列」，消息会在它做完当前这一步后送到，见 [Halo 工作时继续补充](/features/conversations#queue)。
- <kbd>Esc</kbd> 的顺序：＋ 面板开着时先关面板；在目标模式里先退出目标模式（文字保留）；再按一下才停止回复。
- 用中文、日文或韩文输入法选词时按 <kbd>Enter</kbd>，不会发送。
- 宽度小于 768 px 的触屏设备上，<kbd>Enter</kbd> 总是换行，用发送按钮发送。
- 输入 **/** 打开命令菜单，输入 **@** 打开数字人、对话和文件菜单。两个菜单都用 ↑ ↓ 移动，<kbd>Esc</kbd> 关闭。

**变更** 里的按键：

| 按键 | 作用 |
|---|---|
| <kbd>F7</kbd> / <kbd>Shift</kbd> <kbd>F7</kbd> | 下一处变更 / 上一处变更 |
| <kbd>[</kbd> / <kbd>]</kbd> | 在详情页里逐项切换 |
| <kbd>Esc</kbd> | 关闭抽屉或详情页 |
| <kbd>⌘</kbd> <kbd>↵</kbd>（macOS）/ <kbd>Ctrl</kbd> <kbd>Enter</kbd> | 在提交信息框里提交 |

详见 [变更与代码评审](/features/code-review)。

## 相关页面 {#related}

- [会话](/features/conversations)：发送、停下、排队和 / 菜单在对话里怎么用
- [消息通道](/digital-humans/channels)：把数字人接到企业微信、飞书或微信，IM 命令在那里用
- [变更与代码评审](/features/code-review)：打开 **变更** 后怎么评审和提交
