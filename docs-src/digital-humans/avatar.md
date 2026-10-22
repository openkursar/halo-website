---
title: 生成数字人头像：输入名字，得到和 Halo 里一样的头像
description: Halo 里每位数字人的头像都由它的名字生成。输入数字人的名字，就能在这里得到同一张头像，并下载 PNG 或 SVG，用在聊天平台里的机器人等需要头像图片的地方。
type: how-to
audience: [beginner, office]
related: [digital-humans/create, digital-humans/channels, digital-humans/wecom-bot]
---

# 数字人头像

<AvatarGenerator />

## 怎么用 {#how-to-use}

1. 在输入框里填上数字人在 Halo 里显示的名字。要完全一致，包括大小写、空格和标点。
2. 在预览里确认是你在 Halo 里见到的那张脸。
3. 选择形状和尺寸，点 **下载 PNG**（上传到聊天平台通常用这个）或 **下载 SVG**（需要放大或再加工时用）。
4. 在需要头像的地方上传这张图。比如聊天平台里这位数字人对应的机器人：能不能设置头像、在哪里设置，以各平台自己的界面为准，机器人怎么接入见 [消息通道概览](/digital-humans/channels)。

打开本页时在地址后面加上 `?name=名字`，输入框里就会预先填好这个名字，方便把链接发给别人。

## 为什么和 Halo 里一样 {#why-identical}

头像不是随机挑的，也不用联网：名字经过一套固定的计算，决定脸的形状、眼睛和嘴的位置、脸朝哪个方向，再从 Halo 的蓝色系里取色。这里用的计算和 Halo 里一致，所以名字相同，头像就相同；名字改了，头像也会跟着变。

你输入的名字只在你自己的浏览器里处理，不会发送到任何地方。

## 常见问题 {#faq}

### 和 Halo 里的头像不一样 {#mismatch}

最常见的原因是名字不完全一致：多一个空格、大小写不同、全角和半角符号混用，都会得到另一张脸。可以在 Halo 里打开这位数字人，把名字原样复制过来。团队成员的头像按成员在团队里的名字生成，要用这个名字。

### 为什么我的头像不会动 {#motion}

页面上的预览会像 Halo 里一样看向两侧、眨眼，下载的图片是静态的。如果系统开启了「减少动态效果」，预览也不会动。

### 不同的名字会得到同样的头像吗 {#same-face}

偶尔会。头像一共有几千种不同的样子，名字多了就可能撞上。同一个名字永远只会得到同一张。

## 开源与许可 {#credits}

头像的绘制方法基于开源项目 [boring-avatars](https://boringavatars.com/)（MIT 许可，版权归 boringdesigners 所有）。Halo 使用的配色和眨眼的动态效果由 Halo 自己制作。

<details>
<summary>boring-avatars 的 MIT 许可全文</summary>

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

## 下一步 {#next-steps}

- [消息通道概览](/digital-humans/channels)：让数字人出现在企业微信、飞书或微信里。
- [创建数字人](/digital-humans/create)：还没有数字人？从这里开始。
