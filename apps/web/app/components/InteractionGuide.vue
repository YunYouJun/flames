<script setup lang="ts">
import type { FlameInteractionBrief } from '~/data/flames'

defineProps<{
  interactions: FlameInteractionBrief
}>()
</script>

<template>
  <aside class="interaction-guide" aria-label="交互方式">
    <div>
      <span class="gesture-mark">触</span>
      <p><strong>点按唤焰</strong><small>轻点触发一阵焰压；关闭「拖拽旋转」后可移动拨焰。</small></p>
    </div>
    <div>
      <span class="gesture-mark">按</span>
      <p><strong>长按火焰</strong><small>{{ interactions.hold }}</small></p>
    </div>
    <div>
      <span class="gesture-mark">曳</span>
      <p><strong>拖动观火</strong><small>开启旋转时拖动查看四周，蓄焰自然回落；关闭后拖动引导火流。具体演绎见「阅览设定」。</small></p>
    </div>
  </aside>
</template>
