# Best Practices

This page consolidates effective tips for everyday Halo use, drawn from real-world experience.

---

## 1. Make Good Use of Space Isolation

Use a separate space for each project. Don't cram all tasks into a single conversation.

- Different code repositories → different Dedicated Spaces (linked to their respective directories)
- Ad-hoc questions → a temporary space, open and disposable, so it doesn't pollute ongoing project context
- Experimental exploration → its own space, discarded whenever needed

---

## 2. Run Multiple Tasks in Parallel

All Halo tasks execute independently in the background — you don't need to wait for one task to finish before starting the next.

Typical workflow:
1. In Space A, ask AI to refactor a module — no need to watch it
2. Switch to Space B and ask AI to draft next week's product document
3. Switch to Space C and ask AI to research competitors
4. Rotate between spaces, review progress, and issue the next round of instructions

> Halo shifts you from "waiting for AI to reply" to "commanding an AI team."

---

## 3. Make Full Use of Remote Capabilities

**Leaving work early**:
1. Enable the public tunnel before leaving the office
2. Send the URL and password to your phone
3. At home, open a browser and continue directing the AI to finish the day's work

**In a meeting**:
During an unimportant meeting, open Halo on your phone or tablet to let the AI keep progressing on your task — no time wasted.

**Remote deployment (macOS users)**:
1. Maintain an active server login session in the terminal in advance (pin + token)
2. Back home, tell Halo: "Use Apple Script to open the terminal, run the build script, and deploy to the test server"
3. The AI will automatically operate your computer's terminal to complete the deployment

---

## 4. Tips for the Thinking Toolbar

The thinking toolbar is collapsed by default, showing only the final result. This is the recommended mode for everyday use — don't over-focus on the AI's thinking process; concentrate on the outcome.

When you need to debug or understand what the AI is doing in detail, expand the toolbar to see:
- Raw tool call parameters (JSON icon)
- Complete results of each tool call
- The AI's reasoning chain

---

## 5. Context Management

- Keep individual conversations from getting too long — send `/compact` periodically
- For long-running projects, start a new conversation every so often to keep the context clean
- When you encounter `Prompt is too long`, don't keep retrying — open a new space immediately and paste the key history

---

## 6. Model Selection Strategy

| Scenario | Recommended Model |
|----------|------------------|
| Code development, Agent tasks | Claude 4.5 Sonnet / Opus |
| AI browser, image recognition | Claude 4.5 (multimodal) |
| Quick Q&A, lightweight tasks | Claude 3.5 Haiku or a domestic model |
| Cost-sensitive scenarios | Sonnet model via a domestic proxy |

The model selection menu in the top-right corner lets you switch at any time. Different spaces can use different models.
