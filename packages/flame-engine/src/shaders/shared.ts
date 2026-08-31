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
  uniform float uQuality;
  uniform float uVariant;
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

  float fbmFast(vec2 point) {
    float value = 0.0;
    float amplitude = 0.56;
    mat2 basis = mat2(0.76, -0.65, 0.65, 0.76);

    for (int octave = 0; octave < 3; octave += 1) {
      value += amplitude * noise21(point);
      point = basis * point * 2.11 + 5.73;
      amplitude *= 0.47;
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

  vec2 advectFlame(vec2 point, float clock) {
    float lift = saturate((point.y + 0.72) / 1.72);
    vec2 flowPoint = point * vec2(1.55, 1.08) + vec2(clock * 0.10, -clock * 0.24);
    float epsilon = 0.075;
    float horizontal = noise21(flowPoint + vec2(epsilon, 0.0));
    horizontal -= noise21(flowPoint - vec2(epsilon, 0.0));
    float vertical = noise21(flowPoint + vec2(0.0, epsilon));
    vertical -= noise21(flowPoint - vec2(0.0, epsilon));
    vec2 curl = vec2(vertical, -horizontal);

    point += curl * (0.12 + lift * 0.20) * uTurbulence;
    point.x += sin(point.y * 4.3 - clock * 1.7) * lift * 0.026 * uTurbulence;
    return point;
  }

  vec3 fireTexture(vec2 point, float clock) {
    float lift = smoothstep(-0.58, 0.92, point.y);
    vec2 displacementPoint = point * vec2(2.1, 1.35) + vec2(clock * 0.09, -clock * 0.48);
    vec2 displacement = vec2(
      noise21(displacementPoint),
      noise21(displacementPoint + vec2(31.73, 17.19))
    ) - 0.5;
    point += displacement * vec2(0.14, 0.07) * (0.36 + lift * 0.64) * uTurbulence;

    vec2 billowPoint = point * vec2(3.7, 2.35) + vec2(clock * 0.11, -clock * 0.76);
    float billow = fbm(billowPoint);
    float fuel = 1.0 - smoothstep(0.08, 0.78, abs(point.x));
    billow = saturate(billow * mix(0.76, 1.12, pow(fuel, 0.72)));

    vec2 shredPoint = rotate2d(0.67) * point;
    shredPoint = shredPoint * vec2(9.2, 5.8) + vec2(-clock * 0.38, -clock * 1.52);
    float shred = noise21(shredPoint);
    if (uQuality > 0.25)
      shred = fbmFast(shredPoint);
    float ridge = smoothstep(0.28, 0.78, shred);

    float billowRidge = saturate(1.0 - abs(billow * 2.0 - 1.0));
    float convection = pow(saturate(ridge * 0.68 + billowRidge * 0.32), 3.0);
    return vec3(billow, ridge, convection);
  }

  float flameBreakup(vec2 point, vec3 textureField, float strength) {
    float height = smoothstep(-0.20, 0.86, point.y);
    float pocketField = (1.0 - textureField.x) * 0.64 + textureField.y * 0.36;
    float pockets = smoothstep(0.57, 0.78, pocketField);
    pockets *= 0.55 + textureField.z * 0.45;
    return pockets * height * strength;
  }

  float flameFlicker(vec2 point, float clock) {
    float slow = noise21(vec2(clock * 0.84 + point.x * 0.18, point.y * 1.45));
    float fast = 0.5 + 0.5 * sin(clock * 8.4 + point.y * 10.5 + point.x * 4.2);
    return 0.82 + slow * 0.20 + fast * 0.10;
  }

  vec3 plumeLayers(vec2 point, float clock, float taper, float edgeSoftness) {
    float vertical = point.y + 0.26;
    float sway = sin(vertical * 7.0 - clock * 1.4) * 0.035;
    sway += (fbmFast(vec2(vertical * 2.8, clock * 0.22)) - 0.5) * 0.22 * uTurbulence;
    sway += uPointer.x * 0.09 * smoothstep(-0.6, 0.9, vertical);
    point.x -= sway;

    float width = mix(0.42, 0.035, saturate((vertical + 0.52) / 1.55));
    width *= taper;
    float domainNoise = fbm(vec2(point.x * 3.2, vertical * 3.5 - clock * 0.75));
    float signedShape = width - abs(point.x) + (domainNoise - 0.5) * 0.18 * uTurbulence;
    float verticalGate = smoothstep(-0.72, -0.48, vertical);
    verticalGate *= 1.0 - smoothstep(0.65, 1.14, vertical);

    float body = smoothstep(-edgeSoftness, edgeSoftness, signedShape) * verticalGate;
    float aura = smoothstep(-0.15, 0.035, signedShape);
    aura *= smoothstep(-0.78, -0.42, vertical);
    aura *= 1.0 - smoothstep(0.68, 1.22, vertical);
    return vec3(body, aura, domainNoise);
  }

  float flameTongue(
    vec2 point,
    float clock,
    float center,
    float phase,
    float height,
    float width
  ) {
    float vertical = point.y + 0.52;
    float life = noise21(vec2(clock * (0.34 + phase * 0.012) + phase, phase * 2.71));
    life = smoothstep(0.08, 0.78, life);
    height *= 0.72 + life * 0.34;
    float progress = saturate(vertical / max(height, 0.01));
    float curl = sin(vertical * (6.2 + phase * 0.35) - clock * (1.16 + phase * 0.07) + phase);
    curl += sin(vertical * 13.5 + clock * 2.8 - phase * 1.7) * 0.24;
    curl *= 0.018 + progress * 0.078 * uTurbulence;

    float tongueWidth = mix(width * (0.84 + life * 0.16), 0.008, pow(progress, 0.78));
    float field = tongueWidth - abs(point.x - center - curl);
    float mask = smoothstep(-0.018, 0.018, field);
    mask *= smoothstep(-0.045, 0.065, vertical);
    mask *= 1.0 - smoothstep(height - 0.22, height, vertical);
    return mask * (0.52 + life * 0.48);
  }

  float emberField(vec2 point, float clock, float density) {
    vec2 flowPoint = point * vec2(1.65, 1.18) + vec2(clock * 0.13, -clock * 0.31);
    vec2 flow = vec2(
      noise21(flowPoint),
      noise21(flowPoint + vec2(23.17, 41.83))
    ) - 0.5;

    vec2 emberUv = vec2(point.x * 7.0, (point.y - clock * 0.42) * 4.6);
    emberUv += flow * vec2(1.45, 0.48) * uTurbulence;
    float row = floor(emberUv.y);
    emberUv.x += mod(row, 2.0) * 0.5;

    vec2 cell = floor(emberUv);
    vec2 local = fract(emberUv) - 0.5;
    float visibilitySeed = hash21(cell + 19.73);
    float motionSeed = hash21(cell + 67.19);
    float lifeSeed = hash21(cell + 113.41);

    float orbitAngle = motionSeed * PI * 2.0 + clock * (1.2 + lifeSeed * 1.8);
    float orbitRadius = mix(0.06, 0.28, motionSeed);
    local -= vec2(sin(orbitAngle), cos(orbitAngle)) * orbitRadius;
    local = rotate2d((motionSeed - 0.5) * 0.9) * local;

    float fuel = 1.0 - smoothstep(0.12, 0.72, abs(point.x));
    float sparkSize = mix(0.024, 0.072, lifeSeed) * mix(0.72, 1.0, fuel);
    float spark = 1.0 - smoothstep(sparkSize * 0.35, sparkSize, length(local * vec2(1.0, 1.85)));

    vec2 trailPoint = local + vec2(0.0, sparkSize * 2.4);
    float trail = 1.0 - smoothstep(
      sparkSize * 0.52,
      sparkSize * 1.55,
      length(trailPoint * vec2(1.85, 0.58))
    );
    trail *= 1.0 - smoothstep(-sparkSize * 0.15, sparkSize * 0.72, local.y);

    float maximumHeight = mix(0.34, 1.12, lifeSeed);
    float lifetime = smoothstep(-0.48, -0.18, point.y);
    lifetime *= 1.0 - smoothstep(maximumHeight - 0.24, maximumHeight, point.y);
    float twinkle = 0.68 + 0.32 * sin(clock * (4.8 + motionSeed * 3.2) + lifeSeed * 31.0);

    float ember = max(spark, trail * 0.38);
    ember *= step(1.0 - density * fuel, visibilitySeed);
    ember *= lifetime * twinkle;
    return ember * (0.62 + lifeSeed * 0.78);
  }

  float softGlow(vec2 point, vec2 center, vec2 scale, float falloff) {
    vec2 delta = (point - center) * scale;
    return exp(-dot(delta, delta) * falloff);
  }

  vec3 flameGradient(float heat) {
    vec3 color = mix(uOuter, uInner, smoothstep(0.05, 0.55, heat));
    return mix(color, uCore, smoothstep(0.58, 1.0, heat));
  }

  vec3 flameRadiance(float heat) {
    float radiance = 0.42 + heat * 1.18 + heat * heat * 0.72;
    return flameGradient(heat) * radiance;
  }
`
