export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

export const sharedFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPressed;
  uniform float uDrag;
  uniform float uScale;
  uniform float uSpeed;
  uniform float uTurbulence;
  uniform float uIntensity;
  uniform vec3 uCore;
  uniform vec3 uInner;
  uniform vec3 uOuter;

  #define PI 3.14159265359

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

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 basis = mat2(0.80, -0.60, 0.60, 0.80);

    for (int octave = 0; octave < 5; octave += 1) {
      value += amplitude * noise21(point);
      point = basis * point * 2.03 + 9.17;
      amplitude *= 0.5;
    }

    return value;
  }

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine);
  }

  vec2 stagePoint() {
    vec2 point = vUv * 2.0 - 1.0;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    point.x *= aspect;
    point /= max(uScale, 0.01);
    return point;
  }

  float plume(vec2 point, float clock, float taper, float edgeSoftness) {
    float vertical = point.y + 0.26;
    float sway = sin(vertical * 7.0 - clock * 1.4) * 0.035;
    sway += (fbm(vec2(vertical * 2.8, clock * 0.22)) - 0.5) * 0.22 * uTurbulence;
    sway += uPointer.x * 0.09 * smoothstep(-0.6, 0.9, vertical);
    point.x -= sway;

    float width = mix(0.42, 0.035, saturate((vertical + 0.52) / 1.55));
    width *= taper;
    float domainNoise = fbm(vec2(point.x * 3.2, vertical * 3.5 - clock * 0.75));
    float signedShape = width - abs(point.x) + (domainNoise - 0.5) * 0.18 * uTurbulence;
    float body = smoothstep(-edgeSoftness, edgeSoftness, signedShape);
    body *= smoothstep(-0.72, -0.48, vertical);
    body *= 1.0 - smoothstep(0.65, 1.14, vertical);
    return body;
  }

  vec3 flameGradient(float heat) {
    vec3 color = mix(uOuter, uInner, smoothstep(0.05, 0.55, heat));
    return mix(color, uCore, smoothstep(0.58, 1.0, heat));
  }
`
