import { describe, expect, it } from 'vitest'
import { getVolumeResolution } from '../src/objects/volume-resolution'

describe('volume sampling resolution', () => {
  it('gives fine silhouettes more samples without increasing march steps', () => {
    expect(getVolumeResolution(1000, 600, 'balanced', false)).toEqual({ width: 350, height: 210 })
    expect(getVolumeResolution(1000, 600, 'balanced', true)).toEqual({ width: 500, height: 300 })
    expect(getVolumeResolution(1000, 600, 'high', true)).toEqual({ width: 650, height: 390 })
  })

  it.each(['balanced', 'high'] as const)('caps %s ray-march pixel cost on large or narrow surfaces', (quality) => {
    for (const [width, height] of [[7680, 4320], [4320, 7680], [1_000_000, 1], [1, 1_000_000]]) {
      const size = getVolumeResolution(width!, height!, quality, true)
      expect(size.width * size.height).toBeLessThanOrEqual(quality === 'high' ? 600_000 : 300_000)
      expect(Math.max(size.width, size.height)).toBeLessThanOrEqual(4096)
      expect(Math.min(size.width, size.height)).toBeGreaterThanOrEqual(1)
    }
  })

  it('releases the sampling area for lite and handles zero-sized surfaces', () => {
    expect(getVolumeResolution(2000, 1200, 'lite', true)).toEqual({ width: 1, height: 1 })
    expect(getVolumeResolution(0, 0, 'high', true)).toEqual({ width: 1, height: 1 })
    expect(getVolumeResolution(Number.NaN, Number.POSITIVE_INFINITY, 'balanced', true)).toEqual({ width: 1, height: 1 })
  })
})
