# Image Input

Halo supports sending images directly in conversations. The AI can recognize and analyze image content and respond accordingly.

## How to Add Images

Any of three methods work:

1. Click the **"+"** button on the left side of the input box and select a file
2. **Drag and drop** an image file directly into the input box
3. Use **Ctrl/Cmd + V** to paste a screenshot from your clipboard

<!-- Screenshot placeholder: screenshot-image-input.png (input box with image preview) -->

---

## Supported Formats and Limits

| Item | Details |
|------|---------|
| Supported formats | PNG, JPEG, WebP, GIF |
| Maximum file size per image | 20 MB |
| Maximum images per message | 10 |

---

## Important: A Multimodal Model Is Required

::: danger Non-multimodal models will throw an error
Image input **only works with multimodal models**, such as Claude 4.5, Claude 3.7 Sonnet, and GPT-4o.

When using a model that does not support vision (such as some domestic model APIs), uploading an image will cause an error. Because the context already contains image parameters, **you must start a new conversation** to continue using Halo normally.
:::

To switch to a multimodal model: use the model selection menu in the top-right corner.

---

## Typical Use Cases

- Screenshot the UI and ask the AI to analyze the design or identify code errors
- Upload a chart and ask the AI to interpret the data
- Send a design mockup and ask the AI to generate the corresponding code
- Photograph a document and ask the AI to extract or translate the text
