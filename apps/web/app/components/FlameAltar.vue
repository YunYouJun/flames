<script setup lang="ts">
import type { FlamePalette } from '@yunyoujun/flame-engine'
import type { VisualFamilyId } from '~/data/flames'

const props = defineProps<{
  family?: VisualFamilyId
  flameId: string
  palette?: FlamePalette
  paused: boolean
  rank: number
}>()

const altarMarks = {
  'emperor': '帝',
  'nihility': '虚',
  'purifying-lotus': '净',
  'golden-emperor': '金',
  'life-spirit': '生',
  'eight-desolation': '荒',
  'nether-golden': '祖',
  'karmic-lotus': '业',
  'three-thousand': '星',
  'nether-gale': '幽',
  'bone-chilling': '骨',
  'nine-dragon-thunder': '雷',
  'turtle-spirit': '龟',
  'fallen-heart': '心',
  'sea-heart': '海',
  'fire-cloud-water': '云',
  'volcanic-stone': '山',
  'wind-fury-dragon': '风',
  'green-lotus': '莲',
  'nether-poison': '毒',
  'yin-yang': '衡',
  'myriad-beasts': '兽',
  'dark-yellow': '玄',
} as const

function cssColor(value: FlamePalette[keyof FlamePalette] | undefined, fallback: string) {
  return typeof value === 'string' ? value : fallback
}

const altarStyle = computed<Record<string, string>>(() => ({
  '--altar-core': cssColor(props.palette?.core, '#e8e0d0'),
  '--altar-inner': cssColor(props.palette?.inner, '#a88a55'),
  '--altar-outer': cssColor(props.palette?.outer, '#263438'),
  '--altar-pulse': `${5.4 + (props.rank % 5) * 0.38}s`,
}))

const altarMark = computed(() => altarMarks[props.flameId as keyof typeof altarMarks] ?? String(props.rank).padStart(2, '0'))
</script>

<template>
  <div
    class="flame-altar"
    :class="{ 'flame-altar--paused': paused }"
    :data-family="family"
    :data-flame="flameId"
    :style="altarStyle"
    aria-hidden="true"
  >
    <span class="flame-altar__aura" />
    <span class="flame-altar__body" />
    <span class="flame-altar__foot" />
    <span class="flame-altar__top" />
    <span class="flame-altar__seal"><i /></span>
    <span class="flame-altar__crest">{{ altarMark }}</span>
  </div>
</template>

<style scoped>
.flame-altar {
  position: absolute;
  right: 11%;
  bottom: 0;
  left: 11%;
  height: 9.4rem;
  pointer-events: none;
}

.flame-altar::after {
  position: absolute;
  z-index: 2;
  top: 2.15rem;
  right: -1%;
  bottom: -1.75rem;
  left: -1%;
  clip-path: polygon(0 0, 100% 0, 94% 100%, 6% 100%);
  background: linear-gradient(90deg, transparent, #030608 7%, #030608 93%, transparent);
  content: '';
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
  z-index: 3;
  top: 2.15rem;
  right: 2%;
  bottom: 0.75rem;
  left: 2%;
  clip-path: polygon(0 0, 100% 0, 87% 100%, 13% 100%);
  background:
    linear-gradient(102deg, transparent 24%, rgba(255, 255, 255, 0.055) 24.4%, transparent 25%),
    linear-gradient(78deg, transparent 73%, color-mix(in srgb, var(--altar-inner) 11%, transparent) 73.5%, transparent 74%),
    linear-gradient(90deg, #030405, #111719 24%, #07090a 50%, #151c1e 76%, #030405);
  box-shadow: inset 0 0 2.2rem #000;
  filter: drop-shadow(0 1.8rem 2.4rem rgba(0, 0, 0, 0.92));
}

.flame-altar__body::before {
  position: absolute;
  top: 0;
  right: 1%;
  left: 1%;
  height: 2px;
  opacity: 0.72;
  background: linear-gradient(90deg, transparent, var(--altar-inner), var(--altar-core), var(--altar-inner), transparent);
  content: '';
}

.flame-altar__body::after {
  position: absolute;
  inset: 0 18%;
  opacity: 0.6;
  background: linear-gradient(90deg, transparent 49.8%, color-mix(in srgb, var(--altar-core) 16%, transparent) 50%, transparent 50.2%);
  content: '';
}

.flame-altar__foot {
  position: absolute;
  z-index: 3;
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
  z-index: 1;
  top: 0;
  right: 0;
  left: 0;
  height: 4.3rem;
  clip-path: polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%);
  background:
    linear-gradient(90deg, transparent 8%, color-mix(in srgb, var(--altar-core) 26%, transparent) 50%, transparent 92%),
    linear-gradient(180deg, color-mix(in srgb, var(--altar-inner) 38%, #101617), #060809 48%, #010203);
  box-shadow: inset 0 -0.55rem 1.2rem #000;
  filter: drop-shadow(0 1.1rem 1.2rem rgba(0, 0, 0, 0.72));
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
  z-index: 1;
  top: 0.9rem;
  right: 20%;
  left: 20%;
  height: 2.45rem;
  clip-path: polygon(8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%, 0 50%);
  opacity: 0.72;
  background: color-mix(in srgb, var(--altar-inner) 46%, #101719);
  animation: altar-seal var(--altar-pulse) ease-in-out infinite;
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
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: color-mix(in srgb, var(--altar-inner) 22%, #06090a);
  box-shadow: 0 0 1.25rem color-mix(in srgb, var(--altar-inner) 42%, transparent);
  transform: translate(-50%, -50%) scaleY(0.68);
}

.flame-altar__crest {
  position: absolute;
  z-index: 4;
  top: 3.2rem;
  left: 50%;
  display: grid;
  width: 1.9rem;
  height: 1.9rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--altar-inner) 42%, transparent);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  background: color-mix(in srgb, var(--altar-outer) 22%, #050708);
  box-shadow: 0 0 1.25rem color-mix(in srgb, var(--altar-inner) 18%, transparent);
  color: color-mix(in srgb, var(--altar-core) 78%, transparent);
  font-family: var(--display);
  font-size: 0.64rem;
  letter-spacing: 0;
  line-height: 1;
  transform: translateX(-50%) scaleY(0.78);
}

.flame-altar[data-family='void'] .flame-altar__body::after {
  background: repeating-radial-gradient(ellipse at 50% 30%, transparent 0 12%, color-mix(in srgb, var(--altar-inner) 20%, transparent) 13% 14%, transparent 15% 24%);
}

.flame-altar[data-family='lotus'] .flame-altar__body::after {
  background:
    linear-gradient(68deg, transparent 42%, color-mix(in srgb, var(--altar-inner) 17%, transparent) 42.5% 43%, transparent 43.5%),
    linear-gradient(-68deg, transparent 42%, color-mix(in srgb, var(--altar-inner) 17%, transparent) 42.5% 43%, transparent 43.5%);
}

.flame-altar[data-family='crown'] .flame-altar__body::after {
  background: repeating-linear-gradient(102deg, transparent 0 13%, color-mix(in srgb, var(--altar-inner) 15%, transparent) 13.5% 14%, transparent 14.5% 27%);
}

.flame-altar[data-family='fluid'] .flame-altar__body::after {
  background: repeating-radial-gradient(ellipse at 50% -18%, transparent 0 16%, color-mix(in srgb, var(--altar-inner) 18%, transparent) 17% 18%, transparent 19% 27%);
}

.flame-altar[data-family='spirit'] .flame-altar__body::after {
  background:
    linear-gradient(38deg, transparent 49.5%, color-mix(in srgb, var(--altar-inner) 14%, transparent) 50%, transparent 50.5%),
    linear-gradient(-38deg, transparent 49.5%, color-mix(in srgb, var(--altar-inner) 14%, transparent) 50%, transparent 50.5%);
}

.flame-altar[data-family='gale'] .flame-altar__body::after {
  background:
    repeating-linear-gradient(25deg, transparent 0 17%, color-mix(in srgb, var(--altar-inner) 14%, transparent) 17.5% 18%, transparent 18.5% 31%),
    repeating-linear-gradient(-25deg, transparent 0 23%, color-mix(in srgb, var(--altar-core) 8%, transparent) 23.5% 24%, transparent 24.5% 39%);
}

.flame-altar[data-family='cold'] .flame-altar__body::after {
  background:
    linear-gradient(60deg, transparent 49.4%, color-mix(in srgb, var(--altar-core) 18%, transparent) 50%, transparent 50.6%),
    linear-gradient(-60deg, transparent 49.4%, color-mix(in srgb, var(--altar-core) 18%, transparent) 50%, transparent 50.6%);
}

.flame-altar[data-family='soul'] .flame-altar__body::after {
  background:
    radial-gradient(circle at 43% 38%, color-mix(in srgb, var(--altar-core) 15%, transparent) 0 7%, transparent 8%),
    radial-gradient(circle at 57% 38%, color-mix(in srgb, var(--altar-outer) 36%, transparent) 0 7%, transparent 8%);
}

.flame-altar[data-family='geofire'] .flame-altar__body::after {
  background:
    linear-gradient(72deg, transparent 39%, color-mix(in srgb, var(--altar-inner) 17%, transparent) 39.5% 40.5%, transparent 41%),
    linear-gradient(108deg, transparent 61%, color-mix(in srgb, var(--altar-inner) 14%, transparent) 61.5% 62.5%, transparent 63%);
}

.flame-altar[data-family='void'] .flame-altar__seal {
  right: 31%;
  left: 31%;
  border-radius: 50%;
  clip-path: none;
  background: color-mix(in srgb, var(--altar-outer) 74%, #020304);
}

.flame-altar[data-family='void'] .flame-altar__seal::before {
  border-radius: 50%;
  clip-path: none;
  background:
    radial-gradient(ellipse, #000 0 18%, color-mix(in srgb, var(--altar-inner) 46%, #050608) 20%, transparent 23%),
    repeating-radial-gradient(ellipse, transparent 0 15%, color-mix(in srgb, var(--altar-inner) 22%, transparent) 16% 17%, transparent 18% 28%),
    #030405;
}

.flame-altar[data-family='lotus'] .flame-altar__seal {
  right: 23%;
  left: 23%;
  clip-path: polygon(50% 0, 58% 25%, 75% 7%, 74% 33%, 100% 21%, 82% 50%, 100% 79%, 74% 67%, 75% 93%, 58% 75%, 50% 100%, 42% 75%, 25% 93%, 26% 67%, 0 79%, 18% 50%, 0 21%, 26% 33%, 25% 7%, 42% 25%);
}

.flame-altar[data-family='lotus'] .flame-altar__seal::before {
  background:
    repeating-conic-gradient(from 11.25deg at 50% 50%, color-mix(in srgb, var(--altar-inner) 25%, transparent) 0 9deg, transparent 10deg 45deg),
    radial-gradient(ellipse, color-mix(in srgb, var(--altar-inner) 18%, #040708), #030405 64%);
}

.flame-altar[data-family='crown'] .flame-altar__seal {
  top: 0.76rem;
  height: 2.7rem;
  clip-path: polygon(0 92%, 8% 28%, 25% 68%, 37% 0, 50% 62%, 63% 0, 75% 68%, 92% 28%, 100% 92%, 100% 100%, 0 100%);
}

.flame-altar[data-family='crown'] .flame-altar__seal::before {
  inset: 2px 0.45rem 1px;
  background:
    linear-gradient(90deg, transparent 49.7%, color-mix(in srgb, var(--altar-core) 46%, transparent) 50%, transparent 50.3%),
    linear-gradient(180deg, color-mix(in srgb, var(--altar-inner) 18%, #070a0b), #030405 72%);
}

.flame-altar[data-family='fluid'] .flame-altar__seal {
  right: 17%;
  left: 17%;
  border-radius: 50%;
  clip-path: none;
}

.flame-altar[data-family='fluid'] .flame-altar__seal::before {
  border-radius: 50%;
  clip-path: none;
  background:
    repeating-radial-gradient(ellipse at 50% 30%, transparent 0 13%, color-mix(in srgb, var(--altar-inner) 28%, transparent) 14% 15%, transparent 16% 26%),
    radial-gradient(ellipse, color-mix(in srgb, var(--altar-inner) 15%, #040708), #030506 68%);
}

.flame-altar[data-family='spirit'] .flame-altar__seal::before {
  background:
    conic-gradient(from 45deg at 50% 50%, transparent 0 20%, color-mix(in srgb, var(--altar-inner) 31%, transparent) 20.5% 21.5%, transparent 22% 45%, color-mix(in srgb, var(--altar-core) 25%, transparent) 45.5% 46.5%, transparent 47% 70%, color-mix(in srgb, var(--altar-inner) 31%, transparent) 70.5% 71.5%, transparent 72%),
    radial-gradient(ellipse, color-mix(in srgb, var(--altar-inner) 17%, #040708), #030405 66%);
}

.flame-altar[data-family='gale'] .flame-altar__seal {
  right: 15%;
  left: 15%;
  border-radius: 48%;
  clip-path: none;
}

.flame-altar[data-family='gale'] .flame-altar__seal::before {
  border-radius: 48%;
  clip-path: none;
  background:
    repeating-conic-gradient(from 18deg at 50% 50%, transparent 0 18deg, color-mix(in srgb, var(--altar-inner) 32%, transparent) 19deg 20deg, transparent 21deg 42deg),
    radial-gradient(ellipse, #030506 0 18%, color-mix(in srgb, var(--altar-inner) 17%, #050809) 19% 25%, #020304 58%);
}

.flame-altar[data-family='cold'] .flame-altar__seal {
  right: 27%;
  left: 27%;
  clip-path: polygon(50% 0, 61% 33%, 100% 50%, 61% 67%, 50% 100%, 39% 67%, 0 50%, 39% 33%);
}

.flame-altar[data-family='cold'] .flame-altar__seal::before {
  background:
    linear-gradient(25deg, transparent 49.5%, color-mix(in srgb, var(--altar-core) 32%, transparent) 50%, transparent 50.5%),
    linear-gradient(-25deg, transparent 49.5%, color-mix(in srgb, var(--altar-core) 32%, transparent) 50%, transparent 50.5%),
    radial-gradient(ellipse, color-mix(in srgb, var(--altar-inner) 16%, #050809), #020405 68%);
}

.flame-altar[data-family='soul'] .flame-altar__seal::before {
  background:
    radial-gradient(ellipse at 43% 50%, color-mix(in srgb, var(--altar-core) 30%, #050708) 0 17%, transparent 18%),
    radial-gradient(ellipse at 57% 50%, color-mix(in srgb, var(--altar-outer) 58%, #020304) 0 17%, transparent 18%),
    linear-gradient(90deg, color-mix(in srgb, var(--altar-core) 10%, #030405), color-mix(in srgb, var(--altar-outer) 28%, #030405));
}

.flame-altar[data-family='geofire'] .flame-altar__seal {
  clip-path: polygon(0 28%, 13% 5%, 29% 24%, 43% 0, 55% 22%, 71% 6%, 100% 31%, 92% 70%, 75% 93%, 59% 73%, 42% 100%, 26% 76%, 8% 94%);
}

.flame-altar[data-family='geofire'] .flame-altar__seal::before {
  background:
    linear-gradient(67deg, transparent 44%, color-mix(in srgb, var(--altar-inner) 38%, transparent) 45% 46%, transparent 47%),
    linear-gradient(112deg, transparent 58%, color-mix(in srgb, var(--altar-core) 24%, transparent) 59% 60%, transparent 61%),
    linear-gradient(18deg, transparent 48%, color-mix(in srgb, var(--altar-inner) 24%, transparent) 49% 50%, transparent 51%),
    radial-gradient(ellipse, color-mix(in srgb, var(--altar-inner) 16%, #060707), #030405 68%);
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
    top: 1.775rem;
    bottom: 0.55rem;
  }

  .flame-altar::after {
    top: 1.775rem;
  }

  .flame-altar__crest {
    top: 2.62rem;
    width: 1.65rem;
    height: 1.65rem;
    font-size: 0.56rem;
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

  .flame-altar[data-family='crown'] .flame-altar__seal {
    top: 0.62rem;
    height: 2.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flame-altar__aura,
  .flame-altar__seal {
    animation: none;
  }
}
</style>
