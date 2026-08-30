export function useAmbientSound() {
  let context: AudioContext | undefined
  let master: GainNode | undefined
  let oscillators: OscillatorNode[] = []

  async function ensureGraph() {
    if (context)
      return

    context = new AudioContext()
    master = context.createGain()
    master.gain.value = 0

    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 180
    filter.Q.value = 0.8
    filter.connect(master)
    master.connect(context.destination)

    oscillators = [43, 58].map((frequency, index) => {
      const oscillator = context!.createOscillator()
      const gain = context!.createGain()
      oscillator.type = index === 0 ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.value = index === 0 ? 0.52 : 0.12
      oscillator.connect(gain).connect(filter)
      oscillator.start()
      return oscillator
    })
  }

  async function setMuted(muted: boolean) {
    await ensureGraph()
    if (!context || !master)
      return
    await context.resume()
    master.gain.cancelScheduledValues(context.currentTime)
    master.gain.linearRampToValueAtTime(muted ? 0 : 0.028, context.currentTime + 0.45)
  }

  onScopeDispose(() => {
    for (const oscillator of oscillators)
      oscillator.stop()
    void context?.close()
  })

  return { setMuted }
}
