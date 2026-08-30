import type { Group, Vector2 } from 'three'
import type { FlamePalette, FlameQuality } from '../types'

export interface FlameSculpture {
  readonly group: Group
  dispose: () => void
  restore: () => void
  setActive: (active: boolean) => void
  setAppearance: (palette: FlamePalette, speed: number, intensity: number) => void
  setQuality: (quality: FlameQuality) => void
  setViewport: (aspect: number) => void
  update: (time: number, pointer: Vector2, pressed: number, drag: number) => void
}
