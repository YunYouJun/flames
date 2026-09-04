import { sharedFragment } from './shared'

export const galeFragmentShader = /* glsl */ `
  ${sharedFragment}

  float windRibbon(vec2 point, float clock, float level, float phase, float thickness, float reach) {
    float pointerCurve = uPointer.y * 0.055 * smoothstep(0.0, reach, abs(point.x));
    float center = level + sin(point.x * 5.2 + phase - clock * 1.35) * 0.055;
    center += sin(point.x * 11.0 - phase * 1.7 + clock * 0.74) * 0.018;
    center += pointerCurve + uDrag * sin(phase) * 0.052;
    float ribbon = 1.0 - smoothstep(thickness * 0.35, thickness, abs(point.y - center));
    ribbon *= 1.0 - smoothstep(reach * 0.72, reach, abs(point.x));
    float texture = fbmFast(vec2(point.x * 3.4 - clock * 0.72, phase + point.y * 4.0));
    ribbon *= 1.0 - smoothstep(0.78, 0.94, texture);
    return ribbon * (0.54 + texture * 0.46);
  }

  vec3 netherWind(vec2 point, float clock) {
    float ribbons = 0.0;
    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) / 6.0;
      float level = mix(-0.44, 0.54, unit);
      float thickness = 0.055 - abs(unit - 0.5) * 0.018;
      ribbons = max(ribbons, windRibbon(point, clock, level, unit * 4.3, thickness, 0.76 - abs(unit - 0.5) * 0.18));
    }

    vec2 ringPoint = point - vec2(uPointer.x * 0.035, -0.02 + uPointer.y * 0.02);
    ringPoint.y *= 1.18;
    float radius = length(ringPoint);
    float angle = atan(ringPoint.y, ringPoint.x);
    float warpedRadius = radius + sin(angle * 5.0 - clock * 0.66) * 0.018;
    float soundRadius = 0.20 + uPressed * 0.22;
    float soundRing = 1.0 - smoothstep(0.012, 0.040, abs(warpedRadius - soundRadius));
    float innerVoid = 1.0 - smoothstep(0.10, 0.24, radius);
    return vec3(ribbons, soundRing, innerVoid);
  }

  vec3 windDragon(vec2 point, float clock) {
    float vertical = point.y + 0.54;
    float progress = saturate(vertical / 1.35);
    float coilCenter = sin(progress * 10.4 - clock * 1.22) * mix(0.22, 0.09, progress);
    coilCenter += uPointer.x * progress * 0.12 + uDrag * sin(progress * 8.0) * 0.08;
    float coilWidth = mix(0.14, 0.045, progress);
    float turbulence = fbmFast(vec2(vertical * 4.2 - clock * 0.78, (point.x - coilCenter) * 7.0 + clock * 0.24));
    float bodyWindow = smoothstep(-0.03, 0.07, vertical) * (1.0 - smoothstep(1.10, 1.34, vertical));
    float body = 1.0 - smoothstep(coilWidth * 0.52, coilWidth, abs(point.x - coilCenter) + (turbulence - 0.5) * 0.052);
    body *= bodyWindow;
    float scales = 0.5 + 0.5 * sin(vertical * 31.0 - clock * 2.1);
    body *= 0.44 + smoothstep(0.32, 0.82, scales + turbulence * 0.22) * 0.56;
    float sheathNoise = fbmFast(vec2(vertical * 6.2 + clock * 0.34, point.x * 8.0 - clock * 0.68));
    float sheath = 1.0 - smoothstep(coilWidth * 0.90, coilWidth * 2.15, abs(point.x - coilCenter) + (sheathNoise - 0.5) * 0.11);
    sheath *= bodyWindow * (0.22 + sheathNoise * 0.62);
    float braidOffset = sin(vertical * 18.0 + clock * 2.6) * coilWidth * 0.58;
    float braidFront = 1.0 - smoothstep(0.012, 0.032, abs(point.x - coilCenter - braidOffset));
    float braidBack = 1.0 - smoothstep(0.014, 0.036, abs(point.x - coilCenter + braidOffset));
    float braid = max(braidFront, braidBack * (0.58 + scales * 0.26));
    braid *= bodyWindow * smoothstep(0.08, 0.24, progress);
    float wispOffset = coilWidth * 1.42 + sin(vertical * 14.0 - clock * 2.1) * 0.038;
    float sideWisps = 1.0 - smoothstep(0.012, 0.035, abs(abs(point.x - coilCenter) - wispOffset));
    sideWisps *= bodyWindow * smoothstep(0.40, 0.72, sheathNoise);

    vec2 headPoint = point - vec2(coilCenter + 0.045, 0.67 + uPressed * 0.07);
    headPoint = rotate2d(-0.34 + uPointer.x * 0.12) * headPoint;
    float skull = 1.0 - smoothstep(0.76, 1.0, length((headPoint - vec2(-0.025, 0.0)) / vec2(0.15, 0.10)));
    float snout = 1.0 - smoothstep(0.70, 1.0, length((headPoint - vec2(0.075, -0.018)) / vec2(0.115, 0.070)));
    float headLife = 0.62 + smoothstep(0.42, 0.84, 0.5 + 0.5 * sin(clock * 0.86 + turbulence * 2.2)) * 0.38;
    float head = max(skull, snout) * (0.68 + turbulence * 0.32) * headLife;
    float eye = 1.0 - smoothstep(0.008, 0.024, length(headPoint - vec2(0.032, 0.028)));
    vec2 hornPoint = headPoint - vec2(-0.055, 0.065);
    float horns = 1.0 - smoothstep(0.010, 0.027, abs(hornPoint.y + hornPoint.x * 0.38 + hornPoint.x * hornPoint.x * 2.8));
    horns *= smoothstep(-0.21, -0.12, hornPoint.x) * (1.0 - smoothstep(0.005, 0.030, hornPoint.x));
    vec2 crestPoint = headPoint - vec2(-0.105, 0.030);
    float crest = 1.0 - smoothstep(0.010, 0.026, abs(crestPoint.y + crestPoint.x * 0.72));
    crest *= smoothstep(-0.13, -0.07, crestPoint.x) * (1.0 - smoothstep(0.015, 0.040, crestPoint.x));
    vec2 jawPoint = headPoint - vec2(0.015, -0.052);
    float jaw = 1.0 - smoothstep(0.008, 0.022, abs(jawPoint.y + jawPoint.x * 0.18));
    jaw *= smoothstep(-0.025, 0.015, jawPoint.x) * (1.0 - smoothstep(0.16, 0.22, jawPoint.x));
    vec2 whiskerPoint = headPoint - vec2(0.055, -0.032);
    float whisker = 1.0 - smoothstep(0.008, 0.020, abs(whiskerPoint.y + sin(whiskerPoint.x * 13.0) * 0.018 + whiskerPoint.x * 0.10));
    whisker *= smoothstep(0.025, 0.065, whiskerPoint.x) * (1.0 - smoothstep(0.22, 0.30, whiskerPoint.x));
    float mouth = jaw * (1.0 - smoothstep(0.07, 0.14, jawPoint.x));
    head *= 1.0 - mouth * 0.72;

    float orbit = windRibbon(rotate2d(0.18) * point * vec2(0.92, 1.0), clock * 1.24, -0.16, 2.7, 0.052, 0.86);
    orbit = max(orbit, windRibbon(rotate2d(-0.23) * point * vec2(0.92, 1.0), clock * 1.08, 0.16, 5.1, 0.046, 0.76));
    float headDetail = max(max(eye, horns * 0.62), max(crest * 0.46, max(jaw * 0.42, whisker * 0.40))) * headLife;
    return vec3(max(max(max(body, sheath * 0.58), sideWisps * 0.54), head * 0.88), max(braid * 0.72, headDetail), max(max(orbit, sheath * 0.52), max(sideWisps * 0.68, head * 0.46)));
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float dragon = step(0.5, uVariant);
    point.x += uPointer.x * 0.025;
    point.y += 0.02;

    vec3 nether = vec3(0.0);
    vec3 dragonField = vec3(0.0);
    if (dragon < 0.5)
      nether = netherWind(point, clock);
    else
      dragonField = windDragon(point, clock);

    float netherMask = max(nether.x, nether.y * 0.92);
    float dragonMask = max(dragonField.x, max(dragonField.y, dragonField.z * 0.72));
    float mask = mix(netherMask, dragonMask, dragon);
    vec3 textureField = fireTexture(point * vec2(1.45, 0.82), clock * 1.12);
    float filament = smoothstep(0.56, 0.84, textureField.y) * mask;
    float edge = mask * (0.52 + textureField.z * 0.48);
    float voidCore = nether.z * (1.0 - dragon);

    float motes = 0.0;
    if (uQuality > 0.25)
      motes = emberField(point * vec2(0.82, 0.72), clock * 1.18, mix(0.035, 0.075, dragon));

    vec3 color = uOuter * (mask * 0.62 + voidCore * 0.12);
    color += uInner * (edge * 0.66 + nether.y * 0.72 + dragonField.z * 0.62 + dragonField.x * dragon * 0.52);
    color += uCore * (filament * 0.76 + dragonField.y * 1.18 + dragonField.x * 0.12 + motes * 1.24);
    color *= uIntensity * (0.86 + 0.12 * sin(clock * mix(1.7, 2.2, dragon)));
    color *= 1.0 - voidCore * 0.72;

    float alpha = mask * (0.44 + textureField.x * 0.24 + textureField.z * 0.18);
    alpha += filament * 0.24 + nether.y * 0.28 + motes * 0.72;
    alpha *= 1.0 - voidCore * 0.48;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
