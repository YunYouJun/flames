import type { FlamePreset, FlameRuntimeDiagnostics, FlameRuntimeOptions, FluidKernelOptions, GaleKernelOptions, LotusKernelOptions } from '../src/types'
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  flameKernelIds,
  flameKernelRegistry,
  getFlameKernelDefinition,
  getFlameKernelVariant,
} from '../src/kernel-registry'

describe('kernel registry', () => {
  it('registers every implemented kernel exactly once', () => {
    expect(flameKernelIds).toEqual(['void', 'lotus', 'cold', 'fluid', 'gale'])
    expect(Object.keys(flameKernelRegistry)).toEqual(flameKernelIds)

    for (const id of flameKernelIds) {
      const definition = getFlameKernelDefinition(id)
      expect(definition.id).toBe(id)
      expect(definition.fragmentShader.length).toBeGreaterThan(100)
    }
  })

  it('keeps kernel options typed without changing existing presets', () => {
    expectTypeOf<FlamePreset<'lotus'>['kernel']>().toEqualTypeOf<'lotus'>()
    expectTypeOf<FlamePreset<'lotus'>['kernelOptions']>().toEqualTypeOf<LotusKernelOptions | undefined>()
    expectTypeOf<FlamePreset<'fluid'>['kernelOptions']>().toEqualTypeOf<FluidKernelOptions | undefined>()
    expectTypeOf<FlamePreset<'gale'>['kernelOptions']>().toEqualTypeOf<GaleKernelOptions | undefined>()
  })

  it('maps reviewed lotus modes to stable shader variants', () => {
    const lotusPreset: FlamePreset<'lotus'> = {
      id: 'lotus-variant',
      rank: 1,
      kernel: 'lotus',
      palette: { core: '#ffffff', inner: '#88ffaa', outer: '#003322' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...lotusPreset, kernelOptions: { bloomMode: 'purifying' } })).toBe(0)
    expect(getFlameKernelVariant({ ...lotusPreset, kernelOptions: { bloomMode: 'karmic' } })).toBe(1)
    expect(getFlameKernelVariant({ ...lotusPreset, kernelOptions: { bloomMode: 'earthcore' } })).toBe(2)
  })

  it('maps reviewed fluid modes to stable shader variants', () => {
    const fluidPreset: FlamePreset<'fluid'> = {
      id: 'fluid-variant',
      rank: 1,
      kernel: 'fluid',
      palette: { core: '#ffffff', inner: '#44bbff', outer: '#08245f' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...fluidPreset, kernelOptions: { flowMode: 'tidal' } })).toBe(0)
    expect(getFlameKernelVariant({ ...fluidPreset, kernelOptions: { flowMode: 'verdant' } })).toBe(1)
    expect(getFlameKernelVariant({ ...fluidPreset, kernelOptions: { flowMode: 'cloudwater' } })).toBe(2)
    expect(getFlameKernelVariant({ ...fluidPreset, kernelOptions: { flowMode: 'venom' } })).toBe(3)
  })

  it('maps reviewed gale modes to stable shader variants', () => {
    const galePreset: FlamePreset<'gale'> = {
      id: 'gale-variant',
      rank: 1,
      kernel: 'gale',
      palette: { core: '#ffffff', inner: '#8fa8a8', outer: '#111619' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...galePreset, kernelOptions: { galeMode: 'nether' } })).toBe(0)
    expect(getFlameKernelVariant({ ...galePreset, kernelOptions: { galeMode: 'dragon' } })).toBe(1)
  })

  it('exposes a stable diagnostics contract', () => {
    expectTypeOf<FlameRuntimeDiagnostics>().toMatchTypeOf<{
      activeKernel: string
      programs: number
      calls: number
      triangles: number
      geometries: number
      textures: number
    }>()
    expectTypeOf<FlameRuntimeOptions['benchmarkTime']>().toEqualTypeOf<number | undefined>()
  })
})
