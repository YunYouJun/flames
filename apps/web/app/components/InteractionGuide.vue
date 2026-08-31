<script setup lang="ts">
import type { FlameInteractionBrief } from '~/data/flames'

defineProps<{
  interactions: FlameInteractionBrief
}>()
</script>

<template>
  <aside class="interaction-guide" aria-label="交互方式">
    <div>
      <span class="gesture-mark">移</span>
      <p><strong>移动指针</strong><small>{{ interactions.pointer }}</small></p>
    </div>
    <div>
      <span class="gesture-mark">按</span>
      <p><strong>长按火焰</strong><small>{{ interactions.hold }}</small></p>
    </div>
    <div>
      <span class="gesture-mark">曳</span>
      <p><strong>拖拽引导</strong><small>{{ interactions.drag }}</small></p>
    </div>
  </aside>
</template>
