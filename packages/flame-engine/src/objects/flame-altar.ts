import type { FlamePreset } from '../types'
import { CanvasTexture, CylinderGeometry, DirectionalLight, Group, HemisphereLight, IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, PointLight, RingGeometry, SRGBColorSpace } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/** A low-draw-call, lit stone and metal pedestal with its origin on the fire surface. */
export class FlameAltar {
  readonly group = new Group()
  readonly light = new PointLight(0xFFAA44, 2.5, 3, 2)
  private readonly stone = new MeshStandardMaterial({ color: 0x252A32, metalness: 0.3, roughness: 0.48 })
  private readonly metal = new MeshStandardMaterial({ color: 0xAE9870, metalness: 0.8, roughness: 0.26 })
  private readonly seal = new MeshStandardMaterial({ color: 0xAA8844, emissive: 0xAA8844, emissiveIntensity: 0.8, metalness: 0.6, roughness: 0.35 })
  private readonly meshes: Mesh[] = []
  private readonly inscription = document.createElement('canvas')
  private readonly texture = new CanvasTexture(this.inscription)
  private readonly badgeMaterial = new MeshBasicMaterial({ map: this.texture, transparent: true, depthWrite: false })
  private readonly grain = new CanvasTexture(document.createElement('canvas'))
  private readonly crater: Mesh

  constructor() {
    // Shared deterministic mineral relief: generated once, without external assets.
    const surface = this.grain.image as HTMLCanvasElement
    surface.width = surface.height = 256
    const relief = surface.getContext('2d')
    if (relief) {
      const pixels = relief.createImageData(256, 256)
      let seed = 73
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
          const vein = Math.sin(x * 0.09 + Math.sin(y * 0.045) * 3)
          const value = 160 + (seed / 4294967296) * 65 + vein * 18
          const offset = (y * 256 + x) * 4
          pixels.data[offset] = pixels.data[offset + 1] = pixels.data[offset + 2] = value
          pixels.data[offset + 3] = 255
        }
      }
      relief.putImageData(pixels, 0, 0)
      this.grain.needsUpdate = true
    }
    this.stone.bumpMap = this.grain
    this.stone.bumpScale = 0.018
    this.stone.roughnessMap = this.grain
    this.stone.roughness = 0.9
    this.metal.bumpMap = this.grain
    this.metal.bumpScale = 0.004
    this.metal.roughnessMap = this.grain
    this.metal.roughness = 0.55
    const layers = [
      [0.78, 0.86, 0.065, -0.035],
      [0.72, 0.68, 0.14, -0.135],
      [0.68, 0.81, 0.055, -0.23],
      [0.81, 0.83, 0.035, -0.275],
    ] as const
    const body = layers.map(([top, bottom, height, y]) => new CylinderGeometry(top, bottom, height, 8).translate(0, y, 0))
    const trim = [-0.01, -0.072, -0.26].map((y, index) => new CylinderGeometry(index === 2 ? 0.815 : 0.787, index === 2 ? 0.815 : 0.787, 0.009, 8).translate(0, y, 0))
    const rings = [0.30, 0.49, 0.65].map(radius => new RingGeometry(radius, radius + 0.007, 64).rotateX(-Math.PI / 2).translate(0, 0.002, 0))
    for (let i = 0; i < 8; i++) {
      rings.push(new RingGeometry(0.52, 0.62, 1, 1, i * Math.PI / 4, 0.018).rotateX(-Math.PI / 2).translate(0, 0.003, 0))
    }
    for (const [parts, material] of [[body, this.stone], [trim, this.metal], [rings, this.seal]] as const) {
      const geometry = mergeGeometries(parts)
      const mesh = new Mesh(geometry, material)
      this.meshes.push(mesh)
      this.group.add(mesh)
      parts.forEach(part => part.dispose())
    }
    const key = new DirectionalLight(0xC4D4ED, 1.35)
    key.position.set(-2, 3, 2)
    const rim = new DirectionalLight(0xD9B77D, 1.8)
    rim.position.set(1.5, 0.7, -2)
    this.light.position.set(0, 0.35, 0)
    this.group.add(key, rim, new HemisphereLight(0xA3B6CD, 0x171009, 0.65), this.light)
    this.group.position.y = -0.76
    this.inscription.width = this.inscription.height = 128
    this.texture.colorSpace = SRGBColorSpace
    const badge = new Mesh(new PlaneGeometry(0.13, 0.13), this.badgeMaterial)
    badge.position.set(0, -0.14, 0.725)
    this.meshes.push(badge)
    this.group.add(badge)
    // One merged mesh shares the altar's lit stone; no new material or texture.
    const rocks = Array.from({ length: 7 }, (_, index) => {
      const angle = index * Math.PI * 2 / 7
      return new IcosahedronGeometry(0.14, 0)
        .scale(1.1, 0.7 + (index % 3) * 0.25, 0.8)
        .rotateY(angle + 0.4)
        .translate(Math.cos(angle) * 0.42, 0.06, Math.sin(angle) * 0.42)
    })
    this.crater = new Mesh(mergeGeometries(rocks), this.stone)
    this.crater.visible = false
    this.meshes.push(this.crater)
    this.group.add(this.crater)
    rocks.forEach(rock => rock.dispose())
  }

  setAppearance(preset: FlamePreset): void {
    this.crater.visible = preset.id === 'volcanic-stone'
    this.light.color.set(preset.palette.inner)
    this.seal.color.set(preset.palette.inner)
    this.seal.emissive.set(preset.palette.inner)
    this.metal.color.set(0xAE9870).lerp(this.light.color, 0.18)
    const marks = '帝虚净金生荒祖业星幽骨雷龟心海云山风莲毒衡兽玄'
    const context = this.inscription.getContext('2d')
    if (context) {
      context.clearRect(0, 0, 128, 128)
      context.strokeStyle = context.fillStyle = '#decba0'
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(64, 3)
      context.lineTo(125, 64)
      context.lineTo(64, 125)
      context.lineTo(3, 64)
      context.closePath()
      context.stroke()
      context.font = '52px serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(marks[preset.rank - 1] ?? '火', 64, 66)
      this.texture.needsUpdate = true
    }
    // Family-specific proportions preserve a shared source plane at local y = 0.
    const roundFamilies = ['fluid', 'void', 'soul']
    const sealMesh = this.meshes[2]!
    sealMesh.scale.setScalar(preset.kernel === 'lotus' ? 0.88 : 1)
    sealMesh.rotation.y = roundFamilies.includes(preset.kernel) ? Math.PI / 8 : 0
  }

  setViewport(aspect: number): void {
    this.group.scale.setScalar(0.74 * Math.min(1, aspect / 0.9))
  }

  update(time: number, intensity: number, pressed: number): void {
    const flicker = 1 + 0.1 * Math.sin(time * 9.3) + 0.06 * Math.sin(time * 17.1)
    // A moving emitter creates changing highlights on the actual stone relief.
    this.light.position.set(Math.sin(time * 1.7) * 0.07, 0.32 + Math.sin(time * 2.3) * 0.025, Math.cos(time * 1.3) * 0.06)
    this.light.intensity = (1.05 + pressed * 0.7) * intensity * flicker
    this.seal.emissiveIntensity = 0.16 * flicker + pressed * 0.2
  }

  dispose(): void {
    this.meshes.forEach(mesh => mesh.geometry.dispose())
    this.stone.dispose()
    this.metal.dispose()
    this.seal.dispose()
    this.texture.dispose()
    this.grain.dispose()
    this.badgeMaterial.dispose()
  }
}
