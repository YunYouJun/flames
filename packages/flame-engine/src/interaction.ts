/** A short click remains visible even if down/up happen between rendered frames. */
export function ignitionPulse(elapsedMs: number): number {
  if (elapsedMs < 0 || elapsedMs >= 1100)
    return 0
  const progress = Math.max(0, (elapsedMs - 120) / 980)
  return (1 - progress) ** 2
}

/** Charge rises quickly and releases over 600 ms, even while the scene is paused. */
export class FlameCharge {
  value = 0
  private pressed = false
  private releaseAge = 600
  private releaseStart = 0

  get settled(): boolean {
    return this.value === (this.pressed ? 1 : 0)
  }

  setPressed(pressed: boolean): void {
    if (pressed === this.pressed)
      return
    this.pressed = pressed
    if (!pressed) {
      this.releaseStart = this.value
      this.releaseAge = 0
    }
  }

  update(deltaMs: number): void {
    const delta = Math.max(0, deltaMs)
    if (this.pressed) {
      this.value += (1 - this.value) * (1 - Math.exp(-delta / 105))
      if (1 - this.value < 0.001)
        this.value = 1
    }
    else {
      this.releaseAge = Math.min(600, this.releaseAge + delta)
      const t = this.releaseAge / 600
      this.value = this.releaseStart * (1 - t * t * (3 - 2 * t))
    }
  }

  reset(): void {
    this.value = 0
    this.pressed = false
    this.releaseStart = 0
    this.releaseAge = 600
  }
}
