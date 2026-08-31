import { sharedFragment } from './shared'

export const soulFragmentShader = /* glsl */ `
  ${sharedFragment}

  float ellipseMask(vec2 point, vec2 center, vec2 scale, float softness) {
    float distanceToEdge = length((point - center) / scale);
    return 1.0 - smoothstep(1.0 - softness, 1.0, distanceToEdge);
  }

  vec3 heartSerpent(vec2 point, float clock) {
    float vertical = point.y + 0.52;
    float progress = saturate(vertical / 1.26);
    float center = sin(progress * 11.2 - clock * 0.78) * mix(0.25, 0.07, progress);
    center += uPointer.x * progress * 0.11 + uDrag * sin(progress * 9.0) * 0.06;
    float bodyWidth = mix(0.082, 0.025, progress);
    float serpent = 1.0 - smoothstep(bodyWidth * 0.36, bodyWidth, abs(point.x - center));
    serpent *= smoothstep(-0.03, 0.06, vertical) * (1.0 - smoothstep(1.02, 1.25, vertical));
    float transparentScales = 0.54 + smoothstep(0.44, 0.90, 0.5 + 0.5 * sin(vertical * 30.0 - clock * 1.45)) * 0.46;
    serpent *= transparentScales;

    vec2 headPoint = point - vec2(center + uPointer.x * 0.025, 0.66 + uPressed * 0.045);
    float head = ellipseMask(headPoint, vec2(0.0), vec2(0.14, 0.085), 0.34);
    float jaws = 1.0 - smoothstep(0.010, 0.030, abs(headPoint.y + abs(headPoint.x) * 0.28));
    jaws *= smoothstep(0.045, 0.09, abs(headPoint.x)) * (1.0 - smoothstep(0.13, 0.18, abs(headPoint.x)));

    vec2 heartPoint = point - vec2(uPointer.x * 0.025, -0.08 + uPointer.y * 0.018);
    float heartRadius = 0.19 + uPressed * 0.065;
    float heartRing = 1.0 - smoothstep(0.014, 0.045, abs(length(heartPoint * vec2(1.0, 1.08)) - heartRadius));
    float pulse = 0.5 + 0.5 * sin(clock * 2.9);
    heartRing *= 0.68 + pulse * 0.32;
    float heatHaze = softGlow(point, vec2(0.0, -0.03), vec2(2.2, 1.5), 1.0);
    heatHaze *= 0.20 + fbmFast(point * 3.2 - vec2(0.0, clock * 0.42)) * 0.35;
    return vec3(serpent, max(head, jaws), max(heartRing, heatHaze));
  }

  vec3 dualFlames(vec2 point, float clock) {
    vec2 orbitPoint = point - vec2(uPointer.x * 0.04, -0.06 + uPointer.y * 0.02);
    float orbitAngle = clock * 0.32 + uDrag * 0.65;
    vec2 leftCenter = rotate2d(orbitAngle) * vec2(-0.19 - uPressed * 0.045, 0.0);
    vec2 rightCenter = -leftCenter;

    vec2 leftPoint = point - leftCenter;
    vec2 rightPoint = point - rightCenter;
    vec3 leftPlume = plumeLayers(leftPoint * vec2(1.18, 0.90), clock + 1.7, 0.58, 0.026);
    vec3 rightPlume = plumeLayers(rightPoint * vec2(1.18, 0.90), clock + 4.6, 0.58, 0.026);
    float whiteFlame = leftPlume.x;
    float blackFlame = rightPlume.x;

    float radius = length(orbitPoint * vec2(1.0, 1.04));
    float disc = 1.0 - smoothstep(0.255, 0.278, radius);
    float divider = orbitPoint.x + sin(orbitPoint.y * PI / 0.25) * 0.105;
    float whiteHalf = disc * (1.0 - smoothstep(-0.018, 0.018, divider));
    float blackHalf = disc * smoothstep(-0.018, 0.018, divider);
    float whiteEye = ellipseMask(orbitPoint, vec2(0.0, 0.125), vec2(0.038), 0.34);
    float blackEye = ellipseMask(orbitPoint, vec2(0.0, -0.125), vec2(0.038), 0.34);
    whiteHalf = max(whiteHalf * (1.0 - whiteEye), blackEye);
    blackHalf = max(blackHalf * (1.0 - blackEye), whiteEye);
    float orbit = 1.0 - smoothstep(0.012, 0.038, abs(radius - (0.39 + uPressed * 0.055)));
    orbit *= 0.48 + 0.52 * smoothstep(0.38, 0.86, 0.5 + 0.5 * sin(atan(orbitPoint.y, orbitPoint.x) * 6.0 - clock));
    return vec3(max(whiteFlame, whiteHalf), max(blackFlame, blackHalf), orbit);
  }

  void main() {
    vec2 point = stagePoint();
    float clock = uTime * uSpeed;
    float duality = step(0.5, uVariant);
    point.y += 0.02;

    vec3 heart = vec3(0.0);
    vec3 dual = vec3(0.0);
    if (duality < 0.5)
      heart = heartSerpent(point, clock);
    else
      dual = dualFlames(point, clock);

    float heartMask = max(heart.x * 0.72, max(heart.y, heart.z * 0.88));
    float dualMask = max(dual.x, max(dual.y, dual.z));
    float mask = mix(heartMask, dualMask, duality);
    vec3 textureField = fireTexture(point, clock * 0.74);
    float filament = smoothstep(0.62, 0.88, textureField.y) * mask;
    float motes = 0.0;
    if (uQuality > 0.25)
      motes = emberField(point * vec2(0.92, 0.76), clock * 0.62, mix(0.028, 0.052, duality));

    vec3 color = uOuter * (mask * 0.42 + dual.y * 0.32);
    color += uInner * (mask * 0.38 + heart.x * 0.28 + dual.x * 0.52 + dual.z * 0.58);
    color += uCore * (filament * 0.66 + heart.y * 0.88 + heart.z * 0.82 + dual.x * 0.46 + motes * 1.08);
    color *= uIntensity * (0.86 + 0.14 * sin(clock * mix(2.7, 1.5, duality)));
    color *= 1.0 - dual.y * duality * 0.58;

    float alpha = mask * (0.38 + textureField.x * 0.18 + textureField.z * 0.17);
    alpha += heart.z * 0.18 + dual.z * 0.20 + filament * 0.20 + motes * 0.65;
    alpha *= mix(0.72, 1.0, duality);
    alpha = saturate(alpha);
    if (alpha < 0.012) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`
