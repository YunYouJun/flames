export const tidalRingVertexShader = /* glsl */ `
  varying vec2 vLocalPoint;
  varying float vWave;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uPressed;
  uniform float uDrag;
  uniform float uQuality;

  void main() {
    float clock = uTime * uSpeed;
    float angle = atan(position.y, position.x);
    float wave = sin(angle * 5.0 - clock * 0.82);
    wave += sin(angle * 9.0 + clock * 0.46 + uDrag * 3.0) * 0.42;

    vec3 animated = position;
    animated.z += wave * (0.006 + uQuality * 0.008);
    animated.xy *= 1.0 + uPressed * 0.028 * (0.5 + 0.5 * sin(angle * 3.0 - clock));

    vLocalPoint = position.xy;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(animated, 1.0);
  }
`

export const tidalRingFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vLocalPoint;
  varying float vWave;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uPressed;
  uniform float uDrag;
  uniform float uIntensity;
  uniform float uVariant;
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
    float verdant = 1.0 - step(0.5, abs(uVariant - 1.0));
    float cloudwater = 1.0 - step(0.5, abs(uVariant - 2.0));
    float venom = step(2.5, uVariant);
    float radius = length(vLocalPoint);
    float angle = atan(vLocalPoint.y, vLocalPoint.x);
    float ringCenter = 0.53;
    float edge = 1.0 - smoothstep(0.018, 0.042, abs(radius - ringCenter));
    float flow = noise21(vec2(angle * 5.4 - clock * 0.38, radius * 42.0 + clock * 0.24));
    float filament = smoothstep(0.34, 0.78, flow + vWave * 0.10 + verdant * 0.06 - cloudwater * 0.04);
    float gaps = smoothstep(0.74, 0.92, noise21(vec2(angle * 8.0 + 7.1, clock * 0.18)));
    gaps = mix(gaps, smoothstep(0.66, 0.88, noise21(vec2(angle * 4.0 + clock * 0.12, 13.7))), venom);

    vec3 color = mix(uOuter, uInner, 0.44 + filament * 0.46);
    color = mix(color, uCore, smoothstep(0.72, 1.0, filament + uPressed * 0.16));
    color *= (0.56 + filament * 0.72 + uPressed * 0.20 + uDrag * 0.08) * uIntensity;

    float alpha = edge * (0.26 + filament * 0.58 + cloudwater * 0.08) * (1.0 - gaps * mix(0.72, 0.48, venom));
    if (alpha < 0.025) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
