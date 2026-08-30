const STORAGE_KEY = 'flames:seen'

export function useFlameProgress() {
  const seen = useState<string[]>('flames-seen', () => [])

  function markSeen(slug: string) {
    if (!seen.value.includes(slug))
      seen.value = [...seen.value, slug]
    if (import.meta.client)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seen.value))
  }

  onMounted(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      if (Array.isArray(stored))
        seen.value = stored.filter(item => typeof item === 'string')
    }
    catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  })

  return {
    markSeen,
    seenCount: computed(() => seen.value.length),
  }
}
