---
title: "Digital Human avatar: get the same one as in Halo"
description: "Every Halo Digital Human's avatar comes from its name. Enter the name to get the same avatar and download a PNG or SVG for a chat bot or anywhere you need one."
type: how-to
audience: [beginner, office]
related: [digital-humans/create, digital-humans/channels, digital-humans/wecom-bot]
---

# Digital Human avatar

<AvatarGenerator />

## How to use it {#how-to-use}

1. Type the name the Digital Human shows in Halo. It has to match exactly, including capitals, spaces and punctuation.
2. Check that the preview is the face you see in Halo.
3. Pick a shape and a size, then click **Download PNG** (usually what chat platforms want) or **Download SVG** (for scaling up or further editing).
4. Upload the image wherever an avatar is needed, for example the bot that stands for this Digital Human on a chat platform. Whether a platform lets you set a bot's avatar, and where, depends on that platform's own screens; to connect a bot, see [Message channels overview](/en/digital-humans/channels).

Add `?name=Name` to the address of this page to open it with that name already filled in, which makes the page easy to share.

## Why it matches Halo {#why-identical}

The avatar is not picked at random and needs no connection: the name goes through a fixed calculation that decides the shape of the face, where the eyes and mouth sit, which way the face turns, and which blues from Halo's palette are used. This page uses the same calculation as Halo, so the same name gives the same avatar, and a new name gives a new one.

The name you type is processed only in your own browser and is never sent anywhere.

## Common questions {#faq}

### It differs from the avatar in Halo {#mismatch}

The usual cause is a name that is not exactly the same: an extra space, different capitals, or full-width and half-width punctuation each give a different face. Open the Digital Human in Halo and copy its name as it is. A team member's avatar comes from the member's name in the team, so use that name.

### Why does my downloaded avatar not move {#motion}

The preview looks sideways and blinks like the avatar in Halo, but the downloaded image is still. If your system has "reduce motion" turned on, the preview stays still too.

### Can different names give the same avatar {#same-face}

Occasionally. There are a few thousand different looks in total, so with many names two can collide. The same name always gives the same one.

## Open source and license {#credits}

The way the avatar is drawn is based on the open-source project [boring-avatars](https://boringavatars.com/) (MIT license, copyright boringdesigners). The palette and the blinking motion Halo uses are Halo's own.

<details>
<summary>Full MIT license text of boring-avatars</summary>

```text
MIT License

Copyright (c) 2021 boringdesigners

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

</details>

## Next steps {#next-steps}

- [Message channels overview](/en/digital-humans/channels): put a Digital Human in WeCom, Feishu or WeChat.
- [Create a Digital Human](/en/digital-humans/create): no Digital Human yet? Start here.
