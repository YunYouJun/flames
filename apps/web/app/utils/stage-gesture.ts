export const stageHoldDelayMs = 250
export type StageGesturePhase = 'idle' | 'pending' | 'holding' | 'dragging'

/** One pointer owns the gesture; a drag stays latched even on a return trip. */
export class StageGesture {
  private origin?: { id: number, x: number, y: number, time: number }
  moved = false
  phase: StageGesturePhase = 'idle'

  start(id: number, x: number, y: number, time: number): void {
    this.origin = { id, x, y, time }
    this.moved = false
    this.phase = 'pending'
  }

  owns(id: number): boolean {
    return this.origin?.id === id
  }

  hold(id: number): boolean {
    if (!this.owns(id) || this.phase !== 'pending')
      return false
    this.phase = 'holding'
    return true
  }

  move(id: number, x: number, y: number): { dx: number, distance: number } | undefined {
    if (!this.origin || !this.owns(id))
      return
    const dx = x - this.origin.x
    const distance = Math.hypot(dx, y - this.origin.y)
    this.moved ||= distance >= 8
    if (this.moved)
      this.phase = 'dragging'
    return { dx, distance }
  }

  finish(id: number, time: number, cancelled = false): boolean {
    if (!this.origin || !this.owns(id))
      return false
    const tap = !cancelled && this.phase === 'pending' && time - this.origin.time < stageHoldDelayMs
    this.cancel()
    return tap
  }

  cancel(): void {
    this.origin = undefined
    this.moved = false
    this.phase = 'idle'
  }
}
