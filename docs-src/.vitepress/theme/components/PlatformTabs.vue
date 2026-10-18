<script setup lang="ts">
import { computed, onMounted, ref, useSlots, watch } from 'vue'
import { useData } from 'vitepress'

const LABELS: Record<string, { zh: string; en: string }> = {
  macos: { zh: 'macOS', en: 'macOS' },
  windows: { zh: 'Windows', en: 'Windows' },
  linux: { zh: 'Linux', en: 'Linux' },
  web: { zh: '浏览器', en: 'Browser' },
  android: { zh: 'Android', en: 'Android' },
  server: { zh: 'Halo Server', en: 'Halo Server' },
}

const KEY = 'halo-docs-platform'
const slots = useSlots()
const { page } = useData()
const english = computed(() => page.value.relativePath.startsWith('en/'))
const tabs = computed(() => Object.keys(slots).filter((name) => name in LABELS))
const active = ref('')

function detect(): string {
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return 'android'
  if (/Mac/i.test(ua)) return 'macos'
  if (/Win/i.test(ua)) return 'windows'
  if (/Linux/i.test(ua)) return 'linux'
  return ''
}

function pick(preferred: string) {
  active.value = tabs.value.includes(preferred) ? preferred : tabs.value[0]
}

// Server render shows the first tab; the browser then restores the reader's choice.
pick('')
onMounted(() => {
  pick(localStorage.getItem(KEY) || detect())
  window.addEventListener('halo-platform', (e: Event) => pick((e as CustomEvent<string>).detail))
})

function choose(name: string) {
  active.value = name
  localStorage.setItem(KEY, name)
  // Keep every tab group on the page in step with the reader's choice.
  window.dispatchEvent(new CustomEvent('halo-platform', { detail: name }))
}

watch(tabs, () => pick(active.value))
</script>

<template>
  <div class="halo-platform-tabs">
    <div class="tabs" role="tablist">
      <button
        v-for="name in tabs"
        :key="name"
        type="button"
        role="tab"
        :aria-selected="active === name"
        :class="{ active: active === name }"
        @click="choose(name)"
      >
        {{ LABELS[name][english ? 'en' : 'zh'] }}
      </button>
    </div>
    <div v-for="name in tabs" v-show="active === name" :key="name" role="tabpanel">
      <slot :name="name" />
    </div>
  </div>
</template>
