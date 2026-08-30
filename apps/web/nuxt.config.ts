import { flameRoster } from './app/data/flames'

const flameRoutes = flameRoster.map(flame => `/flames/${flame.slug}`)

export default defineNuxtConfig({
  compatibilityDate: '2026-08-30',
  devtools: { enabled: false },
  modules: ['@nuxt/content'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '异火榜 · 非官方实时视觉演绎 | YunYouJun',
      meta: [
        { name: 'description', content: '基于《斗破苍穹》原著设定的非官方实时视觉演绎。' },
        { name: 'theme-color', content: '#030608' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '异火榜 · 非官方实时视觉演绎' },
        { property: 'og:description', content: '以实时 Shader 重构异火的形、色与气息。' },
        { property: 'og:image', content: 'https://assets.yunyoujun.cn/published/flames/og-default-a0d0c90e.jpg' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
        { key: 'canonical', rel: 'canonical', href: 'https://flames.yunyoujun.cn/' },
      ],
    },
  },
  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
      },
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/flames/**': { prerender: true },
  },
  nitro: {
    prerender: {
      routes: [
        '/',
        ...flameRoutes,
      ],
      crawlLinks: true,
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: 'https://flames.yunyoujun.cn',
    },
  },
  typescript: {
    typeCheck: true,
  },
})
