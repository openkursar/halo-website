# Commands

Halo's input box passes content directly to the underlying Claude Code, so all native Claude Code commands are available.

## Common Commands

| Command | Description |
|---------|-------------|
| `/compact` | Compress the current conversation context to free up token space |
| `/stats` | View token usage statistics for the current conversation |
| `/clear` | Clear the current conversation history |

---

## `/compact`: Context Compression

After a long conversation, the context gradually approaches the model's token limit. At that point, send:

```
/compact
```

Claude Code will automatically summarize and compress the conversation history, preserving key context and freeing up space to continue.

::: tip
When the conversation is very long, you can also open a new space directly, paste the key history into the new conversation, and say "The above is the history — please continue" to resume the task.
:::

---

## General Agent Capabilities

Halo runs on Claude Code and has full Agent capabilities. Anything you can do on the command line can be done with natural language:

```
Show me all the files in the current directory
```

```
Organize the desktop files — sort documents, images, and code into corresponding folders
```

```
Use Apple Script to open the terminal and run git pull
```

```
Check system memory usage and tell me which processes are consuming the most
```

The AI will autonomously plan execution steps and call any available tools — shell commands, file operations, browser, and more.
