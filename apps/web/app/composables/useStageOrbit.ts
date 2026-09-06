/** View-only animation, stopped by manual input, pause, or a capability change. */
export function useStageOrbit(options: { limit: () => number, paused: () => boolean }) {
  const angle = shallowRef(0)
  const automatic = shallowRef(false)
  let frame = 0
  let previous = 0

  function stop() {
    automatic.value = false
    cancelAnimationFrame(frame)
    previous = 0
  }

  function reset() {
    stop()
    angle.value = 0
  }

  function tick(time: number) {
    if (!automatic.value)
      return
    if (previous && !document.hidden)
      angle.value = ((angle.value + Math.min((time - previous) / 1000, 0.1) * 12 + 180) % 360) - 180
    previous = document.hidden ? 0 : time
    frame = requestAnimationFrame(tick)
  }

  function toggle() {
    if (automatic.value) {
      stop()
    }
    else if (!options.paused() && options.limit() === 180) {
      automatic.value = true
      previous = 0
      frame = requestAnimationFrame(tick)
    }
  }

  watch(options.paused, paused => paused && stop())
  watch(options.limit, reset)
  onBeforeUnmount(stop)
  return { angle, automatic, stop, reset, toggle }
}
