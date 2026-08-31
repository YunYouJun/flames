import type { FlameSculpture } from './objects/flame-sculpture'
import type { FlameKernelId, FlamePalette, FlamePreset, FlameQuality, FluidKernelOptions, LotusKernelOptions } from './types'
import { LotusBloom } from './objects/lotus-bloom'
import { TidalBasin } from './objects/tidal-basin'
import { VoidVortex } from './objects/void-vortex'
import { coldFragmentShader } from './shaders/cold'
import { fluidFragmentShader } from './shaders/fluid'
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
  fluid: {
    id: 'fluid',
    fragmentShader: fluidFragmentShader,
    createSculpture: (palette, quality) => new TidalBasin(palette, quality),
  },
} satisfies Record<FlameKernelId, FlameKernelDefinition>

export const flameKernelIds = Object.keys(flameKernelRegistry) as FlameKernelId[]

export function getFlameKernelDefinition(kernel: FlameKernelId): FlameKernelDefinition {
  return flameKernelRegistry[kernel]
}

export function getFlameKernelVariant(preset: FlamePreset): number {
  if (preset.kernel === 'lotus') {
    const options = preset.kernelOptions as LotusKernelOptions | undefined
    if (options?.bloomMode === 'karmic')
      return 1
    if (options?.bloomMode === 'earthcore')
      return 2
  }
  if (preset.kernel === 'fluid') {
    const options = preset.kernelOptions as FluidKernelOptions | undefined
    if (options?.flowMode === 'verdant')
      return 1
    if (options?.flowMode === 'cloudwater')
      return 2
    if (options?.flowMode === 'venom')
      return 3
  }
  return 0
}
