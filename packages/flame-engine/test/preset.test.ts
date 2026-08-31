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

  it('accepts reviewed gale modes and rejects unknown variants', () => {
    for (const galeMode of ['nether', 'dragon'] as const) {
      const galePreset = {
        ...preset,
        kernel: 'gale',
        kernelOptions: { galeMode },
      } as unknown as FlamePreset
      expect(validateFlamePreset(galePreset)).toBe(galePreset)
    }

    expect(() => validateFlamePreset({
      ...preset,
      kernel: 'gale',
      kernelOptions: { galeMode: 'unknown' },
    } as unknown as FlamePreset)).toThrow(/galeMode/)
  })

  it('accepts reviewed spirit modes and rejects unknown variants', () => {
    for (const spiritMode of ['thunder', 'starlit', 'turtle', 'beasts'] as const) {
      const spiritPreset = {
        ...preset,
        kernel: 'spirit',
        kernelOptions: { spiritMode },
      } as unknown as FlamePreset
      expect(validateFlamePreset(spiritPreset)).toBe(spiritPreset)
    }

    expect(() => validateFlamePreset({
      ...preset,
      kernel: 'spirit',
      kernelOptions: { spiritMode: 'unknown' },
    } as unknown as FlamePreset)).toThrow(/spiritMode/)
  })

  it('accepts reviewed soul modes and rejects unknown variants', () => {
    for (const soulMode of ['heart', 'duality'] as const) {
      const soulPreset = {
        ...preset,
        kernel: 'soul',
        kernelOptions: { soulMode },
      } as unknown as FlamePreset
      expect(validateFlamePreset(soulPreset)).toBe(soulPreset)
    }

    expect(() => validateFlamePreset({
      ...preset,
      kernel: 'soul',
      kernelOptions: { soulMode: 'unknown' },
    } as unknown as FlamePreset)).toThrow(/soulMode/)
  })

  it('accepts reviewed crown modes and rejects unknown variants', () => {
    for (const crownMode of ['golden', 'desolation', 'ancestral', 'emperor'] as const) {
      const crownPreset = {
        ...preset,
        kernel: 'crown',
        kernelOptions: { crownMode },
      } as unknown as FlamePreset
      expect(validateFlamePreset(crownPreset)).toBe(crownPreset)
    }

    expect(() => validateFlamePreset({
      ...preset,
      kernel: 'crown',
      kernelOptions: { crownMode: 'unknown' },
    } as unknown as FlamePreset)).toThrow(/crownMode/)
  })

  it('rejects duplicate catalog ranks', () => {
    expect(() => validateFlameCatalog([
      preset,
      { ...preset, id: 'another' },
    ])).toThrow(/rank/)
  })
})
