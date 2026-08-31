import { sharedFragment } from './shared'

export const fluidFragmentShader = /* glsl */ `
  ${sharedFragment}

  vec3 tidalSheet(vec2 point, float clock) {
    float vertical = point.y + 0.48;
    float progress = saturate(vertical / 1.18);
    float sway = sin(vertical * 4.8 - clock * 1.18) * (0.018 + progress * 0.052);
    sway += sin(vertical * 10.4 + clock * 0.74) * progress * 0.018;
    sway += uPointer.x * progress * 0.11;
    sway += uDrag * sin(vertical * 6.2 + clock) * progress * 0.045;

    float width = mix(0.43, 0.025, pow(progress, 0.76));
    width *= 0.92 + sin(vertical * 8.0 - clock * 0.86) * 0.055;
    float texture = fbmFast(vec2(point.x * 3.4, vertical * 3.0 - clock * 0.38));
    float field = width - abs(point.x - sway) + (texture - 0.5) * 0.075 * uTurbulence;
    float verticalGate = smoothstep(-0.03, 0.07, vertical);
    verticalGate *= 1.0 - smoothstep(0.86, 1.18, vertical);
    float body = smoothstep(-0.032, 0.026, field) * verticalGate;
    float rim = (1.0 - smoothstep(0.004, 0.042, abs(field))) * verticalGate;
    float folds = smoothstep(0.58, 0.84, texture) * body;
    folds *= 0.54 + 0.46 * sin(vertical * 17.0 - clock * 1.42 + texture * 5.0);
    return vec3(body, rim, saturate(folds));
  }

  float liquidTongue(
    vec2 point,
    float clock,
    float center,
    float phase,
    float height,
    float width
  ) {
    float vertical = point.y + 0.43;
    float progress = saturate(vertical / max(height, 0.01));
    float crest = sin(progress * 5.2 + phase - clock * 1.15);
    crest += sin(progress * 11.0 - phase * 0.7 + clock * 0.58) * 0.28;
    crest *= 0.016 + progress * 0.082 * uTurbulence;
    crest += uPointer.x * progress * 0.08;
    crest += uDrag * sin(phase) * progress * 0.055;

    float tongueWidth = mix(width, 0.010, pow(progress, 0.72));
    tongueWidth *= 0.92 + 0.08 * sin(clock * 0.82 + phase);
    float field = tongueWidth - abs(point.x - center - crest);
    float mask = smoothstep(-0.018, 0.022, field);
    mask *= smoothstep(-0.04, 0.055, vertical);
    mask *= 1.0 - smoothstep(height - 0.19, height, vertical);
    return mask;
  }

  vec3 tidalBasin(vec2 point, float clock) {
    vec2 basinPoint = point - vec2(uPointer.x * 0.025, -0.39 + uPointer.y * 0.012);
    basinPoint.x -= uDrag * 0.040;
    basinPoint.y *= 3.35;
    float texture = fbmFast(basinPoint * vec2(4.8, 5.6) + vec2(clock * 0.08, -clock * 0.13));
    float angle = atan(basinPoint.y, basinPoint.x);
    float radius = length(basinPoint);
    radius += (texture - 0.5) * 0.055;
    radius += sin(angle * 5.0 - clock * 0.44) * 0.012;

    float basinRadius = 0.48 + uPressed * 0.10;
    float fill = 1.0 - smoothstep(basinRadius - 0.08, basinRadius + 0.04, radius);
    float rim = 1.0 - smoothstep(0.014, 0.042, abs(radius - basinRadius));
    float innerRing = 1.0 - smoothstep(0.010, 0.030, abs(radius - basinRadius * 0.62));

    float travel = fract(radius * 3.25 - clock * 0.23 - uPressed * 0.18);
    float ripple = 1.0 - smoothstep(0.030, 0.105, abs(travel - 0.50));
    ripple *= fill * (1.0 - smoothstep(basinRadius * 0.84, basinRadius, radius));
    float tide = 0.5 + 0.5 * sin(angle * 3.0 + clock * 0.56 + uDrag * 2.2);
    ripple *= 0.42 + tide * 0.58;
    return vec3(fill, max(rim, innerRing * 0.64), ripple);
  }

  float fluidLeaf(vec2 point, vec2 center, float angle, vec2 scale) {
    point -= center;
    point = rotate2d(angle) * point;
    point /= scale;
    float pointed = length(point) + abs(point.y) * 0.18;
    return 1.0 - smoothstep(0.72, 1.0, pointed);
  }

  vec3 verdantGrowth(vec2 point, float clock) {
    float stems = 0.0;
    float leaves = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float unit = float(index) / 4.0;
      float center = mix(-0.32, 0.32, unit);
      float height = 0.34 + sin(unit * 7.2 + 1.3) * 0.10 + uPressed * 0.11;
      float vertical = point.y + 0.40;
      float bend = sin(vertical * 7.0 + clock * 0.58 + unit * 4.0) * 0.025;
      bend += uPointer.x * smoothstep(0.0, height, vertical) * 0.055;
      float stem = 1.0 - smoothstep(0.010, 0.028, abs(point.x - center - bend));
      stem *= smoothstep(-0.02, 0.04, vertical) * (1.0 - smoothstep(height - 0.05, height, vertical));
      stems = max(stems, stem);

      vec2 tip = vec2(center + bend, height - 0.40);
      float leafAngle = mix(-0.72, 0.72, mod(float(index), 2.0));
      leaves = max(leaves, fluidLeaf(point, tip + vec2(-0.035, -0.015), leafAngle, vec2(0.055, 0.13)));
      leaves = max(leaves, fluidLeaf(point, tip + vec2(0.040, 0.005), -leafAngle, vec2(0.052, 0.12)));
    }
    float seedGlow = softGlow(point, vec2(0.0, -0.31), vec2(1.4, 4.4), 2.8);
    return vec3(stems, leaves, seedGlow);
  }

  vec3 cloudWaterBanks(vec2 point, float clock) {
    float drift = sin(point.x * 5.0 - clock * 0.42) * 0.022;
    float texture = fbmFast(point * vec2(3.2, 6.8) + vec2(clock * 0.10, -clock * 0.18));
    float lowerBand = exp(-pow((point.y + 0.28 + drift) * 8.8, 2.0));
    lowerBand *= 1.0 - smoothstep(0.40, 0.72, abs(point.x));
    float upperBand = exp(-pow((point.y + 0.02 - drift) * 9.6, 2.0));
    upperBand *= 1.0 - smoothstep(0.24, 0.56, abs(point.x));
    float banks = max(lowerBand * (0.54 + texture * 0.46), upperBand * (0.48 + texture * 0.52));

    float rain = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float unit = float(index) / 4.0;
      float center = mix(-0.42, 0.42, unit) + sin(clock * 0.34 + unit * 8.0) * 0.018;
      float streak = 1.0 - smoothstep(0.008, 0.024, abs(point.x - center));
      streak *= smoothstep(-0.58, -0.48, point.y) * (1.0 - smoothstep(-0.31, -0.19, point.y));
      rain = max(rain, streak * (0.46 + 0.54 * sin(unit * 11.0 + clock) * sin(unit * 11.0 + clock)));
    }
    float silverLining = smoothstep(0.60, 0.88, texture) * banks;
    return vec3(banks, rain, silverLining);
  }

  vec3 venomPool(vec2 point, float clock) {
    vec2 poolPoint = point - vec2(uDrag * 0.055, -0.38);
    poolPoint.y *= 3.15;
    float bubbles = 0.0;
    float cores = 0.0;
    for (int index = 0; index < 6; index += 1) {
      float seed = float(index) * 3.17 + 1.2;
      vec2 center = vec2(
        sin(seed * 2.4 + clock * 0.22) * (0.12 + 0.055 * float(index)),
        cos(seed * 1.7 + clock * 0.31) * 0.11
      );
      float radius = 0.026 + 0.012 * mod(float(index), 3.0) + uPressed * 0.010;
      float distanceToBubble = length(poolPoint - center);
      float ring = 1.0 - smoothstep(0.008, 0.024, abs(distanceToBubble - radius));
      bubbles = max(bubbles, ring);
      cores = max(cores, 1.0 - smoothstep(radius * 0.22, radius * 0.86, distanceToBubble));
    }
    float tendrils = liquidTongue(point, clock * 0.78, -0.26, 2.4, 0.62 + uPressed * 0.07, 0.075);
    tendrils = max(tendrils, liquidTongue(point, clock * 0.86, 0.30, 6.1, 0.55 + uPressed * 0.08, 0.082));
    return vec3(bubbles, cores, tendrils);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float verdant = 1.0 - step(0.5, abs(uVariant - 1.0));
    float cloudwater = 1.0 - step(0.5, abs(uVariant - 2.0));
    float venom = step(2.5, uVariant);
    point.y += 0.05;

    vec2 flowingPoint = point;
    flowingPoint.x += (fbmFast(vec2(point.y * 2.4, clock * 0.19)) - 0.5) * 0.075 * uTurbulence;
    flowingPoint.y += (fbmFast(vec2(point.x * 2.2 - clock * 0.11, clock * 0.17)) - 0.5) * 0.034;
    flowingPoint.x *= 1.0 - cloudwater * 0.14 + venom * 0.08;

    vec3 sheet = tidalSheet(flowingPoint, clock);
    float tongues = liquidTongue(flowingPoint, clock, -0.19, 1.7, 0.78 + uPressed * 0.11, 0.125);
    tongues = max(tongues, liquidTongue(flowingPoint, clock, 0.02, 4.2, 1.08 + uPressed * 0.14, 0.145));
    tongues = max(tongues, liquidTongue(flowingPoint, clock, 0.23, 7.4, 0.72 + uPressed * 0.10, 0.115));

    vec3 textureField = fireTexture(flowingPoint * vec2(1.18, 0.88), clock * 0.68);
    float breakup = flameBreakup(flowingPoint, textureField, 0.46);
    float liquidBody = max(sheet.x, tongues * 0.88) * (1.0 - breakup * 0.34);
    liquidBody *= 1.0 - verdant * 0.24 - cloudwater * 0.34 - venom * 0.16;
    float edgeLight = max(sheet.y, tongues * smoothstep(0.48, 0.82, textureField.y));
    float liquidFolds = max(sheet.z, liquidBody * smoothstep(0.60, 0.88, textureField.x));

    vec3 basin = tidalBasin(point, clock);
    float surfaceMask = max(basin.x * 0.48, basin.y);
    surfaceMask = max(surfaceMask, basin.z * 0.82);
    float mask = max(liquidBody, surfaceMask);

    vec3 growth = vec3(0.0);
    vec3 cloudBanks = vec3(0.0);
    vec3 poison = vec3(0.0);
    if (verdant > 0.5)
      growth = verdantGrowth(point, clock);
    if (cloudwater > 0.5)
      cloudBanks = cloudWaterBanks(point, clock);
    if (venom > 0.5)
      poison = venomPool(point, clock);
    float growthMask = max(growth.x * 0.78, growth.y);
    float cloudMask = max(cloudBanks.x, max(cloudBanks.y * 0.72, cloudBanks.z));
    float poisonMask = max(poison.x, max(poison.y * 0.52, poison.z));
    mask = max(mask, growthMask * verdant);
    mask = max(mask, cloudMask * cloudwater);
    mask = max(mask, poisonMask * venom);

    float horizontalCaustic = 0.5 + 0.5 * sin(flowingPoint.y * 25.0 - clock * 1.08 + textureField.x * 5.8);
    horizontalCaustic = smoothstep(0.70, 0.96, horizontalCaustic) * liquidBody;
    float core = softGlow(point, vec2(0.0, -0.28), vec2(1.9, 4.8), 2.8);
    core *= liquidBody + basin.x * 0.52;

    float spray = 0.0;
    if (uQuality > 0.25)
      spray = emberField(point * vec2(0.92, 0.84), clock * mix(0.56, 0.38, verdant), 0.035 + uPressed * 0.028 + verdant * 0.025 + venom * 0.018);

    float pulse = 0.90 + 0.08 * sin(clock * 1.06) + uPressed * 0.08;
    vec3 color = uOuter * (liquidBody * 0.48 + basin.x * 0.20);
    color += uInner * (liquidBody * 0.38 + edgeLight * 0.96 + basin.y * 1.12 + basin.z * 0.72);
    color += uCore * (liquidFolds * 0.70 + horizontalCaustic * 0.54 + core * 0.48 + spray * 1.26);
    color += mix(uInner, uCore, 0.58) * growth.x * 1.18 + uCore * growth.y * 1.28 + uInner * growth.z * verdant * 0.42;
    color += uOuter * cloudBanks.x * 0.54 + uInner * cloudBanks.y * 1.08 + uCore * cloudBanks.z * 1.22;
    color += uInner * poison.x * 1.34 + uOuter * poison.y * 0.56 + mix(uInner, uCore, 0.42) * poison.z * 1.08;
    color *= uIntensity * pulse;

    float alpha = liquidBody * (0.55 + textureField.z * 0.25);
    alpha += edgeLight * 0.28 + liquidFolds * 0.18;
    alpha += basin.x * 0.13 + basin.y * 0.62 + basin.z * 0.42 + spray * 0.78;
    alpha = max(alpha, growthMask * verdant * 0.92);
    alpha = max(alpha, cloudMask * cloudwater * 0.88);
    alpha = max(alpha, poisonMask * venom * 0.94);
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
