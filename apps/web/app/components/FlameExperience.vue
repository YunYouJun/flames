<script setup lang="ts">
import type { FlameQuality, FlameRuntimeStatus } from '@yunyoujun/flame-engine'
import type { FlameSeat } from '~/data/flames'
import {
  flameCatalog,
  flameRoster,
  getFlameEntry,
} from '~/data/flames'

const props = defineProps<{
  flame: FlameSeat
}>()

const route = useRoute()
const paused = shallowRef(false)
const muted = shallowRef(true)
const quality = shallowRef<FlameQuality>('balanced')
const runtimeStatus = shallowRef<FlameRuntimeStatus>('idle')
const showDetails = shallowRef(false)
const showRoster = shallowRef(false)
const hydrated = shallowRef(false)

const activeFlame = computed(() => {
  const state = props.flame.visual.state
  if (state === 'approved' || (state === 'prototype' && import.meta.dev))
    return getFlameEntry(props.flame)
  return undefined
})
const activeFamily = computed(() => props.flame.visual.plannedFamily)
const completedBaseCount = computed(() => flameCatalog.filter(flame => flame.rank > 1).length)
const benchmarkTime = computed(() => route.query.benchmark === '1' ? 4.25 : undefined)
const benchmarkQuality = computed<FlameQuality>(() => {
  const requested = route.query.quality
  return requested === 'high' || requested === 'lite' ? requested : 'balanced'
})

const { markSeen, seenCount } = useFlameProgress()
const sound = useAmbientSound()

async function toggleSound() {
  muted.value = !muted.value
  await sound.setMuted(muted.value)
}

onMounted(() => {
  hydrated.value = true
  if (activeFlame.value)
    markSeen(activeFlame.value.slug)
  if (benchmarkTime.value !== undefined) {
    paused.value = false
    quality.value = benchmarkQuality.value
    return
  }
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  paused.value = reducedMotion
  quality.value = coarsePointer ? 'balanced' : 'high'
})

watch(() => activeFlame.value?.slug, (slug) => {
  if (slug)
    markSeen(slug)
})
</script>

<template>
  <main
    class="experience-shell"
    :data-hydrated="hydrated || undefined"
    :data-kernel="activeFlame?.kernel"
    :data-family="activeFamily"
    :data-bloom-mode="activeFlame?.kernel === 'lotus' ? activeFlame.kernelOptions?.bloomMode ?? 'purifying' : undefined"
    :data-visual-state="flame.visual.state"
    :data-benchmark="benchmarkTime !== undefined || undefined"
  >
    <div class="atmosphere" aria-hidden="true" />

    <header class="site-header">
      <NuxtLink class="brand" to="/" aria-label="返回异火榜">
        <span class="brand-title">异火榜</span>
        <span class="brand-subtitle">基于《斗破苍穹》原著设定的非官方实时视觉演绎</span>
      </NuxtLink>

      <ExperienceControls
        v-if="activeFlame && benchmarkTime === undefined"
        :muted="muted"
        :paused="paused"
        :quality="quality"
        @toggle-pause="paused = !paused"
        @toggle-sound="toggleSound"
        @update:quality="quality = $event"
      />
      <span v-else-if="activeFlame" class="sealed-status">固定基准帧</span>
      <span v-else class="sealed-status">封印席</span>
    </header>

    <section class="flame-composition" aria-live="polite">
      <FlameIdentity :flame="flame" @show-details="showDetails = true" />

      <div class="stage-wrap">
        <FlameStage
          v-if="activeFlame"
          :preset="activeFlame"
          :paused="paused"
          :quality="quality"
          :benchmark-time="benchmarkTime"
          @status-change="runtimeStatus = $event"
          @interact="markSeen(activeFlame.slug)"
        />
        <SealedFlameStage v-else :flame="flame" />

        <div v-if="activeFlame && runtimeStatus !== 'ready'" class="flame-fallback" aria-label="正在唤醒异火">
          <span />
        </div>

        <div class="altar" aria-hidden="true">
          <i class="altar-surface" />
          <i class="altar-body" />
        </div>

        <p v-if="activeFlame && runtimeStatus === 'context-lost'" class="runtime-notice">
          灵力波动中断，正在重新凝聚异火……
        </p>
        <p v-else-if="activeFlame && runtimeStatus === 'error'" class="runtime-notice">
          当前环境未启用 WebGL，已呈现轻量火焰意象
        </p>
      </div>

      <InteractionGuide v-if="activeFlame" :interactions="activeFlame.interactions" />
      <aside v-else class="sealed-guide" aria-label="凝聚状态">
        <span aria-hidden="true">封</span>
        <p>
          <strong>{{ flame.rank === 1 ? '终局未启' : '异火未现世' }}</strong>
          <small>席位与设定已经锁定，实时视觉仍待正式验收。</small>
        </p>
      </aside>
    </section>

    <footer class="rank-dock">
      <p class="progress-mark">
        <span>基础异火已现世 {{ completedBaseCount }} / 22</span>
        <span>已观测 {{ seenCount }} / {{ flameCatalog.length }}</span>
        <span>帝炎未启</span>
      </p>
      <FlameRosterRail
        :flames="flameRoster"
        :active-slug="flame.slug"
        @open-roster="showRoster = true"
      />
    </footer>

    <FlameRosterGallery
      v-if="showRoster"
      :flames="flameRoster"
      :active-slug="flame.slug"
      :approved-count="flameCatalog.length"
      @close="showRoster = false"
    />

    <FlameDetails
      v-if="showDetails"
      :flame="flame"
      @close="showDetails = false"
    />
  </main>
</template>
