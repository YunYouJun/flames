import type { FlameSculpture } from './objects/flame-sculpture'
import type { FlameKernelId, FlamePalette, FlameQuality } from './types'
import { LotusBloom } from './objects/lotus-bloom'
import { VoidVortex } from './objects/void-vortex'
import { coldFragmentShader } from './shaders/cold'
import { lotusFragmentShader } from './shaders/lotus'
import { voidFragmentShader } from './shaders/void'

export interface FlameKernelDefinition {
  id: FlameKernelId
  fragmentShader: string
  createSculpture?: (palette: FlamePalette, quality: FlameQuality) => FlameSculpture
}

export const flameKernelRegistry = {
  void: {
    id: 'void',
    fragmentShader: voidFragmentShader,
    createSculpture: (palette, quality) => new VoidVortex(palette, quality),
  },
  lotus: {
    id: 'lotus',
    fragmentShader: lotusFragmentShader,
    createSculpture: (palette, quality) => new LotusBloom(palette, quality),
  },
  cold: {
    id: 'cold',
    fragmentShader: coldFragmentShader,
  },
} satisfies Record<FlameKernelId, FlameKernelDefinition>

export const flameKernelIds = Object.keys(flameKernelRegistry) as FlameKernelId[]

export function getFlameKernelDefinition(kernel: FlameKernelId): FlameKernelDefinition {
  return flameKernelRegistry[kernel]
}
