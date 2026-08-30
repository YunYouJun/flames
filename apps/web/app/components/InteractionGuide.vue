<script setup lang="ts">
import type { FlameKernelId } from '@yunyoujun/flame-engine'

const props = defineProps<{
  kernel: FlameKernelId
}>()

const reactions: Record<FlameKernelId, [string, string, string]> = {
  void: ['焰身追随灵识', '吞噬核心显现', '虚空涡流收束'],
  lotus: ['焰心追随灵识', '莲瓣缓缓盛放', '妖火随势偏移'],
  cold: ['冷焰追随灵识', '冷热边界外扩', '紊流焰舌回卷'],
}

function reactionAt(index: 0 | 1 | 2) {
  return reactions[props.kernel][index]
}
</script>

<template>
  <aside class="interaction-guide" aria-label="交互方式">
    <div>
      <span class="gesture-mark">移</span>
      <p><strong>移动指针</strong><small>{{ reactionAt(0) }}</small></p>
    </div>
    <div>
      <span class="gesture-mark">按</span>
      <p><strong>长按火焰</strong><small>{{ reactionAt(1) }}</small></p>
    </div>
    <div>
      <span class="gesture-mark">曳</span>
      <p><strong>拖拽引导</strong><small>{{ reactionAt(2) }}</small></p>
    </div>
  </aside>
</template>
