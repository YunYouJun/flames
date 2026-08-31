import { sharedFragment } from './shared'

export const crownFragmentShader = /* glsl */ `
  ${sharedFragment}

  float ellipseMask(vec2 point, vec2 center, vec2 scale, float softness) {
    float distanceToEdge = length((point - center) / scale);
    return 1.0 - smoothstep(1.0 - softness, 1.0, distanceToEdge);
  }

  vec3 goldenCrown(vec2 point, float clock) {
    vec3 plume = plumeLayers(point * vec2(0.92, 0.88), clock * 0.72, 0.92, 0.030);
    float vertical = point.y + 0.44;
    float liquid = sin(vertical * 16.0 - clock * 1.25 + sin(point.x * 9.0) * 1.2);
    liquid = smoothstep(0.12, 0.86, 0.5 + 0.5 * liquid) * plume.x;

    vec2 crownPoint = point - vec2(uPointer.x * 0.025, -0.18 + uPointer.y * 0.012);
    float crownBand = 1.0 - smoothstep(0.014, 0.042, abs(crownPoint.y + 0.10 + abs(crownPoint.x) * 0.11));
    crownBand *= 1.0 - smoothstep(0.48, 0.59, abs(crownPoint.x));
    float teeth = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float center = (float(index) - 2.0) * 0.19;
      float toothHeight = 0.18 + (1.0 - abs(float(index) - 2.0) * 0.18) * 0.15 + uPressed * 0.05;
      float tooth = 1.0 - smoothstep(0.012, 0.038, abs(abs(crownPoint.x - center) * 0.62 + crownPoint.y - toothHeight));
      tooth *= smoothstep(-0.10, 0.02, crownPoint.y) * (1.0 - smoothstep(toothHeight, toothHeight + 0.10, crownPoint.y));
      tooth *= 1.0 - smoothstep(0.075, 0.12, abs(crownPoint.x - center));
      teeth = max(teeth, tooth);
    }

    float rifts = 0.0;
    for (int index = 0; index < 4; index += 1) {
      float phase = float(index) * 1.7;
      float x = (float(index) - 1.5) * 0.29 + sin(clock * 0.35 + phase) * 0.04;
      float rift = 1.0 - smoothstep(0.010, 0.028, abs(point.x - x - sin(point.y * 9.0 + phase) * 0.025));
      rift *= smoothstep(-0.22, 0.02, point.y) * (1.0 - smoothstep(0.52, 0.78, point.y));
      rifts = max(rifts, rift);
    }
    return vec3(max(crownBand, teeth), liquid, max(rifts, plume.x * 0.58));
  }

  vec3 desolationWings(vec2 point, float clock) {
    vec2 wingPoint = point - vec2(uPointer.x * 0.02, -0.08 + uPointer.y * 0.012);
    float spread = 0.72 + uPressed * 0.12;
    float upper = 0.30 - abs(wingPoint.x) * 0.46 + sin(abs(wingPoint.x) * 12.0 - clock * 0.82) * 0.035;
    float lower = -0.12 - abs(wingPoint.x) * 0.16;
    float wing = smoothstep(lower - 0.06, lower + 0.035, wingPoint.y);
    wing *= 1.0 - smoothstep(upper - 0.035, upper + 0.07, wingPoint.y);
    wing *= smoothstep(0.10, 0.24, abs(wingPoint.x)) * (1.0 - smoothstep(spread * 0.82, spread, abs(wingPoint.x)));
    float feathers = smoothstep(0.34, 0.90, 0.5 + 0.5 * sin(abs(wingPoint.x) * 29.0 + wingPoint.y * 8.0 - clock));
    wing *= 0.58 + feathers * 0.42;

    vec3 plume = plumeLayers(point * vec2(1.28, 0.94), clock, 0.60, 0.030);
    float storm = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float level = -0.38 + float(index) * 0.18;
      float ribbon = 1.0 - smoothstep(0.018, 0.052, abs(point.y - level - sin(point.x * 7.0 + float(index) - clock * 1.4) * 0.055));
      ribbon *= 1.0 - smoothstep(0.48, 0.86, abs(point.x));
      storm = max(storm, ribbon);
    }
    return vec3(wing, plume.x, storm);
  }

  vec3 ancestralSeal(vec2 point, float clock) {
    vec2 sealPoint = point - vec2(uPointer.x * 0.018, -0.10 + uPointer.y * 0.01);
    float tower = 1.0 - smoothstep(0.12, 0.16, abs(sealPoint.x));
    tower *= smoothstep(-0.58, -0.46, sealPoint.y) * (1.0 - smoothstep(0.42, 0.58, sealPoint.y));
    float shoulders = 1.0 - smoothstep(0.17, 0.22, abs(sealPoint.x));
    shoulders *= smoothstep(-0.30, -0.20, sealPoint.y) * (1.0 - smoothstep(0.22, 0.34, sealPoint.y));
    float crown = 1.0 - smoothstep(0.014, 0.040, abs(abs(sealPoint.x) * 0.72 + sealPoint.y - (0.46 + uPressed * 0.04)));
    crown *= 1.0 - smoothstep(0.18, 0.27, abs(sealPoint.x));
    float glyph = 1.0 - smoothstep(0.012, 0.036, abs(sin(sealPoint.y * 21.0 + clock * 0.28) * 0.12 + sealPoint.x));
    glyph *= tower;
    float haloRadius = length(sealPoint * vec2(1.0, 0.94));
    float halo = 1.0 - smoothstep(0.014, 0.040, abs(haloRadius - (0.39 + uPressed * 0.045)));
    halo *= 0.56 + 0.44 * smoothstep(0.35, 0.88, 0.5 + 0.5 * sin(atan(sealPoint.y, sealPoint.x) * 8.0 + clock * 0.7));
    return vec3(max(max(tower, shoulders), crown), glyph, halo);
  }

  vec3 emperorConvergence(vec2 point, float clock) {
    vec2 centerPoint = point - vec2(uPointer.x * 0.028, -0.04 + uPointer.y * 0.018);
    float radius = length(centerPoint * vec2(1.0, 1.06));
    float angle = atan(centerPoint.y, centerPoint.x);
    float rings = 0.0;
    for (int index = 0; index < 4; index += 1) {
      float unit = float(index) / 3.0;
      float ringRadius = 0.16 + unit * 0.12 + uPressed * unit * 0.045;
      float ripple = sin(angle * (5.0 + float(index) * 2.0) + clock * (0.38 + unit * 0.24)) * 0.016;
      float ring = 1.0 - smoothstep(0.012, 0.038, abs(radius - ringRadius - ripple));
      rings = max(rings, ring);
    }
    float spokes = 1.0 - smoothstep(0.018, 0.070, abs(sin(angle * 11.0 - clock * 0.46)));
    spokes *= smoothstep(0.11, 0.20, radius) * (1.0 - smoothstep(0.48, 0.61, radius));
    vec3 plume = plumeLayers(point * vec2(0.98, 0.86), clock * 0.66, 0.84, 0.028);
    float core = softGlow(point, vec2(0.0, -0.06), vec2(4.2, 3.1), 1.0);
    return vec3(max(rings, spokes), plume.x, core);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float golden = 1.0 - step(0.5, abs(uVariant));
    float desolation = 1.0 - step(0.5, abs(uVariant - 1.0));
    float ancestral = 1.0 - step(0.5, abs(uVariant - 2.0));
    float emperor = step(2.5, uVariant);
    point.y += 0.02;

    vec3 goldField = vec3(0.0);
    vec3 wingField = vec3(0.0);
    vec3 sealField = vec3(0.0);
    vec3 emperorField = vec3(0.0);
    if (golden > 0.5)
      goldField = goldenCrown(point, clock);
    if (desolation > 0.5)
      wingField = desolationWings(point, clock);
    if (ancestral > 0.5)
      sealField = ancestralSeal(point, clock);
    if (emperor > 0.5)
      emperorField = emperorConvergence(point, clock);

    float mask = max(max(goldField.x, max(goldField.y, goldField.z)) * golden, max(wingField.x, max(wingField.y, wingField.z)) * desolation);
    mask = max(mask, max(sealField.x, max(sealField.y, sealField.z)) * ancestral);
    mask = max(mask, max(emperorField.x, max(emperorField.y, emperorField.z)) * emperor);
    vec3 textureField = fireTexture(point, clock * 0.82);
    float filament = smoothstep(0.58, 0.86, textureField.y) * mask;
    float motes = 0.0;
    if (uQuality > 0.25)
      motes = emberField(point * vec2(0.88, 0.72), clock * 0.82, 0.042 + golden * 0.025 + emperor * 0.045);

    vec3 color = uOuter * (mask * 0.42 + wingField.x * 0.24 + sealField.x * 0.30);
    color += uInner * (mask * 0.40 + goldField.y * 0.56 + wingField.z * 0.58 + sealField.z * 0.52 + emperorField.x * 0.68);
    color += uCore * (filament * 0.72 + goldField.x * 0.82 + goldField.z * 0.65 + wingField.y * 0.72 + sealField.y * 1.10 + emperorField.z * 1.28 + motes * 1.20);
    if (emperor > 0.5) {
      float spectrum = 0.5 + 0.5 * sin(atan(point.y, point.x) * 3.0 + clock * 0.48);
      color += mix(vec3(0.18, 0.52, 1.0), vec3(1.0, 0.18, 0.36), spectrum) * emperorField.x * 0.72;
    }
    color *= uIntensity * (0.88 + 0.12 * sin(clock * mix(1.7, 1.1, ancestral)));

    float alpha = mask * (0.45 + textureField.x * 0.18 + textureField.z * 0.17);
    alpha += filament * 0.22 + motes * 0.70 + emperorField.z * 0.16;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
