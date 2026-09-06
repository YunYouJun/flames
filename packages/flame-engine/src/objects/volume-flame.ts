import type { PerspectiveCamera, Vector2, WebGLRenderer } from 'three'
import type { FlameKernelId, FlamePreset, FlameQuality } from '../types'
import { BoxGeometry, Camera, Color, Data3DTexture, LinearFilter, Mesh, PlaneGeometry, RedFormat, RepeatWrapping, Scene, ShaderMaterial, Vector3, WebGLRenderTarget } from 'three'
import { getFlameKernelVariant } from '../kernel-registry'
import { volumeFields } from '../shaders/volume-fields'
import { getVolumeResolution } from './volume-resolution'

const familyIds: Record<FlameKernelId, number> = { crown: 0, lotus: 1, void: 2, cold: 3, fluid: 4, gale: 5, spirit: 6, soul: 7, geofire: 8 }

/** Object-space emission/absorption ray marching, initially tuned for golden emperor. */
export class VolumeFlame {
  private readonly noiseTexture: Data3DTexture
  readonly scene = new Scene()
  private readonly target = new WebGLRenderTarget(1, 1)
  private readonly compositeScene = new Scene()
  private readonly compositeCamera = new Camera()
  private readonly compositeGeometry = new PlaneGeometry(2, 2)
  private readonly compositeMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: { uFrame: { value: this.target.texture } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }',
    fragmentShader: 'varying vec2 vUv; uniform sampler2D uFrame; void main() { vec4 c = texture2D(uFrame, vUv); gl_FragColor = vec4(c.rgb / max(c.a, 0.001), c.a); }',
  })

  private quality: FlameQuality = 'balanced'
  private detailed = false
  private outputWidth = 1
  private outputHeight = 1
  private readonly geometry = new BoxGeometry(1.6, 2.15, 1.6).translate(0, 1.075, 0)
  private readonly material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uEye: { value: new Vector3() },
      uTime: { value: 0 },
      uSteps: { value: 48 },
      uPressed: { value: 0 },
      uBend: { value: new Vector3() },
      uNoise: { value: null },
      uMode: { value: 0 },
      uFamily: { value: 0 },
      uVariant: { value: 0 },
      uOuter: { value: new Color() },
      uInner: { value: new Color() },
      uCore: { value: new Color() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec3 vLocal;
      uniform vec3 uEye;
      uniform vec3 uBend;
      uniform float uTime;
      uniform float uSteps;
      uniform float uPressed;
      uniform highp sampler3D uNoise;
      uniform float uMode;
      uniform float uFamily;
      uniform float uVariant;
      uniform vec3 uOuter;
      uniform vec3 uInner;
      uniform vec3 uCore;

      float hash(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }
      float noise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return texture(uNoise, (i + f + 0.5) / 32.0).r;
      }
      float fbm(vec3 p) {
        return noise(p) * 0.57 + noise(p * 2.07 + 7.1) * 0.28 + noise(p * 4.13 + 19.3) * 0.15;
      }
      float baseDensity(vec3 p) {
        float lotus = 1.0 - step(0.5, abs(uFamily - 1.0));
        float plumeHeight = mix(1.72, 1.32, lotus);
        if (uFamily == 1.0) plumeHeight = uVariant > 1.5 ? 0.92 : uVariant > 0.5 ? 1.48 : 1.26;
        if (uFamily == 8.0 && uVariant == 1.0) plumeHeight = 0.95;
        if (uFamily == 6.0 && uVariant == 2.0) plumeHeight = 0.85;
        if (uFamily == 0.0 && uVariant == 3.0) plumeHeight = 1.95;
        float height = p.y / (plumeHeight + uPressed * 0.2);
        p.xz -= uBend.xz * height * height;
        float angle = p.y * mix(3.2, 1.4, lotus) - uTime * mix(2.4, 0.9, lotus);
        mat2 spin = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        p.xz = spin * p.xz;
        if (uFamily == 0.0 && uVariant == 0.0) {
          // Multiple changing eddies instead of a fixed crown of identical tips.
          p.xz += vec2(sin(p.y * 7.0 - uTime * 3.1), cos(p.y * 5.0 + uTime * 2.7)) * 0.065 * height;
        }
        vec3 flow = p * vec3(5.2, 3.5, 5.2) - vec3(0.0, uTime * 3.5, 0.0);
        p.xz += vec2(noise(flow + 8.0), noise(flow + 31.0)) * 0.3 - 0.15;
        float radius = (0.37 + 0.10 * sin(height * 4.0)) * (1.0 - height * 0.82);
        radius *= mix(1.0, uVariant > 1.5 ? 0.78 : 0.65, lotus);
        float azimuth = atan(p.z, p.x);
        float tongues = sin(azimuth * 5.0 + p.y * 4.0 + uTime) * 0.07 * height;
        if (uFamily == 0.0 && uVariant == 0.0)
          tongues = (sin(azimuth * 5.0 + p.y * 4.0 + uTime) * 0.045
            + sin(azimuth * 3.0 - p.y * 6.0 - uTime * 1.7) * 0.035) * height;
        float envelope = 1.0 - length(p.xz) / max(radius + tongues, 0.025);
        float turbulence = fbm(flow);
        float fire = smoothstep(0.04, 0.52, envelope + (turbulence - 0.53) * 2.8);
        float filaments = smoothstep(0.28, 0.72, turbulence);
        float root = exp(-dot(p.xz, p.xz) * 28.0) * (1.0 - smoothstep(0.0, 0.3, height));
        float core = exp(-dot(p.xz, p.xz) * 32.0) * max(1.0 - height, 0.0) * 0.48;
        return max(max(root, core), fire * (0.12 + 0.88 * filaments)) * smoothstep(0.0, 0.035, p.y) * (1.0 - smoothstep(0.78, 1.07, height));
      }
      ${volumeFields}
      float density(vec3 p) {
        dragonMask = 0.0;
        dragonDensity = 0.0;
        dragonEyes = 0.0;
        beastMask = 0.0;
        beastDensity = 0.0;
        beastEyes = 0.0;
        float base = baseDensity(p);
        float edge = 1.0 - smoothstep(0.72, 0.8, max(abs(p.x), abs(p.z)));
        float field = familyDensity(p, base);
        // Clear the plume inside the face so it cannot fill the open jaw/eye sockets.
        field = mix(field, dragonDensity, dragonMask);
        field = mix(field, beastDensity, beastMask);
        return field * (1.0 + uPressed * 0.18) * edge * smoothstep(0.0, 0.035, p.y);
      }
      void main() {
        vec3 ray = normalize(vLocal - uEye);
        vec3 invRay = 1.0 / ray;
        vec3 a = (vec3(-0.8, 0.0, -0.8) - uEye) * invRay;
        vec3 b = (vec3(0.8, 2.15, 0.8) - uEye) * invRay;
        vec3 nearHit = min(a, b), farHit = max(a, b);
        float start = max(max(nearHit.x, nearHit.y), nearHit.z);
        float end = min(min(farHit.x, farHit.y), farHit.z);
        start = max(start, 0.0);
        if (end <= start) discard;
        float stepSize = (end - start) / uSteps;
        vec3 light = vec3(0.0);
        float opacity = 0.0;
        float jitter = hash(vec3(gl_FragCoord.xy, 0.0));
        for (int i = 0; i < 72; i++) {
          if (float(i) >= uSteps || opacity > 0.985) break;
          vec3 p = uEye + ray * (start + (float(i) + jitter) * stepSize);
          if (uFamily == 2.0 && length(p - vec3(0.0, 0.89, 0.0)) < 0.38) break;
          float d = density(p);
          float extinction = uFamily == 4.0 && (uVariant == 1.0 || uVariant == 2.0) ? 9.0 : 4.8;
          extinction = mix(extinction, 8.5, dragonMask);
          float alpha = 1.0 - exp(-d * stepSize * extinction);
          vec3 color = mix(vec3(1.0, 0.22, 0.002), vec3(1.0, 0.66, 0.018), smoothstep(0.02, 0.55, d));
          color = mix(color, vec3(1.0, 0.9, 0.25), smoothstep(0.5, 0.9, d) * 0.7);
          if (uMode > 0.5) {
            color = mix(uOuter, uInner, smoothstep(0.02, 0.5, d));
            color = mix(color, uCore, smoothstep(0.35, 0.8, d));
          }
          if (uFamily == 7.0 && uVariant == 1.0) {
            float polarity = 0.5 + 0.5 * cos(atan(p.z, p.x) - p.y * 4.0 + uTime);
            vec3 dark = mix(vec3(0.38, 0.34, 0.44), vec3(0.055, 0.045, 0.07), smoothstep(0.05, 0.4, d));
            color = mix(dark, vec3(0.94, 0.94, 0.88), smoothstep(0.35, 0.65, polarity));
          }
          if (uFamily == 0.0 && uVariant == 3.0) {
            vec3 spectrum = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + atan(p.z, p.x) * 2.0 + p.y * 3.0 + uTime * 0.3);
            color = mix(color, spectrum, smoothstep(0.15, 0.5, length(p.xz)) * 0.65);
            color = mix(color, vec3(1.0, 0.97, 0.91), (1.0 - smoothstep(0.06, 0.22, length(p.xz))) * smoothstep(0.2, 0.8, d));
          }
          if (uFamily == 6.0 && uVariant == 0.0) color *= 1.8;
          if (uFamily == 2.0) color *= 0.42;
          if (uFamily == 0.0 && uVariant == 1.0) {
            color = mix(vec3(0.16, 0.15, 0.18), vec3(0.48, 0.50, 0.54), smoothstep(0.03, 0.85, d));
            color = mix(color, vec3(0.72, 0.74, 0.77), smoothstep(0.9, 1.6, d) * 0.45);
          }
          if (uFamily == 6.0 && uVariant == 2.0) {
            color = mix(uOuter, uInner, smoothstep(0.03, 0.95, d));
            color = mix(color, uCore, smoothstep(1.15, 1.8, d) * 0.6);
          }
          if (uFamily == 7.0 && uVariant == 0.0)
            color = mix(vec3(0.50, 0.44, 0.36), vec3(0.88, 0.85, 0.76), smoothstep(0.05, 0.65, d));
          if (uFamily == 6.0 && uVariant == 3.0) {
            // Saturated scarlet is the body color; pale light only at tiny hot cores/eyes.
            color = mix(uOuter, uInner, smoothstep(0.025, 0.65, d));
            color = mix(color, uCore, smoothstep(1.05, 1.7, d) * 0.3);
            color = mix(color, vec3(1.0, 0.52, 0.15), smoothstep(0.08, 0.65, beastEyes));
          }
          if ((uFamily == 5.0 && uVariant == 1.0) || (uFamily == 6.0 && uVariant == 1.0)) {
            color = mix(uOuter, uInner, smoothstep(0.03, 0.5, d));
            color = mix(color, uCore, smoothstep(0.7, 1.0, d) * 0.4);
          }
          if (dragonMask > 0.0) {
            vec3 faceColor = mix(uInner * 0.40, uInner, smoothstep(0.08, 0.95, d));
            color = mix(color, faceColor, dragonMask * 0.85);
            vec3 eyeColor = uFamily == 6.0 && uVariant == 0.0 ? vec3(0.7, 0.9, 1.0) : vec3(1.0, 0.74, 0.20);
            color = mix(color, eyeColor * (1.2 + uPressed * 0.45), smoothstep(0.08, 0.6, dragonEyes));
          }
          if (uFamily == 4.0 && uVariant == 1.0) {
            color = mix(uInner * 0.75, uInner, smoothstep(0.02, 0.6, d));
            color = mix(color, uCore, smoothstep(0.85, 1.5, d) * 0.7);
          }
          if (uFamily == 4.0 && uVariant == 2.0) {
            // Warm thin sheets over cool edges; avoid white toroidal light blobs.
            color = mix(uOuter, uInner, smoothstep(0.02, 0.25, d));
            color = mix(color, uCore, smoothstep(0.85, 1.6, d) * 0.45);
          }
          light += (1.0 - opacity) * alpha * color * 1.2;
          opacity += (1.0 - opacity) * alpha;
        }
        if (opacity < 0.005) discard;
        gl_FragColor = vec4(light / max(opacity, 0.001), opacity);
      }
    `,
  })

  readonly mesh = new Mesh(this.geometry, this.material)

  constructor() {
    this.scene.add(this.mesh)
    this.compositeScene.add(new Mesh(this.compositeGeometry, this.compositeMaterial))
    const data = new Uint8Array(32 ** 3)
    let seed = 137
    for (let i = 0; i < data.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0
      data[i] = (seed >>> 24) & 255
    }
    this.noiseTexture = new Data3DTexture(data, 32, 32, 32)
    this.noiseTexture.format = RedFormat
    this.noiseTexture.minFilter = this.noiseTexture.magFilter = LinearFilter
    this.noiseTexture.wrapS = this.noiseTexture.wrapT = this.noiseTexture.wrapR = RepeatWrapping
    this.noiseTexture.needsUpdate = true
    this.material.uniforms.uNoise!.value = this.noiseTexture
    this.mesh.position.y = -0.76
    this.mesh.visible = false
  }

  setQuality(quality: FlameQuality): void {
    this.quality = quality
    this.material.uniforms.uSteps!.value = quality === 'high' ? 72 : 48
    this.resizeTarget()
  }

  setAppearance(preset: FlamePreset): void {
    const variant = getFlameKernelVariant(preset)
    this.detailed = preset.kernel === 'gale' || preset.kernel === 'spirit' || preset.kernel === 'soul'
      || (preset.kernel === 'fluid' && (variant === 1 || variant === 2))
    this.resizeTarget()
    this.material.uniforms.uFamily!.value = familyIds[preset.kernel]
    this.material.uniforms.uVariant!.value = variant
    this.material.uniforms.uMode!.value = preset.kernel === 'crown' && variant === 0 ? 0 : 1
    this.material.uniforms.uOuter!.value.set(preset.palette.outer)
    this.material.uniforms.uInner!.value.set(preset.palette.inner)
    this.material.uniforms.uCore!.value.set(preset.palette.core)
    if (preset.kernel !== 'lotus' && preset.id !== 'golden-emperor') {
      // Custom volume shaders output display color directly, without Three's color chunk.
      this.material.uniforms.uOuter!.value.convertLinearToSRGB()
      this.material.uniforms.uInner!.value.convertLinearToSRGB()
      this.material.uniforms.uCore!.value.convertLinearToSRGB()
    }
    if (preset.id === 'karmic-lotus')
      this.material.uniforms.uCore!.value.lerp(this.material.uniforms.uInner!.value, 0.85)
    if (preset.id === 'green-lotus')
      this.material.uniforms.uCore!.value.lerp(this.material.uniforms.uInner!.value, 0.8)
    if (preset.id === 'nether-poison')
      this.material.uniforms.uCore!.value.lerp(this.material.uniforms.uInner!.value, 0.75)
  }

  setResolution(width: number, height: number): void {
    this.outputWidth = width
    this.outputHeight = height
    this.resizeTarget()
  }

  private resizeTarget(): void {
    const size = getVolumeResolution(this.outputWidth, this.outputHeight, this.quality, this.detailed)
    this.target.setSize(size.width, size.height)
  }

  /** Render only the volume at reduced resolution, keeping the altar crisp. */
  render(renderer: WebGLRenderer, camera: PerspectiveCamera): void {
    const previousTarget = renderer.getRenderTarget()
    const previousAutoClear = renderer.autoClear
    renderer.setRenderTarget(this.target)
    renderer.clear()
    renderer.render(this.scene, camera)
    renderer.setRenderTarget(previousTarget)
    renderer.autoClear = false
    renderer.render(this.compositeScene, this.compositeCamera)
    renderer.autoClear = previousAutoClear
  }

  setViewport(aspect: number): void {
    this.mesh.scale.setScalar(0.74 * Math.min(1, aspect / 0.9))
  }

  update(camera: PerspectiveCamera, time: number, pointer: Vector2, pressed: number, drag: number): void {
    this.mesh.updateWorldMatrix(true, false)
    this.material.uniforms.uEye!.value.copy(camera.position)
    this.mesh.worldToLocal(this.material.uniforms.uEye!.value)
    this.material.uniforms.uTime!.value = time
    this.material.uniforms.uPressed!.value = pressed
    this.material.uniforms.uBend!.value.set(pointer.x * (0.18 + drag * 0.2), 0, pointer.y * 0.12)
  }

  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
    this.noiseTexture.dispose()
    this.target.dispose()
    this.compositeGeometry.dispose()
    this.compositeMaterial.dispose()
  }
}
