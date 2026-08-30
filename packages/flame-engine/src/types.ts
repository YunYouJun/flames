import type { ColorRepresentation } from 'three'

export type FlameKernelId = 'void' | 'lotus' | 'cold'
export type FlameQuality = 'high' | 'balanced' | 'lite'
export type FlameRuntimeStatus = 'idle' | 'ready' | 'context-lost' | 'disposed' | 'error'

export interface FlamePalette {
  core: ColorRepresentation
  inner: ColorRepresentation
  outer: ColorRepresentation
}

export interface FlamePreset {
  id: string
  rank: number
  kernel: FlameKernelId
  palette: FlamePalette
  speed: number
  scale: number
  turbulence: number
  intensity: number
}

export interface FlamePointerInput {
  x: number
  y: number
  pressed: boolean
  drag: number
}

export interface FlameRuntimeOptions {
  canvas: HTMLCanvasElement
  preset: FlamePreset
  quality?: FlameQuality
  paused?: boolean
  onStatusChange?: (status: FlameRuntimeStatus) => void
}
