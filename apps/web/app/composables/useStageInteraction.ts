import type { FlameRuntime } from '@yunyoujun/flame-engine'
import type { StageGesturePhase } from '../utils/stage-gesture'
import { StageGesture, stageHoldDelayMs } from '../utils/stage-gesture'

/** Own pointer capture and hold intent; the engine owns charge attack/release. */
export function useStageInteraction(options: {
  canvas: () => HTMLCanvasElement | null | undefined
  runtime: () => FlameRuntime | undefined
  rotating: () => boolean
  angle: () => number
  setAngle: (angle: number) => void
  stopOrbit: () => void
  interact: () => void
}) {
  const phase = shallowRef<StageGesturePhase>('idle')
  const gesture = new StageGesture()
  let activePointer: number | undefined
  let holdTimer: ReturnType<typeof setTimeout> | undefined
  let originAngle = 0
  let dragWidth = 1
  let point = { x: 0, y: 0 }

  function clearHold() {
    clearTimeout(holdTimer)
    holdTimer = undefined
  }

  function releaseCharge() {
    options.runtime()?.setPointer({ x: 0, y: 0, pressed: false, drag: 0 })
  }

  function pointerInput(pressed: boolean, distance = 0) {
    const rect = options.canvas()?.getBoundingClientRect()
    if (!rect)
      return
    options.runtime()?.setPointer({
      x: (point.x - rect.left) / rect.width * 2 - 1,
      y: -(point.y - rect.top) / rect.height * 2 + 1,
      pressed,
      drag: Math.min(distance / 220, 1),
    })
  }

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || activePointer !== undefined)
      return
    activePointer = event.pointerId
    point = { x: event.clientX, y: event.clientY }
    gesture.start(event.pointerId, point.x, point.y, event.timeStamp)
    phase.value = gesture.phase
    originAngle = options.angle()
    dragWidth = Math.max(options.canvas()?.clientWidth ?? 1, 1)
    options.canvas()?.setPointerCapture(event.pointerId)
    options.stopOrbit()
    // Wait for intent: starting an orbit must not flash a frame of charged fire.
    releaseCharge()
    holdTimer = setTimeout(() => {
      if (gesture.hold(event.pointerId)) {
        phase.value = gesture.phase
        pointerInput(true)
      }
    }, stageHoldDelayMs)
    options.interact()
  }

  function onPointerMove(event: PointerEvent) {
    if (!event.isPrimary || (activePointer !== undefined && activePointer !== event.pointerId))
      return
    point = { x: event.clientX, y: event.clientY }
    const previous = gesture.phase
    const movement = gesture.move(event.pointerId, point.x, point.y)
    phase.value = gesture.phase
    if (gesture.phase === 'dragging') {
      clearHold()
      if (options.rotating() && movement) {
        // Release only on takeover. Subsequent moves must not restart the fade.
        if (previous !== 'dragging')
          releaseCharge()
        const angle = originAngle - movement.dx / dragWidth * 180
        options.setAngle(((angle + 180) % 360 + 360) % 360 - 180)
      }
      else {
        pointerInput(true, movement?.distance)
      }
    }
    else if (gesture.phase === 'holding') {
      pointerInput(true)
    }
    else if (gesture.phase === 'idle' && !options.rotating()) {
      pointerInput(false)
    }
  }

  function releasePointer() {
    const id = activePointer
    activePointer = undefined
    if (id !== undefined && options.canvas()?.hasPointerCapture(id))
      options.canvas()?.releasePointerCapture(id)
  }

  function cancel() {
    clearHold()
    gesture.cancel()
    phase.value = 'idle'
    options.runtime()?.resetInteraction()
    releasePointer()
  }

  function onPointerUp(event: PointerEvent) {
    if (activePointer !== event.pointerId)
      return
    if (event.type === 'pointercancel' || event.type === 'lostpointercapture') {
      cancel()
      return
    }
    onPointerMove(event)
    clearHold()
    const tap = gesture.finish(event.pointerId, event.timeStamp)
    phase.value = gesture.phase
    releaseCharge()
    if (tap)
      options.runtime()?.ignite()
    releasePointer()
  }

  function onPointerLeave() {
    if (activePointer === undefined)
      releaseCharge()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter' && event.key !== ' ')
      return
    event.preventDefault()
    event.stopPropagation()
    if (!event.repeat && activePointer === undefined) {
      options.stopOrbit()
      options.runtime()?.ignite()
      options.interact()
    }
  }

  onMounted(() => window.addEventListener('blur', cancel))
  onBeforeUnmount(() => {
    window.removeEventListener('blur', cancel)
    cancel()
  })
  watch(options.rotating, cancel)

  return { phase: readonly(phase), cancel, onPointerDown, onPointerMove, onPointerUp, onPointerLeave, onKeyDown }
}
