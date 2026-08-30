import type { IUniform, Vector2 } from 'three'
import type { FlamePalette, FlameQuality } from '../types'
import type { FlameSculpture } from './flame-sculpture'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  ShaderMaterial,
} from 'three'
import { lotusPetalFragmentShader, lotusPetalVertexShader } from '../shaders/lotus-petal'

interface PetalLayerSpec {
  arch: number
  baseHeight: number
  baseRadius: number
  count: number
  cup: number
  highOnly: boolean
  length: number
  offset: number
  spin: number
  tipLift: number
  width: number
}

interface BloomPetal {
  mesh: Mesh<BufferGeometry, ShaderMaterial>
  minimumQuality: number
}

const qualityRank: Record<FlameQuality, number> = {
  lite: 0,
  balanced: 1,
  high: 2,
}

const layerSpecs: PetalLayerSpec[] = [
  {
    arch: 0.19,
    baseHeight: -0.15,
    baseRadius: 0.11,
    count: 9,
    cup: 0.075,
    highOnly: true,
    length: 0.74,
    offset: Math.PI / 9,
    spin: 0.10,
    tipLift: 0.08,
    width: 0.34,
  },
  {
    arch: 0.29,
    baseHeight: -0.13,
    baseRadius: 0.08,
    count: 8,
    cup: 0.065,
    highOnly: false,
    length: 0.58,
    offset: 0,
    spin: -0.14,
    tipLift: 0.23,
    width: 0.28,
  },
  {
    arch: 0.34,
    baseHeight: -0.11,
    baseRadius: 0.045,
    count: 6,
    cup: 0.052,
    highOnly: false,
    length: 0.42,
    offset: Math.PI / 6,
    spin: 0.19,
    tipLift: 0.42,
    width: 0.22,
  },
]

function createPetalGeometry(spec: PetalLayerSpec): BufferGeometry {
  const widthSegments = 8
  const lengthSegments = 14
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let row = 0; row <= lengthSegments; row += 1) {
    const progress = row / lengthSegments
    const widthProfile = (1 - progress) * 0.14 + Math.sin(Math.PI * progress) ** 0.68 * 0.86
    const radial = spec.baseRadius + spec.length * progress

    for (let column = 0; column <= widthSegments; column += 1) {
      const across = column / widthSegments
      const side = across * 2 - 1
      const sideCurve = side * side * widthProfile
      const x = side * spec.width * widthProfile * (0.84 + progress * 0.16)
      const y = spec.baseHeight
        + Math.sin(Math.PI * progress) * spec.arch
        + progress * progress * spec.tipLift
        + sideCurve * spec.cup
      const z = radial - sideCurve * spec.cup * 0.72

      positions.push(x, y, z)
      uvs.push(across, progress)
    }
  }

  const rowSize = widthSegments + 1
  for (let row = 0; row < lengthSegments; row += 1) {
    for (let column = 0; column < widthSegments; column += 1) {
      const current = row * rowSize + column
      const next = current + rowSize
      indices.push(current, next, current + 1)
      indices.push(next, next + 1, current + 1)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.setIndex(indices)
  geometry.computeBoundingSphere()
  return geometry
}

export class LotusBloom implements FlameSculpture {
  readonly group = new Group()

  private readonly geometries: BufferGeometry[] = []
  private readonly layerGroups: Group[] = []
  private readonly material: ShaderMaterial
  private readonly petals: BloomPetal[] = []
  private active = false
  private intensity = 1
  private quality: FlameQuality
  private speed = 1
  private viewportScale = 1

  constructor(palette: FlamePalette, quality: FlameQuality) {
    this.quality = quality
    this.material = new ShaderMaterial({
      vertexShader: lotusPetalVertexShader,
      fragmentShader: lotusPetalFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      side: DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1 },
        uPressed: { value: 0 },
        uIntensity: { value: 1 },
        uQuality: { value: qualityRank[quality] / 2 },
        uCore: { value: new Color(palette.core) },
        uInner: { value: new Color(palette.inner) },
        uOuter: { value: new Color(palette.outer) },
      },
    })

    this.group.position.y = -0.26
    this.group.rotation.x = -0.04
    this.group.renderOrder = 2

    for (const [layerIndex, spec] of layerSpecs.entries()) {
      const layer = new Group()
      const geometry = createPetalGeometry(spec)
      this.geometries.push(geometry)
      this.layerGroups.push(layer)

      for (let index = 0; index < spec.count; index += 1) {
        const petal = new Mesh(geometry, this.material)
        petal.rotation.y = spec.offset + (index / spec.count) * Math.PI * 2
        petal.renderOrder = 2 + layerIndex
        layer.add(petal)
        this.petals.push({
          mesh: petal,
          minimumQuality: spec.highOnly && index % 2 === 1 ? 2 : 1,
        })
      }

      this.group.add(layer)
    }

    this.setQuality(quality)
    this.setActive(false)
  }

  dispose(): void {
    for (const geometry of this.geometries)
      geometry.dispose()
    this.material.dispose()
  }

  restore(): void {
    this.material.needsUpdate = true
  }

  setActive(active: boolean): void {
    this.active = active
    this.group.visible = active && this.quality !== 'lite'
  }

  setAppearance(palette: FlamePalette, speed: number, intensity: number): void {
    this.speed = speed
    this.intensity = intensity
    this.uniform<Color>('uCore').value.set(palette.core)
    this.uniform<Color>('uInner').value.set(palette.inner)
    this.uniform<Color>('uOuter').value.set(palette.outer)
    this.uniform<number>('uSpeed').value = speed
    this.uniform<number>('uIntensity').value = intensity
  }

  setQuality(quality: FlameQuality): void {
    this.quality = quality
    const rank = qualityRank[quality]
    this.uniform<number>('uQuality').value = rank / 2
    this.group.visible = this.active && rank > 0

    for (const layer of this.layerGroups)
      layer.visible = rank > 0
    for (const petal of this.petals)
      petal.mesh.visible = rank >= petal.minimumQuality
  }

  setViewport(aspect: number): void {
    this.viewportScale = Math.min(1.08, Math.max(0.80, aspect / 1.05))
  }

  update(time: number, pointer: Vector2, pressed: number, drag: number): void {
    if (!this.group.visible)
      return

    this.uniform<number>('uTime').value = time
    this.uniform<number>('uSpeed').value = this.speed
    this.uniform<number>('uIntensity').value = this.intensity
    this.uniform<number>('uPressed').value = pressed

    const scale = this.viewportScale * (1 + pressed * 0.055)
    this.group.scale.setScalar(scale)
    this.group.rotation.x = -0.04 - pointer.y * 0.075
    this.group.rotation.z = -pointer.x * 0.035

    for (const [index, layer] of this.layerGroups.entries()) {
      const spec = layerSpecs[index]
      if (!spec)
        continue
      const pointerTurn = pointer.x * (0.11 + index * 0.025)
      layer.rotation.y = time * this.speed * spec.spin + pointerTurn + drag * spec.spin * 0.72
    }
  }

  private uniform<T>(name: string): IUniform<T> {
    const uniform = this.material.uniforms[name] as IUniform<T> | undefined
    if (!uniform)
      throw new Error(`Missing lotus bloom uniform: ${name}`)
    return uniform
  }
}
