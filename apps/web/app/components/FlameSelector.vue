<script setup lang="ts">
import type { FlameEntry } from '~/data/flames'

defineProps<{
  flames: FlameEntry[]
  activeSlug: string
}>()

defineEmits<{
  select: [slug: string]
}>()
</script>

<template>
  <nav class="flame-selector" aria-label="异火选择">
    <button
      v-for="flame in flames"
      :key="flame.slug"
      type="button"
      class="flame-seat"
      :class="{ 'is-active': flame.slug === activeSlug }"
      :aria-current="flame.slug === activeSlug ? 'page' : undefined"
      @click="$emit('select', flame.slug)"
    >
      <span class="seat-rank">{{ String(flame.rank).padStart(2, '0') }}</span>
      <span class="seat-name">{{ flame.name }}</span>
      <i aria-hidden="true" />
    </button>
  </nav>
</template>
