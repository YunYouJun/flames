import { sharedFragment } from './shared'

export const geofireFragmentShader = /* glsl */ `
  ${sharedFragment}

  float ellipseMask(vec2 point, vec2 center, vec2 scale, float softness) {
    float distanceToEdge = length((point - center) / scale);
    return 1.0 - smoothstep(1.0 - softness, 1.0, distanceToEdge);
  }

  vec3 volcanicCore(vec2 point, float clock) {
    vec2 groundPoint = point - vec2(uPointer.x * 0.018, -0.30 + uPointer.y * 0.01);
    float basaltNoise = fbmFast(groundPoint * vec2(6.2, 9.0) + vec2(clock * 0.025, clock * 0.04));
    float moundDistance = length(groundPoint / vec2(0.58 + uPressed * 0.05, 0.28));
    float mound = 1.0 - smoothstep(0.84, 1.06, moundDistance + (basaltNoise - 0.5) * 0.22);
    mound *= 1.0 - smoothstep(0.02, 0.19, point.y);
    float basalt = smoothstep(0.42, 0.82, basaltNoise);
    float rock = mound * (0.54 + basalt * 0.46);

    float crackWarp = (basaltNoise - 0.5) * 1.8;
    float cracks = 1.0 - smoothstep(0.025, 0.105, abs(sin(groundPoint.x * 15.0 + sin(groundPoint.y * 17.0) * 1.8 + crackWarp)));
    cracks = max(cracks, 1.0 - smoothstep(0.025, 0.095, abs(sin(groundPoint.y * 20.0 - groundPoint.x * 7.0 + 1.3 - crackWarp))));
    cracks *= mound * smoothstep(0.24, 0.78, basalt);

    vec3 plume = plumeLayers(point * vec2(1.16, 0.92), clock * 0.78, 0.68, 0.032);
    vec2 ventPoint = (point - vec2(0.0, -0.25)) / vec2(0.24, 0.070);
    float ventDistance = length(ventPoint) + (basaltNoise - 0.5) * 0.18;
    float vent = 1.0 - smoothstep(0.68, 1.02, ventDistance);
    float lavaFlow = 1.0 - smoothstep(0.012, 0.042, abs(abs(groundPoint.x) - (0.10 + max(-groundPoint.y, 0.0) * 0.72 + sin(groundPoint.y * 17.0 + clock * 0.38) * 0.020)));
    lavaFlow *= mound * smoothstep(-0.02, 0.10, -groundPoint.y) * (1.0 - smoothstep(0.22, 0.32, -groundPoint.y));
    float lava = max(max(vent, lavaFlow * 0.72), plume.x * smoothstep(-0.34, 0.18, point.y));
    float bombs = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float unit = float(index) / 4.0;
      float life = fract(clock * (0.13 + unit * 0.025) + unit * 1.73);
      float direction = mod(float(index), 2.0) * 2.0 - 1.0;
      vec2 center = vec2(direction * (0.06 + unit * 0.22) * life, -0.16 + life * 1.55 - life * life * 1.62);
      float visibility = smoothstep(0.02, 0.12, life) * (1.0 - smoothstep(0.84, 0.98, life));
      bombs = max(bombs, ellipseMask(point, center, vec2(0.016 + unit * 0.010), 0.34) * visibility);
    }
    return vec3(rock, cracks, max(lava, bombs));
  }

  vec3 earthSeed(vec2 point, float clock) {
    vec2 seedPoint = point - vec2(uPointer.x * 0.02, -0.34 + uPointer.y * 0.012);
    float seed = ellipseMask(seedPoint, vec2(0.0), vec2(0.16 + uPressed * 0.025, 0.12 + uPressed * 0.018), 0.28);
    float shell = 1.0 - smoothstep(0.014, 0.040, abs(length(seedPoint / vec2(0.16, 0.12)) - 0.84));
    shell *= 1.0 - smoothstep(1.0, 1.2, length(seedPoint / vec2(0.16, 0.12)));
    float fissure = 1.0 - smoothstep(0.010, 0.030, abs(seedPoint.x + sin(seedPoint.y * 18.0 + clock * 0.18) * 0.018));
    fissure *= seed;

    float wick = flameTongue(point, clock * 0.52, 0.0, 2.2, 0.46 + uPressed * 0.10, 0.090);
    wick = max(wick, flameTongue(point, clock * 0.46, 0.035, 5.4, 0.31 + uPressed * 0.08, 0.050) * 0.72);
    wick *= smoothstep(-0.30, -0.20, point.y);
    float seedAura = softGlow(point, vec2(0.0, -0.30), vec2(3.4, 5.2), 2.8) * (0.20 + uPressed * 0.12);
    float dust = 0.0;
    if (uQuality > 0.25)
      dust = emberField(point * vec2(0.82, 0.70), clock * 0.26, 0.020);
    return vec3(max(seed, seedAura), max(shell, fissure), max(wick, dust));
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float seedMode = step(0.5, uVariant);
    point.y += 0.02;

    vec3 volcanic = vec3(0.0);
    vec3 seed = vec3(0.0);
    if (seedMode < 0.5)
      volcanic = volcanicCore(point, clock);
    else
      seed = earthSeed(point, clock);

    float volcanicMask = max(volcanic.x, max(volcanic.y, volcanic.z));
    float seedMask = max(seed.x, max(seed.y, seed.z));
    float mask = mix(volcanicMask, seedMask, seedMode);
    vec3 textureField = fireTexture(point, clock * mix(0.72, 0.38, seedMode));
    float filament = smoothstep(0.58, 0.88, textureField.y) * mask;

    vec3 color = uOuter * (mask * 0.46 + volcanic.x * 0.42 + seed.x * 0.28);
    color += uInner * (mask * 0.38 + volcanic.z * 0.56 + seed.y * 0.74);
    color += uCore * (filament * 0.62 + volcanic.y * 1.18 + volcanic.z * 0.72 + seed.y * 0.72 + seed.z * 1.24);
    color *= uIntensity * (0.88 + 0.12 * sin(clock * mix(1.8, 0.9, seedMode)));

    float alpha = mask * (0.46 + textureField.x * 0.17 + textureField.z * 0.16);
    alpha += filament * 0.20 + volcanic.y * 0.18 + seed.z * 0.14;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
