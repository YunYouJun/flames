<script setup lang="ts">
import type { FlameSeat } from '~/data/flames'

const props = defineProps<{
  flame: FlameSeat
}>()

const sealLabel = computed(() => props.flame.rank === 1 ? '终局封印' : '尚未凝聚')
</script>

<template>
  <div class="sealed-flame" :aria-label="`${flame.name}：${sealLabel}`">
    <span class="sealed-orbit" aria-hidden="true" />
    <span class="sealed-core" aria-hidden="true"><i>{{ String(flame.rank).padStart(2, '0') }}</i></span>
    <strong>{{ sealLabel }}</strong>
    <small>{{ flame.visual.plannedFamily ? '形态家族已归档' : '等待万火归一' }}</small>
  </div>
</template>

<style scoped>
.sealed-flame {
  position: absolute;
  z-index: 2;
  inset: 10% 15% 17%;
  display: grid;
  place-content: center;
  justify-items: center;
  color: rgba(232, 224, 208, 0.46);
  pointer-events: none;
}

.sealed-orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(17rem, 62%);
  aspect-ratio: 1;
  border: 1px solid rgba(168, 138, 85, 0.24);
  border-radius: 50%;
  box-shadow: inset 0 0 4rem rgba(168, 138, 85, 0.08), 0 0 5rem rgba(0, 0, 0, 0.9);
  transform: translate(-50%, -50%);
}

.sealed-orbit::before,
.sealed-orbit::after {
  position: absolute;
  border: 1px solid rgba(232, 224, 208, 0.08);
  border-radius: 50%;
  content: '';
}

.sealed-orbit::before {
  inset: 14%;
}

.sealed-orbit::after {
  inset: 32%;
  background: radial-gradient(circle, rgba(168, 138, 85, 0.12), transparent 68%);
}

.sealed-core {
  position: relative;
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  place-items: center;
  border: 1px solid rgba(168, 138, 85, 0.45);
  color: var(--brass);
  font-family: var(--display);
  font-size: 1.25rem;
  letter-spacing: 0.12em;
  transform: rotate(45deg);
}

.sealed-core i {
  font-style: normal;
  transform: rotate(-45deg);
}

.sealed-flame strong,
.sealed-flame small {
  position: relative;
}

.sealed-flame strong {
  margin-top: 2.4rem;
  color: var(--bone-dim);
  font-family: var(--display);
  font-size: 0.76rem;
  font-weight: 500;
  letter-spacing: 0.32em;
}

.sealed-flame small {
  margin-top: 0.6rem;
  color: rgba(232, 224, 208, 0.28);
  font-size: 0.58rem;
  letter-spacing: 0.18em;
}
</style>
