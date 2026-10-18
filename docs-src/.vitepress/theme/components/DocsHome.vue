<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { data } from '../home.data.mts'

type Locale = 'zh' | 'en'

const { page } = useData()
const locale = computed<Locale>(() => (page.value.relativePath.startsWith('en/') ? 'en' : 'zh'))
const isPublic = data.edition === 'public'

const COPY = {
  zh: {
    title: 'Halo 文档',
    lead: 'Halo 是开源的 AI 桌面工作站。这里有安装与入门、每个功能的用法、数字人与团队，以及开发者用的 HTTP API。',
    search: '搜索文档',
    tasksTitle: '我想……',
    rolesTitle: '按你的角色开始',
    askTitle: '直接问 Halo',
    askText:
      'Halo 自己会读这些文档。在 Halo 里直接说出你想做的事，比如「怎么接入飞书？」或「帮我建一个每天 9 点汇总新闻的数字人」，它会查文档、问清楚，再动手。',
    askLink: '看看怎么问',
    newsTitle: (v: string) => `${v} 新功能`,
    newsLink: '查看完整更新日志',
    casesTitle: '场景与对比',
    help: '帮助中心',
    changelog: '更新日志',
    glossary: '术语表',
    contact: '联系我们',
  },
  en: {
    title: 'Halo Docs',
    lead: "Halo is an open-source desktop AI workstation. Here you'll find installation and first steps, how each feature works, Digital Humans and teams, and the HTTP API for developers.",
    search: 'Search the docs',
    tasksTitle: 'I want to…',
    rolesTitle: 'Start from your role',
    askTitle: 'Just ask Halo',
    askText:
      'Halo reads these docs itself. In Halo, just say what you want to do, for example "How do I connect Feishu?" or "Create a Digital Human that sums up the news every day at 9", and it looks things up, asks what it needs, then does it.',
    askLink: 'See how to ask',
    newsTitle: (v: string) => `What's new in ${v}`,
    newsLink: 'Read the full changelog',
    casesTitle: 'Use cases & comparisons',
    help: 'Help center',
    changelog: 'Changelog',
    glossary: 'Glossary',
    contact: 'Contact',
  },
}

const TASKS: { slug: string; hash?: string; zh: string; en: string }[] = [
  { slug: 'getting-started/install', zh: '安装 Halo', en: 'Install Halo' },
  { slug: 'getting-started/setup-ai', zh: '连接 AI 模型', en: 'Connect an AI model' },
  { slug: 'getting-started/first-chat', zh: '完成第一个任务', en: 'Finish my first task' },
  { slug: 'digital-humans/create', zh: '创建每天自动运行的数字人', en: 'Create a Digital Human that runs every day' },
  { slug: 'digital-humans/channels', zh: '接入企业微信或飞书', en: 'Connect WeCom or Feishu' },
  { slug: 'digital-humans/collaboration', zh: '一句话组建团队', en: 'Build a team with one sentence' },
  { slug: 'features/knowledge-base', zh: '让 AI 基于我的文档回答', en: 'Let the AI answer from my documents' },
  { slug: 'developers/quickstart', zh: '调用 Halo API', en: 'Call the Halo API' },
]

const ROLES: { main: string; links: string[]; zh: [string, string]; en: [string, string] }[] = [
  {
    main: 'getting-started/',
    links: ['getting-started/install', 'getting-started/setup-ai', 'getting-started/first-chat'],
    zh: ['我是新手', '从安装到完成第一个任务，每一步都写明你会看到什么。'],
    en: ["I'm new to Halo", "From installing to finishing your first task, with what you'll see at each step."],
  },
  {
    main: 'digital-humans/overview',
    links: ['digital-humans/create', 'digital-humans/triggers', 'digital-humans/channels'],
    zh: ['让数字人定时干活', '让数字人按计划工作，在企业微信、飞书或微信里接活和汇报。'],
    en: ['Put Digital Humans on duty', 'Have Digital Humans work on a schedule, take work and report back in WeCom, Feishu or WeChat.'],
  },
  {
    main: 'digital-humans/collaboration',
    links: ['digital-humans/team-workbench', 'digital-humans/saved-teams', 'digital-humans/cross-computer-teams'],
    zh: ['组建数字人团队', '多位数字人分工、交接、交付结果，同事也能带着自己的数字人加入。'],
    en: ['Build a Digital Human team', 'Several Digital Humans split the work, hand it over and deliver; colleagues can join with their own.'],
  },
  {
    main: 'developers/',
    links: ['guide/from-claude-code', 'features/code-review', 'developers/api/'],
    zh: ['开发者', '从 Claude Code 或 Codex 过来，审阅 AI 的改动，或者用 HTTP API 集成 Halo。'],
    en: ['Developers', "Coming from Claude Code or Codex, reviewing the AI's changes, or integrating Halo over the HTTP API."],
  },
  {
    main: 'advanced/',
    links: ['advanced/security', 'advanced/deployment', 'server/'],
    zh: ['IT 与管理员', '安全与数据流、批量部署、模型网关、更新，以及服务器版 Halo Server。'],
    en: ['IT and admins', 'Security and data flow, rollout, model gateways, updates, and Halo Server.'],
  },
]

const t = computed(() => COPY[locale.value])
const names = computed(() => data.pages[locale.value])
const has = (slug: string) => slug in names.value

/** Site link for an IA slug in the current locale (pages end in .html, folders in /). */
function href(slug: string, hash = ''): string {
  const path = (locale.value === 'en' ? '/en/' : '/') + (slug.endsWith('/') ? slug : `${slug}.html`)
  return withBase(path) + (hash ? `#${hash}` : '')
}

const tasks = computed(() => TASKS.filter((x) => has(x.slug)))
const roles = computed(() =>
  ROLES.map((r) => {
    const existing = r.links.filter(has)
    // Until a section hub exists, the card's title links to its first page instead.
    const main = has(r.main) ? r.main : existing[0]
    return { main, links: existing.filter((l) => l !== main), title: r[locale.value][0], text: r[locale.value][1] }
  }).filter((r) => r.main)
)
const news = computed(() => (data.whatsNew ? { version: data.whatsNew.version, anchor: data.whatsNew.anchor, items: data.whatsNew.items[locale.value] } : null))
const cases = computed(() => data.useCases[locale.value])
const footer = computed(() =>
  [
    { slug: 'troubleshooting/', text: t.value.help },
    { slug: 'guide/changelog', text: t.value.changelog },
    { slug: 'guide/glossary', text: t.value.glossary },
    ...(isPublic ? [{ slug: 'contact', text: t.value.contact }] : []),
  ].filter((x) => has(x.slug))
)

function openSearch() {
  document.querySelector<HTMLButtonElement>('#local-search button, .VPNavBarSearch button')?.click()
}
</script>

<template>
  <div class="halo-home">
    <section class="hero">
      <h1>{{ t.title }}</h1>
      <p class="lead">{{ t.lead }}</p>
      <button type="button" class="search" @click="openSearch">
        <span class="vpi-search" aria-hidden="true"></span>{{ t.search }}
      </button>
    </section>

    <section v-if="tasks.length">
      <h2>{{ t.tasksTitle }}</h2>
      <ul class="tasks">
        <li v-for="task in tasks" :key="task.slug">
          <a :href="href(task.slug, task.hash)">{{ task[locale] }}</a>
        </li>
      </ul>
    </section>

    <section v-if="roles.length">
      <h2>{{ t.rolesTitle }}</h2>
      <div class="roles">
        <div v-for="role in roles" :key="role.main" class="role">
          <h3><a :href="href(role.main)">{{ role.title }}</a></h3>
          <p>{{ role.text }}</p>
          <ul>
            <li v-for="slug in role.links" :key="slug">
              <a :href="href(slug)">{{ names[slug] }}</a>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="ask">
      <h2>{{ t.askTitle }}</h2>
      <p>{{ t.askText }}</p>
      <a v-if="has('getting-started/first-chat')" :href="href('getting-started/first-chat', 'ask-halo')">{{ t.askLink }} →</a>
    </section>

    <section v-if="news && news.items.length">
      <h2>{{ t.newsTitle(news.version) }}</h2>
      <div class="news">
        <div v-for="(item, i) in news.items" :key="i" class="news-item">
          <strong v-if="item.title">{{ item.title }}</strong>
          <span>{{ item.text }}</span>
        </div>
      </div>
      <a v-if="has('guide/changelog')" :href="href('guide/changelog', news.anchor)">{{ t.newsLink }} →</a>
    </section>

    <section v-if="cases.length">
      <h2>{{ t.casesTitle }}</h2>
      <ul class="cases">
        <li v-for="slug in cases" :key="slug">
          <a :href="href(slug)">{{ names[slug] }}</a>
        </li>
      </ul>
    </section>

    <nav v-if="footer.length" class="home-footer">
      <a v-for="item in footer" :key="item.slug" :href="href(item.slug)">{{ item.text }}</a>
      <a v-if="isPublic" href="https://github.com/openkursar/hello-halo" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </div>
</template>
