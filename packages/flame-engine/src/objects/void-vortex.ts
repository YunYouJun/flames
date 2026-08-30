import type { IUniform, Vector2 } from 'three'
import type { FlamePalette, FlameQuality } from '../types'
import type { FlameSculpture } from './flame-sculpture'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three'
import {
  voidCoreFragmentShader,
  voidCoreVertexShader,
  voidRingFragmentShader,
  voidRingVertexShader,
} from '../shaders/void-vortex'

interface VortexRing {
  baseRotation: [number, number, number]
  group: Group
  minimumQuality: number
  scale: number
  spin: number
}

const qualityRank: Record<FlameQuality, number> = {
  lite: 0,
  balanced: 1,
  high: 2,
}

const ringSpecs: Array<Omit<VortexRing, 'group'>> = [
  { baseRotation: [0.18, 0.12, 0.05], minimumQuality: 1, scale: 0.80, spin: 0.22 },
  { baseRotation: [1.05, 0.42, 0.58], minimumQuality: 1, scale: 1.02, spin: -0.18 },
  { baseRotation: [0.72, 1.08, -0.64], minimumQuality: 1, scale: 1.22, spin: 0.28 },
  { baseRotation: [1.34, -0.38, 1.10], minimumQuality: 2, scale: 1.42, spin: -0.34 },
]

export class VoidVortex implements FlameSculpture {
  readonly group = new Group()

  private readonly coreGeometry = new SphereGeometry(0.32, 32, 24)
  private readonly coreMaterial: ShaderMaterial
  private readonly coreMesh: Mesh<SphereGeometry, ShaderMaterial>
  private readonly ringGeometry = new TorusGeometry(0.49, 0.018, 8, 96)
  private readonly ringMaterial: ShaderMaterial
  private readonly rings: VortexRing[] = []
  private active = false
  private quality: FlameQuality
  private speed = 1
  private viewportScale = 1

  constructor(palette: FlamePalette, quality: FlameQuality) {
    this.quality = quality
    const sharedUniforms = {
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uPressed: { value: 0 },
      uIntensity: { value: 1 },
      uQuality: { value: qualityRank[quality] / 2 },
      uCore: { value: new Color(palette.core) },
      uInner: { value: new Color(palette.inner) },
      uOuter: { value: new Color(palette.outer) },
    }

    this.coreMaterial = new ShaderMaterial({
      vertexShader: voidCoreVertexShader,
      fragmentShader: voidCoreFragmentShader,
      uniforms: sharedUniforms,
    })
    this.ringMaterial = new ShaderMaterial({
      vertexShader: voidRingVertexShader,
      fragmentShader: voidRingFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: DoubleSide,
      blending: AdditiveBlending,
      uniforms: sharedUniforms,
    })

    this.coreMesh = new Mesh(this.coreGeometry, this.coreMaterial)
    this.coreMesh.renderOrder = 2
    this.group.add(this.coreMesh)

    for (const spec of ringSpecs) {
      const ringGroup = new Group()
      const ringMesh = new Mesh(this.ringGeometry, this.ringMaterial)
      ringMesh.renderOrder = 3
      ringGroup.add(ringMesh)
      this.group.add(ringGroup)
      this.rings.push({ ...spec, group: ringGroup })
    }

    this.group.position.y = -0.10
    this.setQuality(quality)
    this.setActive(false)
  }

  dispose(): void {
    this.coreGeometry.dispose()
    this.ringGeometry.dispose()
    this.coreMaterial.dispose()
    this.ringMaterial.dispose()
  }

  restore(): void {
    this.coreMaterial.needsUpdate = true
    this.ringMaterial.needsUpdate = true
  }

  setActive(active: boolean): void {
    this.active = active
    this.group.visible = active && this.quality !== 'lite'
  }

  setAppearance(palette: FlamePalette, speed: number, intensity: number): void {
    this.speed = speed
    for (const material of [this.coreMaterial, this.ringMaterial]) {
      this.uniform<Color>(material, 'uCore').value.set(palette.core)
      this.uniform<Color>(material, 'uInner').value.set(palette.inner)
      this.uniform<Color>(material, 'uOuter').value.set(palette.outer)
      this.uniform<number>(material, 'uSpeed').value = speed
      this.uniform<number>(material, 'uIntensity').value = intensity
    }
  }

  setQuality(quality: FlameQuality): void {
    this.quality = quality
    const rank = qualityRank[quality]
    this.group.visible = this.active && rank > 0
    this.uniform<number>(this.coreMaterial, 'uQuality').value = rank / 2
    this.uniform<number>(this.ringMaterial, 'uQuality').value = rank / 2
    for (const ring of this.rings)
      ring.group.visible = rank >= ring.minimumQuality
  }

  setViewport(aspect: number): void {
    this.viewportScale = Math.min(1.08, Math.max(0.82, aspect / 1.05))
  }

  update(time: number, pointer: Vector2, pressed: number, drag: number): void {
    if (!this.group.visible)
      return

    for (const material of [this.coreMaterial, this.ringMaterial]) {
      this.uniform<number>(material, 'uTime').value = time
      this.uniform<number>(material, 'uPressed').value = pressed
    }

    const scale = this.viewportScale * (1 + pressed * 0.04)
    this.group.scale.setScalar(scale)
    this.group.rotation.x = -0.03 - pointer.y * 0.10
    this.group.rotation.y = pointer.x * 0.14
    this.group.rotation.z = -pointer.x * 0.035
    this.coreMesh.rotation.y = -time * this.speed * 0.13
    this.coreMesh.rotation.x = time * this.speed * 0.07

    for (const [index, ring] of this.rings.entries()) {
      const [x, y, z] = ring.baseRotation
      const clock = time * this.speed * ring.spin
      ring.group.rotation.set(
        x + Math.sin(clock * 0.7 + index) * 0.08 + pointer.y * 0.08,
        y + clock + pointer.x * 0.12,
        z + clock * 0.43 + drag * ring.spin * 1.8,
      )
      ring.group.scale.setScalar(ring.scale * (1 + pressed * (0.08 + index * 0.012)))
    }
  }

  private uniform<T>(material: ShaderMaterial, name: string): IUniform<T> {
    const uniform = material.uniforms[name] as IUniform<T> | undefined
    if (!uniform)
      throw new Error(`Missing void vortex uniform: ${name}`)
    return uniform
  }
}
