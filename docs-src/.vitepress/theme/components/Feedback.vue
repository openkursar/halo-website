<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, theme, frontmatter } = useData()
const route = useRoute()

const english = computed(() => page.value.relativePath.startsWith('en/'))
const isPublic = computed(() => theme.value.haloEdition !== 'internal')
const show = computed(() => !page.value.isNotFound && frontmatter.value.layout !== 'home' && frontmatter.value.layout !== 'page')
const answer = ref<'' | 'yes' | 'no'>('')

watch(() => route.path, () => (answer.value = ''))

const t = computed(() =>
  english.value
    ? { ask: 'Was this page helpful?', yes: 'Yes', no: 'No', thanks: 'Thanks for the feedback.', issue: 'Tell us what was missing on GitHub' }
    : { ask: '这篇文档有帮助吗？', yes: '有帮助', no: '没帮助', thanks: '谢谢反馈。', issue: '在 GitHub 上告诉我们缺了什么' }
)

const issueUrl = computed(() => {
  const title = encodeURIComponent(`[docs-feedback] ${page.value.relativePath}`)
  return `https://github.com/openkursar/halo-website/issues/new?labels=docs-feedback&title=${title}`
})

function send(value: 'yes' | 'no') {
  answer.value = value
  // Public build only, and no personal data: page path and the answer.
  if (!isPublic.value || typeof window === 'undefined') return
  const w = window as any
  w.gtag?.('event', 'docs_feedback', { page_path: route.path, value })
  w._hmt?.push(['_trackEvent', 'docs', 'feedback', route.path, value === 'yes' ? 1 : 0])
}
</script>

<template>
  <div v-if="show" class="halo-feedback">
    <template v-if="!answer">
      <span>{{ t.ask }}</span>
      <button type="button" @click="send('yes')">{{ t.yes }}</button>
      <button type="button" @click="send('no')">{{ t.no }}</button>
    </template>
    <template v-else>
      <span>{{ t.thanks }}</span>
      <a v-if="answer === 'no' && isPublic" :href="issueUrl" target="_blank" rel="noopener">{{ t.issue }}</a>
    </template>
  </div>
</template>
