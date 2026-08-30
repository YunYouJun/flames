<script setup lang="ts">
import type {
  FlamePreset,
  FlameQuality,
  FlameRuntime,
  FlameRuntimeStatus,
} from '@yunyoujun/flame-engine'

const props = defineProps<{
  preset: FlamePreset
  paused: boolean
  quality: FlameQuality
}>()

const emit = defineEmits<{
  interact: []
  statusChange: [status: FlameRuntimeStatus]
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('flameCanvas')
let runtime: FlameRuntime | undefined
let pointerOrigin: { x: number, y: number } | undefined

function pointerInput(event: PointerEvent, pressed = event.buttons > 0) {
  if (!canvas.value || !runtime)
    return

  const rect = canvas.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  const drag = pointerOrigin
    ? Math.min(Math.hypot(event.clientX - pointerOrigin.x, event.clientY - pointerOrigin.y) / 220, 1)
    : 0

  runtime.setPointer({ x, y, pressed, drag })
}

function onPointerDown(event: PointerEvent) {
  pointerOrigin = { x: event.clientX, y: event.clientY }
  canvas.value?.setPointerCapture(event.pointerId)
  pointerInput(event, true)
  emit('interact')
}

function onPointerMove(event: PointerEvent) {
  pointerInput(event)
}

function onPointerUp(event: PointerEvent) {
  pointerInput(event, false)
  pointerOrigin = undefined
  canvas.value?.releasePointerCapture(event.pointerId)
}

function onPointerLeave() {
  runtime?.setPointer({ x: 0, y: 0, pressed: false, drag: 0 })
  pointerOrigin = undefined
}

onMounted(async () => {
  const mountedCanvas = canvas.value
  if (!mountedCanvas) {
    emit('statusChange', 'error')
    return
  }

  try {
    const { FlameRuntime: Runtime } = await import('@yunyoujun/flame-engine')
    if (canvas.value !== mountedCanvas)
      return

    runtime = new Runtime({
      canvas: mountedCanvas,
      preset: props.preset,
      paused: props.paused,
      quality: props.quality,
      onStatusChange: status => emit('statusChange', status),
    })
    void runtime.warmup(['void', 'lotus', 'cold'])
  }
  catch (error) {
    console.error('Unable to initialize the flame runtime.', error)
    emit('statusChange', 'error')
  }
})

watch(() => props.preset, preset => runtime?.setPreset(preset))
watch(() => props.paused, paused => runtime?.setPaused(paused))
watch(() => props.quality, quality => runtime?.setQuality(quality))

onBeforeUnmount(() => runtime?.dispose())
</script>

<template>
  <canvas
    ref="flameCanvas"
    class="flame-canvas"
    aria-label="可交互的实时异火模拟"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @pointerleave="onPointerLeave"
  />
</template>
