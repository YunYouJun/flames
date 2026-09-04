<script setup lang="ts">
import type { FlamePalette } from '@yunyoujun/flame-engine'

const props = defineProps<{
  palette?: FlamePalette
  paused: boolean
}>()

function cssColor(value: FlamePalette[keyof FlamePalette] | undefined, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

const altarStyle = computed<Record<string, string>>(() => ({
  '--altar-core': cssColor(props.palette?.core, '#e8e0d0'),
  '--altar-inner': cssColor(props.palette?.inner, '#a88a55'),
  '--altar-outer': cssColor(props.palette?.outer, '#263438'),
}))
</script>

<template>
  <div
    class="flame-altar"
    :class="{ 'flame-altar--paused': paused }"
    :style="altarStyle"
    aria-hidden="true"
  >
    <span class="flame-altar__aura" />
    <span class="flame-altar__body" />
    <span class="flame-altar__foot" />
    <span class="flame-altar__top" />
    <span class="flame-altar__seal"><i /></span>
  </div>
</template>

<style scoped>
.flame-altar {
  position: absolute;
  z-index: 1;
  right: 11%;
  bottom: 0;
  left: 11%;
  height: 9.4rem;
  pointer-events: none;
  filter: drop-shadow(0 2.1rem 2.9rem rgba(0, 0, 0, 0.94));
}

.flame-altar__aura {
  position: absolute;
  z-index: 0;
  top: -1.4rem;
  right: 8%;
  left: 8%;
  height: 6.4rem;
  opacity: 0.42;
  background: radial-gradient(
    ellipse at 50% 58%,
    color-mix(in srgb, var(--altar-inner) 46%, transparent),
    color-mix(in srgb, var(--altar-outer) 18%, transparent) 44%,
    transparent 72%
  );
  filter: blur(1.1rem);
  animation: altar-breathe 6.4s ease-in-out infinite;
}

.flame-altar__body {
  position: absolute;
  z-index: 1;
  top: 2.15rem;
  right: 8%;
  bottom: 0.75rem;
  left: 8%;
  clip-path: polygon(3% 0, 97% 0, 87% 100%, 13% 100%);
  background:
    linear-gradient(102deg, transparent 24%, rgba(255, 255, 255, 0.055) 24.4%, transparent 25%),
    linear-gradient(78deg, transparent 73%, color-mix(in srgb, var(--altar-inner) 11%, transparent) 73.5%, transparent 74%),
    linear-gradient(90deg, #030405, #111719 24%, #07090a 50%, #151c1e 76%, #030405);
  box-shadow: inset 0 0 2.2rem #000;
}

.flame-altar__body::after {
  position: absolute;
  inset: 0 49.9%;
  background: linear-gradient(180deg, color-mix(in srgb, var(--altar-core) 16%, transparent), transparent 72%);
  content: '';
}

.flame-altar__foot {
  position: absolute;
  z-index: 1;
  right: 18%;
  bottom: 0;
  left: 18%;
  height: 1.25rem;
  clip-path: polygon(4% 0, 96% 0, 100% 50%, 93% 100%, 7% 100%, 0 50%);
  background:
    linear-gradient(90deg, #020304, #12191b 28%, #07090a 52%, #111719 74%, #020304),
    var(--altar-outer);
  box-shadow: inset 0 1px color-mix(in srgb, var(--altar-inner) 25%, transparent);
}

.flame-altar__top {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 0;
  left: 0;
  height: 4.3rem;
  clip-path: polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%);
  background:
    linear-gradient(90deg, transparent 8%, color-mix(in srgb, var(--altar-core) 26%, transparent) 50%, transparent 92%),
    linear-gradient(180deg, color-mix(in srgb, var(--altar-inner) 38%, #101617), #060809 48%, #010203);
  box-shadow: inset 0 -0.55rem 1.2rem #000;
}

.flame-altar__top::before {
  position: absolute;
  inset: 3px 1.2%;
  clip-path: inherit;
  background:
    repeating-conic-gradient(
      from 22.5deg at 50% 50%,
      color-mix(in srgb, var(--altar-inner) 18%, transparent) 0 0.8deg,
      transparent 0.8deg 45deg
    ),
    radial-gradient(
      ellipse at 50% 52%,
      color-mix(in srgb, var(--altar-inner) 14%, #080c0d) 0 20%,
      #0b1012 46%,
      #030405 78%
    );
  content: '';
}

.flame-altar__top::after {
  position: absolute;
  right: 8%;
  bottom: 0.23rem;
  left: 8%;
  height: 1px;
  opacity: 0.55;
  background: linear-gradient(90deg, transparent, var(--altar-inner), var(--altar-core), var(--altar-inner), transparent);
  content: '';
}

.flame-altar__seal {
  position: absolute;
  z-index: 4;
  top: 0.9rem;
  right: 20%;
  left: 20%;
  height: 2.45rem;
  clip-path: polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%);
  opacity: 0.72;
  background: color-mix(in srgb, var(--altar-inner) 46%, #101719);
  animation: altar-seal 6.4s ease-in-out infinite;
}

.flame-altar__seal::before {
  position: absolute;
  inset: 1px 0.35rem;
  clip-path: inherit;
  background:
    linear-gradient(90deg, transparent 49.7%, color-mix(in srgb, var(--altar-core) 38%, transparent) 50%, transparent 50.3%),
    radial-gradient(ellipse, color-mix(in srgb, var(--altar-inner) 16%, #040708) 0 22%, #040607 64%);
  content: '';
}

.flame-altar__seal i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: 0.82rem;
  height: 0.82rem;
  border: 1px solid color-mix(in srgb, var(--altar-core) 62%, transparent);
  background: color-mix(in srgb, var(--altar-inner) 22%, #06090a);
  box-shadow: 0 0 1.25rem color-mix(in srgb, var(--altar-inner) 42%, transparent);
  transform: translate(-50%, -50%) rotate(45deg) scaleY(0.62);
}

.flame-altar--paused .flame-altar__aura,
.flame-altar--paused .flame-altar__seal {
  animation-play-state: paused;
}

@keyframes altar-breathe {
  0%,
  100% {
    opacity: 0.34;
    transform: scale(0.96);
  }

  50% {
    opacity: 0.57;
    transform: scale(1.035);
  }
}

@keyframes altar-seal {
  0%,
  100% {
    opacity: 0.58;
  }

  50% {
    opacity: 0.86;
  }
}

@media (max-width: 520px) {
  .flame-altar {
    right: 5%;
    left: 5%;
    height: 7.1rem;
  }

  .flame-altar__body {
    bottom: 0.55rem;
  }

  .flame-altar__foot {
    height: 1rem;
  }

  .flame-altar__top {
    height: 3.55rem;
  }

  .flame-altar__seal {
    top: 0.75rem;
    height: 2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flame-altar__aura,
  .flame-altar__seal {
    animation: none;
  }
}
</style>
