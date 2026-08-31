import type { FlamePreset } from '../src'
import { describe, expect, it } from 'vitest'
import { validateFlameCatalog, validateFlamePreset } from '../src'

const preset: FlamePreset = {
  id: 'test-flame',
  rank: 1,
  kernel: 'lotus',
  palette: {
    core: '#ffffff',
    inner: '#9fd8da',
    outer: '#a88a55',
  },
  speed: 1,
  scale: 1,
  turbulence: 1,
  intensity: 1,
}

describe('flame preset validation', () => {
  it('accepts a complete preset', () => {
    expect(validateFlamePreset(preset)).toBe(preset)
  })

  it('rejects invalid numeric parameters', () => {
    expect(() => validateFlamePreset({ ...preset, speed: 0 })).toThrow(/speed/)
  })

  it('rejects unsupported lotus bloom modes', () => {
    expect(() => validateFlamePreset({
      ...preset,
      kernelOptions: { bloomMode: 'unknown' },
    } as unknown as FlamePreset)).toThrow(/bloomMode/)
  })

  it('accepts the earthcore lotus bloom mode', () => {
    const earthcorePreset = {
      ...preset,
      kernelOptions: { bloomMode: 'earthcore' },
    } as unknown as FlamePreset

    expect(validateFlamePreset(earthcorePreset)).toBe(earthcorePreset)
  })

  it('accepts reviewed fluid flow modes', () => {
    for (const flowMode of ['tidal', 'verdant', 'cloudwater', 'venom'] as const) {
      const fluidPreset = {
        ...preset,
        kernel: 'fluid',
        kernelOptions: { flowMode },
      } as unknown as FlamePreset

      expect(validateFlamePreset(fluidPreset)).toBe(fluidPreset)
    }
  })

  it('rejects unsupported fluid flow modes', () => {
    expect(() => validateFlamePreset({
      ...preset,
      kernel: 'fluid',
      kernelOptions: { flowMode: 'unknown' },
    } as unknown as FlamePreset)).toThrow(/flowMode/)
  })

  it('rejects duplicate catalog ranks', () => {
    expect(() => validateFlameCatalog([
      preset,
      { ...preset, id: 'another' },
    ])).toThrow(/rank/)
  })
})
