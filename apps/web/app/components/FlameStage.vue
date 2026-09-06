<script setup lang="ts">
import type {
  FlamePreset,
  FlameQuality,
  FlameRuntime,
  FlameRuntimeDiagnostics,
  FlameRuntimeStatus,
} from '@yunyoujun/flame-engine'

const props = defineProps<{
  preset: FlamePreset
  paused: boolean
  quality: FlameQuality
  benchmarkTime?: number
}>()

const emit = defineEmits<{
  interact: []
  statusChange: [status: FlameRuntimeStatus]
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('flameCanvas')
const diagnostics = shallowRef<FlameRuntimeDiagnostics>()
const dragRotation = shallowRef(true)
const viewLimit = computed(() => props.quality !== 'lite' ? 180 : 12)
const { angle: viewAngle, automatic, stop: stopOrbit, reset: resetOrbit, toggle: toggleOrbit } = useStageOrbit({
  limit: () => viewLimit.value,
  paused: () => props.paused,
})
let runtime: FlameRuntime | undefined
const rotating = computed(() => dragRotation.value && viewLimit.value === 180)
const { phase, cancel: cancelGesture, onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onKeyDown } = useStageInteraction({
  canvas: () => canvas.value,
  runtime: () => runtime,
  rotating: () => rotating.value,
  angle: () => viewAngle.value,
  setAngle: angle => viewAngle.value = angle,
  stopOrbit,
  interact: () => emit('interact'),
})

onFlameReady(async () => {
  // Let the experience apply URL/reduced-motion preferences before allocating GL.
  await nextTick()
  const mountedCanvas = canvas.value
  if (!mountedCanvas) {
    emit('statusChange', 'error')
    return
  }

  try {
    const { FlameRuntime: Runtime, flameKernelIds } = await import('@yunyoujun/flame-engine')
    if (canvas.value !== mountedCanvas)
      return

    runtime = new Runtime({
      canvas: mountedCanvas,
      preset: props.preset,
      paused: props.paused,
      quality: props.quality,
      benchmarkTime: props.benchmarkTime,
      altar: true,
      onStatusChange: status => emit('statusChange', status),
    })
    await runtime.warmup(flameKernelIds)
    requestAnimationFrame(() => {
      diagnostics.value = runtime?.getDiagnostics()
    })
  }
  catch (error) {
    console.error('Unable to initialize the flame runtime.', error)
    emit('statusChange', 'error')
  }
})

watch(() => props.preset, (preset) => {
  cancelGesture()
  resetOrbit()
  runtime?.setPreset(preset)
})
watch(() => props.paused, paused => runtime?.setPaused(paused))
watch(() => props.quality, (quality) => {
  cancelGesture()
  runtime?.setQuality(quality)
  requestAnimationFrame(() => {
    diagnostics.value = runtime?.getDiagnostics()
  })
})
watch(viewAngle, angle => runtime?.setViewAngle(angle))

onBeforeUnmount(() => {
  cancelGesture()
  runtime?.dispose()
})
</script>

<template>
  <canvas
    ref="flameCanvas"
    class="flame-canvas"
    :style="{ cursor: rotating ? (phase === 'dragging' ? 'grabbing' : 'grab') : undefined }"
    aria-label="可交互的实时异火模拟"
    aria-description="点按唤焰，停留片刻蓄焰；开启旋转后拖动查看四周，蓄焰自然回落。聚焦后按回车或空格唤焰。"
    tabindex="0"
    title="点按唤焰 · 长按蓄焰 · 拖动观火"
    :data-benchmark-ready="benchmarkTime !== undefined && diagnostics ? 'true' : undefined"
    :data-programs="diagnostics?.programs"
    :data-render-mode="diagnostics?.renderMode"
    :data-calls="diagnostics?.calls"
    :data-triangles="diagnostics?.triangles"
    :data-geometries="diagnostics?.geometries"
    :data-textures="diagnostics?.textures"
    :data-gesture="phase"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @lostpointercapture="onPointerUp"
    @pointerleave="onPointerLeave"
    @keydown="onKeyDown"
  />
  <FlameOrbitControls
    v-model:angle="viewAngle"
    v-model:drag-rotation="dragRotation"
    :limit="viewLimit"
    :automatic="automatic"
    :paused="paused"
    :phase="phase"
    @manual="stopOrbit"
    @toggle-auto="toggleOrbit"
    @reset="resetOrbit"
  />
</template>
