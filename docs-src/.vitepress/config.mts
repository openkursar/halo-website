import { defineConfig } from 'vitepress'

const zhSidebar = [
  {
    text: '认识 Halo',
    items: [
      { text: 'Halo 是什么', link: '/guide/what-is-halo' },
      { text: '核心理念', link: '/guide/philosophy' },
      { text: '从 Claude Code 迁移', link: '/guide/from-claude-code' },
      { text: '更新日志', link: '/guide/changelog' },
    ]
  },
  {
    text: '上手指南',
    items: [
      { text: '1. 安装 Halo', link: '/getting-started/install' },
      { text: '2. 配置 AI 模型', link: '/getting-started/setup-ai' },
      { text: '3. 第一次对话', link: '/getting-started/first-chat' },
      { text: '4. 接入企业微信 Bot', link: '/getting-started/wecom-bot' },
      { text: '5. 创建更多数字人', link: '/getting-started/create-digital-human' },
      { text: '6. 配置邮箱', link: '/getting-started/email' },
    ]
  },
  {
    text: '用户手册',
    items: [
      { text: '第零章：安装与第一次打开', link: '/manual/00-install-and-first-open' },
      { text: '第一章：企微机器人配置', link: '/manual/01-wecom-bot' },
      { text: '第二章：创建和使用数字人', link: '/manual/02-digital-human' },
      { text: '第三章：用 Halo 发邮件', link: '/manual/03-email' },
      { text: '第四章：和 AI 对话基础', link: '/manual/04-chat-basics' },
      { text: '第五章：空间管理', link: '/manual/chapter05-space-management' },
      { text: '第六章：AI 浏览器', link: '/manual/chapter06-ai-browser' },
      { text: '第七章：远程访问', link: '/manual/chapter07-remote-access' },
      { text: '第八章：设置、应用商店与排障', link: '/manual/chapter08-settings-and-troubleshooting' },
    ]
  },
  {
    text: '功能详解',
    items: [
      { text: '空间', link: '/features/spaces' },
      { text: 'AI 浏览器', link: '/features/ai-browser' },
      { text: '远程访问', link: '/features/remote-access' },
      { text: 'MCP 服务器', link: '/features/mcp' },
      { text: 'Skills 技能', link: '/features/skills' },
      { text: '命令', link: '/features/commands' },
    ]
  },
  {
    text: '数字人开发指南',
    items: [
      { text: '第一章：快速上手', link: '/digital-humans/guide-01-quickstart' },
      { text: '第二章：改造一个数字人', link: '/digital-humans/guide-02-build' },
      { text: '第三章：参考手册', link: '/digital-humans/guide-03-reference' },
    ]
  },
  {
    text: '数字人进阶',
    items: [
      { text: '数字人概述', link: '/digital-humans/overview' },
      { text: '数字人商店', link: '/digital-humans/store' },
      { text: '生产级数字人制作', link: '/digital-humans/production-guide' },
      { text: '数字人协作与通信', link: '/digital-humans/collaboration' },
      { text: '企微 Bot 进阶玩法', link: '/digital-humans/wecom-bot-features' },
      { text: '连接个人微信', link: '/digital-humans/personal-wechat' },
      { text: 'DHP 协议', link: '/digital-humans/dhp-protocol' },
    ]
  },
  {
    text: '安全与权限',
    items: [
      { text: '权限控制', link: '/advanced/security' },
    ]
  },
  {
    text: '常见问题',
    items: [
      { text: 'FAQ', link: '/troubleshooting/faq' },
      { text: 'API 错误码', link: '/troubleshooting/api-errors' },
    ]
  },
  {
    text: '更多',
    items: [
      { text: '更新日志', link: '/guide/changelog' },
      { text: '配置路径', link: '/advanced/config-paths' },
      { text: '联系我们', link: '/contact' },
    ]
  },
]

const enSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'What is Halo', link: '/en/guide/what-is-halo' },
      { text: 'Philosophy', link: '/en/guide/philosophy' },
    ]
  },
  {
    text: 'Quick Start',
    items: [
      { text: 'Installation', link: '/en/guide/installation' },
      { text: 'Your First Conversation', link: '/en/guide/quickstart' },
    ]
  },
  {
    text: 'Features',
    items: [
      { text: 'Spaces', link: '/en/features/spaces' },
      { text: 'AI Browser', link: '/en/features/ai-browser' },
      { text: 'Remote Access', link: '/en/features/remote-access' },
      { text: 'Image Input', link: '/en/features/image-input' },
      { text: 'MCP Servers', link: '/en/features/mcp' },
      { text: 'Skills', link: '/en/features/skills' },
      { text: 'Commands', link: '/en/features/commands' },
    ]
  },
  {
    text: 'Digital Humans',
    items: [
      { text: 'Overview', link: '/en/digital-humans/overview' },
      { text: 'Store', link: '/en/digital-humans/store' },
      { text: 'Create', link: '/en/digital-humans/create' },
      { text: 'Collaboration', link: '/en/digital-humans/collaboration' },
      { text: 'DHP Protocol', link: '/en/digital-humans/dhp-protocol' },
    ]
  },
  {
    text: 'Troubleshooting',
    items: [
      { text: 'Common Errors', link: '/en/troubleshooting/common-errors' },
      { text: 'API Error Codes', link: '/en/troubleshooting/api-errors' },
    ]
  },
  {
    text: 'Advanced',
    items: [
      { text: 'Config Paths', link: '/en/advanced/config-paths' },
      { text: 'Best Practices', link: '/en/advanced/best-practices' },
    ]
  },
  {
    text: 'Contact',
    items: [
      { text: 'Community & Support', link: '/en/contact' },
    ]
  },
]

export default defineConfig({
  base: '/docs/',
  title: 'Halo',
  description: 'Halo 官方文档',

  appearance: 'light',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/docs/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', rel: 'stylesheet' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ],

  locales: {
    root: {
      lang: 'zh-CN',
      label: '中文',
      themeConfig: {
        nav: [
          { text: '文档', link: '/guide/what-is-halo' },
          { text: '用户手册', link: '/manual/00-install-and-first-open' },
          { text: '数字人', link: '/digital-humans/overview' },
          { text: '常见问题', link: '/troubleshooting/common-errors' },
        ],
        sidebar: zhSidebar,
      }
    },
    en: {
      lang: 'en-US',
      label: 'English',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/en/guide/what-is-halo' },
          { text: 'Digital Humans', link: '/en/digital-humans/overview' },
          { text: 'Troubleshooting', link: '/en/troubleshooting/common-errors' },
        ],
        sidebar: enSidebar,
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Halo',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/openkursar/hello-halo' }
    ],

    footer: {
      message: '基于 MIT 协议开源',
      copyright: '© 2025 Halo · <a href="https://hello-halo.cc" target="_blank">hello-halo.cc</a>'
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '未找到相关结果',
                resetButtonTitle: '清除搜索',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
              }
            }
          }
        }
      }
    },

    editLink: {
      pattern: 'https://github.com/openkursar/halo-website/edit/main/docs-src/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: { dateStyle: 'short' }
    },
  }
})
