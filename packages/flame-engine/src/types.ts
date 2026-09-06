import type { ColorRepresentation } from 'three'

export type FlameKernelId = 'void' | 'lotus' | 'cold' | 'fluid' | 'gale' | 'spirit' | 'soul' | 'crown' | 'geofire'
export type FlameQuality = 'high' | 'balanced' | 'lite'
export type FlameRuntimeStatus = 'idle' | 'ready' | 'context-lost' | 'disposed' | 'error'

export interface LotusKernelOptions {
  bloomMode: 'purifying' | 'karmic' | 'earthcore'
}

export interface FluidKernelOptions {
  flowMode: 'tidal' | 'verdant' | 'cloudwater' | 'venom'
}

export interface GaleKernelOptions {
  galeMode: 'nether' | 'dragon'
}

export interface SpiritKernelOptions {
  spiritMode: 'thunder' | 'starlit' | 'turtle' | 'beasts'
}

export interface SoulKernelOptions {
  soulMode: 'heart' | 'duality'
}

export interface CrownKernelOptions {
  crownMode: 'golden' | 'desolation' | 'ancestral' | 'emperor'
}

export interface GeoFireKernelOptions {
  earthMode: 'volcanic' | 'seed'
}

/**
 * Kernel-specific controls are added here as a kernel gains reviewed variants.
 * `never` keeps today's presets unchanged while preserving a typed extension point.
 */
export interface FlameKernelOptionsMap {
  void: never
  lotus: LotusKernelOptions
  cold: never
  fluid: FluidKernelOptions
  gale: GaleKernelOptions
  spirit: SpiritKernelOptions
  soul: SoulKernelOptions
  crown: CrownKernelOptions
  geofire: GeoFireKernelOptions
}

export type FlameKernelOptions = FlameKernelOptionsMap[FlameKernelId]

export interface FlamePalette {
  core: ColorRepresentation
  inner: ColorRepresentation
  outer: ColorRepresentation
}

export interface FlamePreset<K extends FlameKernelId = FlameKernelId> {
  id: string
  rank: number
  kernel: K
  kernelOptions?: FlameKernelOptionsMap[K]
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
  /** Render a lit three-dimensional pedestal beneath the flame. */
  altar?: boolean
  /** Locks the animated uniforms to one repeatable frame for visual and performance checks. */
  benchmarkTime?: number
  onStatusChange?: (status: FlameRuntimeStatus) => void
}

/** Read-only renderer counters used by performance checks and diagnostics UIs. */
export interface FlameRuntimeDiagnostics {
  activeKernel: FlameKernelId
  renderMode: 'volume' | 'planar'
  programs: number
  calls: number
  triangles: number
  geometries: number
  textures: number
}
