import type { IUniform } from 'three'
import type { FlameSculpture } from './objects/flame-sculpture'
import type {
  FlameKernelId,
  FlamePointerInput,
  FlamePreset,
  FlameQuality,
  FlameRuntimeDiagnostics,
  FlameRuntimeOptions,
  FlameRuntimeStatus,
} from './types'
import {
  Color,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Vector2,
  WebGLRenderer,
} from 'three'
import { flameKernelIds, getFlameKernelDefinition } from './kernel-registry'
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
  private frameId = 0
  private pressed = 0
  private pressedTarget = 0
  private drag = 0
  private dragTarget = 0
  private preset: FlamePreset
  private quality: FlameQuality
  private paused: boolean
  private status: FlameRuntimeStatus = 'idle'
  private readonly onStatusChange?: (status: FlameRuntimeStatus) => void

  constructor(options: FlameRuntimeOptions) {
    this.preset = validateFlamePreset(options.preset)
    this.quality = options.quality ?? 'balanced'
    this.paused = options.paused ?? false
    this.onStatusChange = options.onStatusChange

    this.renderer = new WebGLRenderer({
      canvas: options.canvas,
      alpha: true,
      antialias: this.quality !== 'lite',
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.timer.connect(document)
    this.camera.position.set(0, 0.68, 3.35)
    this.camera.lookAt(0, -0.18, 0)
    this.mesh = new Mesh(this.geometry, this.materialFor(this.preset.kernel))
    this.mesh.renderOrder = -10
    this.scene.add(this.mesh)
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
    this.preset = validateFlamePreset(preset)
    this.mesh.material = this.materialFor(preset.kernel)
    this.applyPreset(preset)
  }

  setPointer(input: FlamePointerInput): void {
    this.pointerTarget.set(input.x, input.y)
    this.pressedTarget = input.pressed ? 1 : 0
    this.dragTarget = Math.max(0, Math.min(input.drag, 1))
  }

  setPaused(paused: boolean): void {
    this.paused = paused
    if (!paused)
      this.timer.reset()
  }

  setQuality(quality: FlameQuality): void {
    this.quality = quality
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
      fragmentShader: getFlameKernelDefinition(kernel).fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vector2(1, 1) },
        uPointer: { value: new Vector2() },
        uPressed: { value: 0 },
        uDrag: { value: 0 },
        uScale: { value: 1 },
        uSpeed: { value: 1 },
        uTurbulence: { value: 1 },
        uIntensity: { value: 1 },
        uQuality: { value: shaderQuality[this.quality] },
        uCore: { value: new Color(0xFFFFFF) },
        uInner: { value: new Color(0xFFFFFF) },
        uOuter: { value: new Color(0xFFFFFF) },
      },
    })

    this.materials.set(kernel, material)
    return material
  }

  private applyPreset(preset: FlamePreset): void {
    const material = this.mesh.material
    this.uniform<number>(material, 'uScale').value = preset.scale
    this.uniform<number>(material, 'uSpeed').value = preset.speed
    this.uniform<number>(material, 'uTurbulence').value = preset.turbulence
    this.uniform<number>(material, 'uIntensity').value = preset.intensity
    this.uniform<Color>(material, 'uCore').value.set(preset.palette.core)
    this.uniform<Color>(material, 'uInner').value.set(preset.palette.inner)
    this.uniform<Color>(material, 'uOuter').value.set(preset.palette.outer)
    this.sculptures[preset.kernel]?.setAppearance(preset.palette, preset.speed, preset.intensity)
    this.setActiveSculpture(preset.kernel)
  }

  private resize(): void {
    const canvas = this.renderer.domElement
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    const ratio = Math.min(window.devicePixelRatio || 1, pixelRatioCaps[this.quality])
    this.renderer.setPixelRatio(ratio)
    this.renderer.setSize(width, height, false)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    for (const sculpture of Object.values(this.sculptures))
      sculpture.setViewport(width / height)

    for (const material of this.materials.values())
      this.uniform<Vector2>(material, 'uResolution').value.set(width * ratio, height * ratio)
  }

  private start(): void {
    cancelAnimationFrame(this.frameId)
    this.timer.reset()
    this.frameId = requestAnimationFrame(this.render)
  }

  private readonly render = (timestamp: number): void => {
    this.frameId = requestAnimationFrame(this.render)
    if (this.paused || this.status !== 'ready')
      return

    this.timer.update(timestamp)
    this.pointer.lerp(this.pointerTarget, 0.075)
    this.pressed += (this.pressedTarget - this.pressed) * 0.09
    this.drag += (this.dragTarget - this.drag) * 0.08

    const material = this.mesh.material
    this.uniform<number>(material, 'uTime').value += this.timer.getDelta()
    this.uniform<Vector2>(material, 'uPointer').value.copy(this.pointer)
    this.uniform<number>(material, 'uPressed').value = this.pressed
    this.uniform<number>(material, 'uDrag').value = this.drag
    this.sculptures[this.preset.kernel]?.update(
      this.uniform<number>(material, 'uTime').value,
      this.pointer,
      this.pressed,
      this.drag,
    )
    this.renderer.render(this.scene, this.camera)
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
