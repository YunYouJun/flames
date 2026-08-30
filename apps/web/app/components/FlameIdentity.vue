<script setup lang="ts">
import type { FlameEntry } from '~/data/flames'

defineProps<{
  flame: FlameEntry
}>()

defineEmits<{
  showDetails: []
}>()
</script>

<template>
  <aside class="flame-identity">
    <p class="rank-label">
      {{ flame.rankLabel }}
    </p>
    <h1>{{ flame.name }}</h1>
    <p class="epithet">
      {{ flame.epithet }}
    </p>
    <button class="text-action" type="button" @click="$emit('showDetails')">
      阅览设定
      <span aria-hidden="true">↗</span>
    </button>
  </aside>
</template>
