import type { CrownKernelOptions, FlamePreset, FlameRuntimeDiagnostics, FlameRuntimeOptions, FluidKernelOptions, GaleKernelOptions, GeoFireKernelOptions, LotusKernelOptions, SoulKernelOptions, SpiritKernelOptions } from '../src/types'
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  flameKernelIds,
  flameKernelRegistry,
  getFlameKernelDefinition,
  getFlameKernelVariant,
} from '../src/kernel-registry'

describe('kernel registry', () => {
  it('registers every implemented kernel exactly once', () => {
    expect(flameKernelIds).toEqual(['void', 'lotus', 'cold', 'fluid', 'gale', 'spirit', 'soul', 'crown', 'geofire'])
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
    expectTypeOf<FlamePreset<'spirit'>['kernelOptions']>().toEqualTypeOf<SpiritKernelOptions | undefined>()
    expectTypeOf<FlamePreset<'soul'>['kernelOptions']>().toEqualTypeOf<SoulKernelOptions | undefined>()
    expectTypeOf<FlamePreset<'crown'>['kernelOptions']>().toEqualTypeOf<CrownKernelOptions | undefined>()
    expectTypeOf<FlamePreset<'geofire'>['kernelOptions']>().toEqualTypeOf<GeoFireKernelOptions | undefined>()
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

  it('maps reviewed spirit modes to stable shader variants', () => {
    const spiritPreset: FlamePreset<'spirit'> = {
      id: 'spirit-variant',
      rank: 1,
      kernel: 'spirit',
      palette: { core: '#ffffff', inner: '#b9d9ff', outer: '#3d4668' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...spiritPreset, kernelOptions: { spiritMode: 'thunder' } })).toBe(0)
    expect(getFlameKernelVariant({ ...spiritPreset, kernelOptions: { spiritMode: 'starlit' } })).toBe(1)
    expect(getFlameKernelVariant({ ...spiritPreset, kernelOptions: { spiritMode: 'turtle' } })).toBe(2)
    expect(getFlameKernelVariant({ ...spiritPreset, kernelOptions: { spiritMode: 'beasts' } })).toBe(3)
  })

  it('maps reviewed soul modes to stable shader variants', () => {
    const soulPreset: FlamePreset<'soul'> = {
      id: 'soul-variant',
      rank: 1,
      kernel: 'soul',
      palette: { core: '#ffffff', inner: '#ffe3b5', outer: '#4c2030' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...soulPreset, kernelOptions: { soulMode: 'heart' } })).toBe(0)
    expect(getFlameKernelVariant({ ...soulPreset, kernelOptions: { soulMode: 'duality' } })).toBe(1)
  })

  it('maps reviewed crown modes to stable shader variants', () => {
    const crownPreset: FlamePreset<'crown'> = {
      id: 'crown-variant',
      rank: 1,
      kernel: 'crown',
      palette: { core: '#ffffff', inner: '#ffbf32', outer: '#5f2800' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...crownPreset, kernelOptions: { crownMode: 'golden' } })).toBe(0)
    expect(getFlameKernelVariant({ ...crownPreset, kernelOptions: { crownMode: 'desolation' } })).toBe(1)
    expect(getFlameKernelVariant({ ...crownPreset, kernelOptions: { crownMode: 'ancestral' } })).toBe(2)
    expect(getFlameKernelVariant({ ...crownPreset, kernelOptions: { crownMode: 'emperor' } })).toBe(3)
  })

  it('maps reviewed geofire modes to stable shader variants', () => {
    const geofirePreset: FlamePreset<'geofire'> = {
      id: 'geofire-variant',
      rank: 1,
      kernel: 'geofire',
      palette: { core: '#fff2ad', inner: '#ef6725', outer: '#24140e' },
      speed: 1,
      scale: 1,
      turbulence: 1,
      intensity: 1,
    }

    expect(getFlameKernelVariant({ ...geofirePreset, kernelOptions: { earthMode: 'volcanic' } })).toBe(0)
    expect(getFlameKernelVariant({ ...geofirePreset, kernelOptions: { earthMode: 'seed' } })).toBe(1)
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
