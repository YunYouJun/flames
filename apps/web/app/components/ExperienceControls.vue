<script setup lang="ts">
import type { FlameQuality } from '@yunyoujun/flame-engine'

defineProps<{
  muted: boolean
  paused: boolean
  quality: FlameQuality
}>()

defineEmits<{
  'togglePause': []
  'toggleSound': []
  'update:quality': [value: FlameQuality]
}>()
</script>

<template>
  <div class="experience-controls">
    <button type="button" :aria-pressed="paused" @click="$emit('togglePause')">
      <span aria-hidden="true">{{ paused ? '▶' : 'Ⅱ' }}</span>
      {{ paused ? '唤醒' : '静止' }}
    </button>
    <button type="button" :aria-pressed="!muted" @click="$emit('toggleSound')">
      <span aria-hidden="true">{{ muted ? '○' : '◉' }}</span>
      {{ muted ? '无声' : '有声' }}
    </button>
    <label>
      <span>画质</span>
      <select :value="quality" @change="$emit('update:quality', ($event.target as HTMLSelectElement).value as FlameQuality)">
        <option value="high">精细</option>
        <option value="balanced">均衡</option>
        <option value="lite">轻量</option>
      </select>
    </label>
  </div>
</template>
