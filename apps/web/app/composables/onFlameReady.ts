/** Start critical scene work after SSG route restoration, without waiting for idle time. */
export function onFlameReady(callback: () => void | Promise<void>): void {
  if (import.meta.server)
    return

  const app = useNuxtApp()
  let disposed = false
  let started = false
  let removeHook = () => {}

  async function start() {
    if (started || disposed)
      return
    started = true
    removeHook()
    // Parent preferences and template refs must settle before allocating GL.
    await nextTick()
    if (!disposed)
      await callback()
  }

  // Nuxt restores deferred static-route queries in this hook before component
  // callbacks. Register in setup order: experience preferences precede its stage.
  if (app.isHydrating)
    removeHook = app.hook('app:suspense:resolve', start)
  else
    onMounted(start)

  onBeforeUnmount(() => {
    disposed = true
    removeHook()
  })
}
