import type { FlamePreset, FlameRuntimeDiagnostics, FlameRuntimeOptions, LotusKernelOptions } from '../src/types'
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  flameKernelIds,
  flameKernelRegistry,
  getFlameKernelDefinition,
} from '../src/kernel-registry'

describe('kernel registry', () => {
  it('registers every implemented kernel exactly once', () => {
    expect(flameKernelIds).toEqual(['void', 'lotus', 'cold'])
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
