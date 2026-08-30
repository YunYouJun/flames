<script setup lang="ts">
import { flameRosterBySlug } from '~/data/flames'

definePageMeta({
  validate: route => typeof route.params.slug === 'string' && flameRosterBySlug.has(route.params.slug),
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || 'purifying-lotus'))
const flame = computed(() => flameRosterBySlug.get(slug.value)!)
const isApproved = computed(() => flame.value.visual.state === 'approved')

useSeoMeta({
  title: () => `${flame.value.name} · 异火榜 | YunYouJun`,
  description: () => `${flame.value.name}，异火榜第${flame.value.rank}位。${flame.value.summary}`,
  ogTitle: () => `${flame.value.name} · 异火榜`,
  ogDescription: () => flame.value.summary,
  robots: () => isApproved.value ? 'index, follow' : 'noindex, nofollow',
})

useHead({
  link: [{
    key: 'canonical',
    rel: 'canonical',
    href: () => `https://flames.yunyoujun.cn/flames/${slug.value}`,
  }],
})
</script>

<template>
  <FlameExperience :flame="flame" />
</template>
