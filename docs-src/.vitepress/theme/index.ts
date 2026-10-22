import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import PageActions from './components/PageActions.vue'
import Feedback from './components/Feedback.vue'
import PlatformTabs from './components/PlatformTabs.vue'
import Shortcut from './components/Shortcut.vue'
import DocsHome from './components/DocsHome.vue'
import AvatarGenerator from './components/AvatarGenerator.vue'
import './custom.css'

// Adds a copy button to the prompt (first blockquote) of every "Just tell Halo" block.
function addPromptCopyButtons() {
  const english = location.pathname.startsWith('/docs/en/')
  document.querySelectorAll<HTMLElement>('.vp-doc .custom-block.say > blockquote:first-of-type').forEach((quote) => {
    if (quote.querySelector('.say-copy')) return
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'say-copy'
    button.textContent = english ? 'Copy' : '复制'
    button.addEventListener('click', async () => {
      const text = Array.from(quote.querySelectorAll('p'))
        .map((p) => p.innerText.trim())
        .join('\n')
      await navigator.clipboard.writeText(text)
      button.textContent = english ? 'Copied' : '已复制'
      setTimeout(() => (button.textContent = english ? 'Copy' : '复制'), 2000)
    })
    quote.appendChild(button)
  })
}

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PageActions),
      'doc-footer-before': () => h(Feedback),
    })
  },
  enhanceApp({ app }) {
    app.component('PlatformTabs', PlatformTabs)
    app.component('Shortcut', Shortcut)
    app.component('DocsHome', DocsHome)
    app.component('AvatarGenerator', AvatarGenerator)
  },
  setup() {
    if (typeof window === 'undefined') return
    const route = useRoute()
    watch(
      () => route.path,
      () => nextTick(addPromptCopyButtons),
      { immediate: true }
    )
  },
} satisfies Theme
