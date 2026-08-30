<script setup lang="ts">
import { defaultFlame, flameCatalogBySlug } from '~/data/flames'

const route = useRoute()
const slug = computed(() => String(route.params.slug || 'purifying-lotus'))
const flame = computed(() => flameCatalogBySlug.get(slug.value) ?? defaultFlame)

useSeoMeta({
  title: () => `${flame.value.name} · 异火榜 | YunYouJun`,
  description: () => `${flame.value.name}，异火榜第${flame.value.rank}位。${flame.value.description}`,
  ogTitle: () => `${flame.value.name} · 异火榜`,
  ogDescription: () => flame.value.description,
})
</script>

<template>
  <FlameExperience :initial-slug="slug" />
</template>
