<script setup lang="ts">
import type { FlamePalette, FlameRuntimeStatus } from '@yunyoujun/flame-engine'

const props = defineProps<{
  palette: FlamePalette
  status: FlameRuntimeStatus
  paused: boolean
}>()

function cssColor(value: FlamePalette[keyof FlamePalette], fallback: string) {
  if (typeof value === 'number')
    return `#${value.toString(16).padStart(6, '0')}`
  return typeof value === 'string' ? value : fallback
}

const style = computed(() => ({
  '--ember-core': cssColor(props.palette.core, '#e8e0d0'),
  '--ember-inner': cssColor(props.palette.inner, '#9fd8da'),
  '--ember-outer': cssColor(props.palette.outer, '#498f9d'),
}))
const label = computed(() => props.status === 'error'
  ? '轻量火焰意象'
  : props.status === 'context-lost' ? '正在重新凝聚异火' : '正在唤醒异火')
</script>

<template>
  <div
    class="flame-fallback"
    :class="{ 'flame-fallback--paused': paused }"
    :style="style"
    role="status"
    :aria-label="label"
  >
    <div class="flame-fallback__image" aria-hidden="true">
      <span class="flame-fallback__aura" />
      <span class="flame-fallback__ring" />
      <span v-for="wisp in 3" :key="wisp" class="flame-fallback__wisp" :style="{ '--wisp': wisp }" />
      <span class="flame-fallback__core" />
      <span v-for="spark in 5" :key="spark" class="flame-fallback__spark" :style="{ '--spark': spark }" />
    </div>
    <span v-if="status === 'idle'" class="flame-fallback__caption" aria-hidden="true">凝聚火息</span>
  </div>
</template>

<style scoped>
.flame-fallback {
  position: absolute;
  z-index: 2;
  inset: 12% 10% 20%;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.flame-fallback__image {
  position: relative;
  width: min(100%, 18rem);
  height: min(100%, 23rem);
}

.flame-fallback__image span {
  position: absolute;
  display: block;
}

.flame-fallback__aura {
  inset: 0 -20% -12%;
  background: radial-gradient(ellipse at 50% 65%, color-mix(in srgb, var(--ember-outer) 24%, transparent), transparent 65%);
  filter: blur(18px);
  animation: ember-breathe 4s ease-in-out infinite alternate;
}

.flame-fallback__ring {
  right: 8%;
  bottom: 3%;
  left: 8%;
  height: 12%;
  border: 1px solid color-mix(in srgb, var(--ember-inner) 24%, transparent);
  border-radius: 50%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--ember-outer) 24%, transparent), transparent 68%);
  box-shadow: 0 0 22px color-mix(in srgb, var(--ember-outer) 12%, transparent);
}

.flame-fallback__wisp {
  bottom: 11%;
  left: calc(18% + var(--wisp) * 8%);
  width: 33%;
  height: calc(43% + var(--wisp) * 9%);
  border-radius: 80% 12% 65% 35% / 65% 30% 70% 35%;
  transform-origin: 50% 100%;
  background: radial-gradient(ellipse at 42% 78%, var(--ember-inner), color-mix(in srgb, var(--ember-outer) 60%, transparent) 40%, transparent 72%);
  box-shadow: inset 2px -8px 16px color-mix(in srgb, var(--ember-inner) 22%, transparent);
  filter: blur(5px);
  opacity: 0.6;
  animation: ember-sway 3.6s ease-in-out infinite alternate;
  animation-delay: calc(var(--wisp) * -1.2s);
}

.flame-fallback__core {
  bottom: 12%;
  left: 41%;
  width: 18%;
  height: 39%;
  border-radius: 70% 30% 55% 45%;
  background: radial-gradient(ellipse at 50% 78%, var(--ember-core), var(--ember-inner) 26%, transparent 70%);
  filter: blur(7px);
  animation: ember-breathe 2.4s ease-in-out infinite alternate;
}

.flame-fallback__spark {
  bottom: 16%;
  left: calc(22% + var(--spark) * 9%);
  width: 2px;
  height: 4px;
  border-radius: 50%;
  background: var(--ember-inner);
  box-shadow: 0 0 8px var(--ember-outer);
  opacity: 0;
  animation: ember-rise 4s ease-out infinite;
  animation-delay: calc(var(--spark) * -0.8s);
}

.flame-fallback__caption {
  position: absolute;
  top: 100%;
  color: var(--bone-dim);
  font-family: var(--display);
  font-size: 0.65rem;
  letter-spacing: 0.35em;
  padding-left: 0.35em;
}

@keyframes ember-sway {
  from { transform: rotate(-9deg) scaleX(0.88); }
  to { transform: rotate(7deg) scaleY(1.06); }
}

@keyframes ember-breathe {
  from { opacity: 0.5; }
  to { opacity: 0.85; }
}

@keyframes ember-rise {
  0% { opacity: 0; transform: translateY(0); }
  25% { opacity: 0.65; }
  100% { opacity: 0; transform: translateY(-10rem); }
}

.flame-fallback--paused .flame-fallback__image span {
  animation-play-state: paused;
}

@media (prefers-reduced-motion: reduce) {
  .flame-fallback__image span {
    animation: none;
  }
}
</style>
