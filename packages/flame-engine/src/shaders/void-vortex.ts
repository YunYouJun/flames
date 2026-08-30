export const voidCoreVertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uPressed;
  uniform float uQuality;

  void main() {
    float clock = uTime * uSpeed;
    float pulse = sin(clock * 2.3 + position.y * 7.0);
    pulse += sin(clock * 1.35 + position.x * 9.0 - position.z * 5.0) * 0.55;

    vec3 animated = position;
    animated += normal * pulse * (0.004 + uQuality * 0.007);
    animated *= 1.0 - uPressed * 0.025;

    vec4 worldPosition = modelMatrix * vec4(animated, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const voidCoreFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uPressed;
  uniform vec3 uCore;
  uniform vec3 uInner;
  uniform vec3 uOuter;

  float hash31(vec3 point) {
    point = fract(point * 0.1031);
    point += dot(point, point.yzx + 33.33);
    return fract((point.x + point.y) * point.z);
  }

  void main() {
    float clock = uTime * uSpeed;
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.25);
    float surface = 0.5 + 0.25 * sin(vWorldPosition.y * 16.0 - clock * 0.7);
    surface += 0.25 * sin(vWorldPosition.x * 13.0 + vWorldPosition.z * 11.0 + clock * 0.45);
    surface += (hash31(floor(vWorldPosition * 8.0)) - 0.5) * 0.08;
    float fissure = smoothstep(0.82, 0.98, surface + fresnel * 0.18);
    float heartbeat = 0.88 + sin(clock * 2.5) * 0.06 + uPressed * 0.08;

    vec3 color = uOuter * (0.07 + surface * 0.035);
    color += uInner * fresnel * (0.16 + surface * 0.15);
    color += uCore * fissure * fresnel * (0.16 + uPressed * 0.22);
    color *= heartbeat;

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export const voidRingVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uQuality;

  void main() {
    vUv = uv;
    float clock = uTime * uSpeed;
    vec3 animated = position;
    float ripple = sin(uv.x * 37.699 + clock * 2.2 + uv.y * 4.0);
    animated += normal * ripple * (0.005 + uQuality * 0.006);

    vec4 worldPosition = modelMatrix * vec4(animated, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const voidRingFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform float uPressed;
  uniform vec3 uCore;
  uniform vec3 uInner;
  uniform vec3 uOuter;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise21(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + vec2(1.0)), local.x),
      local.y
    );
  }

  void main() {
    float clock = uTime * uSpeed;
    vec2 flowUv = vec2(vUv.x * 22.0 - clock * 1.7, vUv.y * 5.0 + clock * 0.28);
    float flow = noise21(flowUv);
    float filament = smoothstep(0.34, 0.78, flow);
    float breakup = smoothstep(0.72, 0.90, noise21(flowUv * 0.63 + 9.4));
    float edge = 1.0 - abs(vUv.y * 2.0 - 1.0);
    edge = smoothstep(0.02, 0.52, edge);

    vec3 color = mix(uOuter, uInner, filament);
    color = mix(color, uCore, smoothstep(0.72, 1.0, filament + uPressed * 0.12));
    color *= (0.48 + filament * 0.78 + uPressed * 0.24) * uIntensity;
    color += uInner * exp(-length(vWorldPosition) * 1.4) * 0.08;

    float alpha = edge * (0.12 + filament * 0.56) * (1.0 - breakup * 0.90);
    if (alpha < 0.035) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
