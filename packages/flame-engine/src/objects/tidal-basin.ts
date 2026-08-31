import type { IUniform, Vector2 } from 'three'
import type { FlameKernelOptions, FlamePalette, FlameQuality, FluidKernelOptions } from '../types'
import type { FlameSculpture } from './flame-sculpture'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  Mesh,
  RingGeometry,
  ShaderMaterial,
} from 'three'
import { tidalRingFragmentShader, tidalRingVertexShader } from '../shaders/tidal-basin'

interface TidalRing {
  group: Group
  minimumQuality: number
  phase: number
  scale: number
  spin: number
}

const qualityRank: Record<FlameQuality, number> = {
  lite: 0,
  balanced: 1,
  high: 2,
}

const ringSpecs: Array<Omit<TidalRing, 'group'>> = [
  { minimumQuality: 1, phase: 0.0, scale: 0.64, spin: 0.18 },
  { minimumQuality: 1, phase: 1.9, scale: 0.88, spin: -0.13 },
  { minimumQuality: 1, phase: 4.1, scale: 1.10, spin: 0.10 },
  { minimumQuality: 2, phase: 5.4, scale: 1.32, spin: -0.08 },
]

export class TidalBasin implements FlameSculpture {
  readonly group = new Group()

  private readonly geometry = new RingGeometry(0.49, 0.57, 96, 2)
  private readonly material: ShaderMaterial
  private readonly rings: TidalRing[] = []
  private active = false
  private intensity = 1
  private quality: FlameQuality
  private speed = 1
  private variant = 0
  private viewportScale = 1

  constructor(palette: FlamePalette, quality: FlameQuality) {
    this.quality = quality
    this.material = new ShaderMaterial({
      vertexShader: tidalRingVertexShader,
      fragmentShader: tidalRingFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: DoubleSide,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1 },
        uPressed: { value: 0 },
        uDrag: { value: 0 },
        uIntensity: { value: 1 },
        uQuality: { value: qualityRank[quality] / 2 },
        uVariant: { value: 0 },
        uCore: { value: new Color(palette.core) },
        uInner: { value: new Color(palette.inner) },
        uOuter: { value: new Color(palette.outer) },
      },
    })

    this.group.position.y = -0.43
    this.group.renderOrder = 3

    for (const spec of ringSpecs) {
      const ringGroup = new Group()
      const ring = new Mesh(this.geometry, this.material)
      ring.renderOrder = 3
      ringGroup.add(ring)
      this.group.add(ringGroup)
      this.rings.push({ ...spec, group: ringGroup })
    }

    this.setQuality(quality)
    this.setActive(false)
  }

  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
  }

  restore(): void {
    this.material.needsUpdate = true
  }

  setActive(active: boolean): void {
    this.active = active
    this.group.visible = active && this.quality !== 'lite'
  }

  setAppearance(palette: FlamePalette, speed: number, intensity: number, options?: FlameKernelOptions): void {
    const fluidOptions = options as FluidKernelOptions | undefined
    this.speed = speed
    this.intensity = intensity
    this.variant = fluidOptions?.flowMode === 'verdant'
      ? 1
      : fluidOptions?.flowMode === 'cloudwater'
        ? 2
        : fluidOptions?.flowMode === 'venom'
          ? 3
          : 0
    this.uniform<Color>('uCore').value.set(palette.core)
    this.uniform<Color>('uInner').value.set(palette.inner)
    this.uniform<Color>('uOuter').value.set(palette.outer)
    this.uniform<number>('uSpeed').value = speed
    this.uniform<number>('uIntensity').value = intensity
    this.uniform<number>('uVariant').value = this.variant
  }

  setQuality(quality: FlameQuality): void {
    this.quality = quality
    const rank = qualityRank[quality]
    this.uniform<number>('uQuality').value = rank / 2
    this.group.visible = this.active && rank > 0
    for (const ring of this.rings)
      ring.group.visible = rank >= ring.minimumQuality
  }

  setViewport(aspect: number): void {
    this.viewportScale = Math.min(1.12, Math.max(0.82, aspect / 1.05))
  }

  update(time: number, pointer: Vector2, pressed: number, drag: number): void {
    if (!this.group.visible)
      return

    this.uniform<number>('uTime').value = time
    this.uniform<number>('uSpeed').value = this.speed
    this.uniform<number>('uPressed').value = pressed
    this.uniform<number>('uDrag').value = drag
    this.uniform<number>('uIntensity').value = this.intensity

    const verdant = this.variant === 1 ? 1 : 0
    const cloudwater = this.variant === 2 ? 1 : 0
    const venom = this.variant === 3 ? 1 : 0
    const scale = this.viewportScale * (1 - verdant * 0.08 + cloudwater * 0.06 + venom * 0.03) * (1 + pressed * (0.08 + venom * 0.04))
    this.group.scale.set(scale, scale * (1 + cloudwater * 0.12), scale)
    this.group.position.x = pointer.x * 0.025 + drag * (0.018 + venom * 0.022)
    this.group.position.y = -0.43 + pointer.y * 0.012 + cloudwater * 0.06 - venom * 0.025

    for (const [index, ring] of this.rings.entries()) {
      ring.group.visible = qualityRank[this.quality] >= ring.minimumQuality && (!verdant || index === 0)
      const clock = time * this.speed
      const breath = 1 + Math.sin(clock * 0.72 + ring.phase) * 0.018
      const pressExpansion = pressed * (0.10 + index * 0.025 + venom * 0.014)
      ring.group.scale.setScalar(ring.scale * (breath + pressExpansion))
      ring.group.rotation.set(
        -1.28 + pointer.y * 0.045,
        clock * ring.spin * (1 - verdant * 0.35 + venom * 0.28) + pointer.x * 0.055 + drag * ring.spin * (2.8 + venom * 1.4),
        pointer.x * 0.022 + Math.sin(clock * 0.34 + ring.phase) * 0.012,
      )
    }
  }

  private uniform<T>(name: string): IUniform<T> {
    const uniform = this.material.uniforms[name] as IUniform<T> | undefined
    if (!uniform)
      throw new Error(`Missing tidal basin uniform: ${name}`)
    return uniform
  }
}
