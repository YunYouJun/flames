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

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    point.y += 0.05;

    vec2 flowingPoint = point;
    flowingPoint.x += (fbmFast(vec2(point.y * 2.4, clock * 0.19)) - 0.5) * 0.075 * uTurbulence;
    flowingPoint.y += (fbmFast(vec2(point.x * 2.2 - clock * 0.11, clock * 0.17)) - 0.5) * 0.034;

    vec3 sheet = tidalSheet(flowingPoint, clock);
    float tongues = liquidTongue(flowingPoint, clock, -0.19, 1.7, 0.78 + uPressed * 0.11, 0.125);
    tongues = max(tongues, liquidTongue(flowingPoint, clock, 0.02, 4.2, 1.08 + uPressed * 0.14, 0.145));
    tongues = max(tongues, liquidTongue(flowingPoint, clock, 0.23, 7.4, 0.72 + uPressed * 0.10, 0.115));

    vec3 textureField = fireTexture(flowingPoint * vec2(1.18, 0.88), clock * 0.68);
    float breakup = flameBreakup(flowingPoint, textureField, 0.46);
    float liquidBody = max(sheet.x, tongues * 0.88) * (1.0 - breakup * 0.34);
    float edgeLight = max(sheet.y, tongues * smoothstep(0.48, 0.82, textureField.y));
    float liquidFolds = max(sheet.z, liquidBody * smoothstep(0.60, 0.88, textureField.x));

    vec3 basin = tidalBasin(point, clock);
    float surfaceMask = max(basin.x * 0.48, basin.y);
    surfaceMask = max(surfaceMask, basin.z * 0.82);
    float mask = max(liquidBody, surfaceMask);

    float horizontalCaustic = 0.5 + 0.5 * sin(flowingPoint.y * 25.0 - clock * 1.08 + textureField.x * 5.8);
    horizontalCaustic = smoothstep(0.70, 0.96, horizontalCaustic) * liquidBody;
    float core = softGlow(point, vec2(0.0, -0.28), vec2(1.9, 4.8), 2.8);
    core *= liquidBody + basin.x * 0.52;

    float spray = 0.0;
    if (uQuality > 0.25)
      spray = emberField(point * vec2(0.92, 0.84), clock * 0.56, 0.035 + uPressed * 0.028);

    float pulse = 0.90 + 0.08 * sin(clock * 1.06) + uPressed * 0.08;
    vec3 color = uOuter * (liquidBody * 0.48 + basin.x * 0.20);
    color += uInner * (liquidBody * 0.38 + edgeLight * 0.96 + basin.y * 1.12 + basin.z * 0.72);
    color += uCore * (liquidFolds * 0.70 + horizontalCaustic * 0.54 + core * 0.48 + spray * 1.26);
    color *= uIntensity * pulse;

    float alpha = liquidBody * (0.55 + textureField.z * 0.25);
    alpha += edgeLight * 0.28 + liquidFolds * 0.18;
    alpha += basin.x * 0.13 + basin.y * 0.62 + basin.z * 0.42 + spray * 0.78;
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
