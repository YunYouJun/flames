<script setup lang="ts">
import type { FlameQuality, FlameRuntimeStatus } from '@yunyoujun/flame-engine'
import { defaultFlame, flameCatalog, flameCatalogBySlug } from '~/data/flames'

const props = defineProps<{
  initialSlug: string
}>()

const activeFlame = computed(() => flameCatalogBySlug.get(props.initialSlug) ?? defaultFlame)
const paused = shallowRef(false)
const muted = shallowRef(true)
const quality = shallowRef<FlameQuality>('balanced')
const runtimeStatus = shallowRef<FlameRuntimeStatus>('idle')
const showDetails = shallowRef(false)
const hydrated = shallowRef(false)

const { markSeen, seenCount } = useFlameProgress()
const sound = useAmbientSound()

function selectFlame(slug: string) {
  markSeen(slug)
  if (slug === 'purifying-lotus')
    return navigateTo('/')
  return navigateTo(`/flames/${slug}`)
}

async function toggleSound() {
  muted.value = !muted.value
  await sound.setMuted(muted.value)
}

onMounted(() => {
  hydrated.value = true
  markSeen(activeFlame.value.slug)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  paused.value = reducedMotion
  quality.value = coarsePointer ? 'balanced' : 'high'
})

watch(() => activeFlame.value.slug, markSeen)
</script>

<template>
  <main
    class="experience-shell"
    :data-hydrated="hydrated || undefined"
    :data-kernel="activeFlame.kernel"
  >
    <div class="atmosphere" aria-hidden="true" />

    <header class="site-header">
      <NuxtLink class="brand" to="/" aria-label="返回异火榜">
        <span class="brand-title">异火榜</span>
        <span class="brand-subtitle">基于《斗破苍穹》原著设定的非官方实时视觉演绎</span>
      </NuxtLink>

      <ExperienceControls
        :muted="muted"
        :paused="paused"
        :quality="quality"
        @toggle-pause="paused = !paused"
        @toggle-sound="toggleSound"
        @update:quality="quality = $event"
      />
    </header>

    <section class="flame-composition" aria-live="polite">
      <FlameIdentity :flame="activeFlame" @show-details="showDetails = true" />

      <div class="stage-wrap">
        <FlameStage
          :preset="activeFlame"
          :paused="paused"
          :quality="quality"
          @status-change="runtimeStatus = $event"
          @interact="markSeen(activeFlame.slug)"
        />
        <div v-if="runtimeStatus !== 'ready'" class="flame-fallback" aria-label="正在唤醒异火">
          <span />
        </div>

        <div class="altar" aria-hidden="true">
          <i class="altar-surface" />
          <i class="altar-body" />
        </div>

        <p v-if="runtimeStatus === 'context-lost'" class="runtime-notice">
          灵力波动中断，正在重新凝聚异火……
        </p>
        <p v-else-if="runtimeStatus === 'error'" class="runtime-notice">
          当前环境未启用 WebGL，已呈现轻量火焰意象
        </p>
      </div>

      <InteractionGuide :kernel="activeFlame.kernel" />
    </section>

    <footer class="rank-dock">
      <p class="progress-mark">
        已观测 {{ seenCount }} / {{ flameCatalog.length }}
      </p>
      <FlameSelector
        :flames="flameCatalog"
        :active-slug="activeFlame.slug"
        @select="selectFlame"
      />
    </footer>

    <FlameDetails
      v-if="showDetails"
      :flame="activeFlame"
      @close="showDetails = false"
    />
  </main>
</template>
