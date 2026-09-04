import { sharedFragment } from './shared'

export const fluidFragmentShader = /* glsl */ `
  ${sharedFragment}

  vec3 tidalSheet(vec2 point, float clock) {
    float rise = point.y + 0.48;
    float progress = saturate(rise / 1.18);
    float sway = sin(rise * 4.8 - clock * 1.18) * (0.018 + progress * 0.052);
    sway += sin(rise * 10.4 + clock * 0.74) * progress * 0.018;
    sway += uPointer.x * progress * 0.11;
    sway += uDrag * sin(rise * 6.2 + clock) * progress * 0.045;

    float width = mix(0.43, 0.025, pow(progress, 0.76));
    width *= 0.92 + sin(rise * 8.0 - clock * 0.86) * 0.055;
    float tex = fbmFast(vec2(point.x * 3.4, rise * 3.0 - clock * 0.38));
    float field = width - abs(point.x - sway) + (tex - 0.5) * 0.075 * uTurbulence;
    float verticalGate = smoothstep(-0.03, 0.07, rise);
    verticalGate *= 1.0 - smoothstep(0.86, 1.18, rise);
    float body = smoothstep(-0.032, 0.026, field) * verticalGate;
    float rim = (1.0 - smoothstep(0.004, 0.042, abs(field))) * verticalGate;
    float folds = smoothstep(0.58, 0.84, tex) * body;
    folds *= 0.54 + 0.46 * sin(rise * 17.0 - clock * 1.42 + tex * 5.0);
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
    float rise = point.y + 0.43;
    float progress = saturate(rise / max(height, 0.01));
    float crest = sin(progress * 5.2 + phase - clock * 1.15);
    crest += sin(progress * 11.0 - phase * 0.7 + clock * 0.58) * 0.28;
    crest *= 0.016 + progress * 0.082 * uTurbulence;
    crest += uPointer.x * progress * 0.08;
    crest += uDrag * sin(phase) * progress * 0.055;

    float tongueWidth = mix(width, 0.010, pow(progress, 0.72));
    tongueWidth *= 0.92 + 0.08 * sin(clock * 0.82 + phase);
    float field = tongueWidth - abs(point.x - center - crest);
    float mask = smoothstep(-0.018, 0.022, field);
    mask *= smoothstep(-0.04, 0.055, rise);
    mask *= 1.0 - smoothstep(height - 0.19, height, rise);
    return mask;
  }

  vec3 tidalBasin(vec2 point, float clock) {
    vec2 pool = point - vec2(uPointer.x * 0.025, -0.39 + uPointer.y * 0.012);
    pool.x -= uDrag * 0.040;
    pool.y *= 3.35;
    float tex = fbmFast(pool * vec2(4.8, 5.6) + vec2(clock * 0.08, -clock * 0.13));
    float angle = atan(pool.y, pool.x);
    float radius = length(pool);
    radius += (tex - 0.5) * 0.055;
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
    point = rotate2d(angle) * (point - center) / scale;
    float y = saturate(point.y);
    float w = sqrt(y) * (1.0 - y) * 1.70;
    float leaf = smoothstep(-0.12, 0.06, w - abs(point.x));
    return leaf * smoothstep(0.0, 0.12, point.y) * (1.0 - smoothstep(0.82, 1.0, point.y));
  }

  vec3 verdantGrowth(vec2 point, float clock) {
    float stems = 0.0;
    float leaves = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float unit = float(index) / 4.0;
      float cycle = fract(clock * 0.28 + float(index) * 0.173);
      float grow = smoothstep(0.02, 0.34, cycle) * (1.0 - smoothstep(0.78, 0.98, cycle));
      float center = mix(-0.32, 0.32, unit) + sin(clock * 0.16 + unit * 11.0) * 0.025;
      float height = (0.34 + sin(unit * 7.2 + 1.3) * 0.10) * (0.18 + grow * 0.82) + uPressed * 0.11;
      float rise = point.y + 0.40;
      float bend = sin(rise * 7.0 + clock * 0.58 + unit * 4.0) * 0.025;
      bend += uPointer.x * smoothstep(0.0, height, rise) * 0.055;
      float stem = 1.0 - smoothstep(0.010, 0.028, abs(point.x - center - bend));
      stem *= smoothstep(-0.02, 0.04, rise) * (1.0 - smoothstep(height - 0.05, height, rise));
      stems = max(stems, stem * grow);

      vec2 tip = vec2(center + bend, height - 0.40);
      float open = smoothstep(0.24, 0.58, cycle) * (1.0 - smoothstep(0.80, 0.98, cycle));
      float angle = mix(0.08, 0.48, open);
      leaves = max(leaves, fluidLeaf(point, tip, angle, vec2(0.055, 0.13) * (0.18 + open * 0.82)) * open);
      leaves = max(leaves, fluidLeaf(point, tip, -angle, vec2(0.052, 0.12) * (0.18 + open * 0.82)) * open);
    }
    float seed = softGlow(point, vec2(0.0, -0.31), vec2(1.4, 4.4), 2.8);
    return vec3(stems, leaves, seed);
  }

  vec3 cloudWaterBanks(vec2 point, float clock) {
    float drift = sin(point.x * 5.0 - clock * 0.42) * 0.022;
    float tex = fbmFast(point * vec2(3.2, 6.8) + vec2(clock * 0.10, -clock * 0.18));
    float lowerBand = exp(-pow((point.y + 0.28 + drift) * 8.8, 2.0));
    lowerBand *= 1.0 - smoothstep(0.40, 0.72, abs(point.x));
    float upperBand = exp(-pow((point.y + 0.02 - drift) * 9.6, 2.0));
    upperBand *= 1.0 - smoothstep(0.24, 0.56, abs(point.x));
    float lowerBillow = smoothstep(0.24, 0.74, tex + lowerBand * 0.66);
    float upperBillow = smoothstep(0.30, 0.78, (1.0 - tex) * 0.62 + upperBand * 0.72);
    float lowerPuffs = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float unit = float(index) / 4.0;
      vec2 center = vec2(mix(-0.43, 0.43, unit) + sin(clock * 0.22 + unit * 9.0) * 0.018, -0.28 + sin(unit * 7.0 + clock * 0.18) * 0.025);
      vec2 local = (point - center) / vec2(0.19, 0.095 + mod(float(index), 2.0) * 0.022);
      float puff = 1.0 - smoothstep(0.74, 1.06, length(local) + (tex - 0.5) * 0.22);
      lowerPuffs = max(lowerPuffs, puff);
    }
    float upperPuffs = 0.0;
    for (int index = 0; index < 4; index += 1) {
      float unit = float(index) / 3.0;
      vec2 center = vec2(mix(-0.29, 0.29, unit) - sin(clock * 0.19 + unit * 8.0) * 0.016, -0.02 + sin(unit * 6.0 - clock * 0.16) * 0.020);
      vec2 local = (point - center) / vec2(0.17, 0.085 + mod(float(index), 2.0) * 0.018);
      float puff = 1.0 - smoothstep(0.72, 1.05, length(local) + (0.5 - tex) * 0.20);
      upperPuffs = max(upperPuffs, puff);
    }
    float banks = max(max(lowerBand * 0.36, lowerPuffs) * (0.42 + lowerBillow * 0.58), max(upperBand * 0.34, upperPuffs) * (0.40 + upperBillow * 0.60));

    float rain = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float unit = float(index) / 4.0;
      float center = mix(-0.42, 0.42, unit) + sin(clock * 0.34 + unit * 8.0) * 0.018;
      float streak = 1.0 - smoothstep(0.008, 0.024, abs(point.x - center));
      streak *= smoothstep(-0.58, -0.48, point.y) * (1.0 - smoothstep(-0.31, -0.19, point.y));
      rain = max(rain, streak * (0.46 + 0.54 * sin(unit * 11.0 + clock) * sin(unit * 11.0 + clock)));
    }
    float lining = smoothstep(0.60, 0.88, tex) * banks;
    return vec3(banks, rain, lining);
  }

  vec3 venomPool(vec2 point, float clock) {
    vec2 poolPoint = point - vec2(uDrag * 0.055, -0.38);
    poolPoint.y *= 3.15;
    float bubbles = 0.0;
    float cores = 0.0;
    for (int index = 0; index < 6; index += 1) {
      float seed = float(index) * 3.17 + 1.2;
      float life = fract(clock * (0.10 + mod(float(index), 3.0) * 0.018) + seed * 0.13);
      float visibility = smoothstep(0.04, 0.20, life) * (1.0 - smoothstep(0.76, 0.98, life));
      vec2 center = vec2(
        sin(seed * 2.4 + clock * 0.22) * (0.12 + 0.055 * float(index)),
        cos(seed * 1.7 + clock * 0.31) * 0.08 + mix(-0.10, 0.14, life)
      );
      float radius = (0.020 + 0.014 * mod(float(index), 3.0)) * (0.52 + life * 0.80) + uPressed * 0.010;
      float distanceToBubble = length(poolPoint - center);
      float ring = 1.0 - smoothstep(0.008, 0.024, abs(distanceToBubble - radius));
      float burst = 1.0 - smoothstep(0.010, 0.034, abs(distanceToBubble - radius * (1.0 + (life - 0.72) * 2.6)));
      burst *= smoothstep(0.72, 0.84, life) * (1.0 - smoothstep(0.88, 0.98, life));
      bubbles = max(bubbles, max(ring * visibility, burst));
      cores = max(cores, (1.0 - smoothstep(radius * 0.22, radius * 0.86, distanceToBubble)) * visibility * (1.0 - life));
    }
    float tendrils = liquidTongue(point, clock * 0.78, -0.26, 2.4, 0.62 + uPressed * 0.07, 0.075);
    tendrils = max(tendrils, liquidTongue(point, clock * 0.86, 0.30, 6.1, 0.55 + uPressed * 0.08, 0.082));
    tendrils = max(tendrils, liquidTongue(point, clock * 0.72, 0.02, 4.8, 0.72 + uPressed * 0.06, 0.060));
    return vec3(bubbles, cores, tendrils);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float verdant = 1.0 - step(0.5, abs(uVariant - 1.0));
    float cloudy = 1.0 - step(0.5, abs(uVariant - 2.0));
    float venom = step(2.5, uVariant);
    point.y += 0.05;

    vec2 flow = point;
    flow.x += (fbmFast(vec2(point.y * 2.4, clock * 0.19)) - 0.5) * 0.075 * uTurbulence;
    flow.y += (fbmFast(vec2(point.x * 2.2 - clock * 0.11, clock * 0.17)) - 0.5) * 0.034;
    flow.x *= 1.0 - cloudy * 0.14 + venom * 0.08;

    vec3 sheet = tidalSheet(flow, clock);
    float tips = liquidTongue(flow, clock, -0.19, 1.7, 0.78 + uPressed * 0.11, 0.125);
    tips = max(tips, liquidTongue(flow, clock, 0.02, 4.2, 1.08 + uPressed * 0.14, 0.145));
    tips = max(tips, liquidTongue(flow, clock, 0.23, 7.4, 0.72 + uPressed * 0.10, 0.115));

    vec3 tex = fireTexture(flow * vec2(1.18, 0.88), clock * 0.68);
    float breakup = flameBreakup(flow, tex, 0.46);
    float body = max(sheet.x, tips * 0.88) * (1.0 - breakup * 0.34);
    body *= 1.0 - verdant * 0.24 - cloudy * 0.34 - venom * 0.16;
    float edge = max(sheet.y, tips * smoothstep(0.48, 0.82, tex.y));
    float folds = max(sheet.z, body * smoothstep(0.60, 0.88, tex.x));

    vec3 basin = tidalBasin(point, clock);
    float basinFill = basin.x * mix(0.48, 0.12, cloudy);
    basinFill = mix(basinFill, basin.x * 0.54, venom);
    float basinEdge = basin.y * (1.0 - cloudy * 0.84 - venom * 0.58);
    float basinRipple = basin.z * (1.0 - cloudy * 0.92 - venom * 0.76);
    float surface = max(basinFill, basinEdge);
    surface = max(surface, basinRipple * 0.82);
    float mask = max(body, surface);

    vec3 growth = vec3(0.0);
    vec3 clouds = vec3(0.0);
    vec3 poison = vec3(0.0);
    if (verdant > 0.5)
      growth = verdantGrowth(point, clock);
    if (cloudy > 0.5)
      clouds = cloudWaterBanks(point, clock);
    if (venom > 0.5)
      poison = venomPool(point, clock);
    float gMask = max(growth.x * 0.78, growth.y);
    float cMask = max(clouds.x, max(clouds.y * 0.72, clouds.z));
    float pMask = max(poison.x, max(poison.y * 0.52, poison.z));
    mask = max(mask, gMask * verdant);
    mask = max(mask, cMask * cloudy);
    mask = max(mask, pMask * venom);

    float caustic = 0.5 + 0.5 * sin(flow.y * 25.0 - clock * 1.08 + tex.x * 5.8);
    caustic = smoothstep(0.70, 0.96, caustic) * body;
    float core = softGlow(point, vec2(0.0, -0.28), vec2(1.9, 4.8), 2.8);
    core *= body + basin.x * 0.52;

    float spray = 0.0;
    if (uQuality > 0.25)
      spray = emberField(point * vec2(0.92, 0.84), clock * mix(0.56, 0.38, verdant), 0.035 + uPressed * 0.028 + verdant * 0.025 + venom * 0.018);

    float pulse = 0.90 + 0.08 * sin(clock * 1.06) + uPressed * 0.08;
    vec3 color = uOuter * (body * 0.48 + basinFill * 0.42);
    color += uInner * (body * 0.38 + edge * 0.96 + basinEdge * 1.12 + basinRipple * 0.72);
    color += uCore * (folds * 0.70 + caustic * 0.54 + core * 0.48 + spray * 1.26);
    color += mix(uOuter, uInner, 0.68) * growth.x * 1.28 + mix(uInner, uCore, 0.18) * growth.y * 1.18 + uInner * growth.z * verdant * 0.42;
    color += uOuter * clouds.x * 0.54 + uInner * clouds.y * 1.08 + uCore * clouds.z * 1.22;
    color += uInner * poison.x * 1.34 + uOuter * poison.y * 0.56 + mix(uInner, uCore, 0.42) * poison.z * 1.08;
    color *= uIntensity * pulse;

    float alpha = body * (0.55 + tex.z * 0.25);
    alpha += edge * 0.28 + folds * 0.18;
    alpha += basinFill * 0.26 + basinEdge * 0.62 + basinRipple * 0.42 + spray * 0.78;
    alpha = max(alpha, gMask * verdant * 0.92);
    alpha = max(alpha, cMask * cloudy * 0.88);
    alpha = max(alpha, pMask * venom * 0.94);
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
