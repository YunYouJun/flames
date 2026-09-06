import type { IUniform } from 'three'
import type { FlameSculpture } from './objects/flame-sculpture'
import type {
  CrownKernelOptions,
  FlameKernelId,
  FlamePointerInput,
  FlamePreset,
  FlameQuality,
  FlameRuntimeDiagnostics,
  FlameRuntimeOptions,
  FlameRuntimeStatus,
} from './types'
import {
  AdditiveBlending,
  Color,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { FlameCharge, ignitionPulse } from './interaction'
import { flameKernelIds, getFlameKernelDefinition, getFlameKernelVariant } from './kernel-registry'
import { FlameAltar } from './objects/flame-altar'
import { VolumeFlame } from './objects/volume-flame'
import { validateFlamePreset } from './preset'
import { vertexShader } from './shaders/shared'

const pixelRatioCaps: Record<FlameQuality, number> = {
  high: 2,
  balanced: 1.5,
  lite: 1,
}

const shaderQuality: Record<FlameQuality, number> = {
  high: 1,
  balanced: 0.55,
  lite: 0,
}

export class FlameRuntime {
  readonly renderer: WebGLRenderer
  readonly scene = new Scene()
  readonly camera = new PerspectiveCamera(32, 1, 0.1, 20)

  private readonly timer = new Timer()
  private readonly geometry = new PlaneGeometry(2, 2)
  private readonly mesh: Mesh<PlaneGeometry, ShaderMaterial>
  private readonly sculptures: Partial<Record<FlameKernelId, FlameSculpture>>
  private readonly materials = new Map<FlameKernelId, ShaderMaterial>()
  private readonly resizeObserver: ResizeObserver
  private readonly pointer = new Vector2()
  private readonly pointerTarget = new Vector2()
  private readonly altar?: FlameAltar
  private readonly volume = new VolumeFlame()
  private readonly projectedSource = new Vector3()
  private viewAngle = 0
  private needsRender = true
  private frameId = 0
  private readonly charge = new FlameCharge()
  private pulseAge = Infinity
  private pulsePending = false
  private lastFrame = 0
  private drag = 0
  private dragTarget = 0
  private preset: FlamePreset
  private quality: FlameQuality
  private paused: boolean
  private status: FlameRuntimeStatus = 'idle'
  private readonly onStatusChange?: (status: FlameRuntimeStatus) => void
  private readonly benchmarkTime?: number

  constructor(options: FlameRuntimeOptions) {
    this.preset = validateFlamePreset(options.preset)
    this.quality = options.quality ?? 'balanced'
    this.paused = options.paused ?? false
    this.benchmarkTime = options.benchmarkTime
    this.onStatusChange = options.onStatusChange

    this.renderer = new WebGLRenderer({
      canvas: options.canvas,
      alpha: true,
      antialias: this.quality !== 'lite',
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.info.autoReset = false
    this.timer.connect(document)
    // Include the pedestal's front foot below the source plane, with room to orbit.
    if (options.altar)
      this.camera.fov = 36
    this.camera.position.set(0, 0.68, 3.35)
    this.camera.lookAt(0, -0.18, 0)
    this.mesh = new Mesh(this.geometry, this.materialFor(this.preset.kernel))
    this.mesh.renderOrder = -10
    this.scene.add(this.mesh)
    if (options.altar) {
      this.altar = new FlameAltar()
      this.scene.add(this.altar.group)
    }
    this.sculptures = Object.fromEntries(flameKernelIds.flatMap((kernel) => {
      const sculpture = getFlameKernelDefinition(kernel).createSculpture?.(this.preset.palette, this.quality)
      return sculpture ? [[kernel, sculpture]] : []
    }))
    for (const sculpture of Object.values(this.sculptures))
      this.scene.add(sculpture.group)

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(options.canvas)
    options.canvas.addEventListener('webglcontextlost', this.handleContextLost)
    options.canvas.addEventListener('webglcontextrestored', this.handleContextRestored)

    this.applyPreset(this.preset)
    this.resize()
    this.setStatus('ready')
    this.start()
  }

  setPreset(preset: FlamePreset): void {
    this.resetInteraction()
    this.needsRender = true
    this.preset = validateFlamePreset(preset)
    this.mesh.material = this.materialFor(preset.kernel)
    this.applyPreset(preset)
  }

  setPointer(input: FlamePointerInput): void {
    this.needsRender = true
    this.pointerTarget.set(input.x, input.y)
    this.charge.setPressed(input.pressed)
    this.dragTarget = Math.max(0, Math.min(input.drag, 1))
  }

  /** Ignite once, independently of the paused/benchmark animation clock. */
  ignite(): void {
    this.pulsePending = true
    this.needsRender = true
  }

  /** Clear interaction when a gesture is cancelled or the displayed flame changes. */
  resetInteraction(): void {
    this.pointer.set(0, 0)
    this.pointerTarget.set(0, 0)
    this.charge.reset()
    this.drag = this.dragTarget = 0
    this.pulseAge = Infinity
    this.pulsePending = false
    this.needsRender = true
  }

  /** Set a bounded inspection angle in degrees; the fire source stays centered. */
  setViewAngle(degrees: number): void {
    this.needsRender = true
    const limit = this.usesVolume() ? 180 : 12
    this.viewAngle = Math.max(-limit, Math.min(limit, degrees)) * Math.PI / 180
    this.camera.position.set(Math.sin(this.viewAngle) * 3.35, 0.68, Math.cos(this.viewAngle) * 3.35)
    this.camera.lookAt(0, -0.18, 0)
    this.camera.updateMatrixWorld()
  }

  setPaused(paused: boolean): void {
    this.paused = paused
    if (!paused)
      this.timer.reset()
  }

  setQuality(quality: FlameQuality): void {
    this.resetInteraction()
    this.quality = quality
    this.syncVolume()
    this.setViewAngle(this.viewAngle * 180 / Math.PI)
    for (const material of this.materials.values())
      this.uniform<number>(material, 'uQuality').value = shaderQuality[quality]
    for (const sculpture of Object.values(this.sculptures))
      sculpture.setQuality(quality)
    this.resize()
  }

  async warmup(kernels: readonly FlameKernelId[] = flameKernelIds): Promise<void> {
    const currentMaterial = this.mesh.material
    for (const kernel of kernels) {
      this.mesh.material = this.materialFor(kernel)
      this.setActiveSculpture(kernel)
      this.renderer.compile(this.scene, this.camera)
    }
    this.mesh.material = currentMaterial
    this.setActiveSculpture(this.preset.kernel)
  }

  getDiagnostics(): FlameRuntimeDiagnostics {
    const info = this.renderer.info
    return {
      activeKernel: this.preset.kernel,
      renderMode: this.usesVolume() ? 'volume' : 'planar',
      programs: info.programs?.length ?? 0,
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    }
  }

  dispose(): void {
    if (this.status === 'disposed')
      return

    cancelAnimationFrame(this.frameId)
    this.resizeObserver.disconnect()
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost)
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored)
    this.geometry.dispose()
    this.altar?.dispose()
    this.volume.dispose()
    for (const sculpture of Object.values(this.sculptures))
      sculpture.dispose()
    for (const material of this.materials.values())
      material.dispose()
    this.materials.clear()
    this.renderer.dispose()
    this.timer.dispose()
    this.setStatus('disposed')
  }

  private readonly handleContextLost = (event: Event): void => {
    event.preventDefault()
    cancelAnimationFrame(this.frameId)
    this.setStatus('context-lost')
  }

  private readonly handleContextRestored = (): void => {
    for (const material of this.materials.values())
      material.needsUpdate = true
    for (const sculpture of Object.values(this.sculptures))
      sculpture.restore()
    this.setStatus('ready')
    this.start()
  }

  private materialFor(kernel: FlameKernelId): ShaderMaterial {
    const cached = this.materials.get(kernel)
    if (cached)
      return cached

    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader: `${getFlameKernelDefinition(kernel).fragmentShader.replace(/void main\s*\(\s*\)/, 'void flameMain()')}
        void main() {
          flameMain();
          if (uAltarSource > 0.0)
            gl_FragColor.a *= smoothstep(uAltarSource - 0.015, uAltarSource + 0.025, vUv.y);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uAltarSource: { value: 0 },
        uViewYaw: { value: 0 },
        uResolution: { value: new Vector2(1, 1) },
        uPointer: { value: new Vector2() },
        uPressed: { value: 0 },
        uDrag: { value: 0 },
        uScale: { value: 1 },
        uSpeed: { value: 1 },
        uTurbulence: { value: 1 },
        uIntensity: { value: 1 },
        uQuality: { value: shaderQuality[this.quality] },
        uVariant: { value: 0 },
        uCore: { value: new Color(0xFFFFFF) },
        uInner: { value: new Color(0xFFFFFF) },
        uOuter: { value: new Color(0xFFFFFF) },
      },
    })

    this.materials.set(kernel, material)
    return material
  }

  private applyPreset(preset: FlamePreset): void {
    this.syncVolume()
    this.setViewAngle(this.viewAngle * 180 / Math.PI)
    this.altar?.setAppearance(preset)
    const material = this.mesh.material
    const usesAdditiveFire = preset.kernel === 'crown'
      && (preset.kernelOptions as CrownKernelOptions | undefined)?.crownMode === 'golden'
    material.blending = usesAdditiveFire ? AdditiveBlending : NormalBlending
    this.uniform<number>(material, 'uScale').value = preset.scale
    this.uniform<number>(material, 'uSpeed').value = preset.speed
    this.uniform<number>(material, 'uTurbulence').value = preset.turbulence
    this.uniform<number>(material, 'uIntensity').value = preset.intensity
    this.uniform<number>(material, 'uVariant').value = getFlameKernelVariant(preset)
    this.uniform<Color>(material, 'uCore').value.set(preset.palette.core)
    this.uniform<Color>(material, 'uInner').value.set(preset.palette.inner)
    this.uniform<Color>(material, 'uOuter').value.set(preset.palette.outer)
    this.sculptures[preset.kernel]?.setAppearance(preset.palette, preset.speed, preset.intensity, preset.kernelOptions)
    this.setActiveSculpture(preset.kernel)
  }

  private resize(): void {
    this.needsRender = true
    const canvas = this.renderer.domElement
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    const ratio = Math.min(window.devicePixelRatio || 1, pixelRatioCaps[this.quality])
    this.renderer.setPixelRatio(ratio)
    this.renderer.setSize(width, height, false)
    // setSize rounds the viewport at fractional DPR; returning from a render
    // target floors it. Match the composite pass now so the first lit frame does
    // not shift by one physical pixel after the first interaction (e.g. DPR 1.5).
    this.renderer.setRenderTarget(null)
    this.volume.setResolution(width * ratio, height * ratio)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.altar?.setViewport(width / height)
    this.volume.setViewport(width / height)
    if (this.altar) {
      this.volume.mesh.position.copy(this.altar.group.position)
      this.volume.mesh.scale.copy(this.altar.group.scale)
    }
    for (const sculpture of Object.values(this.sculptures))
      sculpture.setViewport(width / height)

    for (const material of this.materials.values())
      this.uniform<Vector2>(material, 'uResolution').value.set(width * ratio, height * ratio)
  }

  private start(): void {
    this.needsRender = true
    cancelAnimationFrame(this.frameId)
    this.timer.reset()
    this.frameId = requestAnimationFrame(this.render)
  }

  private readonly render = (timestamp: number): void => {
    this.frameId = requestAnimationFrame(this.render)
    if (this.status !== 'ready' || (this.paused && !this.needsRender))
      return
    this.needsRender = false

    this.timer.update(timestamp)
    // Time-based easing keeps input responsive on slower GPUs, not just at 60 fps.
    const delta = Math.min(Math.max(timestamp - this.lastFrame, 0), 100)
    this.lastFrame = timestamp
    const response = 1 - Math.exp(-delta / 105)
    this.pointer.lerp(this.pointerTarget, response)
    this.charge.update(delta)
    this.drag += (this.dragTarget - this.drag) * response
    if (this.pointer.distanceToSquared(this.pointerTarget) < 0.000001)
      this.pointer.copy(this.pointerTarget)
    if (Math.abs(this.dragTarget - this.drag) < 0.001)
      this.drag = this.dragTarget
    // Cap elapsed input time so a stalled GPU cannot consume the entire pulse
    // before the compositor has presented it. Normal frame rates retain 1.1 s.
    this.pulseAge = this.pulsePending ? 0 : this.pulseAge + delta
    this.pulsePending = false
    const pulse = ignitionPulse(this.pulseAge)
    const energy = Math.max(this.charge.value, pulse)
    this.needsRender = pulse > 0 || !this.charge.settled
      || this.pointer.distanceToSquared(this.pointerTarget) > 0.000001
      || Math.abs(this.dragTarget - this.drag) > 0.001

    const material = this.mesh.material
    const time = this.uniform<number>(material, 'uTime')
    time.value = this.benchmarkTime ?? time.value + (this.paused ? 0 : this.timer.getDelta())
    if (this.altar) {
      this.camera.updateMatrixWorld()
      this.uniform<number>(material, 'uAltarSource').value = (this.projectedSource.copy(this.altar.group.position).project(this.camera).y + 1) / 2
      this.uniform<number>(material, 'uViewYaw').value = this.viewAngle
      this.altar.update(time.value, this.preset.intensity, energy)
    }
    this.uniform<Vector2>(material, 'uPointer').value.copy(this.pointer)
    this.uniform<number>(material, 'uPressed').value = energy
    this.uniform<number>(material, 'uDrag').value = this.drag
    this.sculptures[this.preset.kernel]?.update(
      time.value,
      this.pointer,
      energy,
      this.drag,
    )
    if (this.volume.mesh.visible)
      this.volume.update(this.camera, time.value * this.preset.speed, this.pointer, energy, this.drag)
    if (this.usesVolume() && this.preset.kernel === 'lotus') {
      const bloom = this.sculptures.lotus!.group
      bloom.scale.multiplyScalar(0.9)
      // Petal geometry starts below its local origin; anchor its root to the source.
      bloom.position.y = this.volume.mesh.position.y + 0.13 * bloom.scale.y
    }
    this.renderer.info.reset()
    this.renderer.render(this.scene, this.camera)
    if (this.volume.mesh.visible)
      this.volume.render(this.renderer, this.camera)
  }

  private usesVolume(): boolean {
    return this.quality !== 'lite'
  }

  private syncVolume(): void {
    this.volume.mesh.visible = this.usesVolume()
    this.mesh.visible = !this.volume.mesh.visible
    this.volume.setQuality(this.quality)
    this.volume.setAppearance(this.preset)
    // Existing petals, vortex cores and tidal rings share the volume camera and depth buffer.
    const target = this.usesVolume() ? this.volume.scene : this.scene
    for (const sculpture of Object.values(this.sculptures))
      target.add(sculpture.group)
  }

  private setActiveSculpture(kernel: FlameKernelId): void {
    for (const [id, sculpture] of Object.entries(this.sculptures))
      sculpture.setActive(id === kernel)
  }

  private uniform<T>(material: ShaderMaterial, name: string): IUniform<T> {
    const uniform = material.uniforms[name] as IUniform<T> | undefined
    if (!uniform)
      throw new Error(`Missing shader uniform: ${name}`)
    return uniform
  }

  private setStatus(status: FlameRuntimeStatus): void {
    this.status = status
    this.onStatusChange?.(status)
  }
}
