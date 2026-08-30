<script setup lang="ts">
import type { FlameEntry } from '~/data/flames'

defineProps<{
  flame: FlameEntry
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="details-backdrop" @click.self="$emit('close')">
    <aside class="details-panel" role="dialog" aria-modal="true" :aria-labelledby="`details-${flame.slug}`">
      <button class="details-close" type="button" aria-label="关闭设定" @click="$emit('close')">
        ×
      </button>
      <p class="details-eyebrow">
        异火 {{ String(flame.rank).padStart(2, '0') }}
      </p>
      <h2 :id="`details-${flame.slug}`">
        {{ flame.name }}
      </h2>
      <section>
        <h3>设定摘要</h3>
        <p>{{ flame.description }}</p>
      </section>
      <section>
        <h3>视觉演绎</h3>
        <p>{{ flame.interpretation }}</p>
      </section>
      <section class="source-note">
        <h3>资料说明</h3>
        <p>描述为项目依据原著设定重新概括的非官方文案，不替代原作。</p>
        <a :href="flame.sourceUrl" target="_blank" rel="noreferrer">{{ flame.sourceLabel }}</a>
      </section>
    </aside>
  </div>
</template>
