import { PNG } from 'pngjs'
import { describe, expect, it } from 'vitest'
import { FireFrame } from '../e2e/helpers/fire-frame'

function frame(channel: number, width = 2) {
  const image = new PNG({ width, height: 2 })
  image.data.fill(channel)
  return new FireFrame(PNG.sync.write(image))
}

describe('fire frame comparison', () => {
  it('accepts the measured stationary compositor dither in either direction', () => {
    expect(frame(100).equals(frame(102))).toBe(true)
    expect(frame(100).equals(frame(98))).toBe(true)
  })

  it('still rejects an actual pixel response or a different crop size', () => {
    expect(frame(100).equals(frame(103))).toBe(false)
    expect(frame(100).equals(frame(100, 3))).toBe(false)
  })
})
