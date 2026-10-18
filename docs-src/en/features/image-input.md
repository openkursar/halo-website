---
title: Image input and file attachments in Halo
description: Give Halo images, files and folders. The desktop app reads files in place, web and Android upload them, and models without image input get on-device OCR.
type: how-to
audience: [beginner]
related: [features/conversations, features/models, features/files-and-canvas]
---

# Files and images

::: say
> Summarize the risks in this contract.

Attach the contract with **+ › Files and folders** first, then send the sentence. Halo reads the file and lists the risks it finds. Word, Excel, PowerPoint and PDF files work without installing anything.
:::

## Three ways to add {#ways-to-add}

Files, folders and images all go into the composer in the same three ways:

| Way | How |
|---|---|
| The + menu | Click **+** on the left of the composer ("Add files, context and capabilities") and choose **Files and folders** under **Add** (on web and Android it's **Files**) |
| Drag | Drag the file or image onto the composer and let go when you see "Drop files or folders to attach" |
| Paste | Copy a file in your file manager, or take a screenshot, then press <Shortcut mac="⌘ V" other="Ctrl V" /> in the composer |

Halo sorts them for you: images go to the model as images, and other files and folders become cards in the composer.

## Attach files and folders <Badge type="info" text="Desktop only" /> {#attach-files}

In the desktop app, attached files and folders are **not uploaded or copied**. Halo tells the AI where they are on your computer, and the AI reads them in place. The menu says "Attach from this computer; AI reads them where they are".

1. Click **+** and choose **Files and folders**. The system picker lets you select files and folders.
2. Confirm your choice. Each file or folder becomes a card in the composer, and the row in the **+** menu shows how many are attached.
3. Write what you want done and send.

- Attaching a folder suits tasks like "summarize the weekly reports in this folder".
- One message can carry up to 50 cards. Attached files and referenced content count together.
- Dragging a file from the **Files** tab of the workspace resources into the composer inserts the file's path as text, not a card. It works like an [@ mention](#mention-files).

The web and Android clients can't attach this way; they upload files first. See [Upload from the web or Android](#remote-upload).

## Send images {#images}

You can send screenshots, photos, charts and design mockups straight to the AI. When the model can see images, it gets the picture itself, so it can read a chart, look at an error screenshot or build a page from a mockup.

1. Add the image in any of the three ways above. While it's being prepared, the composer shows "Processing image...".
2. The image appears as a thumbnail above the text box. To drop it, click **Remove image** on the thumbnail.
3. Say what you want, for example "Turn the data in this table screenshot into a short brief", and send.

| Item | Limit |
|---|---|
| Per message | Up to 10 images. Extra images are attached as regular files, not dropped |
| Size per image | Up to 20 MB before compression |
| Formats | JPEG, PNG, GIF, WebP. Other formats such as BMP or TIFF are attached as regular files |
| Before sending | Resized to at most 1568 px on the long side |
| While the AI is working | A queued message can't carry images; send them after the reply finishes |

Click a sent image to view it: <kbd>←</kbd> <kbd>→</kbd> move between images, <kbd>+</kbd> <kbd>-</kbd> <kbd>0</kbd> or the mouse wheel zoom (0.5× to 3×), and <kbd>Esc</kbd> closes the viewer.

**Can the current model see images?** In the desktop app, click the model name next to Send. The card shows an **Image input** row that reads **Supported** or **Not supported**. Halo hides the row when it doesn't know.

## When the model can't see images: Text Recognition {#text-recognition}

Not every model can see images. When you send an image to a model without vision, Halo doesn't fail. It switches to on-device **Text Recognition** instead:

- The composer shows "Current model has no vision — images will be read via local OCR (text only)". Send as usual.
- Halo saves the images as files in the workspace and turns on **Text Recognition** for the conversation, so the AI can read the text in them.
- The AI gets only the text, not the picture. It knows nothing about layout, colors or the shape of a chart.

::: info
Since 2.1.15, a model without vision no longer errors on images, and you don't need to start a new conversation.
:::

| Item | Text Recognition |
|---|---|
| Where it runs | On your computer. Images aren't sent anywhere |
| Cost | No tokens used |
| Languages | English and Simplified Chinese. Chinese is usable, but some characters may be misread |
| What it does | Extracts text only; it doesn't describe the image |
| Formats | PNG, JPG, JPEG, WebP, BMP, TIF, TIFF, GIF |
| Size | Up to 50 MB per image file, up to 20 images per pass |

You can also turn it on yourself: click **+** and switch on **Text Recognition** under **Capabilities** ("Reads text in images on this device, no tokens used"). It applies from the next message. This suits reading the text on a batch of screenshots or scans in the workspace, and costs fewer tokens than sending each image to the model. See [Capabilities](/en/features/capabilities) for every switch.

- Halo decides from the model whether it can see images. If it gets this wrong, check or clear **Vision** in that model's **Model Configuration** in [Models and accounts](/en/features/models).
- Knowledge bases use the same on-device text recognition when they learn images. See [Knowledge Base](/en/features/knowledge-base).

## Upload from the web or Android {#remote-upload}

When you use Halo in a browser through [Remote Access](/en/features/remote-access) or in the [Android app](/en/features/mobile), your device's files aren't on the computer running Halo, so they're uploaded first:

1. Click **+** and choose **Files** ("Upload from this device into the workspace; images go to the AI directly"). You can also drag ("Drop files to attach") or paste.
2. The composer shows "Uploading N file(s)…". You can send once the upload finishes.
3. Uploaded files are saved in the current workspace's folder and attached as cards.

| Item | Details |
|---|---|
| Per file | Up to 100 MB |
| Folders | Can't be uploaded; choose files |
| Images | Not uploaded; sent to the AI as images, with the same limits as on desktop |
| Same name | If the workspace already has a file with that name, Halo picks a free name |
| Requirements | A workspace is open, and Remote Access is on for the computer running Halo |

## Mention workspace files with @ {#mention-files}

If a file is already in the workspace, you don't need to attach it. Point the AI at it with **@**:

1. Type **@** at the start of the text or after a space. The menu has three groups: **Digital humans**, **Conversations** and **Files**.
2. Keep typing part of the file name to filter. The Files group shows up to 50 matches, each tagged **File** or **Folder**. While the index is still being built you see "Indexing files…"; wait a moment.
3. Use <kbd>↑</kbd> <kbd>↓</kbd> to choose, <kbd>Enter</kbd> or <kbd>Tab</kbd> to pick, and <kbd>Esc</kbd> to close. The file's path is inserted, such as `` `docs/contract.docx` ``.

For example: "The Q3 total in @quote.xlsx doesn't add up, can you check it?" To learn what the Digital Humans and conversations in the **@** menu do, see [Conversations](/en/features/conversations).

## Where the AI's files show up {#ai-created-files}

Files Halo creates or changes are saved in the current workspace and appear in the **Files** tab of the workspace resources (open it with **Open workspace resources** at the top right). Click a file to preview it in the canvas, or double-click to open it in an app on your computer. See [Files and canvas](/en/features/files-and-canvas).

::: done
Attached files show as cards in the composer and images as thumbnails. When the AI's reply refers to what's in the file or image, it has read it.
:::

## Troubleshooting {#troubleshooting}

### "Image too large (…), max 20MB"

The image is over 20 MB and wasn't attached. Compress it, or capture only the part you need.

### "Current model has no vision — images will be read via local OCR (text only)"

This isn't an error. The image is still sent, and the AI reads its text through [Text Recognition](#text-recognition). If the AI needs to understand the picture itself, such as a chart's trend or a screen layout, click the model name next to Send and pick a model whose **Image input** reads **Supported**.

### "…could not be attached: not a file or folder on this computer"

What you dragged in has no file behind it on your computer, for example content dragged straight from a web page. Save it to your computer first, then attach the saved file.

### On web or Android: "…folder(s) could not be attached: only files can be uploaded from this device"

The web and Android clients upload files only. Compress the folder into one file and upload that, or attach the whole folder from the desktop app.

### On web or Android: a file is too large and wasn't uploaded

The file is over 100 MB. Split it before uploading, or attach it from the desktop app on the computer running Halo.

### I can't add images while the AI is working

While the AI is replying you can keep sending text, but a queued message can't carry images. Wait for the reply to finish, or press <kbd>Esc</kbd> to stop it, then send the images.

### My file isn't in the @ menu

The @ menu lists only files in the current workspace. For files elsewhere, use **+ › Files and folders**. If you see "Indexing files…", wait for indexing to finish.

### The recognized text is wrong

Text Recognition reads only English and Simplified Chinese, and blurry images or small text cause mistakes. Use a sharper image, or switch to a model that supports image input.

## Next steps {#next-steps}

- [Conversations](/en/features/conversations): add to a request while the AI works, stop it, and answer its questions
- [Models and accounts](/en/features/models): switch to a model that can see images, or change a model's **Vision** setting
- [Files and canvas](/en/features/files-and-canvas): preview, open and find the files the AI made
