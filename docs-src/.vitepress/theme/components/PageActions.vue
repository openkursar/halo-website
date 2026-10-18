<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'

const { page, theme, frontmatter } = useData()

const english = computed(() => page.value.relativePath.startsWith('en/'))
const isPublic = computed(() => theme.value.haloEdition !== 'internal')
const show = computed(() => !page.value.isNotFound && frontmatter.value.layout !== 'home' && frontmatter.value.layout !== 'page')

// Every page has a Markdown twin at the same path (written at build time).
const mdPath = computed(() => withBase('/' + page.value.relativePath))
const mdUrl = computed(() => (typeof window === 'undefined' ? mdPath.value : new URL(mdPath.value, window.location.origin).href))

const t = computed(() =>
  english.value
    ? { copy: 'Copy page', copied: 'Copied', more: 'More', view: 'View as Markdown', chatgpt: 'Open in ChatGPT', claude: 'Open in Claude', halo: 'Ask in Halo', haloDone: 'Copied. Paste it into Halo.', failed: 'Not available in this preview' }
    : { copy: '复制本页', copied: '已复制', more: '更多', view: '查看 Markdown', chatgpt: '在 ChatGPT 中打开', claude: '在 Claude 中打开', halo: '在 Halo 里问', haloDone: '已复制，粘贴到 Halo 的输入框', failed: '预览环境中不可用' }
)

const open = ref(false)
const toast = ref('')

function flash(message: string) {
  toast.value = message
  setTimeout(() => (toast.value = ''), 2500)
}

async function copyPage() {
  try {
    const res = await fetch(mdPath.value)
    if (!res.ok) throw new Error(String(res.status))
    await navigator.clipboard.writeText(await res.text())
    flash(t.value.copied)
  } catch {
    flash(t.value.failed)
  }
}

function prompt(): string {
  return english.value
    ? `Read ${mdUrl.value} and answer my question about Halo: `
    : `请阅读 ${mdUrl.value}，然后回答我关于 Halo 的问题：`
}

function viewMarkdown() {
  window.open(mdPath.value, '_blank', 'noopener')
  open.value = false
}

function openIn(target: 'chatgpt' | 'claude') {
  const q = encodeURIComponent(prompt())
  window.open(target === 'chatgpt' ? `https://chatgpt.com/?q=${q}` : `https://claude.ai/new?q=${q}`, '_blank', 'noopener')
  open.value = false
}

async function askInHalo() {
  const title = String(frontmatter.value.title ?? '').split(/[：:]/)[0]
  const text = english.value ? `About "${title}" in Halo, I want to ask: ` : `关于 Halo 的「${title}」，我想问：`
  try {
    await navigator.clipboard.writeText(text)
    flash(t.value.haloDone)
  } catch {
    flash(t.value.failed)
  }
  open.value = false
}
</script>

<template>
  <div v-if="show" class="halo-page-actions">
    <span v-if="toast" class="toast">{{ toast }}</span>
    <button type="button" @click="copyPage">{{ t.copy }}</button>
    <div class="menu">
      <button type="button" :aria-expanded="open" @click="open = !open">{{ t.more }} ▾</button>
      <div v-if="open" class="menu-list" @mouseleave="open = false">
        <button type="button" @click="viewMarkdown">{{ t.view }}</button>
        <button v-if="isPublic" type="button" @click="openIn('chatgpt')">{{ t.chatgpt }}</button>
        <button v-if="isPublic" type="button" @click="openIn('claude')">{{ t.claude }}</button>
        <button type="button" @click="askInHalo">{{ t.halo }}</button>
      </div>
    </div>
  </div>
</template>
