---
title: "Publish to the Store: Digital Humans and skills"
description: "Publish a Digital Human or skill to the Halo Store: fill in the release info, pass the pre-flight checks, manage versions, and export packages to share by hand."
type: how-to
audience: [developer]
---

# Publish to the Store

Publish a Digital Human or skill you built to the Store so others can install it in one click. You publish it yourself in Halo; Halo's assistant cannot do it for you, because publishing is public and a submission cannot be taken back.

## Before you start {#before-you-start}

- A Digital Human or skill that is installed and works the way you want. You can also publish a file directly: `.zip`, `.dhpkg`, `.yaml` or a folder for a Digital Human; `.md`, `.zip` or a folder for a skill.
- No API keys, tokens or other secrets in the Digital Human's system prompt or the skill's files: the pre-flight checks block them.

::: info Builds can differ
The **Publish App** button appears in the Store only when this Halo build has a publish target. Where a submission goes also depends on the build; see [where it goes](#targets). A Halo provided by your company may show different options.
:::

## Steps {#steps}

1. Open the **Store** and click **Publish App**. You can also open a Digital Human, click **⋮ › Share** at the top right, or click the share icon on a skill card, and then click **Share to Store**.
2. Under **What would you like to publish?**, choose **Digital Human** or **Skill**.
3. Under **Publish source**, choose **From installed** and pick the item, or choose **Import** and drop a file or folder.
4. Fill in the release info:
   - **Author**: becomes your namespace in the Store, so listings look like `author/app-name`. It must contain letters or digits.
   - **App name** and **Scene category**: required.
   - **App description** and **Tags**: optional, up to 8 tags.
   - Under **Release info**, the **Version** (required) and **Release notes**.
5. For a Digital Human, check the **Associated Skills**: skills marked **From store** are not packed; skills the Store does not have are packed into the package, and turning on **List separately** also publishes such a skill as its own Skill listing; a skill marked **Missing** blocks publishing until you import it.
6. Resolve what the pre-flight checks report and click **Publish to Store**.

::: done
**Submitted successfully** means the submission went through. **View** opens **My Publications** (only in stores that support it).
:::

What you fill in here changes only the published version, never the Digital Human or skill installed on your computer. If you close the dialog halfway, your draft comes back the next time you open it.

## Where it goes {#targets}

The Halo build decides the publish target; you neither need to nor can choose it:

| Build | After you click "Publish to Store" |
|---|---|
| Community edition | Halo packs the item as a `.dhpkg` and opens GitHub's new-issue page in the browser on the computer running Halo. You sign in to GitHub, attach the package file to the issue and submit it; maintainers review it before it is listed. It does not appear in the Store automatically. |
| A company or self-hosted store | The submission goes to the store service for review, which can approve it, keep it under review or reject it. When the store is tied to accounts, you **Sign in to publish** first. |
| A build that only saves files | A save dialog writes `<slug>-<version>.dhpkg` to your computer, with no network involved. |

## Version rules {#versions}

- The **Version** is pre-filled: your local version when it is already higher than the published one, otherwise the published version with its last segment raised by one.
- A new version must be higher than the published one, or you cannot submit.
- Renaming a Digital Human gives it a new Store address, so it counts as a first-time publish.
- Chinese names are turned into pinyin for the Store address.

## Pre-flight checks {#preflight}

Halo checks each item before submitting. These block publishing:

- A possible secret: an Anthropic, OpenAI, AWS or Google API key, a GitHub or Slack token, or a private key in the Digital Human's system prompt or the skill's files. Remove it and publish again.
- No name.
- A version that was not raised.
- A missing associated skill.

An empty app description only shows a warning.

## My Publications {#my-publications}

In stores tied to accounts, **Store › Mine** lists what you have published, with the statuses **Listed**, **Taken down**, **Removed by ops** and **Rejected** (with the reason). You can **Publish new version**, **Resubmit** a rejected item, **Take down** a listing, or **Relist** one you took down yourself. A listing removed by ops cannot be restored by you.

## Export a package to share by hand {#export}

You can also send a package file to someone directly, without the Store:

- **Digital Human**: on the Digital Human's page click **⋮ › Share › Export** to get `<slug>-<version>.dhpkg`.
- **Skill**: in the share dialog of a skill card click **Export** to get `<slug>-<version>.zip`, with `SKILL.md` at the root of the archive.

Export is available in the desktop app only. The recipient imports a Digital Human package under **Digital Humans › Create Digital Human › Import**.

## Next steps {#next-steps}

- [Store](/en/digital-humans/store): browse and install Digital Humans and skills from the Store
- [API: Store](/en/developers/api/store): browse, install and update Store items through the API
