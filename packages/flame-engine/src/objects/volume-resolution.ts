import type { FlameQuality } from '../types'

/** Bound ray-march pixel cost while giving thin silhouettes a sharper sampling grid. */
export function getVolumeResolution(width: number, height: number, quality: FlameQuality, detailed: boolean): { width: number, height: number } {
  if (quality === 'lite')
    return { width: 1, height: 1 }
  const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 1
  const safeHeight = Number.isFinite(height) ? Math.max(1, height) : 1
  const requestedScale = quality === 'high' ? detailed ? 0.65 : 0.45 : detailed ? 0.5 : 0.35
  const pixelBudget = quality === 'high' ? 600_000 : 300_000
  const scale = Math.min(requestedScale, Math.sqrt(pixelBudget / (safeWidth * safeHeight)), 4096 / safeWidth, 4096 / safeHeight)
  return { width: Math.max(1, Math.floor(safeWidth * scale)), height: Math.max(1, Math.floor(safeHeight * scale)) }
}
