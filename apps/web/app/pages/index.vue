<script setup lang="ts">
import { flameRosterBySlug } from '~/data/flames'

const featuredFlame = flameRosterBySlug.get('purifying-lotus')!

useHead({
  title: '异火榜 · 非官方实时视觉演绎 | YunYouJun',
  link: [{ key: 'canonical', rel: 'canonical', href: 'https://flames.yunyoujun.cn/' }],
})
</script>

<template>
  <FlameExperience :flame="featuredFlame" />
</template>
