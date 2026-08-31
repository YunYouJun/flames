export const lotusPetalVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uPressed;
  uniform float uQuality;
  uniform float uVariant;

  void main() {
    vUv = uv;

    vec4 baseWorld = modelMatrix * vec4(position, 1.0);
    float phase = atan(baseWorld.z, baseWorld.x) * 1.7;
    float tip = pow(uv.y, 1.65);
    float flutter = sin(uTime * uSpeed * 2.1 + phase + uv.x * 2.8);
    float breathing = sin(uTime * uSpeed * 1.15 + phase * 0.72);
    float karmic = 1.0 - step(0.5, abs(uVariant - 1.0));
    float earthcore = step(1.5, uVariant);

    vec3 animated = position;
    animated.y += flutter * tip * (0.012 + uQuality * 0.014);
    animated.z += breathing * tip * 0.018;
    animated.x *= mix(1.0, 0.72, karmic);
    animated.z *= mix(1.0, 0.48 + tip * 0.06, karmic);
    animated.y += karmic * tip * (0.30 + breathing * 0.030);
    animated.z *= 1.0 + uPressed * tip * mix(0.075, 0.10, karmic);
    animated.x *= mix(1.0, 1.08, earthcore);
    animated.z *= mix(1.0, 0.72 + tip * 0.08, earthcore);
    animated.y *= mix(1.0, 0.82, earthcore);
    animated.y += earthcore * tip * (0.10 + breathing * 0.014);
    animated.z *= 1.0 + uPressed * tip * earthcore * 0.11;

    vec4 worldPosition = modelMatrix * vec4(animated, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const lotusPetalFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uIntensity;
  uniform float uPressed;
  uniform float uQuality;
  uniform float uVariant;
  uniform vec3 uCore;
  uniform vec3 uInner;
  uniform vec3 uOuter;

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

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

  float petalFbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.56;
    mat2 basis = mat2(0.79, -0.61, 0.61, 0.79);

    for (int octave = 0; octave < 3; octave += 1) {
      value += amplitude * noise21(point);
      point = basis * point * 2.07 + 7.31;
      amplitude *= 0.48;
    }

    return value;
  }

  void main() {
    float clock = uTime * uSpeed;
    float karmic = 1.0 - step(0.5, abs(uVariant - 1.0));
    float earthcore = step(1.5, uVariant);
    float side = abs(vUv.x * 2.0 - 1.0);
    float edge = smoothstep(0.0, 0.13, min(vUv.x, 1.0 - vUv.x));
    float root = smoothstep(0.0, 0.09, vUv.y);
    float tip = 1.0 - smoothstep(0.88, 1.0, vUv.y);

    vec2 billowPoint = vec2(
      vUv.x * 4.6 + vWorldPosition.x * 0.8,
      vUv.y * 5.2 - clock * 0.72 + vWorldPosition.z * 0.36
    );
    float billow = petalFbm(billowPoint);

    vec2 shredPoint = vec2(
      vUv.x * 11.0 - clock * 0.24,
      vUv.y * 8.4 - clock * 1.36
    );
    float shred = noise21(shredPoint);
    if (uQuality > 0.72)
      shred = petalFbm(shredPoint);
    float filament = smoothstep(0.38, 0.79, shred);

    float breakupNoise = noise21(vec2(vUv.x * 7.5 + clock * 0.34, vUv.y * 6.2 - clock * 0.88));
    float breakup = smoothstep(0.68, 0.88, breakupNoise) * smoothstep(0.48, 0.96, vUv.y);
    float centerHeat = pow(1.0 - side, 1.45);
    float edgeBand = smoothstep(0.46, 0.84, side) * (1.0 - smoothstep(0.84, 1.0, side));
    float rootHeat = 1.0 - smoothstep(0.08, 0.82, vUv.y);
    float heat = saturate(centerHeat * 0.34 + rootHeat * 0.30 + billow * 0.38 + filament * 0.24);
    float karmicVein = smoothstep(0.54, 0.78, noise21(vec2(vUv.x * 16.0 + clock * 0.18, vUv.y * 5.2 - clock * 0.52)));
    karmicVein *= centerHeat * smoothstep(0.12, 0.92, vUv.y) * karmic;
    float earthVein = smoothstep(0.58, 0.76, noise21(vec2(vUv.x * 10.0 - clock * 0.08, vUv.y * 4.2 - clock * 0.24)));
    earthVein *= centerHeat * (1.0 - smoothstep(0.46, 0.96, vUv.y)) * earthcore;

    vec3 color = mix(uOuter, uInner, smoothstep(0.16, 0.62, heat));
    color = mix(color, uCore, smoothstep(0.70, 1.0, heat));
    color += uInner * filament * centerHeat * 0.30;
    color += uOuter * (side * 0.18 + edgeBand * 0.32);
    color += mix(uInner, uCore, 0.68) * karmicVein * (0.24 + uPressed * 0.34);
    color += mix(uInner, uCore, 0.54) * earthVein * (0.64 + uPressed * 0.58);
    float earthCrust = earthcore * smoothstep(0.38, 0.94, side) * (0.34 + billow * 0.36);
    color = mix(color, uOuter * 0.48, earthCrust * 0.62);
    color += uInner * earthcore * centerHeat * rootHeat * 0.14;
    float charEdge = karmic * smoothstep(0.58, 0.96, max(side, vUv.y)) * (0.30 + breakupNoise * 0.52);
    color = mix(color, uOuter * 0.22, charEdge * 0.48);

    float flicker = 0.90 + noise21(vec2(clock * 0.76, vWorldPosition.x * 1.7 + vWorldPosition.z)) * 0.18;
    color *= (0.58 + heat * 0.90 + heat * heat * 0.25) * flicker * uIntensity;

    float alpha = edge * root * tip;
    alpha *= 0.30 + billow * 0.38 + filament * 0.46;
    alpha *= 1.0 - breakup * 0.64;
    alpha *= 1.0 - charEdge * 0.34;
    alpha *= mix(0.58, 0.92, side);
    alpha += edgeBand * root * tip * 0.10;
    alpha *= mix(0.66, 0.74, earthcore);

    if (alpha < 0.025) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
