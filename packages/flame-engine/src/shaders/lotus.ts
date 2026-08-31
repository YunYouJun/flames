import { sharedFragment } from './shared'

export const lotusFragmentShader = /* glsl */ `
  ${sharedFragment}

  float petal(vec2 point, float angle, float spread, float petalLength) {
    point = rotate2d(angle) * point;
    point.y += 0.22;
    point.x /= spread;
    point.y /= petalLength;
    float radius = length(point);
    float cusp = abs(point.x) * 0.30;
    return 1.0 - smoothstep(0.68, 1.0, radius + cusp);
  }

  vec3 karmicWheel(vec2 point, float clock) {
    vec2 wheelPoint = point - vec2(0.0, -0.18);
    wheelPoint.y *= 3.15;
    float radius = length(wheelPoint);
    float angle = atan(wheelPoint.y, wheelPoint.x);
    float wheelRadius = 0.34 + uPressed * 0.060;
    float lotusLobes = cos(angle * 8.0 - clock * 0.42 - uDrag * 1.8);
    float petalRadius = wheelRadius + lotusLobes * 0.036;
    float segment = 0.72 + 0.28 * smoothstep(-0.48, 0.30, lotusLobes);
    float rim = (1.0 - smoothstep(0.018, 0.050, abs(radius - petalRadius))) * segment;
    float innerRim = 1.0 - smoothstep(0.014, 0.038, abs(radius - wheelRadius * 0.58));
    float spokes = 1.0 - smoothstep(0.020, 0.052, abs(sin(angle * 4.0 + clock * 0.16 + uDrag) * radius));
    spokes *= smoothstep(0.10, 0.14, radius) * (1.0 - smoothstep(wheelRadius * 0.92, wheelRadius, radius));

    float pulseLife = fract(clock * 0.24);
    float pulseRadius = mix(0.12, wheelRadius * 1.18, pulseLife);
    float pulse = 1.0 - smoothstep(0.012, 0.034, abs(radius - pulseRadius));
    pulse *= (1.0 - pulseLife) * (0.30 + uPressed * 0.70);
    return vec3(max(rim, innerRim * 0.56), spokes, pulse);
  }

  vec3 earthcoreRoots(vec2 point, float clock) {
    vec2 rootPoint = point - vec2(0.0, -0.11);
    rootPoint.x += uDrag * 0.045;
    float distanceFromCore = abs(rootPoint.x);
    float noise = fbmFast(rootPoint * vec2(6.4, 11.0) + vec2(clock * 0.05, -clock * 0.12));
    float rootLine = rootPoint.y + distanceFromCore * 0.72 + sin(rootPoint.x * 15.0 + clock * 0.34) * 0.018;
    float forkLine = rootPoint.y + abs(rootPoint.x + 0.085) * 0.88 - 0.052 + sin(rootPoint.x * 22.0 - clock * 0.22) * 0.014;
    float branchLine = rootPoint.y + abs(rootPoint.x - 0.12) * 0.98 - 0.072 + sin(rootPoint.x * 19.0 + clock * 0.18) * 0.012;
    float cracks = 1.0 - smoothstep(0.012, 0.044, abs(rootLine));
    cracks = max(cracks, (1.0 - smoothstep(0.010, 0.036, abs(forkLine))) * smoothstep(0.08, 0.18, distanceFromCore));
    cracks = max(cracks, (1.0 - smoothstep(0.010, 0.034, abs(branchLine))) * smoothstep(0.14, 0.24, distanceFromCore));

    vec2 veinPoint = point - vec2(0.0, -0.13);
    veinPoint.y *= 1.72;
    float veinRadius = length(veinPoint);
    float veinAngle = atan(veinPoint.y, veinPoint.x);
    float surfaceVeins = 1.0 - smoothstep(0.014, 0.046, abs(sin(veinAngle * 3.0 + noise * 0.34) * veinRadius));
    surfaceVeins *= smoothstep(0.055, 0.11, veinRadius) * (1.0 - smoothstep(0.27, 0.43, veinRadius));
    cracks = max(cracks, surfaceVeins * (0.64 + uPressed * 0.28));
    cracks *= 0.62 + noise * 0.38;
    cracks *= 1.0 - smoothstep(0.42, 0.58, distanceFromCore);
    cracks *= 1.0 - smoothstep(0.08, 0.28, rootPoint.y);

    float basin = softGlow(rootPoint, vec2(0.0), vec2(0.46, 0.16), 5.8);
    float pulse = 0.5 + 0.5 * sin(clock * 1.18 - distanceFromCore * 10.0);
    pulse = smoothstep(0.52, 0.92, pulse) * cracks * (0.38 + uPressed * 0.62);
    return vec3(cracks, basin, pulse);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float karmic = 1.0 - step(0.5, abs(uVariant - 1.0));
    float earthcore = step(1.5, uVariant);
    point.y += 0.08;
    vec2 pointerReach = mix(vec2(0.025, -0.016), vec2(0.036, -0.022), karmic);
    pointerReach = mix(pointerReach, vec2(0.020, -0.012), earthcore);
    point += uPointer * pointerReach * (0.3 + uPressed * 0.7);

    vec2 flowingPoint = advectFlame(point, clock);
    flowingPoint.x += karmic * sin(flowingPoint.y * 7.2 - clock * 2.3) * 0.022;
    flowingPoint.x *= mix(1.0, 1.28, karmic);
    flowingPoint.x *= mix(1.0, 0.88, earthcore);
    float plumeHeight = mix(0.92, 1.08, karmic);
    plumeHeight = mix(plumeHeight, 0.74, earthcore) + uPressed * mix(0.08, 0.04, earthcore);
    float plumeWidth = mix(0.030, 0.038, karmic);
    plumeWidth = mix(plumeWidth, 0.024, earthcore);
    vec3 plume = plumeLayers(flowingPoint, clock, plumeHeight, plumeWidth);
    float tongues = flameTongue(flowingPoint, clock, -0.13, 1.8, mix(1.22, 0.84, earthcore), mix(0.13, 0.16, earthcore));
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.08, 4.1, mix(1.38, 0.92, earthcore), mix(0.15, 0.17, earthcore)));
    tongues = max(tongues, flameTongue(flowingPoint, clock, 0.22, 6.8, mix(1.08, 0.78, earthcore), mix(0.10, 0.13, earthcore)));
    float karmicTongues = flameTongue(flowingPoint, clock, -0.15, 3.2, 1.62, 0.085);
    karmicTongues = max(karmicTongues, flameTongue(flowingPoint, clock, 0.16, 5.7, 1.72, 0.078));
    float body = max(plume.x, tongues * 0.88);
    body = max(body, karmicTongues * karmic * 0.92);
    vec3 textureField = fireTexture(flowingPoint, clock);
    float breakup = flameBreakup(flowingPoint, textureField, 0.72);
    float livingBody = body * (1.0 - breakup * 0.68);
    float earthLowerRegion = 1.0 - smoothstep(-0.38, -0.08, point.y);
    float earthLowerSide = smoothstep(0.05, 0.42, abs(point.x));
    livingBody *= 1.0 - earthcore * earthLowerRegion * (0.62 + earthLowerSide * 0.30);
    float dimensionalBloom = smoothstep(0.30, 0.70, uQuality);
    float dimensionalBody = mix(0.58, 0.69, karmic);
    dimensionalBody = mix(dimensionalBody, 0.64, earthcore);
    livingBody *= mix(1.0, dimensionalBody, dimensionalBloom);

    float petals = 0.0;
    float bloom = mix(0.15, 0.11, karmic) + uPressed * mix(0.10, 0.14, karmic) + sin(clock * mix(1.9, 2.35, karmic)) * 0.012;
    bloom = mix(bloom, 0.19 + uPressed * 0.085 + sin(clock * 1.12) * 0.009, earthcore);

    for (int index = 0; index < 7; index += 1) {
      float unit = float(index) / 6.0;
      float angle = mix(-1.25, 1.25, unit);
      angle += sin(clock * 1.45 + unit * PI * 2.0) * 0.026;
      float petalBreath = 0.90 + 0.10 * sin(clock * 2.15 + unit * PI * 2.0);
      float petalBase = mix(-0.32, -0.27, karmic);
      petalBase = mix(petalBase, -0.18, earthcore);
      float petalAngle = mix(0.72, 0.58, karmic);
      petalAngle = mix(petalAngle, 0.64, earthcore);
      float petalSpread = mix(0.15, 0.115, karmic);
      petalSpread = mix(petalSpread, 0.17, earthcore);
      float petalLength = mix(0.31, 0.36, karmic);
      petalLength = mix(petalLength, 0.25, earthcore);
      vec2 petalPoint = point - vec2(sin(angle) * bloom * petalBreath, petalBase + cos(angle) * 0.055);
      petals = max(petals, petal(petalPoint, angle * petalAngle, petalSpread, petalLength));
    }

    float innerPetals = petal(point - vec2(0.0, -0.15), 0.0, 0.12, 0.30);
    float karmicRosette = 0.0;
    float earthcoreCalyx = 0.0;
    vec3 wheel = vec3(0.0);
    vec3 roots = vec3(0.0);
    if (karmic > 0.5) {
      for (int index = 0; index < 8; index += 1) {
        float unit = float(index) / 8.0;
        float angle = unit * PI * 2.0 - clock * 0.055 - uDrag * 0.42;
        vec2 petalPoint = point - vec2(sin(angle) * (0.17 + uPressed * 0.030), -0.17 + cos(angle) * 0.052);
        karmicRosette = max(karmicRosette, petal(petalPoint, angle + PI * 0.5, 0.082, 0.22));
      }
      wheel = karmicWheel(point, clock);
    }
    if (earthcore > 0.5) {
      for (int index = 0; index < 7; index += 1) {
        float unit = float(index) / 6.0;
        float angle = mix(-1.32, 1.32, unit) + sin(clock * 0.62 + unit * PI * 2.0) * 0.018;
        vec2 petalPoint = point - vec2(sin(angle) * (0.19 + uPressed * 0.045), -0.16 + cos(angle) * 0.042);
        earthcoreCalyx = max(earthcoreCalyx, petal(petalPoint, angle * 0.62, 0.16, 0.235));
      }
      roots = earthcoreRoots(point, clock);
    }
    float flatPetalFallback = 1.0 - smoothstep(0.0, 0.30, uQuality);
    float petalMask = max(petals * 0.76, innerPetals * 0.86) * (1.0 - breakup * 0.22);
    petalMask *= flatPetalFallback;
    petalMask = max(petalMask, karmicRosette * karmic * mix(0.94, 0.46, dimensionalBloom));
    petalMask = max(petalMask, earthcoreCalyx * earthcore * mix(0.96, 0.52, dimensionalBloom));
    float ritualMask = max(wheel.x * 0.88, max(wheel.y * 0.36, wheel.z * 0.72));
    float rootMask = max(roots.x * 0.78, max(roots.y * 0.16, roots.z * 0.88));
    float mask = max(max(max(livingBody, petalMask), ritualMask * karmic), rootMask * earthcore);
    float detail = textureField.x;
    float filament = textureField.y * (0.56 + textureField.z * 0.44) * livingBody;
    float heat = saturate(mask * (0.22 + detail * 0.38) + filament * 0.30 + textureField.z * livingBody * 0.04 + tongues * 0.10);
    float karmicVein = 0.0;
    if (karmic > 0.5) {
      karmicVein = smoothstep(0.56, 0.78, fbmFast(point * vec2(7.2, 3.6) + vec2(clock * 0.16, -clock * 0.62)));
      karmicVein *= livingBody;
    }
    heat += karmicRosette * karmic * (0.11 + uPressed * 0.12) + karmicVein * 0.16 + wheel.y * 0.12;
    heat += earthcoreCalyx * earthcore * 0.14 + roots.x * 0.16 + roots.z * 0.22;
    heat += exp(-dot(point - vec2(0.0, -0.22), point - vec2(0.0, -0.22)) * 24.0) * mix(0.36, 0.18, dimensionalBloom);

    float halo = softGlow(point, vec2(0.0, -0.08), vec2(0.72, 1.0), 2.8) * 0.15;
    halo += max(plume.y - plume.x * 0.72, 0.0) * 0.16;
    halo += roots.y * earthcore * 0.16;
    float embers = 0.0;
    if (uQuality > 0.25)
      embers = emberField(point, clock, 0.08 + uQuality * 0.09);
    embers *= mix(1.0, 0.58, earthcore);

    float flicker = flameFlicker(flowingPoint, clock);
    vec3 color = flameRadiance(heat) * (0.58 + heat * 0.62) * flicker * uIntensity;
    color *= mix(1.0, mix(0.72, 0.79, karmic), dimensionalBloom);
    color += uOuter * halo * 0.75 + mix(uInner, uCore, 0.72) * embers * 1.65;
    color += mix(uInner, uCore, 0.72) * karmicVein * (0.26 + uPressed * 0.34);
    color += uInner * wheel.x * 2.35 + mix(uOuter, uInner, 0.78) * karmicRosette * 1.08;
    color += uInner * wheel.y * 0.76 + mix(uInner, uCore, 0.76) * wheel.z * 1.48;
    color += mix(uOuter, uInner, 0.72) * earthcoreCalyx * earthcore * 0.92;
    color += mix(uInner, uCore, 0.72) * roots.x * 2.28 + uOuter * roots.y * 0.62 + uCore * roots.z * 1.54;
    float karmicChar = karmic * smoothstep(0.64, 0.90, textureField.y) * livingBody * (1.0 - heat * 0.38);
    color = mix(color, uOuter * 0.18, karmicChar * 0.58);
    float alpha = saturate(mask * (0.55 + detail * 0.32 + textureField.z * 0.12) + filament * 0.12 + halo * 0.52 + embers);
    alpha *= 1.0 - karmicChar * 0.32;
    float lowerRegion = 1.0 - smoothstep(-0.46, -0.12, point.y);
    float lowerSide = smoothstep(0.15, 0.50, abs(point.x));
    alpha *= 1.0 - karmic * lowerRegion * (0.20 + lowerSide * 0.58);
    alpha = max(alpha, ritualMask * karmic * 0.94);
    alpha = max(alpha, rootMask * earthcore * 0.96);
    alpha *= mix(1.0, 0.72, dimensionalBloom);

    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
