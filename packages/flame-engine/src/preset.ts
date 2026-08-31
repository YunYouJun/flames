import type { FlamePreset } from './types'
import { Color } from 'three'

export function validateFlamePreset(preset: FlamePreset): FlamePreset {
  if (!preset.id.trim())
    throw new Error('Flame preset id is required.')

  if (!Number.isInteger(preset.rank) || preset.rank < 1)
    throw new Error(`Flame preset "${preset.id}" requires a positive integer rank.`)

  for (const [name, value] of Object.entries({
    speed: preset.speed,
    scale: preset.scale,
    turbulence: preset.turbulence,
    intensity: preset.intensity,
  })) {
    if (!Number.isFinite(value) || value <= 0)
      throw new Error(`Flame preset "${preset.id}" requires ${name} to be greater than zero.`)
  }

  for (const color of Object.values(preset.palette))
    new Color(color).getHex()

  if (preset.kernel === 'lotus' && preset.kernelOptions) {
    if (preset.kernelOptions.bloomMode !== 'purifying' && preset.kernelOptions.bloomMode !== 'karmic')
      throw new Error(`Flame preset "${preset.id}" has an unsupported lotus bloomMode.`)
  }
  else if (preset.kernel !== 'lotus' && preset.kernelOptions !== undefined) {
    throw new Error(`Flame preset "${preset.id}" does not support kernelOptions.`)
  }

  return preset
}

export function validateFlameCatalog(presets: FlamePreset[]): FlamePreset[] {
  const ids = new Set<string>()
  const ranks = new Set<number>()

  for (const preset of presets) {
    validateFlamePreset(preset)
    if (ids.has(preset.id))
      throw new Error(`Duplicate flame preset id: ${preset.id}`)
    if (ranks.has(preset.rank))
      throw new Error(`Duplicate flame rank: ${preset.rank}`)
    ids.add(preset.id)
    ranks.add(preset.rank)
  }

  return presets
}
