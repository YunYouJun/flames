import type { CrownKernelOptions, FlamePreset, FluidKernelOptions, GaleKernelOptions, GeoFireKernelOptions, LotusKernelOptions, SoulKernelOptions, SpiritKernelOptions } from './types'
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
    const options = preset.kernelOptions as LotusKernelOptions
    if (options.bloomMode !== 'purifying' && options.bloomMode !== 'karmic' && options.bloomMode !== 'earthcore')
      throw new Error(`Flame preset "${preset.id}" has an unsupported lotus bloomMode.`)
  }
  else if (preset.kernel === 'fluid' && preset.kernelOptions) {
    const options = preset.kernelOptions as FluidKernelOptions
    if (options.flowMode !== 'tidal' && options.flowMode !== 'verdant' && options.flowMode !== 'cloudwater' && options.flowMode !== 'venom')
      throw new Error(`Flame preset "${preset.id}" has an unsupported fluid flowMode.`)
  }
  else if (preset.kernel === 'gale' && preset.kernelOptions) {
    const options = preset.kernelOptions as GaleKernelOptions
    if (options.galeMode !== 'nether' && options.galeMode !== 'dragon')
      throw new Error(`Flame preset "${preset.id}" has an unsupported gale galeMode.`)
  }
  else if (preset.kernel === 'spirit' && preset.kernelOptions) {
    const options = preset.kernelOptions as SpiritKernelOptions
    if (options.spiritMode !== 'thunder' && options.spiritMode !== 'starlit' && options.spiritMode !== 'turtle' && options.spiritMode !== 'beasts')
      throw new Error(`Flame preset "${preset.id}" has an unsupported spirit spiritMode.`)
  }
  else if (preset.kernel === 'soul' && preset.kernelOptions) {
    const options = preset.kernelOptions as SoulKernelOptions
    if (options.soulMode !== 'heart' && options.soulMode !== 'duality')
      throw new Error(`Flame preset "${preset.id}" has an unsupported soul soulMode.`)
  }
  else if (preset.kernel === 'crown' && preset.kernelOptions) {
    const options = preset.kernelOptions as CrownKernelOptions
    if (options.crownMode !== 'golden' && options.crownMode !== 'desolation' && options.crownMode !== 'ancestral' && options.crownMode !== 'emperor')
      throw new Error(`Flame preset "${preset.id}" has an unsupported crown crownMode.`)
  }
  else if (preset.kernel === 'geofire' && preset.kernelOptions) {
    const options = preset.kernelOptions as GeoFireKernelOptions
    if (options.earthMode !== 'volcanic' && options.earthMode !== 'seed')
      throw new Error(`Flame preset "${preset.id}" has an unsupported geofire earthMode.`)
  }
  else if (preset.kernelOptions !== undefined) {
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
