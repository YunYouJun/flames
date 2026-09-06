<script setup lang="ts">
import type { StageGesturePhase } from '../utils/stage-gesture'
import { Toggle } from 'reka-ui'

const props = defineProps<{ limit: number, automatic: boolean, paused: boolean, phase: StageGesturePhase }>()
const emit = defineEmits<{ manual: [], toggleAuto: [], reset: [] }>()
const angle = defineModel<number>('angle', { required: true })
const dragRotation = defineModel<boolean>('dragRotation', { required: true })
const caption = computed(() => {
  if (props.phase === 'pending')
    return { title: '按住蓄焰', detail: props.limit === 180 && dragRotation.value ? '拖动即可观火' : '拖动即可拨焰' }
  if (props.phase === 'holding')
    return { title: '蓄焰中', detail: '松手自然回落' }
  if (props.phase === 'dragging') {
    return props.limit === 180 && dragRotation.value
      ? { title: '环视中', detail: '蓄焰自然回落' }
      : { title: '拨焰中', detail: '松手自然回落' }
  }
  return { title: props.automatic ? '环观中' : '点按唤焰', detail: '长按蓄焰' }
})
</script>

<template>
  <div class="orbit" :data-gesture="phase" role="group" aria-label="环绕查看">
    <div class="orbit__actions">
      <Toggle v-if="limit === 180" v-model="dragRotation" class="orbit__button" aria-label="拖拽旋转" :title="dragRotation ? '点按唤焰、长按蓄焰；拖动观火时蓄焰自然回落，关闭后拖动拨焰' : '点按唤焰、长按蓄焰、拖动拨焰'">
        <span aria-hidden="true">◇</span> 拖拽旋转
      </Toggle>
      <Toggle v-if="limit === 180" class="orbit__button" :model-value="automatic" :disabled="paused" aria-label="自动环绕" @update:model-value="emit('toggleAuto')">
        <span class="orbit__auto" :class="{ 'is-running': automatic }" aria-hidden="true">↻</span> 自动环绕
      </Toggle>
      <button class="orbit__button orbit__reset" type="button" :disabled="angle === 0 && !automatic" @click="emit('reset')">
        复位
      </button>
    </div>
    <div class="orbit__dial">
      <span class="orbit__caption" role="status" aria-live="polite" aria-atomic="true">
        <span>{{ caption.title }}</span>
        <small>{{ caption.detail }}</small>
      </span>
      <div class="orbit__scale">
        <span class="orbit__ticks" aria-hidden="true" />
        <input v-model.number="angle" class="orbit__range" type="range" :min="-limit" :max="limit" step="1" aria-label="左右环绕角度" :aria-valuetext="`${Math.round(angle)} 度`" @pointerdown="emit('manual')" @keydown="emit('manual')" @input="emit('manual')">
      </div>
      <span class="orbit__angle" aria-hidden="true">{{ Math.round(angle) }}°</span>
    </div>
  </div>
</template>

<style scoped>
.orbit {
  --bronze: #bc9b60;
  position: absolute;
  top: 0;
  left: 50%;
  z-index: 5;
  width: min(19.5rem, calc(100% - 1rem));
  transform: translateX(-50%);
  padding: 0.25rem 0.5rem;
  border: 1px solid #bc9b6042;
  border-radius: 3px;
  background: repeating-linear-gradient(112deg, #d5b97b04 0 1px, transparent 1px 5px), linear-gradient(145deg, #25251ff2, #101514f2);
  box-shadow: inset 0 0 0 3px #090e0d, 0 5px 18px #0003;
  color: #bcb19a;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}
.orbit__actions { display: flex; align-items: center; gap: 0.25rem; }
.orbit__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex: 1;
  min-height: 2.75rem;
  padding: 0 0.4rem;
  border: 1px solid transparent;
  border-radius: 2px;
  color: inherit;
  font: inherit;
  white-space: nowrap;
  background: transparent;
  cursor: pointer;
}
.orbit__button[data-state='on'] {
  color: #f3d7a0;
  border-color: #bc9b6050;
  background: linear-gradient(#bc9b6024, #bc9b6008);
  box-shadow: inset 0 -2px #bc9b60;
}
.orbit__button:hover:not(:disabled) { color: #ffe5b4; background-color: #bc9b6018; }
.orbit__button:focus-visible, .orbit__range:focus-visible { outline: 2px solid #f3d7a0; outline-offset: 2px; }
.orbit__button:disabled { opacity: 0.4; cursor: default; }
.orbit__reset { flex: 0 0 2.75rem; }
.orbit__dial { display: flex; align-items: center; gap: 0.6rem; border-top: 1px solid #bc9b6026; }
.orbit__caption { display: flex; flex-direction: column; gap: 0.12rem; font-size: 0.65rem; line-height: 1.3; }
.orbit__caption small { color: #948c7c; font-size: 0.6rem; }
.orbit__caption { flex: 0 0 7em; white-space: nowrap; transition: color 160ms ease; }
.orbit[data-gesture='holding'] .orbit__caption { color: #ffe1a5; }
.orbit[data-gesture='dragging'] .orbit__caption { color: #e6cfa2; }
.orbit__angle { width: 3rem; text-align: right; font-variant-numeric: tabular-nums; color: #dfc698; }
.orbit__scale { position: relative; flex: 1; min-width: 0; }
.orbit__ticks {
  position: absolute;
  inset: auto 8px 8px;
  height: 5px;
  pointer-events: none;
  background: repeating-linear-gradient(90deg, #bc9b6070 0 1px, transparent 1px calc(100% / 12));
}
.orbit__ticks::after { content: ''; position: absolute; left: 50%; bottom: 0; width: 1px; height: 9px; background: #e8c990; }
.orbit__range { position: relative; display: block; appearance: none; width: 100%; height: 2.75rem; margin: 0; background: transparent; cursor: ew-resize; }
.orbit__range::-webkit-slider-runnable-track { height: 3px; border: 1px solid #9c7e485e; background: #0a100e; border-radius: 1px; }
.orbit__range::-moz-range-track { height: 1px; border: 1px solid #9c7e485e; background: #0a100e; border-radius: 1px; }
.orbit__range::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; margin-top: -6.5px; transform: rotate(45deg); border: 1px solid #f1d9a6; border-radius: 2px; background: linear-gradient(135deg, #ead09b, #98713d); box-shadow: inset 0 0 0 3px #29261d, 1px 1px 5px #0008; }
.orbit__range::-moz-range-thumb { width: 12px; height: 12px; transform: rotate(45deg); border: 1px solid #f1d9a6; border-radius: 2px; background: linear-gradient(135deg, #ead09b, #98713d); box-shadow: inset 0 0 0 3px #29261d, 1px 1px 5px #0008; }
.orbit__range:active { filter: brightness(1.25); }
@media (forced-colors: active) { .orbit__range { appearance: auto; } }
.orbit__auto { font-size: 1rem; }
.orbit__auto.is-running { animation: orbit-turn 5s linear infinite; }
@media (min-width: 961px) {
  .orbit { left: auto; right: -13rem; width: 15.5rem; transform: none; }
  .orbit__dial { gap: 0.35rem; }
  .orbit__angle { width: 2.4rem; }
}
@keyframes orbit-turn { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .orbit__auto.is-running { animation: none; } }
</style>
