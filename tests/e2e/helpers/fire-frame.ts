import type { Buffer } from 'node:buffer'
import { PNG } from 'pngjs'

/**
 * Compare actual RGBA pixels, allowing only the measured +/-2 channel-level
 * compositor dithering of an otherwise stationary SwiftShader frame.
 */
export class FireFrame {
  private readonly image: PNG

  constructor(png: Buffer) {
    this.image = PNG.sync.read(png)
  }

  equals(other: FireFrame): boolean {
    const a = this.image
    const b = other.image
    if (a.width !== b.width || a.height !== b.height)
      return false
    for (let index = 0; index < a.data.length; index++) {
      if (Math.abs(a.data[index]! - b.data[index]!) > 2)
        return false
    }
    return true
  }
}
