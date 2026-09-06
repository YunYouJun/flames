import { flameRoster } from '~/data/flames'

/** Navigate adjacent roster seats without taking over editing or dialog controls. */
export function useFlameKeyboardNavigation(activeSlug: () => string, enabled: () => boolean): void {
  let navigating = false

  async function onKeydown(event: KeyboardEvent) {
    if (!enabled() || navigating || event.defaultPrevented || event.repeat || event.isComposing
      || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return
    }
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
      return

    const target = event.target
    if (target instanceof HTMLElement && (target.isContentEditable
      || target.closest('input, textarea, select, [role="slider"], [role="spinbutton"], [role="combobox"], [role="listbox"], [role="tablist"], [role="menu"], [role="dialog"]'))) {
      return
    }

    const index = flameRoster.findIndex(flame => flame.slug === activeSlug())
    if (index < 0)
      return
    const next = flameRoster[index + (event.key === 'ArrowLeft' ? -1 : 1)]
    if (!next)
      return

    event.preventDefault()
    navigating = true
    try {
      await navigateTo(`/flames/${next.slug}`)
    }
    finally {
      navigating = false
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
